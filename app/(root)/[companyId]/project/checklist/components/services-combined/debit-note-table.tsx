"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IAccountGroupFilter } from "@/interfaces/accountgroup"
import { IDebitNoteDt } from "@/interfaces/checklist"
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

import { ModuleId, ProjectTransactionId, TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-setting"
import { Badge } from "@/components/ui/badge"
import { DraggableColumnHeader } from "@/components/ui/data-table"
import { TableActionsProject } from "@/components/ui/data-table/data-table-actions-project"
import { TableHeaderDebitNote } from "@/components/ui/data-table/data-table-header-debitnote"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface DebitNoteTableProps {
  data: IDebitNoteDt[]
  isLoading?: boolean
  onDebitNoteSelect?: (debitNote: IDebitNoteDt | undefined) => void
  onDeleteDebitNote?: (debitNoteId: string) => void
  onEditDebitNote?: (debitNote: IDebitNoteDt) => void
  onCreateDebitNote?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: IAccountGroupFilter) => void
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
  companyId: string
}

export function DebitNoteTable({
  data,
  isLoading = false,
  onDebitNoteSelect,
  onDeleteDebitNote,
  onEditDebitNote,
  onCreateDebitNote,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  isConfirmed,
  companyId,
}: DebitNoteTableProps) {
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

  console.log("DebitNoteTable data:", data)
  console.log("DebitNoteTable data length:", data?.length)
  console.log(isConfirmed, "isConfirmed debit note table")

  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    TableName.job_order,
    companyId
  )

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IDebitNoteDt>[] = useMemo(
    () => [
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        size: 100,
        minSize: 80,
        maxSize: 150,
        cell: ({ row }) => {
          const debitNote = row.original
          return (
            <TableActionsProject
              row={debitNote}
              idAccessor="itemNo"
              onView={onDebitNoteSelect}
              onEdit={onEditDebitNote}
              onDelete={onDeleteDebitNote}
              onSelect={onDebitNoteSelect}
              isConfirmed={isConfirmed}
            />
          )
        },
      },
      {
        accessorKey: "itemNo",
        header: "Item No",
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.getValue("itemNo") || "—"}
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue("remarks") || "—"}
          </div>
        ),
        size: 200,
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: "qty",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("qty") || "0"}</div>
        ),
        size: 100,
        minSize: 80,
        maxSize: 120,
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("unitPrice") === "number"
              ? (row.getValue("unitPrice") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "amt",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("amt") === "number"
              ? (row.getValue("amt") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "totAmt",
        header: "Total Amount",
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {typeof row.getValue("totAmt") === "number"
              ? (row.getValue("totAmt") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 130,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "gstPercentage",
        header: "GST %",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("gstPercentage") === "number"
              ? `${row.getValue("gstPercentage") as number}%`
              : "0%"}
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
      {
        accessorKey: "gstAmt",
        header: "GST Amount",
        cell: ({ row }) => (
          <div className="text-right">
            {typeof row.getValue("gstAmt") === "number"
              ? (row.getValue("gstAmt") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 120,
        minSize: 100,
        maxSize: 150,
      },
      {
        accessorKey: "totAftGstAmt",
        header: "Total After GST",
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {typeof row.getValue("totAftGstAmt") === "number"
              ? (row.getValue("totAftGstAmt") as number).toFixed(2)
              : "0.00"}
          </div>
        ),
        size: 140,
        minSize: 120,
        maxSize: 160,
      },

      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="flex items-center justify-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white"
            >
              {row.getValue("editVersion") || "0"}
            </Badge>
          </div>
        ),
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
      // Removed createBy, createDate, editBy, editDate columns as they don't exist in IDebitNoteDt interface
    ],
    [onDebitNoteSelect, onEditDebitNote, onDeleteDebitNote]
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

  console.log("Search query:", searchQuery)
  console.log("Column filters:", columnFilters)
  console.log("Column visibility:", columnVisibility)

  // Apply grid settings after table is created
  useEffect(() => {
    if (gridSettings && table) {
      try {
        const colVisible = JSON.parse(
          gridSettings.grdColVisible || "{}"
        ) as VisibilityState
        const colOrder = JSON.parse(
          gridSettings.grdColOrder || "[]"
        ) as string[]
        const colSize = JSON.parse(gridSettings.grdColSize || "{}") as Record<
          string,
          number
        >
        const sort = JSON.parse(gridSettings.grdSort || "[]") as SortingState

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

  console.log("Table rows:", table.getRowModel().rows.length)
  console.log("Table data:", table.getRowModel().rows)

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
        const newFilters: IAccountGroupFilter = {
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
      const filters: IAccountGroupFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery, data, onFilterChange])

  return (
    <div
      ref={tableContainerRef}
      className="relative w-full overflow-auto"
      style={{ height: "450px", width: "100%" }}
    >
      <TableHeaderDebitNote
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateDebitNote}
        columns={table.getAllLeafColumns()}
        tableName={TableName.job_order}
        moduleId={moduleId || ModuleId.project}
        transactionId={transactionId || ProjectTransactionId.job_order}
        isConfirmed={isConfirmed}
      />

      {/* Debug: Show raw data */}
      {/* <div className="mb-4 rounded border bg-yellow-100 p-4">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Data length: {data?.length || 0}</p>
        <p>Table rows: {table.getRowModel().rows.length}</p>
        <p>Is loading: {isLoading ? "Yes" : "No"}</p>
        <pre className="mt-2 text-xs">
          {JSON.stringify(data?.slice(0, 2), null, 2)}
        </pre>
      </div> */}

      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
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
              {table.getRowModel().rows.length > 0 ? (
                <>
                  {table.getRowModel().rows.map((row) => (
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
                  ))}
                </>
              ) : (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {isLoading
                        ? "Loading..."
                        : "No debit note details found."}
                    </TableCell>
                  </TableRow>
                  {Array.from({ length: 9 }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell
                        colSpan={columns.length}
                        className="h-10"
                      ></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  )
}

export default DebitNoteTable
