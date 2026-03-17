import { useEffect, useRef, useState } from 'react'
import type { Word } from '../types/word'
import { EditIcon } from './icons/EditIcon'
import { MoveTopIcon } from './icons/MoveTopIcon'
import { DeleteIcon } from './icons/DeleteIcon'

interface WordListItemProps {
  word: Word
  isExpanded: boolean
  isEditing: boolean
  swipeOffset: number
  swipeActionWidth: number
  onToggle: () => void
  onDelete: () => void
  onMoveToTop: () => void
  onStartEdit: () => void
  onSaveEdit: (title: string, content: string) => void
  onCancelEdit: () => void
  onSwipeStart: (initialOffset: number) => void
  onSwipeMove: (deltaX: number) => void
  onSwipeEnd: () => void
  onSwipeClose: () => void
}

export function WordListItem({
  word,
  isExpanded,
  isEditing,
  swipeOffset,
  swipeActionWidth,
  onToggle,
  onDelete,
  onMoveToTop,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd,
  onSwipeClose,
}: WordListItemProps) {
  const [editTitle, setEditTitle] = useState(word.title)
  const [editContent, setEditContent] = useState(word.content)
  const [isSwipeDragging, setIsSwipeDragging] = useState(false)
  const touchStartX = useRef(0)
  const lastX = useRef(0)
  const opened = swipeOffset < 0
  const revealed = -swipeOffset
  const ACTION_BTN_W = 56
  const ACTION_GAP = 4
  const fixedNonDeleteW = ACTION_BTN_W * 2 + ACTION_GAP * 2
  const maxStripW = swipeActionWidth + fixedNonDeleteW + 24
  const stripW = Math.min(maxStripW, Math.max(swipeActionWidth, revealed))
  const deleteWidth = Math.max(ACTION_BTN_W, stripW - fixedNonDeleteW)

  // opacity: 0→1 as each action becomes fully available
  const segment = swipeActionWidth / 3
  const opacityEdit = Math.min(1, Math.max(0, revealed / segment))
  const opacityTop = Math.min(1, Math.max(0, (revealed - segment) / segment))
  const opacityDelete = Math.min(1, Math.max(0, (revealed - 2 * segment) / segment))

  useEffect(() => {
    setEditTitle(word.title)
    setEditContent(word.content)
  }, [word.title, word.content, isEditing])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    lastX.current = e.touches[0].clientX
    setIsSwipeDragging(true)
    onSwipeStart(swipeOffset)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX
    const delta = x - lastX.current
    lastX.current = x
    onSwipeMove(delta)
  }

  const handleTouchEnd = () => {
    setIsSwipeDragging(false)
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
      {/* Notion式: 右端に固定のボタン帯。コンテンツが左スライドすると下から見える */}
      <div
        className={`swipe-actions-strip${opened ? ' swipe-actions-strip--visible' : ''}`}
        style={{ width: stripW }}
        aria-hidden={!opened}
      >
        <button
          type="button"
          className="word-action-btn edit"
          style={{ opacity: opacityEdit, width: ACTION_BTN_W, flex: `0 0 ${ACTION_BTN_W}px` }}
          onClick={(e) => {
            e.stopPropagation()
            onStartEdit()
          }}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="word-action-btn top"
          style={{ opacity: opacityTop, width: ACTION_BTN_W, flex: `0 0 ${ACTION_BTN_W}px` }}
          onClick={(e) => {
            e.stopPropagation()
            onMoveToTop()
          }}
        >
          <MoveTopIcon />
        </button>
        <button
          type="button"
          className="word-action-btn delete"
          style={{ opacity: opacityDelete, width: deleteWidth, flex: `0 0 ${deleteWidth}px` }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <DeleteIcon />
        </button>
      </div>
      <div
        className={`list-item-main swipe-content${opened ? ' swipe-content--opened' : ''}${isSwipeDragging ? ' swipe-content--dragging' : ''}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={() => {
          if (opened) {
            onSwipeClose()
          } else {
            onToggle()
          }
        }}
      >
        <div className="list-item-row list-item-row-main">
          <span className="list-item-title">
            {word.title || '(No title)'}
          </span>
        </div>
        {isExpanded && (
          <div className="list-item-content-wrap">
            <div className="list-item-content">
              {word.content || '(No content)'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

