const fs = require('fs');
const path = require('path');

// --- CSV parsing (handles quoted fields with commas) ---
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

// --- Infer part of speech from word/meaning/reading ---
function inferPartOfSpeech(word, reading, meaning) {
  const m = meaning.toLowerCase();

  // Explicit verb patterns
  if (m.startsWith('to ')) return 'verb';

  // Common i-adjective pattern (ends in い but not えい pattern for nouns)
  if (word.endsWith('い') && !word.endsWith('えい') && word.length > 1) {
    // Some common nouns ending in い that aren't adjectives
    const notAdj = ['ついたち', 'せんせい', 'きれい', 'ゆうめい', 'にぎやか'];
    if (!notAdj.includes(reading)) return 'adjective';
  }

  // Na-adjective patterns
  const naAdj = ['きれい', 'しずか', 'にぎやか', 'ゆうめい', 'げんき', 'すき', 'きらい', 'じょうず', 'へた', 'しんせつ', 'たいへん', 'ひま', 'べんり', 'りっぱ', 'だめ', 'いや', 'たいせつ', 'だいじょうぶ', 'ハンサム',
    // N4 na-adjectives
    'ふくざつ', 'じゆう', 'とくべつ', 'ひつよう', 'ふべん', 'あんぜん', 'さかん', 'しんぱい', 'ねっしん', 'まじめ', 'へいき', 'むり', 'かんたん', 'じょうぶ', 'すてき', 'はで', 'じみ', 'へん', 'ていねい', 'しつれい'];
  if (naAdj.includes(reading) || naAdj.includes(word)) return 'na-adjective';

  // Adverb patterns
  if (m.includes('always') || m.includes('sometimes') || m.includes('usually') || m.includes('already') || m.includes('very') || m.includes('not very')) {
    if (!m.startsWith('to ')) return 'adverb';
  }

  // Counter/number patterns
  if (m.includes('counter') || m.includes('~ times')) return 'counter';

  // Particle/conjunction patterns
  if (m.includes('but') && word.length <= 3) return 'conjunction';

  // Expression patterns
  if (m.includes('!') || m.includes('please') || m.includes('excuse me') || m.includes('hello') || m.includes('good morning') || m.includes('good evening') || m.includes('goodbye') || m.includes('thank') || m.includes('congratulat')) return 'expression';

  // Default
  return 'noun';
}

// --- Concise meaning: take first meaning before comma, clean up ---
function conciseMeaning(meaning) {
  let m = meaning.split(/[;]/)[0].trim();
  if (m.length > 40) {
    m = m.split(',')[0].trim();
  }
  return m;
}

// --- Main ---
const csvPath = process.argv[2] || path.join(__dirname, '..', 'tmp', 'n4.csv');
const raw = fs.readFileSync(csvPath, 'utf-8');
const lines = raw.split('\n').filter(l => l.trim());

// Skip header
const header = parseCSVLine(lines[0]);
console.log('CSV columns:', header);

const items = [];
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length < 3) continue;

  const [expression, reading, meaning] = fields;
  if (!expression || !reading || !meaning) continue;

  items.push({
    word: expression,
    reading: reading,
    meaning: conciseMeaning(meaning),
    partOfSpeech: inferPartOfSpeech(expression, reading, meaning),
  });
}

console.log(`Parsed ${items.length} vocabulary items`);

// Sort by reading (hiragana order)
items.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));

// Group into modules of ~20 items
const ITEMS_PER_MODULE = 20;
const ORDER_START = 101;
const modules = [];
for (let i = 0; i < items.length; i += ITEMS_PER_MODULE) {
  const chunk = items.slice(i, i + ITEMS_PER_MODULE);
  const moduleNum = Math.floor(i / ITEMS_PER_MODULE) + 1;
  const padded = String(moduleNum).padStart(2, '0');
  const firstWord = chunk[0].word;
  const lastWord = chunk[chunk.length - 1].word;

  modules.push({
    id: `n4-vocab-${padded}`,
    name: `N4 Vocab ${moduleNum}: ${firstWord}\u301C${lastWord}`,
    type: 'vocabulary',
    level: 'n4',
    order: ORDER_START - 1 + moduleNum,
    intro: {
      title: `N4 Vocabulary \u2014 Group ${moduleNum}`,
      explanation: `Learn N4 vocabulary words ${i + 1}\u2013${Math.min(i + ITEMS_PER_MODULE, items.length)}. These are essential words for the JLPT N4 level.`,
      cultureNote: null,
    },
    items: chunk,
  });
}

const output = {
  level: 'n4',
  modules,
};

const outPath = path.join(__dirname, '..', 'packages', 'content', 'vocabulary', 'n4.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`\nWrote ${outPath}`);
console.log(`Total words: ${items.length}`);
console.log(`Total modules: ${modules.length}`);
console.log(`Order range: ${modules[0].order} - ${modules[modules.length - 1].order}`);

// Show POS distribution
const posDist = {};
items.forEach(it => { posDist[it.partOfSpeech] = (posDist[it.partOfSpeech] || 0) + 1; });
console.log('\nPart of speech distribution:');
Object.entries(posDist).sort((a, b) => b[1] - a[1]).forEach(([pos, count]) => {
  console.log(`  ${pos}: ${count}`);
});
