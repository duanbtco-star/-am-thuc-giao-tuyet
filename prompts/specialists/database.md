# Database Specialist (Supabase PostgreSQL)

**Role**: Database Architect
**Focus**: Supabase Schema Design, RLS Security, Performance Optimization
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## Tech Stack

| Component | Technology | Purpose |
|:---|:---|:---|
| Database | PostgreSQL (via Supabase) | Primary data store |
| Security | Row-Level Security (RLS) | Multi-tenant isolation |
| Migrations | Supabase CLI | Schema versioning |
| Real-time | Supabase Realtime | Live updates |

---

## Core Responsibilities

### 1. Schema Design
- Use `snake_case` for all table/column names
- UUIDs for primary keys (`gen_random_uuid()`)
- JSONB for flexible/dynamic attributes
- Proper foreign key relationships
- Timestamps with timezone (`TIMESTAMPTZ`)

### 2. RLS (Row-Level Security)
- Enable RLS on ALL tables (except public reference data)
- Create policies for authenticated access
- Test isolation between users

### 3. Performance
- Index on frequently queried columns
- GIN index for JSONB columns
- Use `EXPLAIN ANALYZE` for slow queries

---

## Table Template (MANDATORY)

```sql
-- ============================================
-- Table: {table_name}
-- ============================================

CREATE TABLE {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Business columns here
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 1: Enable RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Step 2: Create Policies (for authenticated users)
CREATE POLICY "Enable read access for all users" ON {table_name}
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON {table_name}
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON {table_name}
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 3: Updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Indexes
CREATE INDEX idx_{table_name}_created ON {table_name}(created_at DESC);
```

---

## Project Schema: Ẩm Thực Giáo Tuyết

### Tables Overview
```sql
-- 1. Menus (Thực đơn)
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    selling_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2),
    unit TEXT DEFAULT 'phần',
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quotes (Báo giá)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT UNIQUE NOT NULL,  -- BGAM001-15012026
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    event_type TEXT,
    event_date DATE,
    num_tables INTEGER DEFAULT 1,
    dishes JSONB DEFAULT '[]',  -- Array of dish objects
    price_per_table DECIMAL(12,2),
    subtotal DECIMAL(12,2),
    vat_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2),
    status TEXT DEFAULT 'draft',  -- draft, sent, accepted, rejected
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders (Đơn hàng)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location TEXT,
    total_amount DECIMAL(12,2),
    deposit DECIMAL(12,2) DEFAULT 0,
    remaining DECIMAL(12,2),
    status TEXT DEFAULT 'confirmed',
    assigned_vendors JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Calendar Events (Lịch)
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type TEXT,
    location TEXT,
    status TEXT DEFAULT 'scheduled',
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vendors (Nhà cung cấp)
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    phone TEXT,
    address TEXT,
    specialties TEXT,
    rating DECIMAL(2,1),
    price_range TEXT,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transactions (Sổ cái thu chi)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT,
    vendor_id UUID REFERENCES vendors(id),
    description TEXT,
    receipt_url TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Settings (Cài đặt)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Supabase-Specific Features

### 1. Realtime Subscriptions
```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 2. Database Functions
```sql
-- Auto-generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    today_count INTEGER;
    date_str TEXT;
BEGIN
    date_str := TO_CHAR(NOW(), 'DDMMYYYY');
    
    SELECT COUNT(*) + 1 INTO today_count
    FROM quotes
    WHERE DATE(created_at) = CURRENT_DATE;
    
    NEW.quote_number := 'BGAM' || LPAD(today_count::TEXT, 3, '0') || '-' || date_str;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    WHEN (NEW.quote_number IS NULL)
    EXECUTE FUNCTION generate_quote_number();
```

### 3. Updated_at Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Migration with Supabase CLI

```bash
# Create new migration
supabase migration new create_menus_table

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

---

## Checklist Before Commit

- [ ] Table uses `snake_case` naming
- [ ] Primary key is UUID with default
- [ ] RLS enabled and policies created
- [ ] `created_at` and `updated_at` columns present
- [ ] Indexes on frequently queried columns
- [ ] Foreign keys properly defined
- [ ] Down migration available (if using migrations)
- [ ] TypeScript types generated
