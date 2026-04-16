import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Camera,
  Copy,
  ImagePlus,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { IPluginAPI } from '@/services/core/pluginAPI'
import { captureOCRRecordAsExplicitBlock, upsertImplicitBlockFromOCR } from '@/services/integration/ocrBlockService'
import { ocrPhotoStore } from '@/storage/ocrPhotoStore'
import type { OCRPhotoRecord } from '@/types/common/ocr'
import { recognizeText } from './ocrService'
import {
  createCapturedFileName,
  createPhotoRecord,
  dataUrlToBase64,
  formatDateTime,
  formatFileSize,
  formatRelativeTime,
  readFileAsDataUrl,
  validateImageFile,
} from './ocrUtils'
import '../../../styles/modules/panels.css'

type HistoryTab = 'recent' | 'favorite'
type MobileTab = 'history' | 'preview' | 'result'
type ResultView = 'text' | 'raw'

interface OCRPanelProps {
  api: IPluginAPI
}

export function OCRPanel({ api }: OCRPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [records, setRecords] = useState<OCRPhotoRecord[]>([])
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [historyTab, setHistoryTab] = useState<HistoryTab>('recent')
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [draftText, setDraftText] = useState<string>('')
  const [resultView, setResultView] = useState<ResultView>('text')
  const [previewScale, setPreviewScale] = useState<number>(1)
  const [isHydrating, setIsHydrating] = useState<boolean>(true)
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedRecord = useMemo(() => {
    return records.find((record) => record.id === selectedRecordId) ?? null
  }, [records, selectedRecordId])

  const filteredRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      if (historyTab === 'favorite' && !record.isFavorite) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return record.fileName.toLowerCase().includes(normalizedQuery)
    })
  }, [historyTab, records, searchQuery])

  const stopCameraStream = useCallback((): void => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsCameraActive(false)
  }, [])

  const persistRecord = useCallback(async (record: OCRPhotoRecord): Promise<void> => {
    await ocrPhotoStore.saveRecord(record)
    setRecords((prev) => {
      const next = [...prev.filter((item) => item.id !== record.id), record]
      next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      return next
    })
  }, [])

  const loadRecords = useCallback(async (): Promise<void> => {
    setIsHydrating(true)

    try {
      await ocrPhotoStore.init()
      const storedRecords = await ocrPhotoStore.getAllRecords()
      setRecords(storedRecords)
      setSelectedRecordId(storedRecords[0]?.id ?? null)
    } catch (error) {
      const message = getErrorMessage(error, '加载 OCR 历史失败')
      setErrorMessage(message)
      api.showError(message)
    } finally {
      setIsHydrating(false)
    }
  }, [api])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  useEffect(() => {
    setDraftText(selectedRecord?.ocrText ?? '')
    setResultView('text')
    setPreviewScale(1)
    if (selectedRecord) {
      setMobileTab('preview')
    }
  }, [selectedRecord])

  useEffect(() => {
    return () => {
      stopCameraStream()
    }
  }, [stopCameraStream])

  const handleCreateRecord = useCallback(async (record: OCRPhotoRecord): Promise<void> => {
    await persistRecord(record)
    setSelectedRecordId(record.id)
    setMobileTab('preview')
    setErrorMessage(null)
  }, [persistRecord])

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      validateImageFile(file)
      const dataUrl = await readFileAsDataUrl(file)
      const record = createPhotoRecord({
        dataUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'image/png',
      })

      await handleCreateRecord(record)
      api.showSuccess('图片已加入历史记录')
    } catch (error) {
      const message = getErrorMessage(error, '上传图片失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, handleCreateRecord])

  const handleStartCamera = useCallback(async (): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) {
      const message = '当前浏览器不支持摄像头，请改用上传图片'
      setErrorMessage(message)
      api.showError(message)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })

      streamRef.current = stream
      setIsCameraActive(true)
      setMobileTab('preview')
      setErrorMessage(null)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      const message = getErrorMessage(error, '无法访问摄像头，请检查浏览器权限')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api])

  const handleCapture = useCallback(async (): Promise<void> => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      return
    }

    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      const message = '拍照失败，请重试'
      setErrorMessage(message)
      api.showError(message)
      return
    }

    context.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

    stopCameraStream()

    const record = createPhotoRecord({
      dataUrl,
      fileName: createCapturedFileName(),
      fileSize: Math.round((dataUrl.length * 3) / 4),
      mimeType: 'image/jpeg',
    })

    await handleCreateRecord(record)
    api.showSuccess('拍照成功')
  }, [api, handleCreateRecord, stopCameraStream])

  const handleToggleFavorite = useCallback(async (recordId: string): Promise<void> => {
    const record = records.find((item) => item.id === recordId)
    if (!record) {
      return
    }

    const nextRecord: OCRPhotoRecord = {
      ...record,
      isFavorite: !record.isFavorite,
      updatedAt: new Date().toISOString(),
    }

    try {
      await persistRecord(nextRecord)
    } catch (error) {
      const message = getErrorMessage(error, '更新收藏状态失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, persistRecord, records])

  const handleDeleteRecord = useCallback(async (recordId: string): Promise<void> => {
    const record = records.find((item) => item.id === recordId)
    if (!record) {
      return
    }

    const confirmed = window.confirm(`确定删除 ${record.fileName} 吗？`)
    if (!confirmed) {
      return
    }

    try {
      await ocrPhotoStore.deleteRecord(recordId)
      const nextRecords = records.filter((item) => item.id !== recordId)
      setRecords(nextRecords)
      setSelectedRecordId((prev) => (prev === recordId ? nextRecords[0]?.id ?? null : prev))
    } catch (error) {
      const message = getErrorMessage(error, '删除历史记录失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, records])

  const handleSaveDraft = useCallback(async (): Promise<void> => {
    if (!selectedRecord) {
      return
    }

    const draftRecord: OCRPhotoRecord = {
      ...selectedRecord,
      ocrText: draftText,
      updatedAt: new Date().toISOString(),
      ocrStatus: draftText.trim() ? 'done' : selectedRecord.ocrStatus,
    }

    try {
      let nextRecord = draftRecord
      if (draftRecord.ocrText?.trim()) {
        const implicitBlock = await upsertImplicitBlockFromOCR(draftRecord)
        nextRecord = {
          ...draftRecord,
          implicitBlockId: implicitBlock.blockId,
          implicitBlockVersion: implicitBlock.version,
        }
      }

      await persistRecord(nextRecord)
    } catch (error) {
      const message = getErrorMessage(error, '保存识别结果失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, draftText, persistRecord, selectedRecord])

  const handleRecognize = useCallback(async (): Promise<void> => {
    if (!selectedRecord) {
      return
    }

    const apiUrl = api.getConfig<string>('apiUrl') || ''
    const apiToken = api.getConfig<string>('apiToken') || ''
    if (!apiUrl || !apiToken) {
      const message = '请先在插件设置中配置 API 地址和 Token'
      setErrorMessage(message)
      api.showError(message)
      return
    }

    const processingRecord: OCRPhotoRecord = {
      ...selectedRecord,
      ocrStatus: 'processing',
      ocrError: undefined,
      updatedAt: new Date().toISOString(),
    }

    setIsRecognizing(true)
    setErrorMessage(null)
    await persistRecord(processingRecord)

    try {
      const result = await recognizeText(dataUrlToBase64(selectedRecord.imageDataUrl), apiUrl, apiToken)
      const recognizedRecord: OCRPhotoRecord = {
        ...processingRecord,
        ocrStatus: 'done',
        ocrText: result.text,
        ocrRawText: result.rawText,
        updatedAt: new Date().toISOString(),
      }

      const implicitBlock = await upsertImplicitBlockFromOCR(recognizedRecord)
      const nextRecord: OCRPhotoRecord = {
        ...recognizedRecord,
        implicitBlockId: implicitBlock.blockId,
        implicitBlockVersion: implicitBlock.version,
      }

      setDraftText(result.text)
      setResultView('text')
      await persistRecord(nextRecord)
      setMobileTab('result')
      api.showSuccess('识别成功')
    } catch (error) {
      const message = getErrorMessage(error, '识别失败')
      const nextRecord: OCRPhotoRecord = {
        ...processingRecord,
        ocrStatus: 'error',
        ocrError: message,
        updatedAt: new Date().toISOString(),
      }

      await persistRecord(nextRecord)
      setErrorMessage(message)
      api.showError(message)
    } finally {
      setIsRecognizing(false)
    }
  }, [api, persistRecord, selectedRecord])

  const handleCopy = useCallback(async (): Promise<void> => {
    const text = getCurrentResultText(resultView, draftText, selectedRecord?.ocrRawText).trim()
    if (!text) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      api.showSuccess('已复制识别结果')
    } catch (error) {
      const message = getErrorMessage(error, '复制失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, draftText, resultView, selectedRecord?.ocrRawText])

  const handleInsert = useCallback(async (): Promise<void> => {
    const text = draftText.trim()
    if (!text) {
      return
    }

    try {
      await api.insertSourceBlock(text, 'import', '📷 OCR 识别')
      api.showSuccess('已插入编辑器')
    } catch (error) {
      const message = getErrorMessage(error, '插入编辑器失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, draftText])

  const handleSaveAsBlock = useCallback(async (): Promise<void> => {
    if (!selectedRecord?.ocrText?.trim()) {
      return
    }

    try {
      await captureOCRRecordAsExplicitBlock({
        ...selectedRecord,
        ocrText: draftText.trim(),
        updatedAt: new Date().toISOString(),
      })
      api.showSuccess('已保存为 Block')
    } catch (error) {
      const message = getErrorMessage(error, '保存为 Block 失败')
      setErrorMessage(message)
      api.showError(message)
    }
  }, [api, draftText, selectedRecord])

  const handleOpenSettings = useCallback((): void => {
    api.showInfo('请通过插件设置面板配置 OCR API')
  }, [api])

  const canOperateResult = draftText.trim().length > 0
  const hasRawResult = Boolean(selectedRecord?.ocrRawText?.trim())

  return (
    <div className="ocr-workspace">
      <div className="ocr-mobile-nav">
        <Tabs value={mobileTab} onValueChange={(value: string) => setMobileTab(value as MobileTab)}>
          <TabsList className="ocr-mobile-tabs">
            <TabsTrigger value="history">历史</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="result">结果</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <aside className={`ocr-pane ocr-history-pane ${mobileTab === 'history' ? 'ocr-pane-mobile-active' : ''}`}>
        <div className="ocr-history-header">
          <Button variant="outline" className="ocr-new-button" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={16} />
            新解析
          </Button>
          <Button variant="ghost" size="icon" onClick={handleOpenSettings} aria-label="OCR 设置说明">
            <Settings size={16} />
          </Button>
        </div>

        <Tabs value={historyTab} onValueChange={(value: string) => setHistoryTab(value as HistoryTab)}>
          <TabsList className="ocr-history-tabs">
            <TabsTrigger value="recent">最近上传</TabsTrigger>
            <TabsTrigger value="favorite">我的收藏</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="ocr-search">
          <Search size={16} className="ocr-search-icon" />
          <Input
            value={searchQuery}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
            placeholder="搜索文件名"
            aria-label="搜索 OCR 历史"
          />
        </div>

        <div className="ocr-record-count">共 {filteredRecords.length} 条记录</div>

        <div className="ocr-history-list">
          {isHydrating ? (
            <div className="ocr-empty-state">正在加载 OCR 历史...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="ocr-empty-state">
              {searchQuery.trim() ? '未找到匹配的记录' : '暂无历史记录'}
            </div>
          ) : (
            filteredRecords.map((record) => (
              <button
                key={record.id}
                type="button"
                className={`ocr-history-item ${record.id === selectedRecordId ? 'ocr-history-item-active' : ''}`}
                onClick={() => setSelectedRecordId(record.id)}
              >
                <img className="ocr-history-thumb" src={record.imageDataUrl} alt={record.fileName} />
                <div className="ocr-history-meta">
                  <div className="ocr-history-topline">
                    <span className="ocr-history-name" title={record.fileName}>
                      {record.fileName}
                    </span>
                    <span className={`ocr-status-badge ocr-status-${record.ocrStatus}`}>{getStatusLabel(record.ocrStatus)}</span>
                  </div>
                  <div className="ocr-history-time">{formatRelativeTime(record.createdAt)}</div>
                </div>
                <div className="ocr-history-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={record.isFavorite ? 'ocr-favorite-active' : ''}
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation()
                      void handleToggleFavorite(record.id)
                    }}
                    aria-label={record.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <Star size={16} fill={record.isFavorite ? 'currentColor' : 'none'} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(event: React.MouseEvent) => {
                      event.stopPropagation()
                      void handleDeleteRecord(record.id)
                    }}
                    aria-label="删除历史记录"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className={`ocr-pane ocr-preview-pane ${mobileTab === 'preview' ? 'ocr-pane-mobile-active' : ''}`}>
        <div className="ocr-preview-header">
          {selectedRecord ? (
            <>
              <div className="ocr-preview-title" title={selectedRecord.fileName}>
                {selectedRecord.fileName}
              </div>
              <div className="ocr-preview-subtitle">
                <span>{formatFileSize(selectedRecord.fileSize)}</span>
                <span>{formatDateTime(selectedRecord.createdAt)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="ocr-preview-title">等待导入图片</div>
              <div className="ocr-preview-subtitle">上传图片或拍照后即可开始识别</div>
            </>
          )}
        </div>

        <div className="ocr-preview-surface">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="ocr-preview-media" />
          ) : selectedRecord ? (
            <img
              src={selectedRecord.imageDataUrl}
              alt={selectedRecord.fileName}
              className="ocr-preview-media"
              style={{ transform: `scale(${previewScale})` }}
            />
          ) : (
            <div className="ocr-empty-state">请选择或上传图片</div>
          )}

          {isRecognizing ? (
            <div className="ocr-loading-overlay">
              <Loader2 className="ocr-loading-icon" size={28} />
              <div className="ocr-loading-text">识别中...</div>
            </div>
          ) : null}
        </div>

        <div className="ocr-preview-toolbar">
          <div className="ocr-toolbar-group">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPreviewScale((prev) => Math.max(0.5, prev - 0.25))}
              disabled={!selectedRecord || isCameraActive}
            >
              <ZoomOut size={16} />
            </Button>
            <span className="ocr-zoom-label">{Math.round(previewScale * 100)}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPreviewScale((prev) => Math.min(3, prev + 0.25))}
              disabled={!selectedRecord || isCameraActive}
            >
              <ZoomIn size={16} />
            </Button>
            <Button variant="ghost" onClick={() => setPreviewScale(1)} disabled={!selectedRecord || isCameraActive}>
              重置
            </Button>
          </div>

          <div className="ocr-toolbar-group">
            {isCameraActive ? (
              <>
                <Button onClick={() => void handleCapture()}>
                  <Camera size={16} />
                  拍照
                </Button>
                <Button variant="outline" onClick={stopCameraStream}>
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => void handleStartCamera()}>
                  <Camera size={16} />
                  拍照
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload size={16} />
                  上传图片
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      <section className={`ocr-pane ocr-result-pane ${mobileTab === 'result' ? 'ocr-pane-mobile-active' : ''}`}>
        <div className="ocr-result-header">
          <div>
            <div className="ocr-result-title">识别结果</div>
            <div className="ocr-result-subtitle">
              {selectedRecord ? getResultHint(selectedRecord) : '请选择图片开始识别'}
            </div>
          </div>
          <div className="ocr-result-toolbar">
            <Button variant="outline" onClick={() => void handleRecognize()} disabled={!selectedRecord || isRecognizing}>
              {isRecognizing ? <Loader2 className="ocr-spin" size={16} /> : <RefreshCw size={16} />}
              {selectedRecord?.ocrText ? '重新识别' : '识别文字'}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => void handleCopy()} disabled={!canOperateResult} aria-label="复制识别结果">
              <Copy size={16} />
            </Button>
          </div>
        </div>

        <div className="ocr-result-view-tabs">
          <Tabs value={resultView} onValueChange={(value: string) => setResultView(value as ResultView)}>
            <TabsList className="ocr-result-tabs-list">
              <TabsTrigger value="text">文本视图</TabsTrigger>
              <TabsTrigger value="raw" disabled={!hasRawResult}>
                原始视图
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="ocr-result-body">
          {resultView === 'text' ? (
            <Textarea
              value={draftText}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDraftText(event.target.value)}
              onBlur={() => void handleSaveDraft()}
              placeholder={selectedRecord ? '点击“识别文字”开始识别，或在这里编辑结果。' : '请选择图片后开始识别'}
              disabled={!selectedRecord}
              className="ocr-result-textarea"
            />
          ) : (
            <pre className="ocr-result-raw-view">
              {selectedRecord?.ocrRawText?.trim() || '当前没有原始 OCR 结果'}
            </pre>
          )}
          {selectedRecord?.ocrError ? <div className="ocr-inline-error">{selectedRecord.ocrError}</div> : null}
          {errorMessage ? <div className="ocr-inline-error">{errorMessage}</div> : null}
        </div>

        <div className="ocr-result-actions">
          <Button variant="outline" onClick={() => void handleInsert()} disabled={!canOperateResult}>
            插入编辑器
          </Button>
          <Button onClick={() => void handleSaveAsBlock()} disabled={!canOperateResult}>
            保存为 Block
          </Button>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          void handleFileChange(event)
        }}
        className="ocr-hidden-input"
      />
      <canvas ref={canvasRef} className="ocr-hidden-input" />
    </div>
  )
}

function getCurrentResultText(view: ResultView, text: string, rawText?: string): string {
  if (view === 'raw') {
    return rawText ?? ''
  }

  return text
}

function getStatusLabel(status: OCRPhotoRecord['ocrStatus']): string {
  switch (status) {
    case 'processing':
      return '识别中'
    case 'done':
      return '已识别'
    case 'error':
      return '失败'
    default:
      return '待识别'
  }
}

function getResultHint(record: OCRPhotoRecord): string {
  if (record.ocrStatus === 'processing') {
    return '正在调用 OCR 服务'
  }

  if (record.ocrStatus === 'error') {
    return '识别失败，可修改图片后重试'
  }

  if (record.ocrText?.trim()) {
    return '识别结果可直接编辑，失焦自动保存'
  }

  return '点击“识别文字”开始识别'
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
