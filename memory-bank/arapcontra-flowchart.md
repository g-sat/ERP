# ARAP Contra System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (arapcontra-form.tsx)
    ↓
recalculateAllDetailAmounts (gl-arapcontra-calculations.ts)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH CONTRA ITEM:                                   │
│ 1. Calculate docTotLocalAmt = docTotAmt * newExhRate   │
│ 2. Calculate docBalLocalAmt = docBalAmt * newExhRate   │
│ 3. Calculate allocLocalAmt = allocAmt * newExhRate      │
│ 4. Calculate docAllocLocalAmt = docAllocAmt * newExhRate │
│ 5. Calculate centDiff = docAllocLocalAmt - allocLocalAmt │
│ 6. Calculate exhGainLoss = centDiff                     │
└─────────────────────────────────────────────────────────┘
    ↓
Update Header Amounts:
- totLocalAmt = sum of all docTotLocalAmt
- exhGainLoss = sum of all exhGainLoss
    ↓
Update Form Values (arapcontra-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW

```
User Edits Cell (allocAmt, allocLocalAmt, etc.)
    ↓
handleCellEdit (ar-details-table.tsx / ap-details-table.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 1: Update Specific Item                        │
│ - If allocAmt: Recalculate allocLocalAmt, centDiff     │
│ - If allocLocalAmt: Update local amount                │
│ - If exchangeRate: Recalculate all local amounts       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 2: Calculate Total Amounts                    │
│ - totAmt = sum of all docTotAmt                         │
│ - totLocalAmt = sum of all docTotLocalAmt               │
│ - exhGainLoss = sum of all exhGainLoss                 │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 3: Update Form Values                         │
│ - Update all header amounts                           │
│ - Update contra status                                │
└─────────────────────────────────────────────────────────┘
```

## 3. CURRENCY CHANGE FLOW

```
User Changes Currency
    ↓
handleCurrencyChange (arapcontra-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Currency Setup Logic:                                  │
│ 1. Set currencyId = selectedCurrency.currencyId        │
│ 2. Set exchangeRate = currency's exchange rate        │
│ 3. Recalculate all amounts with new rates             │
│ 4. Update AR and AP transaction amounts                │
└─────────────────────────────────────────────────────────┘
    ↓
recalculateAllDetailAmounts
    ↓
Update all local amounts
    ↓
Update header totals
```

## 4. SUPPLIER/CUSTOMER CHANGE FLOW

```
User Changes Supplier/Customer
    ↓
handleSupplierChange / handleCustomerChange (arapcontra-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Supplier/Customer Setup Logic:                         │
│ 1. Set supplierId/customerId = selectedEntity.id       │
│ 2. Set supplierName/customerName = selectedEntity.name │
│ 3. Set currencyId = entity's currency                  │
│ 4. Set exchangeRate = entity's exchange rate          │
│ 5. Load entity's outstanding transactions             │
└─────────────────────────────────────────────────────────┘
    ↓
Load outstanding transactions
    ↓
Update form with entity data
    ↓
Recalculate amounts
```

## 5. AUTO ALLOCATION FLOW

```
User Clicks "Auto Allocation" Button
    ↓
handleAutoAllocation (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Auto Allocation Logic:                                 │
│ 1. Match AR and AP transactions by amount              │
│ 2. Calculate allocation amounts                        │
│ 3. Set allocAmt = docBalAmt for matched items         │
│ 4. Calculate allocLocalAmt = allocAmt * exchangeRate   │
│ 5. Calculate centDiff = docAllocLocalAmt - allocLocalAmt │
│ 6. Calculate exhGainLoss = centDiff                   │
└─────────────────────────────────────────────────────────┘
    ↓
Update allocation amounts
    ↓
Recalculate totals
    ↓
Update header amounts
```

## 6. RESET ALLOCATION FLOW

```
User Clicks "Reset Allocation" Button
    ↓
handleResetAllocation (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Reset Logic:                                           │
│ 1. Set allocAmt = 0 for all items                      │
│ 2. Set allocLocalAmt = 0 for all items                │
│ 3. Set centDiff = 0 for all items                     │
│ 4. Set exhGainLoss = 0 for all items                  │
│ 5. Reset allocation status                            │
└─────────────────────────────────────────────────────────┘
    ↓
Update all allocation amounts
    ↓
Recalculate totals
    ↓
Update header amounts
```

## 7. CORE CALCULATION FUNCTIONS

### A. Total Amount Calculations

```
calculateTotalAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, amtDec                           │
│ Output: { totAmt }                                     │
│                                                         │
│ Formula:                                                │
│ - totAmt = sum of all docTotAmt                        │
└─────────────────────────────────────────────────────────┘
```

### B. Local Amount Calculations

```
calculateLocalAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, locAmtDec                        │
│ Output: { totLocalAmt }                                 │
│                                                         │
│ Formula:                                                │
│ - totLocalAmt = sum of all docTotLocalAmt             │
└─────────────────────────────────────────────────────────┘
```

### C. Country Amount Calculations

```
calculateCtyAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, ctyAmtDec                        │
│ Output: { ctyAmt }                                      │
│                                                         │
│ Formula:                                                │
│ - ctyAmt = sum of all ctyAmt                           │
└─────────────────────────────────────────────────────────┘
```

### D. Detail Amount Recalculation

```
recalculateAllDetailAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, exchangeRate                     │
│ Output: updated details array                          │
│                                                         │
│ Formula:                                                │
│ FOR EACH DETAIL:                                        │
│ - docTotLocalAmt = docTotAmt * exchangeRate            │
│ - docBalLocalAmt = docBalAmt * exchangeRate            │
│ - allocLocalAmt = allocAmt * exchangeRate              │
│ - docAllocLocalAmt = docAllocAmt * exchangeRate        │
│ - centDiff = docAllocLocalAmt - allocLocalAmt          │
│ - exhGainLoss = centDiff                               │
└─────────────────────────────────────────────────────────┘
```

## 8. TRANSACTION SELECTION FLOW

```
User Selects AR/AP Transaction
    ↓
handleSelectARTransaction / handleSelectAPTransaction (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Transaction Selection Logic:                           │
│ 1. Load outstanding AR/AP transactions                 │
│ 2. Filter by supplier/customer                        │
│ 3. Filter by currency                                  │
│ 4. Filter by date range                                │
│ 5. Show transaction selection dialog                   │
└─────────────────────────────────────────────────────────┘
    ↓
Display transaction selection dialog
    ↓
User selects transactions
    ↓
Add selected transactions to contra
    ↓
Recalculate amounts
```

## 9. CONTRA MATCHING FLOW

```
User Matches AR and AP Transactions
    ↓
handleContraMatching (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Matching Logic:                                        │
│ 1. Compare AR and AP transaction amounts               │
│ 2. Identify matching amounts and dates                │
│ 3. Set allocation amounts                             │
│ 4. Calculate exchange differences                     │
│ 5. Update contra status                               │
└─────────────────────────────────────────────────────────┘
    ↓
Update allocation amounts
    ↓
Calculate exchange differences
    ↓
Update contra status
```

## 10. EXCHANGE GAIN/LOSS CALCULATION FLOW

```
System Calculates Exchange Gain/Loss
    ↓
calculateExchangeGainLoss
    ↓
┌─────────────────────────────────────────────────────────┐
│ Exchange Gain/Loss Logic:                              │
│ 1. Calculate centDiff = docAllocLocalAmt - allocLocalAmt │
│ 2. Set exhGainLoss = centDiff                          │
│ 3. Sum all exchange differences                        │
│ 4. Update header exhGainLoss                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update exchange gain/loss amounts
    ↓
Update header totals
```

## 11. DEPENDENCY CHAIN

```
Exchange Rate Change
    ↓
recalculateAllDetailAmounts
    ↓
Update all local amounts (docTotLocalAmt, allocLocalAmt, etc.)
    ↓
Update header totals
```

```
Cell Edit
    ↓
Calculate item amounts (allocAmt, allocLocalAmt, centDiff)
    ↓
Update header totals
```

```
Auto Allocation
    ↓
Match AR and AP transactions
    ↓
Set allocation amounts
    ↓
Calculate exchange differences
    ↓
Update header totals
```

## 12. KEY DECISION POINTS

### A. Transaction Matching Logic

```
IF AR.amount === AP.amount AND AR.currency === AP.currency:
    → Auto-match transactions
    → Set allocation amounts
    → Calculate exchange differences

IF AR.amount !== AP.amount OR AR.currency !== AP.currency:
    → Manual matching required
    → Set partial allocation
    → Flag for review
```

### B. Exchange Rate Impact

```
Exchange Rate Change:
    → Recalculate all local amounts with new rate
    → Keep base amounts unchanged
    → Update exchange differences
    → Update header totals
```

### C. Allocation Status

```
IF allocation is complete:
    → Mark contra as ready for posting
    → Calculate final exchange differences
    → Update contra status

IF allocation is partial:
    → Mark contra as pending
    → Show allocation summary
    → Require manual completion
```

## 13. CONTRA POSTING FLOW

```
User Posts Contra
    ↓
handleContraPosting (arapcontra-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Posting Logic:                                         │
│ 1. Validate all allocations are complete              │
│ 2. Calculate final exchange differences               │
│ 3. Create GL journal entries                          │
│ 4. Update AR and AP balances                           │
│ 5. Update contra status                               │
└─────────────────────────────────────────────────────────┘
    ↓
Create GL journal entries
    ↓
Update AR and AP balances
    ↓
Update contra status
    ↓
Generate posting report
```

## 14. CONTRA VALIDATION FLOW

```
User Validates Contra
    ↓
handleContraValidation (arapcontra-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Logic:                                      │
│ 1. Check all transactions are allocated               │
│ 2. Validate exchange differences                      │
│ 3. Check currency consistency                          │
│ 4. Verify contra totals                               │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Allow contra posting
    → Generate final report
ELSE:
    → Show validation errors
    → Prevent contra posting
```

## 15. CONTRA REPORTING FLOW

```
User Generates Contra Report
    ↓
handleContraReporting (arapcontra-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Report Generation Logic:                               │
│ 1. Gather contra data                                 │
│ 2. Calculate contra totals                            │
│ 3. Identify exchange differences                      │
│ 4. Generate report format                              │
└─────────────────────────────────────────────────────────┘
    ↓
Generate contra report
    ↓
Export report data
    ↓
Send report notifications
```

## 16. CONTRA ARCHIVE FLOW

```
User Archives Contra
    ↓
handleContraArchive (arapcontra-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Archive Logic:                                         │
│ 1. Finalize contra data                                │
│ 2. Update contra status                               │
│ 3. Archive contra records                              │
│ 4. Generate archive report                             │
└─────────────────────────────────────────────────────────┘
    ↓
Archive contra data
    ↓
Update contra status
    ↓
Generate archive report
```

This flowchart shows the complete interaction between all functions in the ARAP Contra system, including the decision points, calculation sequences, and form update logic for contra management and AR/AP transaction matching.
