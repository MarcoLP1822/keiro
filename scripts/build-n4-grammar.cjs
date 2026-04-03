/**
 * Transforms raw N4 grammar data from hanabira.org into our module format.
 * Source: https://github.com/tristcoil/hanabira.org-japanese-content
 *
 * To rebuild, first download the source JSON:
 *   curl -o tmp/n4_grammar_raw.json \
 *     https://raw.githubusercontent.com/tristcoil/hanabira.org-japanese-content/main/grammar_json/grammar_ja_N4_full_alphabetical_0001.json
 * Then run: node scripts/build-n4-grammar.cjs
 */

const fs = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tmp', 'n4_grammar_raw.json'), 'utf-8')
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

  return 'n4-' + base
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

// --- Build modules (5 items each, sequential) ---
const ITEMS_PER_MODULE = 5;
const ORDER_START = 181;

// Transform all items first
const allItems = raw.map(transformItem);

// Deduplicate IDs
const idCounts = {};
allItems.forEach(item => {
  if (idCounts[item.id]) {
    idCounts[item.id]++;
    item.id = item.id + '-' + idCounts[item.id];
  } else {
    idCounts[item.id] = 1;
  }
});

// Group into modules of 5
const modules = [];
for (let i = 0; i < allItems.length; i += ITEMS_PER_MODULE) {
  const chunk = allItems.slice(i, i + ITEMS_PER_MODULE);
  const moduleNum = Math.floor(i / ITEMS_PER_MODULE) + 1;
  const padded = String(moduleNum).padStart(2, '0');

  modules.push({
    id: `n4-grammar-${padded}`,
    name: `N4 Grammar ${moduleNum}`,
    type: 'grammar',
    level: 'n4',
    order: ORDER_START - 1 + moduleNum,
    intro: {
      title: `N4 Grammar \u2014 Group ${moduleNum}`,
      explanation: `Learn N4 grammar points ${i + 1}\u2013${Math.min(i + ITEMS_PER_MODULE, allItems.length)}. These patterns are essential for the JLPT N4 level.`,
      cultureNote: null,
    },
    items: chunk,
  });
}

const output = {
  _attribution: 'Grammar data sourced from hanabira.org (https://github.com/tristcoil/hanabira.org-japanese-content). Licensed under their repository terms.',
  level: 'n4',
  modules,
};

const outPath = path.join(__dirname, '..', 'packages', 'content', 'grammar', 'n4.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

// Stats
const totalItems = modules.reduce((sum, m) => sum + m.items.length, 0);
console.log(`Total grammar points: ${totalItems}`);
console.log(`Number of modules: ${modules.length}`);
console.log(`Order range: ${modules[0].order} - ${modules[modules.length - 1].order}`);
