import type { Entry, EntryId } from './entry'

// 小さいアプリ向けに、既存の Entry 型をそのまま再利用しつつ
// 名前だけ Word 系で扱えるようにしておく

export type WordId = EntryId

export interface Word extends Entry {}

export const createWordId = () => {
  return `word_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const createEmptyWord = (): Word => {
  const now = Date.now()
  return {
    id: createWordId(),
    title: '',
    content: '',
    createdAt: now,
    updatedAt: now,
  }
}

