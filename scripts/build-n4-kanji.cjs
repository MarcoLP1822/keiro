/**
 * Build N4 kanji content from kanji-data source.
 * Download source first:
 *   curl -o tmp/kanji-raw.json https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json
 * Then run: node scripts/build-n4-kanji.cjs
 */
const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '..', 'tmp', 'kanji-raw.json');
const OUT_PATH = path.join(__dirname, '..', 'packages', 'content', 'kanji', 'n4.json');

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

// --- Example words for N4 kanji ---
const EXAMPLES = {
  '力': { word: '力', reading: 'ちから', meaning: 'power' },
  '口': { word: '入口', reading: 'いりぐち', meaning: 'entrance' },
  '目': { word: '目', reading: 'め', meaning: 'eye' },
  '手': { word: '手紙', reading: 'てがみ', meaning: 'letter' },
  '足': { word: '足', reading: 'あし', meaning: 'foot, leg' },
  '心': { word: '心', reading: 'こころ', meaning: 'heart, mind' },
  '体': { word: '体', reading: 'からだ', meaning: 'body' },
  '自': { word: '自分', reading: 'じぶん', meaning: 'oneself' },
  '元': { word: '元気', reading: 'げんき', meaning: 'healthy, energetic' },
  '正': { word: '正しい', reading: 'ただしい', meaning: 'correct' },
  '春': { word: '春', reading: 'はる', meaning: 'spring' },
  '夏': { word: '夏', reading: 'なつ', meaning: 'summer' },
  '秋': { word: '秋', reading: 'あき', meaning: 'autumn' },
  '冬': { word: '冬', reading: 'ふゆ', meaning: 'winter' },
  '朝': { word: '朝', reading: 'あさ', meaning: 'morning' },
  '昼': { word: '昼', reading: 'ひる', meaning: 'noon' },
  '夜': { word: '夜', reading: 'よる', meaning: 'night' },
  '夕': { word: '夕方', reading: 'ゆうがた', meaning: 'evening' },
  '風': { word: '風', reading: 'かぜ', meaning: 'wind' },
  '花': { word: '花', reading: 'はな', meaning: 'flower' },
  '海': { word: '海', reading: 'うみ', meaning: 'sea' },
  '空': { word: '空', reading: 'そら', meaning: 'sky' },
  '野': { word: '野菜', reading: 'やさい', meaning: 'vegetables' },
  '地': { word: '地図', reading: 'ちず', meaning: 'map' },
  '色': { word: '色', reading: 'いろ', meaning: 'color' },
  '赤': { word: '赤い', reading: 'あかい', meaning: 'red' },
  '青': { word: '青い', reading: 'あおい', meaning: 'blue' },
  '黒': { word: '黒い', reading: 'くろい', meaning: 'black' },
  '茶': { word: 'お茶', reading: 'おちゃ', meaning: 'tea' },
  '明': { word: '明るい', reading: 'あかるい', meaning: 'bright' },
  '暗': { word: '暗い', reading: 'くらい', meaning: 'dark' },
  '広': { word: '広い', reading: 'ひろい', meaning: 'wide' },
  '重': { word: '重い', reading: 'おもい', meaning: 'heavy' },
  '軽': { word: '軽い', reading: 'かるい', meaning: 'light (weight)' },
  '家': { word: '家', reading: 'いえ', meaning: 'house' },
  '室': { word: '教室', reading: 'きょうしつ', meaning: 'classroom' },
  '堂': { word: '食堂', reading: 'しょくどう', meaning: 'cafeteria' },
  '店': { word: '店', reading: 'みせ', meaning: 'store' },
  '場': { word: '場所', reading: 'ばしょ', meaning: 'place' },
  '駅': { word: '駅', reading: 'えき', meaning: 'station' },
  '道': { word: '道', reading: 'みち', meaning: 'road' },
  '町': { word: '町', reading: 'まち', meaning: 'town' },
  '屋': { word: '部屋', reading: 'へや', meaning: 'room' },
  '建': { word: '建物', reading: 'たてもの', meaning: 'building' },
  '京': { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
  '田': { word: '田中', reading: 'たなか', meaning: 'Tanaka (surname)' },
  '台': { word: '台所', reading: 'だいどころ', meaning: 'kitchen' },
  '近': { word: '近い', reading: 'ちかい', meaning: 'near' },
  '方': { word: '方', reading: 'かた', meaning: 'person (polite)' },
  '通': { word: '通る', reading: 'とおる', meaning: 'to pass through' },
  '度': { word: '温度', reading: 'おんど', meaning: 'temperature' },
  '館': { word: '図書館', reading: 'としょかん', meaning: 'library' },
  '公': { word: '公園', reading: 'こうえん', meaning: 'park' },
  '用': { word: '用事', reading: 'ようじ', meaning: 'errand' },
  '走': { word: '走る', reading: 'はしる', meaning: 'to run' },
  '歩': { word: '歩く', reading: 'あるく', meaning: 'to walk' },
  '止': { word: '止まる', reading: 'とまる', meaning: 'to stop' },
  '送': { word: '送る', reading: 'おくる', meaning: 'to send' },
  '運': { word: '運動', reading: 'うんどう', meaning: 'exercise' },
  '動': { word: '動物', reading: 'どうぶつ', meaning: 'animal' },
  '転': { word: '自転車', reading: 'じてんしゃ', meaning: 'bicycle' },
  '集': { word: '集める', reading: 'あつめる', meaning: 'to collect' },
  '帰': { word: '帰る', reading: 'かえる', meaning: 'to return home' },
  '去': { word: '去年', reading: 'きょねん', meaning: 'last year' },
  '使': { word: '使う', reading: 'つかう', meaning: 'to use' },
  '持': { word: '持つ', reading: 'もつ', meaning: 'to hold' },
  '待': { word: '待つ', reading: 'まつ', meaning: 'to wait' },
  '立': { word: '立つ', reading: 'たつ', meaning: 'to stand' },
  '開': { word: '開ける', reading: 'あける', meaning: 'to open' },
  '切': { word: '切る', reading: 'きる', meaning: 'to cut' },
  '始': { word: '始める', reading: 'はじめる', meaning: 'to begin' },
  '終': { word: '終わる', reading: 'おわる', meaning: 'to end' },
  '起': { word: '起きる', reading: 'おきる', meaning: 'to wake up' },
  '着': { word: '着る', reading: 'きる', meaning: 'to wear' },
  '売': { word: '売る', reading: 'うる', meaning: 'to sell' },
  '買': { word: '買い物', reading: 'かいもの', meaning: 'shopping' },
  '会': { word: '会う', reading: 'あう', meaning: 'to meet' },
  '服': { word: '服', reading: 'ふく', meaning: 'clothes' },
  '洋': { word: '洋服', reading: 'ようふく', meaning: 'western clothes' },
  '借': { word: '借りる', reading: 'かりる', meaning: 'to borrow' },
  '貸': { word: '貸す', reading: 'かす', meaning: 'to lend' },
  '飲': { word: '飲む', reading: 'のむ', meaning: 'to drink' },
  '注': { word: '注意', reading: 'ちゅうい', meaning: 'caution' },
  '発': { word: '出発', reading: 'しゅっぱつ', meaning: 'departure' },
  '教': { word: '教える', reading: 'おしえる', meaning: 'to teach' },
  '習': { word: '習う', reading: 'ならう', meaning: 'to learn' },
  '勉': { word: '勉強', reading: 'べんきょう', meaning: 'study' },
  '強': { word: '強い', reading: 'つよい', meaning: 'strong' },
  '思': { word: '思う', reading: 'おもう', meaning: 'to think' },
  '考': { word: '考える', reading: 'かんがえる', meaning: 'to think' },
  '知': { word: '知る', reading: 'しる', meaning: 'to know' },
  '答': { word: '答える', reading: 'こたえる', meaning: 'to answer' },
  '問': { word: '問題', reading: 'もんだい', meaning: 'problem' },
  '題': { word: '問題', reading: 'もんだい', meaning: 'problem' },
  '試': { word: '試験', reading: 'しけん', meaning: 'exam' },
  '験': { word: '経験', reading: 'けいけん', meaning: 'experience' },
  '質': { word: '質問', reading: 'しつもん', meaning: 'question' },
  '仕': { word: '仕事', reading: 'しごと', meaning: 'work, job' },
  '事': { word: '仕事', reading: 'しごと', meaning: 'work, job' },
  '業': { word: '授業', reading: 'じゅぎょう', meaning: 'class, lesson' },
  '社': { word: '会社', reading: 'かいしゃ', meaning: 'company' },
  '研': { word: '研究', reading: 'けんきゅう', meaning: 'research' },
  '究': { word: '研究', reading: 'けんきゅう', meaning: 'research' },
  '作': { word: '作る', reading: 'つくる', meaning: 'to make' },
  '文': { word: '文化', reading: 'ぶんか', meaning: 'culture' },
  '字': { word: '漢字', reading: 'かんじ', meaning: 'kanji' },
  '紙': { word: '紙', reading: 'かみ', meaning: 'paper' },
  '図': { word: '地図', reading: 'ちず', meaning: 'map' },
  '画': { word: '映画', reading: 'えいが', meaning: 'movie' },
  '写': { word: '写真', reading: 'しゃしん', meaning: 'photograph' },
  '真': { word: '写真', reading: 'しゃしん', meaning: 'photograph' },
  '音': { word: '音楽', reading: 'おんがく', meaning: 'music' },
  '楽': { word: '音楽', reading: 'おんがく', meaning: 'music' },
  '歌': { word: '歌', reading: 'うた', meaning: 'song' },
  '犬': { word: '犬', reading: 'いぬ', meaning: 'dog' },
  '鳥': { word: '鳥', reading: 'とり', meaning: 'bird' },
  '牛': { word: '牛', reading: 'うし', meaning: 'cow' },
  '魚': { word: '魚', reading: 'さかな', meaning: 'fish' },
  '肉': { word: '肉', reading: 'にく', meaning: 'meat' },
  '料': { word: '料理', reading: 'りょうり', meaning: 'cooking' },
  '理': { word: '料理', reading: 'りょうり', meaning: 'cooking' },
  '味': { word: '味', reading: 'あじ', meaning: 'taste' },
  '飯': { word: 'ご飯', reading: 'ごはん', meaning: 'rice, meal' },
  '物': { word: '買い物', reading: 'かいもの', meaning: 'shopping' },
  '医': { word: '医者', reading: 'いしゃ', meaning: 'doctor' },
  '院': { word: '病院', reading: 'びょういん', meaning: 'hospital' },
  '病': { word: '病気', reading: 'びょうき', meaning: 'illness' },
  '死': { word: '死ぬ', reading: 'しぬ', meaning: 'to die' },
  '安': { word: '安い', reading: 'やすい', meaning: 'cheap' },
  '計': { word: '時計', reading: 'とけい', meaning: 'clock' },
  '不': { word: '不便', reading: 'ふべん', meaning: 'inconvenient' },
  '意': { word: '意味', reading: 'いみ', meaning: 'meaning' },
  '品': { word: '品物', reading: 'しなもの', meaning: 'goods' },
  '曜': { word: '曜日', reading: 'ようび', meaning: 'day of the week' },
  '多': { word: '多い', reading: 'おおい', meaning: 'many' },
  '少': { word: '少ない', reading: 'すくない', meaning: 'few' },
  '新': { word: '新しい', reading: 'あたらしい', meaning: 'new' },
  '古': { word: '古い', reading: 'ふるい', meaning: 'old' },
  '悪': { word: '悪い', reading: 'わるい', meaning: 'bad' },
  '同': { word: '同じ', reading: 'おなじ', meaning: 'same' },
  '特': { word: '特別', reading: 'とくべつ', meaning: 'special' },
  '別': { word: '特別', reading: 'とくべつ', meaning: 'special' },
  '有': { word: '有名', reading: 'ゆうめい', meaning: 'famous' },
  '以': { word: '以上', reading: 'いじょう', meaning: 'more than' },
  '親': { word: '親', reading: 'おや', meaning: 'parent' },
  '兄': { word: 'お兄さん', reading: 'おにいさん', meaning: 'older brother' },
  '弟': { word: '弟', reading: 'おとうと', meaning: 'younger brother' },
  '姉': { word: 'お姉さん', reading: 'おねえさん', meaning: 'older sister' },
  '妹': { word: '妹', reading: 'いもうと', meaning: 'younger sister' },
  '族': { word: '家族', reading: 'かぞく', meaning: 'family' },
  '主': { word: '主人', reading: 'しゅじん', meaning: 'husband, master' },
  '私': { word: '私', reading: 'わたし', meaning: 'I, me' },
  '者': { word: '医者', reading: 'いしゃ', meaning: 'doctor' },
  '員': { word: '会社員', reading: 'かいしゃいん', meaning: 'company employee' },
  '世': { word: '世界', reading: 'せかい', meaning: 'world' },
  '界': { word: '世界', reading: 'せかい', meaning: 'world' },
  '代': { word: '時代', reading: 'じだい', meaning: 'era' },
  '週': { word: '今週', reading: 'こんしゅう', meaning: 'this week' },
  '早': { word: '早い', reading: 'はやい', meaning: 'early' },
  '急': { word: '急ぐ', reading: 'いそぐ', meaning: 'to hurry' },
  '工': { word: '工場', reading: 'こうじょう', meaning: 'factory' },
  '住': { word: '住む', reading: 'すむ', meaning: 'to live' },
  '言': { word: '言う', reading: 'いう', meaning: 'to say' },
  '漢': { word: '漢字', reading: 'かんじ', meaning: 'kanji' },
  '英': { word: '英語', reading: 'えいご', meaning: 'English' },
  '映': { word: '映画', reading: 'えいが', meaning: 'movie' },
  '旅': { word: '旅行', reading: 'りょこう', meaning: 'travel' },
  '銀': { word: '銀行', reading: 'ぎんこう', meaning: 'bank' },
};

// --- Load raw data ---
const data = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

// Get all N4 kanji
const n4Kanji = Object.entries(data)
  .filter(([k, v]) => v.jlpt_new === 4)
  .map(([k, v]) => ({ char: k, ...v }));

console.log(`Found ${n4Kanji.length} N4 kanji`);

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

  if (EXAMPLES[char]) {
    item.example = EXAMPLES[char];
  }

  return item;
}

