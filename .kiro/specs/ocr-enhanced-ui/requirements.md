# Requirements Document

## Introduction

本文档定义了 OCR 插件 UI/UX 增强功能的需求规格。该功能旨在将现有的单栏 OCR 界面升级为**专业级 OCR 解析工作站**，提供三栏布局、照片历史记录管理、识别区域可视化、多模型切换、图片预览控制和结果编辑等专业功能，显著提升用户体验和工作效率。

**背景**：
- 现有 OCR 插件提供基础的图片识别功能（拍照/上传 → 识别 → 插入/保存）
- 用户反馈需要更强大的历史记录管理、识别结果可视化和编辑能力
- 参考设计展示了专业级 OCR 解析工作站的完整方案

**目标**：
- 提供直观的三栏布局界面（历史记录 + 预览 + 结果）
- 支持照片历史记录的持久化存储、分类管理和搜索
- **提供识别区域可视化（Bounding Boxes）和交互式定位**
- **支持多 OCR 模型切换和对比**
- 提供专业的图片预览控制（缩放、旋转、页码切换）
- 增强 OCR 结果的编辑和操作能力（多视图、导出）
- 保持与现有插件系统架构的完全兼容

## Glossary

- **OCR_Enhanced_Panel**: OCR 增强面板，替代现有 OCRPanel 的新三栏布局组件
- **History_List**: 历史记录列表，显示用户上传/拍摄的照片历史
- **Preview_Area**: 预览区域，显示当前选中图片的大图预览
- **Result_Editor**: 结果编辑器，显示和编辑 OCR 识别结果
- **Photo_Record**: 照片记录，包含图片数据、识别结果、时间戳、文件名等信息
- **IndexedDB_Store**: IndexedDB 存储，用于持久化照片历史记录
- **Plugin_API**: 插件 API，OCR 插件与主应用交互的桥接接口
- **SourceBlock**: 来源块，TipTap 编辑器中的特殊块类型，用于标记外部来源的内容
- **Block**: 知识块，BlockOS 的最小知识单元
- **Bounding_Box**: 识别区域边界框，标记 OCR 识别到的文本区域位置
- **OCR_Model**: OCR 识别模型，如 PaddleOCR-VL-1.5
- **Preview_Toolbar**: 预览工具栏，提供缩放、旋转、页码切换等控制
- **Confidence_Score**: 置信度分数，表示 OCR 识别结果的可信程度（0-1）
- **Favorite_Record**: 收藏记录，用户标记为重要的照片记录


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

### Requirement 15: 历史记录分类和搜索

**User Story:** 作为用户，我希望对历史记录进行分类管理和搜索，以便快速找到需要的照片。

#### Acceptance Criteria

1. THE History_List SHALL 在顶部显示"最近上传"和"我的收藏"两个标签页
2. WHEN 用户点击"最近上传"标签, THE History_List SHALL 显示所有照片记录（按时间倒序）
3. WHEN 用户点击"我的收藏"标签, THE History_List SHALL 仅显示已收藏的照片记录
4. THE History_List SHALL 在每个 Photo_Record 项上显示收藏按钮（星标图标）
5. WHEN 用户点击收藏按钮, THE IndexedDB_Store SHALL 切换该记录的收藏状态
6. THE History_List SHALL 在顶部显示搜索框
7. WHEN 用户输入搜索关键词, THE History_List SHALL 实时过滤显示匹配文件名的记录
8. THE History_List SHALL 支持按文件名模糊搜索（不区分大小写）
9. WHEN 搜索结果为空, THE History_List SHALL 显示"未找到匹配的记录"提示

### Requirement 16: 历史记录顶部操作区

**User Story:** 作为用户，我希望在历史记录区域顶部有全局操作入口，以便快速创建新解析或访问设置。

#### Acceptance Criteria

1. THE History_List SHALL 在顶部显示"+ 新解析"按钮
2. WHEN 用户点击"+ 新解析"按钮, THE OCR_Enhanced_Panel SHALL 清空当前选择并显示上传/拍照提示
3. THE History_List SHALL 在顶部显示"系统设置"图标按钮
4. WHEN 用户点击"系统设置"按钮, THE OCR_Enhanced_Panel SHALL 打开插件配置面板
5. THE History_List SHALL 在顶部显示当前历史记录总数（如"共 42 条记录"）

### Requirement 17: 照片元数据显示

