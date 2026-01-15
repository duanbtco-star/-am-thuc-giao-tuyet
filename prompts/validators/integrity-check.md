# Integrity Check Validator

> **Purpose**: Verify generated code integrity before proceeding to next step
> **Trigger**: After each generation step (DB, BE, FE)

---

## 1. Validation Scope

| Step | Validations |
| :--- | :--- |
| **Database** | File exists, SQL syntax, RLS present |
| **Backend** | Files exist, Go compiles, Tests pass |
| **Frontend** | Files exist, TypeScript compiles, No lint errors |

---

## 2. Database Integrity

### 2.1 Checks
```yaml
database_integrity:
  file_checks:
    - migration_file_exists: migrations/*.up.sql
    - down_file_exists: migrations/*.down.sql  # NEW
    
  content_checks:
    - has_tenant_id: "tenant_id UUID"
    - has_rls_enable: "ENABLE ROW LEVEL SECURITY"
    - has_rls_policy: "CREATE POLICY"
    - has_index: "CREATE INDEX"
    
  execution_checks:
    - sql_syntax_valid: "psql --dry-run"
    - can_apply: "psql -f migration.sql"
```

### 2.2 Auto-Fix
```yaml
database_auto_fix:
  missing_tenant_id:
    action: add_column
    template: "tenant_id UUID NOT NULL REFERENCES tenants(id)"
    
  missing_rls:
    action: add_lines
    template: |
      ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
      CREATE POLICY tenant_isolation ON {table}
        USING (tenant_id = current_setting('app.tenant_id')::UUID);
```

---

## 3. Backend Integrity

### 3.1 Checks
```yaml
backend_integrity:
  file_checks:
    required_files:
      - domain/entity.go
      - domain/repository.go
      - application/dto.go
      - application/usecase.go
      - infrastructure/postgres_repo.go
      - infrastructure/http_handler.go
      
  compilation_check:
    command: "go build ./internal/modules/{module}/..."
    must_pass: true
    
  test_check:
    command: "go test ./internal/modules/{module}/... -v"
    coverage_min: 70%
    
  lint_check:
    command: "golangci-lint run ./internal/modules/{module}/..."
    
  pattern_checks:
    - has_tenant_context: "TenantID"
    - has_error_handling: "if err != nil"
    - no_interface_abuse: "interface{}" must be < 5 occurrences
```

### 3.2 Auto-Fix
```yaml
backend_auto_fix:
  missing_error_handling:
    pattern: "_, err := {call}"
    fix: |
      result, err := {call}
      if err != nil {
        return nil, fmt.Errorf("{context}: %w", err)
      }
      
  missing_tenant_check:
    pattern: "func (h *Handler) Create"
    fix: add "tenantID := middleware.GetTenantID(ctx)"
```

---

## 4. Frontend Integrity

### 4.1 Checks
```yaml
frontend_integrity:
  file_checks:
    required_files:
      - page.tsx
      - components/{Feature}List.tsx
      - components/{Feature}Form.tsx
      - hooks/use{Feature}.ts
      
  compilation_check:
    command: "npm run build"
    must_pass: true
    
  lint_check:
    command: "npm run lint"
    
  type_check:
    command: "npx tsc --noEmit"
    
  i18n_check:
    - all_t_calls_have_keys: true
    - keys_exist_in_vi_json: true
    - keys_exist_in_en_json: true
```

### 4.2 Auto-Fix
```yaml
frontend_auto_fix:
  missing_translations:
    action: generate_keys
    target_vi: src/locales/vi/{module}.json
    target_en: src/locales/en/{module}.json
    
  typescript_errors:
    common_fixes:
      - "Cannot find module": auto_import
      - "Property does not exist": add_to_interface
      - "possibly undefined": add_null_check
```

---

## 5. Integration

### 5.1 Workflow Integration
```yaml
integration:
  after_database_step:
    run: database_integrity
    on_fail: retry_step_2
    
  after_backend_step:
    run: backend_integrity
    on_fail: auto_fix_then_retry
    
  after_frontend_step:
    run: frontend_integrity
    on_fail: auto_fix_then_retry
    
  auto_fix_attempts: 3
  escalate_to_user_after: 3 failures
```

### 5.2 Report Format
```markdown
## Integrity Check Report

### Step: Backend

| Check | Status | Details |
| :--- | :---: | :--- |
| Files exist | ✅ | 6/6 files created |
| Go compiles | ✅ | No errors |
| Tests pass | ⚠️ | 85% coverage (min 70%) |
| Lint clean | ❌ | 2 issues found |

### Issues Found:
1. `unused variable 'result' in handler.go:45`
2. `missing error check in usecase.go:78`

### Auto-Fix Applied:
1. ✅ Removed unused variable
2. ✅ Added error handling

### Result: PASSED (after auto-fix)
```

---

## 6. Commands

### `/verify [step]`
```
Run integrity check for specified step.

Usage:
  /verify database
  /verify backend
  /verify frontend
  /verify all
```

### `/fix [step]`
```
Run auto-fix for specified step.

Usage:
  /fix backend
  /fix frontend
```

---

## 7. Configuration

```yaml
# .agent/config/integrity.yaml

enabled: true
auto_fix: true
max_fix_attempts: 3

database:
  require_down_migration: true
  require_rls: true
  
backend:
  min_coverage: 70
  max_interface_abuse: 5
  
frontend:
  require_i18n: true
  typescript_strict: true
```
