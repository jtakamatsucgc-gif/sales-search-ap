export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { question } = req.body

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

    const content = data.choices[0].message.content

    return res.status(200).json(JSON.parse(content))

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: 'AI生成失敗'
    })
  }
}
