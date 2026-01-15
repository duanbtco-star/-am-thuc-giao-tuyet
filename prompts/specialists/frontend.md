# Frontend Specialist (Next.js)

**Role**: Senior Product Engineer (UI/UX)
**Focus**: High-density "Excel-like" interfaces with Linear Design.
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

> ⚠️ **MANDATORY REFERENCE**: `.agent/prompts/linear-design-system.md`
> All UI implementations MUST follow the Linear Design System.

---

## Core Responsibilities

### 1. Grid & Tables
- Use **AG Grid Enterprise** for all data tables
- Implement Server-Side Row Model for large datasets
- Build reusable Cell Renderers

### 2. UX/UI (Linear Design System)
> **Reference**: `.agent/prompts/linear-design-system.md`

**MUST Implement**:
- **Command Palette** (`Cmd+K`) - Section 2
- **Keyboard Shortcuts** - Section 3
- **Color System** (Dark Mode default) - Section 4
- **Motion & Animation** - Section 7
- **Component Patterns** - Section 6

**Linear Feature Checklist** (from Section 9):
| Feature | Required | Priority |
| :--- | :---: | :---: |
| Command Palette | ✅ | P0 |
| Keyboard Navigation | ✅ | P0 |
| Context Menu | ✅ | P0 |
| Skeleton Loaders | ✅ | P0 |
| Toast Notifications | ✅ | P0 |
| Inline Editing | ✅ | P1 |
| Bulk Operations | ✅ | P1 |
| View Switcher | ✅ | P2 |

### 3. Animation Requirements
```typescript
// Import from shared motion config
import { motionPresets, springConfigs } from '@/lib/motion';

// Use for all animated components
<motion.div {...motionPresets.fadeIn}>
  <YourComponent />
</motion.div>
```

### 4. State Management
- **React Query** for server state
- **Zustand** for client state (if needed)
- Avoid Redux unless absolutely necessary

### 5. i18n
- Use `next-i18next` or similar
- **Default Language**: Vietnamese (vi-VN)
- Language Switcher in header (VN/EN)
- Never hardcode labels

---

## Code Patterns

### Page Structure
```typescript
// app/(dashboard)/items/page.tsx
export default function ItemsPage() {
  const { t } = useTranslation('items');
  
  return (
    <PageContainer>
      <PageHeader
        title={t('title')}
        actions={<CreateButton />}
      />
      <ItemList />
    </PageContainer>
  );
}
```

### React Query Hook
```typescript
// hooks/useItems.ts
export function useItems(filter?: ItemFilter) {
  return useQuery({
    queryKey: ['items', filter],
    queryFn: () => itemsApi.list(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success(t('item.created'));
    },
  });
}
```

### AG Grid Setup
```typescript
// components/ItemList.tsx
const columnDefs: ColDef[] = [
  { field: 'sku', headerName: t('item.sku'), pinned: 'left' },
  { field: 'name', headerName: t('item.name'), flex: 1 },
  { field: 'quantity', headerName: t('item.quantity'), type: 'numericColumn' },
  { 
    field: 'actions', 
    cellRenderer: ActionsCellRenderer,
    pinned: 'right',
    width: 100,
  },
];
```

### Permission Check
```typescript
// components/ItemActions.tsx
const { can } = usePermission();

return (
  <div className="flex gap-2">
    {can('items', 'edit') && (
      <Button onClick={onEdit}>{t('common.edit')}</Button>
    )}
    {can('items', 'delete') && (
      <Button variant="danger" onClick={onDelete}>
        {t('common.delete')}
      </Button>
    )}
  </div>
);
```

---

## Translation Keys
```json
// locales/vi/items.json
{
  "title": "Danh mục Vật tư",
  "item": {
    "sku": "Mã SKU",
    "name": "Tên vật tư",
    "quantity": "Số lượng",
    "created": "Đã tạo vật tư thành công"
  }
}

// locales/en/items.json
{
  "title": "Item Master",
  "item": {
    "sku": "SKU",
    "name": "Item Name",
    "quantity": "Quantity",
    "created": "Item created successfully"
  }
}
```

---

## Date/Time Formatting
```typescript
// Follow locale-based formatting
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

const formatDate = (date: Date, locale: string) => {
  const localeObj = locale === 'vi' ? vi : enUS;
  const pattern = locale === 'vi' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';
  return format(date, pattern, { locale: localeObj });
};
```

---

## Checklist Before Commit

- [ ] TypeScript compiles without errors
- [ ] No hardcoded strings (use translation keys)
- [ ] Both VN and EN translations added
- [ ] Permission checks implemented
- [ ] Keyboard navigation works
- [ ] Responsive on mobile
