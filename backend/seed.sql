-- ============================================================
-- AI SQL Builder — Demo Database Schema
-- Run this against your PostgreSQL instance to get started.
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(255) UNIQUE NOT NULL,
    country    VARCHAR(60),
    plan       VARCHAR(20) DEFAULT 'free',   -- free | pro | enterprise
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(80),
    price       NUMERIC(10,2) NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | paid | shipped | cancelled
    total       NUMERIC(12,2) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    product_id  INTEGER NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL,
    unit_price  NUMERIC(10,2) NOT NULL
);

-- ── Seed data ──────────────────────────────────────────────────────────────────
INSERT INTO users (name, email, country, plan) VALUES
  ('Alice Johnson',  'alice@example.com',   'US', 'pro'),
  ('Bob Smith',      'bob@example.com',     'UK', 'free'),
  ('Carol White',    'carol@example.com',   'CA', 'enterprise'),
  ('David Lee',      'david@example.com',   'AU', 'pro'),
  ('Eva Martinez',   'eva@example.com',     'DE', 'free'),
  ('Frank Brown',    'frank@example.com',   'US', 'enterprise'),
  ('Grace Kim',      'grace@example.com',   'KR', 'pro'),
  ('Hank Turner',    'hank@example.com',    'US', 'free'),
  ('Iris Chen',      'iris@example.com',    'CN', 'pro'),
  ('Jack Wilson',    'jack@example.com',    'UK', 'enterprise')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, category, price, stock) VALUES
  ('Wireless Headphones',  'Electronics',  89.99,  120),
  ('Mechanical Keyboard',  'Electronics', 149.00,   55),
  ('Standing Desk',        'Furniture',   399.00,   20),
  ('USB-C Hub',            'Electronics',  39.99,  200),
  ('Ergonomic Chair',      'Furniture',   599.00,   15),
  ('Notebook (A5)',        'Stationery',    4.99, 1000),
  ('Webcam 4K',            'Electronics',  79.99,   80),
  ('Desk Lamp LED',        'Accessories',  29.99,  300),
  ('Cable Management Kit', 'Accessories',  14.99,  450),
  ('Monitor Stand',        'Accessories',  49.99,  100)
ON CONFLICT DO NOTHING;

-- Orders spread across the last 90 days
INSERT INTO orders (user_id, status, total, created_at)
SELECT
    (random()*9+1)::int,
    (ARRAY['pending','paid','shipped','cancelled'])[floor(random()*4)+1],
    (random()*500+20)::numeric(12,2),
    NOW() - (random()*90 || ' days')::interval
FROM generate_series(1,200);

-- Populate order_items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
    o.id,
    (random()*9+1)::int,
    (random()*4+1)::int,
    p.price
FROM orders o
JOIN products p ON p.id = (random()*9+1)::int
LIMIT 600;
