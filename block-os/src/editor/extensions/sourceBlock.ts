import { Node, mergeAttributes } from '@tiptap/core'
import { blockStore } from '../../storage/blockStore'

/**
 * SourceBlock — 内容与形式分离的核心节点
 *
 * attrs: source, sourceLabel, blockId, releaseVersion
 * 内容区域 block+，完全可编辑
 * 编辑器内容实时同步回 Block.content（debounce 500ms）
 * hover 操作栏：发布新版本 / 查看版本
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
    return [{
      tag: 'div[data-type="source-block"]',
      getAttrs: (el) => {
        const dom = el as HTMLElement
        return {
          source: dom.getAttribute('data-source') || 'ai',
          sourceLabel: dom.getAttribute('data-source-label') || '',
          blockId: dom.getAttribute('data-block-id') || null,
          releaseVersion: dom.getAttribute('data-release-version') ? Number(dom.getAttribute('data-release-version')) : null,
        }
      },
    }]
  },

  renderHTML({ HTMLAttributes }) {
    const source = HTMLAttributes.source || 'ai'
    return [
      'div',
      mergeAttributes({
        'data-type': 'source-block',
        'data-source': source,
        'data-source-label': HTMLAttributes.sourceLabel || '',
        'data-block-id': HTMLAttributes.blockId || '',
        'data-release-version': HTMLAttributes.releaseVersion != null ? String(HTMLAttributes.releaseVersion) : '',
        class: `source-block source-block--${source}`,
      }),
      0,
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const source = node.attrs.source || 'ai'
      const label = node.attrs.sourceLabel || (source === 'ai' ? '◆ AI 生成' : '💡 灵感')
      const bId: string | null = node.attrs.blockId

      // ---- DOM ----
      const dom = document.createElement('div')
      dom.classList.add('source-block', `source-block--${source}`)
      dom.setAttribute('data-type', 'source-block')
      dom.setAttribute('data-source', source)
      if (bId) dom.setAttribute('data-block-id', bId)

      // 标签行
      const headerEl = document.createElement('div')
      headerEl.classList.add('source-block-header')
      headerEl.contentEditable = 'false'

      const labelEl = document.createElement('span')
      labelEl.classList.add('source-block-label')
      labelEl.textContent = label
      headerEl.appendChild(labelEl)

      // 操作栏
      if (bId) {
        const toolbar = document.createElement('div')
        toolbar.classList.add('source-block-toolbar')

        const publishBtn = document.createElement('button')
        publishBtn.classList.add('sb-toolbar-btn')
        publishBtn.textContent = '📦 发布版本'
        publishBtn.title = '将当前内容保存为新版本'
        publishBtn.type = 'button'
        publishBtn.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          showPublishForm(dom, bId, labelEl)
        })
        toolbar.appendChild(publishBtn)

        const viewBtn = document.createElement('button')
        viewBtn.classList.add('sb-toolbar-btn')
        viewBtn.textContent = '📋 版本'
        viewBtn.title = '在 Block 空间查看所有版本'
        viewBtn.type = 'button'
        viewBtn.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          // 通知 RightPanel 切换到 blocks 标签并打开详情
          window.dispatchEvent(new CustomEvent('openBlockDetail', { detail: bId }))
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
      }

      return {
        dom,
        contentDOM,
        destroy() {
          if (syncTimer) clearTimeout(syncTimer)
        },
      }
    }
  },
})

// ---- 发布新版本 inline 表单 ----
function showPublishForm(dom: HTMLElement, blockId: string, labelEl: HTMLElement) {
  if (dom.querySelector('.sb-publish-form')) return

  const contentEl = dom.querySelector('.source-block-content')
  const currentContent = contentEl?.textContent || ''

  const form = document.createElement('div')
  form.classList.add('sb-publish-form')

  const input = document.createElement('input')
  input.classList.add('sb-publish-input')
  input.placeholder = '版本标题（如：偏历史叙述语气）'
  input.type = 'text'

  const actions = document.createElement('div')
  actions.classList.add('sb-publish-actions')

  const cancelBtn = document.createElement('button')
  cancelBtn.classList.add('sb-toolbar-btn', 'sb-btn-cancel')
  cancelBtn.textContent = '取消'
  cancelBtn.type = 'button'
  cancelBtn.addEventListener('mousedown', (e) => {
    e.preventDefault()
    form.remove()
  })

  const confirmBtn = document.createElement('button')
  confirmBtn.classList.add('sb-toolbar-btn', 'sb-btn-confirm')
  confirmBtn.textContent = '发布'
  confirmBtn.type = 'button'
  confirmBtn.addEventListener('mousedown', async (e) => {
    e.preventDefault()
    const title = input.value.trim()
    if (!title) { input.focus(); return }

    try {
      await blockStore.updateBlock(blockId, { content: currentContent })
      const release = await blockStore.createRelease(blockId, title)
      labelEl.textContent = `📦 v${release.version} · ${title}`
      form.remove()
      window.dispatchEvent(new Event('blockUpdated'))
    } catch (err) {
      console.error('[SourceBlock] Failed to create release:', err)
    }
  })

  // 键盘事件 — 必须阻止冒泡，否则 ProseMirror 会拦截
  input.addEventListener('keydown', (e) => {
    e.stopPropagation()
    if (e.key === 'Enter') { e.preventDefault(); confirmBtn.dispatchEvent(new MouseEvent('mousedown')) }
    if (e.key === 'Escape') { e.preventDefault(); form.remove() }
  })

  actions.appendChild(cancelBtn)
  actions.appendChild(confirmBtn)
  form.appendChild(input)
  form.appendChild(actions)

  const header = dom.querySelector('.source-block-header')
  if (header) header.after(form)
  else dom.insertBefore(form, contentEl)

  // 延迟 focus，避免被 ProseMirror 抢走
  requestAnimationFrame(() => input.focus())
}