**User Story:** 作为用户，我希望查看照片的详细元数据，以便了解文件信息。

#### Acceptance Criteria

1. THE Preview_Area SHALL 在顶部显示当前照片的文件名（如"ink-1.png"）
2. THE Preview_Area SHALL 在文件名旁显示文件大小（如"42.91KB"）
3. THE Preview_Area SHALL 显示照片的上传时间（如"2026-04-15 14:30"）
4. THE Preview_Area SHALL 支持点击文件名进行重命名
5. WHEN 用户重命名文件, THE IndexedDB_Store SHALL 更新 Photo_Record 的文件名
6. THE Preview_Area SHALL 在文件名过长时使用省略号显示（最多 30 个字符）

### Requirement 18: 识别区域可视化（核心专业功能）

**User Story:** 作为用户，我希望在图片上看到 OCR 识别的文本区域高亮框，以便直观了解识别范围和准确性。

#### Acceptance Criteria

1. WHEN OCR 识别完成, THE Preview_Area SHALL 在图片上渲染蓝色高亮边界框（Bounding_Box）
2. FOR ALL 识别到的文本块, THE Preview_Area SHALL 显示对应的 Bounding_Box
3. THE Bounding_Box SHALL 使用半透明蓝色边框（rgba(0, 123, 255, 0.6)）和浅蓝色填充（rgba(0, 123, 255, 0.1)）
4. WHEN 用户点击某个 Bounding_Box, THE Result_Editor SHALL 自动滚动并高亮对应的文本块
5. WHEN 用户悬停在 Bounding_Box 上, THE Preview_Area SHALL 显示该区域的置信度分数（如"置信度: 95%"）
6. THE Preview_Area SHALL 在底部工具栏提供"显示/隐藏识别框"切换按钮
7. WHEN 用户点击切换按钮, THE Preview_Area SHALL 切换 Bounding_Box 的显示状态
8. THE Bounding_Box SHALL 根据图片缩放比例自动调整位置和大小
9. WHEN 用户在 Result_Editor 中选中文本, THE Preview_Area SHALL 高亮对应的 Bounding_Box（使用不同颜色）

### Requirement 19: 预览控制工具栏

**User Story:** 作为用户，我希望精确控制图片预览的显示方式，以便查看细节或调整视角。

#### Acceptance Criteria

1. THE Preview_Area SHALL 在底部显示预览控制工具栏（Preview_Toolbar）
2. THE Preview_Toolbar SHALL 显示当前页码和总页数（如"1 / 1"，支持多页文档）
3. THE Preview_Toolbar SHALL 提供"上一页"和"下一页"按钮（多页文档时启用）
4. THE Preview_Toolbar SHALL 提供"放大"按钮（+ 图标）
5. THE Preview_Toolbar SHALL 提供"缩小"按钮（- 图标）
6. THE Preview_Toolbar SHALL 显示当前缩放比例（如"100%"）
7. WHEN 用户点击放大按钮, THE Preview_Area SHALL 将缩放比例增加 25%（最大 400%）
8. WHEN 用户点击缩小按钮, THE Preview_Area SHALL 将缩放比例减少 25%（最小 25%）
9. THE Preview_Toolbar SHALL 提供"顺时针旋转"按钮
10. THE Preview_Toolbar SHALL 提供"逆时针旋转"按钮
11. WHEN 用户点击旋转按钮, THE Preview_Area SHALL 旋转图片 90 度
12. THE Preview_Toolbar SHALL 提供"重置"按钮
13. WHEN 用户点击重置按钮, THE Preview_Area SHALL 恢复原始缩放比例（100%）和旋转角度（0 度）
14. THE Preview_Toolbar SHALL 提供"适应宽度"和"适应高度"切换按钮
15. WHEN 用户点击"适应宽度", THE Preview_Area SHALL 调整缩放比例使图片宽度填满容器
16. WHEN 用户点击"适应高度", THE Preview_Area SHALL 调整缩放比例使图片高度填满容器

### Requirement 20: OCR 模型选择和切换

**User Story:** 作为用户，我希望在不同 OCR 模型之间切换，以便对比识别效果或使用特定模型。

#### Acceptance Criteria

