import { type Module, type KanaContentFile } from '@keiro/types';
import { API_BASE, type FileEntry } from '../config';

interface ModuleListProps {
  files: FileEntry[];
  selectedFile: string | null;
  selectedModuleId: string | null;
  onSelectFile: (filename: string) => void;
  onSelectModule: (moduleId: string) => void;
  onRefresh: () => void;
}

export function ModuleList({
  files,
  selectedFile,
  selectedModuleId,
  onSelectFile,
  onSelectModule,
  onRefresh,
}: ModuleListProps) {
  async function addModule(filename: string) {
    const file = files.find((f) => f.filename === filename);
    if (!file) return;

    const maxOrder = file.modules.reduce((max, m) => Math.max(max, m.order), 0);
    const newModule: Module = {
      id: `${file.script}-new-${Date.now()}`,
      name: 'New Module',
      type: 'kana',
      level: 'beginner',
      order: maxOrder + 1,
      intro: {
        title: 'New Module',
        explanation: '',
        cultureNote: null,
      },
      items: [],
    };

    const updated: KanaContentFile = {
      script: file.script,
      modules: [...file.modules, newModule],
    };

    await fetch(`${API_BASE}/api/content/kana/${filename}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    onRefresh();
  }

  async function deleteModule(filename: string, moduleId: string) {
    if (!confirm(`Delete module "${moduleId}"?`)) return;

    const file = files.find((f) => f.filename === filename);
    if (!file) return;

    const updated: KanaContentFile = {
      script: file.script,
      modules: file.modules.filter((m) => m.id !== moduleId),
    };

    await fetch(`${API_BASE}/api/content/kana/${filename}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    onRefresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Content Files</h2>
      {files.map((file) => (
        <div key={file.filename}>
          <button
            onClick={() => onSelectFile(file.filename)}
            className={`w-full text-left px-3 py-2 rounded font-semibold text-sm ${
              selectedFile === file.filename
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {file.filename}.json ({file.modules.length} modules)
          </button>
          {selectedFile === file.filename && (
            <div className="ml-2 mt-1 space-y-1">
              {file.modules
                .sort((a, b) => a.order - b.order)
                .map((mod) => (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer ${
                      selectedModuleId === mod.id
                        ? 'bg-indigo-50 border border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectModule(mod.id)}
                  >
                    <div>
                      <span className="text-gray-400 mr-1">#{mod.order}</span>
                      <span>{mod.name}</span>
                      <span className="text-gray-400 ml-1">({mod.items.length} items)</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteModule(file.filename, mod.id);
                      }}
                      className="text-error text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              <button
                onClick={() => addModule(file.filename)}
                className="w-full text-left px-2 py-1.5 text-sm text-primary hover:text-primary-hover font-medium"
              >
                + Add module
              </button>
            </div>
          )}
        </div>
      ))}
      {files.length === 0 && (
        <p className="text-sm text-gray-400">
          No content files. Make sure the dev server is running on port 3001.
        </p>
      )}
    </div>
  );
}
