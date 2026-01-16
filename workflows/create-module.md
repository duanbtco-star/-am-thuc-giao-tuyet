---
description: Tạo một module mới hoàn chỉnh từ đầu với tất cả components
---

# /create-module Workflow

> **Trigger**: Khi người dùng muốn tạo một module hoàn toàn mới.
> **Output**: Full module với DB tables, APIs, UI, Tests, Docs, Permissions

// turbo-all

---

## 🔄 CHECKPOINT & RECOVERY SYSTEM

### Workflow State Tracking
```yaml
workflow_id: module_{timestamp}
module_name: {module_name}
current_step: 1
checkpoints:
  - step: 1
    name: planning_complete
    status: pending
  - step: 2
    name: database_complete
    status: pending
  - step: 3
    name: backend_complete
    status: pending
  - step: 4
    name: frontend_complete
    status: pending
  - step: 5
    name: permission_defined
    status: pending
  - step: 6
    name: integration_tests_passed
    status: pending
  - step: 7
    name: browser_test_passed
    status: pending
  - step: 8
    name: documentation_complete
    status: pending
  - step: 9
    name: final_verification
    status: pending
```

### Recovery Commands
| Command | Action |
| :--- | :--- |
| `/resume` | Tiếp tục từ checkpoint cuối cùng |
| `/retry {step}` | Thử lại step cụ thể |
| `/rollback {step}` | Quay lại step trước |
| `/status` | Xem trạng thái workflow hiện tại |
| `/abort` | Hủy workflow và rollback tất cả |

---

## Step 0: Load Global Rules (BẮT BUỘC) 🚨

> ⚠️ **MANDATORY**: Bước này PHẢI thực hiện trước khi làm bất cứ điều gì!

### 0.1 Đọc Core Rules
```
Mở file: prompts/rules/core.md
```
**Ghi nhớ:**
- Priority: `UX → UI → FE → BE → DA`
- Stack: Next.js 14+ + Supabase
- RLS mandatory
- Multi-tenancy với tenant_id

### 0.2 Đọc Orchestrator Flow
```
Mở file: prompts/orchestrator.md
```

### 0.3 Load ALL Rules (Module = Full Stack)
Vì tạo module mới ảnh hưởng toàn bộ stack, load tất cả:
```
prompts/rules/database.md
prompts/rules/frontend.md
prompts/rules/security.md
prompts/rules/domain-logic.md
```

### 0.4 Load Specialists
```
prompts/specialists/database.md
prompts/specialists/backend.md
prompts/specialists/frontend.md
prompts/specialists/auth.md
```

### ✅ Checkpoint: `rules_loaded`
```
□ core.md loaded
□ orchestrator.md loaded
□ ALL dimension rules loaded
□ ALL specialists loaded
→ PROCEED to Step 1
```

---

## Step 1: Module Planning (Lập kế hoạch)

### 📍 CHECKPOINT: `planning_complete`
// turbo-pause
> ⚠️ **HUMAN APPROVAL REQUIRED**: Review module scope before proceeding.

### 1.1 Xác định scope
- **Module Name**: {module_name}
- **Core Entities**: List các entity chính
- **Key Features**: List các features
- **Dependencies**: Module nào liên quan?

### 1.2 Tạo Domain Agent Prompt
```
Vị trí: .agent/prompts/modules/{module_name}.md
        .agent/prompts/modules/{module_name}-ui.md
```

### 1.3 Xác định API Endpoints
```
Thêm vào: .agent/api-contracts.md
```

### ✅ Checkpoint Validation
```
□ Module name and scope defined
□ Core entities identified  
□ Domain agent prompts created
□ API contracts documented
→ Save checkpoint: planning_complete
```

---

## Step 2: Database Schema (Cơ sở dữ liệu)

### 📍 CHECKPOINT: `database_complete`
// turbo-pause
> ⚠️ **HUMAN APPROVAL REQUIRED**: Review database schema before creating tables.

### 2.1 Thiết kế tables
Tham khảo: `.agent/database-schema.md`

