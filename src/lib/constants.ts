// Google Sheets API Configuration
// Replace this URL with your deployed Google Apps Script Web App URL
export const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

// Sheet Names
export const SHEETS = {
    MENUS: 'Menus',
    QUOTES: 'Quotes',
    ORDERS: 'Orders',
    CALENDAR: 'Calendar',
    VENDORS: 'Vendors',
    FINANCE: 'Finance',
    SETTINGS: 'Settings',
} as const;

// Event Types
export const EVENT_TYPES = {
    THOI_NOI: { id: 'thoi_noi', name: 'Thôi Nôi', icon: '👶', color: '#FFB6C1' },
    DAM_CUOI: { id: 'dam_cuoi', name: 'Đám Cưới', icon: '💒', color: '#FF69B4' },
    DAM_HOI: { id: 'dam_hoi', name: 'Đám Hỏi', icon: '💍', color: '#FF4500' },
    DAM_DO: { id: 'dam_do', name: 'Đám Dỗ', icon: '🙏', color: '#4B0082' },
    LIEN_HOAN: { id: 'lien_hoan', name: 'Liên Hoan', icon: '🎉', color: '#32CD32' },
    SINH_NHAT: { id: 'sinh_nhat', name: 'Sinh Nhật', icon: '🎂', color: '#FF6347' },
    KHAC: { id: 'khac', name: 'Khác', icon: '🍽️', color: '#4169E1' },
} as const;

// Menu Categories
export const MENU_CATEGORIES = {
    KHAI_VI: 'Khai vị',
    MON_CHINH: 'Món chính',
    MON_CHAY: 'Món chay',
    TRANG_MIENG: 'Tráng miệng',
    DO_UONG: 'Đồ uống',
    PHU_GIA: 'Phụ gia',
} as const;

// Order Statuses
export const ORDER_STATUSES = {
    CONFIRMED: { id: 'confirmed', name: 'Đã xác nhận', color: '#3B82F6' },
    PREPARING: { id: 'preparing', name: 'Đang chuẩn bị', color: '#F59E0B' },
    IN_PROGRESS: { id: 'in_progress', name: 'Đang phục vụ', color: '#8B5CF6' },
    COMPLETED: { id: 'completed', name: 'Hoàn thành', color: '#10B981' },
    CANCELLED: { id: 'cancelled', name: 'Đã hủy', color: '#EF4444' },
} as const;

// Quote Statuses
export const QUOTE_STATUSES = {
    DRAFT: { id: 'draft', name: 'Nháp', color: '#6B7280' },
    SENT: { id: 'sent', name: 'Đã gửi', color: '#3B82F6' },
    ACCEPTED: { id: 'accepted', name: 'Đã chấp nhận', color: '#10B981' },
    REJECTED: { id: 'rejected', name: 'Từ chối', color: '#EF4444' },
} as const;

// Vendor Categories
export const VENDOR_CATEGORIES = {
    CHEF: { id: 'chef', name: 'Đầu bếp', icon: '👨‍🍳' },
    WAITER: { id: 'waiter', name: 'Phục vụ', icon: '🤵' },
    EQUIPMENT: { id: 'equipment', name: 'Thuê đồ', icon: '🍽️' },
    INGREDIENT: { id: 'ingredient', name: 'Nguyên liệu', icon: '🥩' },
    DECORATION: { id: 'decoration', name: 'Trang trí', icon: '🎀' },
} as const;

// Finance Categories
export const FINANCE_CATEGORIES = {
    INCOME: {
        DEPOSIT: 'Tiền cọc',
        PAYMENT: 'Thanh toán',
        OTHER_INCOME: 'Thu nhập khác',
    },
    EXPENSE: {
        INGREDIENT: 'Nguyên liệu',
        LABOR: 'Nhân công',
        EQUIPMENT: 'Thiết bị',
        TRANSPORT: 'Vận chuyển',
        OTHER_EXPENSE: 'Chi phí khác',
    },
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
    CASH: { id: 'cash', name: 'Tiền mặt', icon: '💵' },
    TRANSFER: { id: 'transfer', name: 'Chuyển khoản', icon: '🏦' },
    MOMO: { id: 'momo', name: 'MoMo', icon: '📱' },
    ZALO_PAY: { id: 'zalo_pay', name: 'ZaloPay', icon: '📱' },
} as const;

// App Settings
export const APP_CONFIG = {
    APP_NAME: 'ẨM THỰC GIÁO TUYẾT',
    COMPANY_PHONE: '0123 456 789',
    COMPANY_EMAIL: 'contact@amthucgiatuyet.com',
    COMPANY_ADDRESS: 'Số 123, Đường ABC, Quận XYZ, TP. HCM',
    DEFAULT_CURRENCY: 'VND',
    DATE_FORMAT: 'dd/MM/yyyy',
    TIME_FORMAT: 'HH:mm',
} as const;
