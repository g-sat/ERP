"use client"

import { useEffect, useState } from "react"
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
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
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
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { SortableTableHeader } from "./sortable-table-header"
import { DebitNoteTableActions } from "./table-debitnote-action"
import { DebitNoteTableHeader } from "./table-debitnote-header"

interface DebitNoteBaseTableProps<T> {
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
  onBulkDelete?: (selectedIds: string[]) => void
  onPurchase?: (itemId: string) => void
  isConfirmed?: boolean
  showHeader?: boolean
  showActions?: boolean
  hideView?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
  hideCreate?: boolean
  disableOnDebitNoteExists?: boolean
}

export function DebitNoteBaseTable<T>({
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
  onBulkDelete,
  isConfirmed,
  showHeader = true,
  showActions = true,
  hideView = false,
  hideEdit = false,
  hideDelete = false,
  hideCreate = false,
  disableOnDebitNoteExists = true,
}: DebitNoteBaseTableProps<T>) {
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
            header: "Actions",
            enableHiding: false,
            size: 110,
            minSize: 100,

            cell: ({ row }) => {
              const item = row.original
              const isSelected = row.getIsSelected()

              return (
                <DebitNoteTableActions
                  row={item as T & { debitNoteId?: number }}
                  onView={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSelect={(_, checked) => {
                    console.log(
                      "Row selection toggled:",
                      checked,
                      "Row ID:",
                      row.id
                    )
                    row.toggleSelected(checked)
                  }}
                  idAccessor={accessorId}
                  hideView={hideView}
                  hideEdit={hideEdit}
                  hideDelete={hideDelete}
                  isSelected={isSelected}
                  disableOnDebitNoteExists={disableOnDebitNoteExists}
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
  const [pageSize] = useState(15) // Fixed page size for empty rows
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

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (!onBulkDelete) return

    const selectedRowIds = Object.keys(rowSelection)
    const selectedItems = data.filter((_, index) =>
      selectedRowIds.includes(index.toString())
    )

    // Extract IDs using the accessorId
    const selectedIds = selectedItems.map((item) =>
      String((item as Record<string, unknown>)[accessorId as string])
    )

    onBulkDelete(selectedIds)
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
        <DebitNoteTableHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onRefresh={onRefresh}
          onCreate={onCreate}
          onBulkDelete={handleBulkDelete}
          //columns={table.getAllLeafColumns()}
          columns={table
            .getHeaderGroups()
            .flatMap((group) => group.headers)
            .map((header) => header.column)}
          tableName={tableName}
          moduleId={moduleId || 1}
          transactionId={transactionId || 1}
          hasSelectedRows={hasSelectedRows}
          selectedRowsCount={selectedRowsCount}
          isConfirmed={isConfirmed}
          data={data}
          hideCreate={hideCreate}
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
                    {/* Sortable context for drag and drop */}
                    <SortableContext
                      items={headerGroup.headers.map((header) => header.id)} // Column IDs for sorting
                      strategy={horizontalListSortingStrategy} // Horizontal sorting strategy
                    >
                      {/* Render each sortable header */}
                      {headerGroup.headers.map((header) => (
                        <SortableTableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
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
