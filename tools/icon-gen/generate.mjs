import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');

/**
 * Kibarashi app icon — daisy preserved, now in a warm sunrise palette
 * to read as cheerful / energizing while still harmonizing with the app's
 * aurora motif.
 *
 * Colors:
 *   bg:     peach → coral radial gradient (sunrise) with a lavender halo
 *   petals: bright white with a barely-warm rim
 *   center: sunny yellow with a warm orange rim — restores the daisy's
 *           "little sun" feeling
 */
const masterSvg = ({ size = 1024 } = {}) => {
  const S = size;
  const cx = S / 2;
  const cy = S / 2;
  // Overall daisy radius (from center to petal tip)
  const R = S * 0.42;
  // Petal size & placement
  const petalCenterDist = S * 0.22;   // distance from icon center to petal center
  const petalRx = S * 0.115;          // petal width (perpendicular to direction)
  const petalRy = S * 0.205;          // petal length (along direction)
  const centerR = S * 0.11;           // yellow/ivory disc radius

  const petals = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = i * 60 - 90; // start from top, go clockwise
    const rad = (angleDeg * Math.PI) / 180;
    const px = cx + Math.cos(rad) * petalCenterDist;
    const py = cy + Math.sin(rad) * petalCenterDist;
    // Rotate the ellipse so its long axis points outward
    const rotate = angleDeg + 90;
    petals.push(`<ellipse cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" rx="${petalRx.toFixed(2)}" ry="${petalRy.toFixed(2)}" transform="rotate(${rotate} ${px.toFixed(2)} ${py.toFixed(2)})" fill="url(#petal)"/>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <!-- Background: pastel sunrise — creamy peach into dusty rose, milky low-saturation -->
    <radialGradient id="bg" cx="28%" cy="22%" r="100%">
      <stop offset="0%"   stop-color="#FFEBD6" stop-opacity="1"/>
      <stop offset="50%"  stop-color="#FBD0C5" stop-opacity="1"/>
      <stop offset="100%" stop-color="#F0B0B4" stop-opacity="1"/>
    </radialGradient>
    <!-- Soft lavender aurora overlay — very gentle -->
    <radialGradient id="aurora" cx="82%" cy="28%" r="55%">
      <stop offset="0%"   stop-color="#E8D5E8" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#E8D5E8" stop-opacity="0"/>
    </radialGradient>
    <!-- Petal gradient: bright white with a milky warm edge -->
    <radialGradient id="petal" cx="50%" cy="38%" r="72%">
      <stop offset="0%"   stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="72%"  stop-color="#FFF8F0" stop-opacity="1"/>
      <stop offset="100%" stop-color="#FBE4DA" stop-opacity="1"/>
    </radialGradient>
    <!-- Center disc: muted pastel gold — still reads as "sunny" but calm -->
    <radialGradient id="center" cx="35%" cy="28%" r="80%">
      <stop offset="0%"   stop-color="#FFF4D0" stop-opacity="1"/>
      <stop offset="55%"  stop-color="#FFE399" stop-opacity="1"/>
      <stop offset="100%" stop-color="#E5B876" stop-opacity="1"/>
    </radialGradient>
    <!-- Soft shadow under the flower for depth -->
    <filter id="flowerShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${(S * 0.008).toFixed(2)}"/>
      <feOffset dx="0" dy="${(S * 0.006).toFixed(2)}" result="offsetblur"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Full-bleed background (iOS applies its own corner mask) -->
  <rect width="${S}" height="${S}" fill="url(#bg)"/>
  <rect width="${S}" height="${S}" fill="url(#aurora)"/>

  <!-- Decorative inner ring, echoing the "breathing" motif -->
  <circle cx="${cx}" cy="${cy}" r="${(R + S * 0.02).toFixed(2)}" fill="none"
    stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="${(S * 0.005).toFixed(2)}"/>

  <!-- The daisy -->
  <g filter="url(#flowerShadow)">
    ${petals.join('\n    ')}
    <circle cx="${cx}" cy="${cy}" r="${centerR.toFixed(2)}" fill="url(#center)"/>
  </g>
</svg>`;
};

// Generate variants
const outputs = [
  { path: 'frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', size: 1024, label: 'iOS 1024' },
  { path: 'frontend/public/pwa-512x512.png', size: 512, label: 'PWA 512' },
  { path: 'frontend/public/pwa-192x192.png', size: 192, label: 'PWA 192' },
  { path: 'frontend/public/pwa-64x64.png', size: 64, label: 'PWA 64' },
  { path: 'frontend/public/apple-touch-icon.png', size: 180, label: 'apple-touch 180' },
  { path: 'frontend/public/maskable-icon-512x512.png', size: 512, label: 'maskable 512' },
];

// Emit an SVG reference (smallest) alongside the bitmaps so designers can iterate
writeFileSync(join(repoRoot, 'frontend/public/pwa-64x64.svg'), masterSvg({ size: 64 }), 'utf8');
console.log(`✓ wrote frontend/public/pwa-64x64.svg`);

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

// Extra: save a master reference at 1024 in tools/ for quick review
const refPath = join(__dirname, 'icon-master-1024.png');
await sharp(Buffer.from(masterSvg({ size: 1024 })))
  .resize(1024, 1024)
  .png()
  .toFile(refPath);
console.log(`✓ reference saved → ${refPath}`);
