const fs = require('fs');
const path = require('path');

// 640x320 GIF generator with 50px top/bottom padding
const WIDTH = 640;
const HEIGHT = 320;
const PADDING_Y = 50; // Top and Bottom padding

// Colors
const PALETTE = [
  [15, 23, 42],    // 0: Dark slate bg (#0f172a)
  [30, 41, 59],    // 1: Slate 800 (#1e293b)
  [51, 65, 85],    // 2: Slate 700 (#334155)
  [71, 85, 105],   // 3: Slate 600 (#475569)
  [100, 116, 139], // 4: Slate 500 (#64748b)
  [148, 163, 184], // 5: Slate 400 (#94a3b8)
  [226, 232, 240], // 6: Slate 200 (#e2e8f0)
  [248, 250, 252], // 7: Pure text white (#f8fafc)
  [56, 189, 248],  // 8: Sky blue (#38bdf8)
  [14, 165, 233],  // 9: Deep sky blue (#0ea5e9)
  [251, 146, 60],  // 10: Orange (#fb923c)
  [249, 115, 22],  // 11: Deep orange (#f97316)
  [244, 63, 94],   // 12: Rose / Red (#f43f5e)
  [168, 85, 247],  // 13: Purple (#a855f7)
  [192, 132, 252], // 14: Light Purple (#c084fc)
  [2, 132, 199],   // 15: Blue accent
  [9, 13, 22],     // 16: Deep background (#090d16)
  [38, 55, 80],    // 17: Muted blue-grey
  [250, 204, 21],  // 18: Amber yellow (#facc15)
];

// Fill rest of palette to 256 colors
while (PALETTE.length < 256) {
  PALETTE.push([0, 0, 0]);
}

// 5x7 Basic Bitmap Font
const FONT = {
  'A': [0x70,0x88,0x88,0xF8,0x88,0x88,0x88],
  'B': [0xF0,0x88,0x88,0xF0,0x88,0x88,0xF0],
  'C': [0x70,0x88,0x80,0x80,0x80,0x88,0x70],
  'D': [0xE0,0x90,0x88,0x88,0x88,0x90,0xE0],
  'E': [0xF8,0x80,0x80,0xF0,0x80,0x80,0xF8],
  'F': [0xF8,0x80,0x80,0xF0,0x80,0x80,0x80],
  'G': [0x70,0x88,0x80,0xB8,0x88,0x88,0x78],
  'H': [0x88,0x88,0x88,0xF8,0x88,0x88,0x88],
  'I': [0x70,0x20,0x20,0x20,0x20,0x20,0x70],
  'J': [0x38,0x10,0x10,0x10,0x10,0x90,0x60],
  'K': [0x88,0x90,0xA0,0xC0,0xA0,0x90,0x88],
  'L': [0x80,0x80,0x80,0x80,0x80,0x80,0xF8],
  'M': [0x88,0xD8,0xA8,0x88,0x88,0x88,0x88],
  'N': [0x88,0xC8,0xA8,0x98,0x88,0x88,0x88],
  'O': [0x70,0x88,0x88,0x88,0x88,0x88,0x70],
  'P': [0xF0,0x88,0x88,0xF0,0x80,0x80,0x80],
  'Q': [0x70,0x88,0x88,0x88,0xA8,0x90,0x68],
  'R': [0xF0,0x88,0x88,0xF0,0xA0,0x90,0x88],
  'S': [0x78,0x80,0x80,0x70,0x08,0x08,0xF0],
  'T': [0xF8,0x20,0x20,0x20,0x20,0x20,0x20],
  'U': [0x88,0x88,0x88,0x88,0x88,0x88,0x70],
  'V': [0x88,0x88,0x88,0x88,0x88,0x50,0x20],
  'W': [0x88,0x88,0x88,0xA8,0xA8,0xD8,0x88],
  'X': [0x88,0x88,0x50,0x20,0x50,0x88,0x88],
  'Y': [0x88,0x88,0x50,0x20,0x20,0x20,0x20],
  'Z': [0xF8,0x08,0x10,0x20,0x40,0x80,0xF8],
  '0': [0x70,0x88,0x98,0xA8,0xC8,0x88,0x70],
  '1': [0x20,0x60,0x20,0x20,0x20,0x20,0x70],
  '2': [0x70,0x88,0x08,0x30,0x40,0x80,0xF8],
  '3': [0xF8,0x08,0x10,0x30,0x08,0x88,0x70],
  '4': [0x10,0x30,0x50,0x90,0xF8,0x10,0x10],
  '5': [0xF8,0x80,0xF0,0x08,0x08,0x88,0x70],
  '6': [0x30,0x40,0x80,0xF0,0x88,0x88,0x70],
  '7': [0xF8,0x08,0x10,0x20,0x40,0x40,0x40],
  '8': [0x70,0x88,0x88,0x70,0x88,0x88,0x70],
  '9': [0x70,0x88,0x88,0x78,0x08,0x10,0x60],
  '-': [0x00,0x00,0x00,0x70,0x00,0x00,0x00],
  '~': [0x00,0x68,0xB0,0x00,0x00,0x00,0x00],
  '.': [0x00,0x00,0x00,0x00,0x00,0x60,0x60],
  ':': [0x00,0x60,0x60,0x00,0x60,0x60,0x00],
  ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
  '(': [0x10,0x20,0x40,0x40,0x40,0x20,0x10],
  ')': [0x40,0x20,0x10,0x10,0x10,0x20,0x40],
  '/': [0x08,0x10,0x10,0x20,0x40,0x40,0x80],
  '&': [0x70,0x88,0x70,0x50,0xA8,0x88,0x70],
};

