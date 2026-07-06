'use client'

import { useEffect, useRef, useState } from 'react'
import { laptops, type Laptop } from '@/lib/products'

// ── Types ──────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant'
type Lang = 'zh' | 'en'

interface Message {
  id: string
  role: Role
  content: string
  products?: Laptop[]
  isOffTopic?: boolean
}

// ── i18n ───────────────────────────────────────────────────────────────────

const USE_CASE_LABELS: Record<Lang, Record<string, string>> = {
  zh: {
    video: '影像剪輯',
    gaming: '遊戲',
    student: '學生用途',
    business: '商務辦公',
    design: '設計創作',
    dev: '程式開發',
  },
  en: {
    video: 'Video Editing',
    gaming: 'Gaming',
    student: 'Student',
    business: 'Business',
    design: 'Design & Creative',
    dev: 'Development',
  },
}

const STRINGS: Record<Lang, {
  subtitle: string
  greeting: string
  quickReplies: { label: string; q: string }[]
  offTopicReply: string
  serverError: string
  connectError: string
  voicePrefix: string
  largeTextOn: string
  largeTextOff: string
  langToggle: string
  online: string
  needsCurrent: string
  needsNotDetected: string
  needsEdit: string
  needsTitle: string
  budgetLabel: string
  useCaseLabel: string
  useCaseInline: string
  budgetPlaceholder: string
  useCasePlaceholder: string
  cancel: string
  save: string
  inputPlaceholder: string
  send: string
  needHelpTitle: string
  needHelpDesc: string
  transferButton: string
  agentModalTitle: string
  agentModalSubtitle: string
  onlineAgents: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  topicLabel: string
  topicPlaceholder: string
  topics: string[]
  messageLabel: string
  messagePlaceholder: string
  submitWait: string
  supportHours: string
  validationAlert: string
  waitingTitle: string
  waitingSubtitle: string
  queueing: string
  etaLabel: string
  etaSoon: string
  ticketIdLabel: string
  contactNameLabel: string
  topicLabel2: string
  cancelWait: string
  copyId: string
  ticketCreatedMsg: (id: string) => string
  cancelWaitMsg: string
  amazonView: string
}> = {
  zh: {
    subtitle: '筆電選購客服',
    greeting:
      '您好，歡迎來到 TechGear。\n我可以協助您挑選筆電、查詢退貨政策、運送、保固等問題。請問今天需要什麼協助？',
    quickReplies: [
      { label: '瀏覽所有筆電', q: '你們有哪些筆電產品' },
      { label: '推薦輕薄機', q: '推薦輕薄筆電給我' },
      { label: '推薦遊戲筆電', q: '推薦遊戲用筆電' },
      { label: '退貨政策', q: '退貨政策是什麼' },
    ],
    offTopicReply:
      '這個問題超出我的服務範圍。\n\n我是 TechGear 客服助理，可以協助：\n- 筆電選購與規格比較\n- 訂單追蹤與退貨\n- 運送與付款方式\n- 保固與維修\n\n請問有關於以上問題需要協助嗎？',
    serverError: '伺服器錯誤',
    connectError: '無法連線至客服系統，請稍後再試。',
    voicePrefix: '語音',
    largeTextOn: '一般字體',
    largeTextOff: '放大字體',
    langToggle: 'EN',
    online: 'Online',
    needsCurrent: '目前需求：',
    needsNotDetected: '目前需求：尚未偵測（可手動填寫）',
    needsEdit: '編輯',
    needsTitle: '目前需求',
    budgetLabel: '預算',
    useCaseLabel: '用途',
    useCaseInline: '用途：',
    budgetPlaceholder: '例：NT$30,000',
    useCasePlaceholder: '例：遊戲、剪片、學生',
    cancel: '取消',
    save: '儲存',
    inputPlaceholder: '請輸入您的問題...',
    send: '送出',
    needHelpTitle: '需要真人協助？',
    needHelpDesc: '複雜問題可轉接真人客服',
    transferButton: '轉接真人客服',
    agentModalTitle: '轉接真人客服',
    agentModalSubtitle: '填寫資料後，專員會盡快與您聯繫',
    onlineAgents: '目前有 3 位專員在線，預估等候約 3 分鐘',
    nameLabel: '姓名 *',
    namePlaceholder: '王小明',
    emailLabel: 'Email *',
    topicLabel: '問題類別 *',
    topicPlaceholder: '請選擇',
    topics: ['訂單問題', '產品諮詢', '退換貨', '保固維修', '付款問題', '其他'],
    messageLabel: '問題描述 *',
    messagePlaceholder: '請簡述您需要協助的問題...',
    submitWait: '提交並開始等待',
    supportHours: '客服時間：週一至週五 09:00–18:00（GMT+8）',
    validationAlert: '請填寫所有必填欄位',
    waitingTitle: '正在為您接線',
    waitingSubtitle: '專員正在準備您的資料，請稍候片刻',
    queueing: '排隊中',
    etaLabel: '預估剩餘',
    etaSoon: '即將接通',
    ticketIdLabel: '案件編號',
    contactNameLabel: '聯絡姓名',
    topicLabel2: '問題類別',
    cancelWait: '取消等待',
    copyId: '複製編號',
    ticketCreatedMsg: (id) => `已建立案件 ${id}，專員準備接通中。您可以繼續在此聊天。`,
    cancelWaitMsg: '已取消等待真人客服。如需重新諮詢，請再次點擊「轉接真人客服」。',
    amazonView: 'Amazon 查看 →',
  },
  en: {
    subtitle: 'Laptop Shopping Assistant',
    greeting:
      "Hi, welcome to TechGear.\nI can help you choose a laptop or answer questions about returns, shipping, and warranty. What can I help you with today?",
    quickReplies: [
      { label: 'Browse all laptops', q: 'What laptop products do you have' },
      { label: 'Recommend an ultrabook', q: 'Recommend a lightweight ultrabook for me' },
      { label: 'Recommend a gaming laptop', q: 'Recommend a laptop for gaming' },
      { label: 'Return policy', q: 'What is the return policy' },
    ],
    offTopicReply:
      "That question is outside what I can help with.\n\nI'm the TechGear support assistant, and I can help with:\n- Laptop selection and spec comparisons\n- Order tracking and returns\n- Shipping and payment methods\n- Warranty and repairs\n\nIs there anything about these topics I can help with?",
    serverError: 'Server error',
    connectError: 'Unable to connect to the assistant service. Please try again later.',
    voicePrefix: 'Voice',
    largeTextOn: 'Normal Text',
    largeTextOff: 'Larger Text',
    langToggle: '中文',
    online: 'Online',
    needsCurrent: 'Current needs: ',
    needsNotDetected: 'Current needs: Not detected yet (you can fill in manually)',
    needsEdit: 'Edit',
    needsTitle: 'Current Needs',
    budgetLabel: 'Budget',
    useCaseLabel: 'Use Case',
    useCaseInline: 'Use case: ',
    budgetPlaceholder: 'e.g. NT$30,000',
    useCasePlaceholder: 'e.g. Gaming, Video editing, Student',
    cancel: 'Cancel',
    save: 'Save',
    inputPlaceholder: 'Type your question...',
    send: 'Send',
    needHelpTitle: 'Need human help?',
    needHelpDesc: 'Complex issues can be transferred to a live agent',
    transferButton: 'Transfer to Live Agent',
    agentModalTitle: 'Transfer to Live Agent',
    agentModalSubtitle: 'After you submit, an agent will contact you shortly',
    onlineAgents: '3 agents online now, estimated wait ~3 minutes',
    nameLabel: 'Name *',
    namePlaceholder: 'John Doe',
    emailLabel: 'Email *',
    topicLabel: 'Issue Category *',
    topicPlaceholder: 'Please select',
    topics: ['Order Issue', 'Product Inquiry', 'Return/Exchange', 'Warranty/Repair', 'Payment Issue', 'Other'],
    messageLabel: 'Description *',
    messagePlaceholder: 'Briefly describe your issue...',
    submitWait: 'Submit and Start Waiting',
    supportHours: 'Support hours: Mon–Fri 09:00–18:00 (GMT+8)',
    validationAlert: 'Please fill in all required fields',
    waitingTitle: 'Connecting you now',
    waitingSubtitle: 'An agent is preparing your info, please wait a moment',
    queueing: 'In queue',
    etaLabel: 'Est. remaining',
    etaSoon: 'Connecting soon',
    ticketIdLabel: 'Ticket ID',
    contactNameLabel: 'Contact Name',
    topicLabel2: 'Category',
    cancelWait: 'Cancel Waiting',
    copyId: 'Copy ID',
    ticketCreatedMsg: (id) => `Case ${id} created. An agent is getting ready to connect. You can continue chatting here.`,
    cancelWaitMsg: 'You have canceled waiting for a live agent. Click "Transfer to Live Agent" again if needed.',
    amazonView: 'View on Amazon →',
  },
}

