import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'
import './MarkdownRenderer.css'

interface MarkdownRendererProps {
  content: string
  theme?: 'default' | 'newsprint'
}

export function MarkdownRenderer({ content, theme = 'default' }: MarkdownRendererProps) {
  // 根据主题选择代码高亮样式
  const codeStyle = theme === 'newsprint' ? oneLight : oneDark

  const components: Components = {
    // 代码块
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      const isInline = !className
      
      return !isInline && language ? (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span className="code-block-language">{language}</span>
            <button
              className="code-block-copy"
              onClick={() => {
                navigator.clipboard.writeText(String(children).replace(/\n$/, ''))
              }}
              title="复制代码"
            >
              复制
            </button>
          </div>
          <SyntaxHighlighter
            style={codeStyle as any}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 var(--border-radius) var(--border-radius)',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="inline-code">
          {children}
        </code>
      )
    },
    
    // 标题
    h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
    h5: ({ children }) => <h5 className="md-h5">{children}</h5>,
    h6: ({ children }) => <h6 className="md-h6">{children}</h6>,
    
    // 段落
    p: ({ children }) => <p className="md-paragraph">{children}</p>,
    
    // 引用
    blockquote: ({ children }) => (
      <blockquote className="md-blockquote">{children}</blockquote>
    ),
    
    // 列表
    ul: ({ children }) => <ul className="md-list md-list-unordered">{children}</ul>,
    ol: ({ children }) => <ol className="md-list md-list-ordered">{children}</ol>,
    li: ({ children }) => <li className="md-list-item">{children}</li>,
    
    // 表格
    table: ({ children }) => (
      <div className="md-table-wrapper">
        <table className="md-table">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="md-table-head">{children}</thead>,
    tbody: ({ children }) => <tbody className="md-table-body">{children}</tbody>,
    tr: ({ children }) => <tr className="md-table-row">{children}</tr>,
    th: ({ children }) => <th className="md-table-header">{children}</th>,
    td: ({ children }) => <td className="md-table-cell">{children}</td>,
    
    // 链接
    a: ({ href, children }) => (
      <a
        className="md-link"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // 分隔线
    hr: () => <hr className="md-divider" />,
    
    // 强调
    strong: ({ children }) => <strong className="md-strong">{children}</strong>,
    em: ({ children }) => <em className="md-em">{children}</em>,
    del: ({ children }) => <del className="md-del">{children}</del>,
  }

  return (
    <div className={`markdown-renderer theme-${theme}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
