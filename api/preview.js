import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { pathname } = new URL(req.url, `https://${req.headers.host || 'cosplit.site'}`);

  const workspaceMatch = pathname.match(/^\/workspace\/([a-fA-F0-9-]{36})/);
  const joinMatch = pathname.match(/^\/join\/([a-fA-F0-9-]{36})/);

  let title = 'Co-Split - Fair Expense Splitting Made Simple';
  let description = 'Frictionless shared expense ledger sheets. Sign in with one click to organize bills with your workspace team, roommates, or study group in real-time.';

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      if (workspaceMatch) {
        const workspaceId = workspaceMatch[1];
        const response = await fetch(`${supabaseUrl}/rest/v1/workspaces?id=eq.${workspaceId}&select=name`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const workspaceName = data[0].name;
            title = `${workspaceName} - Co-Split Ledger`;
            description = `Shared expense ledger for ${workspaceName}. Add expenses, track balances, and settle up bills instantly.`;
          }
        }
      } else if (joinMatch) {
        const inviteCode = joinMatch[1];
        const response = await fetch(`${supabaseUrl}/rest/v1/workspaces?invite_code=eq.${inviteCode}&select=name`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const workspaceName = data[0].name;
            title = `Join ${workspaceName} - Co-Split`;
            description = `You have been invited to join the shared expense ledger sheet "${workspaceName}" on Co-Split. Sign in to collaborate.`;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching workspace preview details:', err);
    }
  }

  try {
    const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    html = html.replace(/<meta property="og:title"[\s\S]*?content="[^"]*"[\s\S]*?\/?>/i, `<meta property="og:title" content="${title}" />`);

    // Description
    html = html.replace(/<meta name="description"[\s\S]*?content="[^"]*"[\s\S]*?\/?>/i, `<meta name="description" content="${description}" />`);
    html = html.replace(/<meta property="og:description"[\s\S]*?content="[^"]*"[\s\S]*?\/?>/i, `<meta property="og:description" content="${description}" />`);

    // URL
    const canonicalUrl = `https://${req.headers.host || 'cosplit.site'}${pathname}`;
    html = html.replace(/<meta property="og:url"[\s\S]*?content="[^"]*"[\s\S]*?\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    console.error('Error reading index.html template:', err);
    return res.status(500).send('Internal Server Error');
  }
}
