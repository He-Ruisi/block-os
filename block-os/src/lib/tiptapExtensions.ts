import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { blockStore } from '../storage/blockStore'

// 双向链接 [[]] 扩展
export const BlockLink = Node.create({
  name: 'blockLink',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      blockId: {
        default: null,
      },
      blockTitle: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="block-link"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'block-link',
        class: 'block-link',
      }),
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
      
      // 点击跳转到 Block
      span.addEventListener('click', async (e) => {
        e.preventDefault()
        const blockId = node.attrs.blockId
        if (blockId) {
          // 触发自定义事件，通知应用跳转到 Block
          window.dispatchEvent(new CustomEvent('navigateToBlock', { detail: blockId }))
        }
      })

      return {
        dom: span,
      }
    }
  },
})

// 块引用 (()) 扩展
export const BlockReference = Node.create({
  name: 'blockReference',
  group: 'block',
  content: 'inline*',
  atom: false,

  addAttributes() {
    return {
      blockId: {
        default: null,
      },
      blockContent: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="block-reference"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'block-reference',
        class: 'block-reference',
      }),
      HTMLAttributes.blockContent || '',
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const div = document.createElement('div')
      div.classList.add('block-reference')
      div.setAttribute('data-type', 'block-reference')
      div.setAttribute('data-block-id', node.attrs.blockId)
      
      const content = document.createElement('div')
      content.classList.add('block-reference-content')
      content.textContent = node.attrs.blockContent || '加载中...'
      
      const label = document.createElement('div')
      label.classList.add('block-reference-label')
      label.textContent = `引用: ${node.attrs.blockId.substring(0, 8)}...`
      
      div.appendChild(label)
      div.appendChild(content)

      // 点击跳转到原始 Block
      div.addEventListener('click', (e) => {
        e.preventDefault()
        const blockId = node.attrs.blockId
        if (blockId) {
          window.dispatchEvent(new CustomEvent('navigateToBlock', { detail: blockId }))
        }
      })

      return {
        dom: div,
      }
    }
  },
})

// 自动补全插件（暂未使用，保留供未来扩展）
export function createSuggestionPlugin(
  triggerChar: string,
  _onSearch: (query: string) => Promise<Array<{ id: string; title: string; content: string }>>,
  _onSelect: (item: { id: string; title: string; content: string }, range: { from: number; to: number }) => void
) {
  const pluginKey = new PluginKey(`${triggerChar}-suggestion`)

  return new Plugin({
    key: pluginKey,
    state: {
      init() {
        return {
          active: false,
          range: { from: 0, to: 0 },
          query: '',
          items: [],
        }
      },
      apply(tr, state) {
        // 检测触发字符
        const { selection } = tr
        const { $from } = selection
        const textBefore = $from.parent.textBetween(
          Math.max(0, $from.parentOffset - 20),
          $from.parentOffset,
          null,
          '\ufffc'
        )

        // 检测 [[ 或 ((
        const match = textBefore.match(new RegExp(`\\${triggerChar}\\${triggerChar}([^\\${triggerChar}]*)$`))
        
        if (match) {
          return {
            active: true,
            range: {
              from: $from.pos - match[1].length,
              to: $from.pos,
            },
            query: match[1],
            items: state.items,
          }
        }

        return {
          active: false,
          range: { from: 0, to: 0 },
          query: '',
          items: [],
        }
      },
    },
    props: {
      decorations(state) {
        const pluginState = pluginKey.getState(state)
        if (!pluginState || !pluginState.active) {
          return DecorationSet.empty
        }

        // 创建装饰（高亮触发区域）
        const decorations = [
          Decoration.inline(pluginState.range.from - 2, pluginState.range.to, {
            class: 'suggestion-active',
          }),
        ]

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}

// Block 搜索函数
export async function searchBlocks(query: string) {
  if (!query.trim()) {
    const allBlocks = await blockStore.getAllBlocks()
    return allBlocks.slice(0, 10).map(block => ({
      id: block.id,
      title: block.metadata.title || block.content.substring(0, 50),
      content: block.content,
    }))
  }

  const results = await blockStore.searchBlocks(query)
  return results.slice(0, 10).map(block => ({
    id: block.id,
    title: block.metadata.title || block.content.substring(0, 50),
    content: block.content,
  }))
}
