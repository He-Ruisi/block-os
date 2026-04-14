import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Zap, Search } from 'lucide-react'
import './ChatInput.css'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
  showDeepThink?: boolean
  showSearch?: boolean
  onToggleDeepThink?: () => void
  onToggleSearch?: () => void
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = '输入消息...',
  showDeepThink,
  showSearch,
  onToggleDeepThink,
  onToggleSearch,
}: ChatInputProps) {
  const [deepThinkActive, setDeepThinkActive] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }

  const handleDeepThinkToggle = () => {
    setDeepThinkActive(!deepThinkActive)
    onToggleDeepThink?.()
  }

  const handleSearchToggle = () => {
    setSearchActive(!searchActive)
    onToggleSearch?.()
  }

  return (
    <div className="chat-input">
      <div className="chat-input__container">
        <div className="chat-input__wrapper">
          {/* 功能按钮组 */}
          <div className="chat-input__features">
            {showDeepThink && (
              <button
                className={`chat-input__feature-btn ${deepThinkActive ? 'chat-input__feature-btn--active' : ''}`}
                onClick={handleDeepThinkToggle}
                title="深度思考"
              >
                <Zap size={14} />
                <span>DeepThink</span>
              </button>
            )}
            {showSearch && (
              <button
                className={`chat-input__feature-btn ${searchActive ? 'chat-input__feature-btn--active' : ''}`}
                onClick={handleSearchToggle}
                title="搜索"
              >
                <Search size={14} />
                <span>Search</span>
              </button>
            )}
          </div>

          {/* 输入框 */}
          <div className="chat-input__input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input__textarea"
              placeholder={placeholder}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={1}
            />
            <div className="chat-input__actions">
              <button
                className="chat-input__action-btn"
                title="附件"
              >
                <Paperclip size={18} />
              </button>
              <button
                className="chat-input__send-btn"
                onClick={onSend}
                disabled={disabled || !value.trim()}
                title="发送"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 底部说明文字 */}
        <div className="chat-input__footer">
          BlockOS AI 可能会出错，请核实重要信息
        </div>
      </div>
    </div>
  )
}
