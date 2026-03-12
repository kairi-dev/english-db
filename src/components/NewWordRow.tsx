import type { Word } from '../types/word'

interface NewWordRowProps {
  word: Word
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onComplete: () => void
}

export function NewWordRow({
  word,
  onTitleChange,
  onContentChange,
  onComplete,
}: NewWordRowProps) {
  return (
    <div className="list-item new-draft">
      <div className="list-item-main">
        <div className="list-item-row">
          <input
            type="text"
            className="list-item-title-input"
            value={word.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Title"
          />
        </div>
        <div className="list-item-content-wrap">
          <textarea
            className="list-item-content-input"
            value={word.content}
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

