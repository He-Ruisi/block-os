# Requirements Document

## Introduction

本文档定义了 OCR 插件 UI/UX 增强功能的需求规格。该功能旨在将现有的单栏 OCR 界面升级为三栏布局，提供照片历史记录管理、图片预览和结果编辑等增强功能，显著提升用户体验和工作效率。

**背景**：
- 现有 OCR 插件提供基础的图片识别功能（拍照/上传 → 识别 → 插入/保存）
- 用户反馈需要更强大的历史记录管理和结果编辑能力
- 参考设计展示了三栏布局的优化方案

**目标**：
- 提供直观的三栏布局界面（历史记录 + 预览 + 结果）
- 支持照片历史记录的持久化存储和管理
- 增强 OCR 结果的编辑和操作能力
- 保持与现有插件系统架构的完全兼容

## Glossary

- **OCR_Enhanced_Panel**: OCR 增强面板，替代现有 OCRPanel 的新三栏布局组件
- **History_List**: 历史记录列表，显示用户上传/拍摄的照片历史
- **Preview_Area**: 预览区域，显示当前选中图片的大图预览
- **Result_Editor**: 结果编辑器，显示和编辑 OCR 识别结果
- **Photo_Record**: 照片记录，包含图片数据、识别结果、时间戳等信息
- **IndexedDB_Store**: IndexedDB 存储，用于持久化照片历史记录
- **Plugin_API**: 插件 API，OCR 插件与主应用交互的桥接接口
- **SourceBlock**: 来源块，TipTap 编辑器中的特殊块类型，用于标记外部来源的内容
- **Block**: 知识块，BlockOS 的最小知识单元


## Requirements

### Requirement 1: 三栏布局界面

**User Story:** 作为用户，我希望 OCR 插件采用三栏布局，以便同时查看历史记录、预览图片和编辑识别结果。

#### Acceptance Criteria

1. WHEN 用户打开 OCR 插件, THE OCR_Enhanced_Panel SHALL 渲染三栏布局界面
2. THE History_List SHALL 显示在界面左侧，宽度为 240px
3. THE Preview_Area SHALL 显示在界面中间，占据剩余空间的 50%
4. THE Result_Editor SHALL 显示在界面右侧，占据剩余空间的 50%
5. WHILE 屏幕宽度小于 768px, THE OCR_Enhanced_Panel SHALL 切换为单栏布局（垂直堆叠）
6. THE OCR_Enhanced_Panel SHALL 保持与现有插件系统架构的完全兼容
7. THE OCR_Enhanced_Panel SHALL 复用现有的 Plugin_API 接口

### Requirement 2: 照片历史记录列表

**User Story:** 作为用户，我希望查看所有上传/拍摄的照片历史，以便快速访问之前的识别结果。

#### Acceptance Criteria

1. THE History_List SHALL 显示所有 Photo_Record 的缩略图列表
2. WHEN 用户上传或拍摄新照片, THE History_List SHALL 在列表顶部添加新记录
3. THE History_List SHALL 按时间倒序排列（最新的在最上方）
4. FOR ALL Photo_Record, THE History_List SHALL 显示缩略图（80x80px）、时间戳和识别状态
5. WHEN 用户点击某个 Photo_Record, THE History_List SHALL 高亮选中项并触发预览更新
6. THE History_List SHALL 支持滚动查看所有历史记录
7. WHEN History_List 为空, THE History_List SHALL 显示空状态提示（"暂无历史记录"）

### Requirement 3: 照片历史记录持久化

**User Story:** 作为用户，我希望照片历史记录能够持久化保存，以便下次打开插件时仍能访问。

#### Acceptance Criteria

1. THE IndexedDB_Store SHALL 创建名为 "ocr-photos" 的对象存储
2. WHEN 用户上传或拍摄照片, THE IndexedDB_Store SHALL 保存 Photo_Record（包含 base64 图片数据、时间戳、识别结果）
3. WHEN OCR_Enhanced_Panel 初始化, THE IndexedDB_Store SHALL 加载所有 Photo_Record 到 History_List
4. THE IndexedDB_Store SHALL 限制最多存储 100 条历史记录
5. WHEN 历史记录超过 100 条, THE IndexedDB_Store SHALL 自动删除最旧的记录
6. WHEN 用户删除某条历史记录, THE IndexedDB_Store SHALL 从数据库中移除对应记录
7. THE IndexedDB_Store SHALL 使用数据库名称 "blockos-db"（复用现有数据库）