// --- Module definitions ---
// Thematic groupings for N4 kanji (only characters where jlpt_new === 4)
const MODULE_DEFS = [
  {
    id: 'n4-kanji-01',
    name: 'N4 Kanji 1: Body & Self',
    title: 'Kanji - Body and Self',
    explanation: 'Learn kanji for body parts and self: eyes, hands, feet, heart, body, and more.',
    kanji: ['力', '口', '目', '手', '足', '心', '体', '自', '元', '正'],
  },
  {
    id: 'n4-kanji-02',
    name: 'N4 Kanji 2: Family',
    title: 'Kanji - Family Members',
    explanation: 'Kanji for family relationships: parents, siblings, master, and clan.',
    kanji: ['親', '兄', '弟', '姉', '妹', '族', '主', '私', '者', '員'],
  },
  {
    id: 'n4-kanji-03',
    name: 'N4 Kanji 3: Nature & Seasons',
    title: 'Kanji - Nature and Seasons',
    explanation: 'Kanji for the four seasons, flowers, sea, sky, and wind.',
    kanji: ['春', '夏', '秋', '冬', '風', '花', '海', '空', '野', '地'],
  },
  {
    id: 'n4-kanji-04',
    name: 'N4 Kanji 4: Colors & Appearance',
    title: 'Kanji - Colors and Appearance',
    explanation: 'Kanji for colors, brightness, construction, and living.',
    kanji: ['色', '赤', '青', '黒', '茶', '明', '工', '広', '重', '住'],
  },
  {
    id: 'n4-kanji-05',
    name: 'N4 Kanji 5: Time',
    title: 'Kanji - Time Concepts',
    explanation: 'Kanji for morning, noon, evening, night, and related time concepts.',
    kanji: ['朝', '昼', '夜', '夕', '早', '急', '代', '世', '界', '週'],
  },
  {
    id: 'n4-kanji-06',
    name: 'N4 Kanji 6: Places & Buildings',
    title: 'Kanji - Places and Buildings',
    explanation: 'Kanji for houses, stores, stations, roads, and rooms.',
    kanji: ['家', '室', '堂', '店', '場', '駅', '道', '町', '屋', '建'],
  },
  {
    id: 'n4-kanji-07',
    name: 'N4 Kanji 7: Geography',
    title: 'Kanji - Geography and Regions',
    explanation: 'Kanji for cities, fields, and direction concepts.',
    kanji: ['京', '田', '台', '近', '方', '通', '度', '館', '公', '用'],
  },
  {
    id: 'n4-kanji-08',
    name: 'N4 Kanji 8: Movement',
    title: 'Kanji - Movement Verbs',
    explanation: 'Kanji for walking, running, stopping, sending, and transport.',
    kanji: ['走', '歩', '止', '送', '運', '動', '転', '集', '帰', '去'],
  },
  {
    id: 'n4-kanji-09',
    name: 'N4 Kanji 9: Actions - Daily',
    title: 'Kanji - Daily Actions',
    explanation: 'Kanji for everyday actions: use, hold, wait, stand, open, cut.',
    kanji: ['使', '持', '待', '立', '開', '切', '始', '終', '起', '着'],
  },
  {
    id: 'n4-kanji-10',
    name: 'N4 Kanji 10: Actions - Exchange',
    title: 'Kanji - Commerce and Exchange',
    explanation: 'Kanji for buying, selling, meeting, wearing, borrowing, and lending.',
    kanji: ['売', '買', '会', '服', '洋', '借', '貸', '飲', '注', '発'],
  },
  {
    id: 'n4-kanji-11',
    name: 'N4 Kanji 11: Study & Thought',
    title: 'Kanji - Study and Thought',
    explanation: 'Kanji for teaching, learning, studying, thinking, and knowing.',
    kanji: ['教', '習', '勉', '強', '思', '考', '知', '答', '問', '題'],
  },
  {
    id: 'n4-kanji-12',
    name: 'N4 Kanji 12: Tests & Work',
    title: 'Kanji - Tests and Work',
    explanation: 'Kanji related to exams, quality, work, business, and industry.',
    kanji: ['試', '験', '質', '仕', '事', '業', '社', '研', '究', '作'],
  },
  {
    id: 'n4-kanji-13',
    name: 'N4 Kanji 13: Writing & Arts',
    title: 'Kanji - Writing and Arts',
    explanation: 'Kanji for characters, paper, pictures, photos, music, and songs.',
    kanji: ['文', '字', '紙', '図', '画', '写', '真', '音', '楽', '歌'],
  },
  {
    id: 'n4-kanji-14',
    name: 'N4 Kanji 14: Food & Animals',
    title: 'Kanji - Food and Animals',
    explanation: 'Kanji for animals, meat, cooking, taste, and meals.',
    kanji: ['犬', '鳥', '牛', '魚', '肉', '料', '理', '味', '飯', '物'],
  },
  {
    id: 'n4-kanji-15',
    name: 'N4 Kanji 15: Health & Safety',
    title: 'Kanji - Health and Safety',
    explanation: 'Kanji for doctors, hospitals, illness, death, and safety.',
    kanji: ['医', '院', '病', '死', '安', '計', '不', '意', '品', '曜'],
  },
  {
    id: 'n4-kanji-16',
    name: 'N4 Kanji 16: Adjectives',
    title: 'Kanji - Descriptive Kanji',
    explanation: 'Kanji for opposites: new/old, many/few, same/different, good/bad.',
    kanji: ['多', '少', '新', '古', '悪', '同', '特', '別', '有', '以'],
  },
  {
    id: 'n4-kanji-17',
    name: 'N4 Kanji 17: Communication & Travel',
    title: 'Kanji - Communication and Travel',
    explanation: 'Kanji for language, speech, travel, movies, silver, and English.',
    kanji: ['言', '漢', '英', '映', '旅', '銀'],
  },
];

