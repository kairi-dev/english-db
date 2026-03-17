import { useState, useCallback } from 'react'
import type { Word } from './types/word'
import { useWords } from './hooks/useWords'
import { NewWordRow } from './components/NewWordRow'
import { WordListItem } from './components/WordListItem.tsx'
import './App.css'

const APP_TITLE = 'My English DB'
const SWIPE_ACTION_WIDTH = 176

function App() {
  const { words, addWord, updateWord, deleteWord, moveWordToTop } = useWords()

  const [expandedId, setExpandedId] = useState<Word['id'] | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<Word['id'] | null>(null)
  const [draftNew, setDraftNew] = useState<Word | null>(null)
  const [swipedId, setSwipedId] = useState<Word['id'] | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Word['id'][]>([])

  const filteredEntries = searchQuery.trim()
    ? words.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : words

  const handleToggleExpand = useCallback((id: Word['id']) => {
    setExpandedId((prev) => (prev === id ? null : id))
    setSwipedId(null)
  }, [])

  const handleDelete = useCallback((id: Word['id']) => {
    deleteWord(id)
    setExpandedId((prev) => (prev === id ? null : prev))
    setEditingId((prev) => (prev === id ? null : prev))
    setDraftNew((prev) => (prev?.id === id ? null : prev))
    setSwipedId(null)
  }, [deleteWord])

  const handleMoveToTop = useCallback((id: Word['id']) => {
    moveWordToTop(id)
    setSwipedId(null)
  }, [moveWordToTop])

  const handleStartEdit = useCallback((id: Word['id']) => {
    setEditingId(id)
    setExpandedId(id)
    setSwipedId(null)
  }, [])

  const handleSaveEdit = useCallback(
    (id: Word['id'], title: string, content: string) => {
      updateWord(id, title, content)
      setEditingId(null)
    },
    [updateWord]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleAddNew = useCallback(() => {
    const newWord = addWord()
    setDraftNew(newWord)
    setExpandedId(newWord.id)
    setSearchOpen(false)
  }, [addWord])

  const handleCancelNew = useCallback(() => {
    if (!draftNew) return
    deleteWord(draftNew.id)
    setDraftNew(null)
    setExpandedId(null)
  }, [deleteWord, draftNew])

  const handleNewTitleChange = useCallback(
    (title: string) => {
      if (!draftNew) return
      updateWord(draftNew.id, title, draftNew.content)
      setDraftNew({ ...draftNew, title })
    },
    [draftNew, updateWord]
  )

  const handleNewContentChange = useCallback(
    (content: string) => {
      if (!draftNew) return
      updateWord(draftNew.id, draftNew.title, content)
      setDraftNew({ ...draftNew, content })
    },
    [draftNew, updateWord]
  )

  const handleCompleteNew = useCallback(() => {
    if (!draftNew) return
    setDraftNew(null)
    setExpandedId(null)
  }, [draftNew])

  const handleSwipeStart = useCallback((id: Word['id'], initialOffset: number) => {
    setSwipedId(id)
    setSwipeOffset(initialOffset)
  }, [])

  const handleSwipeMove = useCallback((deltaX: number) => {
    setSwipeOffset((prev) => {
      // 左スワイプ(deltaX < 0)でコンテンツを左(負方向)に動かす
      const next = prev + deltaX
      if (next > 0) return 0
      if (next < -SWIPE_ACTION_WIDTH) return -SWIPE_ACTION_WIDTH
      return next
    })
  }, [])

  const handleSwipeEnd = useCallback(() => {
    setSwipeOffset((prev) => {
      const opened = Math.abs(prev)
      const threshold = SWIPE_ACTION_WIDTH * 0.3
      if (opened >= threshold) {
        return -SWIPE_ACTION_WIDTH
      }
      setSwipedId(null)
      return 0
    })
  }, [])

  const handleSwipeClose = useCallback(() => {
    setSwipeOffset(0)
    setSwipedId(null)
  }, [])

  const handleToggleSelect = useCallback((id: Word['id']) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }, [])

  const handleEnterSelectionMode = useCallback(() => {
    setIsSelectionMode(true)
    setSelectedIds([])
    setSwipedId(null)
    setExpandedId(null)
  }, [])

  const handleExitSelectionMode = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedIds([])
    setSwipedId(null)
  }, [])

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return
    const ok = window.confirm(`選択した${selectedIds.length}件を削除しますか？`)
    if (!ok) return
    selectedIds.forEach((id) => {
      deleteWord(id)
    })
    setSelectedIds([])
    setIsSelectionMode(false)
    setSwipedId(null)
    setExpandedId((prev) => (prev && selectedIds.includes(prev) ? null : prev))
    setEditingId((prev) => (prev && selectedIds.includes(prev) ? null : prev))
  }, [deleteWord, selectedIds])

  return (
    <div className="app">
      <header className="header">
        <button
          type="button"
          className="header-btn icon"
          onClick={() => setSearchOpen((o) => !o)}
          aria-label="Search"
        >
          <SearchIcon />
        </button>
        <h1 className="header-title">{APP_TITLE}</h1>
        {isSelectionMode ? (
          <>
            <button
              type="button"
              className="header-btn text"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
            >
              削除
            </button>
            <button
              type="button"
              className="header-btn text"
              onClick={handleExitSelectionMode}
            >
              キャンセル
            </button>
          </>
        ) : (
          <button
            type="button"
            className="header-btn text"
            onClick={handleEnterSelectionMode}
          >
            選択
          </button>
        )}
      </header>

      {searchOpen && (
        <div className="search-bar">
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>
      )}

      <main className="list-wrap">
        {draftNew && (
          <NewWordRow
            word={draftNew}
            onTitleChange={handleNewTitleChange}
            onContentChange={handleNewContentChange}
            onComplete={handleCompleteNew}
            onCancel={handleCancelNew}
          />
        )}
        {filteredEntries
          .filter((e) => !draftNew || e.id !== draftNew.id)
          .map((entry) => (
            <WordListItem
              key={entry.id}
              word={entry}
              isExpanded={expandedId === entry.id}
              isEditing={editingId === entry.id}
              swipeOffset={swipedId === entry.id ? swipeOffset : 0}
              swipeActionWidth={SWIPE_ACTION_WIDTH}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(entry.id)}
              onToggle={() => handleToggleExpand(entry.id)}
              onDelete={() => handleDelete(entry.id)}
              onMoveToTop={() => handleMoveToTop(entry.id)}
              onStartEdit={() => handleStartEdit(entry.id)}
              onSaveEdit={(title: string, content: string) =>
                handleSaveEdit(entry.id, title, content)
              }
              onCancelEdit={handleCancelEdit}
              onSwipeStart={(initial: number) => handleSwipeStart(entry.id, initial)}
              onSwipeMove={handleSwipeMove}
              onSwipeEnd={handleSwipeEnd}
              onSwipeClose={handleSwipeClose}
              onToggleSelect={() => handleToggleSelect(entry.id)}
            />
          ))}
      </main>

      <button
        type="button"
        className="fab"
        onClick={isSelectionMode ? undefined : handleAddNew}
        disabled={isSelectionMode}
        aria-label="Add"
      >
        +
      </button>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export default App