1. THE Result_Editor SHALL 在顶部显示"解析模型"下拉菜单
2. THE Result_Editor SHALL 列出可用的 OCR 模型（如"PaddleOCR-VL-1.5 NEW"、"PaddleOCR-Standard"）
3. WHEN 用户选择不同模型, THE Result_Editor SHALL 使用新模型重新识别当前照片
4. WHEN 模型切换识别进行中, THE Result_Editor SHALL 显示"正在使用 [模型名] 识别..."提示
5. WHEN 模型切换识别完成, THE Result_Editor SHALL 更新显示结果并保存到 Photo_Record
6. THE Result_Editor SHALL 在 Photo_Record 中记录使用的模型名称
7. THE Result_Editor SHALL 在模型名称旁显示"NEW"标签（对于新模型）
8. THE Result_Editor SHALL 支持通过 Plugin_API 配置可用模型列表

### Requirement 21: 识别结果多视图

**User Story:** 作为用户，我希望以不同格式查看识别结果，以便满足不同使用场景。

#### Acceptance Criteria

1. THE Result_Editor SHALL 在顶部显示"文档解析"和"JSON"两个标签页
2. WHEN 用户点击"文档解析"标签, THE Result_Editor SHALL 显示渲染后的文本内容（可编辑 textarea）
3. WHEN 用户点击"JSON"标签, THE Result_Editor SHALL 显示原始 API 响应数据（只读）
4. THE Result_Editor SHALL 在 JSON 视图中使用语法高亮显示
5. THE Result_Editor SHALL 在 JSON 视图中支持折叠/展开对象和数组
6. THE Result_Editor SHALL 在 JSON 视图中显示数据结构（如识别区域坐标、置信度、文本内容）
7. WHEN 用户在 JSON 视图中选中文本, THE Result_Editor SHALL 提供"复制"按钮

### Requirement 22: 识别结果顶部快捷操作

**User Story:** 作为用户，我希望在结果区域顶部有快捷操作按钮，以便高效执行常用操作。

#### Acceptance Criteria

1. THE Result_Editor SHALL 在右上角显示快捷操作图标组
2. THE Result_Editor SHALL 提供"复制"图标按钮（复制当前视图内容）
3. WHEN 用户点击复制按钮, THE Result_Editor SHALL 复制当前标签页的内容到剪贴板
4. THE Result_Editor SHALL 提供"同步/刷新"图标按钮（重新识别）
5. WHEN 用户点击刷新按钮, THE Result_Editor SHALL 使用当前模型重新识别照片
6. THE Result_Editor SHALL 提供"保存"图标按钮（保存编辑）
7. WHEN 用户点击保存按钮, THE Result_Editor SHALL 将编辑后的内容保存到 Photo_Record
8. THE Result_Editor SHALL 提供"下载"图标按钮（导出为文件）
9. WHEN 用户点击下载按钮, THE Result_Editor SHALL 打开导出选项菜单（TXT、JSON、Markdown）
10. WHEN 用户选择导出格式, THE Result_Editor SHALL 下载对应格式的文件
11. THE Result_Editor SHALL 将原来底部的操作按钮移到顶部快捷操作区

### Requirement 23: 置信度显示和标记

**User Story:** 作为用户，我希望看到每个识别文本块的置信度，以便判断识别准确性。

#### Acceptance Criteria

1. WHEN OCR 识别完成, THE Result_Editor SHALL 在每个文本块旁显示置信度分数（如"95%"）
2. THE Result_Editor SHALL 使用颜色标记不同置信度等级：
   - 高置信度（>= 90%）：绿色
   - 中置信度（70%-89%）：黄色
   - 低置信度（< 70%）：红色
3. THE Result_Editor SHALL 在低置信度文本下方显示波浪线标记
4. WHEN 用户悬停在置信度标记上, THE Result_Editor SHALL 显示详细信息（置信度分数、建议操作）
5. THE Result_Editor SHALL 提供"仅显示低置信度"过滤选项
6. WHEN 用户启用过滤, THE Result_Editor SHALL 仅显示置信度 < 70% 的文本块
7. THE Result_Editor SHALL 在 JSON 视图中显示每个文本块的原始置信度数值

### Requirement 24: 历史记录文件名显示

**User Story:** 作为用户，我希望历史记录列表显示文件名而非仅时间戳，以便快速识别照片。

#### Acceptance Criteria

