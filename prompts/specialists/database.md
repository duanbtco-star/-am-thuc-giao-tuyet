# Database Specialist (PostgreSQL)

**Role**: Database Architect
**Focus**: Data integrity, RLS security, Performance.
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## Core Responsibilities

### 1. RLS (Row-Level Security)
- ALWAYS write `CREATE POLICY` for every table
- No exceptions except system tables (tenants, system_config)
- Test RLS isolation in integration tests

### 2. Schema Design
- Use `snake_case` for all names
- UUIDs for primary keys
- JSONB for flexible attributes
- `ltree` for hierarchies

### 3. Performance
- Index on `tenant_id` for every table
- GIN index for JSONB columns
- Analyze query plans for slow queries

---

## RLS Template (MANDATORY)

```sql
-- ============================================
-- Table: {table_name}
-- ============================================

CREATE TABLE {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    -- other columns
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 1: Enable RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Step 2: Create Policy
CREATE POLICY tenant_isolation ON {table_name}
    USING (tenant_id = current_setting('app.current_tenant')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant')::uuid);

-- Step 3: Index on tenant_id (CRITICAL for performance)
CREATE INDEX idx_{table_name}_tenant ON {table_name}(tenant_id);

-- Step 4: Updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Common Patterns

### JSONB for Flexible Attributes
```sql
CREATE TABLE items (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    specs JSONB DEFAULT '{}',  -- Flexible specs
    UNIQUE(tenant_id, sku)
);

-- GIN Index for JSONB queries
CREATE INDEX idx_items_specs ON items USING GIN (specs);

-- Query example
SELECT * FROM items 
WHERE specs @> '{"voltage": "220V"}';
```

### Hierarchy with ltree
```sql
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    path ltree NOT NULL  -- e.g., 'Electrical.Cables.LV'
);

CREATE INDEX idx_categories_path ON categories USING GIST (path);

-- Get all children
SELECT * FROM categories WHERE path <@ 'Electrical.Cables';

-- Get all parents
SELECT * FROM categories WHERE path @> 'Electrical.Cables.LV';
```

### Optimistic Locking
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    version INTEGER DEFAULT 1,  -- Optimistic lock
    -- other columns
);

-- Update with version check
UPDATE orders 
SET version = version + 1, status = 'approved'
WHERE id = $1 AND version = $2
RETURNING *;
-- If no rows returned, concurrent modification detected
```

---

## Migration Best Practices

### Up Migration
```sql
-- migrations/20260112_create_items.up.sql
BEGIN;

CREATE TABLE items (...);
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY ...;
CREATE INDEX ...;

COMMIT;
```

### Down Migration (Rollback)
```sql
-- migrations/20260112_create_items.down.sql
BEGIN;

DROP TABLE IF EXISTS items CASCADE;

COMMIT;
```

---

## Exception Tables (No RLS)

| Table | Reason |
| :--- | :--- |
| `tenants` | Parent table for tenant_id |
| `system_config` | Global configuration |
| `migrations` | Schema versioning |

---

## Checklist Before Commit

- [ ] All tables have `tenant_id`
- [ ] RLS enabled and policy created
- [ ] Index on `tenant_id`
- [ ] GIN index for JSONB columns
- [ ] Down migration script ready
- [ ] UNIQUE constraints include `tenant_id`
