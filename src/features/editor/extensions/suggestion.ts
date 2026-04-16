import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { blockStore } from '@/storage/blockStore'

export interface SuggestionItem {
  id: string
  title: string
  content: string
}

// Block 搜索函数
export async function searchBlocks(query: string): Promise<SuggestionItem[]> {
  const blocks = query.trim()
    ? await blockStore.searchBlocks(query)
    : await blockStore.getAllBlocks()

  return blocks.slice(0, 10).map(block => ({
    id: block.id,
    title: block.metadata.title || block.content.substring(0, 50),
    content: block.content,
  }))
}

// 自动补全插件（供未来扩展使用）
export function createSuggestionPlugin(
  triggerChar: string,
  _onSearch: (query: string) => Promise<SuggestionItem[]>,
  _onSelect: (item: SuggestionItem, range: { from: number; to: number }) => void
) {
  const pluginKey = new PluginKey(`${triggerChar}-suggestion`)

  return new Plugin({
    key: pluginKey,
    state: {
      init() {
        return { active: false, range: { from: 0, to: 0 }, query: '', items: [] as SuggestionItem[] }
      },
      apply(tr, state) {
        const { $from } = tr.selection
        const textBefore = $from.parent.textBetween(
          Math.max(0, $from.parentOffset - 20),
          $from.parentOffset,
          null,
          '\ufffc'
        )
        const match = textBefore.match(new RegExp(`\\${triggerChar}\\${triggerChar}([^\\${triggerChar}]*)$`))

        if (match) {
          return {
            active: true,
            range: { from: $from.pos - match[1].length, to: $from.pos },
            query: match[1],
            items: state.items,
          }
        }
        return { active: false, range: { from: 0, to: 0 }, query: '', items: [] }
      },
    },
    props: {
      decorations(state) {
        const pluginState = pluginKey.getState(state)
        if (!pluginState?.active) return DecorationSet.empty
        return DecorationSet.create(state.doc, [
          Decoration.inline(pluginState.range.from - 2, pluginState.range.to, {
            class: 'suggestion-active',
          }),
        ])
      },
    },
  })
}
