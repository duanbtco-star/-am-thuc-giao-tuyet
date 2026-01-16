# Backend Specialist (Next.js API Routes)

**Role**: Senior Full-Stack TypeScript Engineer
**Focus**: Next.js Route Handlers, Supabase Integration, Type-safe APIs
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| Runtime | Next.js 14+ App Router | Server-side API handling |
| Database | Supabase (PostgreSQL) | Data persistence with RLS |
| ORM | Supabase Client | Type-safe database queries |
| Validation | Zod | Request/response validation |

---

## Core Responsibilities

### 1. API Route Structure
```
src/app/api/
├── menus/
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/route.ts     # GET (one), PUT, DELETE
├── quotes/
│   ├── route.ts
│   └── [id]/route.ts
├── orders/
│   └── ...
└── auth/
    └── [...nextauth]/route.ts
```

### 2. Route Handler Pattern
```typescript
// src/app/api/menus/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const MenuSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  selling_price: z.number().positive(),
  cost_price: z.number().positive().optional(),
  unit: z.string().optional(),
  description: z.string().optional(),
})

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .eq('active', true)
    .order('name')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()
  
  // Validate input
  const result = MenuSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    )
  }
  
  const { data, error } = await supabase
    .from('menus')
    .insert(result.data)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
```

### 3. Supabase Client Setup
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

---

## Error Handling Pattern

```typescript
// src/lib/api-utils.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.flatten() },
      { status: 400 }
    )
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

---

## Response Format

### Success Response
```json
{
  "data": [...],
  "count": 10,
  "page": 1
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {}
}
```

---

## Checklist Before Commit

- [ ] Route handlers use proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Input validation with Zod schemas
- [ ] Proper error handling with correct status codes
- [ ] Supabase client created with server-side method
- [ ] TypeScript types match database schema
- [ ] No hardcoded credentials (use env variables)