// --- Verify coverage ---
const allN4Chars = n4Kanji.map(k => k.char);
const covered = new Set(MODULE_DEFS.flatMap(d => d.kanji));
const missing = allN4Chars.filter(k => !covered.has(k));
const extra = [...covered].filter(k => !allN4Chars.includes(k));

if (missing.length) {
  console.warn('MISSING from modules:', missing.join(', '));
  console.warn(`(${missing.length} kanji not covered)`);
}
if (extra.length) console.warn('EXTRA in modules (not N4):', extra.join(', '));

// --- Build modules ---
const ORDER_START = 161;

const modules = MODULE_DEFS.map((def, i) => ({
  id: def.id,
  name: def.name,
  type: 'kanji',
  level: 'n4',
  order: ORDER_START + i,
  intro: {
    title: def.title,
    explanation: def.explanation,
    cultureNote: null,
  },
  items: def.kanji.map(buildKanjiItem),
}));

const totalKanji = MODULE_DEFS.reduce((sum, d) => sum + d.kanji.length, 0);
console.log(`Total kanji: ${totalKanji}, Modules: ${modules.length}`);
console.log(`Order range: ${ORDER_START} - ${ORDER_START + modules.length - 1}`);

const output = {
  level: 'n4',
  modules,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
console.log(`Written to ${OUT_PATH}`);
