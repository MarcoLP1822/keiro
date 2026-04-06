import { useState, useEffect } from 'react';
import { type Module, type KanaItem, type KanaContentFile } from '@keiro/types';
import { SchemaForm } from './SchemaForm';
import { API_BASE } from '../config';

interface ModuleEditorProps {
  module: Module;
  filename: string;
  allModules: Module[];
  scriptName: string;
  onSaved: () => void;
}

export function ModuleEditor({ module, filename, allModules, scriptName, onSaved }: ModuleEditorProps) {
  const [draft, setDraft] = useState<Module>(structuredClone(module));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Reset draft when selected module changes
  useEffect(() => {
    setDraft(structuredClone(module));
    setStatus('idle');
  }, [module]);

  function updateField<K extends keyof Module>(field: K, value: Module[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setStatus('idle');
  }

  function updateIntro(field: string, value: string | null) {
    setDraft((prev) => ({
      ...prev,
      intro: { ...prev.intro, [field]: value },
    }));
    setStatus('idle');
  }

  async function save() {
    setStatus('saving');
    try {
      const updatedModules = allModules.map((m) => (m.id === draft.id ? draft : m));
      const body: KanaContentFile = { script: scriptName, modules: updatedModules };

      const res = await fetch(`${API_BASE}/api/content/kana/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Save failed');
      setStatus('saved');
      onSaved();
    } catch {
      setStatus('error');
    }
  }

  function cancel() {
    setDraft(structuredClone(module));
    setStatus('idle');
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(module);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Edit Module</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID</label>
          <input
            type="text"
            value={draft.id}
            onChange={(e) => updateField('id', e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Order</label>
          <input
            type="number"
            value={draft.order}
            onChange={(e) => updateField('order', parseInt(e.target.value, 10) || 0)}
            className="border rounded px-2 py-1 text-sm w-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Intro Title</label>
          <input
            type="text"
            value={draft.intro.title}
            onChange={(e) => updateIntro('title', e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Intro Explanation</label>
          <textarea
            value={draft.intro.explanation}
            onChange={(e) => updateIntro('explanation', e.target.value)}
            rows={3}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Culture Note</label>
          <textarea
            value={draft.intro.cultureNote ?? ''}
            onChange={(e) => updateIntro('cultureNote', e.target.value || null)}
            rows={2}
            className="border rounded px-2 py-1 text-sm w-full"
            placeholder="Optional"
          />
        </div>

        <SchemaForm
          items={draft.items as KanaItem[]}
          onChange={(items) => updateField('items', items)}
        />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t">
        <button
          onClick={save}
          disabled={!hasChanges || status === 'saving'}
          className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={cancel}
          disabled={!hasChanges}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        {status === 'saved' && <span className="text-sm text-success">Saved!</span>}
        {status === 'error' && <span className="text-sm text-error">Save failed</span>}
      </div>
    </div>
  );
}