### Requirement 4: 图片预览区域

**User Story:** 作为用户，我希望在中间区域查看当前选中图片的大图预览，以便确认图片内容。

#### Acceptance Criteria

1. WHEN 用户选中某个 Photo_Record, THE Preview_Area SHALL 显示该图片的完整预览
2. THE Preview_Area SHALL 保持图片原始宽高比
3. THE Preview_Area SHALL 支持图片缩放（适应容器大小）
4. WHEN 没有选中任何照片, THE Preview_Area SHALL 显示占位提示（"请选择或上传照片"）
5. THE Preview_Area SHALL 在图片加载时显示加载动画
6. THE Preview_Area SHALL 在图片加载失败时显示错误提示

### Requirement 5: 拍照和上传功能

**User Story:** 作为用户，我希望在预览区域直接拍照或上传图片，以便快速添加新照片。

#### Acceptance Criteria

1. THE Preview_Area SHALL 在底部显示"拍照"和"上传图片"按钮
2. WHEN 用户点击"拍照"按钮, THE Preview_Area SHALL 开启摄像头并显示实时视频流
3. WHEN 摄像头开启, THE Preview_Area SHALL 显示"拍摄"按钮
4. WHEN 用户点击"拍摄"按钮, THE Preview_Area SHALL 捕获当前帧并创建新的 Photo_Record
5. WHEN 用户点击"上传图片"按钮, THE Preview_Area SHALL 打开文件选择对话框
6. WHEN 用户选择图片文件, THE Preview_Area SHALL 读取文件并创建新的 Photo_Record
7. WHEN 新照片添加成功, THE History_List SHALL 更新并自动选中新照片

### Requirement 6: OCR 识别结果显示

**User Story:** 作为用户，我希望在右侧区域查看 OCR 识别结果，以便确认识别准确性。

#### Acceptance Criteria

1. WHEN 用户选中某个 Photo_Record, THE Result_Editor SHALL 显示该照片的识别结果
2. WHEN Photo_Record 尚未识别, THE Result_Editor SHALL 显示"点击识别按钮开始识别"提示
3. WHEN OCR 识别进行中, THE Result_Editor SHALL 显示加载动画和进度提示
4. WHEN OCR 识别完成, THE Result_Editor SHALL 显示识别的文本内容
5. WHEN OCR 识别失败, THE Result_Editor SHALL 显示错误信息
6. THE Result_Editor SHALL 支持文本滚动查看（当内容超出可视区域时）

### Requirement 7: OCR 识别触发

**User Story:** 作为用户，我希望手动触发 OCR 识别，以便控制识别时机和节省 API 调用。

#### Acceptance Criteria

1. THE Result_Editor SHALL 在顶部显示"识别文字"按钮
2. WHEN 用户点击"识别文字"按钮, THE Result_Editor SHALL 调用 PaddleOCR API 识别当前选中的照片
3. WHEN OCR 识别成功, THE Result_Editor SHALL 更新显示结果并保存到 Photo_Record
4. WHEN OCR 识别失败, THE Result_Editor SHALL 显示错误提示
5. WHEN Photo_Record 已有识别结果, THE Result_Editor SHALL 显示"重新识别"按钮
6. WHEN 用户点击"重新识别"按钮, THE Result_Editor SHALL 覆盖旧结果并保存新结果

### Requirement 8: 识别结果编辑

**User Story:** 作为用户，我希望编辑 OCR 识别结果，以便修正识别错误或调整格式。

#### Acceptance Criteria

1. THE Result_Editor SHALL 使用可编辑的 textarea 组件显示识别结果
2. WHEN 用户修改文本内容, THE Result_Editor SHALL 实时更新内部状态
3. WHEN 用户修改完成, THE Result_Editor SHALL 在失焦时自动保存到 Photo_Record
4. THE Result_Editor SHALL 支持多行文本编辑
5. THE Result_Editor SHALL 保留文本的换行和空格格式
6. THE Result_Editor SHALL 提供"撤销"和"重做"功能（使用浏览器默认 Ctrl+Z/Ctrl+Y）

### Requirement 9: 识别结果操作

**User Story:** 作为用户，我希望对识别结果执行复制、插入编辑器、保存为 Block 等操作，以便快速使用识别内容。

