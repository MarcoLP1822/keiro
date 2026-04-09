/**
 * Smoke test for the furigana annotator.
 * Verifies tokenization and reading assignment for "東京へ行く".
 *
 * Expected:
 *   東京 → とうきょう
 *   へ   → null
 *   行く → 行 gets いく (as one token) OR split into 行→い, く→null
 *
 * Run: npx tsx src/test-furigana.ts
 */

import { initFurigana, annotateFurigana } from "./furigana.js";

async function main() {
  console.log("Initializing kuromoji tokenizer...");
  await initFurigana();
  console.log("Tokenizer ready.\n");

  const text = "東京へ行く";
  console.log(`Annotating: "${text}"`);
  const tokens = await annotateFurigana(text);

  console.log("\nTokens:");
  tokens.forEach((t) => {
    console.log(`  { text: "${t.text}", reading: ${t.reading === null ? "null" : `"${t.reading}"`} }`);
  });

  // Assertions
  let passed = true;

  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      passed = false;
    } else {
      console.log(`  PASS: ${message}`);
    }
  }

  console.log("\nVerifications:");

  // 東京 should get reading とうきょう (kuromoji may emit it as one token)
  const tokyoToken = tokens.find((t) => t.text === "東京");
  assert(
    tokyoToken !== undefined && tokyoToken.reading === "とうきょう",
    `東京 → reading "とうきょう" (got: ${tokyoToken?.reading ?? "token not found"})`
  );

  // へ should have reading: null (kana particle)
  const heToken = tokens.find((t) => t.text === "へ");
  assert(
    heToken !== undefined && heToken.reading === null,
    `へ → reading null (got: ${heToken?.reading ?? "token not found"})`
  );

  // 行く may be one token with reading いく, or split.
  // Either way: the token containing 行 should have a non-null reading.
  const ikuToken = tokens.find((t) => t.text === "行く" || t.text === "行");
  assert(
    ikuToken !== undefined && ikuToken.reading !== null,
    `行(く) token has a reading (got: ${ikuToken?.reading ?? "token not found"})`
  );

  // く (if separate from 行) should have reading: null
  const kuToken = tokens.find((t) => t.text === "く");
  if (kuToken !== undefined) {
    assert(kuToken.reading === null, `く → reading null (got: ${kuToken.reading})`);
  } else {
    console.log("  INFO: く merged with 行 into 行く token — acceptable.");
  }

  console.log(passed ? "\nAll checks passed." : "\nSome checks FAILED.");
  if (!passed) process.exit(1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
