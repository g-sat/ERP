# CB Bank Reconciliation System - Complete Function Flowchart

## 1. EXCHANGE RATE CHANGE FLOW

```
User Changes exhRate
    ↓
handleExchangeRateChange (cbbankrecon-form.tsx)
    ↓
recalculateAllDetailsLocalAndCtyAmounts (cb-bankrecon-calculations.ts)
    ↓
┌─────────────────────────────────────────────────────────┐
│ FOR EACH RECONCILIATION ITEM:                          │
│ 1. Calculate totLocalAmt = totAmt * newExhRate        │
│ 2. Calculate ctyAmt = totAmt * countryExhRate             │
│ 3. Update reconciliation amounts                       │
└─────────────────────────────────────────────────────────┘
    ↓
Update Header Amounts:
- totLocalAmt = sum of all totLocalAmt
- ctyAmt = sum of all ctyAmt
    ↓
Update Form Values (cbbankrecon-form.tsx)
```

## 2. ON EDIT (Cell Edit) FLOW

```
User Edits Cell (totAmt, totLocalAmt, etc.)
    ↓
handleCellEdit (cbbankrecon-details-table.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 1: Update Specific Item                        │
│ - If totAmt: Recalculate totLocalAmt, ctyAmt          │
│ - If totLocalAmt: Update local amount                  │
│ - If exchangeRate: Recalculate all local amounts       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 2: Calculate Total Amounts                    │
│ - totAmt = sum of all totAmt                           │
│ - totLocalAmt = sum of all totLocalAmt                 │
│ - ctyAmt = sum of all ctyAmt                           │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ SEQUENCE 3: Update Form Values                         │
│ - Update all header amounts                           │
│ - Update reconciliation status                        │
└─────────────────────────────────────────────────────────┘
```

## 3. CURRENCY CHANGE FLOW

```
User Changes Currency
    ↓
handleCurrencyChange (cbbankrecon-form.tsx)
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

## 4. BANK CHANGE FLOW

```
User Changes Bank
    ↓
