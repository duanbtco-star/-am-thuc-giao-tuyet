# 📘 HƯỚNG DẪN SỬ DỤNG AI WORKFLOW
## ERP SaaS - Construction & Electrical Industry

> **Version**: 3.0 - Full Automation với Roadmap Integration
> **Cập nhật**: 2026-01-12
> **Automation Level**: 95%

---

## 📋 MỤC LỤC

1. [Bắt Đầu Nhanh (Quick Start)](#1-bắt-đầu-nhanh-quick-start)
2. [Quy Trình Phát Triển Tính Năng](#2-quy-trình-phát-triển-tính-năng)
3. [Xử Lý Lỗi & Recovery](#3-xử-lý-lỗi--recovery)
4. [Agent Bị Treo - Xử Lý Sự Cố](#4-agent-bị-treo---xử-lý-sự-cố)
5. [Tùy Chỉnh Theo Ý Người Dùng](#5-tùy-chỉnh-theo-ý-người-dùng)
   - [5.7 Tạo Domain Agent Cho Module Mới](#57-tạo-domain-agent-cho-module-mới)
6. [Commands Reference](#6-commands-reference)
7. [Cấu Trúc Đội Ngũ Agent](#7-cấu-trúc-đội-ngũ-agent)

---

## 1. BẮT ĐẦU NHANH (Quick Start)

### 1.1 Bước Đầu Tiên - Xác Định Yêu Cầu

**TRƯỚC KHI BẮT ĐẦU**, bạn cần xác định:

| Câu hỏi | Ví dụ |
| :--- | :--- |
| **Tính năng gì?** | "Quản lý Đơn mua hàng" |
| **Thuộc module nào?** | Inventory / Sales / Projects / etc. |
| **Có trong Roadmap chưa?** | Check `.agent/ROADMAP.md` |

### 1.2 Khởi Động Workflow

#### Option A: Sử dụng Slash Command (Recommended)
```
/create-feature Quản lý Đơn mua hàng trong module Inventory
```

#### Option B: Yêu cầu tự nhiên
```
Tôi muốn tạo tính năng quản lý đơn mua hàng (Purchase Order) 
cho module Inventory. Tính năng này cần có:
- CRUD đầy đủ
- Phê duyệt theo workflow
- In PDF
```

### 1.3 Điều Gì Xảy Ra Sau Khi Bắt Đầu?

```
┌─────────────────────────────────────────────────────────────┐
│  BẠN: "/create-feature Đơn mua hàng"                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 0: AI kiểm tra ROADMAP.md                             │
│  ├─ Tính năng có trong Sprint hiện tại không?               │
│  ├─ Dependencies đã hoàn thành chưa?                        │
│  └─ Nếu không có → Hỏi bạn "Thêm vào roadmap?"             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1-7: TỰ ĐỘNG CHẠY (không cần can thiệp)              │
│  ├─ Analysis → Database → Backend → Frontend               │
│  ├─ Browser Test → Permission → Documentation              │
│  └─ Update Roadmap                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  KẾT QUẢ: Code hoàn chỉnh + Test passed + User Guide       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. QUY TRÌNH PHÁT TRIỂN TÍNH NĂNG

### 2.1 Toàn Bộ 8 Steps

| Step | Tên | Agent | Tự động? | Output |
| :---: | :--- | :--- | :---: | :--- |
| 0 | Roadmap Alignment | Orchestrator | ✅ | Sprint mapping |
| 1 | Analysis | Orchestrator | ✅ | 5-Dim table |
| 2 | Database | Database Agent | ✅ | Migration files |
| 3 | Backend | Backend Agent | ✅ | Go API code |
| 4 | Frontend | Frontend Agent | ✅ | React components |
| 5 | Browser Test | Browser Agent | ✅ | Screenshots |
| 6 | Permission | Security Agent | ✅ | Matrix updated |
| 7 | Documentation | QA Agent | ✅ | User guide (VN) |
| 8 | Roadmap Update | Orchestrator | ✅ | ⬜→✅ |

### 2.2 Chi Tiết Từng Bước

#### Step 0: Roadmap Alignment
```yaml
AI sẽ:
  - Đọc .agent/ROADMAP.md
  - Tìm Sprint phù hợp (theo thời gian)
  - Kiểm tra dependencies
  - Nếu không có trong roadmap → Hỏi bạn

Bạn cần:
  - Trả lời Yes/No nếu được hỏi
```

#### Step 1: Analysis (5-Dimensional)
```yaml
AI sẽ:
  - Tạo bảng đánh giá impact:
    | Dimension | Related? | Level | Reason |
    | UX | Yes | High | New workflow |
    | UI | Yes | High | New screens |
    | FE | Yes | High | React components |
    | BE | Yes | High | API endpoints |
    | DA | Yes | High | New tables |

Bạn cần:
  - Review nếu muốn (optional)
```

#### Step 2: Database
```yaml
AI sẽ:
  - Tạo file: migrations/{timestamp}_purchase_orders.up.sql
  - Tự động kiểm tra: RLS, tenant_id, indexes
  - Chạy migration

Bạn cần:
  - Đảm bảo PostgreSQL đang chạy
```

#### Step 3-4: Backend & Frontend
```yaml
AI sẽ:
  - Backend: Tạo Go files trong internal/modules/{module}/
  - Frontend: Tạo React files trong frontend/src/app/(dashboard)/
  - Tự động generate API contract (Go → TypeScript)
  - Tự động extract i18n keys (VN + EN)

Bạn cần:
  - Không cần làm gì (fully automated)
```

#### Step 5-7: Test & Documentation
```yaml
AI sẽ (chạy song song):
  - Browser Test: Mở browser, test UI
  - Permission: Cập nhật permission-matrix.md
  - Documentation: Tạo user guide tiếng Việt

Bạn cần:
  - Đảm bảo dev servers đang chạy (hoặc AI sẽ start)
```

### 2.3 Theo Dõi Tiến Độ

Bất cứ lúc nào, bạn có thể gõ:
```
/status
```

Output:
```
┌─────────────────────────────────────────────────────────────┐
│  WORKFLOW: feature_purchase_order_20260112_2250            │
├─────────────────────────────────────────────────────────────┤
│  Current Step: 4 (Frontend)                                 │
│  Status: IN_PROGRESS                                        │
│                                                             │
│  Checkpoints:                                               │
│  ✅ [1] analysis_complete                                   │
│  ✅ [2] database_complete                                   │
│  ✅ [3] backend_complete                                    │
│  🔄 [4] frontend_complete                                   │
│  ⬜ [5] browser_test_passed                                 │
│  ⬜ [6] permission_defined                                  │
│  ⬜ [7] documentation_complete                              │
│  ⬜ [8] final_verification                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. XỬ LÝ LỖI & RECOVERY

### 3.1 Khi Gặp Lỗi

**AI sẽ tự động thử fix** thông qua `auto-correction.md`. Nếu không fix được, bạn sẽ thấy:

```
❌ ERROR at Step 3 (Backend):
   go test ./... failed
   
   Error: undefined: PurchaseOrderRepository
   File: internal/modules/inventory/infrastructure/po_handler.go:15
   
   Suggested fix: Missing interface implementation
   
   Commands:
   - /retry 3     → Thử lại step này
   - /rollback 2  → Quay lại Database step
   - /abort       → Hủy workflow
```

### 3.2 Recovery Commands

| Command | Khi nào dùng | Ví dụ |
| :--- | :--- | :--- |
| `/retry {step}` | Lỗi tạm thời, muốn thử lại | `/retry 3` |
| `/rollback {step}` | Cần quay lại sửa bước trước | `/rollback 2` |
| `/resume` | Tiếp tục từ checkpoint cuối | `/resume` |
| `/status` | Xem trạng thái hiện tại | `/status` |
| `/abort` | Hủy toàn bộ workflow | `/abort` |

### 3.3 Các Lỗi Thường Gặp

#### Lỗi 1: Database Connection Failed
```
❌ Error: FATAL: password authentication failed

Giải pháp:
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra connection string trong .env
3. /retry 2
```

#### Lỗi 2: Go Test Failed
```
❌ Error: go test failed

Giải pháp:
1. Đọc error message
2. Nếu missing import → AI sẽ tự fix
3. Nếu logic error → /rollback 3, mô tả lỗi cho AI
```

#### Lỗi 3: TypeScript Compile Error
```
❌ Error: npm run build failed

Giải pháp:
1. AI sẽ tự động fix type errors
2. Nếu vẫn lỗi → /retry 4
3. Nếu lỗi phức tạp → Mô tả cho AI
```

#### Lỗi 4: Browser Test Failed
```
❌ Error: Element not found: [data-testid="po-create-btn"]

Giải pháp:
1. Kiểm tra frontend đã build thành công
2. Kiểm tra component có render đúng
3. /retry 5
```

### 3.4 Manual Intervention (Khi Cần Can Thiệp)

Nếu AI không thể tự fix, bạn có thể:

```
Tôi thấy lỗi ở file po_handler.go dòng 15. 
Nguyên nhân là chưa implement interface PurchaseOrderRepository.
Hãy tạo file repository và implement interface đó.
```

AI sẽ hiểu và sửa theo yêu cầu.

---

## 4. AGENT BỊ TREO - XỬ LÝ SỰ CỐ

### 4.1 Dấu Hiệu Agent Bị Treo

| Dấu hiệu | Nguyên nhân có thể |
| :--- | :--- |
| Không phản hồi > 2 phút | Quá tải context |
| Lặp lại cùng một output | Stuck in loop |
| Output không liên quan | Context bị corrupt |
| Trả về code sai module | Agent nhầm context |

### 4.2 Các Bước Xử Lý

#### Bước 1: Kiểm tra Status
```
/status
```

#### Bước 2: Thử Resume
```
/resume
```

#### Bước 3: Nếu Vẫn Treo - Context Reset
```
Hãy dừng lại. Tải lại context từ:
- Orchestrator: .agent/prompts/orchestrator.md
- Workflow: .agent/workflows/create-feature.md
- Status: /status

Sau đó tiếp tục từ checkpoint cuối.
```

#### Bước 4: Nếu Vẫn Không Được - Hard Reset
```
/abort

Sau đó bắt đầu lại:
/create-feature [tên tính năng]
```

### 4.3 Phòng Ngừa Agent Treo

| Nguyên nhân | Phòng ngừa |
| :--- | :--- |
| Context quá lớn | Chia nhỏ yêu cầu |
| Yêu cầu mơ hồ | Mô tả rõ ràng, cụ thể |
| Quá nhiều thay đổi | Một tính năng/lần |
| File quá lớn | Agent tự động chunk |

### 4.4 Emergency Reset Script

Nếu hoàn toàn không thể tiếp tục:

```powershell
# Reset workflow state
# Chạy trong PowerShell
Remove-Item -Path ".agent/workflow-state.json" -Force
Write-Host "Workflow state cleared. Start fresh with /create-feature"
```

---

## 5. TÙY CHỈNH THEO Ý NGƯỜI DÙNG

### 5.1 Sửa Đổi Trong Quá Trình Phát Triển

Bất cứ lúc nào, bạn có thể yêu cầu thay đổi:

```
Dừng lại. Tôi muốn thay đổi:
- Thêm field "discount_percent" vào Purchase Order
- Input field này phải validate 0-100
- Hiển thị dưới dạng % trong grid
```

AI sẽ:
1. Ghi nhận thay đổi
2. Xác định ảnh hưởng (DB? BE? FE?)
3. Rollback về step phù hợp
4. Thực hiện thay đổi
5. Tiếp tục từ đó

### 5.2 Yêu Cầu Thay Đổi UI/UX

```
Tôi muốn:
- Form tạo mới phải là wizard 3 bước, không phải modal đơn
- Step 1: Thông tin cơ bản
- Step 2: Chi tiết sản phẩm  
- Step 3: Xác nhận và Submit

Áp dụng theo Linear Design System.
```

### 5.3 Yêu Cầu Thay Đổi Business Logic

```
Tôi muốn thay đổi logic phê duyệt:
- Đơn < 10 triệu: Tự động duyệt
- Đơn 10-50 triệu: Manager duyệt
- Đơn > 50 triệu: Director duyệt

Cần hiển thị badge trạng thái khác nhau cho từng level.
```

### 5.4 Từ Chối Đề Xuất Của AI

```
AI: Tôi đề xuất sử dụng modal cho form tạo mới.

Bạn: Không, tôi muốn dùng drawer slide từ phải. 
     Width 600px, có animation smooth.
```

### 5.5 Yêu Cầu Preview Trước Khi Apply

```
Trước khi tạo code, hãy show tôi:
1. Database schema (ERD)
2. API endpoints list
3. UI wireframe

Tôi sẽ review trước khi bạn implement.
```

### 5.6 Yêu Cầu Tuân Theo File Mockup

```
Implement tính năng Purchase Order theo mockup:
- File: Mockups/INVENTORY/Purchase Order/PO-List.md
- File: Mockups/INVENTORY/Purchase Order/PO-Create.md

Phải giống 100% với mockup đã định nghĩa.
```

### 5.7 Tạo Domain Agent Cho Module Mới

Khi cần tạo module hoàn toàn mới chưa có trong hệ thống, sử dụng Domain Agent Generator:

#### Cách 1: Interactive Wizard
```bash
/create-domain-agent PurchaseOrder
```

AI sẽ hỏi đáp qua 5 bước:

```
Step 1/5: Basic Info
───────────────────────────────
Module Name: Purchase Order
Tiếng Việt: Đơn mua hàng
Thuộc về: [1] Inventory [2] Sales [3] Finance [4] Other
> 1

Step 2/5: Entities
───────────────────────────────
Các entity trong module (comma separated):
> PurchaseOrder, PurchaseOrderItem, Supplier

Step 3/5: Fields
───────────────────────────────
| Field | Type | Required |
| po_number | string | yes |
| supplier_id | uuid | yes |
| order_date | date | yes |
| total_amount | decimal | yes |
| status | enum | yes |

Step 4/5: Screens
───────────────────────────────
[x] List (Grid)
[x] Create Form
[x] Edit Form
[x] Detail View
[ ] Dashboard Widget

Step 5/5: Permissions
───────────────────────────────
[x] Admin (full access)
[x] Manager (CRUD)
[x] Staff (Read + Create)
```

#### Kết Quả
```
✅ Created: prompts/modules/purchase_order.md (Backend Logic)
✅ Created: prompts/modules/purchase_order-ui.md (UI Specification)
```

#### Cách 2: Import từ JSON
```bash
/create-domain-agent --from module-definition.json
```

File JSON format:
```json
{
  "name": "PurchaseOrder",
  "nameVN": "Đơn mua hàng",
  "parent": "inventory",
  "entities": [
    {
      "name": "PurchaseOrder",
      "fields": [
        { "name": "po_number", "type": "string", "required": true },
        { "name": "status", "type": "enum", "values": ["draft", "approved"] }
      ]
    }
  ],
  "screens": ["list", "create", "edit"],
  "permissions": {
    "admin": ["*"],
    "manager": ["read", "create", "update"]
  }
}
```

#### Sau Khi Tạo
```bash
# Tiếp tục phát triển tính năng
/create-feature Quản lý [tên tính năng] trong module [module vừa tạo]
```

---

## 6. COMMANDS REFERENCE

### 6.1 Workflow Commands

| Command | Mô tả |
| :--- | :--- |
| `/create-feature {name}` | Tạo tính năng mới |
| `/create-module {name}` | Tạo module hoàn chỉnh |
| `/create-domain-agent {module}` | Tạo Domain Agent (Backend + UI) |
| `/fix-bug {description}` | Sửa lỗi |
| `/refactor {scope}` | Refactor code |

### 6.2 Control Commands

| Command | Mô tả |
| :--- | :--- |
| `/status` | Xem trạng thái workflow |
| `/resume` | Tiếp tục từ checkpoint |
| `/retry {step}` | Thử lại step |
| `/rollback {step}` | Quay lại step |
| `/abort` | Hủy workflow |

### 6.3 Query Commands

| Command | Mô tả |
| :--- | :--- |
| `/checkpoints` | Xem tất cả checkpoints |
| `/tokens` | Xem token usage |
| `/history` | Xem lịch sử steps |
| `/errors` | Xem error log |

### 6.4 Quick Actions

| Command | Mô tả |
| :--- | :--- |
| `/test` | Chạy browser test |
| `/build` | Build frontend |
| `/migrate` | Chạy database migration |
| `/docs` | Generate documentation |

---

## 7. CẤU TRÚC ĐỘI NGŨ AGENT

### 7.1 Orchestrator & Core

| Agent | File | Nhiệm vụ |
| :--- | :--- | :--- |
| **Orchestrator** | `prompts/orchestrator.md` | Điều phối 7-Step Process |
| **Router** | `prompts/router.md` | Cross-module routing |
| **State Machine** | `prompts/state-machine.md` | FSM control |

### 7.2 Specialists (9 agents)

| Agent | File | Nhiệm vụ |
| :--- | :--- | :--- |
| **Database** | `specialists/database.md` | PostgreSQL, RLS |
| **Backend** | `specialists/backend.md` | Go, Clean Architecture |
| **Frontend** | `specialists/frontend.md` | Next.js, Linear Design |
| **Browser Test** | `specialists/browser-test.md` | UI verification |
| **Security** | `specialists/security.md` | RBAC, ReBAC |
| **QA** | `specialists/qa.md` | Testing, Documentation |
| **DevOps** | `specialists/devops.md` | Docker, K8s, CI/CD |
| **Auto-Correction** | `specialists/auto-correction.md` | Error recovery |

### 7.3 Validators (4 files)

| Validator | File | Nhiệm vụ |
| :--- | :--- | :--- |
| **Schema** | `validators/schema-validator.md` | RLS, tenant_id |
| **Permission** | `validators/permission-engine.md` | RBAC check |
| **DoD** | `validators/dod-runner.md` | Final verification |

### 7.4 Automation Utilities (3 files)

| Utility | File | Nhiệm vụ |
| :--- | :--- | :--- |
| **API Contract** | `api-contract-generator.md` | Go → TypeScript |
| **i18n Extractor** | `i18n-extractor.md` | Auto translation |
| **Roadmap Updater** | `roadmap-updater.md` | Status tracking |

### 7.5 Domain Modules (9 modules)

| Module | Backend | UI |
| :--- | :--- | :--- |
| Auth | `modules/auth.md` | `modules/auth-ui.md` |
| Dashboard | `modules/dashboard.md` | `modules/dashboard-ui.md` |
| Settings | `modules/settings.md` | `modules/settings-ui.md` |
| Inventory | `modules/inventory.md` | `modules/inventory-ui.md` |
| Sales | `modules/sales.md` | `modules/sales-ui.md` |
| Projects | `modules/projects.md` | `modules/projects-ui.md` |
| Manufacturing | `modules/manufacturing.md` | `modules/manufacturing-ui.md` |
| Finance/HR | `modules/finance_hr.md` | `modules/finance_hr-ui.md` |
| Customer | `modules/customer.md` | `modules/customer-ui.md` |

---

## 📞 HỖ TRỢ

### Nếu Gặp Vấn Đề Không Giải Quyết Được

1. **Mô tả chi tiết** vấn đề gặp phải
2. **Cung cấp context**: Step nào, lỗi gì, đã thử gì
3. **Paste error message** đầy đủ

Ví dụ:
```
Tôi đang ở Step 3 (Backend), gặp lỗi:
- Error: undefined: PurchaseOrderService
- File: internal/modules/inventory/application/usecase.go:25
- Đã thử /retry 3 nhưng vẫn lỗi
- Đã kiểm tra file service.go đã tồn tại

Hãy giúp tôi debug.
```

---

**🎉 Chúc bạn sử dụng AI Workflow hiệu quả!**
