/**
 * Transforms raw N3 grammar data from hanabira.org into our module format.
 * Source: https://github.com/tristcoil/hanabira.org-japanese-content
 *
 * To rebuild, first download the source JSON:
 *   curl -o tmp/n3_grammar_raw.json \
 *     https://raw.githubusercontent.com/tristcoil/hanabira.org-japanese-content/main/grammar_json/grammar_ja_N3_full_alphabetical_0001.json
 * Then run: node scripts/build-n3-grammar.cjs
 */

const fs = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tmp', 'n3_grammar_raw.json'), 'utf-8')
    .replace(/^\uFEFF/, '') // strip BOM if present
);

// --- Helpers ---

function toKebabId(title) {
  let clean = title
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/[〜～]/g, '')
    .replace(/[。、．，]/g, '')
    .replace(/[.,;:!?]/g, '')
    .trim();

  const romajiMatch = title.match(/\(([^)]+)\)/);
  let base;
  if (romajiMatch) {
    base = romajiMatch[1]
      .replace(/[〜～.,;:!?。、]/g, '')
      .trim()
      .toLowerCase();
  } else {
    base = clean.toLowerCase();
  }

  return 'n3-' + base
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

function cleanTitle(title) {
  return title
    .replace(/\s+/g, ' ')
    .trim();
}

function transformItem(rawItem) {
  const examples = (rawItem.examples || []).slice(0, 3).map(ex => ({
    japanese: ex.jp,
    english: ex.en
  }));

  return {
    id: toKebabId(rawItem.title),
    title: cleanTitle(rawItem.title),
    explanation: rawItem.short_explanation,
    structure: rawItem.formation,
    examples,
    notes: null
  };
}

// --- Build modules ---
// Group sequentially into modules of 5

const ITEMS_PER_MODULE = 5;
const ORDER_START = 351;
const allIds = new Set();
const modules = [];

for (let i = 0; i < raw.length; i += ITEMS_PER_MODULE) {
  const chunk = raw.slice(i, i + ITEMS_PER_MODULE);
  const moduleNum = Math.floor(i / ITEMS_PER_MODULE) + 1;
  const padded = String(moduleNum).padStart(2, '0');

  const items = chunk.map(rawItem => {
    const item = transformItem(rawItem);
    // Handle duplicate IDs
    if (allIds.has(item.id)) {
      let suffix = 2;
      while (allIds.has(item.id + '-' + suffix)) suffix++;
      item.id = item.id + '-' + suffix;
    }
    allIds.add(item.id);
    return item;
  });

  // Build a concise name from the first and last grammar point titles
  const firstTitle = chunk[0].title.split('(')[0].trim();
  const lastTitle = chunk[chunk.length - 1].title.split('(')[0].trim();

  modules.push({
    id: `n3-grammar-${padded}`,
    name: `N3 Grammar ${moduleNum}: ${firstTitle} \u301C ${lastTitle}`,
    type: 'grammar',
    level: 'n3',
    order: ORDER_START - 1 + moduleNum,
    intro: {
      title: `N3 Grammar \u2014 Group ${moduleNum}`,
      explanation: `Learn N3 grammar points ${i + 1}\u2013${Math.min(i + ITEMS_PER_MODULE, raw.length)}. These intermediate grammar patterns are essential for the JLPT N3 level.`,
      cultureNote: null,
    },
    items,
  });
}

const output = {
  "_attribution": "Grammar data sourced from hanabira.org (https://github.com/tristcoil/hanabira.org-japanese-content). Licensed under their repository terms.",
  "level": "n3",
  "modules": modules
};

const outPath = path.join(__dirname, '..', 'packages', 'content', 'grammar', 'n3.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

// Stats
const totalItems = modules.reduce((sum, m) => sum + m.items.length, 0);
console.log(`Total grammar points: ${totalItems}`);
console.log(`Number of modules: ${modules.length}`);
console.log(`Order range: ${modules[0].order} - ${modules[modules.length - 1].order}`);
