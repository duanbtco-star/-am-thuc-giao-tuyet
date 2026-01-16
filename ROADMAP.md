# 🗺️ Roadmap - ẨM THỰC GIÁO TUYẾT

> **Cập nhật**: 2026-01-16 | **Version**: 4.0 (HR Module + User Permissions)

## 💡 Giới thiệu dự án

**ẨM THỰC GIÁO TUYẾT** là hệ thống quản lý nội bộ cho dịch vụ nấu ăn tiệc tại nhà:
- ✅ Dashboard KPI analytics
- ✅ Quote Builder (tạo báo giá 4-step wizard)
- ✅ Order Management (quản lý đơn hàng)
- ✅ Calendar Management (lịch sự kiện)
- ✅ Finance Ledger (sổ cái thu chi)
- ✅ Vendor Management (quản lý nhà cung cấp)
- ✅ PDF Export (xuất báo giá PDF)
- ✅ Excel Export (xuất báo cáo Excel)
- ✅ Authentication (login với Supabase Auth)
- ✅ Authorization Framework (AI Workforce rules)
- 🔄 **HR Management** (quản lý nhân sự - MỚI)
- 📅 **User Permissions** (phân quyền người dùng - PENDING)

---

## 🛠️ Tech Stack

| Layer | Technology | Notes |
|:---|:---|:---|
| **Frontend** | Next.js 14 (App Router) | React 18, TypeScript |
| **Styling** | TailwindCSS, Framer Motion | Apple-inspired design |
| **Backend** | Next.js Route Handlers | `/api/*` endpoints |
| **Database** | Supabase (PostgreSQL) | RLS enabled |
| **Auth** | Supabase Auth | Email/Password + Demo mode |
| **Hosting** | Vercel | Production ready |
| **PWA** | Service Worker | Offline support |

---

## 📂 Cấu trúc dự án hiện tại

```
am-thuc-giao-tuyet/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Dashboard (35KB)
│   │   ├── login/                # ✅ Login page
│   │   ├── bao-gia/              # Quote Management
│   │   ├── don-hang/             # Order Management
│   │   ├── lich/                 # Calendar
│   │   ├── tai-chinh/            # Finance Ledger
│   │   ├── vendor/               # Vendor Management
│   │   ├── bao-cao/              # Reports & Analytics
│   │   ├── hr/                   # 🆕 HR Management
│   │   │   ├── employees/        # Employee CRUD
│   │   │   ├── attendance/       # Attendance tracking
│   │   │   └── payroll/          # Payroll calculation
│   │   └── api/                  # Route Handlers (8 modules)
│   │       ├── menus/            
│   │       ├── quotes/           
│   │       ├── orders/           
│   │       ├── calendar/         
│   │       ├── finance/          
│   │       ├── vendors/          
│   │       ├── settings/         
│   │       └── hr/               # 🆕 HR APIs
│   │           ├── employees/
│   │           ├── attendance/
│   │           └── payroll/
│   ├── components/
│   │   ├── hr/                   # 🆕 HR Components
│   │   │   └── EmployeeForm.tsx
│   │   └── ui/                   
│   ├── lib/
│   │   └── supabase/
│   └── types/
│       └── database.types.ts     # Includes HR types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_hr_management.sql # 🆕 HR tables
└── prompts/                      # AI Workforce
```

---

## 📊 Current Progress Summary

```
Phase 1-4: Foundation + Frontend + DB ████████████████████ 100%
Phase 5: Authorization Framework       ████████████████████ 100%
Phase 6: Testing & Polish              ███████████████████░  95%
Phase 7: Production Deploy             ████████████████░░░░  80%
Phase 8: HR Module                     ████████████████████ 100% ✅
Phase 9: User Permissions              ████████████████████ 100% ✅
Phase 10: Data Migration               ██████████░░░░░░░░░░  50%

Overall Progress: ███████████████████░ 92%
```

---

## 🔄 Phase 10: Data Migration (📅 CRITICAL - 0%)

> **QUAN TRỌNG**: Chuyển dữ liệu từ Google Sheets sang Supabase

### 10.1 Hiện trạng Legacy System

**Các file legacy cần xử lý:**
| File | Size | Mô tả |
|:---|:---:|:---|
| `google-apps-script/Code.gs` | 18KB | Google Apps Script backend |
| `src/lib/google-sheets.ts` | 9.9KB | Legacy API wrapper (6 modules) |
| `.env.local` → `GOOGLE_SCRIPT_URL` | - | Deprecated, đã comment out |

