"use client"

import { useEffect, useRef, useState } from "react"
import { ICustomer, ICustomerFilter } from "@/interfaces/customer"
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
  IconCircleCheckFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { format, isValid } from "date-fns"

import { TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { DraggableColumnHeader, TableFooter } from "@/components/ui/data-table"
import { TableHeaderCustom } from "@/components/ui/data-table/data-table-header-custom"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface CustomerTableProps {
  data: ICustomer[]
  isLoading?: boolean
  onCustomerSelect?: (customer: ICustomer | undefined) => void
  onFilterChange?: (filters: ICustomerFilter) => void
  onRefresh?: () => void
  moduleId: number
  transactionId: number
}

export function CustomerTable({
  data,
  isLoading = false,
  onCustomerSelect,
  onFilterChange,
  onRefresh,
  moduleId,
  transactionId,
}: CustomerTableProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
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
    TableName.customer
  )

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

        if (colOrder.length > 0) {
          table.setColumnOrder(colOrder)
        }
      } catch (error) {
        console.error("Error parsing grid settings:", error)
      }
    }
  }, [gridSettings])

  const columns: ColumnDef<ICustomer>[] = [
    {
      accessorKey: "customerName",
      header: "Name",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
    },
    {
      accessorKey: "customerCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("customerCode")}</div>
      ),
      size: 120,
      minSize: 50,
      maxSize: 150,
      enableColumnFilter: true,
    },

    {
      accessorKey: "customerRegNo",
      header: "Registration No",
      cell: ({ row }) => <div>{row.getValue("customerRegNo") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "creditTermName",
      header: "Credit Term",
      cell: ({ row }) => <div>{row.getValue("creditTermName") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "bankName",
      header: "Bank",
      cell: ({ row }) => <div>{row.getValue("bankName") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "currencyName",
      header: "Currency",
      cell: ({ row }) => <div>{row.getValue("currencyName") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "accSetupName",
      header: "Account Setup",
      cell: ({ row }) => <div>{row.getValue("accSetupName") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "supplierName",
      header: "Supplier",
      cell: ({ row }) => <div>{row.getValue("supplierName") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "customerOtherName",
      header: "Other Name",
      cell: ({ row }) => <div>{row.getValue("customerOtherName") || "—"}</div>,
      size: 200,
      minSize: 50,
      maxSize: 300,
    },
    {
      accessorKey: "customerShortName",
      header: "Short Name",
      cell: ({ row }) => <div>{row.getValue("customerShortName") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => <div>{row.getValue("remarks") || "—"}</div>,
      size: 200,
      minSize: 50,
      maxSize: 300,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => <div>{row.getValue("createBy") || "—"}</div>,
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
      cell: ({ row }) => <div>{row.getValue("editBy") || "—"}</div>,
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
  ]

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
      const newFilters: ICustomerFilter = {
        search: query,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
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

  useEffect(() => {
    if (!data?.length && onFilterChange) {
      const filters: ICustomerFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery, data, onFilterChange])

  return (
    <div>
      <TableHeaderCustom
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName={TableName.customer}
        moduleId={moduleId}
        transactionId={transactionId}
      />

      <div
        ref={tableContainerRef}
        className="relative overflow-auto"
        style={{ height: "490px" }}
      >
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
              {virtualRows.length > 0 ? (
                <>
                  <tr style={{ height: `${paddingTop}px` }} />
                  {virtualRows.map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index]
                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => onCustomerSelect?.(row.original)}
                        className="hover:bg-muted/50 cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
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
                      {isLoading ? "Loading..." : "No customers found."}
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
