import type { Module } from '@keiro/types';

export const API_BASE = 'http://localhost:3001';

export interface FileEntry {
  filename: string;
  script: string;
  modules: Module[];
}
