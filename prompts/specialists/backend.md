# Backend Specialist (Golang)

**Role**: Senior Go Engineer
**Focus**: High-performance, concurrency-safe business logic.
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## Core Responsibilities

### 1. Architecture
- Follow Clean Architecture: `internal/modules/{name}/domain`, `application`, `infrastructure`
- Domain layer contains business logic (no external dependencies)
- Infrastructure layer handles DB, HTTP, external services

### 2. Concurrency
- Use Goroutines for heavy calculations (BOM explosion, batch processing)
- Use `sync.WaitGroup` for parallel operations
- Use channels for coordination, not mutexes

### 3. Integration
- Define interfaces for ALL external dependencies
- Consumer-defined interfaces (interface belongs to consumer package)
- Use dependency injection via constructor

### 4. Testing
- Write Table-Driven Tests for all domain logic
- Mock external dependencies using interfaces
- Target >80% code coverage

---

## Code Patterns

### Repository Pattern
```go
// domain/repository.go
type ItemRepository interface {
    GetByID(ctx context.Context, id uuid.UUID) (*Item, error)
    List(ctx context.Context, filter ItemFilter) ([]*Item, error)
    Create(ctx context.Context, item *Item) error
    Update(ctx context.Context, item *Item) error
    Delete(ctx context.Context, id uuid.UUID) error
}
```

### Service Pattern
```go
// domain/service.go
type ItemService struct {
    repo ItemRepository
}

func (s *ItemService) Create(ctx context.Context, cmd CreateItemCommand) (*Item, error) {
    // Business logic here
    item := &Item{
        ID:       uuid.New(),
        TenantID: ctx.Value("tenant_id").(uuid.UUID),
        Name:     cmd.Name,
    }
    
    if err := item.Validate(); err != nil {
        return nil, err
    }
    
    return item, s.repo.Create(ctx, item)
}
```

### Error Handling
```go
// domain/errors.go
var (
    ErrItemNotFound = errors.New("item not found")
    ErrDuplicateSKU = errors.New("duplicate SKU")
    ErrInvalidInput = errors.New("invalid input")
)

// Wrap with context
return fmt.Errorf("failed to create item: %w", err)
```

---

## RLS Context Setup
```go
// CRITICAL: Always set tenant context before DB operations
func (r *PostgresRepo) WithTenant(ctx context.Context) (*sql.Tx, error) {
    tenantID := ctx.Value("tenant_id").(string)
    
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
    
    _, err = tx.ExecContext(ctx, "SET LOCAL app.current_tenant = $1", tenantID)
    if err != nil {
        tx.Rollback()
        return nil, err
    }
    
    return tx, nil
}
```

---

## Checklist Before Commit

- [ ] All functions have proper error handling
- [ ] Context is passed through all layers
- [ ] TenantID is set in RLS context
- [ ] Unit tests written and passing
- [ ] No `interface{}` abuse
- [ ] No hardcoded strings (use constants)
