# Project: Ẩm Thực Giáo Tuyết

> **AI Workforce Configuration** - Đọc file này mỗi khi bắt đầu làm việc với project.

---

## 🚨 MANDATORY RULES

**Trước khi làm BẤT KỲ task nào**, AI Agent PHẢI:

### 1. Load Global Rules
```
prompts/rules/core.md        # ALWAYS - Priority Order, Tech Stack
prompts/orchestrator.md       # ALWAYS - 6-Step Process
```

### 2. Load Rules theo Task Type
| Task Type | Additional Rules |
|:---|:---|
| New Feature | `prompts/rules/` + `prompts/specialists/security.md` |
| New Module | ALL `prompts/rules/*` + ALL `prompts/specialists/*` |
| Bug Fix | `prompts/specialists/auto-correction.md` |
| Database | `prompts/rules/database.md` |
| Frontend | `prompts/rules/frontend.md` |
| Auth | `prompts/rules/security.md` + `prompts/specialists/auth.md` |

---

## 🚀 AUTO-RUN COMMANDS (TURBO MODE)

> ⚡ **Các lệnh sau tự động chạy KHÔNG CẦN xác nhận:**

| Command | Auto-Run | Reason |
|:---|:---:|:---|
| `npm run dev` | ✅ | Start dev server |
| `npm run build` | ✅ | Build production |
| `npm run lint` | ✅ | Check code quality |
| `npx supabase db push` | ✅ | Push migrations |
| `npx supabase db migrate` | ✅ | Run migrations |
| `npx supabase gen types` | ✅ | Generate TypeScript types |
| `git status/log/diff` | ✅ | Read-only git |

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | Next.js 14+ (App Router) |
| Backend | Next.js Route Handlers |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |

---

## Priority Order (Ghi nhớ!)

```
UX → UI → FE → BE → DA
```

*Luôn ưu tiên trải nghiệm người dùng trước cấu trúc dữ liệu.*

---

## Workflows Có Sẵn

| Command | Mô tả |
|:---|:---|
| `/dev` | Load rules trước khi làm việc |
| `/create-feature` | Tạo tính năng mới |
| `/create-module` | Tạo module mới |
| `/fix-bug` | Sửa lỗi có hệ thống |
| `/refactor` | Refactor code an toàn |

---

## Key Documents

| Document | Path |
|:---|:---|
| Global Rules | `prompts/rules/` |
| Specialists | `prompts/specialists/` |
| API Documentation | `API_DOCUMENTATION.md` |
| User Manual | `USER_MANUAL.md` |
| Roadmap | `ROADMAP.md` |

---

## Definition of Done

Mọi task phải hoàn thành:
- [ ] 5-Dimensional Assessment
- [ ] **Authorization Review passed** (⬇️ xem chi tiết bên dưới)
- [ ] Browser test passed
- [ ] User Guide (Vietnamese) updated
- [ ] No console/network errors

---

## 🔐 Permission Requirements (BẮT BUỘC)

> ⚠️ **Mọi tính năng PHẢI có kiểm tra phân quyền trước khi hoàn thành.**

### Checklist Phân Quyền
| # | Yêu cầu | Mô tả |
|:---:|:---|:---|
| 1 | **Roles** | Xác định roles nào được truy cập |
| 2 | **CRUD** | Phân quyền Create/Read/Update/Delete |
| 3 | **Frontend** | Ẩn UI cho người dùng không có quyền |
| 4 | **Backend** | API trả 403 Forbidden nếu không có quyền |

### Role Defaults
| Role | Quyền |
|:---|:---|
| `admin` | Full access |
| `staff` | Create, Read, Update |
| `viewer` | Read only |

### Tham khảo chi tiết: `prompts/specialists/security.md`
