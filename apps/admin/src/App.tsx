import { useState, useEffect, useCallback } from 'react';
import { type Module, type KanaItem } from '@keiro/types';
import { ModuleList } from './components/ModuleList';
import { ModuleEditor } from './components/ModuleEditor';
import { Preview } from './components/Preview';

const API_BASE = 'http://localhost:3001';

interface FileEntry {
  filename: string;
  script: string;
  modules: Module[];
}

export function App() {
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

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Find the currently selected module
  const currentFile = files.find((f) => f.filename === selectedFile);
  const selectedModule = currentFile?.modules.find((m) => m.id === selectedModuleId);

  // Build a flat pool of all kana items for distractor generation in Preview
  const allKanaItems: KanaItem[] = files.flatMap((f) =>
    f.modules.flatMap((m) => m.items as KanaItem[]),
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b px-4 py-3 bg-gray-50">
        <h1 className="text-xl font-bold text-gray-900">Keiro Admin</h1>
        <p className="text-xs text-gray-500">Content editor for kana modules</p>
      </header>

      {error && (
        <div className="bg-error/10 text-error px-4 py-2 text-sm">{error}</div>
      )}

      <div className="flex h-[calc(100vh-70px)]">
        {/* Left sidebar: Module list */}
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

        {/* Main area: Editor + Preview */}
        <main className="flex-1 overflow-y-auto">
          {selectedModule && currentFile ? (
            <div className="flex h-full">
              {/* Editor */}
              <div className="flex-1 p-4 overflow-y-auto border-r">
                <ModuleEditor
                  module={selectedModule}
                  filename={selectedFile!}
                  allModules={currentFile.modules}
                  scriptName={currentFile.script}
                  onSaved={fetchFiles}
                />
              </div>

              {/* Preview panel */}
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
    </div>
  );
}