function renderText(buffer, text, startX, startY, scale, colorIdx) {
  let cx = startX;
  for (const ch of text.toUpperCase()) {
    const glyph = FONT[ch] || FONT[' '];
    for (let r = 0; r < 7; r++) {
      const row = glyph[r];
      for (let c = 0; c < 5; c++) {
        if ((row & (0x80 >> c)) !== 0) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              const px = cx + c * scale + dx;
              const py = startY + r * scale + dy;
              if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
                buffer[py * WIDTH + px] = colorIdx;
              }
            }
          }
        }
      }
    }
    cx += (5 + 1) * scale;
  }
}

function drawLine(buffer, x0, y0, x1, y1, colorIdx) {
  x0 = Math.round(x0); y0 = Math.round(y0);
  x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (x0 >= 0 && x0 < WIDTH && y0 >= 0 && y0 < HEIGHT) {
      buffer[y0 * WIDTH + x0] = colorIdx;
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

function drawCircle(buffer, cx, cy, r, colorIdx, fill = false) {
  cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x*x + y*y);
      if (fill ? d <= r : Math.abs(d - r) < 1.0) {
        const px = cx + x;
        const py = cy + y;
        if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
          buffer[py * WIDTH + px] = colorIdx;
        }
      }
    }
  }
}

// Generate GIF frames
const TOTAL_FRAMES = 24;
const frames = [];
const delays = [];

