# MyBot — RAG Chatbot with Auth

A full-stack chatbot application that answers questions using Retrieval-Augmented Generation (RAG). Users authenticate, manage chat sessions, and converse with an AI assistant grounded in domain-specific documents (dressage/equestrian training content).

## Architecture

```
MyBot/
├── server.py          # Flask API (port 5000)
├── BotCode/
│   ├── Bot.py             # RAG pipeline (Pinecone + OpenAI)
│   └── EmbeddingsFunction.py
├── AccountAccess/
│   ├── signUp.py          # Account creation (bcrypt)
│   ├── logIn.py           # Credential verification
│   └── tokens.py          # JWT access + refresh tokens
├── Data/
│   └── content.csv        # Document chunks with embeddings
└── web-app/               # Next.js 15 frontend
    └── src/app/
        ├── page.tsx           # Home / entry
        ├── login/             # Login page
        ├── signup/            # Signup page
        ├── dashboard/         # Chat list + new chat
        └── bot/               # Chat interface
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Python, Flask, Flask-CORS |
| Auth | JWT (access token 30 min, refresh token 24 hr), httpOnly cookies |
| Database | Supabase (accounts, chats, messages tables) |
| Vector store | Pinecone |
| LLM | OpenAI GPT-4o-mini |
| Embeddings | OpenAI Embeddings API |

## Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase project with `accounts`, `chats`, and `messages` tables
- Pinecone index named `docs`
- OpenAI API key

## Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
REFRESH_KEY=your_jwt_refresh_secret
ACCESS_KEY=your_jwt_access_secret
```

## Setup

### Backend

```bash
pip install flask flask-cors pyjwt supabase openai pinecone-client
python server.py
```

Server runs at `http://localhost:5000`.

### Frontend

```bash
cd web-app
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signUp` | Create a new account |
| POST | `/logIn` | Verify credentials |
| POST | `/initializeSession` | Issue JWT cookies on login |
| POST | `/authenticate` | Validate access token (auto-refreshes) |
| DELETE | `/logOut` | Clear auth cookies |
| POST | `/bot` | Submit a question, get AI response |
| POST | `/createChat` | Create a new chat session |
| POST | `/listChats` | List all chats for a user |
| POST | `/saveMessage` | Persist a message and return full history |

## Auth Flow

1. User signs up or logs in — server issues an **access token** (30 min) and **refresh token** (24 hr) as httpOnly cookies.
2. Each protected route calls `/authenticate`, which validates the access token. If expired, it automatically issues a new one using the refresh token.
3. If the refresh token is also expired or invalid, the user is redirected to `/login`.

## RAG Pipeline

1. User question is embedded via OpenAI Embeddings.
2. Pinecone is queried for the top-3 most similar document chunks.
3. Retrieved chunks are injected as context into a GPT-4o-mini prompt.
4. The response is returned to the frontend and saved to Supabase.

## Supabase Schema

```sql
-- accounts
create table accounts (
  user_id   serial primary key,
  username  text unique not null,
  password  text not null  -- bcrypt hash
);

-- chats
create table chats (
  chat_id    serial primary key,
  user_id    int references accounts(user_id),
  title      text not null,
  created_at timestamptz default now()
);

-- messages
create table messages (
  messages_id  serial primary key,
  chat_id      int references chats(chat_id),
  sender       text not null,  -- 'user' or 'bot'
  message      text not null,
  created_at   timestamptz default now()
);
```
