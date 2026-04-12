# 快速接入示例
可复制以下 API 示例代码，并替换 API Key 的值，即可快速调用。

强烈建议使用以下系统提示词，请从英文和中文版本中选择。
```
中文
你是MiMo（中文名称也是MiMo），是小米公司研发的AI智能助手。
今天的日期：{date} {week}，你的知识截止日期是2024年12月。

英文
You are MiMo, an AI assistant developed by Xiaomi.
Today's date: {date} {week}. Your knowledge cutoff date is December 2024.
```


# 模型超参

temperature 表示采样温度。较高的值（如 0.8）会使输出更加随机，而较低的值（如 0.2）会使输出更具确定性。

top_p 表示核采样的概率阈值，用于控制模型生成文本的多样性。值越高，生成的文本多样性越高。

## 不同模型的 temperature 和 top_p 的默认值和参数范围如下：

模型名称	temperature	top_p
mimo-v2-pro	
默认值：1.0
范围：[0, 1.5]
默认值：0.95
范围：[0.01, 1.0]
mimo-v2-omni	
默认值：1.0
范围：[0, 1.5]
默认值：0.95
范围：[0.01, 1.0]
mimo-v2-tts	
默认值：0.6
范围：[0, 1.5]
默认值：0.95
范围：[0.01, 1.0]
mimo-v2-flash	
默认值：0.3
范围：[0, 1.5]
默认值：0.95
范围：[0.01, 1.0]

## 我们建议您按任务类型设置参数值，可参考以下推荐值。

mimo-v2-flash 模型的推荐值如下：

任务类型	temperature	top_p
Al 编程	0.3	0.95
工具调用	0.3	0.95
通用问答	0.8	0.95
创意写作	0.8	0.95
前端网页开发	0.8	0.95
数学推理	1	0.95
mimo-v2-pro 与 mimo-v2-omni 模型对于上述任务的 temperature 和 top_p 参数推荐值分别为 1 和 0.95。

# OpenAI API 兼容

## 请求地址
https://api.xiaomimimo.com/v1/chat/completions

## 请求头
接口支持以下两种认证方式，请选择其中一种添加到请求头中：

### 方式一：api-key 字段认证，格式：
api-key: $MIMO_API_KEY
Content-Type: application/json

### 方式二：Authorization: Bearer 认证，格式：
Authorization: Bearer $MIMO_API_KEY
Content-Type: application/json