### 2.2 Tạo Migration Files
```
migrations/
├── {timestamp}_create_{module}_tables.up.sql
└── {timestamp}_create_{module}_tables.down.sql
```

### 2.3 Checklist cho MỖI table
- [ ] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- [ ] `tenant_id UUID NOT NULL REFERENCES tenants(id)`
- [ ] `created_at TIMESTAMP DEFAULT NOW()`
- [ ] `updated_at TIMESTAMP DEFAULT NOW()`
- [ ] `ENABLE ROW LEVEL SECURITY`
- [ ] `CREATE POLICY tenant_isolation`
- [ ] `CREATE INDEX idx_{table}_tenant ON {table}(tenant_id)`

### 2.4 Apply migrations
```bash
psql -U postgres -d erp_dev -f migrations/{timestamp}_create_{module}_tables.up.sql
```

### ✅ Checkpoint Validation
```
□ All tables created with RLS
□ Indexes created
□ Rollback script ready (.down.sql)
□ Schema added to database-schema.md
→ Save checkpoint: database_complete
```

### 🔙 Recovery from this step
```
psql -U postgres -d erp_dev -f migrations/{timestamp}_create_{module}_tables.down.sql
```

---

## Step 3: Backend Module Structure (Go)

### 📍 CHECKPOINT: `backend_complete`

### 3.1 Tạo folder structure
```
internal/modules/{module_name}/
├── domain/
│   ├── entity.go          # All entities
│   ├── repository.go      # All repository interfaces
│   ├── service.go         # Domain services
│   └── errors.go          # Module-specific errors
├── application/
│   ├── dto.go             # Request/Response DTOs
│   ├── usecase.go         # Use cases
│   ├── mapper.go          # Entity <-> DTO mapping
│   └── validator.go       # Business validation
├── infrastructure/
│   ├── postgres_repo.go   # Repository implementations
│   └── http_handler.go    # HTTP handlers
└── module.go              # Module registration
```

### 3.2 Implement từng layer
1. **Domain Layer** (entity.go, repository.go)
2. **Application Layer** (usecase.go, dto.go)
3. **Infrastructure Layer** (postgres_repo.go, http_handler.go)

### 3.3 Register module
```go
// cmd/api/main.go
{module}Module := {module}.NewModule(db)
router.Group("/{module}").Use(authMiddleware).Group(func(r chi.Router) {
    {module}Module.RegisterRoutes(r)
})
```

### 3.4 Write unit tests
```
internal/modules/{module_name}/
├── domain/service_test.go
├── application/usecase_test.go
└── infrastructure/postgres_repo_test.go
```

### 3.5 Run tests
```bash
go test ./internal/modules/{module_name}/... -v -cover
```

### ✅ Checkpoint Validation
```
□ All Go files created
□ Unit tests written and pass
□ Module registered in main.go
□ API endpoints responding (curl test)
→ Save checkpoint: backend_complete
```

### 🔙 Recovery from this step
```
1. Check go test output for failures
2. Review error logs
3. /retry 3
```

---

## Step 4: Frontend Module (Next.js)

### 📍 CHECKPOINT: `frontend_complete`

### 4.1 Tạo folder structure
```
src/app/(dashboard)/{module_name}/
├── page.tsx                    # Module home/list
├── [id]/
│   └── page.tsx               # Detail view
├── new/
│   └── page.tsx               # Create new
├── components/
│   ├── {Module}List.tsx       # AG Grid list
│   ├── {Module}Form.tsx       # Create/Edit form
│   ├── {Module}Modal.tsx      # Modal wrapper
│   └── {Module}Card.tsx       # Card component
└── hooks/
    ├── use{Module}.ts         # CRUD hooks
    └── use{Module}Query.ts    # React Query
```

### 4.2 Thêm API client
```typescript
// src/lib/api/{module}.ts
export const {module}Api = {
  list: () => api.get('/{module}'),
  getById: (id: string) => api.get(`/{module}/${id}`),
  create: (data: Create{Module}DTO) => api.post('/{module}', data),
  update: (id: string, data: Update{Module}DTO) => api.put(`/{module}/${id}`, data),
  delete: (id: string) => api.delete(`/{module}/${id}`),
};
```

