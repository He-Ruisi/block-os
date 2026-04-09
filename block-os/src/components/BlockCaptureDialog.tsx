import { useState } from 'react'
import './BlockCaptureDialog.css'

interface BlockCaptureDialogProps {
  content: string
  onCapture: (title: string, tags: string[]) => void
  onCancel: () => void
}

export function BlockCaptureDialog({ content, onCapture, onCancel }: BlockCaptureDialogProps) {
  const [title, setTitle] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleCapture = () => {
    console.log('handleCapture called', { title, tags })
    onCapture(title, tags)
  }

  const handleCaptureClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Capture button clicked', { title, tags })
    handleCapture()
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>捕获为 Block</h3>
          <button className="dialog-close" onClick={onCancel}>×</button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>标题（可选）</label>
            <input
              type="text"
              className="form-input"
              placeholder="为这个 Block 添加标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>标签</label>
            <div className="tags-container">
              {tags.map(tag => (
                <span key={tag} className="tag">
                  #{tag}
                  <button 
                    className="tag-remove"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="tag-input"
                placeholder="添加标签..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {tagInput.trim() && (
              <button 
                type="button"
                className="btn-add-tag"
                onClick={handleAddTag}
              >
                + 添加标签
              </button>
            )}
          </div>

          <div className="form-group">
            <label>预览</label>
            <div className="content-preview">
              {content}
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button 
            type="button"
            className="btn-secondary" 
            onClick={onCancel}
          >
            取消
          </button>
          <button 
            type="button"
            className="btn-primary" 
            onClick={handleCaptureClick}
          >
            捕获
          </button>
        </div>
      </div>
    </div>
  )
}
