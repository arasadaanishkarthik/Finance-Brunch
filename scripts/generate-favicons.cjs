const fs = require('fs');
const path = require('path');

const symbolPath = path.resolve('public/images/finance-brunch-symbol.png');
const symbolBuf = fs.readFileSync(symbolPath);
const b64 = symbolBuf.toString('base64');

// 1. Create a 512x512 square SVG favicon with rounded dark navy background and the FB logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="fbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#040914"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#fbBg)"/>
  <rect width="504" height="504" x="4" y="4" rx="104" fill="none" stroke="#2563eb" stroke-opacity="0.3" stroke-width="4"/>
  <image href="data:image/png;base64,${b64}" x="56" y="86" width="400" height="340" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

fs.writeFileSync('public/favicon.svg', svgContent, 'utf8');
console.log('✓ Created public/favicon.svg');

// 2. Create webmanifest for Google and mobile browsers
const manifest = {
  name: "Finance Brunch",
  short_name: "Finance Brunch",
  description: "Financial Advisory, Wealth & Planning",
  start_url: "/",
  display: "standalone",
  background_color: "#080e1e",
  theme_color: "#080e1e",
  icons: [
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable"
    },
    {
      src: "/favicon.png",
      sizes: "206x156",
      type: "image/png"
    }
  ]
};

fs.writeFileSync('public/site.webmanifest', JSON.stringify(manifest, null, 2), 'utf8');
console.log('✓ Created public/site.webmanifest');

// 3. Create a valid ICO file container around PNG data
// ICONDIR: 6 bytes (idReserved=0, idType=1, idCount=1)
// ICONDIRENTRY: 16 bytes (bWidth, bHeight, bColorCount, bReserved, wPlanes=1, wBitCount=32, dwBytesInRes, dwImageOffset=22)
const pngLen = symbolBuf.length;
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type 1 = icon
icoHeader.writeUInt16LE(1, 4); // count = 1
icoHeader.writeUInt8(48, 6);   // width 48
icoHeader.writeUInt8(48, 7);   // height 48
icoHeader.writeUInt8(0, 8);    // color count 0 = >= 8bpp
icoHeader.writeUInt8(0, 9);    // reserved
icoHeader.writeUInt16LE(1, 10); // color planes
icoHeader.writeUInt16LE(32, 12); // bpp
icoHeader.writeUInt32LE(pngLen, 14); // data size
icoHeader.writeUInt32LE(22, 18); // offset where PNG starts

const validIcoBuf = Buffer.concat([icoHeader, symbolBuf]);
fs.writeFileSync('public/favicon.ico', validIcoBuf);
console.log('✓ Created valid public/favicon.ico (size:', validIcoBuf.length, 'bytes)');

