# AR Receipt System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (receipt-form.tsx)
    ↓
recalculateAllAmountsOnExchangeRateChange (ar-receipt-calculations.ts)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH DETAIL ITEM:                                   │
│ 1. Calculate allocLocalAmt = allocAmt * newExhRate     │
│ 2. Calculate docAllocLocalAmt = allocAmt * docExhRate  │
│ 3. Calculate centDiff = docAllocLocalAmt - allocLocalAmt │
│ 4. Set exhGainLoss = centDiff                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update Header Amounts:
- totLocalAmt = totAmt * newExhRate
- unAllocTotLocalAmt = unAllocTotAmt * newExhRate
- exhGainLoss = sum of all centDiff
    ↓
Update Form Values (receipt-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW TABLE

```
User Edits Cell (allocAmt, allocLocalAmt, etc.)
    ↓
handleCellEdit (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 1: Update Specific Item                        │
│ - If allocAmt: Recalculate all dependent fields        │
│ - If allocLocalAmt: Just update the field              │
│ - Other fields: Update the field                        │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 2: Calculate Total Allocation Amounts         │
│ - totalAllocAmt = sum of all allocAmt                  │
│ - totalAllocLocalAmt = sum of all allocLocalAmt        │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 3: Calculate Unallocated Amounts              │
│ IF totAmt > 0 (Proportional):                          │
│   - unAllocTotAmt = totAmt - totalAllocAmt             │
│   - unAllocTotLocalAmt = unAllocTotAmt * exhRate       │
│ ELSE (Full Allocation):                                │
│   - unAllocTotAmt = 0                                  │
│   - unAllocTotLocalAmt = 0                             │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 4: Update Form Values                         │
│ - totAmt = totalAllocAmt (Full allocation mode)       │
│ - totLocalAmt = totalAllocLocalAmt                     │
│ - recTotAmt = totalAllocAmt                           │
│ - recTotLocalAmt = totalAllocLocalAmt                 │
│ - unAllocTotAmt, unAllocTotLocalAmt                   │
│ - allocTotAmt, allocTotLocalAmt                       │
│ - exhGainLoss = sum of all centDiff                    │
└─────────────────────────────────────────────────────────┘
```

## 3. AUTO ALLOCATION (totAmt > 0) - PROPORTIONAL ALLOCATION

```
User Clicks "Auto Allocation" Button
    ↓
handleProportionalAllocation (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH DETAIL ITEM:                                   │
│ 1. Calculate allocAmt = docBalAmt (full balance)       │
│ 2. Calculate allocLocalAmt = allocAmt * currentExhRate │
│ 3. Calculate docAllocLocalAmt = allocAmt * docExhRate  │
│ 4. Calculate centDiff = docAllocLocalAmt - allocLocalAmt │
│ 5. Set exhGainLoss = centDiff                          │
└─────────────────────────────────────────────────────────┘
    ↓
updateUnallocatedAmounts (main-tab.tsx)
    ↓
calculateHeaderAmountsForProportionalAllocation
    ↓
┌─────────────────────────────────────────────────────────┐
│ Calculate Unallocated Amounts:                          │
│ - unAllocTotAmt = totAmt - totalAllocAmt               │
│ - unAllocTotLocalAmt = unAllocTotAmt * exhRate         │
│ - exhGainLoss = sum of all centDiff                    │
└─────────────────────────────────────────────────────────┘
    ↓
Update Form Values (DO NOT update totAmt, totLocalAmt, recTotAmt, recTotLocalAmt)
```

## 4. AUTO ALLOCATION (totAmt = 0) - FULL ALLOCATION

```
User Clicks "Auto Allocation" Button
    ↓
handleFullAllocation (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH DETAIL ITEM:                                   │
│ 1. Calculate allocAmt = docBalAmt (full balance)       │
│ 2. Calculate allocLocalAmt = allocAmt * currentExhRate │
│ 3. Calculate docAllocLocalAmt = allocAmt * docExhRate │
│ 4. Calculate centDiff = docAllocLocalAmt - allocLocalAmt │
│ 5. Set exhGainLoss = centDiff                          │
└─────────────────────────────────────────────────────────┘
    ↓
updateHeaderAmounts (main-tab.tsx)
    ↓
calculateHeaderAmountsForFullAllocation
    ↓
┌─────────────────────────────────────────────────────────┐
│ Update ALL Header Amounts:                             │
│ - totAmt = totalAllocAmt                               │
│ - totLocalAmt = totalAllocLocalAmt                     │
│ - recTotAmt = totalAllocAmt                            │
│ - recTotLocalAmt = totalAllocLocalAmt                  │
│ - unAllocTotAmt = 0                                    │
│ - unAllocTotLocalAmt = 0                               │
│ - exhGainLoss = sum of all centDiff                    │
└─────────────────────────────────────────────────────────┘
```

## 5. CURRENCY ID DIFFERENCE FLOW

```
User Changes Currency (currencyId ≠ recCurrencyId)
    ↓
handleCurrencyChange (receipt-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Currency Sync Logic:                                    │
│ IF currencyId === recCurrencyId:                       │
│   - Sync totAmt ↔ recTotAmt                            │
│   - Sync totLocalAmt ↔ recTotLocalAmt                  │
│ ELSE:                                                   │
│   - Keep currencies independent                        │
│   - No automatic syncing                               │
└─────────────────────────────────────────────────────────┘
    ↓
useEffect Currency Sync (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Conditional Sync:                                       │
│ - Only sync when currencies match                       │
│ - Only sync when totAmt = 0 (not in proportional mode) │
│ - Only sync when recTotAmt has value                    │
│ - Only sync when recTotAmt ≠ currentTotAmt              │
└─────────────────────────────────────────────────────────┘
```

## 5A. BANK CHANGE FLOW (Currency Difference)

```
User Changes Bank
    ↓
handleBankChange (receipt-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Bank Currency Logic:                                    │
│ 1. Set recCurrencyId = bank.currencyId                  │
│ 2. Set recExhRate = bank's exchange rate                │
│ 3. Update currency comparison state                     │
└─────────────────────────────────────────────────────────┘
    ↓
updateCurrencyComparison()
    ↓
┌─────────────────────────────────────────────────────────┐
│ IF currencyId ≠ recCurrencyId:                          │
│   - Enable recExhRate field                             │
│   - Enable recTotAmt field                              │
│   - Disable totAmt field                                │
│ ELSE:                                                   │
│   - Disable recExhRate field                            │
│   - Disable recTotAmt field                             │
│   - Enable totAmt field                                 │
└─────────────────────────────────────────────────────────┘
```

## 6. CORE CALCULATION FUNCTIONS

### A. Individual Item Calculations

```
calculateItemAllocation (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: item, allocAmt                                   │
│ Output: { allocLocalAmt, docAllocLocalAmt, centDiff,    │
│          exhGainLoss, docAllocAmt }                     │
│                                                         │
│ Formula:                                                │
│ - allocLocalAmt = allocAmt * currentExhRate            │
│ - docAllocLocalAmt = allocAmt * docExhRate             │
│ - centDiff = docAllocLocalAmt - allocLocalAmt           │
│ - exhGainLoss = centDiff                               │
└─────────────────────────────────────────────────────────┘
```

### B. Total Calculations

```
calculateTotalAllocationAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array                                    │
│ Output: { totalAllocAmt, totalAllocLocalAmt }           │
│                                                         │
│ Formula:                                                │
│ - totalAllocAmt = sum of all allocAmt                  │
│ - totalAllocLocalAmt = sum of all allocLocalAmt        │
└─────────────────────────────────────────────────────────┘
```

### C. Exchange Gain/Loss

```
calculateTotalExchangeGainLoss
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array                                    │
│ Output: totalExhGainLoss                               │
│                                                         │
│ Formula:                                                │
│ - totalExhGainLoss = sum of all centDiff               │
└─────────────────────────────────────────────────────────┘
```

### D. Header Amount Calculations

```
calculateHeaderAmountsForFullAllocation
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details, decimals                               │
│ Output: { totAmt, totLocalAmt, recTotAmt, recTotLocalAmt, │
│          unAllocTotAmt, unAllocTotLocalAmt, exhGainLoss } │
│                                                         │
│ Formula:                                                │
│ - totAmt = totalAllocAmt                               │
│ - totLocalAmt = totalAllocLocalAmt                     │
│ - recTotAmt = totalAllocAmt                            │
│ - recTotLocalAmt = totalAllocLocalAmt                  │
│ - unAllocTotAmt = 0                                    │
│ - unAllocTotLocalAmt = 0                               │
└─────────────────────────────────────────────────────────┘
```

```
calculateHeaderAmountsForProportionalAllocation
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details, totAmt, exhRate, decimals               │
│ Output: { unAllocTotAmt, unAllocTotLocalAmt, exhGainLoss } │
│                                                         │
│ Formula:                                                │
│ - unAllocTotAmt = totAmt - totalAllocAmt               │
│ - unAllocTotLocalAmt = unAllocTotAmt * exhRate          │
│ - exhGainLoss = sum of all centDiff                    │
└─────────────────────────────────────────────────────────┘
```

## 7. HELPER FUNCTIONS

### A. Local Amount Calculation

```
calculateLocalAmount
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: amount, exchangeRate, decimals                   │
│ Output: localAmount                                    │
│                                                         │
│ Formula:                                                │
│ - localAmount = amount * exchangeRate (with rounding)  │
└─────────────────────────────────────────────────────────┘
```

### B. Receipt Local Amount Calculation

```
calculateRecLocalAmount
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: recTotAmt, recExhRate, decimals                  │
│ Output: recTotLocalAmt                                 │
│                                                         │
│ Formula:                                                │
│ - recTotLocalAmt = recTotAmt * recExhRate (with rounding) │
└─────────────────────────────────────────────────────────┘
```

## 8. FORM UPDATE SEQUENCES

### A. Full Allocation Mode (totAmt = 0)

```
1. Calculate all details with full allocation
2. Update header amounts:
   - totAmt = totalAllocAmt
   - totLocalAmt = totalAllocLocalAmt
   - recTotAmt = totalAllocAmt
   - recTotLocalAmt = totalAllocLocalAmt
   - unAllocTotAmt = 0
   - unAllocTotLocalAmt = 0
   - exhGainLoss = sum of centDiff
```

### B. Proportional Allocation Mode (totAmt > 0)

```
1. Calculate all details with proportional allocation
2. Update header amounts:
   - Keep totAmt, totLocalAmt, recTotAmt, recTotLocalAmt unchanged
   - unAllocTotAmt = totAmt - totalAllocAmt
   - unAllocTotLocalAmt = unAllocTotAmt * exhRate
   - exhGainLoss = sum of centDiff
```

## 9. DEPENDENCY CHAIN

```
Exchange Rate Change
    ↓
recalculateAllAmountsOnExchangeRateChange
    ↓
Update all allocLocalAmt, docAllocLocalAmt, centDiff
    ↓
Update totalAllocLocalAmt, totalExhGainLoss
    ↓
Update header amounts (conditional based on allocation mode)
```

```
Cell Edit
    ↓
calculateItemAllocation
    ↓
calculateTotalAllocationAmounts
    ↓
calculateTotalExchangeGainLoss
    ↓
Update header amounts (conditional based on allocation mode)
```

```
Auto Allocation
    ↓
Calculate all details with full allocation
    ↓
calculateHeaderAmountsForFullAllocation OR calculateHeaderAmountsForProportionalAllocation
    ↓
Update form values (conditional based on allocation mode)
```

## 10. KEY DECISION POINTS

### A. Allocation Mode Detection

```
IF totAmt > 0:
    → Proportional Allocation Mode
    → DO NOT update totAmt, totLocalAmt, recTotAmt, recTotLocalAmt
    → Only update unAllocTotAmt, unAllocTotLocalAmt, exhGainLoss

IF totAmt = 0:
    → Full Allocation Mode
    → Update ALL header amounts
    → totAmt = totalAllocAmt, etc.
```

### B. Currency Sync Logic

```
IF currencyId === recCurrencyId:
    → Enable currency sync
    → totAmt ↔ recTotAmt
    → totLocalAmt ↔ recTotLocalAmt

IF currencyId !== recCurrencyId:
    → Disable currency sync
    → Keep currencies independent
```

### C. Exchange Rate Impact

```
Exchange Rate Change:
    → Recalculate allocLocalAmt with new rate
    → Keep docAllocLocalAmt with document rate
    → Recalculate centDiff = docAllocLocalAmt - allocLocalAmt
    → Update exhGainLoss = centDiff
    → Update header local amounts
```

## 11. RESET ALLOCATION FLOW

```
User Clicks "Reset Allocation" Button
    ↓
handleResetAllocation (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH DETAIL ITEM:                                   │
│ 1. Set allocAmt = 0                                     │
│ 2. Set allocLocalAmt = 0                               │
│ 3. Set docAllocAmt = 0                                 │
│ 4. Set docAllocLocalAmt = 0                            │
│ 5. Set centDiff = 0                                    │
│ 6. Set exhGainLoss = 0                                 │
└─────────────────────────────────────────────────────────┘
    ↓
resetHeaderAmounts (main-tab.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Reset ALL Header Amounts:                              │
│ - totAmt = 0                                           │
│ - totLocalAmt = 0                                      │
│ - recTotAmt = 0                                        │
│ - recTotLocalAmt = 0                                   │
│ - unAllocTotAmt = 0                                    │
│ - unAllocTotLocalAmt = 0                               │
│ - allocTotAmt = 0                                      │
│ - allocTotLocalAmt = 0                                 │
│ - exhGainLoss = 0                                      │
└─────────────────────────────────────────────────────────┘
    ↓
Set isAllocated = false
    ↓
Show Success Message: "Reset X allocation(s) and all header amounts (including unallocated amounts) to 0"
```

This flowchart shows the complete interaction between all functions in the AR Receipt system, including the decision points, calculation sequences, and form update logic.
