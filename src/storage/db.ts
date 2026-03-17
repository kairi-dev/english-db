const DB_NAME = 'my_english_db';
const DB_VERSION = 1;
const WORDS_STORE = 'words';

export type WordDbStoreName = typeof WORDS_STORE;

export function getWordDbStoreName(): WordDbStoreName {
  return WORDS_STORE;
}

export function openWordDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Failed to open IndexedDB.'));
    };

    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(WORDS_STORE)) {
        db.createObjectStore(WORDS_STORE, { keyPath: 'id' });
      }
    };
  });
}