#### Acceptance Criteria

1. THE Result_Editor SHALL 在底部显示操作按钮栏（"复制"、"插入编辑器"、"保存为 Block"）
2. WHEN 用户点击"复制"按钮, THE Result_Editor SHALL 将识别结果复制到剪贴板
3. WHEN 用户点击"插入编辑器"按钮, THE Result_Editor SHALL 调用 Plugin_API.insertSourceBlock 插入内容
4. WHEN 用户点击"保存为 Block"按钮, THE Result_Editor SHALL 调用 Plugin_API.saveAsBlock 保存内容
5. WHEN 操作成功, THE Result_Editor SHALL 显示成功提示（使用 Plugin_API.showSuccess）
6. WHEN 操作失败, THE Result_Editor SHALL 显示错误提示（使用 Plugin_API.showError）
7. WHEN 识别结果为空, THE Result_Editor SHALL 禁用所有操作按钮

### Requirement 10: 历史记录删除

**User Story:** 作为用户，我希望删除不需要的历史记录，以便保持列表整洁。

#### Acceptance Criteria

1. THE History_List SHALL 在每个 Photo_Record 项上显示删除按钮（悬停时显示）
2. WHEN 用户点击删除按钮, THE History_List SHALL 显示确认对话框
3. WHEN 用户确认删除, THE IndexedDB_Store SHALL 从数据库中删除该 Photo_Record
4. WHEN 删除成功, THE History_List SHALL 从列表中移除该项
5. WHEN 删除的是当前选中项, THE Preview_Area 和 Result_Editor SHALL 清空显示
6. WHEN 删除后列表为空, THE History_List SHALL 显示空状态提示

### Requirement 11: 响应式布局

**User Story:** 作为用户，我希望 OCR 插件在不同屏幕尺寸下都能正常使用，以便在平板和手机上也能使用。

#### Acceptance Criteria

1. WHILE 屏幕宽度 >= 768px, THE OCR_Enhanced_Panel SHALL 显示三栏布局（左中右）
2. WHILE 屏幕宽度 < 768px, THE OCR_Enhanced_Panel SHALL 切换为单栏布局
3. WHILE 单栏布局模式, THE OCR_Enhanced_Panel SHALL 使用标签页切换（历史/预览/结果）
4. WHILE 单栏布局模式, THE OCR_Enhanced_Panel SHALL 默认显示预览标签页
5. THE OCR_Enhanced_Panel SHALL 使用 CSS 媒体查询实现响应式布局
6. THE OCR_Enhanced_Panel SHALL 在布局切换时保持当前选中状态

### Requirement 12: 加载状态和错误处理

**User Story:** 作为用户，我希望看到清晰的加载状态和错误提示，以便了解操作进度和问题原因。

#### Acceptance Criteria

1. WHEN IndexedDB_Store 加载历史记录, THE History_List SHALL 显示加载动画
2. WHEN OCR 识别进行中, THE Result_Editor SHALL 显示加载动画和"识别中..."提示
3. WHEN 摄像头开启中, THE Preview_Area SHALL 显示"正在开启摄像头..."提示
4. WHEN 操作失败, THE OCR_Enhanced_Panel SHALL 显示具体错误信息（而非通用错误）
5. WHEN 网络请求失败, THE OCR_Enhanced_Panel SHALL 显示"网络连接失败，请检查网络设置"
6. WHEN API 认证失败, THE OCR_Enhanced_Panel SHALL 显示"API Token 无效，请检查配置"
7. WHEN 摄像头访问被拒绝, THE OCR_Enhanced_Panel SHALL 显示"无法访问摄像头，请检查浏览器权限"

### Requirement 13: 性能优化

**User Story:** 作为用户，我希望 OCR 插件响应迅速且不占用过多内存，以便流畅使用。

#### Acceptance Criteria

1. THE History_List SHALL 使用虚拟滚动技术（当历史记录超过 50 条时）
2. THE History_List SHALL 使用缩略图（80x80px）而非原图显示
3. THE Preview_Area SHALL 在图片加载时使用懒加载策略
4. THE IndexedDB_Store SHALL 在后台异步加载历史记录（不阻塞 UI 渲染）
5. WHEN 用户关闭摄像头, THE Preview_Area SHALL 立即释放 MediaStream 资源
6. THE OCR_Enhanced_Panel SHALL 在组件卸载时清理所有事件监听器和定时器
7. THE IndexedDB_Store SHALL 限制单张图片的 base64 大小不超过 5MB

