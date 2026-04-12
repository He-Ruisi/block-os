// Markdown 文本转 TipTap 兼容 HTML
export function markdownToHtml(content: string): string {
  const lines = content.split('\n')
  const htmlParts: string[] = []

  let inList = false
  let listType = ''
  let listItems: string[] = []

  const flushList = () => {
    if (inList && listItems.length > 0) {
      const items = listItems.map(item => `<li><p>${item}</p></li>`).join('')
      htmlParts.push(listType === 'ul' ? `<ul>${items}</ul>` : `<ol>${items}</ol>`)
      listItems = []
      inList = false
    }
  }

  lines.forEach((line) => {
    if (!line.trim()) {
      flushList()
      htmlParts.push('<p></p>')
      return
    }

    // 标题
    if (line.match(/^#{1,6}\s/)) {
      flushList()
      const level = line.match(/^(#{1,6})/)?.[1].length || 1
      const text = line.replace(/^#{1,6}\s+/, '')
      htmlParts.push(`<h${level}>${text}</h${level}>`)
    }
    // 无序列表
    else if (line.match(/^[-*]\s+/)) {
      const text = line.replace(/^[-*]\s+/, '')
      if (!inList || listType !== 'ul') {
        flushList()
        inList = true
        listType = 'ul'
      }
      listItems.push(text)
    }
    // 有序列表
    else if (line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^\d+\.\s+/, '')
      if (!inList || listType !== 'ol') {
        flushList()
        inList = true
        listType = 'ol'
      }
      listItems.push(text)
    }
    // 普通段落
    else {
      flushList()
      let html = line
      // 加粗 **text**
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 斜体 *text*（不匹配 **）
      html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      // 行内代码 `code`
      html = html.replace(/`(.+?)`/g, '<code>$1</code>')
      htmlParts.push(`<p>${html}</p>`)
    }
  })

  // 处理末尾未关闭的列表
  flushList()

  return htmlParts.join('')
}
