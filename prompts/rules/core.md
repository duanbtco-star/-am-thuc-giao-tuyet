# Core Rules - Ẩm Thực Giáo Tuyết

> **Essential rules PHẢI load cho mọi task.**
> Dự án: **Single-tenant Catering Management System**

---

## 0. DAO/Supreme Principles

### Article 1: Absolute Priority Order
**`UX → UI → FE → BE → DA`**
- **Philosophy**: Xây dựng cho Người dùng, không phải cho Database.
- Mọi quyết định kỹ thuật phải ưu tiên layer phía trên.

### Article 2: Mandatory 5-Dimensional Assessment
Mọi feature request PHẢI đánh giá:
1. **UX** (User Experience): Flow, Dễ sử dụng
2. **UI** (User Interface): Giao diện, Layout
3. **FE** (Frontend): Interaction, State Management
4. **BE** (Backend): Logic, API Design
5. **DA** (Data Architecture): Schema, Integrity

---

## 1. Architecture & Tech Stack

| Component | Technology | Version |
|:---|:---|:---|
| **Pattern** | Single-tenant Monolith | - |
| **Frontend** | Next.js (App Router) | 14+ |
| **Backend** | Next.js Route Handlers | `/api/*` |
| **Database** | Supabase (PostgreSQL) | - |
| **Auth** | Supabase Auth | Email/OAuth |
| **Hosting** | Vercel | Production |

---

## 2. Security Model (Single-Tenant)

> ⚠️ **Lưu ý**: Dự án này là **single-tenant**, không cần multi-tenancy.

### 2.1 Row-Level Security (RLS)
- RLS vẫn được **bật** để bảo vệ data
- Sử dụng policy đơn giản: `USING (true)` cho authenticated users
- Không cần `tenant_id` column

### 2.2 Authentication
- Supabase Auth quản lý users
- Session-based authentication
- Protected routes via middleware

---

## 3. Module Structure

| Module | Tables | Endpoint |
|:---|:---|:---|
| **Menu** | `menus` | `/api/menus` |
| **Quotes** | `quotes` | `/api/quotes` |
| **Orders** | `orders` | `/api/orders` |
| **Calendar** | `calendar_events` | `/api/calendar` |
| **Vendors** | `vendors` | `/api/vendors` |
| **Finance** | `transactions` | `/api/finance` |

---

## 4. Communication Standards

- **Language**: Vietnamese (Tiếng Việt) cho tất cả explanations và docs
- **Code Comments**: English (cho compatibility)
- **UI Text**: Vietnamese (default)

---

## 5. Definition of Done (DoD)

Mọi feature hoàn thành khi:
- [ ] 5-Dimensional Assessment documented
- [ ] **Authorization Review passed** (xem Section 6)
- [ ] Code hoạt động đúng chức năng
- [ ] Browser test passed
- [ ] User Guide (Vietnamese) created
- [ ] Không có console/network errors

---

## 6. Authorization Review (MANDATORY)

> ⚠️ **BẮT BUỘC**: Mọi feature PHẢI kiểm tra phân quyền trước khi hoàn thành.

### 6.1 Checklist Phân Quyền
Trước khi đánh dấu feature "Done", PHẢI trả lời:

| # | Câu hỏi | Yêu cầu |
|:---|:---|:---|
| 1 | **Module Access** | Roles nào có thể XEM feature này? |
| 2 | **CRUD Permissions** | Roles nào có thể Create/Read/Update/Delete? |
| 3 | **Frontend Guard** | UI có ẩn elements không được phép? |
| 4 | **Backend Guard** | API có trả 403 cho requests không được phép? |

### 6.2 Role Matrix (Tham khảo)
| Role | Quyền mặc định |
|:---|:---|
| `admin` | Full access - tất cả tính năng |
| `staff` | Create, Read, Update - không Delete |
| `viewer` | Read only - chỉ xem |

### 6.3 Specialist Reference
Đọc chi tiết pattern tại: `prompts/specialists/security.md`

---

## Quick Reference

### Load Additional Rules (As Needed)
| Need | File |
|:---|:---|
| Database/SQL work | `prompts/rules/database.md` |
| Frontend/React work | `prompts/rules/frontend.md` |
| Security/Auth work | `prompts/rules/security.md` |
| Domain logic | `prompts/rules/domain-logic.md` |

### Key Documents
| Document | Path |
|:---|:---|
| API Documentation | `API_DOCUMENTATION.md` |
| User Manual | `USER_MANUAL.md` |
| Roadmap | `ROADMAP.md` |
