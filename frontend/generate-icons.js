import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [
  { size: 64, name: 'pwa-64x64.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 512, name: 'maskable-icon-512x512.png', maskable: true },
  { size: 180, name: 'apple-touch-icon.png', apple: true }
];

// publicディレクトリのパス
const publicDir = path.join(process.cwd(), 'public');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function drawLogo(ctx, centerX, centerY, radius) {
  // 花びらを描画
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    drawPetal(ctx, centerX, centerY, radius, angle);
  }
  
  // 中心円
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // 「5」の文字
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${radius * 1.2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('5', centerX, centerY + radius * 1.8);
}

function drawPetal(ctx, cx, cy, radius, rotation) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.quadraticCurveTo(-radius * 0.3, -radius, -radius * 0.4, -radius * 0.6);
  ctx.quadraticCurveTo(-radius * 0.4, -radius * 0.2, 0, -radius * 0.2);
  ctx.quadraticCurveTo(radius * 0.4, -radius * 0.2, radius * 0.4, -radius * 0.6);
  ctx.quadraticCurveTo(radius * 0.3, -radius, 0, -radius);
  ctx.fill();
  
  ctx.restore();
}

sizes.forEach(({ size, name, maskable, apple }) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  if (maskable) {
    // maskableアイコン用の背景（セーフエリア考慮）
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, 0, size, size);
    
    // セーフエリアは中央80%
    const safeSize = size * 0.8;
    const offset = size * 0.1;
    
    drawLogo(ctx, offset + safeSize/2, offset + safeSize/2, safeSize * 0.4);
  } else if (apple) {
    // Apple Touch Icon
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, 0, size, size);
    drawLogo(ctx, size/2, size/2, size * 0.4);
  } else {
    // 通常アイコン
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    drawLogo(ctx, size/2, size/2, size * 0.4);
  }
  
  // ファイルに保存
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${name}`);
});

console.log('All icons generated successfully!');