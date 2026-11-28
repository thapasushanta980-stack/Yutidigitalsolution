// Run: node --test deploy/cms/publish-key.test.mjs   (uses only throwaway dummy keys)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {installPublishKey, normalizeKey} from './publish-key.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pubkey-'));
const dummy = path.join(tmp, 'dummy');
execFileSync('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-C', 'dummy-test', '-f', dummy], {stdio: ['ignore', 'pipe', 'pipe']});
const KEY = fs.readFileSync(dummy, 'utf8');
const body = KEY.split('\n').filter(l => l && !l.startsWith('-----'))[1] || KEY.split('\n')[1];
const run = (env, log = () => {}) => installPublishKey(env, log);
const target = n => path.join(tmp, n, 'run', 'key');

test('unset: no file, env untouched', () => {
  const env = {CMS_PUBLISH_SSH_KEY: target('a'), CMS_PUBLISH_ENABLED: 'true'};
  assert.equal(run(env).status, 'unset');
  assert.equal(fs.existsSync(target('a')), false);
  assert.equal(env.CMS_PUBLISH_ENABLED, 'true');
  assert.equal(run({CMS_PUBLISH_SSH_PRIVATE_KEY: '', CMS_PUBLISH_SSH_KEY: target('a')}).status, 'unset');
});

test('multiline key: written 0600, identical, parses with ssh-keygen, var removed', () => {
  const env = {CMS_PUBLISH_SSH_PRIVATE_KEY: KEY.trimEnd(), CMS_PUBLISH_SSH_KEY: target('b'), CMS_PUBLISH_ENABLED: 'true'};
  assert.equal(run(env).status, 'written');
  assert.equal(env.CMS_PUBLISH_SSH_PRIVATE_KEY, undefined);
  assert.equal(env.CMS_PUBLISH_ENABLED, 'true');
  assert.equal(fs.statSync(target('b')).mode & 0o777, 0o600);
  assert.equal(fs.statSync(path.dirname(target('b'))).mode & 0o777, 0o700);
  assert.equal(fs.readFileSync(target('b'), 'utf8'), KEY);
  const pub = execFileSync('ssh-keygen', ['-y', '-f', target('b')], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  assert.equal(pub.split(' ')[1], fs.readFileSync(dummy + '.pub', 'utf8').split(' ')[1]);
});

test('CRLF and literal \\n variants are normalized to the same key', () => {
  assert.equal(normalizeKey(KEY.replace(/\n/g, '\r\n')), KEY);
  assert.equal(normalizeKey(KEY.trimEnd().replace(/\n/g, '\\n')), KEY);
});

test('invalid key: publishing disabled, nothing written, message has no key text', () => {
  const logs = [];
  const bad = 'not-a-key ' + body;
  const env = {CMS_PUBLISH_SSH_PRIVATE_KEY: bad, CMS_PUBLISH_SSH_KEY: target('c'), CMS_PUBLISH_ENABLED: 'true'};
  assert.equal(run(env, m => logs.push(m)).status, 'invalid');
  assert.equal(env.CMS_PUBLISH_ENABLED, 'false');
  assert.equal(env.CMS_PUBLISH_SSH_PRIVATE_KEY, undefined);
  assert.equal(fs.existsSync(target('c')), false);
  assert.ok(!logs.join('\n').includes(body));
});

test('unwritable path: publishing disabled, no key text logged', () => {
  const logs = [];
  const env = {CMS_PUBLISH_SSH_PRIVATE_KEY: KEY, CMS_PUBLISH_SSH_KEY: path.join(dummy, 'sub', 'key'), CMS_PUBLISH_ENABLED: 'true'};
  assert.equal(run(env, m => logs.push(m)).status, 'error');
  assert.equal(env.CMS_PUBLISH_ENABLED, 'false');
  assert.ok(!logs.join('\n').includes(body));
});

test('child process: var absent in children, stdout/stderr never contain key, file replaced on restart', () => {
  const script = `import {installPublishKey} from ${JSON.stringify(path.resolve('deploy/cms/publish-key.mjs'))};
installPublishKey();console.log(JSON.stringify({has:'CMS_PUBLISH_SSH_PRIVATE_KEY' in process.env}));
import {execFileSync} from 'node:child_process';
console.log(execFileSync('sh',['-c','env'],{encoding:'utf8'}).includes('PRIVATE KEY'));`;
  const sp = path.join(tmp, 'child.mjs'); fs.writeFileSync(sp, script);
  const env = {...process.env, CMS_PUBLISH_SSH_PRIVATE_KEY: KEY, CMS_PUBLISH_SSH_KEY: target('d')};
  for (let i = 0; i < 2; i++) {
    const r = spawnSync(process.execPath, [sp], {env, encoding: 'utf8'});
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(r.stdout.trim().split('\n'), ['{"has":false}', 'false']);
    assert.ok(!(r.stdout + r.stderr).includes(body));
    assert.equal(fs.statSync(target('d')).mode & 0o777, 0o600);
  }
});

test.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
