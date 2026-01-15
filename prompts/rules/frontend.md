# Frontend Rules (Load for FE/UI Dimension)

> **Load when**: Working on React components, Next.js pages, UI design.
> Size: ~6KB

---

## 1. Linear Design System

### 1.1 Core Principles
- **High Density**: Maximize information per screen
- **Minimal Padding**: Tight, purposeful spacing
- **Keyboard-First**: All interactions accessible via keyboard
- **Dark Mode**: Support both light and dark themes

### 1.2 Color Tokens
```css
:root {
  /* Background */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-tertiary: #1a1a1a;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  
  /* Accent */
  --accent-primary: #5e6ad2;
  --accent-hover: #6b76dc;
  
  /* Status */
  --success: #4ade80;
  --warning: #fbbf24;
  --error: #f87171;
}
```

### 1.3 Typography
```css
body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.5;
}

h1 { font-size: 24px; font-weight: 600; }
h2 { font-size: 18px; font-weight: 600; }
h3 { font-size: 14px; font-weight: 600; }
```

---

## 2. AG Grid Requirements

### 2.1 Mandatory Grid Features
- Server-Side Row Model for >1000 rows
- Column virtualization enabled
- Row virtualization enabled
- Keyboard navigation

### 2.2 Grid Configuration
```typescript
const gridOptions: GridOptions = {
  rowModelType: 'serverSide',
  serverSideStoreType: 'partial',
  cacheBlockSize: 100,
  maxBlocksInCache: 10,
  rowHeight: 32,
  headerHeight: 36,
  enableRangeSelection: true,
  suppressCellFocus: false,
};
```

### 2.3 Master/Detail Pattern
```typescript
const masterDetailOptions = {
  masterDetail: true,
  detailRowAutoHeight: true,
  detailCellRendererParams: {
    detailGridOptions: {
      columnDefs: detailColumnDefs,
    },
    getDetailRowData: (params) => {
      params.successCallback(params.data.details);
    },
  },
};
```

---

## 3. i18n Requirements

### 3.1 Translation Rules
- **Default**: Vietnamese (vi-VN)
- **Secondary**: English (en-US)
- **Never hardcode** labels

### 3.2 Date/Time Formatting
```typescript
// Vietnamese
const vnFormat = "dd/MM/yyyy HH:mm";

// English
const enFormat = "MM/dd/yyyy hh:mm a";

// Use locale-aware formatting
format(date, locale === 'vi' ? vnFormat : enFormat);
```

### 3.3 Number/Currency
```typescript
// Vietnamese
new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(amount);
// → "123.456.789 ₫"

// English
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'VND'
}).format(amount);
// → "₫123,456,789"
```

---

## 4. Component Patterns

### 4.1 Page Structure
```typescript
export default function ItemsPage() {
  const { t } = useTranslation('items');
  
  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        actions={<CreateButton />}
      />
      <PageContent>
        <ItemList />
      </PageContent>
    </PageContainer>
  );
}
```

### 4.2 Form Pattern
```typescript
export function ItemForm({ item, onSubmit }) {
  const { t } = useTranslation('items');
  const form = useForm({
    defaultValues: item || {},
  });
  
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField name="sku" label={t('sku')} required />
      <FormField name="name" label={t('name')} required />
      <FormActions>
        <Button type="submit">{t('common.save')}</Button>
      </FormActions>
    </Form>
  );
}
```

### 4.3 Permission Check
```typescript
const { can } = usePermission();

return (
  <div>
    {can('items', 'create') && <CreateButton />}
    {can('items', 'edit') && <EditButton />}
    {can('items', 'delete') && <DeleteButton />}
  </div>
);
```

---

## 5. State Management

### 5.1 Server State (React Query)
```typescript
// For all API data
const { data, isLoading, error } = useQuery({
  queryKey: ['items', filter],
  queryFn: () => itemsApi.list(filter),
  staleTime: 5 * 60 * 1000,
});
```

### 5.2 Client State (Zustand)
```typescript
// For UI-only state
const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

---

## 6. Performance Requirements

| Metric | Target | Measurement |
| :--- | :---: | :--- |
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Bundle Size (initial) | < 200KB | webpack-bundle-analyzer |
| Grid Render (1000 rows) | < 500ms | Performance API |

---

## 7. Accessibility

- All inputs must have labels
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible
- Screen reader compatible (aria-labels)
