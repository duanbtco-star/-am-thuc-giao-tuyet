# Rules Index - Ẩm Thực Giáo Tuyết

> **Purpose**: Load only the rules you need to save tokens.
> **Project**: Single-tenant Catering Management System

---

## Available Rules Files

| File | Size | When to Load |
|:---|:---:|:---|
| `rules/core.md` | ~3KB | **ALWAYS** - Every task |
| `rules/database.md` | ~4KB | Database, SQL, migrations |
| `rules/frontend.md` | ~4KB | React, Next.js, UI |
| `rules/security.md` | ~3KB | Auth, permissions |
| `rules/domain-logic.md` | ~4KB | Business logic, calculations |

---

## Loading Strategy

### By 5-Dimension Assessment
| Dimension | Load Rules |
|:---|:---|
| **UX** | core.md |
| **UI** | core.md + frontend.md |
| **FE** | core.md + frontend.md |
| **BE** | core.md + security.md + domain-logic.md |
| **DA** | core.md + database.md |

---

## 🚀 Auto-Run Commands

Các lệnh sau **tự động chạy không cần xác nhận**:

```bash
npm run dev          # Dev server
npm run build        # Build
npm run lint         # Lint check
npx supabase *       # All supabase commands
git status/log/diff  # Read-only git
```

---

## Core Rules Summary

- **Priority**: `UX → UI → FE → BE → DA`
- **Architecture**: Single-tenant Monolith
- **Stack**: Next.js + Supabase
- **Language**: Vietnamese for docs

---

## File Paths

```
prompts/
├── orchestrator.md          # Main workflow
├── rules/
│   ├── index.md             # This file
│   ├── core.md              # Always load
│   ├── database.md          # DA dimension
│   ├── frontend.md          # FE/UI dimension
│   ├── security.md          # Auth
│   └── domain-logic.md      # Business rules
└── specialists/
    ├── auth.md
    ├── backend.md
    ├── database.md
    ├── frontend.md
    └── ...
```
