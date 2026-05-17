'use client'

import { useEffect, useRef, useState } from 'react'
import { laptops, type Laptop } from '@/lib/products'

// ── Types ──────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  content: string
  products?: Laptop[]
  isOffTopic?: boolean
}

// ── Constants ──────────────────────────────────────────────────────────────

const QUICK_REPLIES = [
  { label: '瀏覽所有筆電', q: '你們有哪些筆電產品' },
  { label: '推薦輕薄機', q: '推薦輕薄筆電給我' },
  { label: '推薦遊戲筆電', q: '推薦遊戲用筆電' },
  { label: '退貨政策', q: '退貨政策是什麼' },
]

const OFF_TOPIC_KEYWORDS = [
  '星座', '生日', '運勢', '塔羅', '算命', '解夢',
  '電影', '電視', '影集', '小說', '漫畫', '動漫', '歌詞',
  '政治', '選舉', '宗教',
  '幫我寫', '寫一篇', '寫程式', '寫作業', '翻譯', '解數學',
  '食譜', '料理', '旅遊', '景點', '醫生', '生病', '吃藥',
  '女朋友', '男朋友', '分手', '感情',
  '天氣', '股票', '比特幣', '虛擬貨幣',
  'jailbreak', 'roleplay', 'pretend', 'ignore', '扮演', '假裝',
]

function isOffTopic(text: string) {
  const lower = text.toLowerCase()
  return OFF_TOPIC_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))
}

function pickProducts(text: string): Laptop[] | undefined {
  const lower = text.toLowerCase()
  if (lower.includes('遊戲') || lower.includes('gaming') || lower.includes('rog')) {
    return laptops.filter((l) => l.category === 'gaming')
  }
  if (lower.includes('翻轉') || lower.includes('觸控') || lower.includes('convertible') || lower.includes('x360') || lower.includes('二合一')) {
    return laptops.filter((l) => l.category === 'convertible')
  }
  if (lower.includes('輕薄') || lower.includes('macbook') || lower.includes('thinkpad') || lower.includes('商務')) {
    return laptops.filter((l) => l.category === 'ultrabook')
  }
  if (lower.includes('筆電') || lower.includes('電腦') || lower.includes('laptop') || lower.includes('產品') || lower.includes('所有')) {
    return laptops
  }
  return undefined
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ProductCard({ laptop }: { laptop: Laptop }) {
  return (
    <a
      href={laptop.amazonUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginTop: 10,
        background: 'var(--bg)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow =
          '0 2px 12px rgba(0,0,0,0.10)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          width: '100%',
          height: 140,
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={laptop.imageUrl}
          alt={laptop.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 12 }}
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = 'none'
            const parent = el.parentElement!
            parent.innerHTML = `<span style="font-size:13px;color:var(--text-tertiary);font-weight:600;">${laptop.brand}</span>`
          }}
        />
      </div>
      <div style={{ padding: '10px 14px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '1.08em' }}>{laptop.name}</span>
          <span style={{ fontWeight: 700, fontSize: '1.15em', whiteSpace: 'nowrap' }}>
            {laptop.price}
          </span>
        </div>
        <p
          style={{
            fontSize: '0.92em',
            color: 'var(--text-secondary)',
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          {laptop.description}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 8,
            alignItems: 'center',
          }}
        >
          {laptop.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.85em',
                padding: '2px 8px',
                borderRadius: 100,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {tag}
            </span>
          ))}
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.85em',
              color: 'var(--text-tertiary)',
              fontWeight: 500,
            }}
          >
            Amazon 查看 →
          </span>
        </div>
        <div
          style={{
            marginTop: 8,
            padding: '8px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85em',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {laptop.specs.cpu} / {laptop.specs.ram} / {laptop.specs.storage}
          {laptop.specs.gpu ? ` / ${laptop.specs.gpu}` : ''}
          <br />
          {laptop.specs.display} / {laptop.specs.weight}
        </div>
      </div>
    </a>
  )
}

