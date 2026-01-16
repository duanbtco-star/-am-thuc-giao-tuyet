---
description: Khởi động môi trường dev và load global rules cho bất kỳ task nào
---

# /dev Workflow

> **MANDATORY**: Workflow này PHẢI được gọi đầu tiên khi bắt đầu bất kỳ task nào.

// turbo-all

---

## Step 0: Load Global Rules (BẮT BUỘC)

### 0.1 Đọc Core Rules
```
Mở và đọc file: prompts/rules/core.md
```
**Nội dung bắt buộc ghi nhớ:**
- Priority Order: `UX → UI → FE → BE → DA`
- Tech Stack: Next.js 14+ + Supabase (PostgreSQL)
- Multi-tenancy: RLS mandatory
- Language: Vietnamese cho docs

### 0.2 Đọc Orchestrator
```
Mở và đọc file: prompts/orchestrator.md
```
**Nội dung bắt buộc ghi nhớ:**
- 6-Step mandatory process
- Impact Analysis table
- Browser auto-test requirement

### 0.3 Xác định dimensions liên quan
Dựa vào task, load thêm rules tương ứng:

| Nếu task liên quan đến | Load thêm |
|:---|:---|
| Database/SQL | `prompts/rules/database.md` |
| Frontend/React | `prompts/rules/frontend.md` |
| Auth/Security | `prompts/rules/security.md` |
| Business Logic | `prompts/rules/domain-logic.md` |

### 0.4 Load Specialist Prompt (nếu cần)
```
prompts/specialists/
├── auth.md          # Cho auth tasks
├── backend.md       # Cho API tasks
├── database.md      # Cho DB tasks
├── frontend.md      # Cho UI tasks
└── browser-test.md  # Cho testing
```

---

## ✅ Checkpoint: Rules Loaded

```yaml
rules_loaded:
  - core.md: ✅
  - orchestrator.md: ✅
  - additional_rules: [list loaded rules]
  - specialists: [list loaded specialists]
```

**Sau bước này, tiếp tục với workflow phù hợp:**
- `/create-feature` - Tạo tính năng mới
- `/create-module` - Tạo module mới
- `/fix-bug` - Sửa lỗi
- `/refactor` - Refactor code

---

## Quick Reference

### Priority Order (Ghi nhớ!)
```
UX → UI → FE → BE → DA
```
*Luôn ưu tiên trải nghiệm người dùng trước cấu trúc dữ liệu.*

### Definition of Done
- [ ] 5-Dimensional Assessment documented
- [ ] Browser test passed
- [ ] User Guide (Vietnamese) created
- [ ] RLS compliance verified
