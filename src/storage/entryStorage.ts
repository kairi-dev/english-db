import type { Entry } from '../types/entry';

const STORAGE_KEY = 'my_english_db_entries_v1';

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is Entry =>
        e &&
        typeof e === 'object' &&
        typeof e.id === 'string' &&
        typeof e.title === 'string' &&
        typeof e.content === 'string' &&
        typeof e.createdAt === 'number' &&
        typeof e.updatedAt === 'number'
    );
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
