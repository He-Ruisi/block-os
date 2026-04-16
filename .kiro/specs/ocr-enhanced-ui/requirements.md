# Requirements Document

## Introduction

本文档定义 OCR 插件增强版 UI 的需求范围。目标不是照搬参考稿里的所有“专业工作站”能力，而是在 **现有 BlockOS 插件架构、现有 OCR API 返回结构、现有宿主能力** 的约束下，先交付一个可用、可扩展、可降级的三栏 OCR 工作台。

参考样式来自 `references/V0_ocrUIUX`。该原型对视觉布局有较强参考价值，但它仍然是静态 UI 原型，不能直接等价为可交付需求。

## Design Assessment Summary

### 结论

当前方案方向正确，但原始需求把以下三类内容混在了一起：

1. **已经被参考稿验证过的 UI 壳层**
   - 三栏布局
   - 历史记录侧栏
   - 中间预览区
   - 右侧结果区
   - 移动端标签切换

2. **现有系统可以直接承接的能力**
   - 上传图片
   - 摄像头拍照
   - OCR 识别
   - 插入编辑器
   - 保存为 Block
   - 本地持久化

3. **依赖额外协议或宿主支持的高风险能力**
   - Bounding Boxes 可视化
   - 置信度分块标记
   - 多模型切换
   - JSON 折叠视图
   - 从插件内直接打开设置面板
   - 多页文档分页

### 评估结论

- 视觉布局方案合理，适合作为增强版 OCR 插件的主形态。
- 风险主要不在 UI，而在 **数据契约和宿主能力假设过强**。
- 优化后应采用 **分级需求 + 能力探测 + 明确降级路径**。

## Product Goals

1. 提供与参考稿风格一致的三栏 OCR 工作台。
2. 在不修改插件系统核心代码的前提下完成升级。
3. 保持 OCR 主链路稳定：
   - 选择图片
   - 触发识别
   - 查看结果
   - 编辑结果
   - 插入编辑器或保存为 Block
4. 为后续 Bounding Boxes、多模型、结构化结果视图预留扩展位。

## Scope Strategy

### P0: 必须交付

- 三栏布局和移动端标签页切换
- 历史记录列表、搜索、删除、收藏
- 上传图片、摄像头拍照
- 图片预览、基础缩放、重置
- OCR 文本识别与结果编辑
- 复制、插入编辑器、保存为 Block
- IndexedDB 持久化
- 清晰的错误提示和加载状态

### P1: 有条件交付

- 结果区 JSON 视图
- 图片旋转
- 文件名重命名
- 导出 TXT / Markdown / JSON
- 低成本的结果块高亮

### P2: 仅在依赖满足时交付

- Bounding Boxes 可视化
- 置信度展示
- 文本块与预览区联动定位
- 多模型切换
- 多页文档分页

## Functional Requirements

### Requirement 1: 三栏工作台布局

**User Story:** 作为用户，我希望同时查看历史记录、图片预览和识别结果，以减少在多个面板之间切换。

#### Acceptance Criteria

1. WHEN 用户打开 OCR 插件, THE panel SHALL 在桌面端显示三栏布局。
2. THE left pane SHALL 用于历史记录与全局入口。
3. THE center pane SHALL 用于图片预览与图片操作。
4. THE right pane SHALL 用于 OCR 结果查看与编辑。
5. WHILE 屏幕宽度小于 768px, THE panel SHALL 切换为单栏标签页布局。
6. THE 布局实现 SHALL 参考 `references/V0_ocrUIUX/components/ocr/ocr-layout.tsx` 的信息分区方式。

### Requirement 2: 历史记录管理

**User Story:** 作为用户，我希望保留最近处理过的图片，并能快速重新打开和管理它们。

#### Acceptance Criteria

1. THE History_List SHALL 显示缩略图、文件名、时间、识别状态。
2. THE History_List SHALL 默认按时间倒序排列。
3. THE History_List SHALL 支持“最近上传”和“我的收藏”两个过滤视图。
4. THE History_List SHALL 支持按文件名模糊搜索，不区分大小写。
5. THE user SHALL 可以删除单条历史记录。
6. THE user SHALL 可以切换单条历史记录的收藏状态。
7. WHEN 列表为空, THE panel SHALL 显示空状态提示。

### Requirement 3: 图片导入与拍照

**User Story:** 作为用户，我希望通过上传或拍照快速生成新的 OCR 任务。

#### Acceptance Criteria

1. THE panel SHALL 提供“上传图片”入口。
2. THE panel SHALL 在浏览器支持 `MediaDevices` 时提供“拍照”入口。
3. WHEN 用户上传图片, THE system SHALL 创建新的 PhotoRecord 并自动选中。
4. WHEN 用户完成拍照, THE system SHALL 创建新的 PhotoRecord 并自动选中。
5. WHEN 浏览器不支持摄像头或权限被拒绝, THE system SHALL 降级为仅支持上传并展示原因。

