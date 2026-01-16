/**
 * Data Migration Script: Google Sheets → Supabase
 * 
 * Hướng dẫn sử dụng:
 * 1. Export dữ liệu từ Google Sheets sang JSON files
 *    - Tạo 6 files: menus.json, quotes.json, orders.json, calendar.json, vendors.json, transactions.json
 *    - Đặt vào thư mục `data/exports/`
 * 
 * 2. Chạy script:
 *    npx tsx scripts/migrate-from-sheets.ts
 * 
 * 3. Verify trong Supabase Table Editor
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'exports')

interface LegacyMenu {
    menu_id: string
    name: string
    category: string
    selling_price: number
    cost_price: number
    unit: string
    description: string
    active: boolean
    created_at: string
}

interface LegacyQuote {
    quote_id: string
    customer_name: string
    phone: string
    event_type: string
    event_date: string
    location: string
    num_tables: number
    dishes_input: string
    staff_count: number
    table_type: string
    subtotal: number
    total: number
    status: string
    created_at: string
}

interface LegacyOrder {
    order_id: string
    quote_id: string
    customer_name: string
    phone: string
    event_type: string
    event_date: string
    event_time: string
    location: string
    guest_count: number
    total_amount: number
    deposit: number
    remaining: number
    status: string
    created_at: string
    notes: string
}

interface LegacyVendor {
    vendor_id: string
    name: string
    category: string
    phone: string
    address: string
    specialties: string
    rating: number
    price_range: string
    active: boolean
    notes: string
}

interface LegacyTransaction {
    transaction_id: string
    order_id: string
    date: string
    type: 'income' | 'expense'
    category: string
    amount: number
    payment_method: string
    vendor_id: string
    description: string
    created_at: string
}

// ID Mapping (legacy ID → new UUID)
const idMappings: Record<string, Record<string, string>> = {
    menus: {},
    quotes: {},
    orders: {},
    vendors: {},
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

function parseDate(dateStr: string): string | null {
    if (!dateStr) return null
    try {
        const date = new Date(dateStr)
        return date.toISOString()
    } catch {
        return null
    }
}

async function migrateMenus() {
    const filePath = path.join(DATA_DIR, 'menus.json')
    if (!fs.existsSync(filePath)) {
        console.log('⏭️  Skipping menus.json (not found)')
        return
    }

    const data: LegacyMenu[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Migrating ${data.length} menus...`)

    for (const item of data) {
        const newId = generateUUID()
        idMappings.menus[item.menu_id] = newId

        const { error } = await supabase.from('menus').insert({
            id: newId,
            name: item.name,
            category: item.category,
            selling_price: item.selling_price,
            cost_price: item.cost_price,
            unit: item.unit || 'phần',
            description: item.description,
            is_active: item.active !== false,
            created_at: parseDate(item.created_at) || new Date().toISOString(),
        })

        if (error) {
            console.error(`  ❌ Error migrating menu ${item.name}:`, error.message)
        }
    }
    console.log(`✅ Menus migrated successfully`)
}

async function migrateVendors() {
    const filePath = path.join(DATA_DIR, 'vendors.json')
    if (!fs.existsSync(filePath)) {
        console.log('⏭️  Skipping vendors.json (not found)')
        return
    }

    const data: LegacyVendor[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Migrating ${data.length} vendors...`)

    for (const item of data) {
        const newId = generateUUID()
        idMappings.vendors[item.vendor_id] = newId

        const { error } = await supabase.from('vendors').insert({
            id: newId,
            name: item.name,
            category: item.category,
            phone: item.phone,
            address: item.address,
            specialties: item.specialties,
            rating: item.rating,
            price_range: item.price_range,
            is_active: item.active !== false,
            notes: item.notes,
        })

        if (error) {
            console.error(`  ❌ Error migrating vendor ${item.name}:`, error.message)
        }
    }
    console.log(`✅ Vendors migrated successfully`)
}

async function migrateQuotes() {
    const filePath = path.join(DATA_DIR, 'quotes.json')
    if (!fs.existsSync(filePath)) {
        console.log('⏭️  Skipping quotes.json (not found)')
        return
    }

    const data: LegacyQuote[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Migrating ${data.length} quotes...`)

    for (const item of data) {
        const newId = generateUUID()
        idMappings.quotes[item.quote_id] = newId

        // Parse dishes from legacy format
        let dishes = []
        try {
            if (item.dishes_input) {
                dishes = typeof item.dishes_input === 'string'
                    ? JSON.parse(item.dishes_input)
                    : item.dishes_input
            }
        } catch {
            dishes = []
        }

        const { error } = await supabase.from('quotes').insert({
            id: newId,
            quote_number: item.quote_id, // Keep legacy ID as quote_number
            customer_name: item.customer_name,
            phone: item.phone,
            event_type: item.event_type,
            event_date: parseDate(item.event_date),
            location: item.location,
            num_tables: item.num_tables,
            table_type: item.table_type || 'round',
            dishes: dishes,
            staff_count: item.staff_count || 0,
            subtotal: item.subtotal,
            total: item.total,
            status: item.status || 'draft',
            created_at: parseDate(item.created_at) || new Date().toISOString(),
        })

        if (error) {
            console.error(`  ❌ Error migrating quote ${item.quote_id}:`, error.message)
        }
    }
    console.log(`✅ Quotes migrated successfully`)
}

async function migrateOrders() {
    const filePath = path.join(DATA_DIR, 'orders.json')
    if (!fs.existsSync(filePath)) {
        console.log('⏭️  Skipping orders.json (not found)')
        return
    }

    const data: LegacyOrder[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Migrating ${data.length} orders...`)

    for (const item of data) {
        const newId = generateUUID()
        idMappings.orders[item.order_id] = newId

        const { error } = await supabase.from('orders').insert({
            id: newId,
            order_number: item.order_id, // Keep legacy ID as order_number
            quote_id: idMappings.quotes[item.quote_id] || null,
            customer_name: item.customer_name,
            phone: item.phone,
            event_type: item.event_type,
            event_date: parseDate(item.event_date),
            event_time: item.event_time,
            location: item.location,
            guest_count: item.guest_count,
            total_amount: item.total_amount,
            deposit: item.deposit,
            remaining: item.remaining,
            status: item.status || 'confirmed',
            notes: item.notes,
            created_at: parseDate(item.created_at) || new Date().toISOString(),
        })

        if (error) {
            console.error(`  ❌ Error migrating order ${item.order_id}:`, error.message)
        }
    }
    console.log(`✅ Orders migrated successfully`)
}

async function migrateTransactions() {
    const filePath = path.join(DATA_DIR, 'transactions.json')
    if (!fs.existsSync(filePath)) {
        console.log('⏭️  Skipping transactions.json (not found)')
        return
    }

    const data: LegacyTransaction[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    console.log(`📦 Migrating ${data.length} transactions...`)

    for (const item of data) {
        const newId = generateUUID()

        const { error } = await supabase.from('transactions').insert({
            id: newId,
            order_id: idMappings.orders[item.order_id] || null,
            type: item.type,
            category: item.category,
            amount: item.amount,
            date: parseDate(item.date),
            payment_method: item.payment_method,
            vendor_id: idMappings.vendors[item.vendor_id] || null,
            description: item.description,
            created_at: parseDate(item.created_at) || new Date().toISOString(),
        })

        if (error) {
            console.error(`  ❌ Error migrating transaction:`, error.message)
        }
    }
    console.log(`✅ Transactions migrated successfully`)
}

async function main() {
    console.log('🚀 Starting Google Sheets → Supabase Migration')
    console.log('━'.repeat(50))

    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
        console.log(`\n📁 Creating data exports directory: ${DATA_DIR}`)
        fs.mkdirSync(DATA_DIR, { recursive: true })
        console.log(`\n⚠️  No data files found. Please export data from Google Sheets to JSON files:`)
        console.log(`   - ${DATA_DIR}/menus.json`)
        console.log(`   - ${DATA_DIR}/quotes.json`)
        console.log(`   - ${DATA_DIR}/orders.json`)
        console.log(`   - ${DATA_DIR}/vendors.json`)
        console.log(`   - ${DATA_DIR}/transactions.json`)
        console.log(`\nThen run this script again.`)
        return
    }

    // Run migrations in order (respecting foreign keys)
    await migrateMenus()
    await migrateVendors()
    await migrateQuotes()
    await migrateOrders()
    await migrateTransactions()

    console.log('\n━'.repeat(50))
    console.log('✅ Migration completed!')
    console.log(`\n📊 ID Mappings Summary:`)
    console.log(`   - Menus: ${Object.keys(idMappings.menus).length}`)
    console.log(`   - Vendors: ${Object.keys(idMappings.vendors).length}`)
    console.log(`   - Quotes: ${Object.keys(idMappings.quotes).length}`)
    console.log(`   - Orders: ${Object.keys(idMappings.orders).length}`)
}

main().catch(console.error)