1. THE History_List SHALL 在每个 Photo_Record 项上显示文件名（而非仅时间戳）
2. WHEN 用户上传文件, THE History_List SHALL 使用原始文件名
3. WHEN 用户拍照, THE History_List SHALL 自动生成文件名（如"拍照_20260415_143052.jpg"）
4. THE History_List SHALL 在文件名下方显示时间戳（如"2 小时前"）
5. THE History_List SHALL 在文件名过长时使用省略号（最多 20 个字符）
6. WHEN 用户悬停在文件名上, THE History_List SHALL 显示完整文件名（tooltip）


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

### Property 11: 识别区域坐标的不变性（Invariant）

**描述**：无论图片如何缩放或旋转，Bounding_Box 的相对位置保持不变。

**属性**：
```
FOR ALL Bounding_Box bbox, Image img, Scale scale, Rotation rotation:
  transform(bbox, scale, rotation) THEN
  relativePosition(bbox, img) == originalRelativePosition(bbox, img)
```

**测试策略**：
- 生成随机的 Bounding_Box 坐标
- 应用不同的缩放比例（25%-400%）和旋转角度（0°, 90°, 180°, 270°）
- 验证 Bounding_Box 相对于图片的位置保持不变
- 验证 Bounding_Box 的宽高比与图片缩放比例一致

**测试工具**：使用 fast-check 生成随机变换参数

### Property 12: 模型切换的一致性（Metamorphic）

**描述**：切换模型后重新识别，结果应该更新且与新模型对应。

**属性**：
```
FOR ALL Photo_Record pr, OCR_Model model1, OCR_Model model2:
  recognize(pr, model1) THEN switchModel(model2) THEN recognize(pr, model2) THEN
  pr.ocrResult != previousResult AND
  pr.modelName == model2.name
```

**测试策略**：
- 使用同一张图片
- 依次使用不同模型识别
- 验证每次识别结果都被正确保存
- 验证 Photo_Record 中记录的模型名称正确

**测试工具**：使用 mock OCR API 返回不同结果

### Property 13: 收藏状态的往返属性（Round Trip）

**描述**：收藏/取消收藏操作后保存，再次加载应得到正确的收藏状态。

**属性**：
```
FOR ALL Photo_Record pr:
  toggleFavorite(pr) THEN save(pr) THEN load(pr.id).isFavorite == !pr.isFavorite
```

**测试策略**：
- 生成随机的 Photo_Record
- 切换收藏状态
- 保存到 IndexedDB
- 重新加载并验证收藏状态正确

**测试工具**：使用 fast-check 生成随机收藏状态序列

### Property 14: 搜索过滤的正确性（Metamorphic）

**描述**：搜索结果应该是原列表的子集，且所有结果都匹配搜索关键词。

**属性**：
```
FOR ALL Photo_Record[] records, String query:
  LET results = search(records, query)
  results.length <= records.length AND
  FOR ALL r IN results: r.fileName.contains(query, ignoreCase=true)
```

**测试策略**：
- 生成随机的 Photo_Record 数组（包含不同文件名）
- 生成随机搜索关键词
- 验证搜索结果是原列表的子集
- 验证所有结果的文件名都包含关键词（不区分大小写）

**测试工具**：使用 fast-check 生成随机文件名和搜索词

### Property 15: 置信度标记的一致性（Invariant）

**描述**：置信度分数与颜色标记应该一致对应。

**属性**：
```
FOR ALL Confidence_Score score:
  IF score >= 0.9 THEN color == 'green'
  ELSE IF score >= 0.7 THEN color == 'yellow'
  ELSE color == 'red'
```

**测试策略**：
- 生成随机的置信度分数（0-1）
- 验证颜色标记与分数范围一致
- 验证边界值（0.7, 0.9）的处理正确

**测试工具**：使用 fast-check 生成随机置信度值


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
   - Bounding_Box 渲染不影响图片预览性能（保持 60fps）

5. **浏览器兼容性约束**：
   - 必须支持 Chrome 90+、Firefox 88+、Safari 14+、Edge 90+
   - 必须支持 iOS Safari 14+ 和 Android Chrome 90+
   - 在不支持 IndexedDB 的浏览器中降级为内存存储
   - 在不支持 MediaDevices API 的浏览器中隐藏拍照功能
   - Canvas 2D API 用于 Bounding_Box 渲染（所有现代浏览器支持）