**Google Sheets API modules trong legacy:**
- `menuApi` - Thực đơn
- `quoteApi` - Báo giá
- `orderApi` - Đơn hàng
- `calendarApi` - Lịch sự kiện
- `vendorApi` - Nhà cung cấp
- `financeApi` - Thu chi

### 10.2 Migration Tasks

#### 📤 Export từ Google Sheets
- [ ] Export Menu data → CSV/JSON
- [ ] Export Quotes data → CSV/JSON  
- [ ] Export Orders data → CSV/JSON
- [ ] Export Calendar Events → CSV/JSON
- [ ] Export Vendors → CSV/JSON
- [ ] Export Transactions → CSV/JSON

#### 📥 Import vào Supabase
- [ ] Tạo migration script (`scripts/migrate-from-sheets.ts`)
- [ ] Map field names (legacy → new schema)
- [ ] Handle ID conversion (legacy IDs → UUIDs)
- [ ] Validate data integrity
- [ ] Import với proper foreign keys

#### 🔀 Data Mapping
| Google Sheets Field | Supabase Field | Transform |
|:---|:---|:---|
| `menu_id` (string) | `id` (UUID) | Generate new UUID |
| `quote_id` | `id` + `quote_number` | Auto-generate |
| `order_id` | `id` + `order_number` | Auto-generate |
| `created_at` (string) | `created_at` (TIMESTAMPTZ) | Parse date |

### 10.3 Cleanup Legacy Code
- [ ] Remove `src/lib/google-sheets.ts`
- [ ] Remove `src/lib/constants.ts` → `GOOGLE_SCRIPT_URL`
- [ ] Update any imports still using legacy API
- [ ] Archive `google-apps-script/Code.gs`
- [ ] Remove `GOOGLE_SCRIPT_URL` from `.env.local.example`

### 10.4 Verification
- [ ] So sánh số lượng records: Sheets vs Supabase
- [ ] Verify data integrity (random sampling)
- [ ] Test tất cả CRUD operations trên Supabase
- [ ] Confirm frontend hoạt động với data mới

---

## 🎯 Phase 8: HR Management Module (🔄 75%)

> **Mới triển khai**: 2026-01-16

### 8.1 Database Schema
- [x] Table `employees` (17 columns)
- [x] Table `attendance` (check-in/out)
- [x] Table `payroll` (salary calculation)
- [x] RLS policies configured

### 8.2 Backend APIs
- [x] `/api/hr/employees` - CRUD operations
- [x] `/api/hr/attendance` - Chấm công
- [x] `/api/hr/payroll` - Tính lương
- [x] Zod validation
- [ ] Authorization guards (TODO comments)

### 8.3 Frontend Pages
- [x] `/hr/employees` - Danh sách nhân viên + form CRUD
- [x] `/hr/attendance` - Bảng chấm công theo tháng
- [x] `/hr/payroll` - Bảng lương với tính toán tự động
- [x] Dashboard navigation link

### 8.4 Known Issues to Fix
| Issue | Priority | Status |
|:---|:---:|:---:|
| GET /api/hr/employees trả về 500 | 🔴 HIGH | Cần debug |
| Employee auto-code generation | 🟢 Fixed | ✅ |
| Empty string validation | 🟢 Fixed | ✅ |

---

## 🎯 Phase 9: User Permissions (📅 0%)

> **Yêu cầu**: Bổ sung phân quyền cho người dùng vào Settings

### 9.1 Database Design
- [ ] Bổ sung `role` column vào `users` table
- [ ] Hoặc tạo `user_roles` table riêng
- [ ] Migration file `003_user_permissions.sql`

### 9.2 Settings Page - User Management
- [ ] `/settings/users` - Danh sách users
- [ ] User list với role badges
- [ ] Form thay đổi role (dropdown)
- [ ] Admin-only access

### 9.3 Roles to Implement
| Role | Vietnamese | Permissions |
|:---|:---|:---|
| `admin` | Quản trị viên | Full access |
| `manager` | Quản lý | Read, Create, Update, Approve |
| `staff` | Nhân viên | Read, Create, Update |
| `viewer` | Người xem | Read only |

### 9.4 Runtime Permission Enforcement
- [ ] `usePermission` hook
- [ ] API route guards
- [ ] Module visibility control
- [ ] Frontend UI guards (hide buttons)

### 9.5 Integration với permission-matrix.md
- [ ] Map roles theo Module Access Matrix
- [ ] Implement RBAC per module

