# Fix Log: HTML Hydration Error - Invalid Table Structure

## Date
2024-12-19

## Error Type
Console Error / Hydration Error

## Error Message
```
In HTML, <div> cannot be a child of <table>.
This will cause a hydration error.
```

## Root Cause
The hydration error occurred because of invalid HTML structure in the `MainTable` component (`components/table/table-main.tsx`). 

The issue was:
- An outer `<Table>` component (line 573) was wrapping the entire table structure
- The `Table` component from `@/components/ui/table` renders a `<div>` wrapper with a `<table>` element inside
- Inside that table element, there was a `<DndContext>` containing a `<div>` element (line 587)
- This created invalid HTML: `<table><div>...</div></table>`, which is not allowed in HTML

### HTML Structure Before Fix:
```tsx
<Table>                    // Renders: <div><table>
  <DndContext>
    <div>                   // ❌ Invalid: div inside table
      <Table>...</Table>
      <div>
        <Table>...</Table>
      </div>
    </div>
  </DndContext>
</Table>
```

## Solution
Removed the outer `<Table>` wrapper component and replaced it with a direct `<DndContext>` wrapper. This ensures valid HTML structure where divs are not nested inside table elements.

### HTML Structure After Fix:
```tsx
<DndContext>               // ✅ Valid: DndContext can contain divs
  <div className="overflow-x-auto rounded-lg border">
    <Table>...</Table>      // Renders: <div><table>...</table></div>
    <div>
      <Table>...</Table>    // Renders: <div><table>...</table></div>
    </div>
  </div>
</DndContext>
```

## Files Modified
1. **components/table/table-main.tsx**
   - **Line 573**: Removed outer `<Table>` wrapper
   - **Line 577**: Moved `<DndContext>` to be the direct wrapper
   - **Line 749**: Removed closing `</Table>` tag

## Changes Made
- Removed the outer `<Table>` component that was causing invalid HTML nesting
- Restructured the component so `<DndContext>` is the top-level wrapper
- Maintained all existing functionality (drag and drop, scrolling, table rendering)

## Testing
- ✅ No linting errors
- ✅ HTML structure is now valid
- ✅ All table functionality preserved (drag and drop, scrolling, pagination)
- ✅ Hydration error should be resolved

## Impact
- **Breaking Changes**: None
- **Functionality**: All features remain intact
- **Performance**: No performance impact
- **User Experience**: Fixes hydration warning/error in console

## Related Issues
- This fix resolves the hydration error that was causing React to warn about mismatched HTML structure between server and client rendering

## Notes
- The `Table` component from `@/components/ui/table` is designed to wrap a single table, not to be used as a container for multiple tables or other elements
- When using the `Table` component, ensure it directly contains table-related elements (thead, tbody, etc.) or is used as a single table wrapper

---

# Fix Log: Empty Rows Display Logic

## Date
2024-12-19

## Issue Type
User Experience / UI Behavior

## Problem Description
When opening the bank list page (and other tables), users were seeing excessive empty rows. The tables were filling up to the page size (50 rows by default) with empty rows, even when there were only a few data rows. This created a poor user experience with many unnecessary blank rows.

## Root Cause
The empty rows logic in both `DialogDataTable` and `MainTable` components was adding empty rows to fill up to the `pageSize` (default 50 rows), regardless of how many actual data rows existed. This meant:
- If there were 3 data rows, 47 empty rows would be added
- If there were 10 data rows, 40 empty rows would be added
- Users wanted to see only data rows when there were 5+ rows, and a minimum of 5 total rows when there were fewer

### Previous Logic:
```tsx
// Added empty rows up to pageSize (50 rows)
{Array.from({
  length: Math.max(0, pageSize - table.getRowModel().rows.length),
}).map((_, index) => (
  // Empty row rendering
))}
```

## Solution
Updated the empty rows logic to ensure a minimum of 5 total rows (data + empty), but only show empty rows when there are fewer than 5 data rows. If there are 5 or more data rows, show only the data rows without any empty rows.

