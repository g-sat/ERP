# AP Invoice Module - Complete Documentation

## 📚 Table of Contents

1. [Module Overview](#module-overview)
2. [All User Scenarios](#all-user-scenarios)
3. [Function Call Flows](#function-call-flows)
4. [API Endpoints](#api-endpoints)
5. [State Management](#state-management)
6. [Button Behaviors](#button-behaviors)
7. [Component Architecture](#component-apchitecture)
8. [Data Flow](#data-flow)
9. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## Module Overview

### Files Structure

```
app/(root)/[companyId]/ap/invoice/
├── page.tsx                          # Main invoice page
├── components/
│   ├── main-tab.tsx                 # Main tab with header + details
│   ├── other.tsx                    # Other tab
│   ├── history.tsx                  # History tab
│   ├── invoice-table.tsx            # Invoice list table
│   ├── invoice-details-form.tsx     # Detail line form
│   ├── invoice-details-table.tsx    # Detail lines table
│   ├── invoice-header-form.tsx      # Header form
│   ├── invoice-defaultvalues.ts     # Default values
│   └── history/
│       ├── account-details.tsx
│       └── edit-version-details.tsx
```

### Key Technologies

- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Zustand** - Global state (auth, decimals)
- **React Query** - API data fetching & caching
- **TanStack Table** - Data table display
- **Sonner** - Toast notifications

---

## All User Scenarios

### Scenario 1: Creating New Invoice (Fresh Start)

**User Actions:**

1. User opens the invoice page
2. Page loads with empty form (invoiceId = "0")
3. User fills in header fields (supplier, dates, currency, etc.)
4. User adds invoice detail lines
5. User clicks "Save"
6. System saves invoice and displays saved data

**Expected Results:**

- ✅ Form displays with default values
- ✅ All buttons disabled except "Save"
- ✅ After adding details, "Reset" enabled
- ✅ After save, invoice shows with new invoiceId from backend
- ✅ Print, Clone, Delete buttons become enabled
- ✅ Toast shows: "Invoice INV-XXX saved successfully"

**Function Call Flow:**

```
Page Load
  ↓
useGetVisibleFields() → Fetch field visibility settings
useGetRequiredFields() → Fetch field requirements
  ↓
form.reset(defaultInvoice) → Initialize form
  ↓
User fills data
  ↓
User clicks Save
  ↓
handleSaveInvoice()
  ├── form.getValues() → Get form data
  ├── transformToSchemaType() → Transform to API format
  ├── apinvoiceHdSchema.safeParse() → Validate
  ├── saveMutation.mutateAsync() → POST to API
  ├── transformToSchemaType() → Transform response
  ├── setInvoice() → Update state
  ├── form.reset() → Reset form with saved data
  ├── toast.success() → Show success message
  └── refetchInvoices() → Refresh invoice list
```

---

### Scenario 2: Loading Existing Invoice from List

**User Actions:**

1. User clicks "List" button (or Ctrl+L)
2. Invoice list dialog opens with date filters
3. User searches/filters invoices
4. User clicks on an invoice row
5. System loads complete invoice data

**Expected Results:**

- ✅ List dialog shows with spinner initially
- ✅ Table displays invoices after loading
- ✅ On row click, spinner shows "Loading invoice details..."
- ✅ Form populates with all header and detail data
- ✅ Dialog closes automatically
- ✅ All buttons enabled (Print, Reset, Clone, Delete)
- ✅ Toast shows: "Invoice INV-XXX loaded successfully"

**Function Call Flow:**

```
User clicks "List"
  ↓
setShowListDialog(true)
  ↓
useEffect (filters change)
  ↓
refetchInvoices()
  ↓
useGetWithDates() → GET invoice list from API
  ↓
InvoiceTable renders with data
  ↓
User clicks row
  ↓
handleInvoiceSelect(selectedInvoice)
  ├── setIsSelectingInvoice(true) → Show loading
  ├── getById() → GET invoice details from API
  ├── transformToSchemaType() → Transform data
  ├── setInvoice() → Update state
  ├── form.reset() → Reset form with data
  ├── form.trigger() → Trigger validation
  ├── setShowListDialog(false) → Close dialog
  ├── toast.success() → Show message
  └── setIsSelectingInvoice(false) → Hide loading
```

---

### Scenario 3: Loading Invoice by Search Number

**User Actions:**

1. User types invoice number in search field
2. User presses Enter or field loses focus
3. Load confirmation dialog appears
4. User confirms load
5. System searches and loads invoice

**Expected Results:**

- ✅ Search input shows typed number
- ✅ Confirmation dialog asks: "Do you want to load Invoice XXX?"
- ✅ On confirm, spinner shows on Load button
- ✅ Invoice loads with all data
- ✅ Dialog closes automatically
- ✅ Toast shows: "Invoice XXX loaded successfully"

**Function Call Flow:**

```
User types in search field
  ↓
onBlur or onKeyDown (Enter)
  ↓
setShowLoadConfirm(true)
  ↓
User clicks "Load" in confirmation
  ↓
handleInvoiceSearch(searchNo)
  ├── setIsLoadingInvoice(true) → Show loading
  ├── getById() → GET by invoice number
  ├── transformToSchemaType() → Transform data
  ├── setInvoice() → Update state
  ├── form.reset() → Reset form with data
  ├── form.trigger() → Trigger validation
  ├── setShowLoadConfirm(false) → Close dialog
  ├── toast.success() → Show message
  └── setIsLoadingInvoice(false) → Hide loading
```

---

### Scenario 4: Editing Existing Invoice

**User Actions:**

1. User loads an invoice (via List or Search)
2. User modifies header or detail fields
3. User clicks "Save"
4. System updates invoice

**Expected Results:**

- ✅ Form shows current invoice data
- ✅ Title shows: "Invoice (Edit) - INV-XXX"
- ✅ Search field is disabled
- ✅ User can modify any field
- ✅ After save, form shows updated data
- ✅ Toast shows: "Invoice updated successfully"

**Function Call Flow:**

```
Invoice loaded (invoiceId ≠ "0")
  ↓
User modifies data
  ↓
form.formState.isDirty = true
  ↓
User clicks Save
  ↓
handleSaveInvoice()
  ├── form.getValues() → Get form data
  ├── transformToSchemaType() → Transform to API format
  ├── apinvoiceHdSchema.safeParse() → Validate
  ├── updateMutation.mutateAsync() → PUT to API
  ├── transformToSchemaType() → Transform response
  ├── setInvoice() → Update state
  ├── form.reset() → Reset form with updated data
  ├── toast.success() → Show "updated" message
  └── refetchInvoices() → Refresh invoice list
```

---

### Scenario 5: Cloning Invoice

**User Actions:**

1. User loads an existing invoice
2. User clicks "Clone" button
3. Confirmation dialog appears
4. User confirms clone
5. System creates a copy as new invoice

**Expected Results:**

- ✅ Clone button enabled only for saved invoices
- ✅ Confirmation dialog asks: "Clone Invoice INV-XXX?"
- ✅ After clone, invoiceId = "0", invoiceNo = ""
- ✅ All amounts reset to 0
- ✅ Detail lines cleared
- ✅ Print, Clone, Delete buttons disabled
- ✅ Save, Reset buttons enabled
- ✅ Title shows: "Invoice (New)"
- ✅ Toast shows: "Invoice cloned successfully"

**Function Call Flow:**

```
User clicks "Clone"
  ↓
setShowCloneConfirm(true)
  ↓
User confirms
  ↓
handleCloneInvoice()
  ├── Create clonedInvoice object
  │   ├── invoiceId = "0"
  │   ├── invoiceNo = ""
  │   ├── All amounts = 0
  │   └── data_details = []
  ├── setInvoice(clonedInvoice) → Update state
  ├── form.reset(clonedInvoice) → Reset form
  └── toast.success() → Show message
```

---

### Scenario 6: Deleting Invoice

**User Actions:**

1. User loads an existing invoice
2. User clicks "Delete" button
3. Confirmation dialog appears
4. User confirms deletion
5. System deletes invoice and clears form

**Expected Results:**

- ✅ Delete button enabled only for saved invoices
- ✅ Confirmation dialog shows warning
- ✅ On confirm, Delete button shows spinner
- ✅ Invoice deleted from database
- ✅ Form clears to default values
- ✅ Search field clears
- ✅ All buttons disabled except Save
- ✅ Toast shows: "Invoice deleted successfully" (from API)

**Function Call Flow:**

```
User clicks "Delete"
  ↓
setShowDeleteConfirm(true)
  ↓
User confirms
  ↓
handleInvoiceDelete()
  ├── deleteMutation.mutateAsync() → DELETE from API
  ├── Check response.result === 1
  ├── setInvoice(null) → Clear state
  ├── setSearchNo("") → Clear search
  ├── form.reset(defaultInvoice) → Reset form
  ├── refetchInvoices() → Refresh list
  └── (Toast from API response)
```

---

### Scenario 7: Resetting Invoice

**User Actions:**

1. User has invoice data in form
2. User clicks "Reset" button
3. Confirmation dialog appears
4. User confirms reset
5. System clears form to default state

**Expected Results:**

- ✅ Reset button enabled when invoice exists
- ✅ Confirmation dialog warns: "This will clear all unsaved changes"
- ✅ Form clears to default values
- ✅ Search field clears
- ✅ All buttons disabled except Save
- ✅ Toast shows: "Invoice reset successfully"

**Function Call Flow:**

```
User clicks "Reset"
  ↓
setShowResetConfirm(true)
  ↓
User confirms
  ↓
handleInvoiceReset()
  ├── setInvoice(null) → Clear state
  ├── setSearchNo("") → Clear search
  ├── form.reset(defaultInvoice) → Reset form
  └── toast.success() → Show message
```

---

### Scenario 8: Adding Invoice Detail Line

**User Actions:**

1. User fills in detail form fields
2. User clicks "Add" button in detail form
3. System validates and adds line to table

**Expected Results:**

- ✅ Detail form has its own validation
- ✅ On success, row added to details table
- ✅ Form resets with next itemNo
- ✅ Toast shows: "Row X added successfully"

**Function Call Flow:**

```
User fills detail form
  ↓
User clicks "Add"
  ↓
InvoiceDetailsForm.onSubmit()
  ├── form.getValues() → Get detail data
  ├── Manually set updated values (qty, unitPrice, etc.)
  ├── apinvoiceDtSchema.safeParse() → Validate
  ├── handleQtyChange() → Calculate amounts
  │   ├── totAmt = billQTY × unitPrice
  │   ├── handleTotalamountChange()
  │   │   ├── totLocalAmt = totAmt × exhRate
  │   │   ├── handleTotalCountryamountChange()
  │   │   └── handleGstPercentageChange()
  │   │       ├── gstAmt = totAmt × gstPercentage
  │   │       ├── gstLocalAmt = gstAmt × exhRate
  │   │       └── handleGstCityPercentageChange()
  │   └── All amounts set in rowData
  ├── onAddRowAction(rowData) → Callback to parent
  ├── Parent updates form.setValue("data_details")
  ├── toast.success() → Show message
  └── form.reset(nextDefaults) → Reset for next entry
```

---

### Scenario 9: Editing Invoice Detail Line

**User Actions:**

1. User clicks "Edit" icon on a detail row
2. Detail form populates with row data
3. User modifies fields
4. User clicks "Update" button
5. System validates and updates row

**Expected Results:**

- ✅ Detail form shows existing data
- ✅ Form title shows: "Details (Edit - Item X)"
- ✅ "Update" and "Cancel" buttons appear
- ✅ On update, row updates in table
- ✅ Form resets to "Add" mode
- ✅ Toast shows: "Row X updated successfully"

**Function Call Flow:**

```
User clicks Edit icon
  ↓
handleEdit(detail)
  ↓
setEditingDetail(detail)
  ↓
InvoiceDetailsForm useEffect
  ├── Detects editingDetail
  ├── Determines isJobSpecific mode
  │   ├── If jobOrderId > 0 → Job mode
  │   ├── If departmentId > 0 → Department mode
  │   └── Else → Department mode (COA will correct it)
  └── form.reset(editingDetail) → Populate form
  ↓
User modifies and clicks "Update"
  ↓
InvoiceDetailsForm.onSubmit()
  ├── Validate data
  ├── Calculate amounts
  ├── onAddRowAction(rowData) → Parent updates
  ├── Parent finds and replaces row by itemNo
  └── setEditingDetail(null) → Clear edit mode
```

---

### Scenario 10: Deleting Invoice Detail Line

**User Actions:**

1. User clicks "Delete" icon on a detail row
2. System removes row from table

**Expected Results:**

- ✅ Row removed immediately
- ✅ No confirmation dialog (soft delete)
- ✅ If all details removed, Reset button disabled

**Function Call Flow:**

```
User clicks Delete icon
  ↓
handleDelete(itemNo)
  ├── Get current data_details
  ├── Filter out row with matching itemNo
  ├── form.setValue("data_details", filtered)
  └── form.trigger("data_details") → Revalidate
```

---

### Scenario 11: Keyboard Shortcuts

**User Actions:**

1. User presses Ctrl+S (or Cmd+S)
2. Save confirmation opens
3. User presses Ctrl+L (or Cmd+L)
4. List dialog opens

**Expected Results:**

- ✅ Shortcuts work globally on the page
- ✅ Ctrl+S opens save confirmation
- ✅ Ctrl+L opens invoice list

**Function Call Flow:**

```
useEffect (keyboard listener)
  ↓
User presses Ctrl+S
  ↓
e.preventDefault()
setShowSaveConfirm(true)
  ↓
User presses Ctrl+L
  ↓
e.preventDefault()
setShowListDialog(true)
```

---

### Scenario 12: Unsaved Changes Warning

**User Actions:**

1. User modifies form data
2. User tries to close browser/tab
3. Browser shows warning dialog

**Expected Results:**

- ✅ Only shows if form.formState.isDirty
- ✅ Browser native warning appears
- ✅ User can cancel navigation

**Function Call Flow:**

```
useEffect (beforeunload listener)
  ↓
form.formState.isDirty = true
  ↓
User tries to close tab
  ↓
handleBeforeUnload(e)
  ├── e.preventDefault()
  └── e.returnValue = ""
  ↓
Browser shows: "Leave site?"
```

---

### Scenario 13: Field-Level Calculations (Detail Form)

**User Actions:**

1. User enters qty = 100
2. System auto-sets billQTY = 100 (if hidden)
3. User enters unitPrice = 50
4. System calculates all amounts

**Expected Results:**

- ✅ totAmt = 5,000 (100 × 50)
- ✅ totLocalAmt = 7,500 (if exhRate = 1.5)
- ✅ gstAmt = 350 (if gstRate = 7%)
- ✅ gstLocalAmt = 525
- ✅ All calculations instant

**Function Call Flow:**

```
User enters qty
  ↓
handleDtQtyChange(value)
  ├── form.setValue("qty", value)
  ├── If !visible.m_BillQTY: form.setValue("billQTY", value)
  ├── rowData = form.getValues()
  ├── rowData.qty = value (manual override)
  ├── rowData.billQTY = value (manual override)
  └── handleQtyChange(Hdform, rowData, decimals, visible)
      ├── billQTY = rowData.billQTY ?? rowData.qty ?? 0
      ├── unitPrice = rowData.unitPrice ?? 0
      ├── totAmt = billQTY × unitPrice
      ├── rowData.totAmt = totAmt
      └── handleTotalamountChange()
          ├── totLocalAmt = totAmt × exhRate
          ├── handleTotalCountryamountChange()
          └── handleGstPercentageChange()
              ├── gstAmt = totAmt × gstRate / 100
              ├── gstLocalAmt = gstAmt × exhRate
              └── handleGstCityPercentageChange()
  ↓
form.setValue() for all calculated amounts
```

---

### Scenario 14: Changing Chart of Account (Job vs Department Mode)

**User Actions:**

1. User selects a Chart of Account
2. System checks if it's job-specific
3. Form shows appropriate fields

**Expected Results:**

- ✅ If COA is job-specific: Show Job Order, Task, Service
- ✅ If COA is department-specific: Show Department
- ✅ Opposite fields reset to 0
- ✅ Smooth transition

**Function Call Flow:**

```
User selects COA
  ↓
handleChartOfAccountChange(selectedOption)
  ├── form.setValue("glId", selectedOption.glId)
  ├── form.setValue("glCode", selectedOption.glCode)
  ├── form.setValue("glName", selectedOption.glName)
  ├── isJobSpecificAccount = selectedOption.isJobSpecific
  ├── setIsJobSpecific(isJobSpecificAccount)
  └── If job-specific:
      ├── Reset departmentId, departmentCode, departmentName
      └── Keep jobOrderId, taskId, serviceItemNo
      Else:
      ├── Reset jobOrderId, jobOrderNo, taskId, taskName, serviceItemNo, serviceItemNoName
      └── Keep departmentId
```

---

### Scenario 15: Exchange Rate Change (Recalculation)

**User Actions:**

1. User has invoice with details
2. User changes exchange rate in header
3. System recalculates all local amounts

**Expected Results:**

- ✅ All detail lines recalculate totLocalAmt
- ✅ All detail lines recalculate gstLocalAmt
- ✅ If city currency visible, ctyAmts recalculate
- ✅ Instant update

**Function Call Flow:**

```
User changes exhRate
  ↓
useEffect (watchedExchangeRate)
  ↓
For each detail line:
  ├── Get current values
  ├── handleQtyChange(Hdform, rowData, decimals, visible)
  │   └── Recalculates all amounts with new rate
  ├── form.setValue("totLocalAmt", rowData.totLocalAmt)
  ├── form.setValue("totCtyAmt", rowData.totCtyAmt)
  ├── form.setValue("gstLocalAmt", rowData.gstLocalAmt)
  └── form.setValue("gstCtyAmt", rowData.gstCtyAmt)
```

---

## Function Call Flows

### Core Functions in `page.tsx`

#### 1. `handleSaveInvoice()`

**Purpose:** Save new or update existing invoice

**Flow:**

```javascript
handleSaveInvoice()
├── Check if already saving (prevent double-submit)
├── setIsSaving(true)
├── form.getValues() → Get all form data
├── transformToSchemaType() → Convert to API format
├── apinvoiceHdSchema.safeParse() → Validate
├── If validation fails:
│   ├── console.error()
│   └── toast.error()
├── Determine operation:
│   ├── If invoiceId === "0": saveMutation.mutateAsync() (POST)
│   └── Else: updateMutation.mutateAsync() (PUT)
├── If response.result === 1:
│   ├── Extract invoiceData from response
│   ├── transformToSchemaType() → Convert back to form format
│   ├── setInvoice(updatedSchemaType) → Update state
│   ├── form.reset(updatedSchemaType) → Update form
│   ├── form.trigger() → Validate
│   ├── setShowSaveConfirm(false) → Close dialog
│   ├── Check wasNewInvoice:
│   │   ├── If new: toast.success("Invoice XXX saved")
│   │   └── Else: toast.success("Invoice updated")
│   └── refetchInvoices() → Refresh list cache
├── Else:
│   └── toast.error(response.message)
├── Catch errors:
│   └── toast.error("Network error")
└── Finally:
    ├── setIsSaving(false)
    └── setIsSelectingInvoice(false)
```

---

#### 2. `handleInvoiceSelect()`

**Purpose:** Load invoice from list

**Flow:**

```javascript
handleInvoiceSelect(selectedInvoice)
├── If !selectedInvoice: return
├── setIsSelectingInvoice(true)
├── Try:
│   ├── getById(invoiceId, invoiceNo) → Fetch from API
│   ├── If response.result === 1:
│   │   ├── Extract detailedInvoice from response
│   │   ├── Parse and format dates
│   │   ├── Map data_details with proper formatting
│   │   ├── transformToSchemaType() → Convert to form format
│   │   ├── setInvoice(updatedInvoice) → Update state
│   │   ├── form.reset(updatedInvoice) → Update form
│   │   ├── form.trigger() → Validate
│   │   ├── setShowListDialog(false) → Close dialog
│   │   └── toast.success("Invoice loaded")
│   └── Else:
│       └── toast.error(response.message)
│       └── Keep dialog open
├── Catch error:
│   └── toast.error("Error loading invoice")
│   └── Keep dialog open
└── Finally:
    └── setIsSelectingInvoice(false)
```

---

#### 3. `handleInvoiceSearch()`

**Purpose:** Search invoice by number

**Flow:**

```javascript
handleInvoiceSearch(value)
├── If !value: return
├── setIsLoadingInvoice(true)
├── Try:
│   ├── getById(0, value) → Fetch by invoice number
│   ├── If response.result === 1:
│   │   ├── Extract detailedInvoice
│   │   ├── Parse and format data
│   │   ├── transformToSchemaType()
│   │   ├── setInvoice()
│   │   ├── form.reset()
│   │   ├── form.trigger()
│   │   ├── toast.success()
│   │   └── setShowLoadConfirm(false)
│   └── Else:
│       └── toast.error()
├── Catch:
│   └── toast.error("Error searching")
└── Finally:
    └── setIsLoadingInvoice(false)
```

---

#### 4. `handleCloneInvoice()`

**Purpose:** Create a copy of current invoice

**Flow:**

```javascript
handleCloneInvoice()
├── If !invoice: return
├── Create clonedInvoice:
│   ├── Spread invoice data
│   ├── invoiceId = "0"
│   ├── invoiceNo = ""
│   ├── All amounts = 0
│   └── data_details = []
├── setInvoice(clonedInvoice)
├── form.reset(clonedInvoice)
└── toast.success("Invoice cloned")
```

---

#### 5. `handleInvoiceDelete()`

**Purpose:** Delete invoice from database

**Flow:**

```javascript
handleInvoiceDelete()
├── If !invoice: return
├── Try:
│   ├── deleteMutation.mutateAsync(invoiceId)
│   ├── If response.result === 1:
│   │   ├── setInvoice(null)
│   │   ├── setSearchNo("")
│   │   ├── form.reset(defaultInvoice)
│   │   └── refetchInvoices()
│   └── Else:
│       └── toast.error(response.message)
└── Catch:
    └── toast.error("Network error")
```

---

#### 6. `handleInvoiceReset()`

**Purpose:** Clear form to default state

**Flow:**

```javascript
handleInvoiceReset()
├── setInvoice(null)
├── setSearchNo("")
├── form.reset(defaultInvoice)
└── toast.success("Invoice reset")
```

---

#### 7. `transformToSchemaType()`

**Purpose:** Convert API response to form schema

**Flow:**

```javascript
transformToSchemaType(apiInvoice)
├── Convert invoiceId to string
├── Format all dates using parseDate() and format()
├── Map all fields with ?? fallbacks
├── Map data_details array:
│   ├── Convert IDs to strings
│   ├── Format dates
│   └── Ensure all fields have values
└── Return ApInvoiceHdSchemaType
```

---

### Core Functions in `invoice-details-form.tsx`

#### 1. `onSubmit()`

**Purpose:** Add or update detail line

**Flow:**

```javascript
onSubmit(data)
├── Try:
│   ├── apinvoiceDtSchema.safeParse(data)
│   ├── If validation fails:
│   │   ├── toast.error("Validation failed")
│   │   └── return
│   ├── Determine currentItemNo
│   ├── Build rowData object with all fields
│   ├── onAddRowAction(rowData) → Callback to parent
│   ├── Determine success message:
│   │   ├── If editingDetail: "Row X updated"
│   │   └── Else: "Row X added"
│   ├── toast.success()
│   └── form.reset(nextDefaults)
└── Catch:
    └── toast.error("Failed to add row")
```

---

#### 2. `handleDtQtyChange()`

**Purpose:** Handle quantity field change

**Flow:**

```javascript
handleDtQtyChange(value)
├── form.setValue("qty", value)
├── If !visible.m_BillQTY:
│   └── form.setValue("billQTY", value)
├── rowData = form.getValues()
├── rowData.qty = value (manual override)
├── If !visible.m_BillQTY:
│   └── rowData.billQTY = value
├── exchangeRate = Hdform.getValues("exhRate")
├── If !visible.m_CtyCurr:
│   └── Hdform.setValue("ctyExhRate", exchangeRate)
├── handleQtyChange(Hdform, rowData, decimals, visible)
└── form.setValue() for all calculated amounts
```

---

#### 3. `handleBillQtyChange()`

**Purpose:** Handle bill quantity field change

**Flow:**

```javascript
handleBillQtyChange(value)
├── form.setValue("billQTY", value)
├── rowData = form.getValues()
├── rowData.billQTY = value (manual override)
├── Sync exchange rates
└── handleQtyChange() → Recalculate amounts
```

---

#### 4. `handleUnitPriceChange()`

**Purpose:** Handle unit price field change

**Flow:**

```javascript
handleUnitPriceChange(value)
├── form.setValue("unitPrice", value)
├── rowData = form.getValues()
├── rowData.unitPrice = value (manual override)
├── Sync exchange rates
└── handleQtyChange() → Recalculate amounts
```

---

#### 5. `handleChartOfAccountChange()`

**Purpose:** Handle COA selection and mode switch

**Flow:**

```javascript
handleChartOfAccountChange(selectedOption)
├── form.setValue("glId", selectedOption.glId)
├── form.setValue("glCode", selectedOption.glCode)
├── form.setValue("glName", selectedOption.glName)
├── isJobSpecificAccount = selectedOption.isJobSpecific
├── setIsJobSpecific(isJobSpecificAccount)
└── Reset opposite mode fields:
    ├── If job-specific:
    │   └── Reset departmentId, departmentCode, departmentName
    └── Else:
        └── Reset jobOrderId, taskId, serviceItemNo
```

---

### Calculation Helper Functions in `helpers/account.ts`

#### 1. `handleQtyChange()`

**Purpose:** Calculate total amount from quantity

**Flow:**

```javascript
handleQtyChange(hdForm, rowData, decimals, visible)
├── billQTY = rowData.billQTY ?? rowData.qty ?? 0
├── unitPrice = rowData.unitPrice ?? 0
├── exchangeRate = hdForm.getValues().exhRate ?? 0
├── totAmt = calculateMultiplierAmount(billQTY, unitPrice, decimals.amtDec)
├── rowData.totAmt = totAmt
└── If exchangeRate valid:
    └── handleTotalamountChange() → Calculate local amounts
```

---

#### 2. `handleTotalamountChange()`

**Purpose:** Calculate local and city amounts, trigger GST

**Flow:**

```javascript
handleTotalamountChange(hdForm, rowData, decimals, visible)
├── totAmt = rowData.totAmt ?? 0
├── exchangeRate = hdForm.getValues().exhRate ?? 0
├── totLocalAmt = calculateMultiplierAmount(totAmt, exchangeRate, decimals.locAmtDec)
├── rowData.totLocalAmt = totLocalAmt
├── handleTotalCountryamountChange() → City amount
└── handleGstPercentageChange() → GST amounts
```

---

#### 3. `handleGstPercentageChange()`

**Purpose:** Calculate GST amounts

**Flow:**

```javascript
handleGstPercentageChange(hdForm, rowData, decimals, visible)
├── totAmt = rowData.totAmt ?? 0
├── gstRate = rowData.gstPercentage ?? 0
├── exchangeRate = hdForm.getValues().exhRate ?? 0
├── gstAmt = calculatePercentagecAmount(totAmt, gstRate, decimals.amtDec)
├── rowData.gstAmt = gstAmt
├── gstLocalAmt = calculateMultiplierAmount(gstAmt, exchangeRate, decimals.locAmtDec)
├── rowData.gstLocalAmt = gstLocalAmt
└── handleGstCityPercentageChange() → City GST amount
```

---

#### 4. `handleTotalCountryamountChange()`

**Purpose:** Calculate city currency amount

**Flow:**

```javascript
handleTotalCountryamountChange(hdForm, rowData, decimals, visible)
├── totAmt = rowData.totAmt ?? 0
├── exchangeRate = hdForm.getValues().exhRate ?? 0
├── countryExchangeRate = hdForm.getValues().ctyExhRate ?? 0
├── If visible.m_CtyCurr:
│   └── totCtyAmt = totAmt × countryExchangeRate
└── Else:
    └── totCtyAmt = totAmt × exchangeRate
├── rowData.totCtyAmt = totCtyAmt
```

---

#### 5. `handleGstCityPercentageChange()`

**Purpose:** Calculate city GST amount

**Flow:**

```javascript
handleGstCityPercentageChange(hdForm, rowData, decimals, visible)
├── gstAmt = rowData.gstAmt ?? 0
├── exchangeRate = hdForm.getValues().exhRate ?? 0
├── countryExchangeRate = hdForm.getValues().ctyExhRate ?? 0
├── If visible.m_CtyCurr:
│   └── gstCtyAmt = gstAmt × countryExchangeRate
└── Else:
    └── gstCtyAmt = gstAmt × exchangeRate
├── rowData.gstCtyAmt = gstCtyAmt
```

---

## API Endpoints

### Invoice Endpoints

| Endpoint                | Method | Purpose            | Parameters                 |
| ----------------------- | ------ | ------------------ | -------------------------- |
| `/ap/invoice`           | GET    | Get invoice list   | startDate, endDate, search |
| `/ap/invoice`           | POST   | Create new invoice | Invoice object             |
| `/ap/invoice`           | PUT    | Update invoice     | Invoice object             |
| `/ap/invoice/{id}`      | DELETE | Delete invoice     | invoiceId                  |
| `/ap/invoice/{id}/{no}` | GET    | Get by ID and No   | invoiceId, invoiceNo       |

### Lookup Endpoints

| Endpoint                 | Method | Purpose               |
| ------------------------ | ------ | --------------------- |
| `/lookup/supplier`       | GET    | Get suppliers         |
| `/lookup/currency`       | GET    | Get currencies        |
| `/lookup/chartofaccount` | GET    | Get chart of accounts |
| `/lookup/product`        | GET    | Get products          |
| `/lookup/uom`            | GET    | Get UOMs              |
| `/lookup/gst`            | GET    | Get GST rates         |
| `/lookup/joborder`       | GET    | Get job orders        |
| `/lookup/department`     | GET    | Get departments       |
| `/lookup/employee`       | GET    | Get employees         |
| `/lookup/port`           | GET    | Get ports             |
| `/lookup/vessel`         | GET    | Get vessels           |
| `/lookup/barge`          | GET    | Get barges            |
| `/lookup/voyage`         | GET    | Get voyages           |

### Settings Endpoints

| Endpoint                                      | Method | Purpose              |
| --------------------------------------------- | ------ | -------------------- |
| `/settings/visible-fields`                    | GET    | Get field visibility |
| `/settings/required-fields`                   | GET    | Get required fields  |
| `/settings/gst-percentage/{gstId}/{date}`     | GET    | Get GST rate         |
| `/settings/exchange-rate/{currencyId}/{date}` | GET    | Get exchange rate    |
| `/settings/credit-term-days/{termId}/{date}`  | GET    | Get credit term      |

---

## State Management

### Local State (`page.tsx`)

```typescript
// Dialog visibility
const [showListDialog, setShowListDialog] = useState(false)
const [showSaveConfirm, setShowSaveConfirm] = useState(false)
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
const [showLoadConfirm, setShowLoadConfirm] = useState(false)
const [showResetConfirm, setShowResetConfirm] = useState(false)
const [showCloneConfirm, setShowCloneConfirm] = useState(false)

// Loading states
const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)
const [isSelectingInvoice, setIsSelectingInvoice] = useState(false)
const [isSaving, setIsSaving] = useState(false)

// Data
const [invoice, setInvoice] = useState<ApInvoiceHdSchemaType | null>(null)
const [searchNo, setSearchNo] = useState("")
const [activeTab, setActiveTab] = useState("main")
const [filters, setFilters] = useState<IApInvoiceFilter>({...})
```

### Form State (React Hook Form)

```typescript
const form = useForm<ApInvoiceHdSchemaType>({
  resolver: zodResolver(apinvoiceHdSchema(required, visible)),
  defaultValues: invoice || defaultInvoice,
})

// Accessed via:
form.getValues() // Get all values
form.setValue(name, value) // Set single value
form.reset(data) // Reset form
form.trigger() // Trigger validation
form.formState.isDirty // Check if modified
```

### Global State (Zustand)

```typescript
// From useAuthStore()
const { decimals } = useAuthStore()
// Contains: amtDec, locAmtDec, qtyDec, exhRateDec, dateFormat, etc.

// From URL params
const { companyId } = useParams()
```

### Server State (React Query)

```typescript
// Invoice list
const { data: invoicesResponse, refetch: refetchInvoices, isLoading, isRefetching }
  = useGetWithDates(...)

// Field settings
const { data: visibleFieldsData } = useGetVisibleFields(moduleId, transactionId)
const { data: requiredFieldsData } = useGetRequiredFields(moduleId, transactionId)

// Mutations
const saveMutation = usePersist(`${ApInvoice.add}`)
const updateMutation = usePersist(`${ApInvoice.add}`)
const deleteMutation = useDelete(`${ApInvoice.delete}`)
```

---

## Button Behaviors

### Button Disable Logic

| Button     | Disabled When                                                        | Enabled When            |
| ---------- | -------------------------------------------------------------------- | ----------------------- |
| **Save**   | `isSaving \|\| saveMutation.isPending \|\| updateMutation.isPending` | Always (unless saving)  |
| **Print**  | `!invoice \|\| invoice.invoiceId === "0"`                            | Saved invoice exists    |
| **Reset**  | `!invoice`                                                           | Any invoice data exists |
| **Clone**  | `!invoice \|\| invoice.invoiceId === "0"`                            | Saved invoice exists    |
| **Delete** | `!invoice \|\| invoice.invoiceId === "0"`                            | Saved invoice exists    |
| **List**   | Never                                                                | Always                  |

### Button States Summary

| Scenario      | Save | Print | Reset | Clone | Delete | List |
| ------------- | ---- | ----- | ----- | ----- | ------ | ---- |
| Fresh page    | ✅   | ❌    | ❌    | ❌    | ❌     | ✅   |
| Creating new  | ✅   | ❌    | ✅    | ❌    | ❌     | ✅   |
| After clone   | ✅   | ❌    | ✅    | ❌    | ❌     | ✅   |
| Saved invoice | ✅   | ✅    | ✅    | ✅    | ✅     | ✅   |
| While saving  | ❌   | ✅    | ✅    | ✅    | ✅     | ✅   |

---

## Component Architecture

### Component Hierarchy

```
InvoicePage
├── Tabs
│   ├── Main Tab
│   │   └── Main Component
│   │       ├── InvoiceHeaderForm
│   │       │   ├── SupplierAutocomplete
│   │       │   ├── CurrencyAutocomplete
│   │       │   ├── BankAutocomplete
│   │       │   ├── CreditTermAutocomplete
│   │       │   └── Date fields, etc.
│   │       ├── InvoiceDetailsForm
│   │       │   ├── ProductAutocomplete
│   │       │   ├── ChartOfAccountAutocomplete
│   │       │   ├── Conditional rendering:
│   │       │   │   ├── Job Mode: JobOrder, Task, Service
│   │       │   │   └── Department Mode: Department
│   │       │   ├── EmployeeAutocomplete
│   │       │   ├── UomAutocomplete
│   │       │   ├── GSTAutocomplete
│   │       │   └── Numeric inputs with calculations
│   │       └── InvoiceDetailsTable
│   │           ├── Table rows
│   │           └── Edit/Delete actions
│   ├── Other Tab
│   │   └── Other Component
│   │       └── Additional fields
│   └── History Tab
│       └── History Component
│           ├── AccountDetails
│           └── EditVersionDetails
├── Dialog: Invoice List
│   └── InvoiceTable
│       ├── Date filters
│       ├── Search
│       └── DataTable with columns
└── Confirmation Dialogs
    ├── SaveConfirmation
    ├── DeleteConfirmation
    ├── LoadConfirmation
    ├── ResetConfirmation
    └── CloneConfirmation
```

### Component Props Flow

```typescript
// InvoicePage → Main
<Main
  form={form}
  onSuccessAction={handleSaveInvoice}
  isEdit={isEdit}
  visible={visible}
  required={required}
  companyId={companyId}
/>

// Main → InvoiceDetailsForm
<InvoiceDetailsForm
  Hdform={form}
  onAddRowAction={handleAddRow}
  onCancelEdit={handleCancelEdit}
  editingDetail={editingDetail}
  visible={visible}
  required={required}
  companyId={companyId}
  existingDetails={data_details}
/>

// Main → InvoiceDetailsTable
<InvoiceDetailsTable
  data={data_details}
  onEditAction={handleEdit}
  onDeleteAction={handleDelete}
  visible={visible}
/>
```

---

## Data Flow

### Creating New Invoice Flow

```
User opens page
  ↓
useGetVisibleFields() → visible
useGetRequiredFields() → required
  ↓
form initialized with defaultInvoice
  ↓
User fills header form
  ↓
form.setValue() updates form state
  ↓
User adds detail lines
  ↓
InvoiceDetailsForm.onSubmit()
  ↓
onAddRowAction() → Parent
  ↓
form.setValue("data_details", [...details, newDetail])
  ↓
InvoiceDetailsTable re-renders
  ↓
User clicks Save
  ↓
handleSaveInvoice()
  ↓
form.getValues() → All data
  ↓
transformToSchemaType() → API format
  ↓
saveMutation.mutateAsync() → API POST
  ↓
API returns saved invoice with new ID
  ↓
transformToSchemaType() → Form format
  ↓
setInvoice() + form.reset()
  ↓
Form shows saved invoice
```

### Loading Invoice Flow

```
User clicks List
  ↓
setShowListDialog(true)
  ↓
refetchInvoices() → API GET list
  ↓
InvoiceTable renders with data
  ↓
User clicks row
  ↓
handleInvoiceSelect(invoice)
  ↓
getById() → API GET details
  ↓
transformToSchemaType() → Form format
  ↓
setInvoice() + form.reset()
  ↓
Form populates with all data
  ↓
setShowListDialog(false)
```

### Editing Detail Line Flow

```
User clicks Edit icon
  ↓
handleEdit(detail)
  ↓
setEditingDetail(detail)
  ↓
InvoiceDetailsForm useEffect detects change
  ↓
form.reset(editingDetail)
  ↓
Form populated with detail data
  ↓
User modifies fields
  ↓
Calculations happen on change
  ↓
User clicks Update
  ↓
onSubmit() → validate & build rowData
  ↓
onAddRowAction(rowData) → Parent
  ↓
Parent finds row by itemNo
  ↓
Replaces row in data_details
  ↓
form.setValue("data_details", updated)
  ↓
Table re-renders
  ↓
setEditingDetail(null) → Clear edit mode
  ↓
Form resets to Add mode
```

---

## Edge Cases & Error Handling

### Edge Case 1: Duplicate Item Numbers

**Scenario:** User tries to add detail with existing itemNo

**Handling:**

- Uses itemNo as unique identifier
- On edit, finds and replaces by itemNo
- On add, increments itemNo automatically

---

### Edge Case 2: Zero Values in Calculations

**Scenario:** User enters qty=0 or unitPrice=0

**Handling:**

- Uses nullish coalescing (`??`) instead of logical OR (`||`)
- Calculations always run, even with 0 values
- Result: totAmt = 0 (correct)

**Before (Broken):**

```typescript
if (qty && unitPrice) {
  // ❌ Fails when 0
  calculate()
}
```

**After (Fixed):**

```typescript
const qty = rowData?.qty ?? 0 // ✅ Handles 0
calculate() // Always runs
```

---

### Edge Case 3: Form State Timing

**Scenario:** setValue() then getValues() immediately

**Handling:**

- React Hook Form batches updates
- Manual override: `rowData.qty = value` after `getValues()`
- Ensures calculations use latest values

---

### Edge Case 4: Missing Chart of Account Data

**Scenario:** Edit detail with jobOrderId=0 and departmentId=0

**Handling:**

- Default to department mode
- ChartOfAccountAutocomplete has data
- On render, triggers handleChartOfAccountChange
- Auto-corrects mode based on COA.isJobSpecific

---

### Edge Case 5: Network Errors During Save

**Scenario:** API call fails

**Handling:**

```typescript
try {
  await saveMutation.mutateAsync(data)
} catch (error) {
  console.error("Save error:", error)
  toast.error("Network error while saving invoice")
} finally {
  setIsSaving(false)
  setIsSelectingInvoice(false)
}
```

---

### Edge Case 6: Unsaved Changes on Navigate

**Scenario:** User tries to close browser with unsaved changes

**Handling:**

```typescript
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (form.formState.isDirty) {
      e.preventDefault()
      e.returnValue = ""
    }
  }
  window.addEventListener("beforeunload", handleBeforeUnload)
  return () => window.removeEventListener("beforeunload", handleBeforeUnload)
}, [form.formState.isDirty])
```

---

### Edge Case 7: Empty Detail Lines on Save

**Scenario:** User tries to save invoice without details

**Handling:**

- Schema validation checks data_details
- Can allow empty details (depends on schema)
- Toast shows validation error if required

---

### Edge Case 8: Invoice Already Deleted

**Scenario:** User loads invoice that was deleted by another user

**Handling:**

- API returns error (result !== 1)
- Toast shows: "Failed to fetch invoice details"
- Dialog stays open for retry
- No partial data loaded

---

### Edge Case 9: Concurrent Edits (Optimistic Locking)

**Scenario:** Two users edit same invoice

**Handling:**

- `editVersion` field tracks version
- Backend compares on save
- If mismatch, returns error
- User sees: "Invoice was modified by another user"

---

### Edge Case 10: Exchange Rate = 0

**Scenario:** Currency with no exchange rate

**Handling:**

- Calculations still run
- Local amounts = 0
- No division by zero errors
- Uses nullish coalescing

---

## Performance Optimizations

### 1. Lazy Invoice List Loading

```typescript
// Only fetch when dialog opens
const { data } = useGetWithDates(..., enabled: false)

// Dialog opens → refetchInvoices()
<Dialog onOpenChange={(open) => {
  if (open) refetchInvoices()
}}>
```

### 2. Memoized Invoice Data

```typescript
const invoicesData = useMemo(
  () => (invoicesResponse as ApiResponse<IApInvoiceHd>)?.data ?? [],
  [invoicesResponse]
)
```

### 3. Debounced Calculations

- Calculations triggered on field change
- React Hook Form batches updates
- No unnecessary re-renders

### 4. Conditional Rendering

- Hide fields based on visibility settings
- Reduces DOM size
- Faster initial render

### 5. React Query Caching

- Invoice list cached for 5 minutes
- Refetches on filter change
- Background refetch on window focus

---

## Summary

### Total Scenarios: 15

1. Creating New Invoice
2. Loading from List
3. Loading by Search
4. Editing Invoice
5. Cloning Invoice
6. Deleting Invoice
7. Resetting Invoice
8. Adding Detail Line
9. Editing Detail Line
10. Deleting Detail Line
11. Keyboard Shortcuts
12. Unsaved Changes Warning
13. Field Calculations
14. Chart of Account Mode Switch
15. Exchange Rate Recalculation

### Total Functions: 25+

**Page Functions:** 7 core handlers
**Detail Form Functions:** 10+ handlers
**Calculation Functions:** 5 cascading helpers
**Transform Functions:** 2 converters

### Total API Endpoints: 20+

- 5 Invoice endpoints
- 10+ Lookup endpoints
- 5 Settings endpoints

### Total State Variables: 15+

- 6 Dialog states
- 3 Loading states
- 6 Data states

**This module is now fully documented!** 📝
