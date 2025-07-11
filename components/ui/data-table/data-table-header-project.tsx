import { useCallback, useMemo, useState } from "react"
import { IGridSetting } from "@/interfaces/setting"
import { Column } from "@tanstack/react-table"
import {
  AlertCircle,
  Forward,
  Layout,
  Plus,
  Receipt,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"

import { useSave } from "@/hooks/use-common"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Define types for clarity
type TableHeaderProjectProps<TData> = {
  onRefresh?: () => void
  onCreate?: () => void
  onCombinedService?: () => void
  onDebitNote?: (debitNoteNo?: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  columns: Column<TData, unknown>[]
  tableName?: string // Optional table name prop
  moduleId: number
  transactionId: number
  // New props for conditional button behavior
  hasSelectedRows?: boolean
  selectedRowsCount?: number
  hasValidDebitNoteIds?: boolean
  isConfirmed?: boolean
}

export function TableHeaderProject<TData>({
  onRefresh,
  onCreate,
  onCombinedService,
  onDebitNote,
  searchQuery,
  onSearchChange,
  columns,
  tableName = "Table",
  moduleId,
  transactionId,
  hasSelectedRows = false,
  selectedRowsCount = 0,
  hasValidDebitNoteIds = false,
  isConfirmed = false,
}: TableHeaderProjectProps<TData>) {
  const [columnSearch, setColumnSearch] = useState("")
  const [activeButton, setActiveButton] = useState<"show" | "hide" | null>(null)
  const [debitNoteNo, setDebitNoteNo] = useState("")
  const [showDebitNoteInput, setShowDebitNoteInput] = useState(false)

  // Filter columns based on search - memoized to prevent re-renders
  const filteredColumns = useMemo(() => {
    return columns.filter((column) => {
      const headerText =
        typeof column.columnDef.header === "string"
          ? column.columnDef.header
          : column.id
      return headerText.toLowerCase().includes(columnSearch.toLowerCase())
    })
  }, [columns, columnSearch])

  const handleShowAll = useCallback(() => {
    columns.forEach((column) => column.toggleVisibility(true))
    setActiveButton("show")
  }, [columns])

  const handleHideAll = useCallback(() => {
    columns.forEach((column) => column.toggleVisibility(false))
    setActiveButton("hide")
  }, [columns])

  const handleDebitNoteClick = useCallback(() => {
    console.log("Debit Note button clicked in header")
    if (onDebitNote) {
      onDebitNote(debitNoteNo || undefined)
      setDebitNoteNo("") // Clear the input after use
    }
  }, [onDebitNote, debitNoteNo])

  // Handle combined services click with validation
  const handleCombinedServiceClick = useCallback(() => {
    console.log("Combined Services button clicked in header")
    if (onCombinedService) {
      onCombinedService()
    }
  }, [onCombinedService])

  // Add the save mutation for grid settings
  const saveGridSettings = useSave<IGridSetting>(
    "/setting/saveUserGrid",
    "gridSettings"
  )

  const handleSaveLayout = useCallback(async () => {
    try {
      console.log(moduleId, transactionId, "moduleId, transactionId")
      const grdName = tableName

      // Get column visibility and order
      const columnVisibility = Object.fromEntries(
        columns.map((col) => [col.id, col.getIsVisible()])
      )
      const columnSize = Object.fromEntries(
        columns.map((col) => [col.id, col.getSize()])
      )
      const columnOrder = columns.map((col) => col.id)
      const sorting: { id: string; desc: boolean }[] = [] // Add sorting if needed

      const gridSettings: IGridSetting = {
        moduleId,
        transactionId,
        grdName,
        grdKey: grdName,
        grdColVisible: JSON.stringify(columnVisibility),
        grdColOrder: JSON.stringify(columnOrder),
        grdColSize: JSON.stringify(columnSize),
        grdSort: JSON.stringify(sorting),
        grdString: "",
      }

      await saveGridSettings.mutateAsync(gridSettings)
    } catch (error) {
      console.error("Error saving layout:", error)
    }
  }, [moduleId, transactionId, tableName, columns, saveGridSettings])

  return (
    <div className="mb-4 space-y-2">
      {/* Alert message when no rows are selected */}
      {!hasSelectedRows && (onCombinedService || onDebitNote) && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Please select at least one item from the table to use Combined
            Services or Debit Note features.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert message when selected rows have valid debitNoteId */}
      {hasSelectedRows && onDebitNote && hasValidDebitNoteIds && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Selected items have valid Debit Note IDs. Cannot create new debit
            notes for items that already have debit notes.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected items count */}
      {hasSelectedRows && selectedRowsCount > 0 && (
        <div className="text-muted-foreground text-sm">
          {selectedRowsCount} item{selectedRowsCount !== 1 ? "s" : ""} selected
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={onCreate} disabled={isConfirmed}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isConfirmed}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleCombinedServiceClick}
            title={
              hasSelectedRows
                ? "Combined Services"
                : "Please select at least one item first"
            }
            disabled={isConfirmed || !hasSelectedRows}
            className={
              !hasSelectedRows || isConfirmed
                ? "cursor-not-allowed opacity-50"
                : ""
            }
          >
            <Forward className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDebitNoteClick}
              title={
                !hasSelectedRows
                  ? "Please select at least one item first"
                  : hasValidDebitNoteIds
                    ? "Selected items have valid Debit Note IDs - cannot create new debit note"
                    : "Debit Note"
              }
              disabled={isConfirmed || !hasSelectedRows || hasValidDebitNoteIds}
              className={
                !hasSelectedRows || hasValidDebitNoteIds || isConfirmed
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }
            >
              <Receipt className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="debit-note-checkbox"
                checked={showDebitNoteInput}
                onCheckedChange={(checked) =>
                  setShowDebitNoteInput(checked as boolean)
                }
                disabled={!hasSelectedRows || hasValidDebitNoteIds}
              />
              <label
                htmlFor="debit-note-checkbox"
                className={`text-sm leading-none font-medium ${
                  !hasSelectedRows || hasValidDebitNoteIds
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                IsDebitNoteNo.
              </label>
            </div>
            {showDebitNoteInput && (
              <Input
                placeholder="Debit Note No"
                value={debitNoteNo}
                onChange={(e) => setDebitNoteNo(e.target.value)}
                className="w-40"
                disabled={!hasSelectedRows || hasValidDebitNoteIds}
              />
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-[300px]"
          />
          {/* Column Visibility Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="p-2">
                <Input
                  placeholder="Search columns..."
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div className="flex gap-2 p-2">
                <Button
                  variant={activeButton === "show" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={handleShowAll}
                >
                  Show All
                </Button>
                <Button
                  variant={activeButton === "hide" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={handleHideAll}
                >
                  Hide All
                </Button>
              </div>
              <DropdownMenuItem className="my-1 h-px p-0" disabled />
              {filteredColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Change - Moved to right side */}
          <Button
            variant="outline"
            title="Save Layout"
            onClick={handleSaveLayout}
          >
            <Layout className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
