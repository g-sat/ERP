import { useCallback, useMemo, useState } from "react"
import { IGridSetting } from "@/interfaces/setting"
import { Column } from "@tanstack/react-table"
import {
  Layout,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"

import { useSave } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Define types for clarity
type TableHeaderDebitNoteProps<TData> = {
  onRefresh?: () => void
  onCreate?: () => void
  onDeleteSelected?: (selectedIds: string[]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  columns: Column<TData, unknown>[]
  tableName?: string // Optional table name prop
  moduleId: number
  transactionId: number
  // New props for conditional button behavior
  hasSelectedRows?: boolean
  selectedRowsCount?: number
  selectedRowIds?: string[]
  totalRowsCount?: number
  isConfirmed?: boolean
}

export function TableHeaderDebitNote<TData>({
  onRefresh,
  onCreate,
  onDeleteSelected,
  searchQuery,
  onSearchChange,
  columns,
  tableName = "Table",
  moduleId,
  transactionId,
  hasSelectedRows = false,
  selectedRowsCount = 0,
  selectedRowIds = [],
  isConfirmed = false,
}: TableHeaderDebitNoteProps<TData>) {
  const [columnSearch, setColumnSearch] = useState("")
  const [activeButton, setActiveButton] = useState<"show" | "hide" | null>(null)

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

  // Add the save mutation for grid settings
  const saveGridSettings = useSave<IGridSetting>("/setting/saveUserGrid")

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

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (onDeleteSelected && selectedRowIds.length > 0) {
      onDeleteSelected(selectedRowIds)
    }
  }, [onDeleteSelected, selectedRowIds])

  return (
    <div className="mb-4 space-y-2">
      {/* Selected items count and Select All */}
      <div className="flex items-center justify-between">
        {hasSelectedRows && selectedRowsCount > 0 && (
          <div className="text-muted-foreground text-sm">
            {selectedRowsCount} item{selectedRowsCount !== 1 ? "s" : ""}{" "}
            selected
          </div>
        )}
      </div>

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
          {/* Bulk Delete Button */}
          {hasSelectedRows && onDeleteSelected && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isConfirmed}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedRowsCount})
            </Button>
          )}
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
