import { useState, useEffect } from 'react';
import { BottomNav } from '../components/layout/BottomNav';
import { PageHeader } from '../components/layout/PageHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { speak, warmUpSpeech } from '../services/audio';
import { useSettings } from '../hooks/useSettings';

type Script = 'hiragana' | 'katakana';

const ROWS: { label: string; hiragana: (string | null)[]; katakana: (string | null)[]; romaji: string[] }[] = [
  { label: '', hiragana: ['あ','い','う','え','お'], katakana: ['ア','イ','ウ','エ','オ'], romaji: ['a','i','u','e','o'] },
  { label: 'K', hiragana: ['か','き','く','け','こ'], katakana: ['カ','キ','ク','ケ','コ'], romaji: ['ka','ki','ku','ke','ko'] },
  { label: 'S', hiragana: ['さ','し','す','せ','そ'], katakana: ['サ','シ','ス','セ','ソ'], romaji: ['sa','shi','su','se','so'] },
  { label: 'T', hiragana: ['た','ち','つ','て','と'], katakana: ['タ','チ','ツ','テ','ト'], romaji: ['ta','chi','tsu','te','to'] },
  { label: 'N', hiragana: ['な','に','ぬ','ね','の'], katakana: ['ナ','ニ','ヌ','ネ','ノ'], romaji: ['na','ni','nu','ne','no'] },
  { label: 'H', hiragana: ['は','ひ','ふ','へ','ほ'], katakana: ['ハ','ヒ','フ','ヘ','ホ'], romaji: ['ha','hi','fu','he','ho'] },
  { label: 'M', hiragana: ['ま','み','む','め','も'], katakana: ['マ','ミ','ム','メ','モ'], romaji: ['ma','mi','mu','me','mo'] },
  { label: 'Y', hiragana: ['や',null,'ゆ',null,'よ'], katakana: ['ヤ',null,'ユ',null,'ヨ'], romaji: ['ya','','yu','','yo'] },
  { label: 'R', hiragana: ['ら','り','る','れ','ろ'], katakana: ['ラ','リ','ル','レ','ロ'], romaji: ['ra','ri','ru','re','ro'] },
  { label: 'W', hiragana: ['わ',null,null,null,'を'], katakana: ['ワ',null,null,null,'ヲ'], romaji: ['wa','','','','wo'] },
  { label: '', hiragana: ['ん',null,null,null,null], katakana: ['ン',null,null,null,null], romaji: ['n','','','',''] },
];

const DAKUTEN_ROWS: { label: string; hiragana: (string | null)[]; katakana: (string | null)[]; romaji: string[] }[] = [
  { label: 'G', hiragana: ['が','ぎ','ぐ','げ','ご'], katakana: ['ガ','ギ','グ','ゲ','ゴ'], romaji: ['ga','gi','gu','ge','go'] },
  { label: 'Z', hiragana: ['ざ','じ','ず','ぜ','ぞ'], katakana: ['ザ','ジ','ズ','ゼ','ゾ'], romaji: ['za','ji','zu','ze','zo'] },
  { label: 'D', hiragana: ['だ','ぢ','づ','で','ど'], katakana: ['ダ','ヂ','ヅ','デ','ド'], romaji: ['da','ji','zu','de','do'] },
  { label: 'B', hiragana: ['ば','び','ぶ','べ','ぼ'], katakana: ['バ','ビ','ブ','ベ','ボ'], romaji: ['ba','bi','bu','be','bo'] },
  { label: 'P', hiragana: ['ぱ','ぴ','ぷ','ぺ','ぽ'], katakana: ['パ','ピ','プ','ペ','ポ'], romaji: ['pa','pi','pu','pe','po'] },
];

