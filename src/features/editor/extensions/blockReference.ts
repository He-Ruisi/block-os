import { Node, mergeAttributes } from '@tiptap/core'

// 块引用 (()) 扩展
export const BlockReference = Node.create({
  name: 'blockReference',
  group: 'block',
  content: 'inline*',
  atom: false,

  addAttributes() {
    return {
      blockId: { default: null },
      blockContent: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="block-reference"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'block-reference', class: 'block-reference' }),
      HTMLAttributes.blockContent || '',
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const div = document.createElement('div')
      div.classList.add('block-reference')
      div.setAttribute('data-type', 'block-reference')
      div.setAttribute('data-block-id', node.attrs.blockId)

      const label = document.createElement('div')
      label.classList.add('block-reference-label')
      label.textContent = `引用: ${node.attrs.blockId.substring(0, 8)}...`

      const content = document.createElement('div')
      content.classList.add('block-reference-content')
      content.textContent = node.attrs.blockContent || '加载中...'

      div.appendChild(label)
      div.appendChild(content)

      div.addEventListener('click', (e) => {
        e.preventDefault()
        if (node.attrs.blockId) {
          window.dispatchEvent(new CustomEvent('navigateToBlock', { detail: node.attrs.blockId }))
        }
      })

      return { dom: div }
    }
  },
})
