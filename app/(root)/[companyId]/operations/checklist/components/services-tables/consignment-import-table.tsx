"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  IConsignmentImport,
  IConsignmentImportFilter,
} from "@/interfaces/checklist"
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

interface ConsignmentImportTableProps {
  data: IConsignmentImport[]
  isLoading?: boolean
  onConsignmentImportSelect?: (
    consignmentImport: IConsignmentImport | undefined
  ) => void
  onDeleteConsignmentImport?: (consignmentImportId: string) => void
  onEditConsignmentImport?: (consignmentImport: IConsignmentImport) => void
  onCreateConsignmentImport?: () => void
  onDebitNote?: (consignmentImportId: string, debitNoteNo?: string) => void
  onPurchase?: (consignmentImportId: string) => void
  onRefresh?: () => void
  onFilterChange?: (filters: IConsignmentImportFilter) => void
  moduleId?: number
  transactionId?: number
  onCombinedService?: (selectedIds: string[]) => void
  isConfirmed?: boolean
}

export function ConsignmentImportTable({
  data,
  isLoading = false,
  onConsignmentImportSelect,
  onDeleteConsignmentImport,
  onEditConsignmentImport,
  onCreateConsignmentImport,
  onDebitNote,
  onPurchase,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  onCombinedService,
  isConfirmed,
}: ConsignmentImportTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
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

  console.log(isConfirmed, "isConfirmed consignment import")

  // Get selected rows count
  const selectedRowsCount = Object.keys(rowSelection).length
  const hasSelectedRows = selectedRowsCount > 0

  // Check if selected rows have valid debitNoteId (not zero)
  const hasValidDebitNoteIds = useMemo(() => {
    if (!hasSelectedRows || !data) return false

    const selectedRowIds = Object.keys(rowSelection)
    const selectedRows = data.filter((_, index) =>
      selectedRowIds.includes(index.toString())
    )

    // Check if all selected rows have valid debitNoteId (not zero)
    return selectedRows.every((row) => row.debitNoteId && row.debitNoteId > 0)
  }, [hasSelectedRows, data, rowSelection])

  // Get selected row IDs for passing to buttons
  const selectedRowIds = useMemo(() => {
    if (!hasSelectedRows || !data) return []

    const selectedIndices = Object.keys(rowSelection)
    return selectedIndices.map((index) =>
      data[parseInt(index)].consignmentImportId.toString()
    )
  }, [hasSelectedRows, data, rowSelection])

  // Handle combined services with validation
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

  // Wrapper function for TableActionsProject onDebitNote callback
  const handleDebitNoteFromActions = useCallback(
    (id: string) => {
      if (onDebitNote) {
        onDebitNote(id, "")
      }
    },
    [onDebitNote]
  )

  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    TableName.consignment_import
  )

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IConsignmentImport>[] = useMemo(
    () => [
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        size: 100,
        minSize: 80,
        maxSize: 150,
        cell: ({ row }) => {
          const consignmentImport = row.original
          const isSelected = row.getIsSelected()
          return (
            <TableActionsProject
              row={consignmentImport}
              idAccessor="consignmentImportId"
              onView={onConsignmentImportSelect}
              onEdit={onEditConsignmentImport}
              onDelete={onDeleteConsignmentImport}
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
          <div className="text-wrap">{row.getValue("debitNoteNo") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },

      {
        accessorKey: "awbNo",
        header: "AWB Number",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("awbNo") || "-"}</div>
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
        enableColumnFilter: true,
      },
      {
        accessorKey: "chargeName",
        header: "Charge",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("chargeName") || "-"}</div>
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
      },

      {
        accessorKey: "carrierTypeName",
        header: "Carrier Type",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("carrierTypeName") || "-"}
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },

      {
        accessorKey: "modeTypeName",
        header: "Mode Type",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("modeTypeName") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "consignmentTypeName",
        header: "Consignment Type",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("consignmentTypeName") || "-"}
          </div>
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: "landingTypeName",
        header: "Landing Type",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("landingTypeName") || "-"}
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "uomName",
        header: "UOM",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("uomName") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: "noOfPcs",
        header: "Number of Pieces",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("noOfPcs") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "weight",
        header: "Weight",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("weight") || "-"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 150,
      },
      {
        accessorKey: "pickupLocation",
        header: "Pickup Location",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("pickupLocation") || "-"}
          </div>
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: "deliveryLocation",
        header: "Delivery Location",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("deliveryLocation") || "-"}
          </div>
        ),
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
      {
        accessorKey: "clearedBy",
        header: "Cleared By",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("clearedBy") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "billEntryNo",
        header: "Bill Entry No",
        cell: ({ row }) => (
          <div className="text-wrap">{row.getValue("billEntryNo") || "-"}</div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "declarationNo",
        header: "Declaration No",
        cell: ({ row }) => (
          <div className="text-wrap">
            {row.getValue("declarationNo") || "-"}
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "receiveDate",
        header: "Date Received",
        cell: ({ row }) => {
          const raw = row.getValue("receiveDate")
          if (!raw) return "-"
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, dateFormat) : "-"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "deliverDate",
        header: "Date Delivered",
        cell: ({ row }) => {
          const raw = row.getValue("deliverDate")
          if (!raw) return "-"
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return (
            <div className="text-wrap">
              {date && isValid(date) ? format(date, dateFormat) : "-"}
            </div>
          )
        },
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "arrivalDate",
        header: "Date Arrived",
        cell: ({ row }) => {
          const raw = row.getValue("arrivalDate")
          if (!raw) return "-"
          let date: Date | null = null
          if (typeof raw === "string") {
            date = new Date(raw)
          } else if (raw instanceof Date) {
            date = raw
          }
          return date && isValid(date) ? format(date, dateFormat) : "-"
        },
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "referenceNo",
        header: "Reference No",
        cell: ({ row }) => <div>{row.getValue("referenceNo") || "-"}</div>,
        size: 120,
        minSize: 50,
        maxSize: 150,
      },
      {
        accessorKey: "isRefundedExpected",
        header: "Refund Expected",
        cell: ({ row }) => (
          <Badge
            variant={
              row.getValue("isRefundedExpected") ? "default" : "secondary"
            }
          >
            {row.getValue("isRefundedExpected") ? "Yes" : "No"}
          </Badge>
        ),
        size: 120,
        minSize: 50,
        maxSize: 150,
      },
      {
        accessorKey: "amountDeposited",
        header: "Amount Deposited",
        cell: ({ row }) => <div>{row.getValue("amountDeposited") || "-"}</div>,
        size: 130,
        minSize: 50,
        maxSize: 150,
      },
      {
        accessorKey: "refundInstrumentNo",
        header: "Refund Instrument No",
        cell: ({ row }) => (
          <div>{row.getValue("refundInstrumentNo") || "-"}</div>
        ),
        size: 150,
        minSize: 50,
        maxSize: 200,
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="default">{row.getValue("statusName") || "-"}</Badge>
        ),
        size: 120,
        minSize: 50,
        maxSize: 150,
      },

      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <div>{row.getValue("remarks") || "-"}</div>,
        size: 200,
        minSize: 50,
        maxSize: 300,
      },
      {
        accessorKey: "createBy",
        header: "Create By",
        cell: ({ row }) => <div>{row.getValue("createBy") || "-"}</div>,
        size: 120,
        minSize: 50,
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
          return date && isValid(date) ? format(date, datetimeFormat) : "-"
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: "editBy",
        header: "Edit By",
        cell: ({ row }) => <div>{row.getValue("editBy") || "-"}</div>,
        size: 120,
        minSize: 50,
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
          return date && isValid(date) ? format(date, datetimeFormat) : "-"
        },
        size: 180,
        minSize: 150,
        maxSize: 200,
      },
      {
        accessorKey: "editVersion",
        header: "Edit Version",
        cell: ({ row }) => (
          <Badge variant="default">{row.getValue("editVersion") || "0"}</Badge>
        ),
        size: 70,
        minSize: 50,
        maxSize: 80,
      },
    ],
    [
      dateFormat,
      datetimeFormat,
      onConsignmentImportSelect,
      onEditConsignmentImport,
      onDeleteConsignmentImport,
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

  // Apply grid settings after table is created
  useEffect(() => {
    if (gridSettings && table) {
      try {
        const colVisible = JSON.parse(gridSettings.grdColVisible || "{}")
        const colOrder = JSON.parse(gridSettings.grdColOrder || "[]")
        const colSize = JSON.parse(gridSettings.grdColSize || "{}")
        const sort = JSON.parse(gridSettings.grdSort || "[]")

        setColumnVisibility(colVisible)
        setSorting(sort)

        // Apply column sizing if available
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
        const newFilters: IConsignmentImportFilter = {
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
      const filters: IConsignmentImportFilter = {
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
        onCreate={onCreateConsignmentImport}
        columns={table.getAllLeafColumns()}
        tableName={TableName.consignment_import}
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
