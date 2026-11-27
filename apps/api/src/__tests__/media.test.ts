import {describe,it,expect} from 'vitest';
import {sniffImage,cleanAltText} from '../utils/imageSniff.js';
const pad=(a:number[])=>Buffer.concat([Buffer.from(a),Buffer.alloc(16)]);
describe('image sniffing',()=>{
 it('accepts real JPEG, PNG and WebP bytes',()=>{
  expect(sniffImage(pad([0xff,0xd8,0xff,0xe0]))).toBe('image/jpeg');
  expect(sniffImage(pad([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))).toBe('image/png');
  expect(sniffImage(Buffer.concat([Buffer.from('RIFF'),Buffer.alloc(4),Buffer.from('WEBPVP8 '),Buffer.alloc(8)]))).toBe('image/webp');
 });
 it('rejects SVG, HTML, scripts and short files even if labelled as images',()=>{
  for(const text of ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>','<!doctype html><script>alert(1)</script>','GIF89a......padding','x'])expect(sniffImage(Buffer.from(text.padEnd(32,' ')))).toBeNull();
 });
 it('cleans and bounds alt text',()=>{
  expect(cleanAltText('  Team <b>photo</b>\n at work ')).toBe('Team b photo /b at work');
  expect(cleanAltText('')).toBeNull();expect(cleanAltText(undefined)).toBeNull();
  expect(()=>cleanAltText('a'.repeat(301))).toThrow();expect(()=>cleanAltText(5)).toThrow();
 });
});
import {checkImage} from '../utils/imageSniff.js';
import zlib from 'node:zlib';
function crc(buf:Buffer){let c=~0;for(const x of buf){c^=x;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1}return(~c)>>>0}
function chunk(type:string,data:Buffer){const t=Buffer.from(type);const l=Buffer.alloc(4);l.writeUInt32BE(data.length);const c=Buffer.alloc(4);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([l,t,data,c])}
function png(w:number,h:number){const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=0;const row=Buffer.concat([Buffer.from([0]),Buffer.alloc(Math.min(w,64))]);return Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(row)),chunk('IEND',Buffer.alloc(0))])}
describe('image limits',()=>{
 it('accepts a normal PNG',()=>{expect(()=>checkImage(png(400,300),'image/png')).not.toThrow()});
 it('rejects oversized dimensions, truncated and padded files',()=>{
  expect(()=>checkImage(png(20000,20000),'image/png')).toThrow(/too large/);
  const ok=png(400,300);
  expect(()=>checkImage(ok.subarray(0,ok.length-5),'image/png')).toThrow();
  expect(()=>checkImage(Buffer.concat([ok,Buffer.from('<script>1</script>')]),'image/png')).toThrow();
 });
 it('reads JPEG and WebP dimensions',()=>{
  const jpg=Buffer.from('ffd8ffc0000b0800c8012c0100000000ffd9','hex');expect(()=>checkImage(jpg,'image/jpeg')).not.toThrow();
  const big=Buffer.from('ffd8ffc0000b08271027100100000000ffd9','hex');expect(()=>checkImage(big,'image/jpeg')).toThrow(/too large/);
 });
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assertWithinQuota, dirBytes, quotaBytesFromEnv } from '../utils/uploadQuota.js';

describe('upload quota', () => {
  it('counts existing files and blocks an upload that passes the limit', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quota-'));
    fs.writeFileSync(path.join(dir, 'a.png'), Buffer.alloc(600));
    fs.writeFileSync(path.join(dir, 'b.png'), Buffer.alloc(300));
    expect(dirBytes(dir)).toBe(900);
    expect(() => assertWithinQuota(dir, 100, 1000)).not.toThrow();
    expect(() => assertWithinQuota(dir, 101, 1000)).toThrow(/storage limit/i);
    fs.rmSync(dir, { recursive: true, force: true });
  });
  it('treats a missing directory as empty and defaults to 500 MB', () => {
    expect(dirBytes('/nonexistent-dir-xyz')).toBe(0);
    expect(quotaBytesFromEnv(undefined)).toBe(500 * 1024 * 1024);
    expect(quotaBytesFromEnv('2')).toBe(2 * 1024 * 1024);
    expect(quotaBytesFromEnv('-5')).toBe(500 * 1024 * 1024);
  });
});

import { withUploadLock } from '../utils/uploadQuota.js';
describe('upload lock', () => {
  it('serializes concurrent uploads so the quota check sees earlier writes', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lock-'));
    let accepted = 0;
    const attempt = (i: number) => withUploadLock(async () => {
      assertWithinQuota(dir, 400, 1000);
      await new Promise(r => setTimeout(r, 5));
      fs.writeFileSync(path.join(dir, `f${i}.png`), Buffer.alloc(400));
      accepted++;
    }).catch(() => undefined);
    await Promise.all(Array.from({ length: 12 }, (_, i) => attempt(i)));
    expect(accepted).toBe(2);
    expect(dirBytes(dir)).toBe(800);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
