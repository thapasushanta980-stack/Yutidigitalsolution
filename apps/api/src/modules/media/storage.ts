import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';

// Storage abstraction — swap this implementation for S3 / R2 / Cloudinary
// later without touching business logic.
export interface StoredFile {
  fileName: string;
  url: string;
}

export interface StorageDriver {
  save(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFile>;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

class LocalDiskStorage implements StorageDriver {
  async save(buffer: Buffer, _originalName: string, mimeType: string): Promise<StoredFile> {
    const dir = path.resolve(env.UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    // Never trust the original filename — generate a random, safe one.
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}${EXT_BY_MIME[mimeType] ?? ''}`;
    await writeFile(path.join(dir, fileName), buffer);
    return { fileName, url: `/uploads/${fileName}` };
  }
}

export const storage: StorageDriver = new LocalDiskStorage();
