# AR Adjustment System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (adjustment-form.tsx)
    ↓
recalculateAllDetailAmounts (ap-adjustment-calculations.ts)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH ADJUSTMENT ITEM:                              │
│ 1. Calculate totLocalAmt = totAmt * newExhRate        │
│ 2. Calculate gstLocalAmt = gstAmt * newExhRate        │
│ 3. Calculate totLocalAmtAftGst = totLocalAmt + gstLocalAmt │
│ 4. Calculate ctyAmt = totAmt * cityExhRate             │
│ 5. Calculate ctyGstAmt = gstAmt * cityExhRate         │
│ 6. Calculate ctyTotAmtAftGst = ctyAmt + ctyGstAmt     │
└─────────────────────────────────────────────────────────┘
    ↓
Update Header Amounts:
- totLocalAmt = sum of all totLocalAmt
- gstLocalAmt = sum of all gstLocalAmt
- totLocalAmtAftGst = sum of all totLocalAmtAftGst
- ctyAmt = sum of all ctyAmt
- ctyGstAmt = sum of all ctyGstAmt
- ctyTotAmtAftGst = sum of all ctyTotAmtAftGst
    ↓
Update Form Values (adjustment-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW

```
User Edits Cell (totAmt, gstAmt, qty, price, etc.)
    ↓
handleCellEdit (adjustment-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 1: Update Specific Item                        │
│ - If totAmt: Recalculate gstAmt, totAmtAftGst         │
│ - If gstAmt: Recalculate totAmtAftGst                  │
│ - If qty/price: Recalculate totAmt, gstAmt, totAmtAftGst │
│ - If exchangeRate: Recalculate all local amounts       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 2: Calculate Total Amounts                    │
│ - totAmt = sum of all totAmt                           │
│ - gstAmt = sum of all gstAmt                           │
│ - totAmtAftGst = sum of all totAmtAftGst               │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 3: Calculate Local Amounts                    │
│ - totLocalAmt = sum of all totLocalAmt                 │
│ - gstLocalAmt = sum of all gstLocalAmt                 │
│ - totLocalAmtAftGst = sum of all totLocalAmtAftGst     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 4: Calculate Country Amounts (if enabled)     │
│ - ctyAmt = sum of all ctyAmt                           │
│ - ctyGstAmt = sum of all ctyGstAmt                    │
│ - ctyTotAmtAftGst = sum of all ctyTotAmtAftGst         │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 5: Update Form Values                         │
│ - Update all header amounts                           │
│ - Update all local amounts                            │
│ - Update all country amounts (if enabled)              │
└─────────────────────────────────────────────────────────┘
```

## 3. CURRENCY CHANGE FLOW

```
User Changes Currency
    ↓
handleCurrencyChange (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Currency Setup Logic:                                  │
│ 1. Set currencyId = selectedCurrency.currencyId        │
│ 2. Set exchangeRate = currency's exchange rate        │
│ 3. Set cityExchangeRate = currency's city exchange rate │
│ 4. Recalculate all amounts with new rates             │
└─────────────────────────────────────────────────────────┘
    ↓
recalculateAllDetailAmounts
    ↓
Update all local and country amounts
    ↓
Update header totals
```

## 4. SUPPLIER CHANGE FLOW

```
User Changes Supplier
    ↓
handleSupplierChange (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Supplier Setup Logic:                                  │
│ 1. Set supplierId = selectedSupplier.supplierId        │
│ 2. Set supplierName = selectedSupplier.supplierName   │
│ 3. Set currencyId = supplier's currency                │
│ 4. Set exchangeRate = supplier's exchange rate        │
│ 5. Set gstPercentage = supplier's GST percentage       │
│ 6. Set address and contact details                     │
└─────────────────────────────────────────────────────────┘
    ↓
Recalculate all amounts with new currency
    ↓
Update header totals
```

## 5. BANK CHANGE FLOW

```
User Changes Bank
    ↓
handleBankChange (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Bank Setup Logic:                                      │
│ 1. Set bankId = selectedBank.bankId                    │
│ 2. Set bank account details                            │
│ 3. Update payment information                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update bank-related fields
```

## 6. CREDIT TERMS CHANGE FLOW

```
User Changes Credit Terms
    ↓
handleCreditTermsChange (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Credit Terms Logic:                                    │
│ 1. Set creditTermId = selectedCreditTerm.creditTermId  │
│ 2. Calculate due date = accountDate + creditDays       │
│ 3. Set dueDate in form                                 │
└─────────────────────────────────────────────────────────┘
    ↓
Update due date field
```

## 7. GST CALCULATION FLOW

```
User Changes GST Percentage or Amount
    ↓
handleGstChange (adjustment-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ GST Calculation Logic:                                 │
│ 1. Calculate gstAmt = totAmt * gstPercentage / 100    │
│ 2. Calculate totAmtAftGst = totAmt + gstAmt           │
│ 3. Calculate gstLocalAmt = gstAmt * exchangeRate      │
│ 4. Calculate totLocalAmtAftGst = totLocalAmt + gstLocalAmt │
└─────────────────────────────────────────────────────────┘
    ↓
Update item amounts
    ↓
Recalculate totals
    ↓
Update header amounts
```

## 8. QUANTITY/PRICE CHANGE FLOW

```
User Changes Quantity or Price
    ↓
handleQtyPriceChange (adjustment-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Amount Calculation Logic:                              │
│ 1. Calculate totAmt = qty * price                     │
│ 2. Calculate gstAmt = totAmt * gstPercentage / 100   │
│ 3. Calculate totAmtAftGst = totAmt + gstAmt          │
│ 4. Calculate local amounts with exchange rate         │
│ 5. Calculate country amounts with city exchange rate   │
└─────────────────────────────────────────────────────────┘
    ↓
Update item amounts
    ↓
Recalculate totals
    ↓
Update header amounts
```

## 9. CORE CALCULATION FUNCTIONS

### A. Total Amount Calculations

```
calculateTotalAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, amtDec                           │
│ Output: { totAmt, gstAmt, totAmtAftGst }               │
│                                                         │
│ Formula:                                                │
│ - totAmt = sum of all totAmt                           │
│ - gstAmt = sum of all gstAmt                           │
│ - totAmtAftGst = totAmt + gstAmt                       │
└─────────────────────────────────────────────────────────┘
```

### B. Local Amount Calculations

```
calculateLocalAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, locAmtDec                        │
│ Output: { totLocalAmt, gstLocalAmt, totLocalAmtAftGst } │
│                                                         │
│ Formula:                                                │
│ - totLocalAmt = sum of all totLocalAmt                │
│ - gstLocalAmt = sum of all gstLocalAmt                │
│ - totLocalAmtAftGst = totLocalAmt + gstLocalAmt       │
└─────────────────────────────────────────────────────────┘
```

### C. Country Amount Calculations

```
calculateCountryAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, ctyAmtDec                        │
│ Output: { ctyAmt, ctyGstAmt, ctyTotAmtAftGst }          │
│                                                         │
│ Formula:                                                │
│ - ctyAmt = sum of all ctyAmt                           │
│ - ctyGstAmt = sum of all ctyGstAmt                    │
│ - ctyTotAmtAftGst = ctyAmt + ctyGstAmt                │
└─────────────────────────────────────────────────────────┘
```

### D. Detail Amount Recalculation

```
recalculateAllDetailAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, exchangeRate, cityExchangeRate    │
│ Output: updated details array                          │
│                                                         │
│ Formula:                                                │
│ FOR EACH DETAIL:                                        │
│ - totLocalAmt = totAmt * exchangeRate                   │
│ - gstLocalAmt = gstAmt * exchangeRate                  │
│ - totLocalAmtAftGst = totLocalAmt + gstLocalAmt       │
│ - ctyAmt = totAmt * cityExchangeRate                   │
│ - ctyGstAmt = gstAmt * cityExchangeRate                │
│ - ctyTotAmtAftGst = ctyAmt + ctyGstAmt                │
└─────────────────────────────────────────────────────────┘
```

## 10. HELPER FUNCTIONS

### A. Exchange Rate Setup

```
setExchangeRate
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, exhRateDec, visible                       │
│ Output: Sets exchangeRate in form                      │
│                                                         │
│ Logic:                                                  │
│ - Get currency exchange rate from API                   │
│ - Set exchangeRate in form                             │
│ - Set cityExchangeRate if city currency enabled        │
└─────────────────────────────────────────────────────────┘
```

### B. Local Exchange Rate Setup

```
setExchangeRateLocal
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, exhRateDec                               │
│ Output: Sets cityExchangeRate in form                  │
│                                                         │
│ Logic:                                                  │
│ - Get city currency exchange rate from API               │
│ - Set cityExchangeRate in form                         │
└─────────────────────────────────────────────────────────┘
```

### C. GST Percentage Setup

```
setGSTPercentage
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, supplierId                               │
│ Output: Sets gstPercentage in form                     │
│                                                         │
│ Logic:                                                  │
│ - Get supplier GST percentage from API                  │
│ - Set gstPercentage in form                            │
└─────────────────────────────────────────────────────────┘
```

## 11. FORM UPDATE SEQUENCES

### A. Standard Adjustment Mode

```
1. Calculate all details with base amounts
2. Update header amounts:
   - totAmt = sum of all totAmt
   - gstAmt = sum of all gstAmt
   - totAmtAftGst = totAmt + gstAmt
   - totLocalAmt = sum of all totLocalAmt
   - gstLocalAmt = sum of all gstLocalAmt
   - totLocalAmtAftGst = totLocalAmt + gstLocalAmt
```

### B. Multi-Currency Mode (City Currency Enabled)

```
1. Calculate all details with base amounts
2. Update header amounts:
   - Standard amounts (same as above)
   - ctyAmt = sum of all ctyAmt
   - ctyGstAmt = sum of all ctyGstAmt
   - ctyTotAmtAftGst = ctyAmt + ctyGstAmt
```

## 12. DEPENDENCY CHAIN

```
Exchange Rate Change
    ↓
recalculateAllDetailAmounts
    ↓
Update all local amounts (totLocalAmt, gstLocalAmt, etc.)
    ↓
Update all country amounts (ctyAmt, ctyGstAmt, etc.)
    ↓
Update header totals
```

```
Cell Edit
    ↓
Calculate item amounts (totAmt, gstAmt, totAmtAftGst)
    ↓
Calculate local amounts (totLocalAmt, gstLocalAmt, etc.)
    ↓
Calculate country amounts (ctyAmt, ctyGstAmt, etc.)
    ↓
Update header totals
```

```
Currency Change
    ↓
Set new exchange rates
    ↓
recalculateAllDetailAmounts
    ↓
Update all amounts with new rates
    ↓
Update header totals
```

## 13. KEY DECISION POINTS

### A. City Currency Mode Detection

```
IF visible?.m_CtyCurr === true:
    → Multi-Currency Mode
    → Enable city exchange rate field
    → Calculate country amounts
    → Show country amount columns

IF visible?.m_CtyCurr === false:
    → Single Currency Mode
    → Disable city exchange rate field
    → Hide country amount columns
```

### B. GST Calculation Mode

```
IF gstPercentage > 0:
    → Calculate gstAmt = totAmt * gstPercentage / 100
    → Calculate totAmtAftGst = totAmt + gstAmt
    → Calculate local GST amounts

IF gstPercentage = 0:
    → Set gstAmt = 0
    → Set totAmtAftGst = totAmt
    → Set local GST amounts = 0
```

### C. Exchange Rate Impact

```
Exchange Rate Change:
    → Recalculate all local amounts with new rate
    → Keep base amounts unchanged
    → Update header local totals
    → Update country amounts (if enabled)
```

## 14. ADD/EDIT/DELETE DETAILS FLOW

```
User Adds/Edits/Deletes Detail Item
    ↓
handleAddDetail / handleEditDetail / handleDeleteDetail
    ↓
┌─────────────────────────────────────────────────────────┐
│ Detail Management Logic:                               │
│ - Add: Create new detail with default values           │
│ - Edit: Update existing detail with new values        │
│ - Delete: Remove detail from array                    │
└─────────────────────────────────────────────────────────┘
    ↓
Recalculate all amounts
    ↓
Update header totals
    ↓
Update form state
```

## 15. ADJUSTMENT VALIDATION FLOW

```
User Validates Adjustment
    ↓
handleAdjustmentValidation (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Logic:                                      │
│ 1. Check totAmt and totLocalAmt are not zero           │
│ 2. Validate all amounts are calculated correctly       │
│ 3. Check currency consistency                          │
│ 4. Verify GST calculations                            │
│ 5. Check exchange rate validation                      │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Allow adjustment posting
    → Generate final report
ELSE:
    → Show validation errors
    → Prevent adjustment posting
```

## 16. ADJUSTMENT POSTING FLOW

```
User Posts Adjustment
    ↓
handleAdjustmentPosting (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Posting Logic:                                         │
│ 1. Validate all amounts are correct                    │
│ 2. Calculate final totals                             │
│ 3. Create GL journal entries                          │
│ 4. Update supplier balances                           │
│ 5. Update adjustment status                            │
└─────────────────────────────────────────────────────────┘
    ↓
Create GL journal entries
    ↓
Update supplier balances
    ↓
Update adjustment status
    ↓
Generate posting report
```

## 17. ADJUSTMENT REPORTING FLOW

```
User Generates Adjustment Report
    ↓
handleAdjustmentReporting (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Report Generation Logic:                               │
│ 1. Gather adjustment data                              │
│ 2. Calculate adjustment totals                         │
│ 3. Identify GST amounts                               │
│ 4. Generate report format                              │
└─────────────────────────────────────────────────────────┘
    ↓
Generate adjustment report
    ↓
Export report data
    ↓
Send report notifications
```

## 18. ADJUSTMENT ARCHIVE FLOW

```
User Archives Adjustment
    ↓
handleAdjustmentArchive (adjustment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Archive Logic:                                         │
│ 1. Finalize adjustment data                            │
│ 2. Update adjustment status                            │
│ 3. Archive adjustment records                          │
│ 4. Generate archive report                             │
└─────────────────────────────────────────────────────────┘
    ↓
Archive adjustment data
    ↓
Update adjustment status
    ↓
Generate archive report
```

This flowchart shows the complete interaction between all functions in the AR Adjustment system, including the decision points, calculation sequences, and form update logic for adjustment management and supplier balance updates.
