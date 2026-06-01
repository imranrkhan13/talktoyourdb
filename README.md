# TalkToYourDB

TalkToYourDB is a production-style AI data assistant that allows users to interact with PostgreSQL databases using natural language instead of writing SQL manually.

The platform converts plain English questions into schema-aware SQL queries, validates them through multiple security layers, safely executes them inside read-only transactions, and returns formatted results with AI-generated explanations.

Unlike simple AI SQL generators, TalkToYourDB is designed with real-world reliability, backend safety, and operational security in mind.

---

# Core Features

## Natural Language → SQL
Convert plain English into schema-aware PostgreSQL queries using GPT-4o.

Example:

```text
"Show top 5 customers by revenue last month"
```

↓

```sql
SELECT users.name, SUM(orders.total)
FROM orders
JOIN users ON users.id = orders.user_id
GROUP BY users.name
ORDER BY SUM(orders.total) DESC
LIMIT 5;
```

---

## Schema-Aware Query Generation

The entire database schema is dynamically analyzed and sent to the AI model before query generation.

This prevents:
- hallucinated tables
- invalid columns
- broken joins
- incorrect relationships

---

## Multi-Layer SQL Validation

Every generated query passes through multiple independent security checks before execution.

Validation includes:
- SELECT-only enforcement
- stacked-query detection
- dangerous keyword blocking
- injection heuristics
- suspicious function detection
- query normalization checks

Blocked examples:
- `DROP TABLE`
- `DELETE`
- `UPDATE`
- `ALTER`
- `pg_sleep`
- multi-statement injections

---

## Safe Query Execution

Queries execute inside:
- read-only transactions
- isolated async execution pools
- configurable execution timeouts
- row-limited result sets

This prevents destructive operations even if validation fails.

---

## AI Auto-Repair System

If a generated SQL query fails:
1. Database error is captured
2. Error is fed back into the AI model
3. AI generates a corrected query
4. System retries execution automatically

This creates a self-healing query pipeline.

---

## Query Explanation Engine

Every query is translated into a human-readable explanation.

Example:

> "This query returns the top five customers ranked by total revenue generated in the previous month."

---

## Realtime Schema Browser

Frontend includes:
- table explorer
- column metadata
- primary keys
- foreign keys
- data types
- relationship mapping

---

## Query History

Persistent query history with:
- pagination
- reuse support
- deletion
- execution tracking

---

# Architecture

```text
Browser
  │
  ▼
React + TypeScript
  │
  ▼
FastAPI Backend
  │
  ├── AI Orchestration Layer
  │      ├── SQL Generation
  │      ├── SQL Explanation
  │      └── Query Auto-Repair
  │
  ├── Validation Pipeline
  │      ├── Injection Detection
  │      ├── Pattern Analysis
  │      ├── Safety Enforcement
  │      └── Query Sanitization
  │
  ├── Database Execution Layer
  │      ├── AsyncPG Pool
  │      ├── Read-Only Transactions
  │      ├── Timeout Enforcement
  │      └── Result Formatting
  │
  └── Query History Service
```

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Backend
- FastAPI
- Python
- AsyncPG
- PostgreSQL
- Pydantic

## AI / Orchestration
- OpenAI GPT-4o
- AI Retry Pipelines
- Schema-Aware Prompting

## Infrastructure
- Docker
- Docker Compose
- Nginx
- Async Systems

---

# Example Prompts

```text
Show daily revenue for the past 30 days

Which products are low on stock?

List users who placed more than 3 orders

Find the highest spending customers this year

Count orders grouped by status

Show recent cancelled orders with customer details
```

---

# Security Design

TalkToYourDB uses a defense-in-depth execution model.

Security layers include:
- read-only database transactions
- dangerous keyword detection
- query normalization
- stacked-query blocking
- timeout enforcement
- row limiting
- injection heuristics
- restricted database users
- schema-aware prompting

The production setup is designed so AI-generated queries cannot mutate or damage the database.

---

# Production Focus

This project focuses heavily on:
- AI orchestration systems
- backend reliability engineering
- safe AI execution pipelines
- developer tooling infrastructure
- secure database interaction
- realtime operational systems

Instead of being a simple "AI wrapper", the platform is designed as a production-style AI execution system for databases.

---

# Future Improvements

- Multi-database support
- Streaming query execution
- Query visualization dashboards
- Vector search support
- Role-based permissions
- AI-generated charts
- Query caching layer
- Team collaboration
- Observability dashboards
- LLM routing across multiple providers

---

# Local Development

```bash
# Clone repository
git clone <repo>

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

# Vision

The long-term goal of TalkToYourDB is to make databases conversational.

Instead of requiring technical SQL knowledge, teams should be able to:
- ask questions naturally
- explore data safely
- debug faster
- build analytics quicker
- interact with infrastructure through AI-native workflows