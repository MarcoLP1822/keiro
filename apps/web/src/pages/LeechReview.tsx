import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getModuleById } from '@keiro/content';
import { TopBar } from '../components/layout/TopBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { db } from '../services/db';

export function LeechReview() {
  const navigate = useNavigate();
  const leechCards = useLiveQuery(
    () => db.srsCards.where('isLeech').equals(1).toArray(),
    [],
  );

  if (!leechCards) {
    return (
      <>
        <TopBar title="Difficult Items" onBack={() => navigate('/')} />
        <LoadingSpinner className="mt-20" />
      </>
    );
  }

  function handlePractice() {
    if (!leechCards || leechCards.length === 0) return;
    const cardIds = leechCards.map((c) => c.id);
    navigate('/review/srs', { state: { cardIds } });
  }

  return (
    <>
      <TopBar title="Difficult Items" onBack={() => navigate('/')} />
      <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="font-headline text-3xl font-bold tracking-tight"
            style={{ color: 'var(--k-on-surface)' }}
          >
            難問
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--k-secondary)' }}>
            — Difficult Items
          </p>
        </div>

        {leechCards.length === 0 ? (
          <p
            className="mt-12 text-center text-[17px] leading-relaxed"
            style={{ color: 'var(--k-secondary)' }}
          >
            No difficult items. Keep studying!
          </p>
        ) : (
          <>
            {/* Summary */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{ background: 'var(--k-surface-container-lowest)' }}
            >
              <p
                className="text-[17px] font-semibold mb-1"
                style={{ color: 'var(--k-on-surface)' }}
              >
                {leechCards.length} {leechCards.length === 1 ? 'item needs' : 'items need'} extra practice
              </p>
              <p
                className="text-[15px]"
                style={{ color: 'var(--k-secondary)' }}
              >
                These items have been answered incorrectly multiple times. Focused review helps build stronger memory.
              </p>
            </div>

            <PrimaryButton onClick={handlePractice}>
              Practice Leeches
            </PrimaryButton>

            {/* Leech list */}
            <p
              className="mt-8 mb-2 px-4 text-[13px] font-normal uppercase tracking-wide"
              style={{ color: 'var(--k-secondary)' }}
            >
              Items
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: 'var(--k-surface-container-lowest)' }}
            >
              {leechCards.map((card, i) => {
                const mod = getModuleById(card.moduleId);
                return (
                  <div
                    key={card.id}
                    className="px-4 py-[11px] min-h-[44px]"
                    style={{
                      borderBottom:
                        i < leechCards.length - 1
                          ? '0.5px solid var(--k-outline-variant)'
                          : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-[17px]"
                          style={{ color: 'var(--k-on-surface)' }}
                        >
                          {card.itemId}
                        </p>
                        <p
                          className="text-[13px] mt-0.5"
                          style={{ color: 'var(--k-secondary)' }}
                        >
                          {mod?.name ?? card.moduleId} · {card.lapseCount} wrong
                          {card.lastReview ? ` · Last: ${card.lastReview}` : ''}
                        </p>
                      </div>
                      <span
                        className="text-[13px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--k-error)',
                          color: 'var(--k-on-error)',
                          opacity: 0.9,
                        }}
                      >
                        Leech
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
