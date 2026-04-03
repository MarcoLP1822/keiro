/**
 * Re-numbers the `order` field in all content JSON files
 * using 1000-based ranges to prevent collisions between levels.
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'packages', 'content');

const FILES = [
  { path: 'kana/hiragana.json',    startOrder: 1000 },
  { path: 'kana/katakana.json',    startOrder: 1100 },
  { path: 'vocabulary/n5.json',    startOrder: 2000 },
  { path: 'kanji/n5.json',        startOrder: 2500 },
  { path: 'grammar/n5.json',      startOrder: 3000 },
  { path: 'vocabulary/n4.json',    startOrder: 4000 },
  { path: 'kanji/n4.json',        startOrder: 4500 },
  { path: 'grammar/n4.json',      startOrder: 5000 },
  { path: 'vocabulary/n3.json',    startOrder: 6000 },
  { path: 'kanji/n3.json',        startOrder: 6500 },
  { path: 'grammar/n3.json',      startOrder: 7000 },
];

for (const file of FILES) {
  const filePath = path.join(CONTENT_DIR, file.path);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.modules.forEach((mod, i) => {
    mod.order = file.startOrder + i;
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`${file.path}: ${data.modules.length} modules, orders ${file.startOrder}–${file.startOrder + data.modules.length - 1}`);
}

console.log('\nDone.');
