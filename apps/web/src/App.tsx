import type { Module } from '@keiro/types';

// Verify workspace import resolves correctly
const _typeCheck: Module['type'] = 'kana';
void _typeCheck;

export function App() {
  return (
    <div>
      <h1>Keiro</h1>
    </div>
  );
}
