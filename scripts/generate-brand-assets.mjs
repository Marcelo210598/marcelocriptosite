import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const srcSvgPath = path.join(publicDir, 'favicon.svg');
const logo192Path = path.join(publicDir, 'brand-logo-192.png');
const logo512Path = path.join(publicDir, 'brand-logo-512.png');
const logo512AliasPath = path.join(publicDir, 'brand-logo.png');
const apple180Path = path.join(publicDir, 'apple-touch-icon.png');
const ogPath = path.join(publicDir, 'brand-og.png');

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function generateFromSvg() {
  if (!fs.existsSync(srcSvgPath)) {
    throw new Error(`Arquivo SVG de origem não encontrado: ${srcSvgPath}`);
  }
  const svgBuffer = await fs.promises.readFile(srcSvgPath);
  // Logos quadrados
  await sharp(svgBuffer).resize(192, 192).png({ quality: 95 }).toFile(logo192Path);
  await sharp(svgBuffer).resize(512, 512).png({ quality: 95 }).toFile(logo512Path);
  // Alias para compatibilidade
  await sharp(svgBuffer).resize(512, 512).png({ quality: 95 }).toFile(logo512AliasPath);
  // Apple touch icon 180x180
  await sharp(svgBuffer).resize(180, 180).png({ quality: 95 }).toFile(apple180Path);

  // OG banner 1200x630 gerado a partir de um SVG template
  const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0b1220"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <g opacity="0.2" stroke="#1f2937" stroke-width="3">
      <path d="M80 120 h90 m40 0 h120 m80 0 h160" />
      <path d="M100 220 h60 m60 0 h100 m200 0 h240" />
    </g>
    <g transform="translate(120,90)">
      <circle cx="240" cy="210" r="150" fill="none" stroke="#0ea5e9" stroke-width="18"/>
      <circle cx="240" cy="210" r="118" fill="none" stroke="#22d3ee" stroke-width="12"/>
      <text x="240" y="235" text-anchor="middle" font-family="Verdana, Geneva, Tahoma, sans-serif" font-size="150" font-weight="700" fill="#0ea5e9">B</text>
    </g>
    <text x="600" y="420" text-anchor="middle" font-family="Verdana, Geneva, Tahoma, sans-serif" font-size="96" font-weight="700" fill="#e2e8f0">MARCELO CRIPTO</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg)).png({ quality: 92 }).toFile(ogPath);
}

(async () => {
  await ensureDir(publicDir);
  await generateFromSvg();
  console.log('✔ Assets gerados:', {
    logo192Path,
    logo512Path,
    logo512AliasPath,
    apple180Path,
    ogPath,
  });
})();