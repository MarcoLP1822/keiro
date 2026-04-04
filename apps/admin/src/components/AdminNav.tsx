export type AdminTab = 'dashboard' | 'users' | 'content';

interface AdminNavProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'content', label: 'Content' },
];

export function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  return (
    <nav className="flex border-b bg-gray-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
