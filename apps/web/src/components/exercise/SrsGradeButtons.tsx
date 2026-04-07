import type { SrsGrade } from '@keiro/types';

interface SrsGradeButtonsProps {
  onGrade: (grade: SrsGrade) => void;
}

const gradeButtons: { grade: SrsGrade; label: string; sublabel: string; color: string }[] = [
  { grade: 'wrong', label: 'Wrong', sublabel: 'Show again soon', color: 'var(--k-error)' },
  { grade: 'hard', label: 'Hard', sublabel: 'Review in a few days', color: 'var(--k-incorrect-bg)' },
  { grade: 'easy', label: 'Easy', sublabel: 'Review in a few weeks', color: 'var(--k-correct-secondary)' },
];

export function SrsGradeButtons({ onGrade }: SrsGradeButtonsProps) {
  return (
    <div className="mt-6 space-y-3">
      <p
        className="text-center text-[13px] font-normal uppercase tracking-wide"
        style={{ color: 'var(--k-secondary)' }}
      >
        How well did you know it?
      </p>
      {gradeButtons.map(({ grade, label, sublabel, color }) => (
        <div key={grade} className="flex flex-col items-center gap-1">
          <button
            onClick={() => onGrade(grade)}
            className="w-full rounded-xl py-3.5 text-[17px] font-semibold text-white active:opacity-80"
            style={{ background: color }}
          >
            {label}
          </button>
          <p
            className="text-[13px]"
            style={{ color: 'var(--k-secondary)' }}
          >
            {sublabel}
          </p>
        </div>
      ))}
    </div>
  );
}