### Requirement 14: 可访问性

**User Story:** 作为使用辅助技术的用户，我希望 OCR 插件支持键盘导航和屏幕阅读器，以便无障碍使用。

#### Acceptance Criteria

1. THE History_List SHALL 支持键盘导航（上下箭头键选择项目）
2. THE History_List SHALL 为每个 Photo_Record 提供 aria-label 描述
3. THE Result_Editor SHALL 为所有按钮提供 aria-label 属性
4. THE Preview_Area SHALL 为图片提供 alt 文本描述
5. WHEN 用户使用 Tab 键, THE OCR_Enhanced_Panel SHALL 按逻辑顺序聚焦可交互元素
6. THE OCR_Enhanced_Panel SHALL 使用语义化 HTML 标签（button, nav, main, aside）
7. THE OCR_Enhanced_Panel SHALL 确保所有交互元素的对比度符合 WCAG AA 标准


## Non-Functional Requirements

### NFR-1: 性能要求

1. THE OCR_Enhanced_Panel SHALL 在 100ms 内完成初始渲染
2. THE History_List SHALL 在 200ms 内加载并显示所有历史记录
3. THE Preview_Area SHALL 在 500ms 内加载并显示选中图片
4. THE Result_Editor SHALL 在用户输入时保持 60fps 的流畅度
5. THE IndexedDB_Store SHALL 在 100ms 内完成单条记录的读写操作
6. THE OCR_Enhanced_Panel SHALL 在内存占用不超过 50MB（不含图片数据）

### NFR-2: 可用性要求

1. THE OCR_Enhanced_Panel SHALL 提供清晰的视觉反馈（按钮悬停、点击、禁用状态）
2. THE OCR_Enhanced_Panel SHALL 使用一致的图标和颜色语义（成功=绿色、错误=红色、警告=黄色）
3. THE OCR_Enhanced_Panel SHALL 提供键盘快捷键（Ctrl+V 粘贴图片、Ctrl+C 复制结果）
4. THE OCR_Enhanced_Panel SHALL 在所有操作完成后提供明确的成功/失败提示
5. THE OCR_Enhanced_Panel SHALL 使用中文界面和提示信息

### NFR-3: 可维护性要求

1. THE OCR_Enhanced_Panel SHALL 使用 TypeScript 严格模式（所有函数参数和返回值有明确类型）
2. THE OCR_Enhanced_Panel SHALL 遵循单一职责原则（每个组件/函数只负责一个功能）
3. THE OCR_Enhanced_Panel SHALL 避免循环依赖（依赖方向严格单向向下）
4. THE OCR_Enhanced_Panel SHALL 提供完整的 JSDoc 注释（所有公共接口）
5. THE OCR_Enhanced_Panel SHALL 使用语义化的变量和函数命名

### NFR-4: 兼容性要求

1. THE OCR_Enhanced_Panel SHALL 支持 Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
2. THE OCR_Enhanced_Panel SHALL 支持 iOS Safari 14+ 和 Android Chrome 90+
3. THE OCR_Enhanced_Panel SHALL 在不支持 IndexedDB 的浏览器中降级为内存存储
4. THE OCR_Enhanced_Panel SHALL 在不支持 MediaDevices API 的浏览器中隐藏拍照功能
5. THE OCR_Enhanced_Panel SHALL 使用 Vite 6 构建并支持 ES2020+ 语法

### NFR-5: 安全性要求

1. THE OCR_Enhanced_Panel SHALL 仅通过 Plugin_API 访问主应用功能（不直接访问全局状态）
2. THE IndexedDB_Store SHALL 仅存储用户主动上传/拍摄的图片（不存储敏感信息）
3. THE OCR_Enhanced_Panel SHALL 在调用 PaddleOCR API 时使用 HTTPS 协议
4. THE OCR_Enhanced_Panel SHALL 对用户输入进行转义（防止 XSS 攻击）
5. THE OCR_Enhanced_Panel SHALL 在组件卸载时清理所有敏感数据（base64 图片数据）

### NFR-6: 可扩展性要求

