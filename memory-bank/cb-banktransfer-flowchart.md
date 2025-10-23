# CB Bank Transfer System - Complete Function Flowchart

## 1. FROM BANK CHANGE FLOW

```
User Changes From Bank
    ↓
handleFromBankChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ From Bank Setup Logic:                                │
│ 1. Set fromBankId = selectedBank.bankId                │
│ 2. Set fromBankCode = selectedBank.bankCode            │
│ 3. Set fromBankName = selectedBank.bankName            │
│ 4. Set fromCurrencyId = selectedBank.currencyId        │
│ 5. Set fromCurrencyCode = selectedBank.currencyCode    │
│ 6. Set fromCurrencyName = selectedBank.currencyName    │
│ 7. Set fromExhRate = selectedBank.exchangeRate          │
│ 8. Set fromBankChgGLId = selectedBank.bankChgGLId       │
└─────────────────────────────────────────────────────────┘
    ↓
Set from bank exchange rate
    ↓
Recalculate from bank amounts
    ↓
Update from bank totals
```

## 2. TO BANK CHANGE FLOW

```
User Changes To Bank
    ↓
handleToBankChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ To Bank Setup Logic:                                   │
│ 1. Set toBankId = selectedBank.bankId                  │
│ 2. Set toBankCode = selectedBank.bankCode              │
│ 3. Set toBankName = selectedBank.bankName              │
│ 4. Set toCurrencyId = selectedBank.currencyId          │
│ 5. Set toCurrencyCode = selectedBank.currencyCode      │
│ 6. Set toCurrencyName = selectedBank.currencyName      │
│ 7. Set toExhRate = selectedBank.exchangeRate            │
│ 8. Set toBankChgGLId = selectedBank.bankChgGLId         │
└─────────────────────────────────────────────────────────┘
    ↓
Set to bank exchange rate
    ↓
Recalculate to bank amounts
    ↓
Update to bank totals
```

## 3. FROM EXCHANGE RATE CHANGE FLOW

```
User Changes From Exchange Rate
    ↓
handleFromExchangeRateChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ From Exchange Rate Logic:                             │
│ 1. Set fromExhRate = new exchange rate                  │
│ 2. Calculate fromTotLocalAmt = fromTotAmt * fromExhRate │
│ 3. Calculate fromBankChgLocalAmt = fromBankChgAmt * fromExhRate │
│ 4. Calculate bankExhRate = fromExhRate / toExhRate      │
│ 5. Calculate bankTotAmt = fromTotAmt * bankExhRate      │
│ 6. Calculate bankTotLocalAmt = bankTotAmt * toExhRate   │
└─────────────────────────────────────────────────────────┘
    ↓
Update from bank local amounts
    ↓
Update bank exchange rate
    ↓
Update bank totals
```

## 4. TO EXCHANGE RATE CHANGE FLOW

```
User Changes To Exchange Rate
    ↓
handleToExchangeRateChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ To Exchange Rate Logic:                                │
│ 1. Set toExhRate = new exchange rate                    │
│ 2. Calculate toTotLocalAmt = toTotAmt * toExhRate      │
│ 3. Calculate toBankChgLocalAmt = toBankChgAmt * toExhRate │
│ 4. Calculate bankExhRate = fromExhRate / toExhRate     │
│ 5. Calculate bankTotAmt = fromTotAmt * bankExhRate      │
│ 6. Calculate bankTotLocalAmt = bankTotAmt * toExhRate │
└─────────────────────────────────────────────────────────┘
    ↓
Update to bank local amounts
    ↓
Update bank exchange rate
    ↓
Update bank totals
```

## 5. FROM TOTAL AMOUNT CHANGE FLOW

```
User Changes From Total Amount
    ↓
handleFromTotalAmountChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ From Total Amount Logic:                               │
│ 1. Set fromTotAmt = new amount                          │
│ 2. Calculate fromTotLocalAmt = fromTotAmt * fromExhRate │
│ 3. Calculate bankExhRate = fromExhRate / toExhRate     │
│ 4. Calculate bankTotAmt = fromTotAmt * bankExhRate     │
│ 5. Calculate bankTotLocalAmt = bankTotAmt * toExhRate  │
│ 6. Calculate toTotAmt = bankTotAmt                     │
│ 7. Calculate toTotLocalAmt = toTotAmt * toExhRate      │
└─────────────────────────────────────────────────────────┘
    ↓
Update from bank amounts
    ↓
Update bank exchange rate
    ↓
Update to bank amounts
    ↓
Update bank totals
```

## 6. TO TOTAL AMOUNT CHANGE FLOW

