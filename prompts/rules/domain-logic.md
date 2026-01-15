# Domain Logic Rules (Load for Business Logic Work)

> **Load when**: Working on business rules, calculations, domain-specific logic.
> Size: ~7KB

---

## 1. Inventory Domain

### 1.1 Dual-UOM System
```go
type Item struct {
    ID            uuid.UUID
    SKU           string
    BuyingUOM     string    // "roll", "kg"
    UsageUOM      string    // "m", "piece"
    ConversionRate float64  // BuyingUOM → UsageUOM
}

// Convert from buying to usage
func (i *Item) ToUsageQty(buyingQty float64) float64 {
    return buyingQty * i.ConversionRate
}
```

### 1.2 Cable Cutting Logic
```go
type ParentLot struct {
    ID            uuid.UUID
    ItemID        uuid.UUID
    InitialLength float64
    CurrentLength float64
    ChildLots     []ChildLot
}

type CutRequest struct {
    RequiredLength float64
    KerfLoss       float64  // ~0.01m per cut
}

func (p *ParentLot) Cut(req CutRequest) (*ChildLot, error) {
    totalNeeded := req.RequiredLength + req.KerfLoss
    
    if p.CurrentLength < totalNeeded {
        return nil, ErrInsufficientStock
    }
    
    child := &ChildLot{
        ID:       uuid.New(),
        ParentID: p.ID,
        Length:   req.RequiredLength,
    }
    
    p.CurrentLength -= totalNeeded
    p.ChildLots = append(p.ChildLots, *child)
    
    return child, nil
}
```

### 1.3 Item Polymorphism
| Type | Specific Fields |
| :--- | :--- |
| **Cable** | Length, CrossSection, VoltageRating |
| **Conduit** | Diameter, Material, Length |
| **Panel** | Dimensions, IPRating, Capacity |
| **Fitting** | Size, Standard, Material |

---

## 2. Finance Domain

### 2.1 Vietnam Accounting Chart (VAS)
```go
// Account number ranges
var AccountRanges = map[string]string{
    "1xx": "Assets",
    "2xx": "Liabilities",
    "3xx": "Equity",
    "5xx": "Revenue",
    "6xx": "Expenses",
    "9xx": "Other",
}

// Common accounts
var CommonAccounts = map[string]string{
    "111": "Tiền mặt",
    "112": "Tiền gửi ngân hàng",
    "131": "Phải thu khách hàng",
    "152": "Nguyên vật liệu",
    "154": "Chi phí SXKD dở dang (WIP)",
    "331": "Phải trả người bán",
    "511": "Doanh thu bán hàng",
    "621": "Chi phí NVL trực tiếp",
    "622": "Chi phí nhân công trực tiếp",
    "627": "Chi phí sản xuất chung",
    "632": "Giá vốn hàng bán",
}
```

### 2.2 WIP Capitalization
```go
// When project phase completes
func (s *FinanceService) CapitalizeWIP(ctx context.Context, projectID uuid.UUID) error {
    // 1. Get accumulated costs
    materials := s.GetCosts(projectID, "621") // NVL
    labor := s.GetCosts(projectID, "622")     // Nhân công
    overhead := s.GetCosts(projectID, "627")  // Chi phí chung
    
    total := materials + labor + overhead
    
    // 2. Create journal entry
    // Dr 154 (WIP) / Cr 621, 622, 627
    return s.CreateJournalEntry(ctx, JournalEntry{
        Description: "WIP Capitalization",
        Lines: []JournalLine{
            {AccountCode: "154", Debit: total},
            {AccountCode: "621", Credit: materials},
            {AccountCode: "622", Credit: labor},
            {AccountCode: "627", Credit: overhead},
        },
    })
}
```

### 2.3 AIA Billing (G702/G703)
```go
type AIABilling struct {
    ContractSum       float64
    ChangeOrders      float64
    TotalEarned       float64  // % Complete × Contract
    PreviousBilled    float64
    CurrentBilling    float64  // This period
    RetainageRate     float64  // 5-10%
    RetainageHeld     float64
    AmountDue         float64
}

func (b *AIABilling) Calculate() {
    b.CurrentBilling = b.TotalEarned - b.PreviousBilled
    b.RetainageHeld = b.TotalEarned * b.RetainageRate
    b.AmountDue = b.CurrentBilling - (b.CurrentBilling * b.RetainageRate)
}
```

---

## 3. Projects Domain

### 3.1 WBS (Work Breakdown Structure)
```go
type WBSNode struct {
    ID       uuid.UUID
    Path     string  // ltree: "1.1.2"
    Name     string
    Budget   float64
    Actual   float64
    Progress float64 // 0-100%
}

// Earned Value
func (n *WBSNode) EarnedValue() float64 {
    return n.Budget * (n.Progress / 100)
}

// Cost Variance
func (n *WBSNode) CostVariance() float64 {
    return n.EarnedValue() - n.Actual
}

// Schedule Performance Index
func (n *WBSNode) SPI(plannedValue float64) float64 {
    return n.EarnedValue() / plannedValue
}
```

### 3.2 Critical Path Method (CPM)
```go
type Task struct {
    ID           uuid.UUID
    Name         string
    Duration     int // days
    Dependencies []uuid.UUID
    EarlyStart   int
    EarlyFinish  int
    LateStart    int
    LateFinish   int
}

func (t *Task) Slack() int {
    return t.LateStart - t.EarlyStart
}

func (t *Task) IsCritical() bool {
    return t.Slack() == 0
}
```

---

## 4. Sales Domain

### 4.1 CPQ (Configure-Price-Quote)
```go
type Quote struct {
    Lines       []QuoteLine
    Subtotal    float64
    DiscountPct float64
    DiscountAmt float64
    Tax         float64
    Total       float64
}

func (q *Quote) Calculate() {
    q.Subtotal = 0
    for _, line := range q.Lines {
        q.Subtotal += line.ExtendedPrice()
    }
    
    q.DiscountAmt = q.Subtotal * (q.DiscountPct / 100)
    taxable := q.Subtotal - q.DiscountAmt
    q.Tax = taxable * 0.10 // 10% VAT
    q.Total = taxable + q.Tax
}
```

### 4.2 Discount Rules
```go
// Approval thresholds
var DiscountApproval = map[float64]string{
    5:  "sales",    // Sales can approve up to 5%
    10: "manager",  // Manager up to 10%
    20: "director", // Director up to 20%
    100: "admin",   // Admin for any discount
}
```

---

## 5. Manufacturing Domain

### 5.1 BOM (Bill of Materials)
```go
// Sales BOM ≠ Manufacturing BOM
type SalesBOM struct {
    // Customer-facing, higher prices
    Lines []BOMLine
}

type ManufacturingBOM struct {
    // Internal, includes labor, waste
    Lines []BOMLine
}

type BOMLine struct {
    ItemID   uuid.UUID
    Quantity float64
    UOM      string
    UnitCost float64
    WastePct float64 // Manufacturing only
}
```

### 5.2 Routing
```go
type Routing struct {
    Operations []Operation
}

type Operation struct {
    Sequence     int
    WorkCenter   string
    SetupTime    time.Duration
    RunTime      time.Duration // per unit
    OverlapPct   float64       // % that can overlap with next
}
```
