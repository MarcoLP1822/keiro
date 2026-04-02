import type { SrsGrade } from '@keiro/types';

interface SrsGradeButtonsProps {
  onGrade: (grade: SrsGrade) => void;
}

export function SrsGradeButtons({ onGrade }: SrsGradeButtonsProps) {
  return (
    <div className="mt-6 space-y-3">
      <p
        className="text-center text-[13px] font-normal uppercase tracking-wide"
        style={{ color: 'var(--ios-secondary-label)' }}
      >
        How well did you know it?
      </p>
      <button
        onClick={() => onGrade('wrong')}
        className="w-full rounded-[10px] py-3.5 text-[17px] font-semibold text-white active:opacity-80"
        style={{ background: 'var(--ios-red)' }}
      >
        Wrong
      </button>
      <button
        onClick={() => onGrade('hard')}
        className="w-full rounded-[10px] py-3.5 text-[17px] font-semibold text-white active:opacity-80"
        style={{ background: 'var(--ios-orange)' }}
      >
        Hard
      </button>
      <button
        onClick={() => onGrade('easy')}
        className="w-full rounded-[10px] py-3.5 text-[17px] font-semibold text-white active:opacity-80"
        style={{ background: 'var(--ios-green)' }}
      >
        Easy
      </button>
    </div>
  );
}
