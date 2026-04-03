/**
 * Build N3 kanji content from kanji-data source.
 * Run: node scripts/build-n3-kanji.cjs
 *
 * Source: https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json
 * Download to tmp/kanji-raw.json first.
 */
const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '..', 'tmp', 'kanji-raw.json');
const OUT_PATH = path.join(__dirname, '..', 'packages', 'content', 'kanji', 'n3.json');

// --- Helpers ---

function cleanReading(r) {
  return r.replace(/^!/, '').replace(/^-/, '').replace(/-$/, '').replace(/\./g, '');
}

function cleanMeaning(m) {
  return m.replace(/^\^/, '');
}

function getMeanings(entry) {
  const raw = entry.wk_meanings || entry.meanings || [];
  return raw.map(cleanMeaning).slice(0, 3);
}

function getOnReadings(entry) {
  const raw = entry.wk_readings_on || entry.readings_on || [];
  return [...new Set(raw.map(cleanReading))];
}

function getKunReadings(entry) {
  const raw = entry.wk_readings_kun || entry.readings_kun || [];
  return [...new Set(raw.map(cleanReading))];
}

// --- Main ---
const data = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

// Filter N3 kanji
const n3Kanji = Object.entries(data)
  .filter(([k, v]) => v.jlpt_new === 3)
  .map(([k, v]) => k);

console.log(`Found ${n3Kanji.length} N3 kanji`);

// Build kanji items
function buildKanjiItem(char) {
  const entry = data[char];
  if (!entry) throw new Error(`Kanji not found: ${char}`);

  const item = {
    kanji: char,
    meanings: getMeanings(entry),
    onReading: getOnReadings(entry),
    kunReading: getKunReadings(entry),
    strokeCount: entry.strokes,
  };

  return item;
}

// Sort by stroke count then by frequency for a natural learning order
n3Kanji.sort((a, b) => {
  const sa = data[a].strokes || 99;
  const sb = data[b].strokes || 99;
  if (sa !== sb) return sa - sb;
  // Lower freq number = more common
  const fa = data[a].freq || 9999;
  const fb = data[b].freq || 9999;
  return fa - fb;
});

// Group into modules of 10 each
const ITEMS_PER_MODULE = 10;
const ORDER_START = 321;
const modules = [];

for (let i = 0; i < n3Kanji.length; i += ITEMS_PER_MODULE) {
  const chunk = n3Kanji.slice(i, i + ITEMS_PER_MODULE);
  const moduleNum = Math.floor(i / ITEMS_PER_MODULE) + 1;
  const padded = String(moduleNum).padStart(2, '0');

  const items = chunk.map(buildKanjiItem);

  modules.push({
    id: `n3-kanji-${padded}`,
    name: `N3 Kanji ${moduleNum}: ${chunk[0]}\u301C${chunk[chunk.length - 1]}`,
    type: 'kanji',
    level: 'n3',
    order: ORDER_START - 1 + moduleNum,
    intro: {
      title: `N3 Kanji \u2014 Group ${moduleNum}`,
      explanation: `Learn N3 kanji ${i + 1}\u2013${Math.min(i + ITEMS_PER_MODULE, n3Kanji.length)}. These intermediate kanji are essential for the JLPT N3 level.`,
      cultureNote: null,
    },
    items,
  });
}

const output = {
  level: 'n3',
  modules,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');

console.log(`\nWrote ${OUT_PATH}`);
console.log(`Total kanji: ${n3Kanji.length}`);
console.log(`Total modules: ${modules.length}`);
console.log(`Order range: ${modules[0].order} - ${modules[modules.length - 1].order}`);
