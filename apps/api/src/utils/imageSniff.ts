// Detects the real image type from file bytes. The browser-supplied MIME type is never trusted.
export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';
export function sniffImage(b: Buffer): ImageMime | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  return null;
}
export function cleanAltText(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new Error('Alt text must be text');
  // eslint-disable-next-line no-control-regex
  const text = value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length > 300) throw new Error('Alt text must be 300 characters or fewer');
  return text || null;
}

export const MAX_IMAGE_SIDE = 6000; // pixels
export const MAX_IMAGE_PIXELS = 25_000_000;
export function imageSize(b: Buffer, mime: ImageMime): { width: number; height: number } | null {
  try {
    if (mime === 'image/png') {
      if (b.subarray(12, 16).toString('latin1') !== 'IHDR') return null;
      return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
    if (mime === 'image/webp') {
      const kind = b.subarray(12, 16).toString('latin1');
      if (kind === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      if (kind === 'VP8L') { const v = b.readUInt32LE(21); return { width: 1 + (v & 0x3fff), height: 1 + ((v >> 14) & 0x3fff) }; }
      if (kind === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      return null;
    }
    let i = 2; // JPEG: walk segments to the first start-of-frame marker
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { i += 2; continue; }
      i += 2 + b.readUInt16BE(i + 2);
    }
    return null;
  } catch { return null; }
}
// Throws a user-safe message when the image is too large, malformed or has trailing data after the image ends.
export function checkImage(b: Buffer, mime: ImageMime): void {
  const size = imageSize(b, mime);
  if (!size || size.width < 1 || size.height < 1) throw new Error('Image dimensions could not be read');
  if (size.width > MAX_IMAGE_SIDE || size.height > MAX_IMAGE_SIDE || size.width * size.height > MAX_IMAGE_PIXELS) throw new Error(`Image is too large. Use at most ${MAX_IMAGE_SIDE} pixels on each side and 25 megapixels`);
  if (mime === 'image/png' && !b.subarray(b.length - 12).equals(Buffer.from('0000000049454e44ae426082', 'hex'))) throw new Error('PNG file is incomplete or has extra data');
  if (mime === 'image/jpeg' && !(b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9)) throw new Error('JPEG file is incomplete or has extra data');
  if (mime === 'image/webp' && b.readUInt32LE(4) + 8 !== b.length) throw new Error('WebP file is incomplete or has extra data');
}