handleBankChange (cbbankrecon-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Bank Setup Logic:                                      │
│ 1. Set bankId = selectedBank.bankId                    │
│ 2. Set bank account details                            │
│ 3. Load bank statement data                           │
│ 4. Update reconciliation period                        │
└─────────────────────────────────────────────────────────┘
    ↓
Load bank statement
    ↓
Update reconciliation data
```

## 5. RECONCILIATION MATCHING FLOW

```
User Matches Transactions
    ↓
handleReconciliationMatching (cbbankrecon-details-table.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Matching Logic:                                        │
│ 1. Compare bank statement with GL transactions        │
│ 2. Identify matching amounts and dates                │
│ 3. Mark items as reconciled                           │
│ 4. Calculate reconciliation differences               │
└─────────────────────────────────────────────────────────┘
    ↓
Update reconciliation status
    ↓
Calculate reconciliation totals
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
│ Output: { totAmt }                                     │
│                                                         │
│ Formula:                                                │
│ - totAmt = sum of all totAmt                           │
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
│ - totLocalAmt = sum of all totLocalAmt                │
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

## 7. RECONCILIATION STATUS FLOW

```
User Updates Reconciliation Status
    ↓
handleStatusChange (cbbankrecon-details-table.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Status Update Logic:                                   │
│ 1. Set reconciliation status (Reconciled/Unreconciled) │
│ 2. Update reconciliation date                          │
│ 3. Calculate status totals                            │
│ 4. Update header amounts                               │
└─────────────────────────────────────────────────────────┘
    ↓
Update reconciliation summary
    ↓
Calculate reconciliation differences
```

## 8. BANK STATEMENT IMPORT FLOW

```
User Imports Bank Statement
    ↓
handleBankStatementImport (cbbankrecon-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Import Logic:                                          │
│ 1. Parse bank statement file                          │
│ 2. Extract transaction data                           │
│ 3. Create reconciliation items                         │
│ 4. Match with existing GL transactions                │
└─────────────────────────────────────────────────────────┘
    ↓
Create reconciliation details
    ↓
Update form data
    ↓
Recalculate totals
```

## 9. RECONCILIATION DIFFERENCES FLOW

```
System Calculates Differences
    ↓
calculateReconciliationDifferences
    ↓
┌─────────────────────────────────────────────────────────┐
│ Difference Calculation Logic:                          │
│ 1. Compare bank statement vs GL totals                 │
│ 2. Identify unreconciled items                        │
│ 3. Calculate difference amounts                        │
│ 4. Flag discrepancies                                 │
└─────────────────────────────────────────────────────────┘
    ↓
Update reconciliation summary
    ↓
Show difference report
```

## 10. RECONCILIATION CLOSE FLOW

```
User Closes Reconciliation
    ↓
handleReconciliationClose (cbbankrecon-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Close Logic:                                           │
│ 1. Validate all items are reconciled                  │
│ 2. Calculate final reconciliation totals              │
│ 3. Update reconciliation status                       │
│ 4. Generate reconciliation report                     │
└─────────────────────────────────────────────────────────┘
    ↓
Update reconciliation status
    ↓
Generate final report
    ↓
Archive reconciliation
```

## 11. DEPENDENCY CHAIN

```
Exchange Rate Change
    ↓
recalculateAllDetailsLocalAndCtyAmounts
    ↓
Update all local amounts (totLocalAmt, ctyAmt)
    ↓
Update header totals
```

```
Cell Edit
    ↓
Calculate item amounts (totAmt, totLocalAmt, ctyAmt)
    ↓
Update header totals
```

```
Reconciliation Matching
    ↓
Update reconciliation status
    ↓
Calculate reconciliation totals
    ↓
Update header amounts
```

## 12. KEY DECISION POINTS

### A. Reconciliation Status Detection

```
IF item.status === "Reconciled":
    → Include in reconciled totals
    → Mark as matched
    → Update reconciliation date

IF item.status === "Unreconciled":
    → Include in unreconciled totals
    → Mark as unmatched
    → Flag for review
```

### B. Bank Statement Matching

```
IF bankAmount === glAmount AND bankDate === glDate:
    → Auto-match items
    → Set status to "Reconciled"
    → Update reconciliation date

IF bankAmount !== glAmount OR bankDate !== glDate:
    → Flag as discrepancy
    → Set status to "Unreconciled"
    → Require manual review
```

### C. Exchange Rate Impact

```
Exchange Rate Change:
    → Recalculate all local amounts with new rate
    → Keep base amounts unchanged
    → Update header local totals
    → Update country amounts (if enabled)
```

## 13. RECONCILIATION REPORTING FLOW

```
User Generates Reconciliation Report
    ↓
handleReconciliationReport (cbbankrecon-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Report Generation Logic:                              │
│ 1. Gather reconciliation data                          │
│ 2. Calculate reconciliation totals                    │
│ 3. Identify discrepancies                             │
│ 4. Generate report format                             │
└─────────────────────────────────────────────────────────┘
    ↓
Generate reconciliation report
    ↓
Export report data
    ↓
Send report notifications
```

## 14. RECONCILIATION VALIDATION FLOW

```
User Validates Reconciliation
    ↓
handleReconciliationValidation (cbbankrecon-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Logic:                                      │
│ 1. Check all items are reconciled                     │
│ 2. Validate reconciliation totals                     │
│ 3. Check for discrepancies                            │
│ 4. Verify reconciliation period                        │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Allow reconciliation close
    → Generate final report
ELSE:
    → Show validation errors
    → Prevent reconciliation close
```

## 15. RECONCILIATION ARCHIVE FLOW

```
User Archives Reconciliation
    ↓
handleReconciliationArchive (cbbankrecon-form.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Archive Logic:                                         │
│ 1. Finalize reconciliation data                         │
│ 2. Update reconciliation status                        │
│ 3. Archive reconciliation records                      │
│ 4. Generate archive report                            │
└─────────────────────────────────────────────────────────┘
    ↓
Archive reconciliation data
    ↓
Update reconciliation status
    ↓
Generate archive report
```

This flowchart shows the complete interaction between all functions in the CB Bank Reconciliation system, including the decision points, calculation sequences, and form update logic for bank reconciliation management.
