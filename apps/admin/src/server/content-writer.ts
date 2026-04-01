import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const app = new Hono();
const CONTENT_DIR = path.resolve(import.meta.dirname, '../../../../packages/content/kana');

app.use('*', cors({ origin: 'http://localhost:5174' }));

// List all kana modules (reads both hiragana.json and katakana.json)
app.get('/api/content/kana', async (c) => {
  const files = await readdir(CONTENT_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const results = await Promise.all(
    jsonFiles.map(async (f) => {
      const content = await readFile(path.join(CONTENT_DIR, f), 'utf-8');
      return { filename: f.replace('.json', ''), ...JSON.parse(content) };
    }),
  );
  return c.json(results);
});

// Read a single kana file
app.get('/api/content/kana/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(CONTENT_DIR, `${filename}.json`);
  try {
    const content = await readFile(filePath, 'utf-8');
    return c.json(JSON.parse(content));
  } catch {
    return c.json({ error: 'File not found' }, 404);
  }
});

// Write a kana file
app.put('/api/content/kana/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(CONTENT_DIR, `${filename}.json`);
  try {
    const body = await c.req.json();
    // Basic validation: must have script and modules array
    if (!body.script || !Array.isArray(body.modules)) {
      return c.json({ error: 'Invalid content: requires "script" and "modules" array' }, 400);
    }
    await writeFile(filePath, JSON.stringify(body, null, 2) + '\n', 'utf-8');
    return c.json({ ok: true });
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
});

serve({ fetch: app.fetch, port: 3001 }, (info: { port: number }) => {
  console.log(`Content dev server running on http://localhost:${info.port}`);
});
