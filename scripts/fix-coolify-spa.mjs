const baseUrlValue = process.env.COOLIFY_BASE_URL?.trim();
const appUuid = process.env.COOLIFY_APP_UUID?.trim();
const writeToken = process.env.COOLIFY_WRITE_TOKEN?.trim();
const deployToken = process.env.COOLIFY_DEPLOY_TOKEN?.trim();

if (!baseUrlValue || !appUuid || !writeToken || !deployToken) {
  console.error(
    'Set COOLIFY_BASE_URL, COOLIFY_APP_UUID, COOLIFY_WRITE_TOKEN, and COOLIFY_DEPLOY_TOKEN in the ignored root .env file.',
  );
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(baseUrlValue);
} catch {
  console.error('COOLIFY_BASE_URL must be the HTTPS origin of your Coolify dashboard.');
  process.exit(1);
}

if (baseUrl.protocol !== 'https:' || baseUrl.pathname !== '/' || baseUrl.search || baseUrl.hash) {
  console.error('COOLIFY_BASE_URL must be an HTTPS origin with no path, query, or fragment.');
  process.exit(1);
}

const apiBase = `${baseUrl.origin}/api/v1`;

async function request(method, path, token, body) {
  let response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    throw new Error(`Could not reach Coolify API: ${error.message}`);
  }

  const responseText = await response.text();
  let payload;
  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = { message: responseText.slice(0, 500) };
  }

  if (!response.ok) {
    const message = typeof payload.message === 'string' ? payload.message : 'Request failed.';
    throw new Error(`Coolify API ${method} ${path} returned HTTP ${response.status}: ${message}`);
  }

  return payload;
}

try {
  console.log(`Enabling SPA routing for Coolify app ${appUuid}...`);
  const updated = await request('PATCH', `/applications/${encodeURIComponent(appUuid)}`, writeToken, {
    is_static: true,
    is_spa: true,
  });

  if (updated.uuid && updated.uuid !== appUuid) {
    throw new Error(`Coolify updated unexpected app ${updated.uuid}; expected ${appUuid}.`);
  }

  console.log('SPA routing enabled. Queuing a fresh Coolify deployment...');
  const deployment = await request(
    'POST',
    `/deploy?uuid=${encodeURIComponent(appUuid)}`,
    deployToken,
  );

  const queued = deployment.deployments?.[0] ?? deployment;
  console.log(`Deployment queued: ${queued.deployment_uuid ?? queued.message ?? 'request accepted'}`);
  console.log('Wait for Coolify to report deployment success, then verify the public routes.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
