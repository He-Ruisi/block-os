import { Node, mergeAttributes } from '@tiptap/core'
import { blockStore } from '@/storage/blockStore'
import { publishBlockVersion, trackBlockWorkingCopyChange } from '@/features/blocks/services/blockReleaseService'

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
      pending: { default: false },
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
          pending: dom.getAttribute('data-pending') === 'true',
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
        'data-pending': HTMLAttributes.pending ? 'true' : 'false',
        class: `source-block source-block--${source}${HTMLAttributes.pending ? ' source-block--pending' : ''}`,
      }),
      0,
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const source = node.attrs.source || 'ai'
      const isPending: boolean = node.attrs.pending === true
      const label = node.attrs.sourceLabel || (source === 'ai' ? '● AI 生成' : '💡 灵感')
      const blockId: string | null = node.attrs.blockId

      const dom = document.createElement('div')
      dom.classList.add('source-block', `source-block--${source}`)
      if (isPending) dom.classList.add('source-block--pending')
      dom.setAttribute('data-type', 'source-block')
      dom.setAttribute('data-source', source)
      if (blockId) dom.setAttribute('data-block-id', blockId)

      const headerEl = document.createElement('div')
      headerEl.classList.add('source-block-header')
      headerEl.contentEditable = 'false'

      const labelEl = document.createElement('span')
      labelEl.classList.add('source-block-label')
      labelEl.textContent = isPending ? '✨ AI 续写（待确认）' : label
      headerEl.appendChild(labelEl)

      if (isPending) {
        const pendingActions = document.createElement('div')
        pendingActions.classList.add('source-block-pending-actions')

        const keepBtn = document.createElement('button')
        keepBtn.classList.add('sb-toolbar-btn', 'sb-btn-confirm')
        keepBtn.textContent = '✅ 保留'
        keepBtn.type = 'button'
        keepBtn.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (typeof getPos === 'function') {
            const pos = getPos()
            editor.chain().focus().command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, pending: false, sourceLabel: label })
              return true
            }).run()
          }
        })

        const discardBtn = document.createElement('button')
        discardBtn.classList.add('sb-toolbar-btn', 'sb-btn-cancel')
        discardBtn.textContent = '❌ 丢弃'
        discardBtn.type = 'button'
        discardBtn.addEventListener('mousedown', (e) => {
          e.preventDefault()
          e.stopPropagation()
          if (typeof getPos === 'function') {
            const pos = getPos()
            editor.chain().focus().command(({ tr }) => {
              const nodeSize = editor.state.doc.nodeAt(pos)?.nodeSize ?? 0
              tr.delete(pos, pos + nodeSize)
              return true
            }).run()
          }
        })

        pendingActions.appendChild(keepBtn)
        pendingActions.appendChild(discardBtn)
        headerEl.appendChild(pendingActions)
      }

      if (!isPending && blockId) {
        const toolbar = document.createElement('div')
        toolbar.classList.add('source-block-toolbar')

        const publishBtn = document.createElement('button')
        publishBtn.classList.add('sb-toolbar-btn')
        publishBtn.textContent = '📦 发布'
        publishBtn.title = '将当前内容保存为新版本'
        publishBtn.type = 'button'
        publishBtn.addEventListener('mousedown', async (e) => {
          e.preventDefault()
          e.stopPropagation()

          const currentContent = contentDOM.textContent || ''
          if (!currentContent.trim()) return

          const originalText = publishBtn.textContent || '📦 发布'
          publishBtn.disabled = true
          publishBtn.textContent = '发布中...'

          try {
            const release = await publishBlockVersion({
              blockId,
              contentOverride: currentContent,
              recordUsage: true,
            })

            if (typeof getPos === 'function') {
              const pos = getPos()
              editor.chain().focus().command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  releaseVersion: release.version,
                  sourceLabel: `📦 v${release.version} · ${release.title}`,
                })
                return true
              }).run()
            }

            labelEl.textContent = `📦 v${release.version} · ${release.title}`
          } catch (err) {
            console.error('[SourceBlock] Failed to create release:', err)
          } finally {
            publishBtn.disabled = false
            publishBtn.textContent = originalText
          }
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
          window.dispatchEvent(new CustomEvent('openBlockDetail', { detail: blockId }))
        })
        toolbar.appendChild(viewBtn)

        headerEl.appendChild(toolbar)
      }

      dom.appendChild(headerEl)

      const contentDOM = document.createElement('div')
      contentDOM.classList.add('source-block-content')
      dom.appendChild(contentDOM)

      let syncTimer: ReturnType<typeof setTimeout> | null = null
      let observer: MutationObserver | null = null

      if (blockId && !isPending) {
        observer = new MutationObserver(() => {
          if (syncTimer) clearTimeout(syncTimer)
          syncTimer = setTimeout(() => {
            const text = contentDOM.textContent || ''
            if (text.trim()) {
              blockStore.updateBlock(blockId, { content: text })
                .then(() => {
                  trackBlockWorkingCopyChange(blockId)
                })
                .catch(err => console.error('[SourceBlock] Failed to sync content:', err))
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
          observer?.disconnect()
        },
      }
    }
  },
})
