# GL Period Close System - Complete Function Flowchart

## 1. YEAR SELECTION FLOW

```
User Selects Financial Year
    ↓
handleYearChange (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Year Selection Logic:                                  │
│ 1. Set selectedYear = selectedYear.yearId              │
│ 2. Invalidate period close queries                     │
│ 3. Fetch period close data for selected year           │
│ 4. Update period close table data                      │
└─────────────────────────────────────────────────────────┘
    ↓
Fetch period close data
    ↓
Update period close table
    ↓
Display period close status
```

## 2. PERIOD GENERATION FLOW

```
User Clicks "Generate Period" Button
    ↓
handleGeneratePeriod (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Period Generation Logic:                               │
│ 1. Validate year selection                             │
│ 2. Check if periods already exist for year            │
│ 3. Generate 12 months of period data                   │
│ 4. Set default close status (false)                    │
│ 5. Create period close records                         │
└─────────────────────────────────────────────────────────┘
    ↓
Generate period close records
    ↓
Update period close data
    ↓
Refresh period close table
```

## 3. AR CLOSE FLOW

```
User Toggles AR Close Checkbox
    ↓
handleFieldChange (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ AR Close Logic:                                        │
│ 1. Set isArClose = checked value                       │
│ 2. Set arCloseById = current user ID                   │
│ 3. Set arCloseBy = current user name                   │
│ 4. Set arCloseDate = current timestamp                 │
│ 5. Update period close record                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update AR close status
    ↓
Update close user and date
    ↓
Refresh period close table
```

## 4. AP CLOSE FLOW

```
User Toggles AP Close Checkbox
    ↓
handleFieldChange (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ AP Close Logic:                                        │
│ 1. Set isApClose = checked value                       │
│ 2. Set apCloseById = current user ID                    │
│ 3. Set apCloseBy = current user name                   │
│ 4. Set apCloseDate = current timestamp                 │
│ 5. Update period close record                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update AP close status
    ↓
Update close user and date
    ↓
Refresh period close table
```

## 5. CB CLOSE FLOW

```
User Toggles CB Close Checkbox
    ↓
handleFieldChange (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ CB Close Logic:                                        │
│ 1. Set isCbClose = checked value                       │
│ 2. Set cbCloseById = current user ID                    │
│ 3. Set cbCloseBy = current user name                   │
│ 4. Set cbCloseDate = current timestamp                 │
│ 5. Update period close record                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update CB close status
    ↓
Update close user and date
    ↓
Refresh period close table
```

## 6. GL CLOSE FLOW

```
User Toggles GL Close Checkbox
    ↓
handleFieldChange (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ GL Close Logic:                                        │
│ 1. Set isGlClose = checked value                       │
│ 2. Set glCloseById = current user ID                    │
│ 3. Set glCloseBy = current user name                   │
│ 4. Set glCloseDate = current timestamp                 │
│ 5. Update period close record                          │
└─────────────────────────────────────────────────────────┘
    ↓
Update GL close status
    ↓
Update close user and date
    ↓
Refresh period close table
```

## 7. SAVE PERIOD CLOSE FLOW

```
User Clicks "Save" Button
    ↓
handleSave (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Save Logic:                                            │
│ 1. Validate year selection                             │
│ 2. Show save confirmation dialog                       │
│ 3. Wait for user confirmation                          │
└─────────────────────────────────────────────────────────┘
    ↓
Show save confirmation
    ↓
User confirms save
    ↓
handleConfirmSave
    ↓
┌─────────────────────────────────────────────────────────┐
│ Save Confirmation Logic:                               │
│ 1. Set saving state to true                           │
│ 2. Prepare period close data for save                  │
│ 3. Call save API endpoint                              │
│ 4. Handle save response                                │
│ 5. Update period close data                            │
│ 6. Show success/error message                          │
└─────────────────────────────────────────────────────────┘
    ↓
Save period close data
    ↓
Update period close table
    ↓
Show success message
```

## 8. DELETE PERIOD CLOSE FLOW

```
User Clicks "Delete" Button
    ↓
handleDelete (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Delete Logic:                                          │
│ 1. Validate year selection                             │
│ 2. Show delete confirmation dialog                    │
│ 3. Wait for user confirmation                          │
└─────────────────────────────────────────────────────────┘
    ↓
Show delete confirmation
    ↓
User confirms delete
    ↓
handleConfirmDelete
    ↓
┌─────────────────────────────────────────────────────────┐
│ Delete Confirmation Logic:                             │
│ 1. Set deleting state to true                         │
│ 2. Call delete API endpoint                            │
│ 3. Handle delete response                              │
│ 4. Clear period close data                             │
│ 5. Show success/error message                          │
└─────────────────────────────────────────────────────────┘
    ↓
Delete period close data
    ↓
Clear period close table
    ↓
Show success message
```

## 9. PERIOD CLOSE VALIDATION FLOW

```
System Validates Period Close
    ↓
validatePeriodClose
    ↓
┌─────────────────────────────────────────────────────────┐
│ Validation Logic:                                      │
│ 1. Check if year is selected                           │
│ 2. Validate period close data integrity                │
│ 3. Check for required fields                           │
│ 4. Validate date ranges                                │
│ 5. Check for duplicate periods                         │
└─────────────────────────────────────────────────────────┘
    ↓
IF validation passes:
    → Allow period close operations
    → Proceed with save/delete
ELSE:
    → Show validation errors
    → Prevent operations
```

