# Frontend Rules - Ẩm Thực Giáo Tuyết

> **Load when**: React components, Next.js pages, UI styling.
> **Stack**: Next.js 14+, TailwindCSS, React

---

## 1. Design System

### 1.1 Color Palette
```css
/* Primary - Blue/Teal theme */
--primary: #0ea5e9;
--primary-hover: #0284c7;
--primary-light: #e0f2fe;

/* Neutral */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1e293b;
--text-secondary: #64748b;

/* Status */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### 1.2 Typography
```css
/* Font: System fonts (fast loading) */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Sizes */
h1: 24px, font-weight: 700
h2: 20px, font-weight: 600
h3: 16px, font-weight: 600
body: 14px, font-weight: 400
small: 12px, font-weight: 400
```

---

## 2. Component Patterns

### 2.1 Page Structure
```typescript
// src/app/{page}/page.tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Tiêu đề trang</h1>
      </header>
      
      {/* Content */}
      <main className="p-6">
        {/* Components here */}
      </main>
    </div>
  );
}
```

### 2.2 Card Component Pattern
```typescript
<div className="bg-white rounded-lg shadow-sm border p-6">
  <h3 className="font-semibold mb-4">Card Title</h3>
  {/* Content */}
</div>
```

### 2.3 Form Pattern
```typescript
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">
        Tên khách hàng
      </label>
      <input 
        type="text"
        className="w-full border rounded-lg px-3 py-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
    
    <button 
      type="submit"
      className="bg-primary text-white px-4 py-2 rounded-lg"
    >
      Lưu
    </button>
  </div>
</form>
```

---

## 3. State Management

### 3.1 Server State (fetch + useState)
```typescript
// Simple pattern for this project
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/endpoint')
    .then(res => res.json())
    .then(data => {
      setData(data);
      setLoading(false);
    });
}, []);
```

### 3.2 Form State
```typescript
const [formData, setFormData] = useState({
  customerName: '',
  phone: '',
  eventDate: '',
});

const handleChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

---

## 4. API Integration

### 4.1 Fetch Pattern
```typescript
// GET
const response = await fetch('/api/quotes');
const quotes = await response.json();

// POST
const response = await fetch('/api/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// PUT
const response = await fetch(`/api/quotes/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// DELETE
const response = await fetch(`/api/quotes/${id}`, {
  method: 'DELETE',
});
```

---

## 5. i18n (Vietnamese First)

### 5.1 Date Format
```typescript
// Vietnamese format
const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};
// Output: "15/01/2026"
```

### 5.2 Currency Format
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
};
// Output: "1.500.000 ₫"
```

---

## 6. Responsive Design

### 6.1 Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### 6.2 Mobile-First Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

---

## 7. Performance

### 7.1 Loading States
```typescript
{loading ? (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
) : (
  <DataComponent data={data} />
)}
```

### 7.2 Error Handling
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    Có lỗi xảy ra: {error}
  </div>
)}
```

---

## 8. Accessibility

- Tất cả inputs phải có `label`
- Buttons phải có text hoặc `aria-label`
- Focus states visible
- Color contrast đủ (4.5:1)
