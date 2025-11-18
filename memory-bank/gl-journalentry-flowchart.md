# GL Journal Entry System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (journalentry-form.tsx)
    ↓
recalculateAllDetailsLocalAndCtyAmounts (gl-journalentry-calculations.ts)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH JOURNAL ITEM:                                  │
│ 1. Calculate totLocalAmt = totAmt * newExhRate        │
│ 2. Calculate gstLocalAmt = gstAmt * newExhRate        │
│ 3. Calculate totLocalAmtAftGst = totLocalAmt + gstLocalAmt │
│ 4. Calculate ctyAmt = totAmt * countryExhRate             │
│ 5. Calculate ctyGstAmt = gstAmt * countryExhRate         │
│ 6. Calculate ctyTotAmtAftGst = ctyAmt + ctyGstAmt     │
└─────────────────────────────────────────────────────────┘
    ↓
Update Header Amounts:
- totLocalAmt = sum of all debit totLocalAmt
- gstLocalAmt = sum of all debit gstLocalAmt
- totLocalAmtAftGst = sum of all debit totLocalAmtAftGst
- ctyAmt = sum of all debit ctyAmt
- ctyGstAmt = sum of all debit ctyGstAmt
- ctyTotAmtAftGst = sum of all debit ctyTotAmtAftGst
    ↓
