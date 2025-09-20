"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

// Virtual scrolling removed - using empty rows instead

import { TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"
import { DraggableColumnHeader } from "@/components/ui/data-table"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

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
  const tableContainerRef = useRef<HTMLDivElement>(null)

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

  const actionsColumnRef = useRef<HTMLTableCellElement>(null)
  const [actionsColumnWidth, setActionsColumnWidth] = useState(100)

  useEffect(() => {
    if (actionsColumnRef.current) {
      setActionsColumnWidth(actionsColumnRef.current.offsetWidth)
    }
  }, [columnSizing])

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
            header: "Actions",
            enableHiding: false,
            size: 120,
            minSize: 80,

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
    <div
      ref={tableContainerRef}
      className="relative overflow-auto"
      style={{ height: "430px" }}
    >
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
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="max-h-[460px] overflow-x-auto">
          <Table className="relative w-full">
            <TanstackTableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={headerGroup.headers.map((header) => header.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <DraggableColumnHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TanstackTableHeader>

            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {/* Render data rows */}
              {table.getRowModel().rows.map((row) => {
                return (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const isActions = cell.column.id === "actions"
                      return (
                        <TableCell
                          key={cell.id}
                          ref={isActions ? actionsColumnRef : null}
                          className={
                            isActions ? "bg-background sticky left-0 z-10" : ""
                          }
                          style={{
                            position: isActions ? "sticky" : "relative",
                            left: isActions ? 0 : "auto",
                            zIndex: isActions ? 10 : 1,
                            width: isActions
                              ? actionsColumnWidth
                              : cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}

              {/* Add empty rows to fill the remaining space based on page size */}
              {Array.from({
                length: Math.max(0, pageSize - table.getRowModel().rows.length),
              }).map((_, index) => (
                <TableRow key={`empty-${index}`} className="h-12">
                  {table.getAllLeafColumns().map((column, cellIndex) => {
                    const isActions = column.id === "actions"
                    const isFirstColumn = cellIndex === 0

                    return (
                      <TableCell
                        key={`empty-${index}-${column.id}`}
                        className={`py-1 ${
                          isFirstColumn || isActions
                            ? "bg-background sticky left-0 z-10"
                            : ""
                        }`}
                        style={{
                          width: `${column.getSize()}px`,
                          minWidth: `${column.getSize()}px`,
                          maxWidth: `${column.getSize()}px`,
                          position:
                            isFirstColumn || isActions ? "sticky" : "relative",
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

              {/* Show empty state or loading message when no data */}
              {table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-24 text-center"
                  >
                    {isLoading ? "Loading..." : emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>
    </div>
  )
}
