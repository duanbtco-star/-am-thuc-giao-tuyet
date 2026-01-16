# Security Rules - Ẩm Thực Giáo Tuyết

> **Load when**: Authentication, authorization, data protection.
> **Stack**: Supabase Auth, Single-tenant

---

## 1. Authentication (Supabase Auth)

### 1.1 Authentication Methods
- Email + Password (primary)
- Magic Link (optional)
- OAuth providers (future: Google, Facebook)

### 1.2 Session Management
```typescript
// Server-side: Check session
import { createClient } from '@/lib/supabase/server'

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 1.3 Protected Routes
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}
```

---

## 2. Authorization (Simple Role-Based)

### 2.1 User Roles
| Role | Description | Access |
|:---|:---|:---|
| `admin` | Quản trị viên | Full access |
| `staff` | Nhân viên | Create/Read/Update |
| `viewer` | Xem báo cáo | Read only |

### 2.2 Role Check Pattern
```typescript
// Simple role check
const userRole = user?.user_metadata?.role || 'viewer';

if (userRole !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 3. Data Protection

### 3.1 Input Validation
```typescript
// Always validate before processing
function validateQuote(data: any) {
  if (!data.customerName || data.customerName.trim() === '') {
    throw new Error('Tên khách hàng là bắt buộc');
  }
  if (!data.phone || !/^[0-9]{10,11}$/.test(data.phone)) {
    throw new Error('Số điện thoại không hợp lệ');
  }
  return true;
}
```

### 3.2 XSS Prevention
```typescript
// Sanitize user input before display
import DOMPurify from 'dompurify';

const safeContent = DOMPurify.sanitize(userInput);
```

### 3.3 SQL Injection Prevention
```typescript
// ❌ NEVER - String concatenation
const query = `SELECT * FROM quotes WHERE id = '${id}'`;

// ✅ ALWAYS - Use Supabase client (parameterized)
const { data } = await supabase
  .from('quotes')
  .select('*')
  .eq('id', id);
```

---

## 4. API Security

### 4.1 Rate Limiting (Optional)
```typescript
// Simple rate limit per IP
const rateLimitMap = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;
  
  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}
```

### 4.2 Error Handling
```typescript
// Never expose internal errors
try {
  // operation
} catch (error) {
  console.error('Internal error:', error);
  return NextResponse.json(
    { error: 'Có lỗi xảy ra, vui lòng thử lại' },
    { status: 500 }
  );
}
```

---

## 5. Environment Variables

### 5.1 Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx (server only)
```

### 5.2 Security Rules
- **NEVER** commit `.env.local` to git
- **NEVER** expose `SERVICE_ROLE_KEY` to client
- Use `NEXT_PUBLIC_` prefix only for public keys

---

## 6. Checklist Security Review

Before deploying any feature:
- [ ] Input validation implemented
- [ ] Error messages don't expose internals
- [ ] Supabase client used (no raw SQL)
- [ ] Sensitive data logged appropriately
- [ ] Environment variables secured