```
User Changes To Total Amount
    ↓
handleToTotalAmountChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ To Total Amount Logic:                                 │
│ 1. Set toTotAmt = new amount                            │
│ 2. Calculate toTotLocalAmt = toTotAmt * toExhRate      │
│ 3. Calculate bankExhRate = fromExhRate / toExhRate     │
│ 4. Calculate bankTotAmt = toTotAmt / bankExhRate        │
│ 5. Calculate bankTotLocalAmt = bankTotAmt * toExhRate  │
│ 6. Calculate fromTotAmt = bankTotAmt                    │
│ 7. Calculate fromTotLocalAmt = fromTotAmt * fromExhRate │
└─────────────────────────────────────────────────────────┘
    ↓
Update to bank amounts
    ↓
Update bank exchange rate
    ↓
Update from bank amounts
    ↓
Update bank totals
```

## 7. BANK CHARGE CHANGE FLOW

```
User Changes Bank Charge Amount
    ↓
handleBankChargeChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Bank Charge Logic:                                     │
│ 1. Set fromBankChgAmt = new charge amount               │
│ 2. Calculate fromBankChgLocalAmt = fromBankChgAmt * fromExhRate │
│ 3. Set toBankChgAmt = new charge amount                 │
│ 4. Calculate toBankChgLocalAmt = toBankChgAmt * toExhRate │
│ 5. Update bank charge totals                           │
└─────────────────────────────────────────────────────────┘
    ↓
Update bank charge amounts
    ↓
Update bank charge local amounts
    ↓
Update bank charge totals
```

## 8. JOB ORDER CHANGE FLOW

```
User Changes Job Order
    ↓
handleJobOrderChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Job Order Setup Logic:                                 │
│ 1. Set jobOrderId = selectedJobOrder.jobOrderId        │
│ 2. Set jobOrderNo = selectedJobOrder.jobOrderNo        │
│ 3. Set taskId = selectedTask.taskId                    │
│ 4. Set taskName = selectedTask.taskName                │
│ 5. Set serviceId = selectedService.serviceId           │
│ 6. Set serviceName = selectedService.serviceName       │
└─────────────────────────────────────────────────────────┘
    ↓
Update job order details
    ↓
Update task details
    ↓
Update service details
```

## 9. PAYMENT TYPE CHANGE FLOW

```
User Changes Payment Type
    ↓
handlePaymentTypeChange (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Payment Type Logic:                                    │
│ 1. Set paymentTypeId = selectedPaymentType.paymentTypeId │
│ 2. Set paymentTypeName = selectedPaymentType.paymentTypeName │
│ 3. Update payment type details                         │
└─────────────────────────────────────────────────────────┘
    ↓
Update payment type details
    ↓
Update payment type fields
```

## 10. CORE CALCULATION FUNCTIONS

### A. Bank Exchange Rate Calculation

```
calculateBankExchangeRate
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: fromExhRate, toExhRate                         │
│ Output: bankExhRate                                    │
│                                                         │
│ Formula:                                                │
│ - bankExhRate = fromExhRate / toExhRate                │
└─────────────────────────────────────────────────────────┘
```

### B. Bank Total Amount Calculation

```
calculateBankTotalAmount
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: fromTotAmt, bankExhRate                         │
│ Output: bankTotAmt                                     │
│                                                         │
│ Formula:                                                │
│ - bankTotAmt = fromTotAmt * bankExhRate                │
└─────────────────────────────────────────────────────────┘
```

### C. Bank Total Local Amount Calculation

```
calculateBankTotalLocalAmount
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: bankTotAmt, toExhRate                           │
│ Output: bankTotLocalAmt                                 │
│                                                         │
│ Formula:                                                │
│ - bankTotLocalAmt = bankTotAmt * toExhRate              │
└─────────────────────────────────────────────────────────┘
```

### D. Exchange Gain/Loss Calculation

```
calculateExchangeGainLoss
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: fromTotAmt, toTotAmt, fromExhRate, toExhRate    │
│ Output: exhGainLoss                                     │
│                                                         │
│ Formula:                                                │
│ - exhGainLoss = (fromTotAmt * fromExhRate) - (toTotAmt * toExhRate) │
└─────────────────────────────────────────────────────────┘
```

## 11. HELPER FUNCTIONS

### A. From Exchange Rate Setup

```
setFromExchangeRate
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, fromBankId, exhRateDec                    │
│ Output: Sets fromExhRate in form                       │
│                                                         │
│ Logic:                                                  │
│ - Get from bank exchange rate from API                  │
│ - Set fromExhRate in form                                │
│ - Recalculate from bank amounts                        │
└─────────────────────────────────────────────────────────┘
```

### B. To Exchange Rate Setup

```
setToExchangeRate
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, toBankId, exhRateDec                      │
│ Output: Sets toExhRate in form                         │
│                                                         │
│ Logic:                                                  │
│ - Get to bank exchange rate from API                    │
│ - Set toExhRate in form                                │
│ - Recalculate to bank amounts                          │
└─────────────────────────────────────────────────────────┘
```

### C. Bank Charge GL Account Setup

```
setBankChargeGLAccount
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, bankId, glId                              │
│ Output: Sets bankChgGLId in form                       │
│                                                         │
│ Logic:                                                  │
│ - Get bank charge GL account from API                   │
│ - Set bankChgGLId in form                              │
│ - Update bank charge GL account details                 │
└─────────────────────────────────────────────────────────┘
```

