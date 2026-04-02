/**
 * Transforms raw N5 grammar data from hanabira.org into our module format.
 * Source: https://github.com/tristcoil/hanabira.org-japanese-content
 *
 * To rebuild, first download the source JSON:
 *   curl -o tmp/n5_grammar_raw.json \
 *     https://raw.githubusercontent.com/tristcoil/hanabira.org-japanese-content/main/grammar_json/grammar_ja_N5_full_alphabetical_0001.json
 * Then run: node scripts/build-n5-grammar.cjs
 */

const fs = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tmp', 'n5_grammar_raw.json'), 'utf-8')
    .replace(/^\uFEFF/, '') // strip BOM if present
);

// --- Helpers ---

function toKebabId(title) {
  // Extract the Japanese/romaji part, remove parenthetical romaji
  let clean = title
    .replace(/\s*\(.*?\)\s*/g, '') // remove (romaji)
    .replace(/[〜～]/g, '')        // remove wave dashes
    .replace(/[。、．，]/g, '')     // remove JP punctuation
    .replace(/[.,;:!?]/g, '')      // remove EN punctuation
    .trim();

  // If it starts with a recognizable pattern, use the romaji from parentheses instead
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

  return 'n5-' + base
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
}

function cleanTitle(title) {
  // Keep Japanese + minimal romaji in parens, but clean up messy formatting
  return title
    .replace(/\s+/g, ' ')
    .trim();
}

function transformItem(raw) {
  const examples = (raw.examples || []).slice(0, 3).map(ex => ({
    japanese: ex.jp,
    english: ex.en
  }));

  return {
    id: toKebabId(raw.title),
    title: cleanTitle(raw.title),
    explanation: raw.short_explanation,
    structure: raw.formation,
    examples,
    notes: null
  };
}

// --- Thematic grouping ---
// We manually assign each grammar point (by index) to a thematic group.
// Points not explicitly assigned go into overflow groups at the end.

