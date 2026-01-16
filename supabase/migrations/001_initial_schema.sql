-- ============================================
-- Ẩm Thực Giáo Tuyết - Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Function: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Table: menus (Thực đơn)
-- ============================================
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(12,2) DEFAULT 0,
    unit TEXT DEFAULT 'phần',
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON menus
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON menus
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON menus
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON menus
    FOR DELETE USING (true);

CREATE INDEX idx_menus_category ON menus(category);
CREATE INDEX idx_menus_active ON menus(active);

CREATE TRIGGER set_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: quotes (Báo giá)
-- ============================================
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    event_type TEXT,
    event_date DATE,
    num_tables INTEGER DEFAULT 1,
    dishes JSONB DEFAULT '[]',
    price_per_table DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) DEFAULT 0,
    vat_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON quotes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON quotes
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON quotes
    FOR DELETE USING (true);

CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_event_date ON quotes(event_date);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

CREATE TRIGGER set_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    today_count INTEGER;
    date_str TEXT;
BEGIN
    IF NEW.quote_number IS NULL THEN
        date_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DDMMYYYY');
        
        SELECT COUNT(*) + 1 INTO today_count
        FROM quotes
        WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = DATE(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh');
        
        NEW.quote_number := 'BGAM' || LPAD(today_count::TEXT, 3, '0') || '-' || date_str;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_quote_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_quote_number();

-- ============================================
-- Table: orders (Đơn hàng)
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    location TEXT,
    menu_items JSONB DEFAULT '[]',
    total_amount DECIMAL(12,2) DEFAULT 0,
    deposit DECIMAL(12,2) DEFAULT 0,
    remaining DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'preparing', 'in_progress', 'completed', 'cancelled')),
    assigned_vendors JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON orders
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON orders
    FOR DELETE USING (true);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_event_date ON orders(event_date);
CREATE INDEX idx_orders_quote_id ON orders(quote_id);

CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    today_count INTEGER;
    date_str TEXT;
BEGIN
    IF NEW.order_number IS NULL THEN
        date_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DDMMYYYY');
        
        SELECT COUNT(*) + 1 INTO today_count
        FROM orders
        WHERE DATE(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = DATE(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh');
        
        NEW.order_number := 'ORD' || LPAD(today_count::TEXT, 3, '0') || '-' || date_str;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- ============================================
-- Table: calendar_events (Lịch)
-- ============================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type TEXT,
    location TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON calendar_events
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON calendar_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON calendar_events
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON calendar_events
    FOR DELETE USING (true);

CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_events_order_id ON calendar_events(order_id);

-- ============================================
-- Table: vendors (Nhà cung cấp)
-- ============================================
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    phone TEXT,
    address TEXT,
    specialties TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    price_range TEXT,
    active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON vendors
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON vendors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON vendors
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON vendors
    FOR DELETE USING (true);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_active ON vendors(active);

CREATE TRIGGER set_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: transactions (Sổ cái thu chi)
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT,
    amount DECIMAL(12,2) NOT NULL,
    payment_method TEXT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT,
    receipt_url TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON transactions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON transactions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON transactions
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON transactions
    FOR DELETE USING (true);

CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_vendor_id ON transactions(vendor_id);

CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: settings (Cài đặt)
-- ============================================
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON settings
    FOR UPDATE USING (true);

CREATE TRIGGER set_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Initial Data: Default Settings
-- ============================================
INSERT INTO settings (key, value, description) VALUES
    ('company_name', 'Ẩm Thực Giáo Tuyết', 'Tên công ty'),
    ('company_phone', '0912 345 678', 'Số điện thoại liên hệ'),
    ('default_vat', '0', 'Thuế VAT mặc định (%)'),
    ('quote_prefix', 'BGAM', 'Tiền tố mã báo giá');
