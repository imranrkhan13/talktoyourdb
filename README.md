# AI SQL Query Builder

A production-ready web application that converts natural language into SQL queries, executes them safely against a PostgreSQL database, and returns formatted results — all with AI-powered auto-correction and query explanation.

---

## Features

| Feature | Details |
|---------|---------|
| **NL → SQL** | GPT-4o converts plain English to schema-aware PostgreSQL |
| **Schema awareness** | Full DB schema sent to AI — no hallucinated tables/columns |
| **Safe execution** | SELECT-only enforcement, stacked-query detection, timeout |
| **Auto-correction** | Failed queries are sent back to AI with the error for self-repair |
| **Query explanation** | Human-readable summary of what each query does |
| **Query history** | Persistent history with pagination, reuse, and delete |
| **Live schema browser** | Explore tables, columns, types, PKs, and FKs in the UI |

---

## Project Structure

```
ai-sql-builder/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app factory
│   │   ├── config.py             # Environment-based settings
│   │   ├── database.py           # asyncpg pool, schema introspection, execution
│   │   ├── api/
│   │   │   ├── queries.py        # Main query endpoints
│   │   │   ├── schema.py         # Schema endpoint
│   │   │   └── health.py         # Health check
│   │   ├── services/
│   │   │   ├── ai_service.py     # OpenAI: generate, explain, correct
│   │   │   ├── validation.py     # Multi-layer SQL safety validation
│   │   │   └── history_service.py# Query history persistence
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic request/response models
│   │   └── utils/
│   │       └── logger.py         # Structured logging
│   ├── seed.sql                  # Demo database schema + data
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── types/index.ts        # TypeScript types
│   │   ├── services/api.ts       # Axios API client
│   │   ├── components/
│   │   │   ├── QueryPanel.tsx    # Main query interface
│   │   │   ├── Sidebar.tsx       # Navigation
│   │   │   ├── SqlPreview.tsx    # Syntax-highlighted SQL
│   │   │   ├── ResultTable.tsx   # Paginated results table
│   │   │   ├── HistoryPanel.tsx  # Query history
│   │   │   ├── SchemaPanel.tsx   # DB schema browser
│   │   │   └── ExamplePrompts.tsx
│   │   └── styles/global.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
│
└── docker-compose.yml
```

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ running locally
- OpenAI API key

### 1. Clone and set up environment

```bash
git clone <repo>
cd ai-sql-builder
```

### 2. Set up the database

```bash
# Create database
createdb sql_builder

# Seed demo schema + data
psql sql_builder < backend/seed.sql
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env — set OPENAI_API_KEY and DATABASE_URL
```

### 4. Install and run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend is live at: http://localhost:8000/api/docs

### 5. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is live at: http://localhost:3000

---

## Docker (Full Stack)

```bash
# Copy and set your OpenAI key
cp backend/.env.example .env
echo "OPENAI_API_KEY=sk-..." >> .env

# Start everything
docker-compose up --build
```

Access at: http://localhost:3000

---

## API Reference

### `POST /api/queries/run`
Full pipeline — NL to SQL to execution.

```json
// Request
{ "question": "Show top 5 users by revenue", "auto_execute": true }

// Response
{
  "question": "...",
  "sql": "SELECT u.name, SUM(o.total) ...",
  "explanation": "This query returns the five users...",
  "result": { "columns": [...], "rows": [...], "row_count": 5, "exec_ms": 12.4 },
  "auto_corrected": false,
  "warnings": []
}
```

### `POST /api/queries/generate`
Generate SQL without executing (preview mode).

### `POST /api/queries/execute`
Execute a provided SQL string.

### `POST /api/queries/validate`
Check SQL safety — no execution.

### `GET /api/queries/history?limit=20&offset=0`
Paginated query history.

### `GET /api/schema`
Live database schema.

---

## Security Design

### SQL Injection Prevention
- All queries run inside **read-only transactions** (`asyncpg` transaction with `readonly=True`)
- **Parameterised wrapper**: user SQL is passed as a subquery, never interpolated directly
- Input sanitisation strips control characters before AI processing

### Forbidden Operation Blocking (Defence-in-depth)
Multiple independent checks, each running separately:

1. **Pattern matching** — regex against normalised SQL for INSERT/UPDATE/DELETE/DROP/CREATE/ALTER/TRUNCATE and 10+ variants
2. **Dangerous function blocklist** — `pg_sleep`, `pg_read_file`, `lo_export`, `set_config`, etc.
3. **Stacked query detection** — blocks `;` followed by another statement
4. **First-token enforcement** — query must start with `SELECT`
5. **Injection heuristics** — warns on OR-based patterns, UNION ALL, hex encoding

### Execution Safety
- **Query timeout**: configurable via `QUERY_TIMEOUT_SECONDS` (default 10s)
- **Row limit**: max 500 rows returned, configurable
- **Read-only pool**: DB user should have `SELECT` permissions only in production

### Recommended Production DB Setup
```sql
CREATE USER sql_builder_reader WITH PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE sql_builder TO sql_builder_reader;
GRANT USAGE ON SCHEMA public TO sql_builder_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sql_builder_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sql_builder_reader;
```

---

## Example Prompts

```
Show top 5 users by total order value last month
Which products are low on stock (under 30 units)?
Count orders by status for the past 7 days
What is the average order value per country?
List users who placed more than 3 orders
Show daily revenue for the past 30 days
Which product category generates the most revenue?
Find all paid orders from US users in the last week
How many new users signed up each month this year?
Show me the 10 most recent cancelled orders with user info
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `OPENAI_API_KEY` | — | OpenAI API key (required) |
| `OPENAI_MODEL` | `gpt-4o` | Model to use for SQL generation |
| `QUERY_TIMEOUT_SECONDS` | `10` | Max query execution time |
| `MAX_RESULT_ROWS` | `500` | Row limit per query |
| `MAX_INPUT_LENGTH` | `2000` | Max question length |
| `AI_RETRY_ATTEMPTS` | `3` | Auto-correction attempts |
| `AI_TEMPERATURE` | `0.0` | Deterministic SQL generation |

---

## Architecture

```
Browser
  │
  ▼
React (Vite)
  │  /api proxy
  ▼
FastAPI
  ├── POST /queries/run
  │     ├── AIService.generate_sql(question, schema)
  │     │     └── OpenAI GPT-4o (schema-aware prompt)
  │     ├── SQLValidationService.validate(sql)
  │     │     └── Pattern checks, AST rules, injection heuristics
  │     ├── DatabaseService.execute_query(sql)
  │     │     └── asyncpg read-only transaction + timeout
  │     ├── AIService.explain_sql(sql)           ← parallel
  │     └── HistoryService.save(...)
  │
  ├── GET /schema  ── DatabaseService.get_schema()
  └── GET /health  ── DB ping
```

---

## Deployment Checklist

- [ ] Set `APP_ENV=production`
- [ ] Rotate `SECRET_KEY` to a random 64-char string
- [ ] Create a read-only PostgreSQL user (see above)
- [ ] Set `DATABASE_URL` to use the read-only user
- [ ] Store `OPENAI_API_KEY` in a secrets manager (not `.env`)
- [ ] Set `ALLOWED_ORIGINS` to your production frontend domain
- [ ] Put the backend behind a reverse proxy with TLS (nginx / Caddy)
- [ ] Enable rate limiting on the `/api/queries/run` endpoint
- [ ] Set up log aggregation (Datadog, Grafana Loki, etc.)
