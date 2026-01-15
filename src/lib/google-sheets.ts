import { GOOGLE_SCRIPT_URL } from './constants';

// Types
export interface MenuItem {
    menu_id: string;
    name: string;
    category: string;
    selling_price: number;  // Đơn giá bán
    cost_price: number;      // Giá gốc
    unit: string;
    description: string;
    active: boolean;
    created_at: string;
}

export interface Quote {
    quote_id: string;
    customer_name: string;
    phone: string;
    event_type: string;
    event_date: string;
    location: string;
    num_tables: number;
    dishes_input: string;
    staff_count: number;
    table_type: string;
    subtotal: number;
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    created_at: string;
}

export interface QuoteMenuItem {
    menu_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface Order {
    order_id: string;
    quote_id: string;
    customer_name: string;
    phone: string;
    event_type: string;
    event_date: string;
    event_time: string;
    location: string;
    guest_count: number;
    menu_items: QuoteMenuItem[];
    total_amount: number;
    deposit: number;
    remaining: number;
    status: 'confirmed' | 'preparing' | 'in_progress' | 'completed' | 'cancelled';
    assigned_vendors: string[];
    created_at: string;
    notes: string;
}

export interface CalendarEvent {
    event_id: string;
    order_id: string;
    title: string;
    event_date: string;
    start_time: string;
    end_time: string;
    event_type: string;
    location: string;
    status: string;
    color: string;
}

export interface Vendor {
    vendor_id: string;
    name: string;
    category: string;
    phone: string;
    address: string;
    specialties: string;
    rating: number;
    price_range: string;
    active: boolean;
    notes: string;
}

export interface Transaction {
    transaction_id: string;
    order_id: string;
    date: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    payment_method: string;
    vendor_id: string;
    description: string;
    created_at: string;
}

// API Response type
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Base fetch function with error handling
async function fetchFromSheets<T>(
    action: string,
    params: Record<string, unknown> = {}
): Promise<ApiResponse<T>> {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('Google Script URL not configured. Using mock data.');
        return { success: false, error: 'API not configured' };
    }