6. **OCR API 约束**：
   - OCR API 必须返回识别区域坐标（Bounding_Box 坐标）
   - OCR API 必须返回每个文本块的置信度分数
   - 支持多模型切换（通过不同 API 端点或参数）
   - API 响应格式必须包含结构化数据（支持 JSON 视图）
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
   - 用户明确要求分阶段制作界面
   - 第一步：实现基础三栏布局、历史记录列表（含分类和搜索）、顶部操作区
   - 第二步：实现图片预览、拍照/上传功能、预览控制工具栏、元数据显示
   - 第三步：实现识别区域可视化（Bounding_Box）、交互式定位
   - 第四步：实现识别结果编辑、多视图（文档/JSON）、模型切换、置信度显示
   - 第五步：实现顶部快捷操作、导出功能、性能优化

3. **API 使用约束**：
   - 必须复用现有的 PaddleOCR API 配置（apiUrl、apiToken）
   - 必须通过 Vite 代理访问 OCR API（开发环境）
   - 必须处理 API 调用失败的情况（网络错误、认证失败、超时）
   - OCR API 响应必须包含 Bounding_Box 坐标和置信度数据

4. **专业功能优先级约束**：
   - **识别区域可视化（Bounding_Box）是最高优先级功能**
   - 模型切换功能次之
   - JSON 视图和置信度显示为第三优先级
   - 预览工具栏和快捷操作为第四优先级

### Assumptions

1. **用户行为假设**：
   - 用户主要使用桌面浏览器（Chrome/Edge），偶尔使用平板
   - 用户每次会话平均上传/拍摄 5-10 张照片
   - 用户会定期清理历史记录（不会无限增长）
   - 用户主要识别中文和英文文本
   - 用户会使用收藏功能标记重要照片（约 10-20% 的照片）
   - 用户会使用搜索功能查找历史照片（按文件名）

2. **数据假设**：
   - 单张图片的平均大小为 1-3MB（压缩后）
   - OCR 识别结果的平均长度为 100-500 字符
   - 历史记录的平均保留时间为 7-30 天
   - IndexedDB 可用空间至少为 50MB
   - 每张图片平均包含 5-15 个识别区域（Bounding_Box）
   - 置信度分数范围为 0-1，平均值约 0.85

3. **API 假设**：
   - PaddleOCR API 的平均响应时间为 2-5 秒
   - PaddleOCR API 的识别准确率为 90%+（清晰图片）
   - PaddleOCR API 支持 CORS 或通过代理访问
   - PaddleOCR API 的 Token 长期有效（不会频繁过期）
   - **PaddleOCR API 返回结构化数据（包含 Bounding_Box 坐标和置信度）**
   - **支持多个 OCR 模型（通过不同端点或参数切换）**

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

以下功能不在本次需求范围内（但可在未来版本中考虑）：

1. **高级编辑功能**：
   - 富文本编辑（粗体、斜体、列表等）
   - 语法高亮
   - 拼写检查
   - 自动翻译

2. **高级图片处理**：
   - 图片裁剪功能（预览工具栏仅支持缩放和旋转）
   - 图片滤镜和调色
   - 图片批量上传
   - 图片压缩设置
   - 图片格式转换

3. **高级 OCR 功能**：
   - 多语言识别切换（当前仅支持中英文）
   - 表格识别和结构化输出
   - 公式识别
   - 手写识别
   - 实时视频流识别

4. **云同步功能**：
   - 历史记录云同步
   - 跨设备访问
   - 协作编辑

5. **高级搜索功能**：
   - 全文搜索历史记录（当前仅支持文件名搜索）
   - 按标签过滤
   - 按日期范围过滤
   - 按置信度过滤

6. **批量操作功能**：
   - 批量导出识别结果
   - 批量删除历史记录
   - 批量重新识别

7. **高级导出功能**：
   - 导出为 PDF/Word（当前仅支持 TXT、JSON、Markdown）
   - 导出为图片（带标注的 Bounding_Box）
   - 自定义导出模板

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
   - Canvas API（浏览器原生，用于 Bounding_Box 渲染）