const thematicGroups = [
  {
    name: "N5 Grammar 1: Basic Sentences",
    intro: { title: "Basic Sentence Structure", explanation: "Learn the fundamental particles and sentence patterns that form the backbone of Japanese.", cultureNote: null },
    // は, を, も, の, が
    indices: [39, 42, 40, 124, 70]
  },
  {
    name: "N5 Grammar 2: Existence & Location",
    intro: { title: "Existence and Location", explanation: "Express what exists and where things are located using あります and います.", cultureNote: null },
    // あります, (場所)に～があります, Noun に～
    indices: [63, 135, 31]
  },
  {
    name: "N5 Grammar 3: Particles - Direction & Means",
    intro: { title: "Particles for Direction and Means", explanation: "Learn particles that express direction, location of action, and means.", cultureNote: null },
    // Noun で～, Noun に行きます, Noun に来ます, Noun に帰ります, Noun に戻ります
    indices: [29, 36, 35, 32, 50]
  },
  {
    name: "N5 Grammar 4: Particles - Range & Listing",
    intro: { title: "Particles for Range and Listing", explanation: "Express ranges with から/まで and list items with と, や, など.", cultureNote: null },
    // Noun から Noun まで, Noun と, Noun や Noun など, Noun か Noun か
    indices: [24, 30, 41, 21]
  },
  {
    name: "N5 Grammar 5: い-Adjectives",
    intro: { title: "い-Adjective Patterns", explanation: "Learn how い-adjectives connect to verbs and change form.", cultureNote: null },
    // い-Adj く + Verb, い-Adj く します, い-Adj Negative, い-Adj て
    indices: [13, 14, 15, 16]
  },
  {
    name: "N5 Grammar 6: な-Adjectives",
    intro: { title: "な-Adjective Patterns", explanation: "Learn how な-adjectives connect to verbs and express change.", cultureNote: null },
    // な-Adj に + Verb, な-Adj で, な-Adj に します, な-Adj に なります
    indices: [17, 18, 19, 20]
  },
  {
    name: "N5 Grammar 7: Verb て-form",
    intro: { title: "The て-form", explanation: "The て-form is one of the most versatile verb forms in Japanese, used for requests, ongoing actions, and connecting sentences.", cultureNote: null },
    // Verb て, Verb てください, Verb ないでください, Verb ています (both entries)
    indices: [45, 48, 49, 46, 69]
  },
  {
    name: "N5 Grammar 8: Verb Forms - Suggestions & Invitations",
    intro: { title: "Suggestions and Invitations", explanation: "Learn how to make suggestions, invitations, and proposals in Japanese.", cultureNote: null },
    // Verb ましょう, Verb ましょうか, Verb ませんか
    indices: [53, 54, 55]
  },
  {
    name: "N5 Grammar 9: Want & Ability",
    intro: { title: "Expressing Want and Ability", explanation: "Express desires and abilities using たい, ほしい, and できます.", cultureNote: null },
    // Verb たいです, Noun がほしいです, Noun ができます, Verb ることができます, Verb ることができる
    indices: [44, 23, 22, 57, 58]
  },
  {
    name: "N5 Grammar 10: Time & Sequence",
    intro: { title: "Time and Sequence", explanation: "Express the order of events and timing using before, after, and when.", cultureNote: null },
    // Verb たあとで, Noun のあとで, Verb る前に, Noun の前に, Verb てから
    indices: [43, 37, 60, 38, 47]
  },
  {
    name: "N5 Grammar 11: Giving & Receiving",
    intro: { title: "Giving and Receiving", explanation: "Japanese has distinct verbs for giving and receiving depending on the social relationship.", cultureNote: null },
    // に あげます, に もらいます, から もらいます, が私にくれます
    indices: [122, 123, 74, 75]
  },
  {
    name: "N5 Grammar 12: Comparisons",
    intro: { title: "Making Comparisons", explanation: "Learn to compare two or more things and express superlatives.", cultureNote: null },
    // A は B より, A より B のほうが, A と B と どちら, A と B と どっち, A がいちばん
    indices: [11, 12, 8, 9, 0]
  },
  {
    name: "N5 Grammar 13: Question Words - What & Who",
    intro: { title: "Question Words: What and Who", explanation: "Learn to ask about things and people using なに, だれ, and their variations.", cultureNote: null },
    // なに, なん, だれ, どなた, なんで
    indices: [114, 118, 89, 110, 119]
  },
  {
    name: "N5 Grammar 14: Question Words - Where & Which",
    intro: { title: "Question Words: Where and Which", explanation: "Ask about locations and make selections using どこ, どの, どれ, and どちら.", cultureNote: null },
    // どこ, どちら, どの Noun, どんな Noun, いくつ
    indices: [100, 109, 111, 113, 65]
  },
  {
    name: "N5 Grammar 15: Question Words - How",
    intro: { title: "Asking How", explanation: "Learn different ways to ask 'how' and make suggestions.", cultureNote: null },
    // どうですか, どうしますか, どうやって, いかがですか, なんと言いますか, どう言いますか
    indices: [95, 94, 96, 64, 121, 97]
  },
  {
    name: "N5 Grammar 16: Indefinite Pronouns - Some",
    intro: { title: "Indefinite Pronouns: Someone, Something, Somewhere", explanation: "Express indefinite references using か-compounds.", cultureNote: null },
    // なにか, だれか, どこか, いつか
    indices: [115, 90, 101, 66]
  },
  {
    name: "N5 Grammar 17: Indefinite Pronouns - Every & None",
    intro: { title: "Every and None", explanation: "Express universal and negative indefinite references.", cultureNote: null },
    // なんでも, だれでも, どこでも, いつでも, どれでも
    indices: [120, 91, 102, 67, 112]
  },
  {
    name: "N5 Grammar 18: Negative Indefinites",
    intro: { title: "Nobody, Nothing, Nowhere", explanation: "Express negative indefinites - nobody, nothing, and nowhere.", cultureNote: null },
    // なにも～ないです, なにも～ません, だれも～ないです, だれも～ません
    indices: [116, 117, 92, 93]
  },
  {
    name: "N5 Grammar 19: Negative Indefinites - Location",
    intro: { title: "Nowhere Patterns", explanation: "Multiple ways to express 'nowhere' depending on the particle used.", cultureNote: null },
    // どこにも+Verb+ないです, どこにも+Verb+ません, どこへも ないです, どこへも ません, どこも ないです, どこも ません
    indices: [103, 104, 105, 106, 107, 108]
  },
  {
    name: "N5 Grammar 20: Conjunctions - But & However",
    intro: { title: "Conjunctions: Contrast", explanation: "Connect contrasting ideas using various 'but' and 'however' expressions.", cultureNote: null },
    // けれども, しかし, でも, が～, けど, けれど
    indices: [1, 2, 7, 71, 76, 77]
  },
  {
    name: "N5 Grammar 21: Conjunctions - So & Then",
    intro: { title: "Conjunctions: Cause and Sequence", explanation: "Connect ideas showing cause, result, and sequence.", cultureNote: null },
    // から～, からです, だから, そして, それから
    indices: [72, 73, 87, 82, 84]
  },
  {
    name: "N5 Grammar 22: Transition Words",
    intro: { title: "Transition Words", explanation: "Smooth conversation transitions using 'well then' and 'in that case'.", cultureNote: null },
    // じゃ, それじゃ, それでは, では, こちら, そちら
    indices: [3, 4, 5, 6, 78, 83]
  },
  {
    name: "N5 Grammar 23: Frequency & Degree Adverbs",
    intro: { title: "Frequency and Degree", explanation: "Express how often and to what degree things happen.", cultureNote: null },
    // いつも, たいてい, ときどき, よく, あまり～ありません, あまり～ないです
    indices: [68, 86, 99, 134, 61, 62]
  },
  {
    name: "N5 Grammar 24: Degree & Approximation",
    intro: { title: "Degree and Approximation", explanation: "Express approximate amounts, degrees, and extents.", cultureNote: null },
    // ぜんぜん, だいたい, ほとんど, まあまあ, もっと
    indices: [81, 85, 126, 127, 133]
  },
  {
    name: "N5 Grammar 25: Time Expressions",
    intro: { title: "Time-Related Expressions", explanation: "Express timing, duration, and temporal relationships.", cultureNote: null },
    // さっき, すぐに, もう, もうすぐ, まだ
    indices: [79, 80, 131, 132, 128]
  },
  {
    name: "N5 Grammar 26: Negation Patterns",
    intro: { title: "Negation Patterns", explanation: "Various ways to express 'not yet' and negative states.", cultureNote: null },
    // まだ～ないです, まだ～ません, ～はたいへんです
    indices: [129, 130, 125]
  },
  {
    name: "N5 Grammar 27: Verb Nominalization & More",
    intro: { title: "Verb Nominalization and Miscellaneous Patterns", explanation: "Turn verbs into nouns and learn additional useful patterns.", cultureNote: null },
    // Verb ること, Verb るの, Noun だけ, Noun くらい, Noun ぐらい, Noun ごろ, とき
    indices: [56, 59, 28, 25, 26, 27, 98]
  },
  {
    name: "N5 Grammar 28: Purpose, Decisions & Change",
    intro: { title: "Purpose, Decisions, and Change", explanation: "Express purpose of going/coming, making decisions, and changes of state.", cultureNote: null },
    // Verb に行きます, Verb に来ます, Noun にします, たり～たりします, A は B が, Noun になります
    indices: [52, 51, 33, 88, 10, 34]
  }
];

