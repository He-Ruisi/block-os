import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

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
        <div className="my-4 overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{language}</span>
            <button
              className="rounded border border-border bg-transparent px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-ring hover:bg-accent hover:text-foreground"
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
              borderRadius: '0 0 var(--radius) var(--radius)',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="rounded border border-border bg-accent px-1.5 py-0.5 font-mono text-[0.9em] text-red-600">
          {children}
        </code>
      )
    },
    
    // 标题
    h1: ({ children }) => <h1 className="mb-4 mt-6 border-b-2 border-border pb-2 text-[28px] font-bold leading-tight text-foreground">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-3 mt-5 text-2xl font-bold leading-tight text-foreground">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-2.5 mt-4 text-xl font-semibold leading-snug text-foreground">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-2 mt-3.5 text-lg font-semibold leading-snug text-foreground">{children}</h4>,
    h5: ({ children }) => <h5 className="mb-1.5 mt-3 text-base font-semibold leading-normal text-foreground">{children}</h5>,
    h6: ({ children }) => <h6 className="mb-1.5 mt-2.5 text-sm font-semibold leading-normal text-muted-foreground">{children}</h6>,
    
    // 段落
    p: ({ children }) => <p className="my-3 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
    
    // 引用
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-purple-600 bg-purple-50 px-4 py-3 italic text-foreground">{children}</blockquote>
    ),
    
    // 列表
    ul: ({ children }) => <ul className="my-3 list-disc pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="my-3 list-decimal pl-6">{children}</ol>,
    li: ({ children }) => <li className="my-1.5 leading-relaxed">{children}</li>,
    
    // 表格
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="hover:bg-muted">{children}</tr>,
    th: ({ children }) => <th className="border-b-2 border-border px-3 py-2.5 text-left font-semibold text-foreground">{children}</th>,
    td: ({ children }) => <td className="border-b border-border px-3 py-2.5 text-foreground last:border-b-0">{children}</td>,
    
    // 链接
    a: ({ href, children }) => (
      <a
        className="border-b border-transparent text-purple-600 no-underline transition-colors hover:border-purple-600"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // 分隔线
    hr: () => <hr className="my-6 border-0 border-t-2 border-border" />,
    
    // 强调
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => <del className="text-muted-foreground line-through">{children}</del>,
  }

  return (
    <div className={`text-[15px] leading-relaxed text-foreground break-words ${theme === 'newsprint' ? 'font-serif' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
