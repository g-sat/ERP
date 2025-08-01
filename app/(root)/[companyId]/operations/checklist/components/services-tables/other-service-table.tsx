"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IOtherService, IOtherServiceFilter } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
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
import { useVirtualizer } from "@tanstack/react-virtual"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { DraggableColumnHeader } from "@/components/ui/data-table"
import { TableActionsProject } from "@/components/ui/data-table/data-table-actions-project"
import { TableHeaderProject } from "@/components/ui/data-table/data-table-header-project"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface OtherServiceTableProps {
  data: IOtherService[]
  isLoading?: boolean
  onOtherServiceSelect?: (otherService: IOtherService | undefined) => void
  onDeleteOtherService?: (otherServiceId: string) => void
  onEditOtherService?: (otherService: IOtherService) => void
  onCreateOtherService?: () => void
  onDebitNote?: (otherServiceId: string, debitNoteNo?: string) => void
  onPurchase?: (otherServiceId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IOtherServiceFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function OtherServiceTable({
  data,
  isLoading = false,
  onOtherServiceSelect,
  onDeleteOtherService,
  onEditOtherService,
  onCreateOtherService,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: OtherServiceTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Add a ref for the actions column
  const actionsColumnRef = useRef<HTMLTableCellElement>(null)
  const [actionsColumnWidth, setActionsColumnWidth] = useState(100)

  useEffect(() => {
    if (actionsColumnRef.current) {
      setActionsColumnWidth(actionsColumnRef.current.offsetWidth)
    }
  }, [columnSizing])

  console.log(isConfirmed, "isConfirmed other service")

  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    TableName.other_service
  )

  const columns: ColumnDef<IOtherService>[] = useMemo(
    () => [
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        size: 100,
        minSize: 80,
        maxSize: 150,
        cell: ({ row }) => {
          const otherService = row.original
          const isSelected = row.getIsSelected()
          return (
            <TableActionsProject
              row={otherService}
              idAccessor="otherServiceId"
              onView={onOtherServiceSelect}
              onEdit={onEditOtherService}
              onDelete={onDeleteOtherService}
              onDebitNote={handleDebitNoteFromActions}
              onPurchase={onPurchase}
              onSelect={(_, checked) => {
                // Handle row selection for checkbox
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
      },
      {
        accessorKey: "debitNoteNo",
        header: "Debit Note No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("debitNoteNo") || "—"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const raw = row.getValue("date")
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, datetimeFormat) : "-"}
            </div>
          )
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },

      {
        accessorKey: "chargeName",
        header: "Charge Name",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("chargeName") || "—"}</div>
        ),
        size: 200,
        minSize: 150,
        maxSize: 300,
        enableColumnFilter: true,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("quantity") || "—"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("amount") || "—"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "uomName",
        header: "UOM",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("uomName") || "—"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => (
          <div className="text-wrap">
            <Badge variant="default">{row.getValue("statusName") || "—"}</Badge>
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("remarks") || "—"}</div>
        ),
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: "createBy",
        header: "Create By",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("createBy") || "—"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "createDate",
        header: "Create Date",
        cell: ({ row }) => {
          const raw = row.getValue("createDate")
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, datetimeFormat) : "-"}
            </div>
          )
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: "editBy",
        header: "Edit By",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("editBy") || "—"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "editDate",
        header: "Edit Date",
        cell: ({ row }) => {
          const raw = row.getValue("editDate")
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, datetimeFormat) : "-"}
            </div>
          )
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: "editVersion",
        header: "Edit Version",
        cell: ({ row }) => (
          <div className="text-wrap">
            <Badge variant="default">
              {row.getValue("editVersion") || "0"}
            </Badge>
          </div>
        ),
        size: 70,
        minSize: 60,
        maxSize: 80,
      },
    ],
    [
      datetimeFormat,
      onOtherServiceSelect,
      onEditOtherService,
      onDeleteOtherService,
      onDebitNote,
      onPurchase,
      isConfirmed,
    ]
  )

  const table = useReactTable({
    data,
    columns,
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

  // Calculate selected rows and their properties
  const selectedRows = table?.getFilteredSelectedRowModel().rows || []
  const selectedRowsCount = selectedRows.length
  const hasSelectedRows = selectedRowsCount > 0

  // Check if selected rows have valid debitNoteId (not zero)
  const hasValidDebitNoteIds = useMemo(() => {
    return (
      hasSelectedRows &&
      selectedRows.some((row) => {
        const debitNoteId = (row.original as IOtherService).debitNoteId
        return debitNoteId && debitNoteId !== 0
      })
    )
  }, [hasSelectedRows, selectedRows])

  // Handlers for combined service and debit note
  const handleCombinedService = useCallback(() => {
    if (!hasSelectedRows) {
      console.log("No rows selected for combined service")
      return
    }
    if (onCombinedService) {
      onCombinedService(
        selectedRows.map((row) => row.original.otherServiceId.toString())
      )
    }
  }, [onCombinedService, hasSelectedRows, selectedRows])

  // Wrapper function for TableActionsProject onDebitNote callback
  const handleDebitNoteFromActions = useCallback(
    (id: string) => {
      if (onDebitNote) {
        onDebitNote(id, "")
      }
    },
    [onDebitNote]
  )

  useEffect(() => {
    if (gridSettings && table) {
      try {
        const colVisible = JSON.parse(gridSettings.grdColVisible || "{}")
        const colOrder = JSON.parse(gridSettings.grdColOrder || "[]")
        const colSize = JSON.parse(gridSettings.grdColSize || "{}")
        const sort = JSON.parse(gridSettings.grdSort || "[]")

        setColumnVisibility(colVisible)
        setSorting(sort)

        if (Object.keys(colSize).length > 0) {
          setColumnSizing(colSize)
        }

        if (colOrder.length > 0) {
          table.setColumnOrder(colOrder)
        }
      } catch (error) {
        console.error("Error parsing grid settings:", error)
      }
    }
  }, [gridSettings, table])

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 5,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (data && data.length > 0) {
        table.setGlobalFilter(query)
      } else if (onFilterChange) {
        const newFilters: IOtherServiceFilter = {
          search: query,
          sortOrder: sorting[0]?.desc ? "desc" : "asc",
        }
        onFilterChange(newFilters)
      }
    },
    [data, onFilterChange, sorting, table]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
    },
    [table]
  )

  useEffect(() => {
    if (!data?.length && onFilterChange) {
      const filters: IOtherServiceFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery, data, onFilterChange])

  return (
    <div
      ref={tableContainerRef}
      className="relative overflow-auto"
      style={{ height: isConfirmed ? "390px" : "430px" }}
    >
      <TableHeaderProject
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateOtherService}
        columns={table.getAllLeafColumns()}
        tableName={TableName.other_service}
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
        selectedRowIds={selectedRows.map((row) =>
          row.original.otherServiceId.toString()
        )}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <Table className="relative w-full">
            <TanstackTableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={headerGroup.headers.map((header) => header.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <DraggableColumnHeader
                          key={header.id}
                          header={header}
                        />
                      )
                    })}
                  </SortableContext>
                </TableRow>
              ))}
            </TanstackTableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {virtualRows.length > 0 ? (
                <>
                  <tr style={{ height: `${paddingTop}px` }} />
                  {virtualRows.map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index]
                    return (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                          const isActions = cell.column.id === "actions"
                          return (
                            <TableCell
                              key={cell.id}
                              ref={isActions ? actionsColumnRef : null}
                              className={
                                isActions
                                  ? "bg-background sticky left-0 z-10"
                                  : ""
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
                  <tr style={{ height: `${paddingBottom}px` }} />
                </>
              ) : (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {isLoading ? "Loading..." : "No launch services found."}
                    </TableCell>
                  </TableRow>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell colSpan={columns.length} className="h-10" />
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>
    </div>
  )
}