// ── Constants ──────────────────────────────────────────────────────────────

const OFF_TOPIC_KEYWORDS = [
  '星座', '生日', '運勢', '塔羅', '算命', '解夢',
  '電影', '電視', '影集', '小說', '漫畫', '動漫', '歌詞',
  '政治', '選舉', '宗教',
  '幫我寫', '寫一篇', '寫程式', '寫作業', '翻譯', '解數學',
  '食譜', '料理', '旅遊', '景點', '醫生', '生病', '吃藥',
  '女朋友', '男朋友', '分手', '感情',
  '天氣', '股票', '比特幣', '虛擬貨幣',
  'jailbreak', 'roleplay', 'pretend', 'ignore', '扮演', '假裝',
  'horoscope', 'zodiac', 'fortune telling', 'tarot', 'dream interpretation',
  'movie', 'tv show', 'novel', 'comic', 'anime', 'song lyrics',
  'politics', 'election', 'religion',
  'write my essay', 'write me a', 'write code for', 'homework', 'translate this', 'solve this math',
  'recipe', 'travel destination', 'tourist spot', 'doctor', 'i am sick', 'medication',
  'girlfriend', 'boyfriend', 'breakup', 'relationship advice',
  'weather forecast', 'stock market', 'bitcoin', 'cryptocurrency',
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
  if (lower.includes('輕薄') || lower.includes('macbook') || lower.includes('thinkpad') || lower.includes('商務') || lower.includes('ultrabook')) {
    return laptops.filter((l) => l.category === 'ultrabook')
  }
  if (lower.includes('筆電') || lower.includes('電腦') || lower.includes('laptop') || lower.includes('產品') || lower.includes('所有') || lower.includes('products')) {
    return laptops
  }
  return undefined
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ProductCard({ laptop, lang }: { laptop: Laptop; lang: Lang }) {
  const t = STRINGS[lang]
  const tags = lang === 'en' ? laptop.tagsEn : laptop.tags
  const description = lang === 'en' ? laptop.descriptionEn : laptop.description
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
          {description}
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
          {tags.map((tag) => (
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
            {t.amazonView}
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
  lang,
  onClose,
  onSubmit,
}: {
  open: boolean
  lang: Lang
  onClose: () => void
  onSubmit: (name: string, topic: string, email: string, phone: string, message: string) => void
}) {
  const t = STRINGS[lang]
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')

  if (!open) return null

  function handleSubmit() {
    if (!name || !email || !topic || !message) {
      alert(t.validationAlert)
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
            <p style={{ fontWeight: 600, fontSize: 17 }}>{t.agentModalTitle}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {t.agentModalSubtitle}
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
            <span>{t.onlineAgents}</span>
          </div>
          {[
            { id: 'name', label: t.nameLabel, type: 'text', val: name, set: setName, ph: t.namePlaceholder },
            { id: 'email', label: t.emailLabel, type: 'email', val: email, set: setEmail, ph: 'example@email.com' },
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
              {t.topicLabel}
            </label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">{t.topicPlaceholder}</option>
              {t.topics.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 }}>
              {t.messageLabel}
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: 11, border: '1.5px solid var(--border)', background: 'transparent', fontSize: 14 }}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSubmit}
              style={{ flex: 2, padding: 11, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14 }}
            >
              {t.submitWait}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            {t.supportHours}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Waiting Room Modal ─────────────────────────────────────────────────────

function WaitingModal({
  open,
  lang,
  ticketId,
  name,
  topic,
  onCancel,
}: {
  open: boolean
  lang: Lang
  ticketId: string
  name: string
  topic: string
  onCancel: () => void
}) {
  const t = STRINGS[lang]
  const [seconds, setSeconds] = useState(180)

  useEffect(() => {
    if (!open) return
    setSeconds(180)
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
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
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{t.waitingTitle}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          {t.waitingSubtitle}
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
          <span>{t.queueing}</span>
          <span>{seconds > 0 ? `${t.etaLabel} ${m}:${String(s).padStart(2, '0')}` : t.etaSoon}</span>
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
            { label: t.ticketIdLabel, value: ticketId },
            { label: t.contactNameLabel, value: name },
            { label: t.topicLabel2, value: topic },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, padding: '5px 0',
                borderTop: i !== 0 ? '1px dashed var(--border)' : undefined,
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
            {t.cancelWait}
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(ticketId)}
            style={{ flex: 1, padding: '10px 0', background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)', fontSize: 14, fontWeight: 600 }}
          >
            {t.copyId}
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
  [['剪片', '影片', '剪輯', '影像', 'video', 'premiere', 'davinci', 'editing'], 'video'],
  [['遊戲', 'gaming', 'game', 'rog', 'fps', '電競', 'esports'], 'gaming'],
  [['學生', '學校', '寫作業', '讀書', '上課', 'student', 'school', 'homework', 'study', 'class'], 'student'],
  [['商務', '辦公', '出差', 'office', 'excel', 'word', 'business', 'work trip'], 'business'],
  [['創作', '設計', '繪圖', 'photoshop', 'illustrator', 'figma', 'design', 'creative'], 'design'],
  [['程式', '開發', 'coding', 'developer', 'vscode', 'xcode', 'programming'], 'dev'],
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
  for (const [keywords, key] of USE_CASE_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return key
  }
  return null
}

function useCaseDisplay(lang: Lang, useCase: string): string {
  return USE_CASE_LABELS[lang][useCase] ?? useCase
}

function ContextCard({
  ctx,
  lang,
  onChange,
}: {
  ctx: UserContext
  lang: Lang
  onChange: (next: UserContext) => void
}) {
  const t = STRINGS[lang]
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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.needsCurrent}</span>
              {ctx.budget && <span>{ctx.budget}</span>}
              {ctx.budget && ctx.useCase && <span style={{ margin: '0 6px', color: 'var(--border)' }}>·</span>}
              {ctx.useCase && <span>{t.useCaseInline}{useCaseDisplay(lang, ctx.useCase)}</span>}
            </>
          ) : (
            <span style={{ color: 'var(--text-tertiary)' }}>{t.needsNotDetected}</span>
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
          {t.needsEdit}
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
        {t.needsTitle}
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            {t.budgetLabel}
          </label>
          <input
            type="text"
            value={draft.budget}
            onChange={(e) => setDraft((d) => ({ ...d, budget: e.target.value }))}
            placeholder={t.budgetPlaceholder}
            style={{ width: '100%', fontSize: '1em' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-tertiary)', marginBottom: 4 }}>
            {t.useCaseLabel}
          </label>
          <input
            type="text"
            value={draft.useCase ? useCaseDisplay(lang, draft.useCase) : draft.useCase}
            onChange={(e) => setDraft((d) => ({ ...d, useCase: e.target.value }))}
            placeholder={t.useCasePlaceholder}
            style={{ width: '100%', fontSize: '1em' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => setExpanded(false)}
          style={{ fontSize: '0.92em', padding: '4px 14px', border: '1.5px solid var(--border)', background: 'transparent' }}
        >
          {t.cancel}
        </button>
        <button
          onClick={save}
          style={{ fontSize: '0.92em', padding: '4px 14px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}
        >
          {t.save}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [lang, setLang] = useState<Lang>('zh')
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
  const t = STRINGS[lang]

  // Greeting on mount
  useEffect(() => {
    setMessages([{ id: 'greeting', role: 'assistant', content: STRINGS['zh'].greeting }])
  }, [])

  // Keep the greeting bubble in sync with the selected language
  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant'
    setMessages((prev) =>
      prev.map((m) => (m.id === 'greeting' ? { ...m, content: STRINGS[lang].greeting } : m))
    )
  }, [lang])

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  function speak(text: string) {
    if (!voiceOn || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'en' ? 'en-US' : 'zh-TW'
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
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: crypto.randomUUID(), role: 'assistant', content: t.offTopicReply, isOffTopic: true },
      ])
      speak(t.offTopicReply)
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
          userContext: {
            budget: userCtx.budget,
            useCase: userCtx.useCase ? useCaseDisplay(lang, userCtx.useCase) : '',
          },
          lang,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: t.serverError }))
        const errMsg = err.error ?? t.serverError
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
          content: t.connectError,
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
          content: t.ticketCreatedMsg(id),
        },
      ])
    }, 400)
  }

  const fs = largeText ? 15 : 13

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
            {t.subtitle}
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
                  {t.online}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setLang((l) => (l === 'zh' ? 'en' : 'zh'))}
                style={{
                  padding: '5px 10px', fontSize: '0.85em',
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                {t.langToggle}
              </button>
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
                {t.voicePrefix} {voiceOn ? 'ON' : 'OFF'}
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
                {largeText ? t.largeTextOn : t.largeTextOff}
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
                    {msg.content || (loading && msg.role === 'assistant' ? '' : ' ')}
                  </div>
                  {msg.products?.map((p) => <ProductCard key={p.id} laptop={p} lang={lang} />)}
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
              display: 'flex', gap: 6, flexWrap: 'nowrap',
              overflowX: 'auto',
              background: 'var(--bg)',
              scrollbarWidth: 'none',
            }}
          >
            {t.quickReplies.map(({ label, q }) => (
              <button
                key={label}
                onClick={() => handleSend(q)}
                disabled={loading}
                style={{
                  fontSize: '0.92em', padding: '5px 12px',
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
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
          <ContextCard ctx={userCtx} lang={lang} onChange={setUserCtx} />

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
              placeholder={t.inputPlaceholder}
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
              {t.send}
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
              <p style={{ fontSize: '0.92em', fontWeight: 600 }}>{t.needHelpTitle}</p>
              <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginTop: 2 }}>
                {t.needHelpDesc}
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
              {t.transferButton}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AgentModal
        open={agentOpen}
        lang={lang}
        onClose={() => setAgentOpen(false)}
        onSubmit={handleAgentSubmit}
      />
      <WaitingModal
        open={waitingOpen}
        lang={lang}
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
              content: t.cancelWaitMsg,
            },
          ])
        }}
      />
    </>
  )
}