for (let frameIdx = 0; frameIdx < TOTAL_FRAMES; frameIdx++) {
  const buf = new Uint8Array(WIDTH * HEIGHT);
  const progress = frameIdx / TOTAL_FRAMES;

  // 1. Background Fill (#0f172a / #090d16)
  for (let y = 0; y < HEIGHT; y++) {
    const bg = (y < PADDING_Y || y >= HEIGHT - PADDING_Y) ? 16 : 0;
    for (let x = 0; x < WIDTH; x++) {
      buf[y * WIDTH + x] = bg;
    }
  }

  // 2. Decorative Grid inside safe zone
  for (let y = PADDING_Y + 10; y < HEIGHT - PADDING_Y; y += 30) {
    for (let x = 20; x < WIDTH - 20; x += 30) {
      buf[y * WIDTH + x] = 2; // subtle slate dot
    }
  }

  // Top and bottom boundary accent guide (very subtle)
  for (let x = 30; x < WIDTH - 30; x += 4) {
    buf[PADDING_Y * WIDTH + x] = 2;
    buf[(HEIGHT - PADDING_Y - 1) * WIDTH + x] = 2;
  }

  // 3. Stylized Migration Arcs
  // Arc 1 (Blue)
  const steps = 80;
  for (let s = 0; s < steps; s++) {
    const t = s / steps;
    // Cubic bezier approx: (60, 240) -> (220, 110) -> (450, 230) -> (580, 140)
    const x = Math.pow(1-t, 3)*50 + 3*Math.pow(1-t, 2)*t*200 + 3*(1-t)*Math.pow(t, 2)*420 + Math.pow(t, 3)*590;
    const y = Math.pow(1-t, 3)*225 + 3*Math.pow(1-t, 2)*t*95 + 3*(1-t)*Math.pow(t, 2)*230 + Math.pow(t, 3)*130;
    
    // Animated dash pattern
    const dashPhase = (t * 8 - progress * 2) % 1;
    const color = (dashPhase > 0 && dashPhase < 0.55) ? 8 : 2;
    drawCircle(buf, x, y, 1.2, color, true);
  }

  // Arc 2 (Orange)
  for (let s = 0; s < steps; s++) {
    const t = s / steps;
    const x = Math.pow(1-t, 3)*80 + 3*Math.pow(1-t, 2)*t*260 + 3*(1-t)*Math.pow(t, 2)*390 + Math.pow(t, 3)*560;
    const y = Math.pow(1-t, 3)*240 + 3*Math.pow(1-t, 2)*t*180 + 3*(1-t)*Math.pow(t, 2)*80 + Math.pow(t, 3)*170;
    
    const dashPhase = (t * 6 + progress * 2) % 1;
    const color = (dashPhase > 0 && dashPhase < 0.5) ? 10 : 2;
    drawCircle(buf, x, y, 1, color, true);
  }

  // 4. Transit Nodes with Pulsing Radar Rings
  const hubs = [
    { x: 120, y: 220, color: 8 },
    { x: 380, y: 140, color: 10 },
    { x: 540, y: 155, color: 14 },
  ];

  for (const hub of hubs) {
    const pulseR = 4 + ((progress * 20) % 18);
    drawCircle(buf, hub.x, hub.y, pulseR, hub.color, false);
    drawCircle(buf, hub.x, hub.y, 4, hub.color, true);
    drawCircle(buf, hub.x, hub.y, 1.5, 7, true); // white center
  }

  // 5. Typography & Text Labels
  // Pill Badge: "GLOBAL LABOR DATA"
  const badgeColor = (frameIdx % 12 < 6) ? 8 : 9;
  drawCircle(buf, 50, 76, 3, badgeColor, true);
  renderText(buf, 'GLOBAL LABOR MIGRATION', 62, 72, 1, 5);

  // Title: "INTERNATIONAL MIGRANT WORKERS" (Scale 2)
  renderText(buf, 'INTERNATIONAL', 50, 95, 3, 7);
  renderText(buf, 'MIGRANT WORKERS', 50, 122, 3, 7);

  // Subtitle
  renderText(buf, 'HISTORICAL & PROJECTED TRENDS (2013-2050)', 50, 155, 1, 5);

  // Stats Box Strip
  // Box 1: 2013: 150.4M
  renderText(buf, '2013 BASE', 50, 185, 1, 4);
  renderText(buf, '150.4M', 50, 198, 2, 8);

  // Box 2: 2026: 171.5M
  renderText(buf, '2026 CURRENT', 170, 185, 1, 4);
  renderText(buf, '~171.5M', 170, 198, 2, 10);

  // Box 3: 2050: 245.0M
  renderText(buf, '2050 HORIZON', 310, 185, 1, 4);
  renderText(buf, '~245.0M', 310, 198, 2, 12);

  // Live status badge
  renderText(buf, 'ILO / UN DEMOGRAPHIC PROJECTIONS', 50, 245, 1, 3);

  frames.push(buf);
  delays.push(6); // 60ms delay per frame (~16.6 fps)
}

