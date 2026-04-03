import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { getModuleById } from '@keiro/content';
import { TopBar } from '../components/layout/TopBar';
import { PageContainer } from '../components/layout/PageContainer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { db } from '../services/db';

export function LeechReview() {
  const navigate = useNavigate();
  const leechCards = useLiveQuery(
    () => db.srsCards.where('isLeech').equals(1).toArray(),
    [],
  );

  if (!leechCards) return null;

  function handlePractice() {
    if (!leechCards || leechCards.length === 0) return;
    const cardIds = leechCards.map((c) => c.id);
    navigate('/review/srs', { state: { cardIds } });
  }

  return (
    <>
      <TopBar title="Difficult Items" onBack={() => navigate('/')} />
      <PageContainer>
        {leechCards.length === 0 ? (
          <p
            className="mt-12 text-center text-[17px] leading-relaxed"
            style={{ color: 'var(--ios-secondary-label)' }}
          >
            No difficult items. Keep studying!
          </p>
        ) : (
          <>
            {/* Summary */}
            <div
              className="rounded-[10px] p-4 mb-6"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
            >
              <p
                className="text-[17px] font-semibold mb-1"
                style={{ color: 'var(--ios-label)' }}
              >
                {leechCards.length} {leechCards.length === 1 ? 'item needs' : 'items need'} extra practice
              </p>
              <p
                className="text-[15px]"
                style={{ color: 'var(--ios-secondary-label)' }}
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
              style={{ color: 'var(--ios-secondary-label)' }}
            >
              Items
            </p>
            <div
              className="rounded-[10px] overflow-hidden"
              style={{ background: 'var(--ios-bg-grouped-secondary)' }}
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
                          ? '0.5px solid var(--ios-separator)'
                          : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-[17px]"
                          style={{ color: 'var(--ios-label)' }}
                        >
                          {card.itemId}
                        </p>
                        <p
                          className="text-[13px] mt-0.5"
                          style={{ color: 'var(--ios-secondary-label)' }}
                        >
                          {mod?.name ?? card.moduleId} · {card.lapseCount} wrong
                          {card.lastReview ? ` · Last: ${card.lastReview}` : ''}
                        </p>
                      </div>
                      <span
                        className="text-[13px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: 'var(--ios-red)',
                          color: '#FFFFFF',
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
      </PageContainer>
    </>
  );
}
