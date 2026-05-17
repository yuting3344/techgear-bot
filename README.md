# TechGear Assistant

筆電選購 AI 客服聊天機器人，使用 Next.js + Ollama 驅動。

---

## 功能

- Ollama 串流對話（支援任意本地或遠端模型）
- 真實筆電商品圖（本地圖片，無外部依賴）
- 黑白灰簡潔介面，無 emoji
- 語音朗讀（Web Speech API）、放大字體
- 真人客服轉接表單 + Email 通知

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.local.example .env.local
# 填入所有必要變數（見下方說明）
```

### 3. 連線遠端 Ollama 伺服器（SSH tunnel）

伺服器端需在 `~/.ssh/authorized_keys` 加入 `SSH_AUTHORIZED_KEY` 環境變數所設定的公鑰。

本機執行 tunnel：

```bash
SSH_USER=ubuntu SSH_HOST=your-server.com SSH_KEY=~/.ssh/id_ed25519 npm run tunnel
```

tunnel 啟動後，Ollama 預設會映射到 `localhost:11434`。

### 4. 啟動開發伺服器

```bash
npm run dev
# 開啟 http://localhost:3000
```

---

## 環境變數

| 變數 | 說明 |
|------|------|
| `OLLAMA_BASE_URL` | Ollama API 位址（預設 `http://localhost:11434`） |
| `OLLAMA_MODEL` | 使用的模型名稱（預設 `gemma4:31b-cloud`） |
| `SSH_AUTHORIZED_KEY` | 伺服器 authorized_keys 使用的 SSH 公鑰 |
| `SMTP_HOST` | SMTP 伺服器（預設 `smtp.gmail.com`） |
| `SMTP_PORT` | SMTP 埠（預設 `587`） |
| `SMTP_USER` | 寄件 Gmail 帳號 |
| `SMTP_PASS` | Gmail App Password |

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 14 App Router + TypeScript |
| 後端 | Next.js API Route（串流代理） |
| AI | Ollama（本地或 SSH tunnel 遠端） |
| 部署 | Netlify + @netlify/plugin-nextjs |

---

**Made with Claude Code**
