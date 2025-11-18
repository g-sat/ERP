# AR Invoice System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (invoice-form.tsx)
    ↓
recalculateAllDetailsLocalAndCtyAmounts (ar-invoice-calculations.ts)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH DETAIL ITEM:                                   │
│ 1. Calculate totLocalAmt = totAmt * newExhRate        │
│ 2. Calculate gstLocalAmt = gstAmt * newExhRate         │
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
Update Form Values (invoice-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW

```
User Edits Cell (totAmt, gstAmt, qty, price, etc.)
    ↓
handleCellEdit (invoice-details-form.tsx)
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
handleCurrencyChange (invoice-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Currency Setup Logic:                                  │
│ 1. Set currencyId = selectedCurrency.currencyId        │
│ 2. Set exchangeRate = currency's exchange rate        │
│ 3. Set cityExchangeRate = currency's city exchange rate │
│ 4. Recalculate all amounts with new rates             │
└─────────────────────────────────────────────────────────┘
    ↓
recalculateAllDetailsLocalAndCtyAmounts
    ↓
Update all local and country amounts
    ↓
Update header totals
```

## 4. GST CALCULATION FLOW

```
User Changes GST Percentage or Amount
    ↓
handleGstChange (invoice-details-form.tsx)
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

## 5. QUANTITY/PRICE CHANGE FLOW

```
User Changes Quantity or Price
    ↓
handleQtyPriceChange (invoice-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Amount Calculation Logic:                              │
│ 1. Calculate totAmt = qty * price                      │
│ 2. Calculate gstAmt = totAmt * gstPercentage / 100    │
│ 3. Calculate totAmtAftGst = totAmt + gstAmt           │
│ 4. Calculate local amounts with exchange rate          │
│ 5. Calculate country amounts with city exchange rate    │
└─────────────────────────────────────────────────────────┘
    ↓
Update item amounts
    ↓
Recalculate totals
    ↓
Update header amounts
```

## 6. CORE CALCULATION FUNCTIONS

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
calculateCtyAmounts
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
recalculateAllDetailsLocalAndCtyAmounts
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

## 7. HELPER FUNCTIONS

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
│ - Get city currency exchange rate from API             │
│ - Set cityExchangeRate in form                         │
└─────────────────────────────────────────────────────────┘
```

### C. GST Percentage Setup

```
setGSTPercentage
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, customerId                               │
│ Output: Sets gstPercentage in form                     │
│                                                         │
│ Logic:                                                  │
│ - Get customer GST percentage from API                  │
│ - Set gstPercentage in form                            │
└─────────────────────────────────────────────────────────┘
```

## 8. FORM UPDATE SEQUENCES

### A. Standard Invoice Mode

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

## 9. DEPENDENCY CHAIN

```
Exchange Rate Change
    ↓
recalculateAllDetailsLocalAndCtyAmounts
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
recalculateAllDetailsLocalAndCtyAmounts
    ↓
Update all amounts with new rates
    ↓
Update header totals
```

## 10. KEY DECISION POINTS

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

## 11. ADD/EDIT/DELETE DETAILS FLOW

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

## 12. CUSTOMER CHANGE FLOW

```
User Changes Customer
    ↓
handleCustomerChange (invoice-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Customer Setup Logic:                                  │
│ 1. Set currencyId = customer.currencyId                │
│ 2. Set exchangeRate = customer's exchange rate        │
│ 3. Set gstPercentage = customer's GST percentage       │
│ 4. Set address and contact details                     │
│ 5. Set due date based on credit terms                  │
└─────────────────────────────────────────────────────────┘
    ↓
Recalculate all amounts with new currency
    ↓
Update header totals
```

## 13. CREDIT TERMS CHANGE FLOW

```
User Changes Credit Terms
    ↓
handleCreditTermsChange (invoice-form.tsx)
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

## 14. BANK CHANGE FLOW

```
User Changes Bank
    ↓
handleBankChange (invoice-form.tsx)
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

## 15. FORM VALIDATION FLOW

```
User Submits Form
    ↓
Form Validation
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Checks:                                     │
│ - Required fields validation                           │
│ - Amount calculations validation                       │
│ - Currency consistency validation                      │
│ - GST calculations validation                          │
│ - Exchange rate validation                            │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Submit form data
    → Show success message
ELSE:
    → Show validation errors
    → Prevent submission
```

This flowchart shows the complete interaction between all functions in the AR Invoice system, including the decision points, calculation sequences, and form update logic for invoice creation, editing, and management.