1. THE OCR_Enhanced_Panel SHALL 支持未来添加更多 OCR 服务提供商（通过配置切换）
2. THE IndexedDB_Store SHALL 支持数据库版本升级（使用 onupgradeneeded 回调）
3. THE Photo_Record SHALL 支持扩展字段（使用可选属性）
4. THE OCR_Enhanced_Panel SHALL 支持插件主题定制（使用 CSS 变量）
5. THE OCR_Enhanced_Panel SHALL 支持国际化（使用 i18n 框架，当前仅支持中文）


## Correctness Properties

本节定义用于 Property-Based Testing 的正确性属性，确保系统在各种输入条件下的行为符合预期。

### Property 1: 历史记录持久化的往返属性（Round Trip）

**描述**：保存到 IndexedDB 的 Photo_Record 在读取后应与原始数据完全一致。

**属性**：
```
FOR ALL valid Photo_Record pr:
  save(pr) THEN load(pr.id) == pr
```

**测试策略**：
- 生成随机的 Photo_Record（包含不同大小的 base64 图片、时间戳、识别结果）
- 保存到 IndexedDB
- 立即读取并比较
- 验证所有字段（id、imageData、timestamp、ocrResult、status）完全相同

**测试工具**：使用 fast-check 生成随机 Photo_Record

### Property 2: 历史记录排序的不变性（Invariant）

**描述**：无论以何种顺序添加 Photo_Record，History_List 始终按时间戳倒序排列。

**属性**：
```
FOR ALL Photo_Record[] records:
  addAll(records) THEN
  History_List[i].timestamp >= History_List[i+1].timestamp
  FOR ALL i in [0, length-2]
```

**测试策略**：
- 生成随机顺序的 Photo_Record 数组
- 批量添加到 History_List
- 验证列表按时间戳倒序排列
- 验证排序稳定性（相同时间戳的记录保持原始顺序）

**测试工具**：使用 fast-check 生成随机时间戳序列

### Property 3: 历史记录数量限制的不变性（Invariant）

**描述**：无论添加多少条记录，IndexedDB_Store 中的记录数量始终不超过 100 条。

**属性**：
```
FOR ALL Photo_Record[] records WHERE records.length > 100:
  addAll(records) THEN
  count(IndexedDB_Store) <= 100 AND
  IndexedDB_Store contains最新的 100 条记录
```

**测试策略**：
- 生成超过 100 条的 Photo_Record 数组
- 批量添加到 IndexedDB_Store
- 验证存储的记录数量 <= 100
- 验证保留的是最新的 100 条记录（按时间戳）

**测试工具**：使用 fast-check 生成大量随机记录

### Property 4: 图片缩放的不变性（Invariant）

**描述**：无论图片原始尺寸如何，Preview_Area 显示的图片始终保持原始宽高比。

**属性**：
```
FOR ALL Image img:
  display(img) THEN
  displayedWidth / displayedHeight == img.width / img.height
```

**测试策略**：
- 生成不同宽高比的图片（正方形、横向、纵向、极端比例）
- 在不同容器尺寸下渲染
- 验证显示的宽高比与原始宽高比一致（允许 1% 误差）

**测试工具**：使用 fast-check 生成随机宽高值

### Property 5: OCR 识别结果的幂等性（Idempotence）

**描述**：对同一张图片多次识别，结果应该一致（假设 API 稳定）。

**属性**：
```
FOR ALL Photo_Record pr:
  recognize(pr) == recognize(pr)
```

**测试策略**：
- 选择一张测试图片
- 多次调用 OCR API 识别
- 验证所有识别结果相同（或相似度 > 95%）
- 注意：由于 API 可能有随机性，使用相似度而非完全相等

**测试工具**：使用字符串相似度算法（Levenshtein Distance）

### Property 6: 编辑结果的往返属性（Round Trip）

**描述**：用户编辑识别结果后保存，再次加载应得到编辑后的内容。

**属性**：
```
FOR ALL Photo_Record pr, String editedText:
  edit(pr, editedText) THEN save(pr) THEN load(pr.id).ocrResult == editedText
```

**测试策略**：
- 生成随机的编辑文本（包含换行、空格、特殊字符）
- 编辑 Photo_Record 的 ocrResult
- 保存到 IndexedDB
- 重新加载并验证内容一致

**测试工具**：使用 fast-check 生成随机字符串

### Property 7: 删除操作的正确性（Metamorphic）

**描述**：删除一条记录后，列表长度减 1，且该记录不再存在。

