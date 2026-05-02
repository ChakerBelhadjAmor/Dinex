# Dinex

<p align="center">
  <img src="frontend/public/dinex_logo.png" alt="Dinex logo" width="140" />
</p>

**"Floussek f jibek, fil telephone"** .

A fintech app built for Tunisia, designed to make digital payments feel easier than cash. Inspired by apps like Finari, Dinex targets the ~60% of the Tunisian population that still relies on cash by offering a **chat-first, Tunisian dialect (Derja) experience** that feels like WhatsApp + Banking.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How to Run](#how-to-run)
  - [With Docker (Recommended)](#with-docker-recommended)
  - [Without Docker (Manual)](#without-docker-manual)
- [How Everything Works](#how-everything-works)
  - [Authentication](#authentication)
  - [Chatbot (Main Feature)](#chatbot-main-feature)
  - [Wallet System](#wallet-system)
  - [Payments](#payments)
  - [Insights & Analytics](#insights--analytics)
- [Screens](#screens)
- [AI Integration (Gemini)](#ai-integration-gemini)
- [Demo Accounts](#demo-accounts)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)

---

## Features

- **Tunisian Dialect Chatbot** — The main interface. Users interact in Derja (e.g. "9addech ba9a fi compte?", "nheb nab3ath 50dt")
- **Wallet Dashboard** — Balance display, recent transactions, quick actions
- **P2P Transfers** — Send money to other users by phone number
- **QR Code Payment** — Simulated QR code for merchant payments
- **Transaction History** — Full history with filtering (sent/received)
- **Spending Insights** — Category breakdown, pie charts, monthly summaries
- **Advice in Derja** — AI-powered financial tips in Tunisian dialect
- **Dark Theme** — Modern fintech-style dark UI, mobile-first
- **Fully Dockerized** — One command to run everything

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────>│  AI Service  │────>│   Backend    │────>│ PostgreSQL  │
│  (React/Vite)│<────│  (Gemini)    │<────│  (Express)   │<────│   (DB)      │
│  Port 5173   │     │  Port 3001   │     │  Port 3000   │     │  Port 5432  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Chatbot Flow:**
1. User sends a message in Tunisian dialect
2. AI Service interprets intent (balance check, send money, history, etc.)
3. AI Service calls Backend API if an action is needed
4. Backend queries PostgreSQL database
5. Response is returned in Derja to the user

**Direct API Flow (Dashboard, Send, History, Insights):**
1. Frontend calls Backend API directly with JWT auth
2. Backend queries PostgreSQL and returns data
3. Frontend renders the UI

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" width="24" height="24" /> <img src="https://cdn.simpleicons.org/vite/646CFF" alt="Vite" width="24" height="24" /> <img src="https://cdn.simpleicons.org/reactrouter/CA4245" alt="React Router" width="24" height="24" /> |
| **Backend** | <img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" width="24" height="24" /> <img src="https://cdn.simpleicons.org/express/000000" alt="Express" width="24" height="24" /> <img src="https://cdn.simpleicons.org/jsonwebtokens/000000" alt="JWT" width="24" height="24" /> |
| **Database** | <img src="https://cdn.simpleicons.org/postgresql/4169E1" alt="PostgreSQL" width="24" height="24" /> |
| **AI Service** | <img src="https://cdn.simpleicons.org/google/4285F4" alt="Google Gemini" width="24" height="24" /> |
| **Containerization** | <img src="https://cdn.simpleicons.org/docker/2496ED" alt="Docker" width="24" height="24" /> |

---

## Project Structure

```
Dinex/
├── frontend/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── BottomNav.jsx      # Bottom navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication state
│   │   ├── screens/
│   │   │   ├── LoginScreen.jsx    # Phone number login
│   │   │   ├── ChatScreen.jsx     # Main chatbot interface
│   │   │   ├── DashboardScreen.jsx# Wallet dashboard
│   │   │   ├── SendMoneyScreen.jsx# Send/add money flow
│   │   │   ├── HistoryScreen.jsx  # Transaction history
│   │   │   └── InsightsScreen.jsx # Spending analytics
│   │   ├── services/
│   │   │   └── api.js             # API client for backend & AI
│   │   ├── App.jsx                # Root component with routing
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Full dark theme styles
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
│
├── backend/                   # Express API server
│   ├── data/
│   │   └── store.js               # PostgreSQL data store (users, transactions)
│   ├── db/
│   │   ├── pool.js                # PostgreSQL connection pool
│   │   └── init.sql               # Database schema + seed data
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   ├── server.js                  # Express server with all routes
│   ├── package.json
│   └── Dockerfile
│
├── ai/                        # Gemini AI chatbot service
│   ├── prompts/
│   │   └── system.js              # System prompt (Tunisian dialect rules)
│   ├── server.js                  # AI service with intent detection
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml         # Orchestrates all 3 services
└── README.md                  # This file
```

---

## How to Run

### With Docker (Recommended)

**Prerequisites:** Docker and Docker Compose installed.

**Step 1: Clone / navigate to the project**

```bash
cd Dinex
```

**Step 2 (Optional): Set up Gemini API key**

The chatbot works without a Gemini key (uses built-in fallback responses in Derja), but for full AI-powered conversations:

```bash
# Create a .env file in the repo root or export this variable
GEMINI_API_KEY=your_key_here
```

Get a free key at https://aistudio.google.com/apikey.

**Step 3: Run everything**

```bash
docker-compose up --build
```

That's it. The app will be available at:

| Service | URL |
|---------|-----|
| **Frontend (App)** | http://localhost:5173 |
| **Backend API** | http://localhost:3005 |
| **AI Service** | http://localhost:3002 |

Ports can be customized via `FRONTEND_HOST_PORT`, `BACKEND_HOST_PORT`, and `AI_HOST_PORT` in your environment or `.env` file.

**To stop:**

```bash
docker-compose down
```

---

### Without Docker (Manual)

**Prerequisites:** Node.js 18+ and PostgreSQL 16+ installed.

**Step 0 — Set up PostgreSQL:**

```bash
# Create the database and user
sudo -u postgres psql -c "CREATE USER flousna WITH PASSWORD 'flousna123';"
sudo -u postgres psql -c "CREATE DATABASE flousna OWNER flousna;"

# Run the init script to create tables and seed data
psql -U flousna -d flousna -f backend/db/init.sql
```

You need 3 terminal windows, one for each service.

**Terminal 1 — Backend:**

```bash
cd backend
npm install

# Set database connection (or export these)
export DB_HOST=localhost DB_PORT=5432 DB_NAME=flousna DB_USER=flousna DB_PASSWORD=flousna123

node server.js
```

Backend runs on http://localhost:3000

**Terminal 2 — AI Service:**

```bash
cd ai
npm install

# Optional: set Gemini key
export GEMINI_API_KEY=your_key_here

node server.js
```

AI Service runs on http://localhost:3001

**Terminal 3 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## How Everything Works

### Authentication

- Users log in with a **phone number** and **PIN code**
- The backend validates credentials against the in-memory store
- A **JWT token** is issued and stored in localStorage
- All subsequent API calls include this token in the Authorization header
- For the demo, any of the pre-loaded phone numbers work with PIN `1234`

### Chatbot (Main Feature)

The chatbot is the **primary interface** of the app. It understands Tunisian dialect (Derja) and can perform actions:

| What you say | What happens |
|--------------|-------------|
| "9addech ba9a fi compte?" | Checks your balance |
| "nheb nab3ath 50dt" | Starts send money flow |
| "win sraft flousi?" | Shows transaction history |
| "warini el insights" | Shows spending analytics |
| "zid 100dt" | Adds money to wallet |

**How the AI works:**

1. User message is sent to the AI Service (`POST /api/chat`)
2. If Gemini API key is configured: the message + system prompt + conversation history are sent to Gemini, which returns a structured JSON with intent, response message, and optional action
3. If no Gemini key: a built-in fallback system does keyword-based intent detection and responds in Derja
4. If an action is detected (e.g., check balance), the AI Service calls the Backend API and formats the result
5. If confirmation is needed (e.g., sending money), the user sees Yes/No buttons. On confirm, `POST /api/chat/confirm` executes the action

### Wallet System

- **Balance** — Each user has a DT (Dinar Tunisien) balance stored in PostgreSQL
- **Transactions** — Stored in PostgreSQL with type (send/receive), amount, category, description, and date
- **Send money** — Uses database transactions (BEGIN/COMMIT) with row-level locking (FOR UPDATE) to safely deduct from sender and add to recipient
- **Add money** — Simulates depositing money from a bank card
- **Data persistence** — All data persists across restarts via PostgreSQL (Docker volume `pgdata`)

### Payments

- **P2P Transfers** — Enter a phone number and amount to send money
- **QR Code** — A simulated QR code display for merchant payment scenarios
- **Categories** — Transactions are categorized (food, transport, shopping, bills, entertainment, health)

### Insights & Analytics

- **Monthly summary** — Total spent, total received, transaction count
- **Category breakdown** — Pie chart showing spending distribution
- **Bar visualization** — Horizontal bars for each category with percentages
- **Advice in Derja** — Personalized tips based on top spending category (e.g., "Sraft barcha 3al mekla! Jarreb tabkhi fi dar")

---

## Screens

1. **Login** — Phone number + PIN, dark theme, demo credentials shown
2. **Chat (Main)** — WhatsApp-style chat with the Dinex bot, typing indicators, confirm/cancel buttons for actions
3. **Dashboard (Dar)** — Balance card with gradient, quick action buttons, recent transactions list
4. **Send Money (Ab3ath)** — Choose send or add money, amount input with preset buttons, phone number input, success confirmation
5. **History (Tarikh)** — Full transaction list grouped by date, filter tabs (All/Sent/Received)
6. **Insights (Tahlil)** — Spending summary card, pie chart, category bars, advice card

---

## AI Integration (Gemini)

The AI service uses **Google Gemini 2.0 Flash** with a carefully crafted system prompt that enforces:

- **Tunisian dialect only** — All responses are in Derja
- **Simple language** — No banking jargon, short sentences
- **Friendly tone** — Like a helpful friend who understands you
- **Structured output** — JSON with intent, message, action, and confirmation flag

**Intent detection categories:**
- `CHECK_BALANCE` — Balance inquiries
- `SEND_MONEY` — Transfer requests
- `TRANSACTION_HISTORY` — History lookups
- `GET_INSIGHTS` — Spending analysis
- `ADD_MONEY` — Deposit requests
- `GREETING` — Hello/welcome
- `HELP` — Feature questions
- `GENERAL` — Everything else

**Fallback mode:** When no Gemini API key is provided, the AI service uses keyword-based intent detection with pre-written Derja responses. This ensures the demo always works.

---

## Demo Accounts

| Phone | Name | Balance | PIN |
|-------|------|---------|-----|
| 20123456 | Ahmed | 1,500.00 DT | 1234 |
| 20654321 | Sami | 850.50 DT | 1234 |
| 20111222 | Fatma | 2,200.00 DT | 1234 |
| 20333444 | Mariem | 430.75 DT | 1234 |
| 20555666 | Youssef | 3,100.00 DT | 1234 |

Ahmed (20123456) has the most transaction history and is the best account for demoing.

---

## Environment Variables

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `GEMINI_API_KEY` | ai-service | No | Google Gemini API key. Fallback responses work without it. Get one at https://aistudio.google.com/apikey |
| `PORT` | backend, ai | No | Server port (defaults: backend=3000, ai=3001) |
| `JWT_SECRET` | backend | No | JWT signing secret (default provided for demo) |
| `DB_HOST` | backend | No | PostgreSQL host (default: localhost, in Docker: db) |
| `DB_PORT` | backend | No | PostgreSQL port (default: 5432) |
| `DB_NAME` | backend | No | Database name (default: flousna) |
| `DB_USER` | backend | No | Database user (default: flousna) |
| `DB_PASSWORD` | backend | No | Database password (default: flousna123) |
| `BACKEND_URL` | ai-service | No | Backend URL for AI to call (default: http://localhost:3000, in Docker: http://backend:3000) |
| `VITE_API_URL` | frontend | No | Backend URL for frontend (default: http://localhost:3000) |
| `VITE_AI_URL` | frontend | No | AI service URL for frontend (default: http://localhost:3001) |
| `FRONTEND_HOST_PORT` | docker | No | Host port for frontend container (default: 5173) |
| `BACKEND_HOST_PORT` | docker | No | Host port for backend container (default: 3005) |
| `AI_HOST_PORT` | docker | No | Host port for AI container (default: 3002) |

---

## API Reference

### Backend (port 3000)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Login with phone + pin |
| GET | `/api/wallet/balance` | Yes | Get user balance |
| GET | `/api/wallet/transactions` | Yes | Get transaction history |
| POST | `/api/wallet/send` | Yes | Send money (toPhone, amount) |
| POST | `/api/wallet/add` | Yes | Add money (amount) |
| GET | `/api/insights/summary` | Yes | Get spending insights |
| GET | `/api/users/lookup/:phone` | Yes | Look up user by phone |

### AI Service (port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Send message to chatbot (message, token, userId) |
| POST | `/api/chat/confirm` | Confirm a pending action (action, token) |
