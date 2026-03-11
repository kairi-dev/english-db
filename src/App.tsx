import { useState, useEffect, useCallback, useRef } from 'react'
import { loadEntries, saveEntries } from './storage/entryStorage'
import type { Entry } from './types/entry'
import { createEmptyEntry } from './types/entry'
import './App.css'

const APP_TITLE = 'My English DB'
const SWIPE_ACTION_WIDTH = 140

function App() {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries())
  const [expandedId, setExpandedId] = useState<Entry['id'] | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<Entry['id'] | null>(null)
  const [draftNew, setDraftNew] = useState<Entry | null>(null)
  const [swipedId, setSwipedId] = useState<Entry['id'] | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const filteredEntries = searchQuery.trim()
    ? entries.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : entries

  const handleToggleExpand = useCallback((id: Entry['id']) => {
    setExpandedId((prev) => (prev === id ? null : id))
    setSwipedId(null)
  }, [])

  const handleDelete = useCallback((id: Entry['id']) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setExpandedId((prev) => (prev === id ? null : prev))
    setEditingId((prev) => (prev === id ? null : prev))
    setDraftNew((prev) => (prev?.id === id ? null : prev))
    setSwipedId(null)
  }, [])

  const handleMoveToTop = useCallback((id: Entry['id']) => {
    setEntries((prev) => {
      const i = prev.findIndex((e) => e.id === id)
      if (i <= 0) return prev
      const next = [...prev]
      const [item] = next.splice(i, 1)
      next.unshift(item)
      return next
    })
    setSwipedId(null)
  }, [])

  const handleStartEdit = useCallback((id: Entry['id']) => {
    setEditingId(id)
    setExpandedId(id)
    setSwipedId(null)
  }, [])

  const handleSaveEdit = useCallback(
    (id: Entry['id'], title: string, content: string) => {
      const now = Date.now()
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, title, content, updatedAt: now }
            : e
        )
      )
      setEditingId(null)
    },
    []
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const handleAddNew = useCallback(() => {
    const newEntry = createEmptyEntry()
    setEntries((prev) => [newEntry, ...prev])
    setDraftNew(newEntry)
    setExpandedId(newEntry.id)
    setSearchOpen(false)
  }, [])

  const handleCompleteNew = useCallback(() => {
    if (!draftNew) return
    setDraftNew(null)
    setExpandedId(null)
  }, [draftNew])

  const handleSwipeStart = useCallback((id: Entry['id'], initialOffset: number) => {
    setSwipedId(id)
    setSwipeOffset(initialOffset)
  }, [])

  const handleSwipeMove = useCallback((deltaX: number) => {
    setSwipeOffset((prev) => Math.max(0, Math.min(SWIPE_ACTION_WIDTH, prev + deltaX)))
  }, [])

  const handleSwipeEnd = useCallback(() => {
    setSwipeOffset(0)
    setSwipedId(null)
  }, [])

  const handleSwipeReveal = useCallback((id: Entry['id']) => {
    setSwipedId(id)
    setSwipeOffset(SWIPE_ACTION_WIDTH)
  }, [])

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
        <div className="header-spacer" />
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
          <NewEntryRow
            entry={entries.find((e) => e.id === draftNew.id) ?? draftNew}
            onTitleChange={(title) =>
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === draftNew.id ? { ...e, title } : e
                )
              )
            }
            onContentChange={(content) =>
              setEntries((prev) =>
                prev.map((e) =>
                  e.id === draftNew.id ? { ...e, content } : e
                )
              )
            }
            onComplete={handleCompleteNew}
          />
        )}
        {filteredEntries
          .filter((e) => !draftNew || e.id !== draftNew.id)
          .map((entry) => (
            <ListItem
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              isEditing={editingId === entry.id}
              swipeReveal={swipedId === entry.id ? swipeOffset : 0}
              onToggle={() => handleToggleExpand(entry.id)}
              onDelete={() => handleDelete(entry.id)}
              onMoveToTop={() => handleMoveToTop(entry.id)}
              onStartEdit={() => handleStartEdit(entry.id)}
              onSaveEdit={(title, content) =>
                handleSaveEdit(entry.id, title, content)
              }
              onCancelEdit={handleCancelEdit}
              onSwipeStart={(initial) => handleSwipeStart(entry.id, initial)}
              onSwipeMove={handleSwipeMove}
              onSwipeEnd={handleSwipeEnd}
              onSwipeReveal={() => handleSwipeReveal(entry.id)}
            />
          ))}
      </main>

      <button
        type="button"
        className="fab"
        onClick={handleAddNew}
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

