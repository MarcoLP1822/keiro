import { type KanaItem } from '@keiro/types';

interface SchemaFormProps {
  items: KanaItem[];
  onChange: (items: KanaItem[]) => void;
}

/** Reusable form for editing an array of kana items (character + romaji pairs). */
export function SchemaForm({ items, onChange }: SchemaFormProps) {
  function updateItem(index: number, field: keyof KanaItem, value: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  }

  function addItem() {
    onChange([...items, { character: '', romaji: '' }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Items ({items.length})</h4>
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-primary hover:text-primary-hover font-medium"
        >
          + Add item
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-6 text-right">{index + 1}.</span>
          <input
            type="text"
            value={item.character}
            onChange={(e) => updateItem(index, 'character', e.target.value)}
            placeholder="Character"
            className="border rounded px-2 py-1 text-sm w-20 text-jp"
          />
          <input
            type="text"
            value={item.romaji}
            onChange={(e) => updateItem(index, 'romaji', e.target.value)}
            placeholder="Romaji"
            className="border rounded px-2 py-1 text-sm w-24"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-error text-sm hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">No items. Click "+ Add item" to start.</p>
      )}
    </div>
  );
}
