import fs from 'node:fs';
import path from 'node:path';

/** Total bytes of regular files directly inside dir (uploads are flat). Missing dir counts as 0. */
export function dirBytes(dir: string): number {
  let total = 0;
  let names: string[] = [];
  try { names = fs.readdirSync(dir); } catch { return 0; }
  for (const name of names) {
    try {
      const st = fs.lstatSync(path.join(dir, name));
      if (st.isFile()) total += st.size;
    } catch { /* file vanished, ignore */ }
  }
  return total;
}

/** Throws when adding incoming bytes would pass the aggregate upload quota. */
export function assertWithinQuota(dir: string, incoming: number, quotaBytes: number): void {
  if (dirBytes(dir) + incoming > quotaBytes) {
    throw new Error('Upload storage limit reached. Remove unused images or ask the site operator to raise the limit.');
  }
}

export function quotaBytesFromEnv(raw: string | undefined): number {
  const mb = Number(raw);
  return (Number.isFinite(mb) && mb > 0 ? mb : 500) * 1024 * 1024;
}

let tail: Promise<unknown> = Promise.resolve();
/** Runs fn after every earlier call finished. Single API process only (the CMS runs one). */
export function withUploadLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = tail.then(fn, fn);
  tail = run.catch(() => undefined);
  return run;
}
