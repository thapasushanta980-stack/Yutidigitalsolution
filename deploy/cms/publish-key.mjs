// Writes the CMS publish SSH private key from a runtime-only environment variable to a 0600 file.
// The key is never logged, never passed on to child processes, and never written anywhere else.
// With the variable unset nothing happens, so current behavior is unchanged.
import fs from 'node:fs';
import path from 'node:path';

const VAR = 'CMS_PUBLISH_SSH_PRIVATE_KEY';
const HEADER = /^-----BEGIN (OPENSSH|RSA|EC) PRIVATE KEY-----\n/;
const FOOTER = /\n-----END (OPENSSH|RSA|EC) PRIVATE KEY-----\n$/;

export function normalizeKey(raw) {
  let k = String(raw).trim();
  if (!k.includes('\n') && k.includes('\\n')) k = k.replace(/\\n/g, '\n');
  k = k.replace(/\r\n?/g, '\n') + '\n';
  return HEADER.test(k) && FOOTER.test(k) ? k : null;
}

// Returns {status:'unset'|'written'|'invalid'|'error'}. Never returns or throws key material.
export function installPublishKey(env = process.env, log = console.error) {
  const raw = env[VAR];
  delete env[VAR];
  if (raw === undefined || raw === '') return { status: 'unset' };
  const key = normalizeKey(raw);
  if (!key) {
    env.CMS_PUBLISH_ENABLED = 'false';
    log('CMS publish key is not a valid private key. Publishing stays disabled.');
    return { status: 'invalid' };
  }
  const file = env.CMS_PUBLISH_SSH_KEY || '/run/cms-publish/key';
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    fs.rmSync(file, { force: true });
    fs.writeFileSync(file, key, { mode: 0o600, flag: 'wx' });
    fs.chmodSync(file, 0o600);
    return { status: 'written' };
  } catch {
    env.CMS_PUBLISH_ENABLED = 'false';
    log('CMS publish key could not be installed. Publishing stays disabled.');
    return { status: 'error' };
  }
}
