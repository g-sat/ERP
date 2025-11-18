# CB Batch Payment System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (cbbatchpayment-form.tsx)
    ↓
recalculateAllDetailsLocalAndCtyAmounts (cb-batchpayment-calculations.ts)
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
Update Form Values (cbbatchpayment-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW

```
User Edits Cell (totAmt, gstAmt, qty, price, etc.)
    ↓
handleCellEdit (cbbatchpayment-details-form.tsx)
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
handleCurrencyChange (cbbatchpayment-form.tsx)
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

## 4. BANK CHANGE FLOW

```
User Changes Bank
    ↓
handleBankChange (cbbatchpayment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Bank Setup Logic:                                      │
│ 1. Set bankId = selectedBank.bankId                    │
│ 2. Set bank account details                            │
│ 3. Update payment information                          │
│ 4. Update bank-related fields                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update bank-related form fields
```

## 5. GST CALCULATION FLOW

```
User Changes GST Percentage or Amount
    ↓
handleGstChange (cbbatchpayment-details-form.tsx)
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

## 6. QUANTITY/PRICE CHANGE FLOW

```
User Changes Quantity or Price
    ↓
handleQtyPriceChange (cbbatchpayment-details-form.tsx)
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

## 7. CORE CALCULATION FUNCTIONS

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

## 8. HELPER FUNCTIONS

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
│ Input: form, supplierId                               │
│ Output: Sets gstPercentage in form                     │
│                                                         │
│ Logic:                                                  │
│ - Get supplier GST percentage from API                  │
│ - Set gstPercentage in form                            │
└─────────────────────────────────────────────────────────┘
```

## 9. FORM UPDATE SEQUENCES

### A. Standard Batch Payment Mode

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

## 10. DEPENDENCY CHAIN

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

## 11. KEY DECISION POINTS

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

## 12. ADD/EDIT/DELETE DETAILS FLOW

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

## 13. SUPPLIER CHANGE FLOW

```
User Changes Supplier
    ↓
handleSupplierChange (cbbatchpayment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Supplier Setup Logic:                                  │
│ 1. Set supplierId = selectedSupplier.supplierId        │
│ 2. Set currencyId = supplier.currencyId                │
│ 3. Set exchangeRate = supplier's exchange rate        │
│ 4. Set gstPercentage = supplier's GST percentage       │
│ 5. Set address and contact details                     │
└─────────────────────────────────────────────────────────┘
    ↓
Recalculate all amounts with new currency
    ↓
Update header totals
```

## 14. JOB ORDER/SERVICE/TASK SELECTION FLOW

```
User Selects Job Order/Service/Task
    ↓
handleJobOrderChange / handleServiceChange / handleTaskChange
    ↓
┌─────────────────────────────────────────────────────────┐
│ Job Order Logic:                                       │
│ 1. Set jobOrderId = selectedJobOrder.jobOrderId        │
│ 2. Set serviceId = selectedService.serviceId           │
│ 3. Set taskId = selectedTask.taskId                    │
│ 4. Set default amounts and rates                       │
│ 5. Update related fields (vessel, voyage, port, etc.)  │
└─────────────────────────────────────────────────────────┘
    ↓
Update detail amounts
    ↓
Recalculate totals
```

## 15. VESSEL/VOYAGE/PORT SELECTION FLOW

```
User Selects Vessel/Voyage/Port
    ↓
handleVesselChange / handleVoyageChange / handlePortChange
    ↓
┌─────────────────────────────────────────────────────────┐
│ Vessel Logic:                                          │
│ 1. Set vesselId = selectedVessel.vesselId              │
│ 2. Set voyageId = selectedVoyage.voyageId              │
│ 3. Set portId = selectedPort.portId                    │
│ 4. Update related job order information                │
│ 5. Set default amounts based on vessel/voyage          │
└─────────────────────────────────────────────────────────┘
    ↓
Update detail amounts
    ↓
Recalculate totals
```

## 16. EMPLOYEE/DEPARTMENT SELECTION FLOW

```
User Selects Employee/Department
    ↓
handleEmployeeChange / handleDepartmentChange
    ↓
┌─────────────────────────────────────────────────────────┐
│ Employee Logic:                                        │
│ 1. Set employeeId = selectedEmployee.employeeId        │
│ 2. Set departmentId = selectedDepartment.departmentId  │
│ 3. Set default rates and amounts                       │
│ 4. Update related fields                               │
└─────────────────────────────────────────────────────────┘
    ↓
Update detail amounts
    ↓
Recalculate totals
```

## 17. FORM VALIDATION FLOW

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
│ - Job order/service/task validation                   │
│ - Vessel/voyage/port validation                       │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Submit form data
    → Show success message
ELSE:
    → Show validation errors
    → Prevent submission
```

## 18. BATCH PROCESSING FLOW

```
User Initiates Batch Processing
    ↓
handleBatchProcessing (cbbatchpayment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Batch Processing Logic:                                │
│ 1. Validate all details                                │
│ 2. Calculate total amounts                             │
│ 3. Generate batch payment records                      │
│ 4. Create payment transactions                         │
│ 5. Update supplier balances                            │
│ 6. Generate payment confirmations                     │
└─────────────────────────────────────────────────────────┘
    ↓
Update payment status
    ↓
Generate payment reports
    ↓
Send notifications
```

## 19. PAYMENT APPROVAL FLOW

```
User Approves Payment
    ↓
handlePaymentApproval (cbbatchpayment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Approval Logic:                                        │
│ 1. Check approval limits                               │
│ 2. Validate payment amounts                            │
│ 3. Update approval status                              │
│ 4. Generate approval records                           │
│ 5. Send approval notifications                         │
└─────────────────────────────────────────────────────────┘
    ↓
Update payment status
    ↓
Generate approval reports
```

## 20. PAYMENT EXECUTION FLOW

```
User Executes Payment
    ↓
handlePaymentExecution (cbbatchpayment-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Execution Logic:                                       │
│ 1. Validate payment details                            │
│ 2. Process bank transactions                           │
│ 3. Update supplier accounts                            │
│ 4. Generate payment confirmations                     │
│ 5. Update payment status                               │
└─────────────────────────────────────────────────────────┘
    ↓
Update payment records
    ↓
Generate execution reports
    ↓
Send payment confirmations
```

This flowchart shows the complete interaction between all functions in the CB Batch Payment system, including the decision points, calculation sequences, and form update logic for batch payment creation, editing, and management.
