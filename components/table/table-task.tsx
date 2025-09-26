"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"
// Virtual scrolling removed - using empty rows instead

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Checkbox } from "../ui/checkbox"
import { SortableTableHeader } from "./sortable-table-header"
import { TaskTableActions } from "./table-task-action"
import { TaskTableHeader } from "./table-task-header"

interface TaskTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  moduleId?: number
  transactionId?: number
  tableName: TableName
  emptyMessage?: string
  accessorId: keyof T
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onSelect?: (item: T | null) => void
  onCreate?: () => void
  onEdit?: (item: T) => void
  onDelete?: (itemId: string) => void
  onDebitNote?: (itemId: string, debitNoteNo?: string) => void
  onPurchase?: (itemId: string) => void
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
  showHeader?: boolean
  showActions?: boolean
}

export function TaskTable<T>({
  data,
  columns,
  isLoading,
  moduleId,
  transactionId,
  tableName,
  emptyMessage = "No data found.",
  accessorId,
  onRefresh,
  onFilterChange,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  onDebitNote,
  onPurchase,
  onCombinedService,
  isConfirmed,
  showHeader = true,
  showActions = true,
}: TaskTableProps<T>) {
  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    tableName
  )

  const gridSettingsData = gridSettings?.data
  const getInitialSorting = (): SortingState => {
    if (gridSettingsData?.grdSort) {
      try {
        return JSON.parse(gridSettingsData.grdSort) || []
      } catch {
        return []
      }
    }
    return []
  }

  const getInitialColumnVisibility = (): VisibilityState => {
    if (gridSettingsData?.grdColVisible) {
      try {
        return JSON.parse(gridSettingsData.grdColVisible) || {}
      } catch {
        return {}
      }
    }
    return {}
  }

  const getInitialColumnSizing = () => {
    if (gridSettingsData?.grdColSize) {
      try {
        return JSON.parse(gridSettingsData.grdColSize) || {}
      } catch {
        return {}
      }
    }
    return {}
  }

  const [sorting, setSorting] = useState<SortingState>(getInitialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    getInitialColumnVisibility
  )
  const [columnSizing, setColumnSizing] = useState(getInitialColumnSizing)
  const [searchQuery, setSearchQuery] = useState("")
  const [rowSelection, setRowSelection] = useState({})

  const selectedRowsCount = Object.keys(rowSelection).length
  const hasSelectedRows = selectedRowsCount > 0
  const hasValidDebitNoteIds = useMemo(() => {
    if (!hasSelectedRows || !data) return false

    const selectedRowIds = Object.keys(rowSelection)
    const selectedRows = data.filter((_, index) =>
      selectedRowIds.includes(index.toString())
    )

    return selectedRows.every(
      (row) =>
        (row as T & { debitNoteId?: number }).debitNoteId &&
        (row as T & { debitNoteId?: number }).debitNoteId! > 0
    )
  }, [hasSelectedRows, data, rowSelection])
  const selectedRowIds = useMemo(() => {
    if (!hasSelectedRows || !data) return []

    const selectedIndices = Object.keys(rowSelection)
    return selectedIndices.map((index) => {
      const item = data[parseInt(index)]
      const id =
        (item as T & { id?: number; taskId?: number; portExpenseId?: number })
          .id ||
        (item as T & { id?: number; taskId?: number; portExpenseId?: number })
          .taskId ||
        (item as T & { id?: number; taskId?: number; portExpenseId?: number })
          .portExpenseId ||
        index
      return id.toString()
    })
  }, [hasSelectedRows, data, rowSelection])

  const handleCombinedService = useCallback(() => {
    console.log("Combined Services clicked - Selected Row IDs:", selectedRowIds)
    if (selectedRowIds.length === 0) {
      console.log("No items selected for Combined Services")
      return
    }
    if (onCombinedService) {
      onCombinedService(selectedRowIds)
    }
  }, [selectedRowIds, onCombinedService])

  const handleDebitNoteFromActions = useCallback(
    (id: string) => {
      if (onDebitNote) {
        onDebitNote(id, "")
      }
    },
    [onDebitNote]
  )

  useEffect(() => {
    if (gridSettingsData) {
      try {
        const colVisible = JSON.parse(gridSettingsData.grdColVisible || "{}")
        const colSize = JSON.parse(gridSettingsData.grdColSize || "{}")
        const sort = JSON.parse(gridSettingsData.grdSort || "[]")

        setColumnVisibility(colVisible)
        setSorting(sort)

        if (Object.keys(colSize).length > 0) {
          setColumnSizing(colSize)
        }
      } catch (error) {
        console.error("Error parsing grid settings:", error)
      }
    }
  }, [gridSettingsData])

  const tableColumns: ColumnDef<T>[] = [
    ...(showActions && (onSelect || onEdit || onDelete)
      ? [
          {
            id: "actions",
            header: ({ table }) => {
              const isAllSelected = table.getIsAllRowsSelected()
              const hasSelectedRows =
                table.getSelectedRowModel().rows.length > 0
              const isIndeterminate = hasSelectedRows && !isAllSelected

              // Header checkbox should be checked if any rows are selected
              const headerChecked = hasSelectedRows

              return (
                <div className="flex items-center gap-2">
                  {/* ✅ Header "Select All" Checkbox */}
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={(checked) => {
                      table.toggleAllPageRowsSelected(!!checked)
                    }}
                    className={
                      isIndeterminate
                        ? "data-[state=indeterminate]:bg-primary/50"
                        : ""
                    }
                  />
                  <span className="font-medium">Actions</span>
                </div>
              )
            },
            enableHiding: false,
            size: 190,
            minSize: 160,

            cell: ({ row }) => {
              const item = row.original
              const isSelected = row.getIsSelected()

              return (
                <TaskTableActions
                  row={item as T & { debitNoteId?: number }}
                  idAccessor={accessorId}
                  onView={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDebitNote={handleDebitNoteFromActions}
                  onPurchase={onPurchase}
                  onSelect={(_, checked) => {
                    console.log(
                      "Row selection toggled:",
                      checked,
                      "Row ID:",
                      row.id
                    )
                    row.toggleSelected(checked)
                  }}
                  isSelected={isSelected}
                  isConfirmed={isConfirmed}
                />
              )
            },
          } as ColumnDef<T>,
        ]
      : []),
    ...columns,
  ]

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    enableColumnResizing: true,
    enableRowSelection: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
      rowSelection,
      globalFilter: searchQuery,
    },
  })

  // Virtual scrolling removed - using empty rows instead
  const [pageSize] = useState(20) // Fixed page size for empty rows
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (data && data.length > 0) {
      table.setGlobalFilter(query)
    } else if (onFilterChange) {
      const newFilters = {
        search: query,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(newFilters)
    }
  }
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const oldIndex = table
        .getAllColumns()
        .findIndex((col) => col.id === active.id)
      const newIndex = table
        .getAllColumns()
        .findIndex((col) => col.id === over.id)
      const newColumnOrder = arrayMove(
        table.getAllColumns(),
        oldIndex,
        newIndex
      )
      table.setColumnOrder(newColumnOrder.map((col) => col.id))
    }
  }
  useEffect(() => {
    if (!data?.length && onFilterChange) {
      const filters = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery, data?.length, onFilterChange])

  return (
    <div className="space-y-4">
      {showHeader && (
        <TaskTableHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onRefresh={onRefresh}
          onCreate={onCreate}
          //columns={table.getAllLeafColumns()}
          columns={table
            .getHeaderGroups()
            .flatMap((group) => group.headers)
            .map((header) => header.column)}
          tableName={tableName}
          moduleId={moduleId || 1}
          transactionId={transactionId || 1}
          onCombinedService={handleCombinedService}
          onDebitNote={(debitNoteNo, selectedIds) => {
            if (selectedIds && selectedIds.length > 0 && onDebitNote) {
              onDebitNote(selectedIds.join(","), debitNoteNo || "")
            }
          }}
          hasSelectedRows={hasSelectedRows}
          selectedRowsCount={selectedRowsCount}
          hasValidDebitNoteIds={hasValidDebitNoteIds}
          isConfirmed={isConfirmed}
          selectedRowIds={selectedRowIds}
          hideColumnsOnDebitNote={["edit", "delete", "purchase"]} // Example: hide these columns when debit note exists
          hasDebitNoteInSelection={hasValidDebitNoteIds}
        />
      )}

      <Table>
        {/* ============================================================================
          DRAG AND DROP CONTEXT
          ============================================================================ */}

        {/* Wrap table in drag and drop context for column reordering */}
        <DndContext
          sensors={sensors} // Configured drag sensors
          collisionDetection={closestCenter} // Collision detection algorithm
          onDragEnd={handleDragEnd} // Handle drag end events
        >
          {/* ============================================================================
            TABLE CONTAINER
            ============================================================================ */}

          {/* Main table container with horizontal scrolling */}
          <div className="overflow-x-auto rounded-lg border">
            {/* Fixed header table with column sizing */}
            <Table
              className="w-full table-fixed border-collapse"
              style={{ minWidth: "100%" }}
            >
              {/* Column group for consistent sizing */}
              <colgroup>
                {table.getAllLeafColumns().map((col) => (
                  <col
                    key={col.id}
                    style={{
                      width: `${col.getSize()}px`,
                      minWidth: `${col.getSize()}px`,
                      maxWidth: `${col.getSize()}px`,
                    }} // Set column width from table state
                  />
                ))}
              </colgroup>

              {/* Sticky table header */}
              <TableHeader className="bg-background sticky top-0 z-20">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {/* Render each header */}
                    {headerGroup.headers.map((header) => {
                      // Don't use SortableTableHeader for actions column
                      if (header.id === "actions") {
                        return (
                          <TableHead
                            key={header.id}
                            colSpan={header.colSpan}
                            style={{
                              width: header.getSize(),
                              minWidth: header.column.columnDef.minSize,
                              maxWidth: header.column.columnDef.maxSize,
                            }}
                            className="bg-muted group hover:bg-muted/80 relative transition-colors"
                          >
                            {header.isPlaceholder ? null : (
                              <div className="flex items-center justify-between pl-3">
                                <div className="flex items-center">
                                  <span className="font-medium">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                          </TableHead>
                        )
                      }

                      // Use SortableTableHeader for regular columns
                      return (
                        <SortableTableHeader key={header.id} header={header} />
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
            </Table>

            {/* Scrollable body container */}
            <div
              className="max-h-[460px] overflow-y-auto" // Allow vertical scrolling if needed
            >
              {/* Body table with same column sizing as header */}
              <Table
                className="w-full table-fixed border-collapse"
                style={{ minWidth: "100%" }}
              >
                {/* Column group matching header for alignment */}
                <colgroup>
                  {table.getAllLeafColumns().map((col) => (
                    <col
                      key={col.id}
                      style={{
                        width: `${col.getSize()}px`,
                        minWidth: `${col.getSize()}px`,
                        maxWidth: `${col.getSize()}px`,
                      }} // Match header column widths
                    />
                  ))}
                </colgroup>

                <TableBody>
                  {/* ============================================================================
                    DATA ROWS RENDERING
                    ============================================================================ */}

                  {/* Render data rows */}
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <TableRow key={row.id}>
                        {/* Render each visible cell in the row */}
                        {row.getVisibleCells().map((cell, cellIndex) => {
                          const isActions = cell.column.id === "actions"
                          const isFirstColumn = cellIndex === 0

                          return (
                            <TableCell
                              key={cell.id}
                              className={`py-1 ${
                                isFirstColumn || isActions
                                  ? "bg-background sticky left-0 z-10" // Make first column and actions sticky
                                  : ""
                              }`}
                              style={{
                                width: `${cell.column.getSize()}px`,
                                minWidth: `${cell.column.getSize()}px`,
                                maxWidth: `${cell.column.getSize()}px`,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                position:
                                  isFirstColumn || isActions
                                    ? "sticky"
                                    : "relative",
                                left: isFirstColumn || isActions ? 0 : "auto",
                                zIndex: isFirstColumn || isActions ? 10 : 1,
                              }}
                            >
                              {/* Render cell content using column definition */}
                              {flexRender(
                                cell.column.columnDef.cell, // Cell renderer from column definition
                                cell.getContext() // Cell context with row data
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}

                  {/* ============================================================================
                    EMPTY ROWS TO FILL PAGE SIZE
                    ============================================================================ */}

                  {/* Add empty rows to fill the remaining space based on page size */}
                  {Array.from({
                    length: Math.max(
                      0,
                      pageSize - table.getRowModel().rows.length
                    ),
                  }).map((_, index) => (
                    <TableRow key={`empty-${index}`} className="h-7">
                      {table.getAllLeafColumns().map((column, cellIndex) => {
                        const isActions = column.id === "actions"
                        const isFirstColumn = cellIndex === 0

                        return (
                          <TableCell
                            key={`empty-${index}-${column.id}`}
                            className={`py-1 ${
                              isFirstColumn || isActions
                                ? "bg-background sticky left-0 z-10" // Make first column and actions sticky
                                : ""
                            }`}
                            style={{
                              width: `${column.getSize()}px`,
                              minWidth: `${column.getSize()}px`,
                              maxWidth: `${column.getSize()}px`,
                              position:
                                isFirstColumn || isActions
                                  ? "sticky"
                                  : "relative",
                              left: isFirstColumn || isActions ? 0 : "auto",
                              zIndex: isFirstColumn || isActions ? 10 : 1,
                            }}
                          >
                            {/* Empty cell content */}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}

                  {/* ============================================================================
                    EMPTY STATE OR LOADING
                    ============================================================================ */}

                  {/* Show empty state or loading message when no data */}
                  {table.getRowModel().rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumns.length} // Span all columns
                        className="h-7 text-center" // Center the message
                      >
                        {isLoading ? "Loading..." : emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DndContext>
      </Table>
    </div>
  )
}
