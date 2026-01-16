---
description: Quy trình sửa lỗi (bug) một cách có hệ thống
---

# /fix-bug Workflow

> **Trigger**: Khi người dùng report một bug cần sửa.
> **Output**: Bug fixed, tested, documented

// turbo-all

---

## Step 0: Load Global Rules (BẮT BUỘC) 🚨

> ⚠️ **MANDATORY**: Đọc rules trước khi fix bug!

### 0.1 Đọc Core Rules
```
prompts/rules/core.md
prompts/orchestrator.md
```

### 0.2 Load Specialist phù hợp
Tùy bug ở layer nào:
```
prompts/specialists/frontend.md    # UI bugs
prompts/specialists/backend.md     # API bugs
prompts/specialists/database.md    # Data bugs
prompts/specialists/auto-correction.md  # General debugging
```

### ✅ Checkpoint: `rules_loaded`
→ PROCEED to Step 1

---

## Step 1: Bug Analysis (Phân tích lỗi)

### 1.1 Thu thập thông tin
- **Module/Feature**: Ở đâu?
- **Steps to Reproduce**: Các bước tái hiện?
- **Expected Behavior**: Mong đợi gì?
- **Actual Behavior**: Thực tế là gì?
- **Severity**: Critical / High / Medium / Low

### 1.2 Reproduce lỗi
1. Khởi động dev environment
2. Thực hiện các bước người dùng mô tả
3. Xác nhận lỗi xảy ra

### 1.3 Capture evidence
- Screenshot lỗi
- Console logs
- Network errors
- Database state

---

## Step 2: Root Cause Analysis (Tìm nguyên nhân)

### 2.1 Check layers
| Layer | Check | Status |
| :--- | :--- | :---: |
| **Frontend** | Console errors? | ⬜ |
| **API** | Response correct? | ⬜ |
| **Backend** | Logic error? | ⬜ |
| **Database** | Data integrity? | ⬜ |
| **RLS** | Policy issue? | ⬜ |

### 2.2 Identify root cause
```
Root Cause: {description}
Location: {file path}:{line number}
```

### 2.3 Impact assessment
- Other features affected?
- Performance impact?
- Security implications?

---

## Step 3: Implement Fix (Sửa lỗi)

### 3.1 Create fix branch
```bash
git checkout -b bugfix/{bug-id}-{short-description}
```

### 3.2 Apply fix
- Sửa code tại vị trí đã xác định
- Follow coding standards
- Add code comments giải thích

### 3.3 Add unit test for bug
```go
func Test_BugFix_{bug_id}(t *testing.T) {
    // Arrange: Setup scenario that caused bug
    // Act: Execute the fixed code
    // Assert: Verify bug no longer occurs
}
```

---

## Step 4: Test Fix (Kiểm tra)

### 4.1 Run unit tests
```bash
go test ./... -v
npm test
```

### 4.2 Manual verification
- [ ] Bug no longer reproduces
- [ ] Expected behavior works
- [ ] No new issues introduced

### 4.3 Regression testing
- [ ] Related features still work
- [ ] Other modules not affected

### 4.4 Browser verification
- [ ] UI functions correctly
- [ ] No console errors
- [ ] No network errors

---

## Step 5: Documentation & Completion

### 5.1 Update code comments
```go
// Fixed: {bug description}
// Issue: {bug-id}
// Date: {date}
```

### 5.2 Create commit message
```
fix({module}): {short description}

- Root cause: {explanation}
- Solution: {what was changed}
- Closes #{bug-id}
```

### 5.3 Create PR
Follow `.agent/GIT_WORKFLOW.md` for PR template.

### 5.4 Final checklist
- [ ] Bug is fixed
- [ ] Unit test added
- [ ] Regression tests pass
- [ ] Code reviewed
- [ ] PR created

---

## Bug Severity Guide

| Severity | Description | Response Time |
| :--- | :--- | :--- |
| **Critical** | System down, data loss | Immediate |
| **High** | Major feature broken | Same day |
| **Medium** | Feature partially works | 2-3 days |
| **Low** | Minor UI issue | Next sprint |
