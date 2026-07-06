import { NextRequest } from 'next/server'
import { laptops } from '@/lib/products'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview'

function buildSystemPrompt(lang: 'zh' | 'en'): string {
  if (lang === 'en') {
    const productList = laptops
      .map((l) => `- ${l.name} (${l.brand}): ${l.price}, ${l.descriptionEn}`)
      .join('\n')
    return `You are TechGear Assistant, a customer service bot for an electronics store that sells laptops.

Laptops currently in stock:
${productList}

Response rules:
- Only answer questions about laptops, orders, shipping, returns, warranty, and payment
- Ask about intended use and budget before recommending products
- Keep replies concise, under 80 words (except when listing products)
- Do not invent products or prices outside the catalog above
- For non-shopping questions, politely explain that it is out of scope
- Respond in English, in a friendly and professional tone
- Do not use emoji

Return policy: Full refund within 30 days, free return shipping.
Warranty: All products come with a 1-year manufacturer warranty; a 2-year extended plan can be added for NT$1,500.
Shipping: Free standard shipping in 3-5 business days, express shipping NT$250 in 1-2 business days.
Payment: Visa, Mastercard, American Express, PayPal, Line Pay; 0% interest installments up to 12 months available.`
  }

  const productList = laptops
    .map((l) => `- ${l.name}（${l.brand}）：${l.price}，${l.description}`)
    .join('\n')
  return `你是 TechGear Assistant，一家銷售筆記型電腦的電子產品商店客服機器人。

目前在售筆電型號：
${productList}

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
}

export async function POST(req: NextRequest) {
  const { messages, userContext, lang } = await req.json()
  const isEn = lang === 'en'

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: isEn
          ? 'The GEMINI_API_KEY environment variable is not set.'
          : '未設定 GEMINI_API_KEY 環境變數',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Build system prompt, injecting user context if available
  let systemPrompt = buildSystemPrompt(isEn ? 'en' : 'zh')
  if (userContext?.budget || userContext?.useCase) {
    const parts = []
    if (userContext.budget) parts.push(`${isEn ? 'Budget' : '預算'}：${userContext.budget}`)
    if (userContext.useCase) parts.push(`${isEn ? 'Use case' : '用途'}：${userContext.useCase}`)
    systemPrompt += isEn
      ? `\n\nThe user's current needs (please prioritize these when recommending): ${parts.join(', ')}`
      : `\n\n用戶目前需求（請優先根據此推薦）：${parts.join('，')}`
  }

  // Convert messages to Gemini format
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  let res: Response
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    )
  } catch {
    return new Response(
      JSON.stringify({
        error: isEn
          ? 'Unable to reach the Gemini API. Please check your network connection.'
          : 'Gemini API 無法連線，請確認網路狀態。',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: err }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream SSE → plain text tokens
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') { controller.close(); return }
            try {
              const json = JSON.parse(data)
              const token: string =
                json?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
              if (token) controller.enqueue(encoder.encode(token))
            } catch { /* skip malformed */ }
          }
        }
        controller.close()
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
    },
  })
}