interface NewEntryRowProps {
  entry: Entry
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onComplete: () => void
}

function NewEntryRow({
  entry,
  onTitleChange,
  onContentChange,
  onComplete,
}: NewEntryRowProps) {
  return (
    <div className="list-item new-draft">
      <div className="list-item-main">
        <div className="list-item-row">
          <input
            type="text"
            className="list-item-title-input"
            value={entry.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
          />
        </div>
        <div className="list-item-content-wrap">
          <textarea
            className="list-item-content-input"
            value={entry.content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Description"
            rows={3}
          />
          <button type="button" className="btn-done" onClick={onComplete}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

interface ListItemProps {
  entry: Entry
  isExpanded: boolean
  isEditing: boolean
  swipeReveal: number
  onToggle: () => void
  onDelete: () => void
  onMoveToTop: () => void
  onStartEdit: () => void
  onSaveEdit: (title: string, content: string) => void
  onCancelEdit: () => void
  onSwipeStart: (initialOffset: number) => void
  onSwipeMove: (deltaX: number) => void
  onSwipeEnd: () => void
  onSwipeReveal: () => void
}

function ListItem({
  entry,
  isExpanded,
  isEditing,
  swipeReveal,
  onToggle,
  onDelete,
  onMoveToTop,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onSwipeReveal,
}: ListItemProps) {
  const [editTitle, setEditTitle] = useState(entry.title)
  const [editContent, setEditContent] = useState(entry.content)
  const touchStartX = useRef(0)
  const lastX = useRef(0)

  useEffect(() => {
    setEditTitle(entry.title)
    setEditContent(entry.content)
  }, [entry.title, entry.content, isEditing])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    lastX.current = e.touches[0].clientX
    onSwipeStart(swipeReveal)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX
    const delta = x - lastX.current
    lastX.current = x
    onSwipeMove(delta)
  }

  const handleTouchEnd = () => {
    onSwipeEnd()
  }

  const handleSave = () => {
    onSaveEdit(editTitle, editContent)
  }

  if (isEditing) {
    return (
      <div className="list-item editing">
        <div className="list-item-main">
          <div className="list-item-row">
            <input
              type="text"
              className="list-item-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
          <div className="list-item-content-wrap">
            <textarea
              className="list-item-content-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="edit-actions">
              <button type="button" className="btn-cancel" onClick={onCancelEdit}>
                Cancel
              </button>
              <button type="button" className="btn-save" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="list-item swipe-wrap"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="swipe-actions">
        <button type="button" className="swipe-btn edit" onClick={onStartEdit}>
          Edit
        </button>
        <button type="button" className="swipe-btn top" onClick={onMoveToTop}>
          Move to top
        </button>
        <button type="button" className="swipe-btn delete" onClick={onDelete}>
          Delete
        </button>
      </div>
      <div
        className="list-item-main swipe-content"
        style={{ transform: `translateX(${swipeReveal}px)` }}
        onClick={() => {
          if (swipeReveal > 0) onSwipeReveal()
          else onToggle()
        }}
      >
        <div className="list-item-row">
          <span className="list-item-title">
            {entry.title || '(No title)'}
          </span>
        </div>
        {isExpanded && (
          <div className="list-item-content-wrap">
            <div className="list-item-content">
              {entry.content || '(No content)'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