### Requirement 4: 图片预览与基础控制

**User Story:** 作为用户，我希望在 OCR 前确认图片内容，并在必要时放大查看细节。

#### Acceptance Criteria

1. WHEN 用户选中历史记录, THE Preview_Area SHALL 显示对应图片。
2. THE Preview_Area SHALL 保持原始宽高比。
3. THE Preview_Area SHALL 支持适应容器显示。
4. THE Preview_Area SHALL 支持放大、缩小、重置。
5. THE Preview_Area MAY 支持旋转，但旋转属于 P1。
6. WHEN 无选中图片, THE Preview_Area SHALL 显示引导态。

### Requirement 5: OCR 识别主流程

**User Story:** 作为用户，我希望手动发起 OCR 识别，并在失败时能理解失败原因。

#### Acceptance Criteria

1. THE Result_Editor SHALL 提供“识别文字”或“重新识别”入口。
2. WHEN 用户触发识别, THE system SHALL 调用当前 OCR 服务。
3. WHEN 识别成功, THE system SHALL 保存结果到 PhotoRecord。
4. WHEN 识别失败, THE system SHALL 显示具体错误信息。
5. THE 识别流程 SHALL 不依赖 Bounding Boxes、置信度或多模型能力才能完成。

### Requirement 6: 结果编辑与操作

**User Story:** 作为用户，我希望修订 OCR 文本，并快速用于后续写作或知识沉淀。

#### Acceptance Criteria

1. THE Result_Editor SHALL 以可编辑文本区域展示 OCR 文本。
2. THE user SHALL 可以修改文本并保存。
3. THE user SHALL 可以复制识别结果。
4. THE user SHALL 可以调用 `Plugin_API.insertSourceBlock` 插入编辑器。
5. THE user SHALL 可以调用 `Plugin_API.saveAsBlock` 保存为 Block。
6. WHEN 无有效识别结果, THE 相关操作按钮 SHALL 禁用。

### Requirement 7: 本地持久化

**User Story:** 作为用户，我希望历史记录在刷新页面或重新打开插件后仍然存在。

#### Acceptance Criteria

1. THE system SHALL 使用 `blockos-db` 中独立的 OCR object store 持久化数据。
2. THE system SHALL 复用统一数据库初始化机制，而不是创建第二套数据库。
3. THE system SHALL 保存图片元数据、缩略图或图片数据引用、识别结果、收藏状态等字段。
4. THE system SHALL 限制历史记录数量上限，默认不超过 100 条。
5. WHEN 超过上限, THE system SHALL 清理最旧记录。

### Requirement 8: 结果视图分层

**User Story:** 作为用户，我希望既能看到可编辑文本，也能在可用时查看结构化结果。

#### Acceptance Criteria

1. THE default result view SHALL 为文本视图。
2. THE JSON 视图 SHALL 仅在 OCR 响应保留了结构化原始数据时启用。
3. WHEN 无结构化原始数据, THE JSON 视图 SHALL 隐藏或置灰。
4. THE system SHALL 不把“JSON 语法高亮和折叠”设为 P0 阻塞项。

### Requirement 9: Bounding Boxes 能力探测

**User Story:** 作为用户，我希望在服务端提供区域坐标时看到识别区域高亮，但在服务端不支持时主流程也不受影响。

#### Acceptance Criteria

1. WHEN OCR API 返回有效区域坐标, THE Preview_Area SHALL 渲染 Bounding Boxes。
2. WHEN OCR API 未返回区域坐标, THE panel SHALL 隐藏识别框相关控件。
3. THE Bounding Boxes 功能 SHALL 被标记为增强能力，而不是主链路前置条件。
4. 文本块与识别框联动 SHALL 仅在数据映射存在时启用。

### Requirement 10: 多模型能力探测

**User Story:** 作为用户，我希望在服务端或配置明确支持多模型时进行切换，否则继续使用默认模型完成识别。

#### Acceptance Criteria

1. WHEN 系统提供可用模型列表, THE Result_Editor SHALL 显示模型选择器。
2. WHEN 仅存在单一模型配置, THE Result_Editor SHALL 不展示模型切换控件。
3. 多模型切换 SHALL 不要求 `Plugin_API` 新增接口作为前提。
4. 模型配置来源 SHALL 优先使用 OCR 插件自身配置，而不是假设宿主提供统一模型注册能力。

### Requirement 11: 设置入口降级

**User Story:** 作为用户，我希望从 OCR 工作台快速到达配置项，但不希望因宿主缺少设置跳转接口而阻塞功能。

#### Acceptance Criteria

1. THE left pane MAY 显示“系统设置”入口。
2. WHEN 宿主支持打开插件设置面板, THE entry SHALL 调起对应设置。
3. WHEN 宿主不支持直接跳转, THE entry SHALL 显示说明或在面板内提供轻量配置区域。
4. 该入口 SHALL 不要求修改现有 `Plugin_API` 核心接口。