**属性**：
```
FOR ALL Photo_Record pr:
  LET initialCount = count(History_List)
  delete(pr) THEN
  count(History_List) == initialCount - 1 AND
  NOT exists(pr.id)
```

**测试策略**：
- 添加多条随机记录
- 随机选择一条删除
- 验证列表长度减 1
- 验证该记录不再存在于列表和 IndexedDB 中

**测试工具**：使用 fast-check 生成随机删除序列

### Property 8: 响应式布局切换的不变性（Invariant）

**描述**：布局切换时，当前选中的 Photo_Record 保持不变。

**属性**：
```
FOR ALL Photo_Record pr:
  select(pr) THEN
  resizeWindow(width) THEN
  selectedRecord == pr
```

**测试策略**：
- 选中一条记录
- 模拟窗口尺寸变化（768px 前后）
- 验证选中状态保持不变
- 验证预览和结果显示保持一致

**测试工具**：使用 jsdom 模拟窗口尺寸变化

### Property 9: Base64 编码的往返属性（Round Trip）

**描述**：图片转换为 base64 后再解码，应得到相同的图片数据。

**属性**：
```
FOR ALL Image img:
  decode(encode(img)) == img
```

**测试策略**：
- 生成不同格式的图片（JPEG、PNG、WebP）
- 转换为 base64
- 解码回图片
- 验证图片数据一致（允许 JPEG 有损压缩的误差）

**测试工具**：使用 Canvas API 进行像素级比较

### Property 10: 错误处理的完整性（Error Conditions）

**描述**：所有可能的错误输入都应被正确处理，不导致崩溃。

**属性**：
```
FOR ALL invalid input:
  operation(input) THEN
  (returns error message OR throws expected exception) AND
  NOT crashes
```

**测试策略**：
- 生成各种无效输入（空字符串、null、undefined、超大图片、损坏的 base64）
- 调用所有公共方法
- 验证返回错误信息或抛出预期异常
- 验证应用不崩溃，UI 保持响应

**测试工具**：使用 fast-check 生成边界值和无效输入


## Constraints and Assumptions

### Technical Constraints

1. **插件系统架构约束**：
   - 必须完全兼容现有的插件系统架构（IPlugin 接口、Plugin_API、PluginRegistry）
   - 不得修改插件系统核心代码（pluginAPI.ts、pluginRegistry.ts）
   - 必须通过 Plugin_API 访问主应用功能（不直接访问 Editor、BlockStore）

2. **技术栈约束**：
   - 必须使用 React 18 + TypeScript 5（严格模式）
   - 必须使用 TipTap 2 编辑器扩展（通过 Plugin_API）
   - 必须使用 IndexedDB 本地存储（数据库名称：blockos-db）
   - 必须使用 Bun 包管理器（不引入新的大型框架）

3. **代码质量约束**：
   - 所有函数参数和返回值必须有明确类型
   - 禁止循环依赖，依赖方向严格单向向下
   - 每个文件单一职责
   - 代码修改后必须通过 `bun run type-check`

4. **性能约束**：
   - 单张图片的 base64 大小不超过 5MB
   - 历史记录最多存储 100 条
   - 初始渲染时间不超过 100ms
   - IndexedDB 读写操作不超过 100ms

5. **浏览器兼容性约束**：
   - 必须支持 Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
   - 必须支持 iOS Safari 14+ 和 Android Chrome 90+
   - 在不支持 IndexedDB 的浏览器中降级为内存存储
   - 在不支持 MediaDevices API 的浏览器中隐藏拍照功能

### Business Constraints

1. **用户体验约束**：
   - 界面必须使用中文（UI 文本、提示信息、错误消息）
   - 必须提供清晰的加载状态和错误提示
   - 必须支持键盘导航和屏幕阅读器（WCAG AA 标准）

2. **分阶段实施约束**：
   - 用户明确要求分三步制作界面
   - 第一步：实现基础三栏布局和历史记录列表
   - 第二步：实现图片预览和拍照/上传功能
   - 第三步：实现识别结果编辑和操作功能

3. **API 使用约束**：
   - 必须复用现有的 PaddleOCR API 配置（apiUrl、apiToken）
   - 必须通过 Vite 代理访问 OCR API（开发环境）
   - 必须处理 API 调用失败的情况（网络错误、认证失败、超时）

### Assumptions

