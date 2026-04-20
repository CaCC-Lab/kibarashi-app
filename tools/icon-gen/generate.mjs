import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

// Master SVG — 1024×1024, mist mood "breathing orb" aesthetic.
// No text, no corner radius (iOS applies its own mask).
// Meaningful content sits within central 80% to survive maskable crop.
const masterSvg = ({ size = 1024, padding = 0 } = {}) => {
  const S = size;
  const cx = S / 2;
  const cy = S / 2;
  // Core breathing orb — slightly smaller than 80% safe zone (radius ~ 30% of size)
  const coreR = S * 0.3;
  // Outer halo ring
  const haloR = S * 0.42;
  // Padding allows maskable variant to keep content inside safe circle
  const bgInset = padding;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <!-- Mist aurora background gradient -->
    <radialGradient id="bg" cx="30%" cy="25%" r="90%">
      <stop offset="0%" stop-color="#AEC8DF" stop-opacity="0.85"/>
      <stop offset="55%" stop-color="#5B7A99" stop-opacity="1"/>
      <stop offset="100%" stop-color="#2E4258" stop-opacity="1"/>
    </radialGradient>
    <!-- Soft aurora blob overlay -->
    <radialGradient id="aurora1" cx="25%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#D4C7DE" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#D4C7DE" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="aurora2" cx="80%" cy="75%" r="55%">
      <stop offset="0%" stop-color="#C7DCCE" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#C7DCCE" stop-opacity="0"/>
    </radialGradient>
    <!-- Inner orb gradient (soft, breathing) -->
    <radialGradient id="orb" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="#F3F5F7" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#D6E0EA" stop-opacity="0.75"/>
    </radialGradient>
    <!-- Orb rim highlight -->
    <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${S * 0.02}"/>
    </filter>
  </defs>

  <!-- Full-bleed background (required for iOS opaque icon) -->
  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  <!-- Aurora overlays -->
  <rect x="${bgInset}" y="${bgInset}" width="${S - bgInset * 2}" height="${S - bgInset * 2}" fill="url(#aurora1)"/>
  <rect x="${bgInset}" y="${bgInset}" width="${S - bgInset * 2}" height="${S - bgInset * 2}" fill="url(#aurora2)"/>

  <!-- Outer breathing halo ring -->
  <circle cx="${cx}" cy="${cy}" r="${haloR}"
    fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="${S * 0.008}"/>

  <!-- Mid halo (soft glow) -->
  <circle cx="${cx}" cy="${cy}" r="${coreR * 1.35}"
    fill="#FFFFFF" fill-opacity="0.08"/>

  <!-- Core breathing orb -->
  <circle cx="${cx}" cy="${cy}" r="${coreR}" fill="url(#orb)"/>

  <!-- Subtle inner accent dot — grounds the icon, echoes design's inner circle -->
  <circle cx="${cx}" cy="${cy}" r="${coreR * 0.18}" fill="#5B7A99" fill-opacity="0.35"/>
</svg>`;
};

// Generate variants
// - iOS main icon: 1024×1024, no padding (iOS applies mask)
// - PWA any: 512 / 192 / 64 — regular icon
// - apple-touch-icon: 180
// - maskable: 512 with content in central 80% — same svg works since content already <80%
const outputs = [
  { path: 'frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', size: 1024, label: 'iOS 1024' },
  { path: 'frontend/public/pwa-512x512.png', size: 512, label: 'PWA 512' },
  { path: 'frontend/public/pwa-192x192.png', size: 192, label: 'PWA 192' },
  { path: 'frontend/public/pwa-64x64.png', size: 64, label: 'PWA 64' },
  { path: 'frontend/public/apple-touch-icon.png', size: 180, label: 'apple-touch 180' },
  // Maskable needs the "safe zone" — since our content is already centered within 80%, reuse same SVG
  { path: 'frontend/public/maskable-icon-512x512.png', size: 512, label: 'maskable 512' },
];

// Also emit the master SVG so designers can iterate
const svg1024 = masterSvg({ size: 1024 });
const svgOutPath = join(repoRoot, 'frontend/public/pwa-64x64.svg');
writeFileSync(svgOutPath, masterSvg({ size: 64 }), 'utf8');
console.log(`✓ wrote ${svgOutPath}`);

for (const { path, size, label } of outputs) {
  const outPath = join(repoRoot, path);
  mkdirSync(dirname(outPath), { recursive: true });
  const svg = masterSvg({ size });
  const buf = Buffer.from(svg);
  // iOS App Store rejects icons with an alpha channel, so flatten the main
  // Xcode asset (the source SVG already paints a full-bleed opaque bg).
  const isIOS = path.includes('Assets.xcassets');
  let pipeline = sharp(buf).resize(size, size);
  if (isIOS) pipeline = pipeline.removeAlpha();
  await pipeline
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);
  console.log(`✓ ${label.padEnd(16)} → ${path}`);
}

// Extra: save a master reference at 1024 in tools/ for sanity
const refPath = join(__dirname, 'icon-master-1024.png');
await sharp(Buffer.from(masterSvg({ size: 1024 })))
  .resize(1024, 1024)
  .png()
  .toFile(refPath);
console.log(`✓ reference saved → ${refPath}`);
