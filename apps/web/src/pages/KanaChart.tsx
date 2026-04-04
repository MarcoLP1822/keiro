import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { speak } from '../services/audio';
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

const VOWEL_HEADERS = ['a', 'i', 'u', 'e', 'o'];

const scriptOptions = [
  { label: 'Hiragana', value: 'hiragana' },
  { label: 'Katakana', value: 'katakana' },
];

interface ChartTableProps {
  rows: typeof ROWS;
  script: Script;
  audioEnabled: boolean;
}

function ChartTable({ rows, script, audioEnabled }: ChartTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-8" />
            {VOWEL_HEADERS.map((v) => (
              <th
                key={v}
                className="py-1 text-[13px] font-medium text-center"
                style={{ color: 'var(--ios-secondary-label)' }}
              >
                {v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td
                className="text-[11px] font-medium text-center pr-1"
                style={{ color: 'var(--ios-tertiary-label)' }}
              >
                {row.label}
              </td>
              {(script === 'hiragana' ? row.hiragana : row.katakana).map((char, j) => (
                <td key={j} className="p-0.5">
                  {char ? (
                    <button
                      onClick={() => speak(char, audioEnabled)}
                      className="w-full rounded-lg py-2 text-center active:opacity-60 transition-colors"
                      style={{ background: 'var(--ios-bg-grouped-secondary)' }}
                    >
                      <span
                        className="block text-[22px] leading-tight"
                        style={{ color: 'var(--ios-label)' }}
                      >
                        {char}
                      </span>
                      <span
                        className="block text-[10px] mt-0.5"
                        style={{ color: 'var(--ios-secondary-label)' }}
                      >
                        {row.romaji[j]}
                      </span>
                    </button>
                  ) : (
                    <div className="py-2" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KanaChart() {
  const navigate = useNavigate();
  const [script, setScript] = useState<Script>('hiragana');
  const { audio } = useSettings();

  return (
    <>
      <TopBar title="Kana Chart" onBack={() => navigate(-1)} />
      <PageContainer>
        <div className="mb-4">
          <SegmentedControl
            options={scriptOptions}
            selected={script}
            onChange={(v) => setScript(v as Script)}
          />
        </div>

        {/* Main chart */}
        <p
          className="mb-2 px-1 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Basic
        </p>
        <ChartTable rows={ROWS} script={script} audioEnabled={audio} />

        {/* Dakuten */}
        <p
          className="mt-6 mb-2 px-1 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Dakuten / Handakuten
        </p>
        <ChartTable rows={DAKUTEN_ROWS} script={script} audioEnabled={audio} />

        {/* Combo */}
        <p
          className="mt-6 mb-2 px-1 text-[13px] font-normal uppercase tracking-wide"
          style={{ color: 'var(--ios-secondary-label)' }}
        >
          Combinations
        </p>
        <ChartTable rows={COMBO_ROWS} script={script} audioEnabled={audio} />

        <p
          className="mt-6 mb-8 text-center text-[13px]"
          style={{ color: 'var(--ios-tertiary-label)' }}
        >
          Tap any character to hear its pronunciation
        </p>
      </PageContainer>
    </>
  );
}