const COMBO_ROWS: { label: string; hiragana: (string | null)[]; katakana: (string | null)[]; romaji: string[] }[] = [
  { label: 'Ky', hiragana: ['きゃ',null,'きゅ',null,'きょ'], katakana: ['キャ',null,'キュ',null,'キョ'], romaji: ['kya','','kyu','','kyo'] },
  { label: 'Sh', hiragana: ['しゃ',null,'しゅ',null,'しょ'], katakana: ['シャ',null,'シュ',null,'ショ'], romaji: ['sha','','shu','','sho'] },
  { label: 'Ch', hiragana: ['ちゃ',null,'ちゅ',null,'ちょ'], katakana: ['チャ',null,'チュ',null,'チョ'], romaji: ['cha','','chu','','cho'] },
  { label: 'Ny', hiragana: ['にゃ',null,'にゅ',null,'にょ'], katakana: ['ニャ',null,'ニュ',null,'ニョ'], romaji: ['nya','','nyu','','nyo'] },
  { label: 'Hy', hiragana: ['ひゃ',null,'ひゅ',null,'ひょ'], katakana: ['ヒャ',null,'ヒュ',null,'ヒョ'], romaji: ['hya','','hyu','','hyo'] },
  { label: 'My', hiragana: ['みゃ',null,'みゅ',null,'みょ'], katakana: ['ミャ',null,'ミュ',null,'ミョ'], romaji: ['mya','','myu','','myo'] },
  { label: 'Ry', hiragana: ['りゃ',null,'りゅ',null,'りょ'], katakana: ['リャ',null,'リュ',null,'リョ'], romaji: ['rya','','ryu','','ryo'] },
  { label: 'Gy', hiragana: ['ぎゃ',null,'ぎゅ',null,'ぎょ'], katakana: ['ギャ',null,'ギュ',null,'ギョ'], romaji: ['gya','','gyu','','gyo'] },
  { label: 'Jy', hiragana: ['じゃ',null,'じゅ',null,'じょ'], katakana: ['ジャ',null,'ジュ',null,'ジョ'], romaji: ['ja','','ju','','jo'] },
  { label: 'By', hiragana: ['びゃ',null,'びゅ',null,'びょ'], katakana: ['ビャ',null,'ビュ',null,'ビョ'], romaji: ['bya','','byu','','byo'] },
  { label: 'Py', hiragana: ['ぴゃ',null,'ぴゅ',null,'ぴょ'], katakana: ['ピャ',null,'ピュ',null,'ピョ'], romaji: ['pya','','pyu','','pyo'] },
];

const scriptOptions = [
  { label: 'Hiragana', value: 'hiragana' },
  { label: 'Katakana', value: 'katakana' },
];

interface KanaGridProps {
  rows: typeof ROWS;
  script: Script;
  audioEnabled: boolean;
}

function KanaGrid({ rows, script, audioEnabled }: KanaGridProps) {
  const chars = rows.flatMap((row) =>
    (script === 'hiragana' ? row.hiragana : row.katakana).map((char, j) => ({
      char,
      romaji: row.romaji[j],
    }))
  );

  return (
    <div className="kana-grid">
      {chars.map((item, idx) =>
        item.char ? (
          <button
            key={idx}
            onClick={() => speak(item.char!, audioEnabled)}
            className="relative rounded-xl py-3 flex flex-col items-center justify-center active:scale-95 transition-transform duration-150"
            style={{ background: 'var(--k-surface-container-lowest)' }}
          >
            <span
              className="material-symbols-outlined absolute top-1 right-1 text-[14px]"
              style={{ color: 'var(--k-correct-secondary)', fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              check_circle
            </span>
            <span
              className="font-headline text-3xl leading-tight"
              style={{ color: 'var(--k-on-surface)' }}
            >
              {item.char}
            </span>
            <span
              className="text-[10px] uppercase tracking-widest mt-0.5"
              style={{ color: 'var(--k-secondary)' }}
            >
              {item.romaji}
            </span>
          </button>
        ) : (
          <div key={idx} />
        )
      )}
    </div>
  );
}

export function KanaChart() {
  const [script, setScript] = useState<Script>('hiragana');
  const { audio } = useSettings();

  useEffect(() => { warmUpSpeech(); }, []);

  return (
    <>
      <main className="pb-32 max-w-2xl mx-auto">
        <div className="px-6 pt-8">
          <PageHeader titleJp="五十音図" subtitle="Kana Chart — tap any character to hear it" />
        </div>

        {/* Sticky segmented control */}
        <div
          className="sticky top-0 z-10 px-6 py-3"
          style={{
            background: 'color-mix(in srgb, var(--k-surface) 92%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <SegmentedControl
            options={scriptOptions}
            selected={script}
            onChange={(v) => setScript(v as Script)}
          />
        </div>

        <div className="px-6 space-y-8">
          {/* Basic */}
          <section>
            <h3
              className="font-headline text-lg mb-3"
              style={{ color: 'var(--k-on-surface)' }}
            >
              基本 <span className="text-sm font-body font-normal" style={{ color: 'var(--k-secondary)' }}>Basic</span>
            </h3>
            <KanaGrid rows={ROWS} script={script} audioEnabled={audio} />
          </section>

          {/* Dakuten / Handakuten */}
          <section>
            <h3
              className="font-headline text-lg mb-3"
              style={{ color: 'var(--k-on-surface)' }}
            >
              濁点 <span className="text-sm font-body font-normal" style={{ color: 'var(--k-secondary)' }}>Dakuten / Handakuten</span>
            </h3>
            <KanaGrid rows={DAKUTEN_ROWS} script={script} audioEnabled={audio} />
          </section>

          {/* Combinations */}
          <section>
            <h3
              className="font-headline text-lg mb-3"
              style={{ color: 'var(--k-on-surface)' }}
            >
              拗音 <span className="text-sm font-body font-normal" style={{ color: 'var(--k-secondary)' }}>Combinations</span>
            </h3>
            <KanaGrid rows={COMBO_ROWS} script={script} audioEnabled={audio} />
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
