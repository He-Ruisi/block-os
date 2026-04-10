import { Node, mergeAttributes } from '@tiptap/core'

// 双向链接 [[]] 扩展
export const BlockLink = Node.create({
  name: 'blockLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      blockId: { default: null },
      blockTitle: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="block-link"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-type': 'block-link', class: 'block-link' }),
      `[[${HTMLAttributes.blockTitle || HTMLAttributes.blockId}]]`,
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span')
      span.classList.add('block-link')
      span.setAttribute('data-type', 'block-link')
      span.setAttribute('data-block-id', node.attrs.blockId)
      span.textContent = `[[${node.attrs.blockTitle || node.attrs.blockId}]]`

      span.addEventListener('click', (e) => {
        e.preventDefault()
        if (node.attrs.blockId) {
          window.dispatchEvent(new CustomEvent('navigateToBlock', { detail: node.attrs.blockId }))
        }
      })

      return { dom: span }
    }
  },
})
