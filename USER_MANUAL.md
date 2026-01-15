# 📖 Hướng Dẫn Sử Dụng - ẨM THỰC GIÁO TUYẾT

## Giới thiệu

**ẨM THỰC GIÁO TUYẾT** là hệ thống quản lý nội bộ cho dịch vụ nấu ăn tiệc tại nhà, giúp bạn:
- 📊 Theo dõi doanh thu, lợi nhuận qua Dashboard
- 💰 Tạo báo giá nhanh với Quote Builder
- 📋 Quản lý đơn hàng từ A-Z
- 📅 Xem lịch sự kiện tổng quan
- 💵 Ghi nhận thu chi tài chính
- 🏪 Quản lý nhà cung cấp

---

## 1. Dashboard (Trang chủ)

### Truy cập
- URL: `/` hoặc trang chủ

### Các thành phần

#### 1.1 KPI Cards (6 thẻ)
| Thẻ | Ý nghĩa |
|-----|---------|
| **Doanh thu tháng** | Tổng doanh thu tháng hiện tại |
| **Đơn hàng** | Số đơn hàng tháng này |
| **Lợi nhuận** | Lợi nhuận ước tính |
| **Giá trị TB** | Giá trị trung bình mỗi đơn |
| **Tỷ lệ hủy** | Phần trăm đơn bị hủy |
| **Khách mới** | Số khách hàng mới |

#### 1.2 Biểu đồ
- **Doanh thu & Lợi nhuận**: So sánh 6 tháng gần nhất
- **Loại tiệc**: Phân bố theo loại sự kiện

#### 1.3 Quick Links
- **Tạo báo giá**: Đi đến Quote Builder
- **Quản lý đơn**: Xem danh sách đơn hàng
- **Lịch sự kiện**: Xem calendar
- **Tài chính**: Sổ cái thu chi
- **Nhà cung cấp**: Danh sách vendors

---

## 2. Quote Builder (Tạo Báo Giá)

### Truy cập
- URL: `/bao-gia`
- Hoặc click **"Tạo báo giá"** trên Dashboard

### Quy trình 3 bước

#### Bước 1: Thông tin khách hàng
1. Nhập **Tên khách hàng** (bắt buộc)
2. Nhập **Số điện thoại** (bắt buộc)
3. Nhập **Email** (tùy chọn)
4. Chọn **Loại tiệc**: Đám cưới, Đám hỏi, Thôi nôi...
5. Click **"Tiếp tục"**

#### Bước 2: Chi tiết đơn hàng
1. Nhập **Ngày tổ chức**
2. Nhập **Số bàn chính** và **Số bàn dự phòng**
3. **Nhập danh sách món ăn**:
   ```
   Gà lên mâm x2
   Súp cua tóc tiên
   Cá hấp Hồng Kông x1
   Xôi gấc
   ```
   > 💡 **Tips**: Hệ thống tự động nhận diện tên món và số lượng!

4. Chọn **Loại dịch vụ**: Full service / Chỉ nấu / Tự phục vụ
5. Click **"Xem báo giá"**

#### Bước 3: Xem báo giá
- **Bảng chi tiết**: Tên món, số lượng, đơn giá, thành tiền
- **Cột nội bộ** (chỉ admin thấy): Giá gốc, lợi nhuận
- **Tổng kết**:
  - Tổng doanh thu
  - Tổng chi phí ước tính
  - Lợi nhuận dự kiến
- **Hành động**:
  - 📤 **Tạo đơn hàng**: Chuyển thành order
  - 💾 **Lưu báo giá**: Lưu để gửi khách sau
  - ✏️ **Sửa đổi**: Quay lại chỉnh sửa

### Tính năng Autocomplete
- Khi nhập tên món, gõ vài ký tự sẽ hiện gợi ý
- Dùng **↑↓** để chọn, **Enter/Tab** để xác nhận
- Hỗ trợ **fuzzy matching**: "ga lu" → "Gà lên mâm"

---

## 3. Quản Lý Đơn Hàng

### Truy cập
- URL: `/don-hang`
- Hoặc click **"Quản lý đơn"** trên Dashboard

### Các tính năng

#### 3.1 Lọc đơn hàng
- **Theo trạng thái**: Tất cả, Đã xác nhận, Đang chuẩn bị...
- **Tìm kiếm**: Theo tên khách, mã đơn, số điện thoại

#### 3.2 Xem chi tiết đơn
- Click vào đơn hàng để xem modal chi tiết
- Thông tin: Khách, ngày, địa điểm, số bàn, tổng tiền, cọc, còn lại

