import type { Word } from '../types/word';
import { loadEntries } from './entryStorage';
import { getAllWordsFromDb, replaceAllWordsInDb } from './wordDb';

const MIGRATION_FLAG_KEY = 'my_english_db_migrated_to_indexeddb_v1';

function isMigrationDoneInLocalStorage(): boolean {
  try {
    return window.localStorage.getItem(MIGRATION_FLAG_KEY) === '1';
  } catch {
    return true;
  }
}

function markMigrationDoneInLocalStorage(): void {
  try {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  } catch {
    // ignore
  }
}

export async function runMigrationAndLoadWords(): Promise<Word[]> {
  // 1. まずIndexedDB側にデータがあれば、それを正として返す
  try {
    const existing = await getAllWordsFromDb();
    if (existing.length > 0) {
      return existing;
    }
  } catch {
    // fall through to localStorage-based load
  }

  // 2. IndexedDBが空で、かつまだ移行フラグが立っていない場合のみ、localStorageから移行を試みる
  if (isMigrationDoneInLocalStorage()) {
    return [];
  }

  let legacyWords: Word[] = [];
  try {
    const entries = loadEntries();
    legacyWords = entries as Word[];
  } catch {
    legacyWords = [];
  }

  if (legacyWords.length === 0) {
    // データがない場合は、そのまま空として扱う
    markMigrationDoneInLocalStorage();
    return [];
  }

  try {
    await replaceAllWordsInDb(legacyWords);
    markMigrationDoneInLocalStorage();
    return legacyWords;
  } catch {
    // 失敗した場合でも、元のlocalStorageデータは残しておく
    return legacyWords;
  }
}