### Requirement 12: 错误处理和降级策略

**User Story:** 作为用户，我希望知道当前缺少的是网络、权限、配置还是增强能力，而不是只看到笼统失败。

#### Acceptance Criteria

1. THE system SHALL 区分网络错误、认证错误、超时、文件过大、摄像头权限错误。
2. THE system SHALL 为每类错误提供可理解的中文提示。
3. WHEN 增强能力不可用, THE system SHALL 继续支持基础 OCR 链路。
4. THE UI SHALL 避免因为附加能力缺失进入不可恢复状态。

## Data Requirements

### PhotoRecord

```ts
interface PhotoRecord {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  imageDataUrl: string
  thumbnailDataUrl?: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  ocrStatus: 'idle' | 'processing' | 'done' | 'error'
  ocrText?: string
  ocrError?: string
  rawResponse?: unknown
  modelId?: string
  capabilities?: {
    hasBoundingBoxes: boolean
    hasConfidence: boolean
    hasStructuredJson: boolean
    hasPagination: boolean
  }
  regions?: OCRRegion[]
}

interface OCRRegion {
  id: string
  text: string
  confidence?: number
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
}
```

### 关键约束

1. 时间字段统一使用 ISO 字符串，避免 `Date` 直接入库后的反序列化歧义。
2. `capabilities` 必须显式记录，避免 UI 通过“猜测字段存在性”决定功能。
3. `rawResponse` 为可选字段，避免 JSON 视图成为硬依赖。

## Non-Functional Requirements

### 性能

1. 首屏应优先渲染骨架和当前主布局，再异步加载历史记录。
2. 单张图片大小默认限制为 5MB。
3. 历史记录数量在 50 条以内时不强制引入虚拟列表。
4. 只有在数据量和性能实际触发阈值后，才引入虚拟滚动。

### 兼容性

1. 支持桌面端 Chrome / Edge 为主。
2. 移动端仅要求可浏览、可上传、可查看结果，不强求完整桌面级交互。
3. 对不支持 `MediaDevices` 的环境进行功能降级。

### 可维护性

1. 不修改插件系统核心代码。
2. 新增状态和存储逻辑应局限在 OCR 插件内部。
3. UI 壳层、存储层、OCR 服务层、结果适配层必须分离。

## Constraints and Assumptions

### Constraints

1. 当前 `Plugin_API` 已支持：
   - `insertSourceBlock`
   - `saveAsBlock`
   - `showSuccess`
   - `showError`
   - 插件配置读写
2. 当前 `Plugin_API` 未暴露：
   - 直接打开插件设置面板
   - 统一模型注册中心
   - 宿主级文件下载帮助接口
3. 当前 `ocrService` 只稳定消费文本结果，未证明已具备 Bounding Boxes / 置信度 / 模型切换协议。
4. 当前参考稿是静态 UI，不代表其每个控件都有后端语义。

### Assumptions

1. OCR API 至少能继续返回文本主结果。
2. 宿主允许 OCR 插件在自身范围内扩展 IndexedDB object store。
3. 用户核心诉求优先级高于“专业感外观”的完整复制。

## Out of Scope

以下内容不作为本轮必须交付：

1. PDF / Word 高级导出。
2. 全文历史搜索。
3. 批量识别、批量删除、批量导出。
4. 富文本编辑。
5. 云同步。
6. 未经验证的多页 OCR 文档浏览。
7. 未拿到服务端协议前的 Bounding Boxes 精细交互。

## Risk Analysis

| 风险 | 等级 | 原因 | 优化后的应对 |
|---|---|---|---|
| OCR API 不返回区域坐标 | 高 | 当前服务实现仅稳定消费文本 | Bounding Boxes 改为能力增强项，主链路不依赖 |
| 多模型协议不确定 | 高 | 现有插件仅有单一 `apiUrl/apiToken` 配置 | 先单模型默认运行，模型选择器按配置出现 |
| 从插件内打开设置面板缺少宿主接口 | 中 | `Plugin_API` 当前无该方法 | 允许降级为面板内轻配置或说明提示 |
| 原始图片直接入库导致体积膨胀 | 中 | base64 成本高 | 引入大小限制与缩略图策略 |
| 需求过度前置虚拟滚动/分页/JSON 折叠 | 中 | 原型强于真实需求 | 仅在阈值触发后增加复杂度 |
| 参考稿与真实交互不完全一致 | 低 | 原型偏演示态 | 将其定位为视觉参考，不作为协议来源 |

## Delivery Recommendation

建议按以下顺序交付：

1. P0 壳层与主链路。
2. 本地持久化和历史管理。
3. 结果视图增强与导出。
4. Bounding Boxes / 置信度 / 多模型等增强能力。

这样可以在最小风险下快速替换现有单栏 OCR 面板，同时保留继续向“专业工作站”演进的空间。
