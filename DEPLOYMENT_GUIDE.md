# 🚀 Hướng Dẫn Triển Khai - ẨM THỰC GIÁO TUYẾT

## Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion
- **Backend**: Google Apps Script (REST API)
- **Database**: Google Sheets
- **Hosting**: Vercel (frontend) / Google Apps Script (backend)

---

## 📋 Bước 1: Cấu hình Google Sheets Database

### 1.1. Mở Google Sheets đã tạo
🔗 **Link Sheet**: https://docs.google.com/spreadsheets/d/1N1b2LOZEUJVFvYyuDLJ_Y_otOOvedG7CSNNOG8h9y0g/edit

### 1.2. Kiểm tra các sheets đã tạo
Đảm bảo đã có 7 sheets với headers:
- ✅ **Menus** (9 cột): `menu_id`, `name`, `category`, `selling_price`, `cost_price`, `unit`, `description`, `active`, `created_at`
- ✅ **Quotes** (14 cột): `quote_id`, `customer_name`, `phone`, `event_type`, `event_date`, `location`, `num_tables`, `dishes_input`, `staff_count`, `table_type`, `subtotal`, `total`, `status`, `created_at`
- ✅ **Orders** (17 cột): `order_id`, `quote_id`, `customer_name`, `phone`, `event_type`, `event_date`, `event_time`, `location`, `guest_count`, `menu_items`, `total_amount`, `deposit`, `remaining`, `status`, `assigned_vendors`, `created_at`, `notes`
- ✅ **Calendar** (10 cột): `event_id`, `order_id`, `title`, `event_date`, `start_time`, `end_time`, `event_type`, `location`, `status`, `color`
- ✅ **Vendors** (10 cột): `vendor_id`, `name`, `category`, `phone`, `address`, `specialties`, `rating`, `price_range`, `active`, `notes`
- ✅ **Finance** (13 cột): `transaction_id`, `order_id`, `date`, `type`, `category`, `amount`, `payment_method`, `vendor_id`, `description`, `receipt_url`, `created_by`, `created_at`, `updated_at`
- ✅ **Settings** (4 cột): `key`, `value`, `description`, `updated_at`

---

## 📋 Bước 2: Deploy Google Apps Script API

### 2.1. Mở Apps Script Editor
1. Trong Google Sheets, click **Extensions** → **Apps Script**
2. Cửa sổ Apps Script Editor sẽ mở ra

### 2.2. Copy code vào Apps Script
1. Xóa code mặc định trong `Code.gs`
2. Copy **toàn bộ** nội dung file `google-apps-script/Code.gs` trong dự án
3. Paste vào Apps Script Editor
4. Click **Save** (Ctrl+S)

### 2.3. Cấp quyền và chạy setup
1. Click dropdown function → chọn `setupSheets`
2. Click **Run** (▶️)
3. Click **Review permissions** khi popup xuất hiện
4. Chọn tài khoản Google của bạn
5. Click **Advanced** → **Go to [Project name] (unsafe)**
6. Click **Allow**
7. Đợi setup hoàn tất (check Execution log)

### 2.4. Deploy Web App
1. Click **Deploy** → **New deployment**
2. Click ⚙️ icon → chọn **Web app**
3. Cấu hình:
   - **Description**: `ẨM THỰC GIÁO TUYẾT API v1`
   - **Execute as**: `Me (email@gmail.com)`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. **QUAN TRỌNG**: Copy **Web App URL** (dạng `https://script.google.com/macros/s/ABC.../exec`)

### 2.5. Test API
Mở trình duyệt và test endpoint:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?action=getMenus
```

Nếu trả về `[]` hoặc dữ liệu JSON → **Thành công!** ✅

---

## 📋 Bước 3: Cấu hình Frontend

### 3.1. Tạo file .env.local
```bash
cd "d:\PROJECT\AM THUC GIAO TUYET"
copy .env.local.example .env.local
```

### 3.2. Cập nhật .env.local
Mở file `.env.local` và thay thế bằng Web App URL từ bước 2.4:

```env
# Google Apps Script Web App URL
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec
```

### 3.3. Khởi động development server
```bash
npm run dev
```

Truy cập: http://localhost:3000

---

## 📋 Bước 4: Thêm dữ liệu mẫu (Optional)

### 4.1. Thêm menu items vào sheet Menus
Ví dụ:

| menu_id | name | category | selling_price | cost_price | unit | description | active | created_at |
|---------|------|----------|---------------|------------|------|-------------|--------|------------|
| MENU-001 | Gà luộc | Món chính | 350000 | 280000 | con | Gà luộc nguyên con | TRUE | 2026-01-14 |
| MENU-002 | Heo quay | Món chính | 1200000 | 900000 | con | Heo quay da giòn | TRUE | 2026-01-14 |
| MENU-003 | Tôm hấp bia | Hải sản | 450000 | 350000 | kg | Tôm sú hấp bia | TRUE | 2026-01-14 |

### 4.2. Test tính năng Quote Builder
1. Truy cập http://localhost:3000/bao-gia
2. Nhập thông tin khách hàng
3. Nhập món ăn dạng text (ví dụ: "Gà luộc x 10")
4. Xem báo giá với giá gốc và lợi nhuận

---

## 📋 Bước 5: Deploy Production (Vercel)

### 5.1. Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit - ẨM THỰC GIÁO TUYẾT"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/am-thuc-giao-tuyet.git
git push -u origin main
```

### 5.2. Deploy lên Vercel
1. Truy cập https://vercel.com
2. Click **Import Project**
3. Chọn repository GitHub
4. Thêm Environment Variable:
   - Key: `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`
   - Value: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`
5. Click **Deploy**

### 5.3. Cập nhật CORS (nếu cần)
Nếu production gặp lỗi CORS, quay lại Apps Script và update headers trong `doGet()` và `doPost()`.

---

## 🔧 Troubleshooting

### ❌ Lỗi: "Authorization required"
**Giải pháp**: Chạy lại function `setupSheets()` và cấp quyền đầy đủ

### ❌ Lỗi: "Cannot read property of undefined"
**Giải pháp**: Kiểm tra lại headers trong Google Sheets, đảm bảo đúng tên cột

### ❌ Lỗi CORS
**Giải pháp**: Thêm headers trong Apps Script:
```javascript
function doGet(e) {
  const output = ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers
  output.setHeader('Access-Control-Allow-Origin', '*');
  return output;
}
```

### ❌ API không trả về dữ liệu
**Giải pháp**: 
1. Check Execution log trong Apps Script
2. Verify sheet names khớp với `SHEET_NAMES` constant
3. Test endpoint trực tiếp trong browser

---

## 📊 Kiến trúc hệ thống

```
┌─────────────────┐
│   Next.js App   │  ← Frontend (Vercel)
│  (localhost:300)│
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│ Google Apps     │  ← Backend API
│ Script Web App  │
└────────┬────────┘
         │ Read/Write
         ▼
┌─────────────────┐
│  Google Sheets  │  ← Database
│   (7 sheets)    │
└─────────────────┘
```

---

## 📞 Support

Nếu gặp vấn đề, check:
1. ✅ Google Sheets có đúng structure chưa?
2. ✅ Apps Script đã deploy chưa?
3. ✅ `.env.local` có URL đúng chưa?
4. ✅ `npm run dev` có chạy được không?