1. **用户行为假设**：
   - 用户主要使用桌面浏览器（Chrome/Edge），偶尔使用平板
   - 用户每次会话平均上传/拍摄 5-10 张照片
   - 用户会定期清理历史记录（不会无限增长）
   - 用户主要识别中文和英文文本

2. **数据假设**：
   - 单张图片的平均大小为 1-3MB（压缩后）
   - OCR 识别结果的平均长度为 100-500 字符
   - 历史记录的平均保留时间为 7-30 天
   - IndexedDB 可用空间至少为 50MB

3. **API 假设**：
   - PaddleOCR API 的平均响应时间为 2-5 秒
   - PaddleOCR API 的识别准确率为 90%+（清晰图片）
   - PaddleOCR API 支持 CORS 或通过代理访问
   - PaddleOCR API 的 Token 长期有效（不会频繁过期）

4. **环境假设**：
   - 用户的浏览器支持 ES2020+ 语法
   - 用户的浏览器启用了 JavaScript 和 IndexedDB
   - 用户的设备有摄像头（如果使用拍照功能）
   - 用户的网络连接稳定（至少 1Mbps）

5. **现有系统假设**：
   - 现有的插件系统已经稳定运行
   - Plugin_API 提供的接口功能完整且可靠
   - IndexedDB 数据库 "blockos-db" 已经存在
   - TipTap 编辑器支持 SourceBlock 扩展

### Out of Scope

以下功能不在本次需求范围内：

1. **高级编辑功能**：
   - 富文本编辑（粗体、斜体、列表等）
   - 语法高亮
   - 拼写检查
   - 自动翻译

2. **高级图片处理**：
   - 图片裁剪、旋转、滤镜
   - 图片批量上传
   - 图片压缩设置
   - 图片格式转换

3. **高级 OCR 功能**：
   - 多语言识别切换
   - 表格识别
   - 公式识别
   - 手写识别

4. **云同步功能**：
   - 历史记录云同步
   - 跨设备访问
   - 协作编辑

5. **高级搜索功能**：
   - 全文搜索历史记录
   - 按标签过滤
   - 按日期范围过滤

6. **导出功能**：
   - 批量导出识别结果
   - 导出为 PDF/Word
   - 导出为图片

### Dependencies

本功能依赖以下现有系统和组件：

1. **插件系统核心**：
   - `src/types/plugin.ts` - 插件类型定义
   - `src/services/pluginAPI.ts` - 插件 API 实现
   - `src/services/pluginRegistry.ts` - 插件注册表
   - `src/storage/pluginConfigStore.ts` - 插件配置存储

2. **现有 OCR 插件**：
   - `src/plugins/ocr-plugin/ocrService.ts` - OCR API 调用服务
   - `src/plugins/ocr-plugin/index.ts` - OCR 插件入口

3. **主应用组件**：
   - `src/components/layout/ExtensionsView.tsx` - 插件视图
   - `src/storage/blockStore.ts` - Block 存储
   - `src/components/editor/Editor.tsx` - TipTap 编辑器

4. **工具和类型**：
   - `src/utils/uuid.ts` - UUID 生成
   - `src/utils/date.ts` - 日期格式化
   - `src/types/block.ts` - Block 类型定义

5. **外部依赖**：
   - React 18
   - TypeScript 5
   - TipTap 2
   - IndexedDB API（浏览器原生）
   - MediaDevices API（浏览器原生）
   - Canvas API（浏览器原生）

### Risk Analysis

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| IndexedDB 存储空间不足 | 高 | 中 | 限制历史记录数量（100 条），提供清理功能 |
| OCR API 调用失败 | 高 | 中 | 提供重试机制，显示清晰错误提示 |
| 大图片导致内存溢出 | 高 | 低 | 限制图片大小（5MB），使用缩略图 |
| 浏览器不支持 MediaDevices API | 中 | 低 | 降级为仅支持上传图片 |
| 响应式布局在小屏幕上体验差 | 中 | 中 | 提供单栏布局和标签页切换 |
| 历史记录加载缓慢 | 中 | 低 | 使用虚拟滚动，异步加载 |
| 识别结果编辑丢失 | 高 | 低 | 自动保存，提供撤销功能 |
| 插件系统 API 变更 | 高 | 低 | 遵循插件系统接口规范，避免直接访问内部实现 |

---

**文档版本**：v1.0  
**创建日期**：2026-04-15  
**作者**：BlockOS Team  
**审核状态**：待审核
