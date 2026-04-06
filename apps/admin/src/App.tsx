import { useState, useCallback, useEffect } from 'react';
import { type KanaItem } from '@keiro/types';
import { useAdminAuth } from './hooks/useAdminAuth';
import { AdminNav, type AdminTab } from './components/AdminNav';
import { Dashboard } from './pages/Dashboard';
import { UserList } from './pages/UserList';
import { UserDetail } from './pages/UserDetail';
import { AuditLog } from './pages/AuditLog';
import { ModuleList } from './components/ModuleList';
import { ModuleEditor } from './components/ModuleEditor';
import { Preview } from './components/Preview';
import { API_BASE, type FileEntry } from './config';

function LoginForm({ onLogin, error }: {
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  error: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setFormError(null);
    const { error: err } = await onLogin(email, password);
    if (err) setFormError(err);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Keiro Admin</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in with your admin account</p>

        {(error || formError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error || formError}
          </div>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="w-full border rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-lg p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={!email || !password || loading}
          className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}

function ContentEditor() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/content/kana`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: FileEntry[] = await res.json();
      setFiles(data);
      setError(null);
    } catch {
      setError('Cannot reach dev server. Run: pnpm --filter @keiro/admin server');
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const currentFile = files.find((f) => f.filename === selectedFile);
  const selectedModule = currentFile?.modules.find((m) => m.id === selectedModuleId);
  const allKanaItems: KanaItem[] = files.flatMap((f) =>
    f.modules.flatMap((m) => m.items as KanaItem[]),
  );

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-sm">{error}</div>
      )}
      <div className="flex h-[calc(100vh-110px)]">
        <aside className="w-72 border-r p-4 overflow-y-auto shrink-0">
          <ModuleList
            files={files}
            selectedFile={selectedFile}
            selectedModuleId={selectedModuleId}
            onSelectFile={(f) => {
              setSelectedFile(f);
              setSelectedModuleId(null);
            }}
            onSelectModule={setSelectedModuleId}
            onRefresh={fetchFiles}
          />
        </aside>
        <main className="flex-1 overflow-y-auto">
          {selectedModule && currentFile ? (
            <div className="flex h-full">
              <div className="flex-1 p-4 overflow-y-auto border-r">
                <ModuleEditor
                  module={selectedModule}
                  filename={selectedFile!}
                  allModules={currentFile.modules}
                  scriptName={currentFile.script}
                  onSaved={fetchFiles}
                />
              </div>
              <div className="w-80 p-4 overflow-y-auto shrink-0 bg-gray-50">
                <Preview module={selectedModule} allKanaItems={allKanaItems} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Select a content file and module to begin editing</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export function App() {
  const { user, isAdmin, isLoading, error, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <LoginForm onLogin={login} error={error} />;
  }

  function renderPage() {
    if (showAuditLog) return <AuditLog />;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        if (selectedUserId && user) {
          return (
            <UserDetail
              userId={selectedUserId}
              adminUser={user}
              onBack={() => setSelectedUserId(null)}
            />
          );
        }
        return <UserList onSelectUser={setSelectedUserId} />;
      case 'content':
        return <ContentEditor />;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-4 py-3 bg-gray-50 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Keiro Admin</h1>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className={`text-sm ${showAuditLog ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Audit Log
          </button>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </header>

      <AdminNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedUserId(null);
          setShowAuditLog(false);
        }}
      />

      {renderPage()}
    </div>
  );
}
