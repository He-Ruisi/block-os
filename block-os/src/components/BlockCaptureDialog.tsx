import { useState } from 'react'
import './BlockCaptureDialog.css'

interface BlockCaptureDialogProps {
  content: string
  onCapture: (title: string, tags: string[]) => void
  onCancel: () => void
}

export function BlockCaptureDialog({ content, onCapture, onCancel }: BlockCaptureDialogProps) {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // 添加标签
  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  // 移除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // 处理标签输入框的 Enter 键
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // 处理捕获
  const handleCapture = () => {
    console.log('[BlockCapture] Capture triggered', { title, tags })
    onCapture(title, tags)
  }

  // 处理取消
  const handleCancel = () => {
    console.log('[BlockCapture] Cancel triggered')
    onCancel()
  }

  // 阻止对话框内容区域的点击事件冒泡到 overlay
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog-content" onClick={handleContentClick}>
        {/* 头部 */}
        <div className="dialog-header">
          <h3>捕获为 Block</h3>
          <button
            type="button"
            className="dialog-close"
            onClick={handleCancel}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* 主体 */}
        <div className="dialog-body">
          {/* 标题输入 */}
          <div className="form-group">
            <label htmlFor="block-title">标题（可选）</label>
            <input
              id="block-title"
              type="text"
              className="form-input"
              placeholder="为这个 Block 添加标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 标签输入 */}
          <div className="form-group">
            <label htmlFor="block-tags">标签（可选）</label>
            <div className="tags-container">
              {tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeTag(tag)}
                    aria-label={`移除标签 ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="block-tags"
                type="text"
                className="tag-input"
                placeholder="输入标签后按 Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
            </div>
            {tagInput.trim() && (
              <button
                type="button"
                className="btn-add-tag"
                onClick={addTag}
              >
                + 添加标签
              </button>
            )}
          </div>

          {/* 内容预览 */}
          <div className="form-group">
            <label>内容预览</label>
            <div className="content-preview">
              {content.slice(0, 500)}
              {content.length > 500 && '...'}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="dialog-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCapture}
          >
            捕获
          </button>
        </div>
      </div>
    </div>
  )
}
