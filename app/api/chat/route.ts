import { NextRequest } from 'next/server'
import { laptops } from '@/lib/products'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'gemma4:31b-cloud'

const SYSTEM_PROMPT = `你是 TechGear Assistant，一家銷售筆記型電腦的電子產品商店客服機器人。

目前在售筆電型號：
${laptops.map((l) => `- ${l.name}（${l.brand}）：${l.price}，${l.description}`).join('\n')}

回答規則：
- 只回答筆電、訂單、運送、退貨、保固、付款相關問題
- 推薦產品前先詢問用途與預算
- 回覆簡潔，不超過 80 字（列出產品除外）
- 不要捏造目錄以外的產品或價格
- 非購物問題請委婉說明超出服務範圍
- 使用繁體中文，語氣友善專業
- 不要使用 emoji

退貨政策：30 天內全額退款，免運費退回。
保固：所有產品附原廠 1 年保固，可加購 2 年延長方案 NT$1,500。
運送：標準免運 3-5 工作天，快速運送 NT$250 約 1-2 工作天。
付款：Visa、Mastercard、American Express、PayPal、Line Pay，可分 0 利率 12 期。`

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const ollamaMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ]

  let ollamaRes: Response
  try {
    ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: true,
      }),
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Ollama 服務無法連線，請確認伺服器與 SSH tunnel 已啟動。' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!ollamaRes.ok) {
    const text = await ollamaRes.text()
    return new Response(JSON.stringify({ error: text }), {
      status: ollamaRes.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream Ollama's NDJSON response, extracting just the text tokens
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (!line.trim()) continue
            try {
              const json = JSON.parse(line)
              const token: string = json?.message?.content ?? ''
              if (token) controller.enqueue(encoder.encode(token))
              if (json?.done) { controller.close(); return }
            } catch {
              // skip malformed lines
            }
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        reader.releaseLock()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
