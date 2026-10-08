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
  logoUrl,
}) => {
  const safeWorkspaceName = escapeHtml(workspaceName);
  const safeDescription = escapeHtml(description);
  const safeWorkspaceUrl = escapeHtml(workspaceUrl);
  const safeLogoUrl = escapeHtml(logoUrl);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(amount));

  return {
    subject: `New expense in ${subjectPart(workspaceName)}: ${subjectPart(description)}`,
    text: `A new expense was added to ${workspaceName}.\n\n${description}\n${formattedAmount}\n\nOpen workspace: ${workspaceUrl}\n\nCo-Split`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>New expense in ${safeWorkspaceName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f6f4;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">A new expense was added to ${safeWorkspaceName}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f6f4;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8e5;border-radius:16px;">
            <tr>
              <td style="padding:28px 32px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <img src="${safeLogoUrl}" width="36" height="36" alt="Co-Split" style="display:block;width:36px;height:36px;border:0;border-radius:10px;" />
                    </td>
                    <td style="vertical-align:middle;font-size:18px;font-weight:700;letter-spacing:-0.3px;color:#2e5c45;">Co-Split</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
                <p style="margin:0 0 8px;font-size:14px;line-height:20px;color:#64748b;">A new expense was added to</p>
                <h1 style="margin:0 0 24px;font-size:25px;line-height:32px;letter-spacing:-0.5px;color:#1e293b;">${safeWorkspaceName}</h1>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f8f6;border:1px solid #e5ece7;border-radius:12px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <p style="margin:0 0 8px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:#64748b;">Expense</p>
                      <p style="margin:0 0 12px;font-size:17px;line-height:24px;font-weight:600;color:#1e293b;">${safeDescription}</p>
                      <p style="margin:0;font-size:27px;line-height:34px;font-weight:700;color:#2e5c45;">${formattedAmount}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                  <tr>
                    <td align="center" style="background-color:#2e5c45;border-radius:9px;">
                      <a href="${safeWorkspaceUrl}" style="display:inline-block;padding:13px 21px;font-size:15px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;">Open workspace</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:28px 0 0;font-size:13px;line-height:20px;color:#64748b;">Shared expenses, made simple.</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:12px;line-height:18px;color:#94a3b8;">You received this email because you’re a member of ${safeWorkspaceName} on Co-Split.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
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
    logoUrl: new URL('/icons/co-split-icon.png', config.appUrl).toString(),
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