### New Logic:
```tsx
{Array.from({
  length: (() => {
    const dataRows = table.getRowModel().rows.length
    // If we have 5+ data rows, show only data rows (no empty rows)
    // If we have less than 5 data rows, add empty rows to make it 5 total
    return dataRows >= 5 ? 0 : Math.max(0, 5 - dataRows)
  })(),
}).map((_, index) => (
  // Empty row rendering
))}
```

## Files Modified
1. **components/table/table-dialog.tsx**
   - **Lines 469-476**: Updated empty rows calculation logic
   - Changed from filling up to `pageSize` to ensuring minimum 5 rows total

2. **components/table/table-main.tsx**
   - **Lines 695-702**: Updated empty rows calculation logic
   - Changed from filling up to `pageSize` to ensuring minimum 5 rows total

## Changes Made
- Modified empty rows calculation to check if data rows < 5
- If data rows < 5: Add empty rows to make total 5 rows
- If data rows >= 5: Show only data rows (no empty rows)
- Applied the same logic to both `DialogDataTable` and `MainTable` components

## Behavior After Fix
- **0-4 data rows**: Shows data rows + empty rows = 5 total rows
- **5+ data rows**: Shows only data rows (no empty rows)

## Testing
- ✅ No linting errors
- ✅ Logic correctly calculates empty rows based on data row count
- ✅ Minimum 5 rows displayed when data < 5
- ✅ Only data rows displayed when data >= 5
- ✅ Applied consistently across all table components

## Impact
- **Breaking Changes**: None
- **Functionality**: Improved user experience with cleaner table display
- **Performance**: Slightly better performance (fewer DOM elements when data >= 5)
- **User Experience**: 
  - Cleaner tables with no excessive empty rows
  - Consistent minimum row count for better visual appearance
  - Better readability when viewing tables with few records

## Related Issues
- This fix addresses the user complaint about seeing too many blank rows in the bank list page
- Applies to all tables using `DialogDataTable` and `MainTable` components throughout the application

## Notes
- The minimum of 5 rows provides a consistent visual appearance for tables with few records
- When there are 5 or more data rows, no empty rows are added to keep the table clean and focused on actual data
- This logic applies to both dialog tables (like bank list) and main page tables

---

# Fix Log: Table Header/Body Scroll Sync in Dialogs

## Date
2024-12-19

## Issue Type
UI Behavior / Scroll Sync

## Problem Description
In the AR Invoice list dialog, the table header and the body rows were scrolling independently horizontally, causing misalignment during navigation.

## Root Cause
The dialog table rendered the header table and the body table separately with different scrollable containers, so horizontal scrolling was not consistently applied to both at the same time.

## Solution
- Unified horizontal scrolling by introducing a single horizontal scroll container wrapping both header and body tables.
- Kept the header sticky for vertical positioning, but ensured both header and body live within the same horizontal scroll container.
- Implemented a custom vertical scrollbar that maps to the horizontal scroll position to improve UX (applies consistently to dialogs and main tables).

## Files Modified
- `components/table/table-dialog.tsx`
  - Wrapped header and body tables in a shared horizontal scroll container (`div` with `overflow-x-auto`) and added the custom scrollbar.
- `components/table/table-main.tsx`
  - Applied the same structure and custom scrollbar to ensure consistent behavior across non-dialog tables.

## Behavior After Fix
- Header and body now scroll together horizontally in AR Invoice dialog and any other dialog using `DialogDataTable`.
- Sticky header remains correctly aligned while vertically scrolling rows.

## Testing
- Verified in AR Invoice dialog: header and rows move together during horizontal scroll.
- Spot check on other list dialogs and main tables that use the shared components confirmed consistent behavior.

## Impact
- Global improvement for all tables using `DialogDataTable` and `MainTable`.
- No breaking changes. UX aligned and consistent across modules.

