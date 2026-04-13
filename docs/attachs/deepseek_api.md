# Your First API Call
The DeepSeek API uses an API format compatible with OpenAI. By modifying the configuration, you can use the OpenAI SDK or softwares compatible with the OpenAI API to access the DeepSeek API.

PARAM	VALUE
base_url *       	https://api.deepseek.com
api_key	apply for an API key
* To be compatible with OpenAI, you can also use https://api.deepseek.com/v1 as the base_url. But note that the v1 here has NO relationship with the model's version.

* The deepseek-chat and deepseek-reasoner correspond to the model version DeepSeek-V3.2 (128K context limit), which differs from the APP/WEB version. deepseek-chat is the non-thinking mode of DeepSeek-V3.2 and deepseek-reasoner is the thinking mode of DeepSeek-V3.2.

Invoke The Chat API
Once you have obtained an API key, you can access the DeepSeek API using the following example scripts. This is a non-stream example, you can set the stream parameter to true to get stream response.

curl
python
nodejs
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -d '{
        "model": "deepseek-chat",
        "messages": [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello!"}
        ],
        "stream": false
      }'


# Models & Pricing
The prices listed below are in units of per 1M tokens. A token, the smallest unit of text that the model recognizes, can be a word, a number, or even a punctuation mark. We will bill based on the total number of input and output tokens by the model.

Model Details
NOTE: The deepseek-chat and deepseek-reasoner correspond to the model version DeepSeek-V3.2 (128K context limit), which differs from the APP/WEB version.

MODEL	deepseek-chat	deepseek-reasoner
BASE URL	https://api.deepseek.com
MODEL VERSION	DeepSeek-V3.2
(Non-thinking Mode)	DeepSeek-V3.2
(Thinking Mode)
CONTEXT LENGTH	128K
MAX OUTPUT	DEFAULT: 4K
MAXIMUM: 8K	DEFAULT: 32K
MAXIMUM: 64K
FEATURES	Json Output	✓	✓
Tool Calls	✓	✓
Chat Prefix Completion（Beta）	✓	✓
FIM Completion（Beta）	✓	✗
PRICING	1M INPUT TOKENS (CACHE HIT)	$0.028
1M INPUT TOKENS (CACHE MISS)	$0.28
1M OUTPUT TOKENS	$0.42
Deduction Rules
The expense = number of tokens × price. The corresponding fees will be directly deducted from your topped-up balance or granted balance, with a preference for using the granted balance first when both balances are available.

Product prices may vary and DeepSeek reserves the right to adjust them. We recommend topping up based on your actual usage and regularly checking this page for the most recent pricing information.

# The Temperature Parameter
The default value of temperature is 1.0.

We recommend users to set the temperature according to their use case listed in below.
USE CASE	TEMPERATURE
Coding / Math   	0.0
Data Cleaning / Data Analysis	1.0
General Conversation	1.3
Translation	1.3
Creative Writing / Poetry	1.5

# 分层模式
DeepSeek最新推出的快速（Instant）和专家（Expert）模式，可以理解为根据不同任务需求提供“快”与“精”两种服务-。

这是一个精妙的“分层设计”，旨在通过算力资源的灵活调配，为用户提供更精准、高效的服务体验。我把它们的核心区别整理成了下面这个表格，方便你对比：

对比维度	🚀 快速模式 (Instant)	⚛️ 专家模式 (Expert)
核心定位	追求“快”，主打即时响应与高效率-	追求“精”，聚焦复杂问题深度推理-
适用场景	日常对话、资料查询、简单创作等轻量级任务	数理逻辑、代码编程、金融/法律分析、科研等专业场景
工作方式	精简推理路径，快速给出答案-	深度思考、智能搜索、多步推理与自我纠错-
核心功能	支持文件上传和多模态识别（如识别图片中的文字）	暂不支持文件上传和多模态功能
性能表现	代码生成量大，但对复杂任务的处理不够精细	在数理、物理仿真、代码结构等深度任务上质量更高，更精简、逻辑更严谨
使用体验	响应迅速，通常无需等待	高峰时段可能需要排队等待--
🧠 背后的逻辑与影响
资源优化：并非所有问题都需要最强的算力。这种模式分层可以将约80%的简单日常需求分流到快速模式，从而为20%真正复杂的任务节省宝贵的算力，以调用专家模式进行深度推理-。

服务升级：快速模式能保证普通用户的基本体验；而专家模式则能更好地满足程序员、律师、科研工作者等专业人士的特定需求，标志着DeepSeek从“泛化对话工具”向“垂直领域深度服务”的转型。

行业趋势：这种“分层教学”的思路，也符合当前大模型行业普遍采用的策略，例如ChatGPT的Plus/Pro订阅和Claude的模型分层，本质上都是在平衡用户体验与运营成本。

🤔 如何选择？
在选择时，可以遵循一个非常简单的原则：

日常问题，首选“快速模式”：对于绝大多数的闲聊、资料查询、写简单文案等场景，快速模式足以胜任，其响应速度能让你用得最顺手。

复杂难题，切换“专家模式”：当你遇到需要深度分析、严谨逻辑推导的问题时，比如解一道复杂的数学题、分析代码Bug、撰写专业报告，切换到专家模式，以获得更高质量的结果。