// --- Build modules ---

// Collect all assigned indices
const assignedIndices = new Set();
thematicGroups.forEach(g => g.indices.forEach(i => assignedIndices.add(i)));

// Check for any unassigned
const unassigned = [];
for (let i = 0; i < raw.length; i++) {
  if (!assignedIndices.has(i)) {
    unassigned.push(i);
  }
}

if (unassigned.length > 0) {
  console.error('WARNING: Unassigned indices:', unassigned.map(i => `${i}: ${raw[i].title}`).join('\n'));
}

// Check for duplicate IDs
const allIds = new Set();
const duplicates = [];

const modules = thematicGroups.map((group, gi) => {
  const items = group.indices.map(i => {
    const item = transformItem(raw[i]);
    // Handle duplicate IDs by appending a suffix
    if (allIds.has(item.id)) {
      item.id = item.id + '-' + (gi + 1);
    }
    allIds.add(item.id);
    return item;
  });

  return {
    id: `n5-grammar-${String(gi + 1).padStart(2, '0')}`,
    name: group.name,
    type: "grammar",
    level: "n5",
    order: 71 + gi,
    intro: group.intro,
    items
  };
});

const output = {
  "_attribution": "Grammar data sourced from hanabira.org (https://github.com/tristcoil/hanabira.org-japanese-content). Licensed under their repository terms.",
  "level": "n5",
  "modules": modules
};

const outPath = path.join(__dirname, '..', 'packages', 'content', 'grammar', 'n5.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

// Stats
const totalItems = modules.reduce((sum, m) => sum + m.items.length, 0);
console.log(`Total grammar points: ${totalItems}`);
console.log(`Number of modules: ${modules.length}`);
console.log(`Order range: ${modules[0].order} - ${modules[modules.length - 1].order}`);
if (unassigned.length > 0) {
  console.log(`Unassigned points: ${unassigned.length}`);
}
