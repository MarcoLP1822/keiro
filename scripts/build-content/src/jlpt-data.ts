/**
 * Curated inline JLPT N5 vocabulary dataset for the Self-Introduction pilot topic.
 * This avoids unreliable external downloads at build time while providing
 * accurate data for the ~50 most essential N5 words.
 */

export interface JlptEntry {
  word: string;
  reading: string;
  meaning: string;
  jlptLevel: string;
  isCommon: boolean;
}

const N5_VOCAB: JlptEntry[] = [
  // Pronouns & people
  { word: '私', reading: 'わたし', meaning: 'I, me', jlptLevel: 'N5', isCommon: true },
  { word: '名前', reading: 'なまえ', meaning: 'name', jlptLevel: 'N5', isCommon: true },
  { word: '人', reading: 'ひと', meaning: 'person, people', jlptLevel: 'N5', isCommon: true },
  { word: '友達', reading: 'ともだち', meaning: 'friend', jlptLevel: 'N5', isCommon: true },
  { word: '家族', reading: 'かぞく', meaning: 'family', jlptLevel: 'N5', isCommon: true },

  // Occupations & roles
  { word: '学生', reading: 'がくせい', meaning: 'student', jlptLevel: 'N5', isCommon: true },
  { word: '先生', reading: 'せんせい', meaning: 'teacher', jlptLevel: 'N5', isCommon: true },
  { word: '仕事', reading: 'しごと', meaning: 'work, job', jlptLevel: 'N5', isCommon: true },

  // Hobbies & interests
  { word: '趣味', reading: 'しゅみ', meaning: 'hobby, interest', jlptLevel: 'N5', isCommon: true },
  { word: '本', reading: 'ほん', meaning: 'book', jlptLevel: 'N5', isCommon: true },
  { word: '音楽', reading: 'おんがく', meaning: 'music', jlptLevel: 'N5', isCommon: true },
  { word: '映画', reading: 'えいが', meaning: 'movie, film', jlptLevel: 'N5', isCommon: true },
  { word: '料理', reading: 'りょうり', meaning: 'cooking, cuisine', jlptLevel: 'N5', isCommon: true },
  { word: '旅行', reading: 'りょこう', meaning: 'travel, trip', jlptLevel: 'N5', isCommon: true },
  { word: 'スポーツ', reading: 'スポーツ', meaning: 'sports', jlptLevel: 'N5', isCommon: true },

  // Adjectives (likes/dislikes)
  { word: '好き', reading: 'すき', meaning: 'liked, favourite', jlptLevel: 'N5', isCommon: true },
  { word: '嫌い', reading: 'きらい', meaning: 'disliked, hated', jlptLevel: 'N5', isCommon: true },
  { word: '上手', reading: 'じょうず', meaning: 'skilled, good at', jlptLevel: 'N5', isCommon: true },
  { word: '下手', reading: 'へた', meaning: 'unskilled, poor at', jlptLevel: 'N5', isCommon: true },

  // Languages & nationalities
  { word: '日本語', reading: 'にほんご', meaning: 'Japanese (language)', jlptLevel: 'N5', isCommon: true },
  { word: '英語', reading: 'えいご', meaning: 'English (language)', jlptLevel: 'N5', isCommon: true },
  { word: '日本', reading: 'にほん', meaning: 'Japan', jlptLevel: 'N5', isCommon: true },
  { word: '外国語', reading: 'がいこくご', meaning: 'foreign language', jlptLevel: 'N5', isCommon: false },

  // Places
  { word: '大学', reading: 'だいがく', meaning: 'university', jlptLevel: 'N5', isCommon: true },
  { word: '会社', reading: 'かいしゃ', meaning: 'company, office', jlptLevel: 'N5', isCommon: true },
  { word: '学校', reading: 'がっこう', meaning: 'school', jlptLevel: 'N5', isCommon: true },
  { word: '東京', reading: 'とうきょう', meaning: 'Tokyo', jlptLevel: 'N5', isCommon: true },
  { word: '家', reading: 'いえ', meaning: 'house, home', jlptLevel: 'N5', isCommon: true },
  { word: '国', reading: 'くに', meaning: 'country', jlptLevel: 'N5', isCommon: true },

  // Common verbs
  { word: '住む', reading: 'すむ', meaning: 'to live, to reside', jlptLevel: 'N5', isCommon: true },
  { word: '働く', reading: 'はたらく', meaning: 'to work', jlptLevel: 'N5', isCommon: true },
  { word: '勉強する', reading: 'べんきょうする', meaning: 'to study', jlptLevel: 'N5', isCommon: true },
  { word: '話す', reading: 'はなす', meaning: 'to speak, to talk', jlptLevel: 'N5', isCommon: true },
  { word: '聞く', reading: 'きく', meaning: 'to listen, to hear', jlptLevel: 'N5', isCommon: true },
  { word: '読む', reading: 'よむ', meaning: 'to read', jlptLevel: 'N5', isCommon: true },
  { word: '書く', reading: 'かく', meaning: 'to write', jlptLevel: 'N5', isCommon: true },
  { word: '食べる', reading: 'たべる', meaning: 'to eat', jlptLevel: 'N5', isCommon: true },
  { word: '飲む', reading: 'のむ', meaning: 'to drink', jlptLevel: 'N5', isCommon: true },
  { word: '行く', reading: 'いく', meaning: 'to go', jlptLevel: 'N5', isCommon: true },
  { word: '来る', reading: 'くる', meaning: 'to come', jlptLevel: 'N5', isCommon: true },

  // Numbers & age
  { word: '歳', reading: 'さい', meaning: 'years old (age)', jlptLevel: 'N5', isCommon: true },
  { word: '年', reading: 'ねん', meaning: 'year', jlptLevel: 'N5', isCommon: true },

  // Common nouns
  { word: '今', reading: 'いま', meaning: 'now', jlptLevel: 'N5', isCommon: true },
  { word: 'こと', reading: 'こと', meaning: 'thing (abstract)', jlptLevel: 'N5', isCommon: true },

  // Greetings & self-intro phrases
  { word: 'はじめまして', reading: 'はじめまして', meaning: 'Nice to meet you (first meeting)', jlptLevel: 'N5', isCommon: true },
  { word: 'よろしく', reading: 'よろしく', meaning: 'please treat me well', jlptLevel: 'N5', isCommon: true },
  { word: 'どうぞ', reading: 'どうぞ', meaning: 'please, here you are', jlptLevel: 'N5', isCommon: true },

  // Descriptors
  { word: '出身', reading: 'しゅっしん', meaning: 'hometown, origin', jlptLevel: 'N5', isCommon: true },
  { word: '専攻', reading: 'せんこう', meaning: 'major (academic), specialty', jlptLevel: 'N5', isCommon: false },
];

/**
 * Returns a Map from word → JlptEntry for O(1) lookups by dictionary form.
 */
export function getJlptVocab(): Map<string, JlptEntry> {
  const map = new Map<string, JlptEntry>();
  for (const entry of N5_VOCAB) {
    map.set(entry.word, entry);
  }
  return map;
}

/**
 * Returns the JLPT level string for a word, or null if not in the dataset.
 */
export function getJlptLevel(word: string): string | null {
  const entry = getJlptVocab().get(word);
  return entry?.jlptLevel ?? null;
}
