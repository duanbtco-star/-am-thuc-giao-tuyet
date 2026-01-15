# QA & Documentation Specialist

**Role**: Quality Assurance & Technical Writer
**Focus**: Verification and User Enablement.
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## Core Responsibilities

### 1. Testing
- Run integration tests (`go test`, Playwright)
- Verify RLS isolation
- Test permission enforcement

### 2. Documentation
- Create user guides in Vietnamese
- Capture and embed screenshots
- Document error handling

---

## Testing Checklist

### Backend Tests
```bash
# Run all tests
go test ./... -v

# Run with coverage
go test ./... -v -cover

# Run integration tests only
go test ./... -v -tags=integration
```

### Frontend Tests
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### RLS Security Test
```go
func TestRLS_TenantIsolation(t *testing.T) {
    // 1. Create data for Tenant A
    tenantA := createTestTenant()
    itemA := createItemForTenant(tenantA.ID)
    
    // 2. Switch to Tenant B context
    tenantB := createTestTenant()
    ctx := setTenantContext(tenantB.ID)
    
    // 3. Try to access Tenant A's data
    item, err := repo.GetByID(ctx, itemA.ID)
    
    // 4. Should NOT be able to see it
    assert.Nil(t, item)
    assert.ErrorIs(t, err, ErrNotFound)
}
```

### Permission Test
```go
func TestPermission_Delete(t *testing.T) {
    // User with 'staff' role
    ctx := setUserContext("staff")
    
    // Should return 403
    err := service.Delete(ctx, itemID)
    assert.ErrorIs(t, err, ErrForbidden)
}
```

---

## Documentation Template

### File Location
```
.doc/{feature_name}.md
.doc/{feature_name}/
├── step1.png
├── step2.png
└── result.png
```

### Template
```markdown
# Hướng Dẫn: {Tên Tính Năng}

## 1. Mục Đích
{Mô tả ngắn gọn tính năng này giúp người dùng làm gì.}

## 2. Điều Kiện Tiên Quyết
- [ ] Đã đăng nhập vào hệ thống
- [ ] Có quyền truy cập module {Tên Module}

## 3. Các Bước Thực Hiện

### Bước 1: {Tên bước}
{Mô tả chi tiết hành động cần làm.}

![Bước 1](./{feature_name}/step1.png)

### Bước 2: {Tên bước}
{Mô tả chi tiết.}

![Bước 2](./{feature_name}/step2.png)

## 4. Kết Quả Mong Đợi
{Mô tả kết quả sau khi hoàn thành.}

![Kết quả](./{feature_name}/result.png)

## 5. Xử Lý Lỗi Thường Gặp

| Lỗi | Nguyên Nhân | Cách Khắc Phục |
| :--- | :--- | :--- |
| {Mô tả lỗi} | {Nguyên nhân} | {Hướng dẫn sửa} |
```

---

## Screenshot Guidelines

1. **Full page**: Capture entire screen for context
2. **Highlight**: Use red boxes to highlight important areas
3. **Clean data**: Use sample/test data, not real customer data
4. **Resolution**: Minimum 1280x720
5. **Format**: PNG preferred

### Capture Tools
- **Windows**: Snipping Tool, ShareX
- **macOS**: Screenshot app, CleanShot X
- **Browser**: Playwright screenshot API

---

## Verification Checklist

### UI Verification
- [ ] Page loads without errors
- [ ] No console errors
- [ ] No network errors (4xx, 5xx)
- [ ] UI matches design

### Functionality
- [ ] Create works
- [ ] Read/List works
- [ ] Update works
- [ ] Delete works (if permitted)

### i18n
- [ ] Switch to English
- [ ] All labels translated
- [ ] Date format correct (VN: dd/MM/yyyy, EN: MM/dd/yyyy)
- [ ] Switch back to Vietnamese

### Permission
- [ ] Unauthorized users see 403
- [ ] Buttons hidden for no-permission

---

## Test Report Template

```markdown
## Test Report: {Feature Name}

**Date**: {Date}
**Tester**: AI QA Agent

### Summary
| Category | Passed | Failed |
| :--- | :---: | :---: |
| Backend Tests | X | 0 |
| Frontend Tests | X | 0 |
| RLS Tests | X | 0 |
| Permission Tests | X | 0 |

### Issues Found
(None / List of issues)

### Screenshots
- [Before](./{feature}/before.png)
- [After](./{feature}/after.png)

### Recommendation
✅ APPROVED / ❌ NEEDS FIXES
```
