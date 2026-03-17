import type { Word } from '../types/word';
import { openWordDb, getWordDbStoreName } from './db';

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => T | Promise<T>,
): Promise<T> {
  const db = await openWordDb();
  const tx = db.transaction(getWordDbStoreName(), mode);
  const store = tx.objectStore(getWordDbStoreName());

  const result = await fn(store);

  return new Promise<T>((resolve, reject) => {
    tx.oncomplete = () => {
      resolve(result);
    };
    tx.onerror = () => {
      reject(tx.error ?? new Error('IndexedDB transaction failed.'));
    };
    tx.onabort = () => {
      reject(tx.error ?? new Error('IndexedDB transaction aborted.'));
    };
  });
}

export async function getAllWordsFromDb(): Promise<Word[]> {
  return withStore('readonly', (store) => {
    return new Promise<Word[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve((request.result ?? []) as Word[]);
      };
      request.onerror = () => {
        reject(request.error ?? new Error('Failed to read words from IndexedDB.'));
      };
    });
  });
}

export async function replaceAllWordsInDb(words: Word[]): Promise<void> {
  await withStore('readwrite', async (store) => {
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => {
        reject(clearRequest.error ?? new Error('Failed to clear words store.'));
      };
    });

    await Promise.all(
      words.map(
        (word) =>
          new Promise<void>((resolve, reject) => {
            const putRequest = store.put(word);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => {
              reject(putRequest.error ?? new Error('Failed to write word to IndexedDB.'));
            };
          }),
      ),
    );
  });
}

