# Security Rules (Load for Auth/Permission Work)

> **Load when**: Working on authentication, authorization, permissions.
> Size: ~6KB

---

## 1. Authentication

### 1.1 JWT Configuration
```go
type JWTConfig struct {
    Secret          string        // At least 256 bits
    AccessTokenTTL  time.Duration // 15 minutes
    RefreshTokenTTL time.Duration // 7 days
    Issuer          string        // "erp-saas"
}
```

### 1.2 JWT Claims
```go
type Claims struct {
    UserID   uuid.UUID `json:"sub"`
    TenantID uuid.UUID `json:"tid"`
    Roles    []string  `json:"roles"`
    jwt.RegisteredClaims
}
```

### 1.3 Password Hashing
```go
// MUST use Argon2id (NOT bcrypt for new code)
import "golang.org/x/crypto/argon2"

func HashPassword(password string) (string, error) {
    salt := make([]byte, 16)
    rand.Read(salt)
    
    hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
    
    return base64.StdEncoding.EncodeToString(append(salt, hash...)), nil
}
```

---

## 2. Authorization: ReBAC

### 2.1 Relationship-Based Access Control
```go
// Check if user can perform action on object
func (s *PermissionService) Can(
    ctx context.Context,
    userID uuid.UUID,
    action string,
    objectType string,
    objectID uuid.UUID,
) bool {
    // 1. Check user roles (RBAC)
    if s.hasRolePermission(ctx, userID, objectType, action) {
        return true
    }
    
    // 2. Check resource relationship (ReBAC)
    return s.hasRelationPermission(ctx, userID, objectType, objectID, action)
}
```

### 2.2 Permission Tables
```sql
-- User Roles
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    tenant_id UUID NOT NULL,
    PRIMARY KEY (user_id, role, tenant_id)
);

-- Resource Relations
CREATE TABLE resource_relations (
    user_id UUID NOT NULL,
    object_type TEXT NOT NULL,  -- 'project', 'order'
    object_id UUID NOT NULL,
    relation TEXT NOT NULL,     -- 'owner', 'member', 'viewer'
    tenant_id UUID NOT NULL,
    PRIMARY KEY (user_id, object_type, object_id)
);
```

### 2.3 Relation Permissions
```go
var RelationPermissions = map[string][]string{
    "owner":   {"view", "edit", "delete", "manage"},
    "manager": {"view", "edit", "manage"},
    "member":  {"view", "edit_own"},
    "viewer":  {"view"},
}
```

---

## 3. Role Hierarchy

```
super_admin
  └── admin
        └── manager
              ├── accountant
              ├── hr_staff
              ├── pm
              └── sales
                    └── staff
                          └── viewer
```

### 3.1 Role Inheritance
```go
var RoleHierarchy = map[string][]string{
    "super_admin": {"admin"},
    "admin":       {"manager"},
    "manager":     {"accountant", "hr_staff", "pm", "sales", "staff"},
    "staff":       {"viewer"},
}

func HasRole(userRoles []string, targetRole string) bool {
    for _, role := range userRoles {
        if role == targetRole || inheritsRole(role, targetRole) {
            return true
        }
    }
    return false
}
```

---

## 4. API Security

### 4.1 Rate Limiting (P0)
```go
type RateLimiter struct {
    limiter *rate.Limiter
}

// Per-tenant limits
var TenantLimits = map[string]rate.Limit{
    "free":       rate.Limit(100),   // 100 req/min
    "starter":    rate.Limit(500),   // 500 req/min
    "business":   rate.Limit(2000),  // 2000 req/min
    "enterprise": rate.Limit(10000), // 10000 req/min
}
```

### 4.2 Input Validation (P0)
```go
// ❌ NEVER - Direct concatenation
query := "SELECT * FROM orders WHERE id = '" + userInput + "'"

// ✅ ALWAYS - Parameterized queries
db.Exec("SELECT * FROM orders WHERE id = $1", userInput)

// ✅ ALWAYS - Validate before use
func (cmd CreateOrderCommand) Validate() error {
    if cmd.CustomerID == uuid.Nil {
        return ErrInvalidCustomerID
    }
    if cmd.Amount <= 0 {
        return ErrInvalidAmount
    }
    return nil
}
```

### 4.3 XSS Prevention
```go
// Escape user content before rendering
import "html"

safeContent := html.EscapeString(userGeneratedContent)
```

---

## 5. Audit Logging (P0)

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,      -- 'create', 'update', 'delete'
    entity_type TEXT NOT NULL, -- 'order', 'item'
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying
CREATE INDEX idx_audit_tenant_entity 
    ON audit_log(tenant_id, entity_type, entity_id);
```

```go
// Call after every mutation
func (s *OrderService) UpdateOrder(ctx context.Context, order *Order) error {
    oldOrder, _ := s.repo.GetByID(ctx, order.ID)
    err := s.repo.Update(ctx, order)
    if err == nil {
        s.audit.Log(ctx, "update", "order", order.ID, oldOrder, order)
    }
    return err
}
```

---

## 6. Permission Matrix Reference

> For detailed permission definitions, see `.agent/permission-matrix.md`

### Quick Reference
| Module | Hidden From |
| :--- | :--- |
| Finance | technician, engineer, warehouse |
| HR | technician, engineer, pm, sales |
| Settings | All except admin |
| Dashboard | None (all can access) |