## 12. FORM UPDATE SEQUENCES

### A. Standard Bank Transfer Mode

```
1. Calculate from bank amounts
2. Calculate to bank amounts
3. Calculate bank exchange rate
4. Calculate bank totals
5. Update header amounts:
   - fromTotAmt, fromTotLocalAmt
   - toTotAmt, toTotLocalAmt
   - bankTotAmt, bankTotLocalAmt
   - exhGainLoss
```

### B. Multi-Currency Mode

```
1. Calculate from bank amounts with from currency
2. Calculate to bank amounts with to currency
3. Calculate bank exchange rate between currencies
4. Calculate bank totals with exchange rate
5. Update header amounts:
   - Standard amounts (same as above)
   - Currency-specific amounts
   - Exchange rate differences
```

## 13. DEPENDENCY CHAIN

```
From Bank Change
    ↓
Set from bank exchange rate
    ↓
Recalculate from bank amounts
    ↓
Update bank exchange rate
    ↓
Update to bank amounts
    ↓
Update bank totals
```

```
To Bank Change
    ↓
Set to bank exchange rate
    ↓
Recalculate to bank amounts
    ↓
Update bank exchange rate
    ↓
Update from bank amounts
    ↓
Update bank totals
```

```
From Total Amount Change
    ↓
Update from bank amounts
    ↓
Update bank exchange rate
    ↓
Update to bank amounts
    ↓
Update bank totals
```

## 14. KEY DECISION POINTS

### A. Currency Difference Detection

```
IF fromCurrencyId !== toCurrencyId:
    → Multi-Currency Transfer
    → Enable exchange rate fields
    → Calculate exchange differences
    → Show exchange gain/loss

IF fromCurrencyId === toCurrencyId:
    → Same Currency Transfer
    → Disable exchange rate fields
    → Set exchange rate to 1
    → Hide exchange gain/loss
```

### B. Bank Charge Calculation

```
IF fromBankChgAmt > 0:
    → Calculate from bank charge local amount
    → Update from bank charge totals
    → Show from bank charge fields

IF toBankChgAmt > 0:
    → Calculate to bank charge local amount
    → Update to bank charge totals
    → Show to bank charge fields
```

### C. Exchange Rate Impact

```
From Exchange Rate Change:
    → Recalculate from bank local amounts
    → Update bank exchange rate
    → Recalculate to bank amounts
    → Update bank totals

To Exchange Rate Change:
    → Recalculate to bank local amounts
    → Update bank exchange rate
    → Recalculate from bank amounts
    → Update bank totals
```

## 15. BANK TRANSFER VALIDATION FLOW

```
User Validates Bank Transfer
    ↓
handleBankTransferValidation (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Logic:                                      │
│ 1. Check fromTotAmt and fromTotLocalAmt are not zero   │
│ 2. Check toTotAmt and toTotLocalAmt are not zero       │
│ 3. Validate exchange rates are greater than 0         │
│ 4. Check currency consistency                          │
│ 5. Verify bank charge calculations                     │
│ 6. Check exchange gain/loss calculations              │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Allow bank transfer posting
    → Generate final report
ELSE:
    → Show validation errors
    → Prevent bank transfer posting
```

## 16. BANK TRANSFER POSTING FLOW

```
User Posts Bank Transfer
    ↓
handleBankTransferPosting (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Posting Logic:                                         │
│ 1. Validate all amounts are correct                    │
│ 2. Calculate final exchange differences               │
│ 3. Create GL journal entries                           │
│ 4. Update bank account balances                        │
│ 5. Update bank transfer status                         │
└─────────────────────────────────────────────────────────┘
    ↓
Create GL journal entries
    ↓
Update bank account balances
    ↓
Update bank transfer status
    ↓
Generate posting report
```

## 17. BANK TRANSFER REPORTING FLOW

```
User Generates Bank Transfer Report
    ↓
handleBankTransferReporting (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Report Generation Logic:                               │
│ 1. Gather bank transfer data                           │
│ 2. Calculate bank transfer totals                     │
│ 3. Identify exchange differences                      │
│ 4. Generate report format                              │
└─────────────────────────────────────────────────────────┘
    ↓
Generate bank transfer report
    ↓
Export report data
    ↓
Send report notifications
```

## 18. BANK TRANSFER ARCHIVE FLOW

```
User Archives Bank Transfer
    ↓
handleBankTransferArchive (cbbanktransfer-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Archive Logic:                                         │
│ 1. Finalize bank transfer data                         │
│ 2. Update bank transfer status                        │
│ 3. Archive bank transfer records                       │
│ 4. Generate archive report                             │
└─────────────────────────────────────────────────────────┘
    ↓
Archive bank transfer data
    ↓
Update bank transfer status
    ↓
Generate archive report
```

This flowchart shows the complete interaction between all functions in the CB Bank Transfer system, including the decision points, calculation sequences, and form update logic for bank transfer management and multi-currency bank operations.
