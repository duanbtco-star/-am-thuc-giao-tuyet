---
description: Quy trình refactor code một cách an toàn
---

# /refactor Workflow

> **Trigger**: Khi cần cải thiện code structure mà không thay đổi behavior.
> **Output**: Cleaner code, same functionality, all tests pass

// turbo-all

---

## Step 0: Load Global Rules (BẮT BUỘC) 🚨

> ⚠️ **MANDATORY**: Đọc rules trước khi refactor!

### 0.1 Đọc Core Rules
```
prompts/rules/core.md
prompts/orchestrator.md
```

### 0.2 Load Rules theo scope refactor
| Scope | File |
|:---|:---|
| Database | `prompts/rules/database.md` |
| Frontend | `prompts/rules/frontend.md` |
| Backend | `prompts/rules/security.md` |

### ✅ Checkpoint: `rules_loaded`
→ PROCEED to Step 1

---

## Step 1: Refactor Planning (Lập kế hoạch)

### 1.1 Xác định scope
- **Files affected**: List các files
- **Type**: Rename / Extract / Move / Simplify
- **Reason**: Tại sao cần refactor?

### 1.2 Impact assessment
| Impact | Check | Status |
| :--- | :--- | :---: |
| Breaking changes? | Yes/No | ⬜ |
| API changes? | Yes/No | ⬜ |
| Database changes? | Yes/No | ⬜ |
| Tests need update? | Yes/No | ⬜ |

### 1.3 Backup plan
```bash
# Create backup branch
git checkout -b backup/before-refactor-{date}
git checkout -b refactor/{description}
```

---

## Step 2: Pre-Refactor Verification

### 2.1 Run all tests
```bash
# Backend
go test ./... -v

# Frontend
npm test
```

### 2.2 Document current behavior
- Screenshot current UI (if UI related)
- Note API responses
- Record test coverage

### 2.3 Confirm tests pass
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Test coverage noted: {X}%

---

## Step 3: Execute Refactor

### 3.1 Apply changes
Common refactor types:

**Extract Function/Method**:
```go
// Before
func handleRequest() {
    // 50 lines of code
}

// After
func handleRequest() {
    validateInput()
    processData()
    sendResponse()
}
```

**Rename for Clarity**:
```go
// Before
func proc(d []byte) error

// After
func processOrderData(orderData []byte) error
```

**Move to Better Location**:
```
Before: internal/handlers/utils.go
After:  internal/shared/helpers/string_utils.go
```

### 3.2 Update imports
- [ ] All imports updated
- [ ] No broken references
- [ ] IDE shows no errors

### 3.3 Update tests
- [ ] Test file names updated (if moved)
- [ ] Test function names updated (if renamed)
- [ ] Assertions still correct

---

## Step 4: Post-Refactor Verification

### 4.1 Run all tests again
```bash
go test ./... -v
npm test
```

### 4.2 Compare results
- [ ] Same number of tests pass
- [ ] Test coverage same or better
- [ ] No new failures

### 4.3 Manual verification
- [ ] Application still works
- [ ] UI unchanged (if applicable)
- [ ] API responses unchanged

### 4.4 Code quality check
```bash
# Go
golangci-lint run

# TypeScript
npm run lint
```

---

## Step 5: Finalize

### 5.1 Create commit
```
refactor({scope}): {description}

- What changed: {list of changes}
- Reason: {why refactoring was needed}
- No functional changes
```

### 5.2 Update documentation
- [ ] Code comments updated
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)

### 5.3 Create PR
Follow `.agent/GIT_WORKFLOW.md`.

### 5.4 Final checklist
- [ ] All tests pass
- [ ] No behavior changes
- [ ] Code cleaner than before
- [ ] Imports/references correct
- [ ] Documentation updated

---

## Common Refactor Patterns

| Pattern | When to Use | Example |
| :--- | :--- | :--- |
| **Extract** | Function too long | 50 lines → 3 functions |
| **Rename** | Name unclear | `proc` → `processOrder` |
| **Move** | Wrong location | utils → helpers |
| **Inline** | Over-abstraction | Remove unnecessary wrapper |
| **DRY** | Duplicate code | Extract to shared function |
| **Simplify** | Complex condition | Nested ifs → early return |

---

## Safety Rules

> ⚠️ **NEVER refactor without tests passing first**

> ⚠️ **Small commits** - One refactor pattern per commit

> ⚠️ **No behavior changes** - If you need to change behavior, that's a feature, not refactor