## 10. PERIOD CLOSE STATUS FLOW

```
System Updates Period Close Status
    ↓
updatePeriodCloseStatus
    ↓
┌─────────────────────────────────────────────────────────┐
│ Status Update Logic:                                   │
│ 1. Update close status for selected period            │
│ 2. Set close user information                         │
│ 3. Set close timestamp                                │
│ 4. Update period close record                         │
│ 5. Refresh period close table                         │
└─────────────────────────────────────────────────────────┘
    ↓
Update period close record
    ↓
Refresh period close table
    ↓
Update UI status
```

## 11. DEPENDENCY CHAIN

```
Year Selection
    ↓
Fetch period close data
    ↓
Update period close table
    ↓
Display period close status
```

```
Period Generation
    ↓
Create period close records
    ↓
Update period close data
    ↓
Refresh period close table
```

```
Field Change
    ↓
Update period close record
    ↓
Refresh period close table
    ↓
Update UI status
```

## 12. KEY DECISION POINTS

### A. Period Close Status Detection

```
IF isArClose === true:
    → Mark AR module as closed
    → Set AR close user and date
    → Disable AR operations for period

IF isApClose === true:
    → Mark AP module as closed
    → Set AP close user and date
    → Disable AP operations for period

IF isCbClose === true:
    → Mark CB module as closed
    → Set CB close user and date
    → Disable CB operations for period

IF isGlClose === true:
    → Mark GL module as closed
    → Set GL close user and date
    → Disable GL operations for period
```

### B. Period Close Validation

```
IF all modules are closed:
    → Mark period as fully closed
    → Disable all operations for period
    → Show period close summary

IF some modules are closed:
    → Mark period as partially closed
    → Show partial close status
    → Allow remaining modules to be closed

IF no modules are closed:
    → Mark period as open
    → Allow all operations for period
    → Show open status
```

### C. Year Selection Impact

```
Year Selection:
    → Load period close data for selected year
    → Update period close table
    → Display period close status
    → Enable/disable operations based on status
```

## 13. PERIOD CLOSE REPORTING FLOW

```
User Generates Period Close Report
    ↓
handlePeriodCloseReporting (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Report Generation Logic:                               │
│ 1. Gather period close data                           │
│ 2. Calculate close statistics                         │
│ 3. Identify closed/open periods                       │
│ 4. Generate report format                              │
└─────────────────────────────────────────────────────────┘
    ↓
Generate period close report
    ↓
Export report data
    ↓
Send report notifications
```

## 14. PERIOD CLOSE ARCHIVE FLOW

```
User Archives Period Close
    ↓
handlePeriodCloseArchive (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Archive Logic:                                         │
│ 1. Finalize period close data                          │
│ 2. Update period close status                         │
│ 3. Archive period close records                       │
│ 4. Generate archive report                            │
└─────────────────────────────────────────────────────────┘
    ↓
Archive period close data
    ↓
Update period close status
    ↓
Generate archive report
```

## 15. PERIOD CLOSE BULK OPERATIONS FLOW

```
User Performs Bulk Operations
    ↓
handleBulkOperations (periodclose-page.tsx)
    ↓
┌─────────────────────────────────────────────────────────┐
│ Bulk Operations Logic:                                │
│ 1. Select multiple periods                            │
│ 2. Perform bulk close operations                      │
│ 3. Update multiple period close records                │
│ 4. Refresh period close table                         │
└─────────────────────────────────────────────────────────┘
    ↓
Update multiple period close records
    ↓
Refresh period close table
    ↓
Show bulk operation results
```

## 16. PERIOD CLOSE AUDIT FLOW

```
System Audits Period Close
    ↓
auditPeriodClose
    ↓
┌─────────────────────────────────────────────────────────┐
│ Audit Logic:                                           │
│ 1. Track period close changes                          │
│ 2. Log close user actions                              │
│ 3. Record close timestamps                             │
│ 4. Generate audit trail                                │
└─────────────────────────────────────────────────────────┘
    ↓
Generate audit trail
    ↓
Log audit information
    ↓
Update audit records
```

## 17. PERIOD CLOSE NOTIFICATIONS FLOW

```
System Sends Period Close Notifications
    ↓
sendPeriodCloseNotifications
    ↓
┌─────────────────────────────────────────────────────────┐
│ Notification Logic:                                     │
│ 1. Identify period close events                        │
│ 2. Generate notification messages                      │
│ 3. Send notifications to relevant users                │
│ 4. Update notification status                          │
└─────────────────────────────────────────────────────────┘
    ↓
Send notifications
    ↓
Update notification status
    ↓
Log notification results
```

## 18. PERIOD CLOSE INTEGRATION FLOW

```
System Integrates with Other Modules
    ↓
integratePeriodClose
    ↓
┌─────────────────────────────────────────────────────────┐
│ Integration Logic:                                     │
│ 1. Check module close status                           │
│ 2. Update module permissions                           │
│ 3. Sync module data                                    │
│ 4. Update integration status                            │
└─────────────────────────────────────────────────────────┘
    ↓
Update module permissions
    ↓
Sync module data
    ↓
Update integration status
```

This flowchart shows the complete interaction between all functions in the GL Period Close system, including the decision points, calculation sequences, and form update logic for period close management and module status updates.
