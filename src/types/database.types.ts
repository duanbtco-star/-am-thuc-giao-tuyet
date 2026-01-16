// Database Types for Supabase
// Generated based on schema - can be auto-generated with: supabase gen types typescript

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            menus: {
                Row: {
                    id: string
                    name: string
                    category: string | null
                    selling_price: number
                    cost_price: number | null
                    unit: string | null
                    description: string | null
                    active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category?: string | null
                    selling_price: number
                    cost_price?: number | null
                    unit?: string | null
                    description?: string | null
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string | null
                    selling_price?: number
                    cost_price?: number | null
                    unit?: string | null
                    description?: string | null
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            quotes: {
                Row: {
                    id: string
                    quote_number: string | null
                    customer_name: string
                    phone: string
                    address: string | null
                    event_type: string | null
                    event_date: string | null
                    num_tables: number
                    dishes: Json
                    price_per_table: number
                    subtotal: number
                    vat_percent: number
                    total: number
                    status: 'draft' | 'sent' | 'accepted' | 'rejected'
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    quote_number?: string | null
                    customer_name: string
                    phone: string
                    address?: string | null
                    event_type?: string | null
                    event_date?: string | null
                    num_tables?: number
                    dishes?: Json
                    price_per_table?: number
                    subtotal?: number
                    vat_percent?: number
                    total?: number
                    status?: 'draft' | 'sent' | 'accepted' | 'rejected'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    quote_number?: string | null
                    customer_name?: string
                    phone?: string
                    address?: string | null
                    event_type?: string | null
                    event_date?: string | null
                    num_tables?: number
                    dishes?: Json
                    price_per_table?: number
                    subtotal?: number
                    vat_percent?: number
                    total?: number
                    status?: 'draft' | 'sent' | 'accepted' | 'rejected'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    order_number: string | null
                    quote_id: string | null
                    customer_name: string
                    phone: string
                    event_date: string
                    event_time: string | null
                    location: string | null
                    menu_items: Json
                    total_amount: number
                    deposit: number
                    remaining: number
                    status: 'confirmed' | 'preparing' | 'in_progress' | 'completed' | 'cancelled'
                    assigned_vendors: Json
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_number?: string | null
                    quote_id?: string | null
                    customer_name: string
                    phone: string
                    event_date: string
                    event_time?: string | null
                    location?: string | null
                    menu_items?: Json
                    total_amount?: number
                    deposit?: number
                    remaining?: number
                    status?: 'confirmed' | 'preparing' | 'in_progress' | 'completed' | 'cancelled'
                    assigned_vendors?: Json
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_number?: string | null
                    quote_id?: string | null
                    customer_name?: string
                    phone?: string
                    event_date?: string
                    event_time?: string | null
                    location?: string | null
                    menu_items?: Json
                    total_amount?: number
                    deposit?: number
                    remaining?: number
                    status?: 'confirmed' | 'preparing' | 'in_progress' | 'completed' | 'cancelled'
                    assigned_vendors?: Json
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            calendar_events: {
                Row: {
                    id: string
                    order_id: string | null
                    title: string
                    event_date: string
                    start_time: string | null
                    end_time: string | null
                    event_type: string | null
                    location: string | null
                    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    title: string
                    event_date: string
                    start_time?: string | null
                    end_time?: string | null
                    event_type?: string | null
                    location?: string | null
                    status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    title?: string
                    event_date?: string
                    start_time?: string | null
                    end_time?: string | null
                    event_type?: string | null
                    location?: string | null
                    status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
                    color?: string | null
                    created_at?: string
                }
            }
            vendors: {
                Row: {
                    id: string
                    name: string
                    category: string | null
                    phone: string | null
                    address: string | null
                    specialties: string | null
                    rating: number | null
                    price_range: string | null
                    active: boolean
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category?: string | null
                    phone?: string | null
                    address?: string | null
                    specialties?: string | null
                    rating?: number | null
                    price_range?: string | null
                    active?: boolean
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string | null
                    phone?: string | null
                    address?: string | null
                    specialties?: string | null
                    rating?: number | null
                    price_range?: string | null
                    active?: boolean
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    order_id: string | null
                    date: string
                    type: 'income' | 'expense'
                    category: string | null
                    amount: number
                    payment_method: string | null
                    vendor_id: string | null
                    description: string | null
                    receipt_url: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    order_id?: string | null
                    date: string
                    type: 'income' | 'expense'
                    category?: string | null
                    amount: number
                    payment_method?: string | null
                    vendor_id?: string | null
                    description?: string | null
                    receipt_url?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    order_id?: string | null
                    date?: string
                    type?: 'income' | 'expense'
                    category?: string | null
                    amount?: number
                    payment_method?: string | null
                    vendor_id?: string | null
                    description?: string | null
                    receipt_url?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            employees: {
                Row: {
                    id: string
                    employee_code: string
                    full_name: string
                    phone: string | null
                    email: string | null
                    position: string | null
                    department: string | null
                    date_of_birth: string | null
                    start_date: string
                    base_salary: number
                    daily_rate: number
                    status: 'active' | 'inactive' | 'terminated'
                    avatar_url: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    employee_code?: string
                    full_name: string
                    phone?: string | null
                    email?: string | null
                    position?: string | null
                    department?: string | null
                    date_of_birth?: string | null
                    start_date?: string
                    base_salary?: number
                    daily_rate?: number
                    status?: 'active' | 'inactive' | 'terminated'
                    avatar_url?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    employee_code?: string
                    full_name?: string
                    phone?: string | null
                    email?: string | null
                    position?: string | null
                    department?: string | null
                    date_of_birth?: string | null
                    start_date?: string
                    base_salary?: number
                    daily_rate?: number
                    status?: 'active' | 'inactive' | 'terminated'
                    avatar_url?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            attendance: {
                Row: {
                    id: string
                    employee_id: string
                    date: string
                    status: 'present' | 'absent' | 'leave' | 'sick' | 'holiday'
                    check_in_time: string | null
                    check_out_time: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    employee_id: string
                    date: string
                    status?: 'present' | 'absent' | 'leave' | 'sick' | 'holiday'
                    check_in_time?: string | null
                    check_out_time?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    employee_id?: string
                    date?: string
                    status?: 'present' | 'absent' | 'leave' | 'sick' | 'holiday'
                    check_in_time?: string | null
                    check_out_time?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            payroll: {
                Row: {
                    id: string
                    employee_id: string
                    month: number
                    year: number
                    total_days_worked: number
                    base_salary: number
                    allowances: number
                    bonus: number
                    deductions: number
                    total_salary: number
                    payment_status: 'pending' | 'paid' | 'cancelled'
                    payment_date: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    employee_id: string
                    month: number
                    year: number
                    total_days_worked?: number
                    base_salary?: number
                    allowances?: number
                    bonus?: number
                    deductions?: number
                    total_salary?: number
                    payment_status?: 'pending' | 'paid' | 'cancelled'
                    payment_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    employee_id?: string
                    month?: number
                    year?: number
                    total_days_worked?: number
                    base_salary?: number
                    allowances?: number
                    bonus?: number
                    deductions?: number
                    total_salary?: number
                    payment_status?: 'pending' | 'paid' | 'cancelled'
                    payment_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            settings: {
                Row: {
                    key: string
                    value: string | null
                    description: string | null
                    updated_at: string
                }
                Insert: {
                    key: string
                    value?: string | null
                    description?: string | null
                    updated_at?: string
                }
                Update: {
                    key?: string
                    value?: string | null
                    description?: string | null
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Convenience types
export type Menu = Database['public']['Tables']['menus']['Row']
export type MenuInsert = Database['public']['Tables']['menus']['Insert']
export type MenuUpdate = Database['public']['Tables']['menus']['Update']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']

export type Vendor = Database['public']['Tables']['vendors']['Row']
export type VendorInsert = Database['public']['Tables']['vendors']['Insert']
export type VendorUpdate = Database['public']['Tables']['vendors']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Setting = Database['public']['Tables']['settings']['Row']

// HR Management types
export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type Attendance = Database['public']['Tables']['attendance']['Row']
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update']

export type Payroll = Database['public']['Tables']['payroll']['Row']
export type PayrollInsert = Database['public']['Tables']['payroll']['Insert']
export type PayrollUpdate = Database['public']['Tables']['payroll']['Update']
