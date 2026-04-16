import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Extension } from '@tiptap/core'
import type { EditorState, Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'

// ============================================================
// Inline AI Plugin — 管理改写/翻译的临时态 Decoration
// 以及全局并发控制（同一时间只允许一个 inline AI 操作）
// ============================================================

export interface InlineAIState {
  /** 当前活跃操作的类型 */
  mode: 'rewrite' | 'shorten' | 'expand' | 'translate' | null
  /** 原文的位置范围 */
  from: number
  to: number
  /** AI 流式输出的当前内容（实时更新） */
  aiContent: string
  /** 是否正在流式输出 */
  streaming: boolean
  /** AbortController，用于取消请求 */
  abortController: AbortController | null
}

const EMPTY_STATE: InlineAIState = {
  mode: null,
  from: 0,
  to: 0,
  aiContent: '',
  streaming: false,
  abortController: null,
}

export const inlineAIPluginKey = new PluginKey<InlineAIState>('inlineAI')

/** 开始一个 replace 操作 */
export function startInlineAIReplace(
  view: EditorView,
  from: number,
  to: number,
  mode: InlineAIState['mode'],
  abortController: AbortController
): void {
  view.dispatch(
    view.state.tr.setMeta(inlineAIPluginKey, {
      type: 'start',
      from,
      to,
      mode,
      abortController,
    })
  )
}

/** 更新流式内容 */
export function updateInlineAIContent(view: EditorView, content: string): void {
  view.dispatch(
    view.state.tr.setMeta(inlineAIPluginKey, { type: 'update', content })
  )
}

/** 确认替换：用 AI 内容替换原文 */
export function confirmInlineAIReplace(view: EditorView): void {
  const state = inlineAIPluginKey.getState(view.state)
  if (!state?.mode) return

  const { from, to, aiContent } = state
  view.dispatch(
    view.state.tr
      .replaceWith(from, to, view.state.schema.text(aiContent))
      .setMeta(inlineAIPluginKey, { type: 'clear' })
  )
}

/** 丢弃：清除 Decoration，原文恢复 */
export function discardInlineAIReplace(view: EditorView): void {
  const state = inlineAIPluginKey.getState(view.state)
  state?.abortController?.abort()
  view.dispatch(
    view.state.tr.setMeta(inlineAIPluginKey, { type: 'clear' })
  )
}

/** 取消当前活跃操作（开始新操作前调用） */
export function cancelActiveInlineAI(view: EditorView): void {
  const state = inlineAIPluginKey.getState(view.state)
  if (state?.mode) {
    state.abortController?.abort()
    view.dispatch(
      view.state.tr.setMeta(inlineAIPluginKey, { type: 'clear' })
    )
  }
}

/** 是否有活跃的 inline AI 操作 */
export function hasActiveInlineAI(editorState: EditorState): boolean {
  const state = inlineAIPluginKey.getState(editorState)
  return state?.mode !== null
}

// ---- Plugin 定义 ----

export function createInlineAIPlugin(): Extension {
  const plugin = new Plugin<InlineAIState>({
    key: inlineAIPluginKey,

    state: {
      init(): InlineAIState {
        return { ...EMPTY_STATE }
      },

      apply(tr: Transaction, prev: InlineAIState): InlineAIState {
        const meta = tr.getMeta(inlineAIPluginKey)
        if (!meta) return prev

        switch (meta.type) {
          case 'start':
            return {
              mode: meta.mode,
              from: meta.from,
              to: meta.to,
              aiContent: '',
              streaming: true,
              abortController: meta.abortController,
            }
          case 'update':
            return { ...prev, aiContent: meta.content }
          case 'clear':
            return { ...EMPTY_STATE }
          default:
            return prev
        }
      },
    },

    props: {
      decorations(state: EditorState): DecorationSet {
        const pluginState = inlineAIPluginKey.getState(state)
        if (!pluginState?.mode) return DecorationSet.empty

        const { from, to, aiContent, streaming } = pluginState
        const decorations: Decoration[] = []

        decorations.push(Decoration.inline(from, to, { class: 'inline-ai-original' }))

        const previewWidget = Decoration.widget(to, () => {
          const wrap = document.createElement('span')
          wrap.className = `inline-ai-preview${streaming ? ' inline-ai-preview--streaming' : ''}`

          const text = document.createElement('span')
          text.className = 'inline-ai-preview-text'
          text.textContent = aiContent || '...'
          wrap.appendChild(text)

          if (!streaming && aiContent) {
            const actions = document.createElement('span')
            actions.className = 'inline-ai-actions'
            actions.contentEditable = 'false'

            const confirmBtn = document.createElement('button')
            confirmBtn.className = 'inline-ai-btn inline-ai-btn--confirm'
            confirmBtn.textContent = '替换'
            confirmBtn.type = 'button'
            confirmBtn.addEventListener('mousedown', (e) => {
              e.preventDefault()
              wrap.dispatchEvent(new CustomEvent('inlineAIConfirm', { bubbles: true }))
            })

            const discardBtn = document.createElement('button')
            discardBtn.className = 'inline-ai-btn inline-ai-btn--discard'
            discardBtn.textContent = '丢弃'
            discardBtn.type = 'button'
            discardBtn.addEventListener('mousedown', (e) => {
              e.preventDefault()
              wrap.dispatchEvent(new CustomEvent('inlineAIDiscard', { bubbles: true }))
            })

            actions.appendChild(confirmBtn)
            actions.appendChild(discardBtn)
            wrap.appendChild(actions)
          }

          return wrap
        }, { side: 1 })

        decorations.push(previewWidget)
        return DecorationSet.create(state.doc, decorations)
      },
    },
  })

  return Extension.create({
    name: 'inlineAI',
    addProseMirrorPlugins() {
      return [plugin]
    },
  })
}