Update Form Values (journalentry-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW

```
User Edits Cell (totAmt, gstAmt, isDebit, etc.)
    ↓
handleCellEdit (journalentry-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 1: Update Specific Item                        │
│ - If totAmt: Recalculate gstAmt, totAmtAftGst         │
│ - If gstAmt: Recalculate totAmtAftGst                  │
│ - If isDebit: Toggle debit/credit flag                 │
│ - If exchangeRate: Recalculate all local amounts       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 2: Calculate Total Amounts (Debit Only)       │
│ - totAmt = sum of all debit totAmt                     │
│ - gstAmt = sum of all debit gstAmt                     │
│ - totAmtAftGst = sum of all debit totAmtAftGst         │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 3: Calculate Local Amounts (Debit Only)      │
│ - totLocalAmt = sum of all debit totLocalAmt           │
│ - gstLocalAmt = sum of all debit gstLocalAmt          │
│ - totLocalAmtAftGst = sum of all debit totLocalAmtAftGst │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 4: Calculate Country Amounts (Debit Only)    │
│ - ctyAmt = sum of all debit ctyAmt                     │
│ - ctyGstAmt = sum of all debit ctyGstAmt              │
│ - ctyTotAmtAftGst = sum of all debit ctyTotAmtAftGst   │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 5: Validate Debit/Credit Balance              │
│ - Check totalDebit === totalCredit                    │
│ - Show error if not balanced                          │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 6: Update Form Values                         │
│ - Update all header amounts                           │
│ - Update all local amounts                            │
│ - Update all country amounts (if enabled)              │
└─────────────────────────────────────────────────────────┘
```

## 3. CURRENCY CHANGE FLOW

```
User Changes Currency
    ↓
handleCurrencyChange (journalentry-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Currency Setup Logic:                                  │
│ 1. Set currencyId = selectedCurrency.currencyId        │
│ 2. Set exchangeRate = currency's exchange rate        │
│ 3. Set countryExchangeRate = currency's city exchange rate │
│ 4. Recalculate all amounts with new rates             │
└─────────────────────────────────────────────────────────┘
    ↓
recalculateAllDetailsLocalAndCtyAmounts
    ↓
Update all local and country amounts
    ↓
Update header totals
```

## 4. GL ACCOUNT CHANGE FLOW

```
User Changes GL Account
    ↓
handleGLAccountChange (journalentry-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ GL Account Setup Logic:                                │
│ 1. Set glId = selectedGLAccount.glId                  │
│ 2. Set glCode = selectedGLAccount.glCode                │
│ 3. Set glName = selectedGLAccount.glName                │
│ 4. Update account details                              │
└─────────────────────────────────────────────────────────┘
    ↓
Update GL account details
    ↓
Update form fields
```

## 5. DEBIT/CREDIT TOGGLE FLOW

```
User Toggles Debit/Credit Flag
    ↓
handleDebitCreditToggle (journalentry-details-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Debit/Credit Logic:                                    │
│ 1. Set isDebit = toggled value                         │
│ 2. Update debit/credit status                          │
│ 3. Recalculate totals                                 │
│ 4. Validate debit/credit balance                       │
└─────────────────────────────────────────────────────────┘
    ↓
Update debit/credit status
    ↓
Recalculate totals
    ↓
Validate balance
```

## 6. GST CALCULATION FLOW

```
User Changes GST Percentage or Amount
    ↓
handleGstChange (journalentry-details-form.tsx)
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

## 7. CORE CALCULATION FUNCTIONS

### A. Total Amount Calculations (Debit Only)

```
calculateTotalAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, amtDec                           │
│ Output: { totAmt, gstAmt, totAmtAftGst }               │
│                                                         │
│ Formula:                                                │
│ - totAmt = sum of all debit totAmt                     │
│ - gstAmt = sum of all debit gstAmt                     │
│ - totAmtAftGst = totAmt + gstAmt                       │
└─────────────────────────────────────────────────────────┘
```

### B. Local Amount Calculations (Debit Only)

```
calculateLocalAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, locAmtDec                        │
│ Output: { totLocalAmt, gstLocalAmt, totLocalAmtAftGst } │
│                                                         │
│ Formula:                                                │
│ - totLocalAmt = sum of all debit totLocalAmt          │
│ - gstLocalAmt = sum of all debit gstLocalAmt          │
│ - totLocalAmtAftGst = totLocalAmt + gstLocalAmt       │
└─────────────────────────────────────────────────────────┘
```

### C. Country Amount Calculations (Debit Only)

```
calculateCtyAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, ctyAmtDec                        │
│ Output: { ctyAmt, ctyGstAmt, ctyTotAmtAftGst }          │
│                                                         │
│ Formula:                                                │
│ - ctyAmt = sum of all debit ctyAmt                     │
│ - ctyGstAmt = sum of all debit ctyGstAmt              │
│ - ctyTotAmtAftGst = ctyAmt + ctyGstAmt                │
└─────────────────────────────────────────────────────────┘
```

### D. Detail Amount Recalculation

```
recalculateAllDetailsLocalAndCtyAmounts
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: details array, exchangeRate, countryExchangeRate    │
│ Output: updated details array                          │
│                                                         │
│ Formula:                                                │
│ FOR EACH DETAIL:                                        │
│ - totLocalAmt = totAmt * exchangeRate                   │
│ - gstLocalAmt = gstAmt * exchangeRate                  │
│ - totLocalAmtAftGst = totLocalAmt + gstLocalAmt       │
│ - ctyAmt = totAmt * countryExchangeRate                   │
│ - ctyGstAmt = gstAmt * countryExchangeRate                │
│ - ctyTotAmtAftGst = ctyAmt + ctyGstAmt                │
└─────────────────────────────────────────────────────────┘
```

## 8. DEBIT/CREDIT BALANCE VALIDATION FLOW

```
System Validates Debit/Credit Balance
    ↓
validateDebitCreditBalance
    ↓
┌─────────────────────────────────────────────────────────┐
│ Balance Validation Logic:                              │
│ 1. Calculate totalDebit = sum of all debit totAmt     │
│ 2. Calculate totalCredit = sum of all credit totAmt    │
│ 3. Check if totalDebit === totalCredit                │
│ 4. Show error if not balanced                         │
└─────────────────────────────────────────────────────────┘
    ↓
IF balance is valid:
    → Allow journal entry save
    → Proceed with posting
ELSE:
    → Show balance error
    → Prevent save
```

## 9. HELPER FUNCTIONS

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
│ - Set countryExchangeRate if city currency enabled        │
└─────────────────────────────────────────────────────────┘
```

### B. Local Exchange Rate Setup

```
setExchangeRateLocal
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, exhRateDec                               │
│ Output: Sets countryExchangeRate in form                  │
│                                                         │
│ Logic:                                                  │
│ - Get city currency exchange rate from API               │
│ - Set countryExchangeRate in form                         │
└─────────────────────────────────────────────────────────┘
```

### C. GST Percentage Setup

```
setGSTPercentage
    ↓
┌─────────────────────────────────────────────────────────┐
│ Input: form, glId                                     │
│ Output: Sets gstPercentage in form                     │
│                                                         │
│ Logic:                                                  │
│ - Get GL account GST percentage from API                │
│ - Set gstPercentage in form                            │
└─────────────────────────────────────────────────────────┘
```

## 10. FORM UPDATE SEQUENCES

### A. Standard Journal Entry Mode

```
1. Calculate all details with base amounts
2. Update header amounts (debit only):
   - totAmt = sum of all debit totAmt
   - gstAmt = sum of all debit gstAmt
   - totAmtAftGst = totAmt + gstAmt
   - totLocalAmt = sum of all debit totLocalAmt
   - gstLocalAmt = sum of all debit gstLocalAmt
   - totLocalAmtAftGst = totLocalAmt + gstLocalAmt
```

### B. Multi-Currency Mode (Country Currency Enabled)

```
1. Calculate all details with base amounts
2. Update header amounts:
   - Standard amounts (same as above)
   - ctyAmt = sum of all debit ctyAmt
   - ctyGstAmt = sum of all debit ctyGstAmt
   - ctyTotAmtAftGst = ctyAmt + ctyGstAmt
```

## 11. DEPENDENCY CHAIN

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
Validate debit/credit balance
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

## 12. KEY DECISION POINTS

### A. Country Currency Mode Detection

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

### C. Debit/Credit Balance Validation

```
IF totalDebit === totalCredit:
    → Journal entry is balanced
    → Allow save and posting
    → Proceed with operations

IF totalDebit !== totalCredit:
    → Journal entry is unbalanced
    → Show balance error
    → Prevent save and posting
```

### D. Exchange Rate Impact

```
Exchange Rate Change:
    → Recalculate all local amounts with new rate
    → Keep base amounts unchanged
    → Update header local totals
    → Update country amounts (if enabled)
```

## 13. ADD/EDIT/DELETE DETAILS FLOW

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
Validate debit/credit balance
    ↓
Update header totals
    ↓
Update form state
```

## 14. JOURNAL ENTRY VALIDATION FLOW

```
User Validates Journal Entry
    ↓
handleJournalValidation (journalentry-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Logic:                                      │
│ 1. Check totAmt and totLocalAmt are not zero           │
│ 2. Validate debit/credit balance                       │
│ 3. Check currency consistency                          │
│ 4. Verify GST calculations                            │
│ 5. Check exchange rate validation                      │
│ 6. Validate GL account selection                       │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Allow journal entry posting
    → Generate final report
ELSE:
    → Show validation errors
    → Prevent journal entry posting
```

## 15. JOURNAL ENTRY POSTING FLOW

```
User Posts Journal Entry
    ↓
handleJournalPosting (journalentry-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Posting Logic:                                         │
│ 1. Validate all amounts are correct                    │
│ 2. Validate debit/credit balance                       │
│ 3. Calculate final totals                             │
│ 4. Create GL journal entries                           │
│ 5. Update GL account balances                          │
│ 6. Update journal entry status                         │
└─────────────────────────────────────────────────────────┘
    ↓
Create GL journal entries
    ↓
Update GL account balances
    ↓
Update journal entry status
    ↓
Generate posting report
```

## 16. JOURNAL ENTRY REPORTING FLOW

```
User Generates Journal Entry Report
    ↓
handleJournalReporting (journalentry-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Report Generation Logic:                               │
│ 1. Gather journal entry data                           │
│ 2. Calculate journal totals                           │
│ 3. Identify debit/credit amounts                      │
│ 4. Generate report format                              │
└─────────────────────────────────────────────────────────┘
    ↓
Generate journal entry report
    ↓
Export report data
    ↓
Send report notifications
```

## 17. JOURNAL ENTRY ARCHIVE FLOW

```
User Archives Journal Entry
    ↓
handleJournalArchive (journalentry-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Archive Logic:                                         │
│ 1. Finalize journal entry data                         │
│ 2. Update journal entry status                        │
│ 3. Archive journal entry records                      │
│ 4. Generate archive report                             │
└─────────────────────────────────────────────────────────┘
    ↓
Archive journal entry data
    ↓
Update journal entry status
    ↓
Generate archive report
```

## 18. JOURNAL ENTRY REVERSAL FLOW

```
User Reverses Journal Entry
    ↓
handleJournalReversal (journalentry-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Reversal Logic:                                        │
│ 1. Create reversal journal entry                       │
│ 2. Reverse all debit/credit amounts                    │
│ 3. Update GL account balances                          │
│ 4. Mark original entry as reversed                    │
│ 5. Generate reversal report                            │
└─────────────────────────────────────────────────────────┘
    ↓
Create reversal journal entry
    ↓
Update GL account balances
    ↓
Mark original entry as reversed
    ↓
Generate reversal report
```

This flowchart shows the complete interaction between all functions in the GL Journal Entry system, including the decision points, calculation sequences, and form update logic for journal entry management and GL account balance updates.
