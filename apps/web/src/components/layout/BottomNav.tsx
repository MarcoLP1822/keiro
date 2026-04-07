import { useLocation, useNavigate } from 'react-router';

const tabs = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/path', label: 'Path', icon: 'map' },
  { path: '/kana-chart', label: 'Chart', icon: 'auto_graph' },
  { path: '/stats', label: 'Stats', icon: 'query_stats' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex justify-around items-center pt-3 pb-8 px-4"
      style={{
        background: 'color-mix(in srgb, var(--k-surface) 90%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid color-mix(in srgb, var(--k-secondary) 10%, transparent)',
        boxShadow: '0 -12px 32px -4px rgba(12, 46, 46, 0.08)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center active:scale-90 transition-transform duration-200"
            style={{ color: isActive ? 'var(--k-primary)' : 'var(--k-secondary)' }}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-medium mt-1">{tab.label}</span>
            {isActive && (
              <span
                className="w-1 h-1 rounded-full mt-1"
                style={{ background: 'var(--k-primary)' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