### 4.3 Thêm translations
```
src/locales/
├── vi/{module_name}.json
└── en/{module_name}.json
```

### 4.4 Thêm navigation
```typescript
// src/components/layout/Sidebar.tsx
{
  name: t('{module}.title'),
  href: '/{module}',
  icon: {ModuleIcon},
}
```

### 4.5 Run frontend
```bash
cd frontend && npm run dev
```

### ✅ Checkpoint Validation
```
□ All React components created
□ TypeScript compiles
□ Translations added (VN + EN)
□ Navigation link visible
→ Save checkpoint: frontend_complete
```

### 🔙 Recovery from this step
```
1. npm run lint --fix
2. Check TypeScript errors
3. /retry 4
```

---

## Step 5: Permission Matrix (Phân quyền)

### 📍 CHECKPOINT: `permission_defined`
// turbo-pause
> ⚠️ **HUMAN APPROVAL REQUIRED**: Review permission rules before implementation.

### 5.1 Thêm Module Access
Cập nhật `.agent/permission-matrix.md`:

```markdown
### {Module Name} Module

#### Module Access
| Role | Can Access |
| :--- | :---: |
| super_admin | ✅ |
| admin | ✅ |
| manager | ✅ |
| {role} | ✅/❌ |
...

#### Action Permissions
| Action | admin | manager | staff |
| :--- | :---: | :---: | :---: |
| View All | ✅ | ✅ | ❌ |
| View Own | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
```

### 5.2 Implement trong code
**Backend Middleware**:
```go
router.Use(RequireModule("{module}"))
router.DELETE("/:id", RequirePermission("{module}", "delete"), handler.Delete)
```

**Frontend Check**:
```typescript
const { can } = usePermission();
{can('{module}', 'delete') && <DeleteButton />}
```

### ✅ Checkpoint Validation
```
□ Permission matrix added to file
□ Backend middleware implemented
□ Frontend permission checks added
□ Domain agent updated with permissions
→ Save checkpoint: permission_defined
```

---

## Step 6: Integration Tests

### 📍 CHECKPOINT: `integration_tests_passed`

### 6.1 Backend Integration Tests
```go
// internal/modules/{module_name}/integration_test.go
func TestModule_CRUD(t *testing.T) {
    // Setup test database with RLS
    // Test Create, Read, Update, Delete
    // Verify RLS isolation
}
```

### 6.2 RLS Security Tests
```go
func TestModule_RLS(t *testing.T) {
    // Create data for Tenant A
    // Switch to Tenant B context
    // Verify Tenant B cannot see Tenant A data
}
```

### 6.3 Run all tests
```bash
go test ./internal/modules/{module_name}/... -v -tags=integration
```

### ✅ Checkpoint Validation
```
□ CRUD integration tests pass
□ RLS isolation tests pass
□ API response validation pass
→ Save checkpoint: integration_tests_passed
```

### 🔙 Recovery from this step
```
1. Check test failures
2. Fix code in Step 3 (backend)
3. /retry 6
```

---

## Step 7: Browser Testing

### 📍 CHECKPOINT: `browser_test_passed`

### 7.1 Start servers
```bash
# Terminal 1
cd backend && go run cmd/api/main.go

# Terminal 2
cd frontend && npm run dev
```

### 7.2 Manual verification
- [ ] Navigate to /{module}
- [ ] List view renders
- [ ] Create new item
- [ ] Edit item
- [ ] Delete item
- [ ] Search/Filter works
- [ ] Pagination works

### 7.3 i18n verification
- [ ] Switch VN → EN
- [ ] All labels translated
- [ ] Date formats correct

### 7.4 Capture screenshots
```
.doc/{module_name}/
├── list_view.png
├── create_form.png
├── detail_view.png
└── delete_confirm.png
```

### ✅ Checkpoint Validation
```
□ All UI functions work
□ No console/network errors
□ i18n verified (VN/EN)
□ Screenshots captured
→ Save checkpoint: browser_test_passed
```

