# Core Rules (Always Load)

> **Essential rules that MUST be loaded for every task.**
> Size: ~5KB (optimized for minimal token usage)

---

## 0. DAO/Supreme Principles

### Article 1: Absolute Priority Order
**`UX → UI → FE → BE → DA`**
- **Philosophy**: We build for the User, not the Database.
- All technical decisions must satisfy the layer above it first.
- **Exception**: Only reverse for "Force Majeure" technical conflicts (Security vulnerabilities, Physical impossibilities).

### Article 2: Mandatory 5-Dimensional Assessment
Every major feature request MUST be assessed across:
1. **UX** (User Experience): Flow, Ease of use.
2. **UI** (User Interface): Visuals, Density, Alignment.
3. **FE** (Frontend): Interaction, State Management, Performance.
4. **BE** (Backend): Logic, Security, API Design.
5. **DA** (Data Architecture): Schema, Integrity, Scalability.

### Article 3: Council Mechanism
- **Trigger**: If 2+ dimensions have High/Equal Impact → Stop and Simulate Multi-Agent Discussion.

---

## 1. Architecture & Tech Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Pattern** | Modular Monolith | - |
| **Backend** | Go (Golang) | 1.22+ |
| **Database** | PostgreSQL | 16+ |
| **Frontend** | Next.js | 14+ (App Router) |
| **UI Grid** | AG Grid Enterprise | Required |

---

## 2. Multi-Tenancy (Non-Negotiable)

- **Row-Level Security (RLS)** is the primary defense.
- **EVERY table** (except global configs) MUST have `tenant_id` column.
- App Context MUST set `app.current_tenant` at start of every transaction.
- **NEVER** bypass RLS except for super-admin migrations.

---

## 3. Module Boundaries

| Module | Owns Tables | Exposes |
| :--- | :--- | :--- |
| **Inventory** | items, lots, warehouses | ItemService interface |
| **Sales** | orders, quotes, customers | OrderService interface |
| **Projects** | projects, wbs, tasks | ProjectService interface |
| **Finance** | journals, accounts | JournalService interface |

**Rule**: Modules MUST NOT query each other's tables directly. Use service interfaces.

---

## 4. Communication Standards

- **Language**: Vietnamese (Tiếng Việt) for all explanations and documentation.
- **Code Comments**: English (for international compatibility).
- **i18n**: Default Vietnamese, English as secondary.

---

## 5. Definition of Done (DoD)

Every feature is complete when:
- [ ] 5-Dimensional Assessment documented
- [ ] Unit tests with >70% coverage
- [ ] Integration test for happy path
- [ ] RLS compliance verified
- [ ] Permission Matrix defined
- [ ] User Guide (Vietnamese) created
- [ ] Browser test passed

---

## Quick Reference

### Load Additional Rules (As Needed)
| Need | File |
| :--- | :--- |
| Database/SQL work | `prompts/rules/database.md` |
| Frontend/React work | `prompts/rules/frontend.md` |
| Security/Auth work | `prompts/rules/security.md` |
| Domain logic | `prompts/rules/domain-logic.md` |

### Key Documents
| Document | Path |
| :--- | :--- |
| Permission Matrix | `.agent/permission-matrix.md` |
| API Contracts | `.agent/api-contracts.md` |
| Database Schema | `.agent/database-schema.md` |
| Roadmap | `.agent/ROADMAP.md` |
