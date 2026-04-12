内容的多维度附属层，不是 release 版本。

把它想清楚：

Block ├── content          ← 主体内容（唯一） ├── releases[]       ← 主体内容的历史快照 └── annotations{}    ← 附属层（不参与 release 版本管理）     ├── translation  ← 翻译（可以有多语言）     ├── explanation  ← 解释/注释     ├── comment      ← 评论/备注     └── footnote     ← 脚注 

关键区别

release 是主体内容的时间轴，记录"这段话我改成了什么样"。

annotations 是主体内容的空间维度，记录"围绕这段话还有哪些附属信息"。

两者完全独立——翻译不会影响主体的 release 版本，主体发布新 release 也不会让翻译消失。

导出时的优势

因为是分离的层，导出时可以自由组合：

导出正式文章 → 只取 content

导出双语版本 → content + translation

导出注释版本 → content + explanation + footnote

导出审阅版本 → content + comment

这和你"内容形式模板分离"的核心思路完全一致，模板决定形式，annotation 层决定内容的丰富程度。



主流做法：分层版本控制

成熟产品（Notion、Google Docs、Confluence）的通用模型是：

主体内容单独版本化，附属层独立追踪，不合并 release。

原因很简单：附属层的更新频率和主体完全不同。你改了一个翻译，不代表主体内容有任何变化，如果每次改翻译都触发一个新 release，版本列表会被噪音淹没。

存储量的实际问题

你的担心是对的，但可以用快照 vs 增量来控制：

主体 releases → 全量快照（每个 release 存完整 content） 附属层        → 只存变更记录（类似 diff，不存全量） 

附属层本来就是轻量文本，增量存储后体积很小。真正占空间的是主体 content 的多个全量快照，但写作场景下 release 数量一般很少（几个到十几个），不是问题。

建议你的模型

Block ├── content            ← 主体 ├── releases[]         ← 主体的全量快照，用户主动触发 └── annotations     ├── translation[]  ← 每次修改append一条，带时间戳     ├── explanation[]  ← 同上     ├── comment[]      ← 同上     └── footnote[]     ← 同上 

附属层不做 release，只做历史记录（类似 append-only log）。用户想看某个时间点的翻译是什么样，可以查时间戳，但不需要和主体 release 绑定。

导出时你指定一个时间点或 release version，系统自动取该时间点最近的附属层内容组合输出。这样既灵活又不浪费存储。 