### Risk Analysis

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| IndexedDB 存储空间不足 | 高 | 中 | 限制历史记录数量（100 条），提供清理功能 |
| OCR API 调用失败 | 高 | 中 | 提供重试机制，显示清晰错误提示 |
| 大图片导致内存溢出 | 高 | 低 | 限制图片大小（5MB），使用缩略图 |
| **OCR API 不返回 Bounding_Box 坐标** | **高** | **中** | **与 API 提供方确认数据格式，或使用 mock 数据开发** |
| **Bounding_Box 渲染性能问题** | **中** | **中** | **使用 Canvas 离屏渲染，限制渲染频率（防抖）** |
| **多模型切换导致配置复杂** | **中** | **低** | **提供默认模型配置，支持通过 Plugin_API 扩展** |
| 浏览器不支持 MediaDevices API | 中 | 低 | 降级为仅支持上传图片 |
| 响应式布局在小屏幕上体验差 | 中 | 中 | 提供单栏布局和标签页切换 |
| 历史记录加载缓慢 | 中 | 低 | 使用虚拟滚动，异步加载 |
| 识别结果编辑丢失 | 高 | 低 | 自动保存，提供撤销功能 |
| 插件系统 API 变更 | 高 | 低 | 遵循插件系统接口规范，避免直接访问内部实现 |
| **置信度数据不准确或缺失** | **中** | **中** | **提供默认置信度（0.5），允许用户手动标记** |

---

**文档版本**：v2.0（专业级 OCR 解析工作站）  
**创建日期**：2026-04-15  
**最后更新**：2026-04-15  
**作者**：BlockOS Team  
**审核状态**：待审核

**更新说明**：
- 从基础款 OCR 插件升级为专业级 OCR 解析工作站
- 新增 10 个专业功能需求（Requirement 15-24）
- 新增识别区域可视化（Bounding_Box）、模型切换、多视图等核心功能
- 新增 5 个 Correctness Properties（Property 11-15）
- 更新分阶段实施计划（从 3 步扩展为 5 步）
- 更新约束、假设和风险分析


## Appendix: Data Structures

### Photo_Record 数据结构

```typescript
interface Photo_Record {
  id: string                    // 唯一标识符（UUID）
  fileName: string              // 文件名（如 "ink-1.png" 或 "拍照_20260415_143052.jpg"）
  fileSize: number              // 文件大小（字节）
  imageData: string             // Base64 编码的图片数据
  timestamp: Date               // 上传/拍摄时间
  isFavorite: boolean           // 是否收藏
  
  // OCR 识别结果
  ocrResult?: string            // 识别的文本内容
  ocrStatus: 'pending' | 'processing' | 'done' | 'error'  // 识别状态
  ocrError?: string             // 识别错误信息
  
  // 识别区域数据
  boundingBoxes?: BoundingBox[] // 识别区域边界框数组
  
  // 模型信息
  modelName?: string            // 使用的 OCR 模型名称（如 "PaddleOCR-VL-1.5"）
  
  // 原始 API 响应（用于 JSON 视图）
  rawApiResponse?: unknown      // 原始 API 响应数据
}

interface BoundingBox {
  id: string                    // 边界框唯一标识符
  coordinates: {                // 边界框坐标（相对于原图）
    x: number                   // 左上角 X 坐标
    y: number                   // 左上角 Y 坐标
    width: number               // 宽度
    height: number              // 高度
  }
  text: string                  // 该区域识别的文本
  confidence: number            // 置信度分数（0-1）
  textBlockIndex: number        // 对应 Result_Editor 中的文本块索引
}
```

### OCR_Model 配置结构

```typescript
interface OCR_Model {
  id: string                    // 模型唯一标识符
  name: string                  // 模型显示名称（如 "PaddleOCR-VL-1.5"）
  apiUrl: string                // API 端点 URL
  apiToken: string              // API Token
  isNew: boolean                // 是否为新模型（显示 NEW 标签）
  isDefault: boolean            // 是否为默认模型
  description?: string          // 模型描述
}
```

### Preview_Transform 状态结构

```typescript
interface Preview_Transform {
  scale: number                 // 缩放比例（0.25-4.0）
  rotation: number              // 旋转角度（0, 90, 180, 270）
  offsetX: number               // X 轴偏移（用于拖拽）
  offsetY: number               // Y 轴偏移（用于拖拽）
  fitMode: 'none' | 'width' | 'height'  // 适应模式
}
```

### History_Filter 状态结构

```typescript
interface History_Filter {
  category: 'recent' | 'favorite'  // 分类（最近上传/我的收藏）
  searchQuery: string              // 搜索关键词
  sortBy: 'timestamp' | 'fileName' // 排序方式
  sortOrder: 'asc' | 'desc'        // 排序顺序
}
```
