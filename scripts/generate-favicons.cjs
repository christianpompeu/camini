const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lenBuf, typeAndData, crcBuf]);
}

function decodePng(buf) {
  let pos = 8;
  const idats = [];
  let width, height;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(pos + 8);
      height = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idats.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = 1 + width * bpp;
  const pixels = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[y * stride];
    const prevRowOffset = (y - 1) * width * 4;
    const currRowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const srcIdx = y * stride + 1 + x * 4;
      const dstIdx = currRowOffset + x * 4;
      for (let c = 0; c < 4; c++) {
        const rawByte = decompressed[srcIdx + c];
        const a = x > 0 ? pixels[dstIdx - 4 + c] : 0;
        const b = y > 0 ? pixels[prevRowOffset + x * 4 + c] : 0;
        const cVal = (x > 0 && y > 0) ? pixels[prevRowOffset + (x - 1) * 4 + c] : 0;
        let recon = 0;
        if (filter === 0) recon = rawByte;
        else if (filter === 1) recon = (rawByte + a) & 0xff;
        else if (filter === 2) recon = (rawByte + b) & 0xff;
        else if (filter === 3) recon = (rawByte + Math.floor((a + b) / 2)) & 0xff;
        else if (filter === 4) {
          const p = a + b - cVal;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - cVal);
          let pr;
          if (pa <= pb && pa <= pc) pr = a;
          else if (pb <= pc) pr = b;
          else pr = cVal;
          recon = (rawByte + pr) & 0xff;
        }
        pixels[dstIdx + c] = recon;
      }
    }
  }
  return { width, height, pixels };
}

function encodePng(width, height, rgbaBuf) {
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: 13 bytes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth: 8
  ihdr.writeUInt8(6, 9); // color type: 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression method 0
  ihdr.writeUInt8(0, 11); // filter method 0
  ihdr.writeUInt8(0, 12); // interlace method 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + width * 4);
    rawScanlines[rawOffset] = 0; // Filter byte 0
    rgbaBuf.copy(rawScanlines, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

// Bilinear area-averaging resizer
function resizeRgba(srcPixels, srcW, srcH, dstW, dstH) {
  const dstPixels = Buffer.alloc(dstW * dstH * 4);
  const scaleX = srcW / dstW;
  const scaleY = srcH / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    const syStart = dy * scaleY;
    const syEnd = (dy + 1) * scaleY;
    const y0 = Math.floor(syStart);
    const y1 = Math.min(Math.ceil(syEnd), srcH);

    for (let dx = 0; dx < dstW; dx++) {
      const sxStart = dx * scaleX;
      const sxEnd = (dx + 1) * scaleX;
      const x0 = Math.floor(sxStart);
      const x1 = Math.min(Math.ceil(sxEnd), srcW);

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, weightSum = 0;

      for (let y = y0; y < y1; y++) {
        const yWeight = Math.min(y + 1, syEnd) - Math.max(y, syStart);
        if (yWeight <= 0) continue;

        for (let x = x0; x < x1; x++) {
          const xWeight = Math.min(x + 1, sxEnd) - Math.max(x, sxStart);
          if (xWeight <= 0) continue;

          const weight = xWeight * yWeight;
          const idx = (y * srcW + x) * 4;
          const a = srcPixels[idx + 3] / 255;

          // Premultiplied alpha weighting for smooth edges
          rSum += srcPixels[idx] * a * weight;
          gSum += srcPixels[idx + 1] * a * weight;
          bSum += srcPixels[idx + 2] * a * weight;
          aSum += srcPixels[idx + 3] * weight;
          weightSum += weight;
        }
      }

      const dstIdx = (dy * dstW + dx) * 4;
      if (weightSum > 0 && aSum > 0) {
        const avgA = aSum / weightSum;
        const alphaFactor = avgA / 255;
        dstPixels[dstIdx] = Math.round(Math.min(255, Math.max(0, (rSum / weightSum) / alphaFactor)));
        dstPixels[dstIdx + 1] = Math.round(Math.min(255, Math.max(0, (gSum / weightSum) / alphaFactor)));
        dstPixels[dstIdx + 2] = Math.round(Math.min(255, Math.max(0, (bSum / weightSum) / alphaFactor)));
        dstPixels[dstIdx + 3] = Math.round(Math.min(255, Math.max(0, avgA)));
      } else {
        dstPixels[dstIdx] = 0;
        dstPixels[dstIdx + 1] = 0;
        dstPixels[dstIdx + 2] = 0;
        dstPixels[dstIdx + 3] = 0;
      }
    }
  }
  return dstPixels;
}

function createIco(images) {
  // images: array of { width, height, pngBuf }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type (1)
  header.writeUInt16LE(images.length, 4); // count

  let currentOffset = 6 + images.length * 16;
  const entries = [];
  const bufs = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.pngBuf.length, 8); // image size
    entry.writeUInt32LE(currentOffset, 12); // file offset

    entries.push(entry);
    bufs.push(img.pngBuf);
    currentOffset += img.pngBuf.length;
  }

  return Buffer.concat([header, ...entries, ...bufs]);
}

// MAIN
const srcPath = path.resolve('public/logos/current/logo_icon_color.png');
console.log('Reading source icon from:', srcPath);
const srcBuf = fs.readFileSync(srcPath);
const { width: srcW, height: srcH, pixels: srcPixels } = decodePng(srcBuf);
console.log(`Source image decoded: ${srcW}x${srcH}`);

const icoSizes = [16, 32, 48, 64];
const icoImages = [];

for (const size of icoSizes) {
  console.log(`Generating ${size}x${size}...`);
  const resizedPixels = resizeRgba(srcPixels, srcW, srcH, size, size);
  const pngBuf = encodePng(size, size, resizedPixels);
  icoImages.push({ width: size, height: size, pngBuf });
}

// Also generate 192x192 and 512x512 for PWA & icons
const pwa192Pixels = resizeRgba(srcPixels, srcW, srcH, 192, 192);
const pwa192Buf = encodePng(192, 192, pwa192Pixels);
fs.writeFileSync('public/icon-192.png', pwa192Buf);

const pwa512Pixels = resizeRgba(srcPixels, srcW, srcH, 512, 512);
const pwa512Buf = encodePng(512, 512, pwa512Pixels);
fs.writeFileSync('public/icon-512.png', pwa512Buf);

// Generate app/icon.png (Next.js automatically uses this as <link rel="icon">)
// and app/apple-icon.png (Next.js uses as <link rel="apple-touch-icon">)
// Let's use 512x512 or 192x192 for high-DPI clarity
fs.writeFileSync('app/icon.png', pwa512Buf);
fs.writeFileSync('app/apple-icon.png', pwa192Buf);
fs.writeFileSync('public/icon.png', pwa512Buf);
fs.writeFileSync('public/apple-icon.png', pwa192Buf);

// Create multi-size ICO
const icoBuf = createIco(icoImages);
fs.writeFileSync('app/favicon.ico', icoBuf);
fs.writeFileSync('public/favicon.ico', icoBuf);

console.log('Generated app/favicon.ico and public/favicon.ico (' + icoBuf.length + ' bytes)');
console.log('Generated app/icon.png, app/apple-icon.png, and public/icon*.png');
