# TechGear Assistant

筆電選購 AI 客服聊天機器人，使用 Next.js + Ollama 驅動。

---

## 功能

- Ollama 串流對話（支援任意本地或遠端模型）
- 真實 Amazon 筆電資料與商品圖（5 款熱門機型）
- 黑白灰簡潔介面，無 emoji
- 語音朗讀（Web Speech API）、放大字體
- 真人客服轉接表單 + 等待室

---

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

```bash
cp .env.local.example .env.local
# 編輯 .env.local，填入 OLLAMA_BASE_URL 與 OLLAMA_MODEL
```

### 3. 連線遠端 Ollama 伺服器（SSH tunnel）

伺服器端需在 `~/.ssh/authorized_keys` 加入以下公鑰：

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHE0ylF9V16kp9hOCD2MTlMVR6puEJlbuhVe9F9l+wKI
```

本機執行 tunnel（需有對應私鑰）：

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

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API 位址 |
| `OLLAMA_MODEL` | `llama3.2` | 使用的模型名稱 |

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | Next.js 14 App Router + TypeScript |
| 後端 | Next.js API Route（串流代理） |
| AI | Ollama（本地或 SSH tunnel 遠端） |
| 部署 | Vercel / 任何支援 Node.js 的平台 |

---

**Made with Claude Code**