    try {
        const url = new URL(GOOGLE_SCRIPT_URL);
        url.searchParams.append('action', action);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });

        // Use redirect: 'follow' to properly handle Google Apps Script redirects
        // This is essential for CORS to work correctly with deployed Apps Scripts
        const response = await fetch(url.toString(), {
            method: 'GET',
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function postToSheets<T>(
    action: string,
    body: Record<string, unknown>
): Promise<ApiResponse<T>> {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn('Google Script URL not configured.');
        return { success: false, error: 'API not configured' };
    }

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, ...body }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error posting to Google Sheets:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

// ==================== MENU API ====================
export const menuApi = {
    getAll: () => fetchFromSheets<MenuItem[]>('getMenus'),
    getByCategory: (category: string) =>
        fetchFromSheets<MenuItem[]>('getMenus', { category }),
    getByEventType: (eventType: string) =>
        fetchFromSheets<MenuItem[]>('getMenus', { eventType }),
    create: (menu: Omit<MenuItem, 'menu_id'>) =>
        postToSheets<MenuItem>('createMenu', { menu }),
    update: (menu: MenuItem) =>
        postToSheets<MenuItem>('updateMenu', { menu }),
    delete: (menuId: string) =>
        postToSheets<void>('deleteMenu', { menuId }),
};

// ==================== QUOTE API ====================
export const quoteApi = {
    getAll: () => fetchFromSheets<Quote[]>('getQuotes'),
    getById: (quoteId: string) =>
        fetchFromSheets<Quote>('getQuote', { quoteId }),
    create: (quote: Omit<Quote, 'quote_id' | 'created_at'>) =>
        postToSheets<Quote>('createQuote', { quote }),
    update: (quote: Quote) =>
        postToSheets<Quote>('updateQuote', { quote }),
    delete: (quoteId: string) =>
        postToSheets<void>('deleteQuote', { quoteId }),
    convertToOrder: (quoteId: string) =>
        postToSheets<Order>('convertQuoteToOrder', { quoteId }),
};

// ==================== ORDER API ====================
export const orderApi = {
    getAll: () => fetchFromSheets<Order[]>('getOrders'),
    getById: (orderId: string) =>
        fetchFromSheets<Order>('getOrder', { orderId }),
    getByStatus: (status: string) =>
        fetchFromSheets<Order[]>('getOrders', { status }),
    create: (order: Omit<Order, 'order_id' | 'created_at'>) =>
        postToSheets<Order>('createOrder', { order }),
    update: (order: Order) =>
        postToSheets<Order>('updateOrder', { order }),
    updateStatus: (orderId: string, status: string) =>
        postToSheets<Order>('updateOrderStatus', { orderId, status }),
    delete: (orderId: string) =>
        postToSheets<void>('deleteOrder', { orderId }),
};

// ==================== CALENDAR API ====================
export const calendarApi = {
    getAll: () => fetchFromSheets<CalendarEvent[]>('getCalendarEvents'),
    getByMonth: (year: number, month: number) =>
        fetchFromSheets<CalendarEvent[]>('getCalendarEvents', { year, month }),
    getByDate: (date: string) =>
        fetchFromSheets<CalendarEvent[]>('getCalendarEvents', { date }),
    create: (event: Omit<CalendarEvent, 'event_id'>) =>
        postToSheets<CalendarEvent>('createCalendarEvent', { event }),
    update: (event: CalendarEvent) =>
        postToSheets<CalendarEvent>('updateCalendarEvent', { event }),
    delete: (eventId: string) =>
        postToSheets<void>('deleteCalendarEvent', { eventId }),
};

// ==================== VENDOR API ====================
export const vendorApi = {
    getAll: () => fetchFromSheets<Vendor[]>('getVendors'),
    getByCategory: (category: string) =>
        fetchFromSheets<Vendor[]>('getVendors', { category }),
    getById: (vendorId: string) =>
        fetchFromSheets<Vendor>('getVendor', { vendorId }),
    create: (vendor: Omit<Vendor, 'vendor_id'>) =>
        postToSheets<Vendor>('createVendor', { vendor }),
    update: (vendor: Vendor) =>
        postToSheets<Vendor>('updateVendor', { vendor }),
    delete: (vendorId: string) =>
        postToSheets<void>('deleteVendor', { vendorId }),
};

// ==================== FINANCE API ====================
export const financeApi = {
    getAll: () => fetchFromSheets<Transaction[]>('getTransactions'),
    getByType: (type: 'income' | 'expense') =>
        fetchFromSheets<Transaction[]>('getTransactions', { type }),
    getByDateRange: (startDate: string, endDate: string) =>
        fetchFromSheets<Transaction[]>('getTransactions', { startDate, endDate }),
    getByOrderId: (orderId: string) =>
        fetchFromSheets<Transaction[]>('getTransactions', { orderId }),
    create: (transaction: Omit<Transaction, 'transaction_id' | 'created_at'>) =>
        postToSheets<Transaction>('createTransaction', { transaction }),
    update: (transaction: Transaction) =>
        postToSheets<Transaction>('updateTransaction', { transaction }),
    delete: (transactionId: string) =>
        postToSheets<void>('deleteTransaction', { transactionId }),
    getSummary: (startDate?: string, endDate?: string) =>
        fetchFromSheets<{
            totalIncome: number;
            totalExpense: number;
            profit: number;
            byCategory: Record<string, number>;
        }>('getFinanceSummary', { startDate, endDate }),
};

// ==================== SETTINGS API ====================
export const settingsApi = {
    get: (key: string) => fetchFromSheets<string>('getSetting', { key }),
    set: (key: string, value: string) =>
        postToSheets<void>('setSetting', { key, value }),
    getAll: () => fetchFromSheets<Record<string, string>>('getAllSettings'),
};