---

## 🎯 Phases 1-7: Completed (Reference)

<details>
<summary>📋 Click để xem chi tiết Phases đã hoàn thành</summary>

### Phase 1: Foundation (✅ 100%)
- Next.js setup, TailwindCSS, TypeScript

### Phase 2: Frontend Development (✅ 100%)
- Dashboard, Quote Builder, Order Management
- Calendar, Finance, Vendor Management
- Reports & Analytics

### Phase 3: Supabase Migration (✅ 100%)
- 7 tables với RLS
- Auto-generated numbers (quotes, orders)
- API Route Handlers

### Phase 4: Authentication (✅ 100%)
- Login page với demo mode
- Protected routes middleware
- Session management

### Phase 5: Authorization Framework (✅ 100%)
- permission-matrix.md (597 lines)
- AI Workforce rules
- Role definitions

### Phase 6: Testing & Polish (✅ 95%)
- Feature testing
- UI/UX polish
- Bug fixes

### Phase 7: Production Deploy (🔄 80%)
- Environment configured
- Build success
- Deployment guide ready

</details>

---

## 📝 Priority Tasks (Next Steps)

| # | Task | Phase | Priority | Status |
|:---:|:---|:---:|:---:|:---:|
| 1 | Fix GET /api/hr/employees 500 error | 8 | 🔴 HIGH | Pending |
| 2 | Implement User Management in Settings | 9 | 🔴 HIGH | Not started |
| 3 | Add usePermission hook | 9 | 🟡 MEDIUM | Not started |
| 4 | HR Authorization guards | 8 | 🟡 MEDIUM | TODO in code |
| 5 | Deploy to production | 7 | 🟡 MEDIUM | Ready |
| 6 | Update USER_MANUAL.md with HR | 8 | 🟢 LOW | Pending |

---

## 🔐 API Modules Overview

| Module | Endpoints | Auth | Status |
|:---|:---|:---:|:---:|
| `/api/menus` | GET, POST, PUT, DELETE | ✅ | ✅ Working |
| `/api/quotes` | GET, POST, PUT, DELETE | ✅ | ✅ Working |
| `/api/orders` | GET, POST, PUT, DELETE | ✅ | ✅ Working |
| `/api/calendar` | GET, POST | ✅ | ✅ Working |
| `/api/finance` | GET, POST | ✅ | ✅ Working |
| `/api/vendors` | GET, POST | ✅ | ✅ Working |
| `/api/settings` | GET, PUT | ✅ | ✅ Working |
| `/api/hr/employees` | GET, POST, PUT, DELETE | ✅ | ⚠️ GET 500 |
| `/api/hr/attendance` | GET, POST, PUT, DELETE | ✅ | ✅ Working |
| `/api/hr/payroll` | GET, POST, PUT | ✅ | ✅ Working |

---

## 📚 Documentation

| Document | Description | Updated |
|:---|:---|:---:|
| `ROADMAP.md` | This file | 2026-01-16 |
| `API_DOCUMENTATION.md` | API reference | ⏳ Needs HR |
| `USER_MANUAL.md` | End user guide (Vietnamese) | ⏳ Needs HR |
| `permission-matrix.md` | 3-Layer RBAC/ReBAC (597 lines) | ✅ |
| `DEPLOYMENT_GUIDE.md` | Deployment steps | ✅ |

---

## 🔧 AI Workforce Configuration

```
prompts/
├── orchestrator.md          # 7-Step Process
├── rules/
│   ├── core.md              # Priority + Authorization
│   ├── database.md          # Supabase patterns
│   ├── frontend.md          # Next.js patterns
│   ├── security.md          # Auth patterns
│   └── domain-logic.md      # Business rules
└── specialists/
    ├── auth.md              # Supabase Auth patterns
    ├── security.md          # Permission enforcement
    └── ...
```

**Workflows có sẵn**:
- `/dev` - Load rules trước khi làm việc
- `/create-feature` - Tạo tính năng mới
- `/create-module` - Tạo module mới
- `/fix-bug` - Sửa lỗi có hệ thống

---

## 🎯 Definition of Done (DoD)

Mọi feature PHẢI hoàn thành:
- [ ] 5-Dimensional Assessment documented
- [ ] **Authorization Review passed** ✅
- [ ] Code hoạt động đúng chức năng
- [ ] Browser test passed
- [ ] User Guide (Vietnamese) updated
- [ ] Không có console/network errors
