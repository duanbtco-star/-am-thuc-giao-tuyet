# 📚 API Documentation - ẨM THỰC GIÁO TUYẾT

## Base URL

```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## Authentication

Không yêu cầu authentication. API public cho internal use.

---

## Endpoints

### 1. Menu API

#### Get All Menu Items
```http
GET /?action=getMenus
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "MENU-001",
      "name": "Gà lên mâm",
      "category": "mon_chinh",
      "unit": "con",
      "cost_price": 180000,
      "selling_price": 250000,
      "description": "Gà ta luộc nguyên con",
      "is_popular": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "count": 46
}
```

#### Add Menu Item
```http
POST /
Content-Type: application/json

{
  "action": "addMenu",
  "data": {
    "name": "Món mới",
    "category": "mon_chinh",
    "unit": "phần",
    "cost_price": 50000,
    "selling_price": 80000,
    "description": "Mô tả món",
    "is_popular": false
  }
}
```

---

### 2. Orders API

#### Get All Orders
```http
GET /?action=getOrders
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "order_id": "ORD-20260115-A1X",
      "customer_name": "Nguyễn Văn An",
      "phone": "0912345678",
      "event_type": "dam_cuoi",
      "event_date": "2026-01-25",
      "event_time": "11:00",
      "location": "123 Lê Văn Sỹ, Q.3",
      "num_tables": 15,
      "num_guests": 150,
      "dishes": "[...]",
      "total_revenue": 45000000,
      "total_cost": 28000000,
      "deposit": 20000000,
      "balance": 25000000,
      "status": "confirmed",
      "payment_status": "partial",
      "notes": "",
      "created_at": "2026-01-14T10:00:00Z"
    }
  ]
}
```

#### Add Order
```http
POST /
Content-Type: application/json

{
  "action": "addOrder",
  "data": {
    "customer_name": "Tên khách",
    "phone": "0912345678",
    "event_type": "dam_cuoi",
    "event_date": "2026-02-01",
    "event_time": "11:00",
    "location": "Địa chỉ",
    "num_tables": 10,
    "num_guests": 100,
    "dishes": "[...]",
    "total_revenue": 30000000,
    "total_cost": 18000000,
    "deposit": 10000000,
    "status": "confirmed"
  }
}
```

#### Update Order Status
```http
POST /
Content-Type: application/json

{
  "action": "updateOrderStatus",
  "data": {
    "order_id": "ORD-20260115-A1X",
    "status": "completed"
  }
}
```

---

### 3. Quotes API

#### Get All Quotes
```http
GET /?action=getQuotes
```

#### Add Quote
```http
POST /
Content-Type: application/json

{
  "action": "addQuote",
  "data": {
    "customer_name": "Tên khách",
    "phone": "0912345678",
    "email": "email@example.com",
    "event_type": "dam_cuoi",
    "event_date": "2026-02-01",
    "num_tables": 10,
    "num_reserve_tables": 2,
    "dishes_input": "Gà lên mâm x2, Súp cua x1",
    "dishes_parsed": "[...]",
    "service_type": "standard",
    "total_revenue": 30000000,
    "total_cost": 18000000,
    "estimated_profit": 12000000,
    "status": "pending"
  }
}
```

---

### 4. Calendar API

#### Get All Events
```http
GET /?action=getCalendarEvents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": "EVT-001",
      "order_id": "ORD-20260115-A1X",
      "title": "Đám cưới - Nguyễn Văn An",
      "event_date": "2026-01-25",
      "start_time": "11:00",
      "end_time": "14:00",
      "event_type": "dam_cuoi",
      "location": "123 Lê Văn Sỹ",
      "notes": "",
      "status": "confirmed"
    }
  ]
}
```

---

### 5. Finance API

#### Get All Transactions
```http
GET /?action=getTransactions
```

#### Get Finance Summary
```http
GET /?action=getFinanceSummary&month=1&year=2026
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_income": 50000000,
    "total_expense": 30000000,
    "profit": 20000000,
    "transactions_count": 15
  }
}
```

#### Add Transaction
```http
POST /
Content-Type: application/json

{
  "action": "addTransaction",
  "data": {
    "order_id": "ORD-20260115-A1X",
    "date": "2026-01-14",
    "type": "income",
    "category": "deposit",
    "amount": 10000000,
    "payment_method": "transfer",
    "description": "Tiền cọc đơn hàng",
    "vendor_name": null
  }
}
```

---

### 6. Vendors API

#### Get All Vendors
```http
GET /?action=getVendors
```

#### Add Vendor
```http
POST /
Content-Type: application/json

{
  "action": "addVendor",
  "data": {
    "name": "Tên nhà cung cấp",
    "category": "nguyen_lieu",
    "phone": "0987654321",
    "address": "Địa chỉ",
    "contact_person": "Người liên hệ",
    "notes": "Ghi chú",
    "rating": 5
  }
}
```

---

### 7. Settings API

#### Get Settings
```http
GET /?action=getSettings
```

#### Update Setting
```http
POST /
Content-Type: application/json

{
  "action": "updateSetting",
  "data": {
    "key": "default_staff_cost",
    "value": "200000"
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes
| Status | Message | Description |
|--------|---------|-------------|
| 400 | Invalid action | Action không hợp lệ |
| 400 | Missing required fields | Thiếu field bắt buộc |
| 404 | Not found | Không tìm thấy record |
| 500 | Internal error | Lỗi server |

---

## Event Types

| ID | Name | Icon |
|----|------|------|
| `dam_cuoi` | Đám cưới | 💒 |
| `dam_hoi` | Đám hỏi | 💍 |
| `thoi_noi` | Thôi nôi | 👶 |
| `sinh_nhat` | Sinh nhật | 🎂 |
| `lien_hoan` | Liên hoan | 🎉 |
| `gio_to` | Giỗ/Cúng | 🙏 |
| `tiec_nho` | Tiệc nhỏ | 🍽️ |

---

## Order Status

| ID | Name | Color |
|----|------|-------|
| `pending` | Chờ xác nhận | Gray |
| `confirmed` | Đã xác nhận | Green |
| `preparing` | Đang chuẩn bị | Blue |
| `serving` | Đang phục vụ | Orange |
| `completed` | Hoàn thành | Purple |
| `cancelled` | Đã hủy | Red |

---

## CORS Note

API hỗ trợ CORS cho phép gọi từ bất kỳ origin nào.

Headers trong response:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
