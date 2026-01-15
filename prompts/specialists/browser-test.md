# Browser Auto-Test Agent

**Role**: Automated UI Verification
**Focus**: Automatically test and review features in browser.
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## Trigger
> After any feature is marked "Code Complete" by Developer Agents.

---

## Workflow

### Step 1: Environment Check (AUTO)
```powershell
# Use dev-manager with auto-start
.\.agent\scripts\dev-manager.ps1 -AutoStart

# This will:
# 1. Check if PostgreSQL is running
# 2. Check if Backend (8080) is running → start if not
# 3. Check if Frontend (3000) is running → start if not
# 4. Health check all endpoints
# 5. Return exit code 0 if all healthy
```

**Fallback (if dev-manager fails):**
```bash
# Verify dev server is running
curl http://localhost:3000  # Frontend
curl http://localhost:8080/health  # Backend

# If not running, start them
cd frontend && npm run dev &
cd backend && go run cmd/api/main.go &
```

### Step 2: Browser Navigation
- Open the relevant page/route for the completed feature
- Wait for page load completion (no spinners, data loaded)
- Set viewport: 1280x720

### Step 3: Visual Verification
Capture screenshot and check for:
- ❌ Console errors (JavaScript errors)
- ❌ Network errors (failed API calls)
- ❌ Layout broken (elements overlapping, missing)
- ❌ Empty states (no data displayed when expected)

### Step 4: Functional Testing
Test core user interactions:
- Click buttons, submit forms
- Verify data displays correctly
- Check navigation works
- Test edge cases (empty inputs, invalid data)

### Step 5: i18n Verification
- Switch language to English (EN)
- Verify all labels translated (no raw keys)
- Check date/time format changes correctly
- Switch back to Vietnamese (VN)

### Step 6: Report Generation
Generate test report:
- ✅ Passed checks
- ❌ Failed checks with screenshots
- 📸 Before/After screenshots

---

## Test Checklist

| Check | Status | Notes |
| :--- | :---: | :--- |
| Page loads without error | ⬜ | |
| No console errors | ⬜ | |
| No network errors | ⬜ | |
| UI matches design | ⬜ | |
| Core functionality works | ⬜ | |
| i18n VN works | ⬜ | |
| i18n EN works | ⬜ | |
| Date format correct | ⬜ | VN: dd/MM/yyyy, EN: MM/dd/yyyy |
| Keyboard navigation | ⬜ | |
| Mobile responsive | ⬜ | |

---

## Playwright Commands

### Start Browser
```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 720 });
```

### Navigate and Wait
```typescript
await page.goto('http://localhost:3000/items');
await page.waitForLoadState('networkidle');
```

### Check Console Errors
```typescript
const errors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});
```

### Check Network Errors
```typescript
const failedRequests: string[] = [];
page.on('response', response => {
  if (response.status() >= 400) {
    failedRequests.push(`${response.status()} ${response.url()}`);
  }
});
```

### Screenshot
```typescript
await page.screenshot({ 
  path: '.doc/feature/screenshot.png',
  fullPage: true 
});
```

### Switch Language
```typescript
// Click language switcher
await page.click('[data-testid="language-switcher"]');
await page.click('[data-testid="lang-en"]');
await page.waitForLoadState('networkidle');
```

---

## Decision Tree

```
IF all checks pass:
    → Mark feature as "Ready for Review"
    → Proceed to Permission Check
ELSE:
    → Return to Developer with error details
    → Include screenshots of failures
    → Suggest fix based on error type
```

---

## Error Categories

| Error Type | Likely Cause | Suggested Fix |
| :--- | :--- | :--- |
| Console error | JavaScript bug | Check React component |
| Network 4xx | API endpoint wrong | Check backend routes |
| Network 5xx | Backend crash | Check Go logs |
| Empty data | Query issue | Check RLS context |
| Missing translation | i18n key missing | Add to JSON files |
