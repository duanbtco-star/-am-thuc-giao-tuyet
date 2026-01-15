# 🚀 Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị Repository

### 1.1. Tạo GitHub Repository
```bash
# Khởi tạo git nếu chưa có
git init

# Thêm tất cả files
git add .

# Commit đầu tiên
git commit -m "Initial commit: Complete Next.js catering management app"

# Tạo repository mới trên GitHub và push
git remote add origin https://github.com/duanbtco-star/am-thuc-giao-tuyet.git
git branch -M main
git push -u origin main
```

### 1.2. Đảm bảo files quan trọng
Kiểm tra các files sau đã có trong repo:
- ✅ `package.json`
- ✅ `next.config.mjs`
- ✅ `.env.local.example` (KHÔNG commit `.env.local`)
- ✅ `tailwind.config.ts`
- ✅ `tsconfig.json`

---

## Bước 2: Deploy lên Vercel

### 2.1. Đăng ký/Đăng nhập Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub

### 2.2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Chọn repository `am-thuc-giao-tuyet`
3. Click **"Import"**

### 2.3. Configure Project
- **Project Name**: `am-thuc-giao-tuyet` (hoặc tên bạn muốn)
- **Framework Preset**: `Next.js` (tự động detect)
- **Root Directory**: `.` (mặc định)

### 2.4. Environment Variables
Click **"Environment Variables"** và thêm:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` | `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec` |

> ⚠️ **Quan trọng**: Sử dụng URL từ Google Apps Script deployment của bạn!

### 2.5. Deploy
Click **"Deploy"** và chờ ~1-2 phút

---

## Bước 3: Kiểm tra Production

### 3.1. Truy cập URL
Sau khi deploy xong, bạn sẽ có URL dạng:
- `https://am-thuc-giao-tuyet.vercel.app`
- Hoặc `https://your-project-name.vercel.app`

### 3.2. Test các tính năng
1. ✅ Dashboard hiển thị đúng
2. ✅ Quote Builder load được menu (46 items)
3. ✅ Orders page hiển thị với mock data
4. ✅ Calendar hoạt động
5. ✅ Finance ghi nhận thu chi
6. ✅ Vendor hiển thị danh sách

---

## Bước 4: Custom Domain (Tùy chọn)

### 4.1. Thêm domain
1. Vào **Project Settings** → **Domains**
2. Thêm domain của bạn: `amthuc.yourdomain.com`
3. Làm theo hướng dẫn cấu hình DNS

### 4.2. SSL tự động
Vercel sẽ tự động cấu hình SSL/HTTPS miễn phí!

---

## Troubleshooting

### Lỗi build?
```bash
# Chạy local để kiểm tra
npm run build
```

### Lỗi environment variables?
- Đảm bảo đã thêm `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` trên Vercel
- Prefix `NEXT_PUBLIC_` là bắt buộc cho client-side variables

### Lỗi CORS?
- Đảm bảo Google Apps Script đã được deploy với:
  - Execute as: **Me**
  - Who has access: **Anyone**

---

## Kết luận

Sau khi hoàn thành, bạn sẽ có:
- 🌐 Website live tại `https://your-project.vercel.app`
- 🔒 HTTPS tự động
- 🚀 Auto-deploy khi push code lên GitHub
- 📊 Analytics (nếu cần)

**Questions?** Liên hệ hỗ trợ qua GitHub Issues!