#### 3.3 Cập nhật trạng thái
- Click **"Cập nhật trạng thái"** trong modal
- Chọn trạng thái mới

### Các trạng thái đơn hàng
| Trạng thái | Icon | Ý nghĩa |
|------------|------|---------|
| Chờ xác nhận | ⏳ | Mới tạo, chưa xác nhận |
| Đã xác nhận | ✅ | Khách đã đồng ý |
| Đang chuẩn bị | 🔵 | Đang mua nguyên liệu |
| Đang phục vụ | 🟠 | Đang diễn ra tiệc |
| Hoàn thành | ✅ | Đã xong |
| Đã hủy | ❌ | Bị hủy |

---

## 4. Lịch Sự Kiện

### Truy cập
- URL: `/lich`
- Hoặc click **"Lịch sự kiện"** trên Dashboard

### Các tính năng

#### 4.1 Chế độ xem
- **📅 Tháng**: Lịch theo tháng, màu sắc theo loại tiệc
- **📋 Danh sách**: List các sự kiện sắp tới

#### 4.2 Điều hướng
- **◀ ▶**: Chuyển tháng
- **"Hôm nay"**: Về tháng hiện tại

#### 4.3 Chi tiết sự kiện
- Click vào sự kiện để xem:
  - Ngày, giờ
  - Địa điểm
  - Số khách
  - Link đến đơn hàng

---

## 5. Quản Lý Tài Chính

### Truy cập
- URL: `/tai-chinh`
- Hoặc click **"Tài chính"** trên Dashboard

### Các tính năng

#### 5.1 Dashboard tài chính
- **Tổng thu** (màu xanh): Tổng tiền đã thu
- **Tổng chi** (màu đỏ): Tổng tiền đã chi
- **Lợi nhuận** (màu xanh dương): Thu - Chi

#### 5.2 Thêm giao dịch
1. Click **"+ Thêm giao dịch"**
2. Chọn loại: **Thu** hoặc **Chi**
3. Liên kết đơn hàng (nếu có)
4. Chọn danh mục:
   - Thu: Tiền cọc, Thanh toán, Thu khác
   - Chi: Nguyên liệu, Nhân công, Thiết bị, Vận chuyển
5. Nhập số tiền, ngày, phương thức thanh toán
6. Mô tả chi tiết
7. Click **"Ghi thu"** hoặc **"Ghi chi"**

#### 5.3 Lọc giao dịch
- **Theo loại**: Tất cả / Thu / Chi
- **Theo ngày**: Chọn khoảng thời gian
- **Tìm kiếm**: Theo mô tả

---

## 6. Quản Lý Nhà Cung Cấp

### Truy cập
- URL: `/vendor`
- Hoặc click **"Nhà cung cấp"** trên Dashboard

### Các tính năng

#### 6.1 Xem danh sách
- Grid view với avatar, tên, loại, rating
- Lọc theo loại: Nguyên liệu, Thiết bị, Nhân công...

#### 6.2 Chi tiết vendor
- Click để xem: SĐT, địa chỉ, người liên hệ, ghi chú

---

## 7. Phím Tắt & Tips

### Keyboard Shortcuts
| Phím | Chức năng |
|------|-----------|
| `Esc` | Đóng modal |
| `Enter` | Xác nhận action |
| `↑↓` | Di chuyển trong dropdown |
| `Tab` | Chuyển field |

### Tips sử dụng
1. **Nhập món nhanh**: Chỉ cần gõ vài chữ đầu
2. **Số lượng mặc định**: Không ghi số = 1 phần
3. **Refresh data**: Click icon 🔄 để cập nhật
4. **Mobile friendly**: Có thể dùng trên điện thoại

---

## 8. Troubleshooting

### Không load được dữ liệu?
- Kiểm tra kết nối internet
- Click nút **Refresh** 🔄
- Hệ thống tự động dùng dữ liệu mẫu nếu API lỗi

### Món ăn không tìm thấy?
- Kiểm tra chính tả
- Thử gõ ngắn hơn (VD: "ga" thay vì "gà lên mâm")
- Món chưa có trong database → báo admin thêm

### Báo giá sai số liệu?
- Kiểm tra số lượng đã nhập đúng
- Kiểm tra đơn giá trong menu

---

## 9. Liên Hệ Hỗ Trợ

**Email**: support@amthucgiatuyet.com  
**Hotline**: 0912 345 678  
**Working hours**: 8:00 - 22:00 hàng ngày

---

*Cập nhật lần cuối: 14/01/2026*
