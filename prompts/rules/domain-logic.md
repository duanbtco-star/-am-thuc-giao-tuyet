# Domain Logic Rules - Ẩm Thực Giáo Tuyết

> **Load when**: Business logic, calculations, domain-specific features.
> **Domain**: Catering Management

---

## 1. Core Entities

### 1.1 Menu (Thực đơn)
```typescript
interface Menu {
  id: string;
  name: string;           // Tên món
  category: string;       // Loại: appetizer, main, soup, dessert
  selling_price: number;  // Giá bán
  cost_price: number;     // Giá vốn
  unit: string;           // Đơn vị: phần, kg, con
  active: boolean;
}
```

### 1.2 Quote (Báo giá)
```typescript
interface Quote {
  id: string;
  quote_number: string;   // Auto: BGAM001-DDMMYYYY
  customer_name: string;
  phone: string;
  event_date: Date;
  num_tables: number;     // Số bàn
  dishes: Dish[];         // Danh sách món
  price_per_table: number;
  subtotal: number;
  vat_percent: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}
```

### 1.3 Order (Đơn hàng)
```typescript
interface Order {
  id: string;
  order_number: string;   // Auto: ORD001-DDMMYYYY
  quote_id?: string;      // Từ báo giá
  customer_name: string;
  phone: string;
  event_date: Date;
  event_time: string;
  location: string;
  total_amount: number;
  deposit: number;        // Đặt cọc
  remaining: number;      // Còn lại
  status: 'confirmed' | 'preparing' | 'in_progress' | 'completed' | 'cancelled';
}
```

---

## 2. Calculation Rules

### 2.1 Quote Calculation
```typescript
// Tính giá trên mỗi bàn
const price_per_table = dishes.reduce((sum, dish) => sum + dish.price, 0);

// Tính tổng tiền chưa VAT
const subtotal = price_per_table * num_tables;

// Tính VAT
const vat_amount = subtotal * (vat_percent / 100);

// Tổng cộng
const total = subtotal + vat_amount;
```

### 2.2 Deposit Calculation
```typescript
// Tiền đặt cọc thường = 30-50% tổng
const deposit = total * 0.3;

// Còn lại
const remaining = total - deposit;
```

### 2.3 Profit Calculation
```typescript
// Lợi nhuận = Doanh thu - Chi phí
const revenue = income_transactions.reduce((s, t) => s + t.amount, 0);
const expenses = expense_transactions.reduce((s, t) => s + t.amount, 0);
const profit = revenue - expenses;
```

---

## 3. Status Flows

### 3.1 Quote Status Flow
```
draft → sent → accepted → (order created)
                ↓
            rejected
```

### 3.2 Order Status Flow
```
confirmed → preparing → in_progress → completed
                ↓
            cancelled
```

---

## 4. Auto-Numbering Rules

### 4.1 Quote Number
- Format: `BGAM{NNN}-{DDMMYYYY}`
- NNN: Số thứ tự trong ngày (001, 002, ...)
- Reset mỗi ngày

### 4.2 Order Number
- Format: `ORD{NNN}-{DDMMYYYY}`
- NNN: Số thứ tự trong ngày (001, 002, ...)
- Reset mỗi ngày

---

## 5. Business Rules

### 5.1 Quote Rules
- Quote hợp lệ phải có: `customer_name`, `phone`, `event_date`
- Tối thiểu 1 món trong `dishes`
- `event_date` phải >= ngày hiện tại

### 5.2 Order Rules
- Order từ Quote đã accepted
- Hoặc tạo trực tiếp
- Phải có `deposit` trước khi `confirmed`

### 5.3 Finance Rules
- Mỗi transaction phải có `type`: income | expense
- Transaction income liên kết với `order_id`
- Transaction expense có thể liên kết `vendor_id`

---

## 6. Data Validation

### 6.1 Phone Number
```typescript
// Vietnam phone format
const isValidPhone = (phone: string) => {
  return /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
};
```

### 6.2 Price
```typescript
// Price must be positive
const isValidPrice = (price: number) => {
  return price >= 0 && Number.isFinite(price);
};
```

### 6.3 Date
```typescript
// Event date must be future or today
const isValidEventDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};
```
