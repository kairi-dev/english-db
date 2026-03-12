import type { Word } from '../types/word'
import type { Entry } from '../types/entry'

const STORAGE_KEY = 'my_english_db_entries_v1'

// 既存ストレージ形式(Entry[])をそのまま使いつつ、Word[]として扱う軽量ラッパ

export function loadWords(): Word[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is Entry =>
        e &&
        typeof e === 'object' &&
        typeof e.id === 'string' &&
        typeof e.title === 'string' &&
        typeof e.content === 'string' &&
        typeof e.createdAt === 'number' &&
        typeof e.updatedAt === 'number'
    ) as Word[]
  } catch {
    return []
  }
}

export function saveWords(words: Word[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words))
}

