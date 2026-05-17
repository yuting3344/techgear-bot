import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TechGear Assistant',
  description: '筆電購物客服機器人 — 由 Ollama 驅動',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  )
}
