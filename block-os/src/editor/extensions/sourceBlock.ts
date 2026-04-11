import { Node, mergeAttributes } from '@tiptap/core'

/**
 * SourceBlock — 内容与形式分离的核心节点
 *
 * 内容层：source / sourceLabel 存在 attrs 中（不可见的元数据）
 * 样式层：CSS 类名 `source-block--{source}` 控制视觉，可被主题切换
 * 模板层：导出时根据 source 属性决定处理策略（融入正文/保留引用/移除）
 *
 * 内容区域（content）是 block+，完全可编辑。
 */
export const SourceBlock = Node.create({
  name: 'sourceBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      // 内容层：来源类型（ai / inspiration / user）
      source: { default: 'ai' },
      // 内容层：来源标签文字（仅用于显示，不影响语义）
      sourceLabel: { default: '' },
    }
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="source-block"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const source = HTMLAttributes.source || 'ai'
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'source-block',
        'data-source': source,
        class: `source-block source-block--${source}`,
      }),
      0, // 0 = "render content here"（可编辑区域）
    ]
  },

  addNodeView() {
    return ({ node, HTMLAttributes }) => {
      const source = node.attrs.source || 'ai'
      const label = node.attrs.sourceLabel || (source === 'ai' ? '◆ AI 生成' : '💡 灵感')

      // 外层容器
      const dom = document.createElement('div')
      dom.classList.add('source-block', `source-block--${source}`)
      dom.setAttribute('data-type', 'source-block')
      dom.setAttribute('data-source', source)
      Object.entries(mergeAttributes(HTMLAttributes)).forEach(([k, v]) => {
        if (typeof v === 'string') dom.setAttribute(k, v)
      })

      // 标签（不可编辑的元数据展示）
      const labelEl = document.createElement('div')
      labelEl.classList.add('source-block-label')
      labelEl.contentEditable = 'false'
      labelEl.textContent = label
      dom.appendChild(labelEl)

      // 可编辑内容区域
      const contentDOM = document.createElement('div')
      contentDOM.classList.add('source-block-content')
      dom.appendChild(contentDOM)

      return { dom, contentDOM }
    }
  },
})