// Minimal LZW GIF encoder
function encodeGif(width, height, frames, delays, palette) {
  const buf = [];
  function writeByte(b) { buf.push(b & 0xFF); }
  function writeShort(s) { buf.push(s & 0xFF, (s >> 8) & 0xFF); }
  function writeBytes(arr) { for (let i = 0; i < arr.length; i++) buf.push(arr[i]); }
  function writeString(str) { for (let i = 0; i < str.length; i++) buf.push(str.charCodeAt(i)); }

  writeString('GIF89a');
  writeShort(width);
  writeShort(height);
  writeByte(0xF7); // GCT 256 colors
  writeByte(0);    // Bg color
  writeByte(0);    // Aspect ratio

  for (let i = 0; i < 256; i++) {
    writeByte(palette[i][0]);
    writeByte(palette[i][1]);
    writeByte(palette[i][2]);
  }

  // Netscape loop
  writeByte(0x21); writeByte(0xFF); writeByte(11);
  writeString('NETSCAPE2.0');
  writeByte(3); writeByte(1); writeShort(0); writeByte(0);

  for (let f = 0; f < frames.length; f++) {
    const frame = frames[f];
    const delay = delays[f];

    // Graphic Control Extension
    writeByte(0x21); writeByte(0xF9); writeByte(4);
    writeByte(0x00); // Disposal: 0
    writeShort(delay);
    writeByte(0);
    writeByte(0);

    // Image Descriptor
    writeByte(0x2C);
    writeShort(0); writeShort(0);
    writeShort(width); writeShort(height);
    writeByte(0); // no local palette

    const minCodeSize = 8;
    writeByte(minCodeSize);

    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;

    let curCodeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    let curByte = 0;
    let curBits = 0;
    const packet = [];

    function flushPacket() {
      if (packet.length > 0) {
        writeByte(packet.length);
        writeBytes(packet);
        packet.length = 0;
      }
    }

    function emitCode(code) {
      curByte |= (code << curBits);
      curBits += curCodeSize;
      while (curBits >= 8) {
        packet.push(curByte & 0xFF);
        curByte >>= 8;
        curBits -= 8;
        if (packet.length === 254) flushPacket();
      }
    }

    const codeTable = new Map();
    function resetTable() {
      codeTable.clear();
      curCodeSize = minCodeSize + 1;
      nextCode = eoiCode + 1;
    }

    emitCode(clearCode);
    resetTable();

    let prefix = frame[0];
    for (let i = 1; i < frame.length; i++) {
      const k = frame[i];
      const key = (prefix << 8) | k;
      if (codeTable.has(key)) {
        prefix = codeTable.get(key);
      } else {
        emitCode(prefix);
        if (nextCode < 4096) {
          codeTable.set(key, nextCode++);
          if (nextCode === (1 << curCodeSize) && curCodeSize < 12) {
            curCodeSize++;
          }
        } else {
          emitCode(clearCode);
          resetTable();
        }
        prefix = k;
      }
    }
    emitCode(prefix);
    emitCode(eoiCode);

    if (curBits > 0) packet.push(curByte & 0xFF);
    flushPacket();
    writeByte(0);
  }

  writeByte(0x3B);
  return Buffer.from(buf);
}

const gifBuffer = encodeGif(WIDTH, HEIGHT, frames, delays, PALETTE);
const outPath = path.join(__dirname, 'assets', 'social_preview.gif');
fs.writeFileSync(outPath, gifBuffer);
console.log(`Generated GIF at ${outPath} (${(gifBuffer.length / 1024).toFixed(2)} KB)`);
