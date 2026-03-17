import { useEffect, useState, useCallback } from 'react'
import type { Word } from '../types/word'
import { createEmptyWord } from '../types/word'
import { runMigrationAndLoadWords } from '../storage/migration'
import { replaceAllWordsInDb } from '../storage/wordDb'

interface UseWordsResult {
  words: Word[]
  addWord: () => Word
  updateWord: (id: Word['id'], title: string, content: string) => void
  deleteWord: (id: Word['id']) => void
  moveWordToTop: (id: Word['id']) => void
}

export function useWords(): UseWordsResult {
  const [words, setWords] = useState<Word[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const loaded = await runMigrationAndLoadWords()
      if (cancelled) return
      setWords(loaded)
      setInitialized(true)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!initialized) return
    replaceAllWordsInDb(words).catch(() => {
      // ignore persistence errors; UI state remains in memory
    })
  }, [words, initialized])

  const addWord = useCallback(() => {
    const newWord = createEmptyWord()
    setWords((prev) => [newWord, ...prev])
    return newWord
  }, [])

  const updateWord = useCallback(
    (id: Word['id'], title: string, content: string) => {
      const now = Date.now()
      setWords((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, title, content, updatedAt: now } : w
        )
      )
    },
    []
  )

  const deleteWord = useCallback((id: Word['id']) => {
    setWords((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const moveWordToTop = useCallback((id: Word['id']) => {
    setWords((prev) => {
      const index = prev.findIndex((w) => w.id === id)
      if (index <= 0) return prev
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.unshift(item)
      return next
    })
  }, [])

  return { words, addWord, updateWord, deleteWord, moveWordToTop }
}

