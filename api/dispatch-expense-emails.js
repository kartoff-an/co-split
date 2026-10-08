const MAX_ATTEMPTS = 5;
const BATCH_SIZE = 25;
const MAX_CONCURRENCY = 5;
const RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000, 7_200_000];

export const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

export const getRetryDelayMs = (attemptCount) =>
  RETRY_DELAYS_MS[Math.max(0, Number(attemptCount) - 1)] ??
  RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];

const subjectPart = (value) => String(value).replace(/[\r\n]+/g, ' ').slice(0, 120);

export const buildExpenseEmail = ({

  workspaceName,
  description,
  amount,
  currency,
  workspaceUrl,
}) => {
  const safeWorkspaceName = escapeHtml(workspaceName);
  const safeDescription = escapeHtml(description);
  const safeWorkspaceUrl = escapeHtml(workspaceUrl);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));

  return {
    subject: `New expense in ${subjectPart(workspaceName)}: ${subjectPart(description)}`,
    text: `${workspaceName}: ${description} (${formattedAmount}) was added. View it at ${workspaceUrl}`,
    html: `<p>A new expense was added to <strong>${safeWorkspaceName}</strong>.</p><p><strong>${safeDescription}</strong><br />${formattedAmount}</p><p><a href="${safeWorkspaceUrl}">Open workspace</a></p>`,
  };
};

const getRequiredEnvironment = () => {
  const values = {
    cronSecret: process.env.CRON_SECRET,
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail: process.env.RESEND_FROM_EMAIL,
    appUrl: process.env.APP_URL,
  };

  if (Object.values(values).some((value) => !value)) {
    throw new Error('Missing required server environment configuration.');
  }

  return values;
};

const supabaseRequest = async (supabaseUrl, serviceRoleKey, path, options = {}) => {
  const response = await fetch(new URL(`/rest/v1/${path}`, supabaseUrl), {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}).`);
  }

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
};

const selectOne = async (supabaseUrl, serviceRoleKey, table, columns, filters) => {
  const query = new URLSearchParams({ select: columns, limit: '1' });
  for (const [column, value] of Object.entries(filters)) {
    query.set(column, `eq.${value}`);
  }
  const rows = await supabaseRequest(
    supabaseUrl,
    serviceRoleKey,
    `${table}?${query.toString()}`
  );
  return rows?.[0] || null;
};

const updateJob = async (config, jobId, updates) => {
  const query = new URLSearchParams({
    id: `eq.${jobId}`,
    status: 'eq.processing',
  });
  await supabaseRequest(
    config.supabaseUrl,
    config.serviceRoleKey,
    `expense_email_outbox?${query.toString()}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(updates),
    }
  );
};

const sendExpenseEmail = async (config, job) => {
  const [expense, recipient] = await Promise.all([
    selectOne(
      config.supabaseUrl,
      config.serviceRoleKey,
      'expenses',
      'id,description,amount,workspace_id',
      { id: job.expense_id }
    ),
    selectOne(
      config.supabaseUrl,
      config.serviceRoleKey,
      'user_profiles',
      'id,email',
      { id: job.recipient_user_id }
    ),
  ]);

  if (!expense || !recipient?.email) {
    throw new Error('Expense or recipient email is unavailable.');
  }

  const membership = await selectOne(
    config.supabaseUrl,
    config.serviceRoleKey,
    'members',
    'id',
    { workspace_id: expense.workspace_id, user_id: job.recipient_user_id }
  );
  if (!membership) return false;

  const workspace = await selectOne(
    config.supabaseUrl,
    config.serviceRoleKey,
    'workspaces',
    'id,name,currency',
    { id: expense.workspace_id }
  );
  if (!workspace) throw new Error('Workspace is unavailable.');

  const workspaceUrl = new URL(
    `/workspace/${encodeURIComponent(workspace.id)}`,
    config.appUrl
  ).toString();
  const email = buildExpenseEmail({
    workspaceName: workspace.name,
    description: expense.description,
    amount: expense.amount,
    currency: workspace.currency,
    workspaceUrl,
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `expense-outbox-${job.id}`,
    },
    body: JSON.stringify({
      from: config.resendFromEmail,
      to: [recipient.email],
      ...email,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed (${response.status}).`);
  }

  return true;
};

const processJob = async (config, job) => {
  try {
    const wasSent = await sendExpenseEmail(config, job);
    await updateJob(config, job.id, {
      status: wasSent ? 'sent' : 'skipped',
      sent_at: wasSent ? new Date().toISOString() : null,
      locked_until: null,
      last_error: null,
    });
    return wasSent ? 'sent' : 'skipped';
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown delivery error.';
    const isFinalAttempt = Number(job.attempts) >= MAX_ATTEMPTS;
    const updates = {
      status: isFinalAttempt ? 'failed' : 'pending',
      locked_until: null,
      last_error: message.slice(0, 1000),
    };

    if (!isFinalAttempt) {
      updates.available_at = new Date(
        Date.now() + getRetryDelayMs(job.attempts)
      ).toISOString();
    }

    await updateJob(config, job.id, updates);
    return isFinalAttempt ? 'failed' : 'retried';
  }
};

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  let config;
  try {
    config = getRequiredEnvironment();
  } catch {
    return response.status(500).json({ error: 'Notification worker is not configured.' });
  }

  if (request.headers.authorization !== `Bearer ${config.cronSecret}`) {
    return response.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const jobs = await supabaseRequest(
      config.supabaseUrl,
      config.serviceRoleKey,
      'rpc/claim_expense_email_jobs',
      {
        method: 'POST',
        body: JSON.stringify({ batch_size: BATCH_SIZE }),
      }
    );

    const totals = { sent: 0, retried: 0, failed: 0, skipped: 0 };
    const claimedJobs = jobs || [];

    for (let offset = 0; offset < claimedJobs.length; offset += MAX_CONCURRENCY) {
      const batch = claimedJobs.slice(offset, offset + MAX_CONCURRENCY);
      const outcomes = await Promise.all(
        batch.map((job) => processJob(config, job))
      );
      for (const outcome of outcomes) totals[outcome] += 1;
    }

    return response.status(200).json({
      claimed: claimedJobs.length,
      ...totals,
    });
  } catch (error) {
    console.error('Expense email worker failed:', error);
    return res.status(500).json({ error: 'Expense email worker failed.' });
  }
}
