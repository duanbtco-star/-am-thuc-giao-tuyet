-- ============================================
-- Ẩm Thực Giáo Tuyết - HR Management Module
-- Migration: 002_hr_management.sql
-- Created: 2026-01-16
-- ============================================

BEGIN;

-- ============================================
-- Table: employees (Nhân viên)
-- ============================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    position TEXT,
    department TEXT,
    date_of_birth DATE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    base_salary DECIMAL(12,2) DEFAULT 0,
    daily_rate DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for single-tenant
CREATE POLICY "Enable read access for all users" ON employees
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON employees
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON employees
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON employees
    FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_code ON employees(employee_code);

-- Updated_at trigger
CREATE TRIGGER set_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: attendance (Chấm công)
-- ============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'leave', 'sick', 'holiday')),
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON attendance
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON attendance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON attendance
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON attendance
    FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date DESC);
CREATE INDEX idx_attendance_date ON attendance(date DESC);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Updated_at trigger
CREATE TRIGGER set_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: payroll (Bảng lương)
-- ============================================
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    total_days_worked INTEGER DEFAULT 0,
    base_salary DECIMAL(12,2) DEFAULT 0,
    allowances DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    total_salary DECIMAL(12,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, month, year)
);

-- Enable RLS
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON payroll
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON payroll
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON payroll
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON payroll
    FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_payroll_employee_month_year ON payroll(employee_id, year DESC, month DESC);
CREATE INDEX idx_payroll_status ON payroll(payment_status);
CREATE INDEX idx_payroll_month_year ON payroll(year DESC, month DESC);

-- Updated_at trigger
CREATE TRIGGER set_payroll_updated_at
    BEFORE UPDATE ON payroll
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function: Auto-generate employee code
-- ============================================
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TRIGGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
        SELECT COUNT(*) + 1 INTO total_count FROM employees;
        NEW.employee_code := 'NV' || LPAD(total_count::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_employee_code
    BEFORE INSERT ON employees
    FOR EACH ROW
    EXECUTE FUNCTION generate_employee_code();

-- ============================================
-- Function: Auto-calculate total salary
-- ============================================
CREATE OR REPLACE FUNCTION calculate_total_salary()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_salary := NEW.base_salary + NEW.allowances + NEW.bonus - NEW.deductions;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_salary
    BEFORE INSERT OR UPDATE ON payroll
    FOR EACH ROW
    EXECUTE FUNCTION calculate_total_salary();

COMMIT;
