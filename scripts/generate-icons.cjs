const sharp = require('sharp');
const path = require('path');

const SVG = path.join(__dirname, '..', 'apps', 'web', 'public', 'favicon.svg');
const OUT = path.join(__dirname, '..', 'apps', 'web', 'public');

async function main() {
  const svg = require('fs').readFileSync(SVG);

  await sharp(svg).resize(192, 192).png().toFile(path.join(OUT, 'icon-192.png'));
  console.log('Created icon-192.png');

  await sharp(svg).resize(512, 512).png().toFile(path.join(OUT, 'icon-512.png'));
  console.log('Created icon-512.png');

  await sharp(svg).resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');
}

main().catch(e => { console.error(e); process.exit(1); });
