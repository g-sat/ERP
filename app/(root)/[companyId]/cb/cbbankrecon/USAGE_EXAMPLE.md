# Bank Reconciliation Details Table - Editable Cells Usage

## Overview

The `BankReconDetailsTable` now supports **inline editing** for `chequeNo` and `chequeDate` fields.

## How to Use

### 1. Add the `onCellUpdate` handler to your parent component:

```tsx
import BankReconDetailsTable from "./components/cbbankrecon-details-table"

export default function YourParentComponent() {
  const [reconDetails, setReconDetails] = useState<ICbBankReconDt[]>([])

  // Handler to update cell values
  const handleCellUpdate = (
    itemNo: number,
    field: keyof ICbBankReconDt,
    value: string | Date
  ) => {
    console.log(`Updating item ${itemNo}, field ${field}:`, value)

    // Update the data
    setReconDetails((prevData) =>
      prevData.map((item) =>
        item.itemNo === itemNo ? { ...item, [field]: value } : item
      )
    )

    // Optional: Call API to persist the change
    // await updateBankReconDetail(itemNo, field, value)
  }

  return (
    <BankReconDetailsTable
      data={reconDetails}
      onCellUpdate={handleCellUpdate}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
      onFilterChange={handleFilterChange}
      onDataReorder={handleDataReorder}
      visible={visible}
    />
  )
}
```

### 2. The editable cells will:

- ✅ Show an input field for `chequeNo` (text input)
- ✅ Show a date picker for `chequeDate` (date input)
- ✅ Call `onCellUpdate` when the value changes
- ✅ Highlight on hover with a border
- ✅ Focus with a primary color border

### 3. Styling:

The input fields are styled to blend with the table:

- Transparent background by default
- Border appears on hover
- Primary color border on focus
- Small height (h-7) to fit in table rows

## API

### Props

| Prop           | Type                                                                           | Description                        |
| -------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| `onCellUpdate` | `(itemNo: number, field: keyof ICbBankReconDt, value: string \| Date) => void` | Callback when a cell value changes |

### Example `onCellUpdate` Parameters

```tsx
// When cheque number is updated:
handleCellUpdate(1, "chequeNo", "CHQ-12345")

// When cheque date is updated:
handleCellUpdate(1, "chequeDate", new Date("2024-01-15"))
```

## Adding More Editable Columns

To make other columns editable, follow this pattern:

```tsx
{
  accessorKey: "yourField",
  header: "Your Field",
  size: 100,
  cell: ({ row }) => (
    <Input
      value={row.original.yourField || ""}
      onChange={(e) => {
        if (onCellUpdate) {
          onCellUpdate(row.original.itemNo, "yourField", e.target.value)
        }
      }}
      className="h-7 border-transparent bg-transparent px-2 text-sm hover:border-input focus:border-primary"
      placeholder="Enter value"
    />
  ),
},
```

## Notes

- The `onCellUpdate` callback is **optional** - if not provided, cells will still show inputs but won't trigger updates
- Date inputs use the ISO format (yyyy-MM-dd) internally but display according to the user's date format setting
- Changes are instant - consider adding debouncing if calling an API
