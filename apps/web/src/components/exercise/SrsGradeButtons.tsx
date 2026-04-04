import type { SrsGrade } from '@keiro/types';

interface SrsGradeButtonsProps {
  onGrade: (grade: SrsGrade) => void;
}

const gradeButtons: { grade: SrsGrade; label: string; sublabel: string; color: string }[] = [
  { grade: 'wrong', label: 'Wrong', sublabel: 'Show again soon', color: 'var(--ios-red)' },
  { grade: 'hard', label: 'Hard', sublabel: 'Review in a few days', color: 'var(--ios-orange)' },
  { grade: 'easy', label: 'Easy', sublabel: 'Review in a few weeks', color: 'var(--ios-green)' },
];

export function SrsGradeButtons({ onGrade }: SrsGradeButtonsProps) {
  return (
    <div className="mt-6 space-y-3">
      <p
        className="text-center text-[13px] font-normal uppercase tracking-wide"
        style={{ color: 'var(--ios-secondary-label)' }}
      >
        How well did you know it?
      </p>
      {gradeButtons.map(({ grade, label, sublabel, color }) => (
        <div key={grade} className="flex flex-col items-center gap-1">
          <button
            onClick={() => onGrade(grade)}
            className="w-full rounded-[10px] py-3.5 text-[17px] font-semibold text-white active:opacity-80"
            style={{ background: color }}
          >
            {label}
          </button>
          <p
            className="text-[13px]"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            {sublabel}
          </p>
        </div>
      ))}
    </div>
  );
}
