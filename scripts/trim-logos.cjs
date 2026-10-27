const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);

  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + width * 4);
    rawScanlines[rawOffset] = 0;
    rgbaBuf.copy(rawScanlines, rawOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
}

function cropToContent(fileIn, fileOut, padding = 10) {
  const buf = fs.readFileSync(fileIn);
  const { width, height, pixels } = decodePng(buf);

  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = pixels[(y * width + x) * 4 + 3];
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropX0 = Math.max(0, minX - padding);
  const cropX1 = Math.min(width, maxX + padding + 1);
  const cropY0 = Math.max(0, minY - padding);
  const cropY1 = Math.min(height, maxY + padding + 1);
  const cropW = cropX1 - cropX0;
  const cropH = cropY1 - cropY0;

  const croppedPixels = Buffer.alloc(cropW * cropH * 4);
  for (let cy = 0; cy < cropH; cy++) {
    const srcY = cropY0 + cy;
    const srcRowOffset = (srcY * width + cropX0) * 4;
    pixels.copy(croppedPixels, cy * cropW * 4, srcRowOffset, srcRowOffset + cropW * 4);
  }

  const outBuf = encodePng(cropW, cropH, croppedPixels);
  fs.writeFileSync(fileOut, outBuf);
  console.log(`Cropped ${fileIn} (${width}x${height}) -> ${fileOut} (${cropW}x${cropH})`);
}

cropToContent('public/logos/current/logo_black.png', 'public/logos/current/logo_black_trimmed.png');
cropToContent('public/logos/current/logo.png', 'public/logos/current/logo_trimmed.png');
