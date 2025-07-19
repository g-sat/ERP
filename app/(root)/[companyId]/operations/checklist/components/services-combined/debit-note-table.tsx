"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  Edit,
  Eye,
  Filter,
  GripVertical,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { JobOrder_DebitNote } from "@/lib/api-routes"
import { TableName } from "@/lib/utils"
import { useDelete } from "@/hooks/use-common"
import { useGetGridLayout } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DebitNoteTableProps {
  data: IDebitNoteDt[]
  isLoading?: boolean
  onDebitNoteSelect?: (debitNote: IDebitNoteDt | undefined) => void
  onDeleteDebitNote?: (debitNoteId: string) => void
  onEditDebitNote?: (debitNote: IDebitNoteDt) => void
  onCreateDebitNote?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: IAccountGroupFilter) => void
  onDataReorder?: (reorderedData: IDebitNoteDt[]) => void
  moduleId?: number
  transactionId?: number
  isConfirmed?: boolean
}

// Drag Handle Component
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Draggable Row Component
function DraggableRow({ row }: { row: Row<IDebitNoteDt> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.itemNo.toString(),
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

// Enhanced Table Header Component
interface EnhancedTableHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh?: () => void
  onCreate?: () => void
  onDeleteSelected?: (selectedIds: string[]) => void
  hasSelectedRows: boolean
  selectedRowsCount: number
  totalRowsCount: number
  isLoading?: boolean
  selectedRowIds: string[]
}

function EnhancedTableHeader({
  searchQuery,
  onSearchChange,
  onRefresh,
  onCreate,
  onDeleteSelected,
  hasSelectedRows,
  selectedRowsCount,
  totalRowsCount,
  isLoading,
  selectedRowIds,
}: EnhancedTableHeaderProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Debit Note Details
            {hasSelectedRows && (
              <Badge variant="secondary" className="ml-2">
                {selectedRowsCount} of {totalRowsCount} selected
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasSelectedRows && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteSelected?.(selectedRowIds)}
                      disabled={isLoading}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete Selected
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Delete {selectedRowsCount} selected items
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" onClick={onCreate} disabled={isLoading}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add New
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create new debit note</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search debit notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            <span>Total: {totalRowsCount} items</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Row Actions Component
interface EnhancedRowActionsProps {
  row: IDebitNoteDt
  onView?: (debitNote: IDebitNoteDt) => void
  onEdit?: (debitNote: IDebitNoteDt) => void
  onDelete?: (debitNoteId: string) => void
  isConfirmed?: boolean
}

function EnhancedRowActions({
  row,
  onView,
  onEdit,
  onDelete,
  isConfirmed,
}: EnhancedRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView?.(row)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {!isConfirmed && (
          <DropdownMenuItem onClick={() => onEdit?.(row)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {!isConfirmed && (
          <DropdownMenuItem
            onClick={() => onDelete?.(row.itemNo.toString())}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
  onDataReorder,
  moduleId,
  transactionId,
  isConfirmed,
}: DebitNoteTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [tableData, setTableData] = useState<IDebitNoteDt[]>(data)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Update table data when props data changes
  useEffect(() => {
    setTableData(data)
    // Clear row selection when data changes to prevent stale indices
    setRowSelection({})
  }, [data])

  // Debit note details delete mutation
  const deleteDebitNoteDetailsMutation = useDelete(
    `${JobOrder_DebitNote.saveDetails}`
  )

  console.log("DebitNoteTable data:", tableData)
  console.log("DebitNoteTable data length:", tableData?.length)
  console.log(isConfirmed, "isConfirmed debit note table")

  // Get selected rows count and IDs
  const selectedRowsCount = Object.keys(rowSelection).length
  const hasSelectedRows = selectedRowsCount > 0
  const totalRowsCount = tableData?.length || 0

  // Get selected row IDs for bulk operations
  const selectedRowIds = useMemo(() => {
    if (!hasSelectedRows || !tableData) return []

    const selectedIndices = Object.keys(rowSelection)
    const ids = selectedIndices
      .map((index) => {
        const dataIndex = parseInt(index)
        const item = tableData[dataIndex]
        if (!item) {
          console.warn(`No item found at index ${dataIndex} in tableData`)
          return null
        }
        return item.itemNo.toString()
      })
      .filter((id): id is string => id !== null)

    console.log("Selected row IDs:", ids, "from indices:", selectedIndices)
    return ids
  }, [hasSelectedRows, tableData, rowSelection])

  // Handle bulk delete
  const handleBulkDelete = useCallback(
    async (selectedIds: string[]) => {
      if (selectedIds.length === 0) {
        toast.error("No items selected for deletion")
        return
      }

      try {
        const deletePromises = selectedIds.map(async (itemNo) => {
          const itemToDelete = tableData.find(
            (item) => item.itemNo.toString() === itemNo
          )
          if (itemToDelete) {
            return deleteDebitNoteDetailsMutation.mutateAsync(itemNo)
          }
          return null
        })

        const results = await Promise.all(deletePromises)
        const successfulDeletes = results.filter(
          (result) => result && result.result > 0
        )

        if (successfulDeletes.length > 0) {
          toast.success(
            `Successfully deleted ${successfulDeletes.length} item(s)`
          )
          setRowSelection({})
          if (onRefresh) {
            onRefresh()
          }
        } else {
          toast.error("Failed to delete selected items")
        }
      } catch (error) {
        console.error("Error deleting debit note details:", error)
        toast.error("Failed to delete selected items")
      }
    },
    [tableData, deleteDebitNoteDetailsMutation, onRefresh]
  )

  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    TableName.job_order
  )

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IDebitNoteDt>[] = useMemo(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.itemNo.toString()} />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() ? true : false)
              }
              onChange={(e) =>
                table.toggleAllPageRowsSelected(!!e.target.checked)
              }
              className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(!!e.target.checked)}
              className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "itemNo",
        header: ({ column }) => (
          <div className="flex items-center gap-2">
            <span>Item No</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        ),
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
            <EnhancedRowActions
              row={debitNote}
              onView={onDebitNoteSelect}
              onEdit={onEditDebitNote}
              onDelete={onDeleteDebitNote}
              isConfirmed={isConfirmed}
            />
          )
        },
      },
    ],
    [onDebitNoteSelect, onEditDebitNote, onDeleteDebitNote, isConfirmed]
  )

  const table = useReactTable({
    data: tableData,
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
    // Force table to update when data changes
    getRowId: (row) => row.itemNo.toString(),
  })

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

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => {
    if (!tableData || tableData.length === 0) return []
    return tableData
      .map(({ itemNo }) => itemNo?.toString())
      .filter((id): id is string => id !== undefined && id !== null)
  }, [tableData])

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (tableData && tableData.length > 0) {
        table.setGlobalFilter(query)
      } else if (onFilterChange) {
        const newFilters: IAccountGroupFilter = {
          search: query,
          sortOrder: sorting[0]?.desc ? "desc" : "asc",
        }
        onFilterChange(newFilters)
      }
    },
    [tableData, onFilterChange, sorting, table]
  )

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (active && over && active.id !== over.id) {
        setTableData((data) => {
          const oldIndex = dataIds.indexOf(active.id)
          const newIndex = dataIds.indexOf(over.id)

          // Safety check to ensure indices are valid
          if (
            oldIndex === -1 ||
            newIndex === -1 ||
            !data ||
            data.length === 0
          ) {
            console.warn("Invalid drag indices or empty data")
            return data
          }

          const newData = arrayMove(data, oldIndex, newIndex)

          // Update ItemNo values to reflect new order
          const updatedData = newData.map((item, index) => ({
            ...item,
            itemNo: index + 1, // Reorder ItemNo starting from 1
          }))

          // Notify parent component about the reorder
          if (onDataReorder) {
            onDataReorder(updatedData)
          }

          toast.success("Row order updated successfully")
          return updatedData
        })
      }
    },
    [dataIds, onDataReorder]
  )

  useEffect(() => {
    if (!tableData?.length && onFilterChange) {
      const filters: IAccountGroupFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery, tableData, onFilterChange])

  return (
    <div className="w-full space-y-4">
      <EnhancedTableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateDebitNote}
        onDeleteSelected={handleBulkDelete}
        hasSelectedRows={hasSelectedRows}
        selectedRowsCount={selectedRowsCount}
        totalRowsCount={totalRowsCount}
        isLoading={isLoading}
        selectedRowIds={selectedRowIds}
      />

      <Card>
        <CardContent className="p-0">
          <div
            ref={tableContainerRef}
            className="relative w-full overflow-auto"
            style={{ height: "500px", width: "100%" }}
          >
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                            <Search className="h-8 w-8" />
                            <p>No debit note details found.</p>
                            <p className="text-sm">
                              Try adjusting your search criteria.
                            </p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DebitNoteTable