### 🔙 Recovery from this step
```
1. Console errors → /rollback 4 (frontend)
2. Network errors → /rollback 3 (backend)
3. /retry 7
```

---

## Step 8: Documentation

### 📍 CHECKPOINT: `documentation_complete`

### 8.1 Tạo User Guide
```
Vị trí: .doc/{module_name}.md
Template: .agent/templates/user_guide_template.md
```

### 8.2 Thêm vào Domain Agent
Cập nhật `.agent/prompts/modules/{module_name}.md` với Permission Matrix section.

### 8.3 API Documentation
Cập nhật `.agent/api-contracts.md` với endpoints mới.

### ✅ Checkpoint Validation
```
□ User guide created (Vietnamese)
□ Screenshots embedded
□ Domain agent updated
□ API docs updated
→ Save checkpoint: documentation_complete
```

---

## Step 9: Final Checklist

### 📍 CHECKPOINT: `final_verification`
// turbo-pause
> ⚠️ **HUMAN APPROVAL REQUIRED**: Final review before marking module complete.

### 9.1 Code Quality
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code reviewed

### 9.2 Database
- [ ] Migrations applied
- [ ] RLS policies active
- [ ] Indexes created

### 9.3 Backend
- [ ] APIs working
- [ ] Error handling complete
- [ ] Input validation

### 9.4 Frontend
- [ ] UI renders correctly
- [ ] i18n complete (VN/EN)
- [ ] Responsive design

### 9.5 Security
- [ ] Permission matrix defined
- [ ] RLS tested
- [ ] 403 for unauthorized

### 9.6 Documentation
- [ ] User guide created
- [ ] Screenshots included
- [ ] API docs updated

### Workflow State Summary
```yaml
workflow_id: module_{timestamp}
module_name: {module_name}
status: COMPLETED
checkpoints:
  - planning_complete: ✅
  - database_complete: ✅
  - backend_complete: ✅
  - frontend_complete: ✅
  - permission_defined: ✅
  - integration_tests_passed: ✅
  - browser_test_passed: ✅
  - documentation_complete: ✅
  - final_verification: ✅
completed_at: {timestamp}
```

---

## 🔄 Recovery Scenarios

### Scenario 1: Database Migration Fails
```
Checkpoint: database_complete (FAILED)
Recovery:
1. Check SQL syntax errors
2. Fix migration file
3. /retry 2
```

### Scenario 2: Backend Tests Fail
```
Checkpoint: backend_complete (FAILED)
Recovery:
1. Check test output
2. Fix Go code
3. /retry 3
```

### Scenario 3: Frontend Build Fails
```
Checkpoint: frontend_complete (FAILED)
Recovery:
1. npm run lint --fix
2. Check TypeScript errors
3. /retry 4
```

### Scenario 4: Integration Tests Fail
```
Checkpoint: integration_tests_passed (FAILED)
Recovery:
1. If RLS issue → /rollback 2
2. If API issue → /rollback 3
3. Fix and /retry 6
```

### Scenario 5: Complete Restart
```
Recovery:
1. /abort  # Abort current workflow
2. Run down migration
3. Delete created files
4. Start fresh with /create-module
```

---

## Module Completion

```
✅ Module "{module_name}" is COMPLETE!

Created:
- {X} database tables with RLS
- {Y} API endpoints
- {Z} React components
- User guide with screenshots
- Permission matrix
- Domain agent prompts
```

---

## Quick Reference

| Step | Agent | Checkpoint | Pause? | Recovery |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Orchestrator | `planning_complete` | ✅ | N/A |
| 2 | Database | `database_complete` | ✅ | `.down.sql` |
| 3 | Backend | `backend_complete` | | `/retry 3` |
| 4 | Frontend | `frontend_complete` | | `/retry 4` |
| 5 | Security | `permission_defined` | ✅ | `/retry 5` |
| 6 | QA | `integration_tests_passed` | | `/rollback 3` |
| 7 | Browser Test | `browser_test_passed` | | `/rollback 3,4` |
| 8 | QA | `documentation_complete` | | `/retry 8` |
| 9 | Orchestrator | `final_verification` | ✅ | N/A |
