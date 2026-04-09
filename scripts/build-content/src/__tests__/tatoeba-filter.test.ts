import { describe, it, expect } from "vitest";
import {
  filterTatoebaSentences,
  type RawPair,
} from "../tatoeba-filter.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pair(overrides: Partial<RawPair> & { jpn: string; eng: string }): RawPair {
  return {
    id: overrides.id ?? "1",
    jpn: overrides.jpn,
    eng: overrides.eng,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("filterTatoebaSentences", () => {
  it("returns empty array for empty input", () => {
    expect(filterTatoebaSentences([])).toEqual([]);
  });

  it("filters out sentences that are 3 characters or fewer", () => {
    const short = [
      pair({ id: "1", jpn: "は", eng: "as for" }),
      pair({ id: "2", jpn: "うん", eng: "yeah" }),
      pair({ id: "3", jpn: "はい", eng: "yes" }),  // exactly 2 chars — should be filtered
      pair({ id: "4", jpn: "abc", eng: "abc" }),    // exactly 3 chars — should be filtered (≤3)
    ];

    expect(filterTatoebaSentences(short)).toHaveLength(0);
  });

  it("keeps sentences longer than 3 characters", () => {
    // "私はトムです。" is a valid 7-char Japanese sentence
    const valid = [pair({ id: "1", jpn: "私はトムです。", eng: "I am Tom." })];
    const result = filterTatoebaSentences(valid);
    expect(result).toHaveLength(1);
    expect(result[0].japanese).toBe("私はトムです。");
    expect(result[0].english).toBe("I am Tom.");
    expect(result[0].id).toBe("1");
  });

  it("filters out non-Japanese text (Latin/ASCII only)", () => {
    const latinOnly = [
      pair({ id: "1", jpn: "Hello, world!", eng: "Hello, world!" }),
      pair({ id: "2", jpn: "This is English text here.", eng: "This is English text here." }),
    ];

    expect(filterTatoebaSentences(latinOnly)).toHaveLength(0);
  });

  it("filters out text with numbers but no Japanese characters", () => {
    const numbers = [pair({ id: "1", jpn: "12345678", eng: "numbers" })];
    expect(filterTatoebaSentences(numbers)).toHaveLength(0);
  });

  it("keeps text containing hiragana", () => {
    // Contains は particle + verb ending ます
    const hiragana = [pair({ id: "1", jpn: "これはいい天気です。", eng: "It is nice weather." })];
    expect(filterTatoebaSentences(hiragana)).toHaveLength(1);
  });

  it("keeps text containing katakana with sentence markers", () => {
    // Contains は and ます
    const katakana = [pair({ id: "1", jpn: "トムはテニスをします。", eng: "Tom plays tennis." })];
    expect(filterTatoebaSentences(katakana)).toHaveLength(1);
  });

  it("keeps text containing kanji with sentence markers", () => {
    const kanji = [pair({ id: "1", jpn: "彼女は学生です。", eng: "She is a student." })];
    expect(filterTatoebaSentences(kanji)).toHaveLength(1);
  });

  it("filters out single-word entries with no particle or verb ending", () => {
    // Bare nouns without any sentence marker
    const singleWord = [
      pair({ id: "1", jpn: "東京都", eng: "Tokyo Metropolis" }),  // proper noun, no marker
      pair({ id: "2", jpn: "りんご食べ物", eng: "Apple food" }), // no particle/verb
    ];

    const result = filterTatoebaSentences(singleWord);
    // Both lack sentence markers — should be filtered out
    expect(result).toHaveLength(0);
  });

  it("keeps valid sentences with particles", () => {
    // Each has at least one particle or verb ending
    const valid = [
      pair({ id: "1", jpn: "私は学生です。", eng: "I am a student." }),
      pair({ id: "2", jpn: "猫がいます。", eng: "There is a cat." }),
      pair({ id: "3", jpn: "本を読みました。", eng: "I read a book." }),
    ];

    expect(filterTatoebaSentences(valid)).toHaveLength(3);
  });

  it("filters out sentences longer than or equal to 200 characters", () => {
    const longText = "あ".repeat(200); // exactly 200 — should be filtered (≥200)
    const tooLong = [pair({ id: "1", jpn: longText, eng: "long sentence" })];
    expect(filterTatoebaSentences(tooLong)).toHaveLength(0);
  });

  it("keeps sentences shorter than 200 characters", () => {
    const justRight = "私は" + "本を読みます。".repeat(20); // ~162 chars, has は and ます
    const valid = [pair({ id: "1", jpn: justRight, eng: "I read books." })];
    expect(filterTatoebaSentences(valid)).toHaveLength(1);
  });

  it("trims whitespace from japanese and english fields", () => {
    const whitespace = [pair({ id: "1", jpn: "  私はトムです。  ", eng: "  I am Tom.  " })];
    const result = filterTatoebaSentences(whitespace);
    expect(result[0].japanese).toBe("私はトムです。");
    expect(result[0].english).toBe("I am Tom.");
  });

  it("handles a mixed batch and returns only passing sentences", () => {
    const mixed = [
      pair({ id: "1", jpn: "は",              eng: "particle" }),          // too short
      pair({ id: "2", jpn: "Hello there!",   eng: "Hello there!" }),      // no Japanese
      pair({ id: "3", jpn: "東京",            eng: "Tokyo" }),             // no sentence marker
      pair({ id: "4", jpn: "私は学生です。",  eng: "I am a student." }),   // valid
      pair({ id: "5", jpn: "猫がいます。",    eng: "There is a cat." }),   // valid
    ];

    const result = filterTatoebaSentences(mixed);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["4", "5"]);
  });
});
