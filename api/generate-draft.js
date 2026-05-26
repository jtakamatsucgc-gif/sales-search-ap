export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: 'question がありません' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY が設定されていません' })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `
あなたは営業ナレッジシステムのAIです。

以下をJSON形式で返してください。

{
  "answer": "回答案",
  "url": "参考URL",
  "memo": "判断メモ"
}

営業現場で即使える、短く実用的な内容にしてください。
参考URLが不明な場合は空文字にしてください。
判断メモには「なぜその回答になるか」「確認すべき注意点」を入れてください。
            `
          },
          {
            role: 'user',
            content: question
          }
        ],
        response_format: { type: "json_object" }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data)
      return res.status(response.status).json({
        error: data.error?.message || 'OpenAI APIエラー'
      })
    }

    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return res.status(500).json({ error: 'AIの返答が空です' })
    }

    return res.status(200).json(JSON.parse(content))

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: error.message || 'AI生成失敗'
    })
  }
}
