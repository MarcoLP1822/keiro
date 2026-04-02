/**
 * Build N5 kanji content from kanji-data source.
 * Run: node scripts/build-n5-kanji.js
 */
const fs = require('fs');
const path = require('path');

const RAW_PATH = path.join(__dirname, '..', 'kanji-raw.json');
const OUT_PATH = path.join(__dirname, '..', 'packages', 'content', 'kanji', 'n5.json');

// --- Helpers ---

function cleanReading(r) {
  // Remove "!" prefix (wk primary marker), "-" suffix/prefix, "." separators
  return r.replace(/^!/, '').replace(/^-/, '').replace(/-$/, '').replace(/\./g, '');
}

function cleanMeaning(m) {
  // Remove "^" prefix (wk alternate meaning marker)
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

// --- Example words for common N5 kanji ---
const EXAMPLES = {
  '一': { word: '一つ', reading: 'ひとつ', meaning: 'one (thing)' },
  '二': { word: '二つ', reading: 'ふたつ', meaning: 'two (things)' },
  '三': { word: '三つ', reading: 'みっつ', meaning: 'three (things)' },
  '四': { word: '四つ', reading: 'よっつ', meaning: 'four (things)' },
  '五': { word: '五つ', reading: 'いつつ', meaning: 'five (things)' },
  '六': { word: '六つ', reading: 'むっつ', meaning: 'six (things)' },
  '七': { word: '七つ', reading: 'ななつ', meaning: 'seven (things)' },
  '八': { word: '八つ', reading: 'やっつ', meaning: 'eight (things)' },
  '九': { word: '九つ', reading: 'ここのつ', meaning: 'nine (things)' },
  '十': { word: '十', reading: 'じゅう', meaning: 'ten' },
  '百': { word: '百円', reading: 'ひゃくえん', meaning: 'one hundred yen' },
  '千': { word: '千円', reading: 'せんえん', meaning: 'one thousand yen' },
  '万': { word: '一万', reading: 'いちまん', meaning: 'ten thousand' },
  '日': { word: '今日', reading: 'きょう', meaning: 'today' },
  '月': { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
  '火': { word: '火曜日', reading: 'かようび', meaning: 'Tuesday' },
  '水': { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
  '木': { word: '木曜日', reading: 'もくようび', meaning: 'Thursday' },
  '金': { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
  '土': { word: '土曜日', reading: 'どようび', meaning: 'Saturday' },
  '人': { word: '日本人', reading: 'にほんじん', meaning: 'Japanese person' },
  '大': { word: '大きい', reading: 'おおきい', meaning: 'big' },
  '小': { word: '小さい', reading: 'ちいさい', meaning: 'small' },
  '中': { word: '中学校', reading: 'ちゅうがっこう', meaning: 'middle school' },
  '上': { word: '上手', reading: 'じょうず', meaning: 'skillful' },
  '下': { word: '下手', reading: 'へた', meaning: 'unskillful' },
  '年': { word: '今年', reading: 'ことし', meaning: 'this year' },
  '本': { word: '日本', reading: 'にほん', meaning: 'Japan' },
  '出': { word: '出口', reading: 'でぐち', meaning: 'exit' },
  '見': { word: '見る', reading: 'みる', meaning: 'to see' },
  '生': { word: '先生', reading: 'せんせい', meaning: 'teacher' },
  '入': { word: '入口', reading: 'いりぐち', meaning: 'entrance' },
  '学': { word: '学生', reading: 'がくせい', meaning: 'student' },
  '円': { word: '円', reading: 'えん', meaning: 'yen' },
  '子': { word: '子供', reading: 'こども', meaning: 'child' },
  '気': { word: '天気', reading: 'てんき', meaning: 'weather' },
  '山': { word: '山', reading: 'やま', meaning: 'mountain' },
  '女': { word: '女の子', reading: 'おんなのこ', meaning: 'girl' },
  '男': { word: '男の子', reading: 'おとこのこ', meaning: 'boy' },
  '先': { word: '先生', reading: 'せんせい', meaning: 'teacher' },
  '名': { word: '名前', reading: 'なまえ', meaning: 'name' },
  '川': { word: '川', reading: 'かわ', meaning: 'river' },
  '車': { word: '電車', reading: 'でんしゃ', meaning: 'train' },
  '白': { word: '白い', reading: 'しろい', meaning: 'white' },
  '天': { word: '天気', reading: 'てんき', meaning: 'weather' },
  '右': { word: '右', reading: 'みぎ', meaning: 'right' },
  '左': { word: '左', reading: 'ひだり', meaning: 'left' },
  '休': { word: '休み', reading: 'やすみ', meaning: 'rest, holiday' },
  '雨': { word: '雨', reading: 'あめ', meaning: 'rain' },
  '校': { word: '学校', reading: 'がっこう', meaning: 'school' },
  '国': { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
  '長': { word: '長い', reading: 'ながい', meaning: 'long' },
  '時': { word: '時間', reading: 'じかん', meaning: 'time' },
  '行': { word: '行く', reading: 'いく', meaning: 'to go' },
  '後': { word: '午後', reading: 'ごご', meaning: 'afternoon' },
  '前': { word: '午前', reading: 'ごぜん', meaning: 'morning (AM)' },
  '間': { word: '時間', reading: 'じかん', meaning: 'time' },
  '東': { word: '東京', reading: 'とうきょう', meaning: 'Tokyo' },
  '今': { word: '今日', reading: 'きょう', meaning: 'today' },
  '高': { word: '高い', reading: 'たかい', meaning: 'tall, expensive' },
  '外': { word: '外国人', reading: 'がいこくじん', meaning: 'foreigner' },
  '来': { word: '来年', reading: 'らいねん', meaning: 'next year' },
  '話': { word: '電話', reading: 'でんわ', meaning: 'telephone' },
  '北': { word: '北', reading: 'きた', meaning: 'north' },
  '午': { word: '午後', reading: 'ごご', meaning: 'afternoon' },
  '書': { word: '辞書', reading: 'じしょ', meaning: 'dictionary' },
  '半': { word: '半分', reading: 'はんぶん', meaning: 'half' },
  '西': { word: '西', reading: 'にし', meaning: 'west' },
  '電': { word: '電車', reading: 'でんしゃ', meaning: 'train' },
  '語': { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
  '聞': { word: '聞く', reading: 'きく', meaning: 'to listen' },
  '食': { word: '食べる', reading: 'たべる', meaning: 'to eat' },
  '何': { word: '何', reading: 'なに', meaning: 'what' },
  '南': { word: '南', reading: 'みなみ', meaning: 'south' },
  '毎': { word: '毎日', reading: 'まいにち', meaning: 'every day' },
  '母': { word: 'お母さん', reading: 'おかあさん', meaning: 'mother' },
  '読': { word: '読む', reading: 'よむ', meaning: 'to read' },
  '友': { word: '友達', reading: 'ともだち', meaning: 'friend' },
  '父': { word: 'お父さん', reading: 'おとうさん', meaning: 'father' },
};

// --- Module definitions ---
// Manually themed groupings for pedagogical order
const MODULE_DEFS = [
  {
    id: 'n5-kanji-01',
    name: 'N5 Kanji 1: Numbers',
    title: 'Kanji - Numbers',
    explanation: 'Learn the kanji for numbers 1 through 10. These are among the most common and simplest kanji in Japanese.',
    kanji: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
  },
  {
    id: 'n5-kanji-02',
    name: 'N5 Kanji 2: Large Numbers and Money',
    title: 'Kanji - Large Numbers and Money',
    explanation: 'Kanji for hundred, thousand, ten thousand, and yen. Essential for shopping and daily life in Japan.',
    kanji: ['百', '千', '万', '円', '半'],
  },
  {
    id: 'n5-kanji-03',
    name: 'N5 Kanji 3: People',
    title: 'Kanji - People',
    explanation: 'Kanji for person, woman, man, child, friend, mother, and father. These appear constantly in everyday Japanese.',
    kanji: ['人', '女', '男', '子', '友', '母', '父'],
  },
  {
    id: 'n5-kanji-04',
    name: 'N5 Kanji 4: Time and Days',
    title: 'Kanji - Time and Days',
    explanation: 'Kanji related to time, days, months, and years. You will see these on calendars, schedules, and in daily conversation.',
    kanji: ['日', '月', '年', '時', '間', '今', '毎', '午', '前', '後'],
  },
  {
    id: 'n5-kanji-05',
    name: 'N5 Kanji 5: Position and Direction',
    title: 'Kanji - Position and Direction',
    explanation: 'Kanji for up, down, middle, right, left, and the four compass directions. Useful for reading signs and giving directions.',
    kanji: ['上', '下', '中', '右', '左', '東', '西', '南', '北', '外'],
  },
  {
    id: 'n5-kanji-06',
    name: 'N5 Kanji 6: Nature',
    title: 'Kanji - Nature',
    explanation: 'Kanji for natural elements like mountain, river, fire, water, rain, sky, and wood. Many of these are pictographic and easy to remember.',
    kanji: ['山', '川', '火', '水', '雨', '天', '木', '土', '金', '白'],
  },
  {
    id: 'n5-kanji-07',
    name: 'N5 Kanji 7: Size, School, and Study',
    title: 'Kanji - Size, School, and Study',
    explanation: 'Kanji for big, small, tall, long, school, study, life, and learning. Common in academic and everyday contexts.',
    kanji: ['大', '小', '高', '長', '学', '校', '生', '先'],
  },
  {
    id: 'n5-kanji-08',
    name: 'N5 Kanji 8: Actions and Communication',
    title: 'Kanji - Actions and Communication',
    explanation: 'Kanji for essential verbs and communication: go, come, see, enter, exit, eat, read, write, hear, speak, rest, and more.',
    kanji: ['行', '来', '見', '入', '出', '食', '読', '書', '聞', '話', '休', '名', '気', '本', '車', '電', '語', '国', '何'],
  },
];

// --- Main ---
const data = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

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

const ORDER_START = 61;

const modules = MODULE_DEFS.map((def, i) => ({
  id: def.id,
  name: def.name,
  type: 'kanji',
  level: 'n5',
  order: ORDER_START + i,
  intro: {
    title: def.title,
    explanation: def.explanation,
    cultureNote: null,
  },
  items: def.kanji.map(buildKanjiItem),
}));

// Verify all N5 kanji are covered
const allN5 = Object.entries(data)
  .filter(([k, v]) => v.jlpt_new === 5)
  .map(([k]) => k);
const covered = new Set(MODULE_DEFS.flatMap(d => d.kanji));
const missing = allN5.filter(k => !covered.has(k));
const extra = [...covered].filter(k => !allN5.includes(k));

if (missing.length) console.warn('MISSING from modules:', missing.join(', '));
if (extra.length) console.warn('EXTRA in modules (not N5):', extra.join(', '));

const totalKanji = MODULE_DEFS.reduce((sum, d) => sum + d.kanji.length, 0);
console.log(`Total kanji: ${totalKanji}, Modules: ${modules.length}`);

const output = {
  level: 'n5',
  modules,
};

fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
console.log(`Written to ${OUT_PATH}`);