function TypingDots() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 5,
        padding: '12px 16px',
        background: 'var(--bot-bubble)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        alignSelf: 'flex-start',
        width: 'fit-content',
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--text-tertiary)',
            display: 'inline-block',
            animation: `dot 1.2s ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes dot{0%,60%,100%{opacity:.3}30%{opacity:1}}`}</style>
    </div>
  )
}

// ── Human Agent Modal ──────────────────────────────────────────────────────

function AgentModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (name: string, topic: string, email: string, phone: string, message: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')

  if (!open) return null

  function handleSubmit() {
    if (!name || !email || !topic || !message) {
      alert('請填寫所有必填欄位')
      return
    }
    onSubmit(name, topic, email, phone, message)
    setName(''); setEmail(''); setPhone(''); setTopic(''); setMessage('')
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 480, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          border: '1.5px solid var(--border)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontWeight: 600, fontSize: 17 }}>轉接真人客服</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              填寫資料後，專員會盡快與您聯繫
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ border: '1.5px solid var(--border)', padding: '4px 10px', fontSize: 16, background: 'transparent' }}
          >
            x
          </button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--border)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              display: 'flex', gap: 10, alignItems: 'center',
            }}
          >
            <span
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#22c55e', flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
              }}
            />
            <span>目前有 3 位專員在線，預估等候約 3 分鐘</span>
          </div>
          {[
            { id: 'name', label: '姓名 *', type: 'text', val: name, set: setName, ph: '王小明' },
            { id: 'email', label: 'Email *', type: 'email', val: email, set: setEmail, ph: 'example@email.com' },
          ].map(({ id, label, type, val, set, ph }) => (
            <div key={id}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
                {label}
              </label>
              <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              問題類別 *
            </label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">請選擇</option>
              {['訂單問題', '產品諮詢', '退換貨', '保固維修', '付款問題', '其他'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              問題描述 *
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="請簡述您需要協助的問題..." />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: 11, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 14 }}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              style={{ flex: 2, padding: 11, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14 }}
            >
              提交並開始等待
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            客服時間：週一至週五 09:00–18:00（GMT+8）
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Waiting Room Modal ─────────────────────────────────────────────────────

function WaitingModal({
  open,
  ticketId,
  name,
  topic,
  onCancel,
}: {
  open: boolean
  ticketId: string
  name: string
  topic: string
  onCancel: () => void
}) {
  const [seconds, setSeconds] = useState(180)

  useEffect(() => {
    if (!open) return
    setSeconds(180)
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [open])

  if (!open) return null

  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 420, width: '100%',
          border: '1.5px solid var(--border)',
          padding: '32px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            border: '2px solid var(--border)',
            margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}
        >
          &#9742;
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>正在為您接線</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          專員正在準備您的資料，請稍候片刻
        </p>

        <div style={{ marginBottom: 8, background: 'var(--bg-tertiary)', borderRadius: 100, height: 6, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--accent)',
              width: `${((180 - seconds) / 180) * 100}%`,
              borderRadius: 100,
              transition: 'width 1s linear',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          <span>排隊中</span>
          <span>{seconds > 0 ? `預估剩餘 ${m}:${String(s).padStart(2, '0')}` : '即將接通'}</span>
        </div>

        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            marginBottom: 20,
            textAlign: 'left',
          }}
        >
          {[
            { label: '案件編號', value: ticketId },
            { label: '聯絡姓名', value: name },
            { label: '問題類別', value: topic },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, padding: '5px 0',
                borderTop: label !== '案件編號' ? '1px dashed var(--border)' : undefined,
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px 0', border: '1.5px solid var(--border)', background: 'transparent', fontSize: 14 }}
          >
            取消等待
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(ticketId)}
            style={{ flex: 1, padding: '10px 0', background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600 }}
          >
            複製編號
          </button>
        </div>
      </div>
    </div>
  )
}

// ── User Context (needs card) ──────────────────────────────────────────────

interface UserContext {
  budget: string
  useCase: string
}

const USE_CASE_MAP: [string[], string][] = [
  [['剪片', '影片', '剪輯', '影像', 'video', 'premiere', 'davinci'], '影像剪輯'],
  [['遊戲', 'gaming', 'game', 'rog', 'fps', '電競'], '遊戲'],
  [['學生', '學校', '寫作業', '讀書', '上課'], '學生用途'],
  [['商務', '辦公', '出差', 'office', 'excel', 'word'], '商務辦公'],
  [['創作', '設計', '繪圖', 'photoshop', 'illustrator', 'figma'], '設計創作'],
  [['程式', '開發', 'coding', 'developer', 'vscode', 'xcode'], '程式開發'],
]

function detectBudget(text: string): string | null {
  // 3萬 / 三萬 / NT$30,000 / $30000 / 30000元
  const m =
    text.match(/(\d+)\s*萬/) ||
    text.match(/NT\$?\s*([\d,]+)/) ||
    text.match(/\$\s*([\d,]+)/) ||
    text.match(/([\d,]+)\s*元/) ||
    text.match(/([\d]{4,6})/)
  if (!m) return null
  const raw = m[1].replace(/,/g, '')
  const num = Number(raw)
  if (num < 100) return `NT$${num}萬`
  if (num >= 1000 && num <= 999999) return `NT$${num.toLocaleString()}`
  return null
}

function detectUseCase(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [keywords, label] of USE_CASE_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return label
  }
  return null
}

function ContextCard({
  ctx,
  onChange,
}: {
  ctx: UserContext
  onChange: (next: UserContext) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState(ctx)

  const hasContent = ctx.budget || ctx.useCase

  function save() {
    onChange(draft)
    setExpanded(false)
  }

  if (!expanded) {
    return (
      <div
        style={{
          padding: '7px 16px',
          borderTop: '1.5px solid var(--border)',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          minHeight: 36,
        }}
      >
        <span style={{ fontSize: '0.92em', color: 'var(--text-secondary)' }}>
          {hasContent ? (
            <>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>目前需求：</span>
              {ctx.budget && <span>{ctx.budget}</span>}
              {ctx.budget && ctx.useCase && <span style={{ margin: '0 6px', color: 'var(--border)' }}>·</span>}
              {ctx.useCase && <span>用途：{ctx.useCase}</span>}
            </>
          ) : (
            <span style={{ color: 'var(--text-tertiary)' }}>目前需求：尚未偵測（可手動填寫）</span>
          )}
        </span>
        <button
          onClick={() => { setDraft(ctx); setExpanded(true) }}
          style={{
            fontSize: '0.85em',
            padding: '3px 10px',
            border: '1.5px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          編輯
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '10px 16px',
        borderTop: '1.5px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <p style={{ fontSize: '0.92em', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
        目前需求
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            預算
          </label>
          <input
            type="text"
            value={draft.budget}
            onChange={(e) => setDraft((d) => ({ ...d, budget: e.target.value }))}
            placeholder="例：NT$30,000"
            style={{ width: '100%', fontSize: '1em' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            用途
          </label>
          <input
            type="text"
            value={draft.useCase}
            onChange={(e) => setDraft((d) => ({ ...d, useCase: e.target.value }))}
            placeholder="例：遊戲、剪片、學生"
            style={{ width: '100%', fontSize: '1em' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => setExpanded(false)}
          style={{ fontSize: '0.92em', padding: '4px 14px', border: '1.5px solid var(--border)', background: 'transparent' }}
        >
          取消
        </button>
        <button
          onClick={save}
          style={{ fontSize: '0.92em', padding: '4px 14px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}
        >
          儲存
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [agentOpen, setAgentOpen] = useState(false)
  const [waitingOpen, setWaitingOpen] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [ticketName, setTicketName] = useState('')
  const [ticketTopic, setTicketTopic] = useState('')
  const [userCtx, setUserCtx] = useState<UserContext>({ budget: '', useCase: '' })
  const chatRef = useRef<HTMLDivElement>(null)

  // Greeting on mount
  useEffect(() => {
    const greeting: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        '您好，歡迎來到 TechGear。\n我可以協助您挑選筆電、查詢退貨政策、運送、保固等問題。請問今天需要什麼協助？',
    }
    setMessages([greeting])
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  function speak(text: string) {
    if (!voiceOn || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  }

  async function handleSend(text: string) {
    const clean = text.trim()
    if (!clean || loading) return
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: clean }

    // Auto-detect budget / use case from user message
    setUserCtx((prev) => {
      const nextBudget = !prev.budget ? (detectBudget(clean) ?? '') : prev.budget
      const nextUseCase = !prev.useCase ? (detectUseCase(clean) ?? '') : prev.useCase
      return { budget: nextBudget, useCase: nextUseCase }
    })

    // Off-topic guard (client-side fast path)
    if (isOffTopic(clean)) {
      const reply =
        '這個問題超出我的服務範圍。\n\n我是 TechGear 客服助理，可以協助：\n- 筆電選購與規格比較\n- 訂單追蹤與退貨\n- 運送與付款方式\n- 保固與維修\n\n請問有關於以上問題需要協助嗎？'
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: crypto.randomUUID(), role: 'assistant', content: reply, isOffTopic: true },
      ])
      speak(reply)
      return
    }

    // Client-side product matching (instant display before API responds)
    const matchedProducts = pickProducts(clean)

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    // Build history (last 10 turns)
    const history = [...messages.slice(-10), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          userContext: userCtx,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: '伺服器錯誤' }))
        const errMsg = err.error ?? '伺服器錯誤'
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: errMsg },
        ])
        setLoading(false)
        return
      }

      // Stream response token-by-token
      const botId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: botId, role: 'assistant', content: '', products: matchedProducts },
      ])
      setLoading(false)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: full } : m))
        )
      }
      speak(full)
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Ollama 服務無法連線，請確認 SSH tunnel 已建立並執行 `npm run tunnel`。',
        },
      ])
      setLoading(false)
    }
  }

  function handleAgentSubmit(name: string, topic: string, email: string, phone: string, message: string) {
    const id = 'TG-' + Math.floor(100000 + Math.random() * 900000)
    setTicketId(id)
    setTicketName(name)
    setTicketTopic(topic)
    setAgentOpen(false)
    setWaitingOpen(true)
    // Fire-and-forget email notification
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, topic, message, ticketId: id }),
    }).catch(() => {})
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `已建立案件 ${id}，專員準備接通中。您可以繼續在此聊天。`,
        },
      ])
    }, 400)
  }

  const fs = largeText ? 15 : 13
  // Scale any hardcoded font size proportionally with largeText
  const f = (n: number) => largeText ? Math.round(n * 15 / 13) : n

  return (
    <>
      {/* Page wrapper — fontSize: fs here cascades to ALL children */}
      <div style={{ width: '100%', maxWidth: 580, fontSize: fs }}>
        {/* Header above chat */}
        <div style={{ marginBottom: 12, textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.38em', fontWeight: 700, letterSpacing: '-0.3px' }}>
            TechGear Assistant
          </h1>
          <p style={{ fontSize: '0.92em', color: 'var(--text-secondary)', marginTop: 3 }}>
            筆電選購客服
          </p>
        </div>

        {/* Chat box */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}
        >
          {/* Chat header */}
          <div
            style={{
              padding: '11px 16px',
              borderBottom: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              background: 'var(--bg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '1.5px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1em', fontWeight: 700,
                }}
              >
                TG
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1em' }}>TechGear Assistant</p>
                <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Online
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  const next = !voiceOn
                  setVoiceOn(next)
                  if (!next) window.speechSynthesis?.cancel()
                }}
                style={{
                  padding: '5px 10px', fontSize: '0.85em',
                  border: '1.5px solid var(--border)',
                  background: voiceOn ? 'var(--accent)' : 'transparent',
                  color: voiceOn ? '#fff' : 'var(--text-primary)',
                }}
              >
                語音 {voiceOn ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setLargeText((v) => !v)}
                style={{
                  padding: '5px 10px', fontSize: '0.85em',
                  border: '1.5px solid var(--border)',
                  background: largeText ? 'var(--accent)' : 'transparent',
                  color: largeText ? '#fff' : 'var(--text-primary)',
                }}
              >
                {largeText ? '一般字體' : '放大字體'}
              </button>
            </div>
          </div>

          {/* Message list */}
          <div
            ref={chatRef}
            role="log"
            aria-live="polite"
            style={{
              height: 370,
              overflowY: 'auto',
              padding: '16px',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: fs,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 10,
                  maxWidth: '88%',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85em', fontWeight: 700, flexShrink: 0, color: 'var(--text-secondary)',
                  }}
                >
                  {msg.role === 'user' ? 'You' : 'TG'}
                </div>

                {/* Bubble */}
                <div>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      fontSize: fs,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      background: msg.role === 'user'
                        ? 'var(--user-bubble)'
                        : msg.isOffTopic
                        ? 'var(--bg-tertiary)'
                        : 'var(--bot-bubble)',
                      color: msg.role === 'user' ? 'var(--user-bubble-text)' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1.5px solid var(--border)',
                    }}
                  >
                    {msg.content || (loading && msg.role === 'assistant' ? '' : ' ')}
                  </div>
                  {msg.products?.map((p) => <ProductCard key={p.id} laptop={p} />)}
                </div>
              </div>
            ))}
            {loading && <TypingDots />}
          </div>

          {/* Quick replies */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1.5px solid var(--border)',
              display: 'flex', gap: 6, flexWrap: 'wrap',
              background: 'var(--bg)',
            }}
          >
            {QUICK_REPLIES.map(({ label, q }) => (
              <button
                key={label}
                onClick={() => handleSend(q)}
                disabled={loading}
                style={{
                  fontSize: '0.92em', padding: '5px 12px',
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Needs context card */}
          <ContextCard ctx={userCtx} onChange={setUserCtx} />

          {/* Input row */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1.5px solid var(--border)',
              display: 'flex', gap: 8, alignItems: 'center',
              background: 'var(--bg)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input) }}
              placeholder="請輸入您的問題..."
              disabled={loading}
              style={{ flex: 1, fontSize: fs }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 20px',
                background: loading || !input.trim() ? 'var(--bg-tertiary)' : 'var(--accent)',
                color: loading || !input.trim() ? 'var(--text-tertiary)' : '#fff',
                border: 'none',
                fontWeight: 600, fontSize: '1.08em',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              送出
            </button>
          </div>

          {/* Human agent bar */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1.5px solid var(--border)',
              background: 'var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8, flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ fontSize: '0.92em', fontWeight: 600 }}>需要真人協助？</p>
              <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: 2 }}>
                複雜問題可轉接真人客服
              </p>
            </div>
            <button
              onClick={() => setAgentOpen(true)}
              style={{
                padding: '7px 14px', fontSize: '0.92em', fontWeight: 600,
                border: '1.5px solid var(--accent)',
                background: 'transparent',
                color: 'var(--accent)',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
              }}
            >
              轉接真人客服
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AgentModal
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        onSubmit={handleAgentSubmit}
      />
      <WaitingModal
        open={waitingOpen}
        ticketId={ticketId}
        name={ticketName}
        topic={ticketTopic}
        onCancel={() => {
          setWaitingOpen(false)
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: '已取消等待真人客服。如需重新諮詢，請再次點擊「轉接真人客服」。',
            },
          ])
        }}
      />
    </>
  )
}
