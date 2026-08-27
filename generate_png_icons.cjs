const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create valid uncompressed/deflated RGBA PNG from pixel buffer
function createPng(width, height, getPixel) {
  // PNG Signature
  const signature = Buffer.from([138, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC-32 table
let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}

function crc32(buf) {
  const table = getCrcTable();
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

// Generate elephant pixel art icon
function renderElephantIcon(x, y, w, h, maskable = false) {
  const nx = x / w; // 0..1
  const ny = y / h; // 0..1

  // Background color #121318 or rounded squircle
  const bgR = 18, bgG = 19, bgB = 24; // #121318
  const cardR = 27, cardG = 29, cardB = 36; // #1b1d24
  const goldR = 255, goldG = 209, goldB = 102; // #ffd166
  const goldDkR = 224, goldDkG = 159, goldDkB = 62; // #e09f3e
  const whiteR = 255, whiteG = 255, whiteB = 255;
  const accentR = 76, accentG = 201, accentB = 240; // #4cc9f0

  // Center distance
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const dist = Math.sqrt(cx * cx + cy * cy);

  if (!maskable && dist > 0.49) {
    return [0, 0, 0, 0]; // Transparent outer boundary for normal icons
  }

  // Outer border ring
  if (!maskable && dist >= 0.46 && dist <= 0.49) {
    return [goldR, goldG, goldB, 200];
  }

  // Elephant drawing inside normalized coordinates [0.15 .. 0.85]
  const ex = (nx - 0.5) * 2; // -1 .. 1
  const ey = (ny - 0.45) * 2; // -1 .. 1

  // Elephant body (oval)
  const inBody = (Math.pow(ex + 0.1, 2) / 0.35 + Math.pow(ey - 0.1, 2) / 0.22) <= 1.0;
  
  // Elephant head
  const inHead = (Math.pow(ex - 0.28, 2) / 0.12 + Math.pow(ey + 0.1, 2) / 0.12) <= 1.0;

  // Elephant ear
  const inEar = (Math.pow(ex + 0.05, 2) / 0.08 + Math.pow(ey + 0.05, 2) / 0.15) <= 1.0;

  // Elephant legs (4 legs)
  const inLeg1 = (ex >= -0.45 && ex <= -0.32 && ey >= 0.1 && ey <= 0.65);
  const inLeg2 = (ex >= -0.22 && ex <= -0.09 && ey >= 0.1 && ey <= 0.65);
  const inLeg3 = (ex >= 0.05 && ex <= 0.18 && ey >= 0.1 && ey <= 0.65);
  const inLeg4 = (ex >= 0.26 && ex <= 0.39 && ey >= 0.1 && ey <= 0.65);

  // Elephant trunk (curved)
  const trunkDist = Math.sqrt(Math.pow(ex - 0.5, 2) + Math.pow(ey - 0.1, 2));
  const inTrunk = (ex >= 0.4 && ex <= 0.65 && ey >= -0.1 && ey <= 0.4 && (trunkDist >= 0.18 && trunkDist <= 0.28)) ||
                  (ex >= 0.58 && ex <= 0.72 && ey >= 0.25 && ey <= 0.42);

  // Tusk (white)
  const inTusk = (ex >= 0.42 && ex <= 0.58 && ey >= 0.05 && ey <= 0.18 && (ex - 0.42) > (ey - 0.05));

  // Eye (dark center)
  const eyeDist = Math.sqrt(Math.pow(ex - 0.32, 2) + Math.pow(ey + 0.16, 2));
  const inEye = eyeDist <= 0.035;
  const inPupil = eyeDist <= 0.015;

  if (inPupil) return [255, 255, 255, 255];
  if (inEye) return [18, 19, 24, 255];
  if (inTusk) return [whiteR, whiteG, whiteB, 255];
  if (inEar) return [goldDkR, goldDkG, goldDkB, 255];
  if (inHead || inBody || inLeg1 || inLeg2 || inLeg3 || inLeg4 || inTrunk) {
    return [goldR, goldG, goldB, 255];
  }

  // Base background
  const bgGrad = Math.min(255, cardR + Math.floor(ny * 10));
  return [bgGrad, cardG, cardB, 255];
}

// Generate files
const publicIconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(publicIconsDir)) fs.mkdirSync(publicIconsDir, { recursive: true });

console.log('Generating PWA PNG icons...');

// 192x192
const png192 = createPng(192, 192, (x, y, w, h) => renderElephantIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicIconsDir, 'icon-192.png'), png192);

// 512x512
const png512 = createPng(512, 512, (x, y, w, h) => renderElephantIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicIconsDir, 'icon-512.png'), png512);

// Maskable 512x512
const pngMaskable = createPng(512, 512, (x, y, w, h) => renderElephantIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicIconsDir, 'icon-maskable.png'), pngMaskable);

// Apple touch icon 180x180
const appleTouch = createPng(180, 180, (x, y, w, h) => renderElephantIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicIconsDir, 'apple-touch-icon.png'), appleTouch);

console.log('Generated all PWA PNG icons successfully!');
