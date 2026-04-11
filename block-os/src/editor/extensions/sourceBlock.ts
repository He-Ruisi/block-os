import { Node, mergeAttributes } from '@tiptap/core'
import { blockStore } from '../../storage/blockStore'

/**
 * SourceBlock — 内容与形式分离的核心节点
 *
 * 内容层：source / sourceLabel / blockId / releaseVersion 存在 attrs 中
 * 样式层：CSS 类名 `source-block--{source}` 控制视觉
 * 模板层：导出时根据 source 属性决定处理策略
 *
 * 内容区域（content）是 block+，完全可编辑。
 * 编辑器内容实时同步回 Block.content（debounce 500ms）。
 * hover 时显示操作栏：发布新版本 / 查看版本。
 */
export const SourceBlock = Node.create({
  name: 'sourceBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      source: { default: 'ai' },
      sourceLabel: { default: '' },
      blockId: { default: null },
      releaseVersion: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="source-block"]' }]
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
      0,
    ]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos }) => {
      const source = node.attrs.source || 'ai'
      const label = node.attrs.sourceLabel || (source === 'ai' ? '◆ AI 生成' : '💡 灵感')
      const bId: string | null = node.attrs.blockId

      // ---- DOM 结构 ----
      const dom = document.createElement('div')
      dom.classList.add('source-block', `source-block--${source}`)
      dom.setAttribute('data-type', 'source-block')
      dom.setAttribute('data-source', source)
      if (bId) dom.setAttribute('data-block-id', bId)
      Object.entries(mergeAttributes(HTMLAttributes)).forEach(([k, v]) => {
        if (typeof v === 'string') dom.setAttribute(k, v)
      })

      // 标签行（标签 + 操作栏）
      const headerEl = document.createElement('div')
      headerEl.classList.add('source-block-header')
      headerEl.contentEditable = 'false'

      const labelEl = document.createElement('span')
      labelEl.classList.add('source-block-label')
      labelEl.textContent = label
      headerEl.appendChild(labelEl)

      // 操作栏（hover 时显示）
      if (bId) {
        const toolbar = document.createElement('div')
        toolbar.classList.add('source-block-toolbar')

        // 发布新版本按钮
        const publishBtn = document.createElement('button')
        publishBtn.classList.add('sb-toolbar-btn')
        publishBtn.textContent = '📦 发布版本'
        publishBtn.title = '将当前内容保存为新版本'
        publishBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          showPublishForm(dom, bId, getPos)
        })
        toolbar.appendChild(publishBtn)

        // 查看版本按钮
        const viewBtn = document.createElement('button')
        viewBtn.classList.add('sb-toolbar-btn')
        viewBtn.textContent = '📋 版本'
        viewBtn.title = '在 Block 空间查看所有版本'
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          window.dispatchEvent(new CustomEvent('showBlockInSpace', { detail: bId }))
        })
        toolbar.appendChild(viewBtn)

        headerEl.appendChild(toolbar)
      }

      dom.appendChild(headerEl)

      // 可编辑内容区域
      const contentDOM = document.createElement('div')
      contentDOM.classList.add('source-block-content')
      dom.appendChild(contentDOM)

      // ---- 内容同步回 Block.content（debounce 500ms） ----
      let syncTimer: ReturnType<typeof setTimeout> | null = null

      if (bId) {
        const observer = new MutationObserver(() => {
          if (syncTimer) clearTimeout(syncTimer)
          syncTimer = setTimeout(() => {
            const text = contentDOM.textContent || ''
            if (text.trim()) {
              blockStore.updateBlock(bId, { content: text }).catch(err =>
                console.error('[SourceBlock] Failed to sync content:', err)
              )
            }
          }, 500)
        })
        observer.observe(contentDOM, { childList: true, subtree: true, characterData: true })

        // 清理
        const origDestroy = dom.remove.bind(dom)
        dom.remove = () => {
          observer.disconnect()
          if (syncTimer) clearTimeout(syncTimer)
          origDestroy()
        }
      }

      return { dom, contentDOM }
    }
  },
})

// ---- 发布新版本的 inline 表单 ----
function showPublishForm(
  dom: HTMLElement,
  blockId: string,
  _getPos: (() => number) | boolean
) {
  // 防止重复打开
  if (dom.querySelector('.sb-publish-form')) return

  const contentEl = dom.querySelector('.source-block-content')
  const currentContent = contentEl?.textContent || ''

  const form = document.createElement('div')
  form.classList.add('sb-publish-form')
  form.contentEditable = 'false'

  const input = document.createElement('input')
  input.classList.add('sb-publish-input')
  input.placeholder = '版本标题（如：偏历史叙述语气）'
  input.type = 'text'

  const actions = document.createElement('div')
  actions.classList.add('sb-publish-actions')

  const cancelBtn = document.createElement('button')
  cancelBtn.classList.add('sb-toolbar-btn', 'sb-btn-cancel')
  cancelBtn.textContent = '取消'
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault()
    form.remove()
  })

  const confirmBtn = document.createElement('button')
  confirmBtn.classList.add('sb-toolbar-btn', 'sb-btn-confirm')
  confirmBtn.textContent = '发布'
  confirmBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    const title = input.value.trim()
    if (!title) return

    try {
      // 先同步当前内容到 Block.content
      await blockStore.updateBlock(blockId, { content: currentContent })
      // 然后创建 release
      const release = await blockStore.createRelease(blockId, title)
      // 更新标签显示
      const labelEl = dom.querySelector('.source-block-label')
      if (labelEl) {
        labelEl.textContent = `📦 v${release.version} · ${title}`
      }
      form.remove()
      window.dispatchEvent(new Event('blockUpdated'))
    } catch (err) {
      console.error('[SourceBlock] Failed to create release:', err)
    }
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); confirmBtn.click() }
    if (e.key === 'Escape') { e.preventDefault(); form.remove() }
    e.stopPropagation() // 防止 ProseMirror 拦截按键
  })

  actions.appendChild(cancelBtn)
  actions.appendChild(confirmBtn)
  form.appendChild(input)
  form.appendChild(actions)

  // 插入到 header 和 content 之间
  const header = dom.querySelector('.source-block-header')
  if (header) {
    header.after(form)
  } else {
    dom.insertBefore(form, dom.querySelector('.source-block-content'))
  }

  input.focus()
}
