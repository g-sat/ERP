"use client"

import { useEffect, useRef, useState } from "react"
import { ITariff, ITariffFilter } from "@/interfaces/tariff"
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
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { Task } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-setting"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DraggableColumnHeader,
  TableActions,
  TableFooter,
  TableHeader,
} from "@/components/ui/data-table"
import { CustomTableBody } from "@/components/ui/data-table/data-table-body"
import {
  Table,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface TariffTableProps {
  data: ITariff[]
  isLoading?: boolean
  onDeleteTariff?: (tariffId: string, task: string) => void
  onEditTariff?: (tariff: ITariff) => void
  onRefresh?: () => void
  onFilterChange?: (filters: ITariffFilter) => void
  onSelectionChange?: (selectedIds: string[]) => void
  moduleId?: number
  transactionId?: number
  companyId: string
}

export function TariffTable({
  data,
  isLoading = false,
  onDeleteTariff,
  onEditTariff,
  onRefresh,
  onFilterChange,
  onSelectionChange,
  moduleId,
  transactionId,
  companyId,
}: TariffTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rowSelection, setRowSelection] = useState({})
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    "tariff",
    companyId
  )

  // Define columns for the table
  const columns: ColumnDef<ITariff>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      size: 100,
      minSize: 80,
      maxSize: 150,
      cell: ({ row }) => (
        <TableActions
          row={row.original}
          idAccessor="tariffId"
          onEdit={onEditTariff}
          onDelete={
            onDeleteTariff
              ? (id: string) => {
                  const tariff = data.find((t) => t.tariffId?.toString() === id)
                  if (tariff) {
                    onDeleteTariff(id, tariff.taskName || "")
                  }
                }
              : undefined
          }
        />
      ),
    },
    {
      accessorKey: "portName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Port</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("portName")}</div>,
    },
    {
      accessorKey: "taskName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Task</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
      cell: ({ row }) => <div>{row.getValue("taskName")}</div>,
    },
    {
      accessorKey: "chargeName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Charge</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "visaTypeName",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Visa Type</span>
          <div className="flex flex-col">
            <ArrowUpIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(false)}
            />
            <ArrowDownIcon
              className={cn(
                "h-3 w-3 transform",
                column.getIsSorted() === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground/50"
              )}
              onClick={() => column.toggleSorting(true)}
            />
          </div>
        </div>
      ),
      cell: ({ row }) => {
        const taskId = row.original.taskId
        const taskName = row.original.taskName
        const visaTypeName = row.getValue("visaTypeName") as string

        // Only show visa type name if it's VisaService task
        if (taskId === Task.VisaService || taskName === "Visa Service") {
          return <div>{visaTypeName || "-"}</div>
        }
        return <div>-</div>
      },
    },
    {
      accessorKey: "uomName",
      header: "UOM",
    },
    {
      accessorKey: "displayRate",
      header: "Display Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("displayRate")}</div>
      ),
    },
    {
      accessorKey: "basicRate",
      header: "Basic Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("basicRate")}</div>
      ),
    },
    {
      accessorKey: "minUnit",
      header: "Min Unit",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("minUnit")}</div>
      ),
    },
    {
      accessorKey: "maxUnit",
      header: "Max Unit",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("maxUnit")}</div>
      ),
    },
    {
      accessorKey: "isAdditional",
      header: "Is Additional",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isAdditional") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "additionalUnit",
      header: "Additional Unit",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("additionalUnit")}</div>
      ),
    },
    {
      accessorKey: "additionalRate",
      header: "Additional Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("additionalRate")}</div>
      ),
    },
    {
      accessorKey: "isPrepayment",
      header: "Is Prepayment",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isPrepayment") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "prepaymentPercentage",
      header: "Prepayment %",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("prepaymentPercentage")}</div>
      ),
    },
    {
      accessorKey: "isDefault",
      header: "Default",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isDefault") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.getValue("isActive") ? (
            <IconCircleCheckFilled className="h-4 w-4 text-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
  ]

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
      pagination: { pageIndex: currentPage - 1, pageSize },
      globalFilter: searchQuery,
    },
  })

  useEffect(() => {
    if (gridSettings) {
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

        if (colOrder.length > 0 && table) {
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

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (data && data.length > 0) {
      table.setGlobalFilter(query)
    } else if (onFilterChange) {
      const newFilters: ITariffFilter = {
        search: query,
      }
      onFilterChange(newFilters)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    table.setPageIndex(page - 1)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    table.setPageSize(size)
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

  // Handle row selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows
      const selectedIds = selectedRows
        .map((row) => row.original.tariffId?.toString() || "")
        .filter(Boolean)
      onSelectionChange(selectedIds)
    }
  }, [rowSelection, onSelectionChange, table])

  useEffect(() => {
    if (!data?.length && onFilterChange) {
      const filters: ITariffFilter = {
        search: searchQuery,
      }
      onFilterChange(filters)
    }
  }, [searchQuery, data, onFilterChange])

  return (
    <div>
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName="Tariffs"
        hideCreateButton={true}
        moduleId={moduleId || 0}
        transactionId={transactionId || 0}
        companyId={companyId}
      />

      <div
        ref={tableContainerRef}
        className="relative overflow-auto"
        style={{ height: "500px" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="w-full table-auto">
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
            <CustomTableBody
              table={table}
              virtualRows={virtualRows}
              paddingTop={paddingTop}
              paddingBottom={paddingBottom}
              isLoading={isLoading}
              columns={columns}
            />
          </Table>
        </DndContext>
      </div>

      <TableFooter
        currentPage={currentPage}
        totalPages={Math.ceil(data.length / pageSize)}
        pageSize={pageSize}
        totalRecords={data.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 50, 100, 500]}
      />
    </div>
  )
}
