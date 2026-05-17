# TechGear Assistant

筆電選購 AI 客服聊天機器人。

---

## 功能

- **AI 對話**：Google Gemini 3 Flash 串流回應，繁體中文客服
- **產品展示**：5 款熱門筆電，本地圖片，規格卡片，連結至 Amazon
- **黑白灰介面**：簡潔無 emoji 設計
- **語音朗讀**：Web Speech API 一鍵開啟
- **真人客服轉接**：表單送出後自動發 Email 通知

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 14 App Router + TypeScript |
| AI | Google Gemini API (`gemini-3-flash-preview`) |
| Email | Nodemailer + Gmail SMTP |
| 部署 | Netlify + `@netlify/plugin-nextjs` |

## 快速開始

```bash
npm install
cp .env.local.example .env.local
# 填入 GEMINI_API_KEY 等變數
npm run dev
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `GEMINI_API_KEY` | Google AI Studio API Key |
| `GEMINI_MODEL` | 預設 `gemini-3-flash-preview` |
| `SMTP_USER` | Gmail 帳號 |
| `SMTP_PASS` | Gmail App Password |
| `SSH_AUTHORIZED_KEY` | 伺服器 SSH 公鑰（選填） |

---

**Made with Claude Code**
