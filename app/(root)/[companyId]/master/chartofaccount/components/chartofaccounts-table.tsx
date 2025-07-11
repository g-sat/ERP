"use client"

import { useEffect, useRef, useState } from "react"
import {
  IChartofAccount,
  IChartofAccountFilter,
} from "@/interfaces/chartofaccount"
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

import { MasterTransactionId, TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-setting"
import { Badge } from "@/components/ui/badge"
import {
  DraggableColumnHeader,
  TableActions,
  TableFooter,
  TableHeader,
} from "@/components/ui/data-table"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface ChartOfAccountsTableProps {
  data: IChartofAccount[]
  isLoading?: boolean
  onChartOfAccountSelect?: (chartOfAccount: IChartofAccount | null) => void
  onDeleteChartOfAccount?: (chartOfAccountId: number) => void
  onEditChartOfAccount?: (chartOfAccount: IChartofAccount) => void
  onCreateChartOfAccount?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: IChartofAccountFilter) => void
  moduleId?: number
  transactionId?: number
  companyId: string
}

export function ChartOfAccountsTable({
  data,
  isLoading = false,
  onChartOfAccountSelect,
  onDeleteChartOfAccount,
  onEditChartOfAccount,
  onCreateChartOfAccount,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
  companyId,
}: ChartOfAccountsTableProps) {
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
    TableName.chart_of_account,
    companyId
  )

  useEffect(() => {
    if (gridSettings) {
      try {
        const colVisible = JSON.parse(gridSettings.grdColVisible || "{}")
        const colSize = JSON.parse(gridSettings.grdColSize || "{}")
        const sort = JSON.parse(gridSettings.grdSort || "[]")

        setColumnVisibility(colVisible)
        setSorting(sort)
        if (Object.keys(colSize).length > 0) {
          setColumnSizing(colSize)
        }
      } catch (error) {
        console.error("Error parsing grid settings:", error)
      }
    }
  }, [gridSettings])

  const columns: ColumnDef<IChartofAccount>[] = [
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      size: 120,
      minSize: 100,
      maxSize: 130,
      cell: ({ row }) => (
        <TableActions
          row={row.original}
          idAccessor="glId"
          onView={onChartOfAccountSelect}
          onEdit={onEditChartOfAccount}
          onDelete={(id) => onDeleteChartOfAccount?.(Number(id))}
        />
      ),
    },
    {
      accessorKey: "glCode",
      header: "GL Code",
      cell: ({ row }) => (
        <div className="truncate font-medium" title={row.getValue("glCode")}>
          {row.getValue("glCode")}
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
      enableColumnFilter: true,
    },
    {
      accessorKey: "glName",
      header: "GL Name",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("glName") || "—"}>
          {row.getValue("glName") || "—"}
        </div>
      ),
      size: 200,
      minSize: 150,
      maxSize: 300,
      enableColumnFilter: true,
    },
    {
      accessorKey: "accTypeName",
      header: "Account Type",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("accTypeName") || "—"}>
          {row.getValue("accTypeName") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "accGroupName",
      header: "Account Group",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("accGroupName") || "—"}>
          {row.getValue("accGroupName") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "coaCategoryName1",
      header: "Category 1",
      cell: ({ row }) => (
        <div
          className="truncate"
          title={row.getValue("coaCategoryName1") || "—"}
        >
          {row.getValue("coaCategoryName1") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "coaCategoryName2",
      header: "Category 2",
      cell: ({ row }) => (
        <div
          className="truncate"
          title={row.getValue("coaCategoryName2") || "—"}
        >
          {row.getValue("coaCategoryName2") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "coaCategoryName3",
      header: "Category 3",
      cell: ({ row }) => (
        <div
          className="truncate"
          title={row.getValue("coaCategoryName3") || "—"}
        >
          {row.getValue("coaCategoryName3") || "—"}
        </div>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isSysControl",
      header: "System Control",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isSysControl") ? "default" : "secondary"}>
          {row.getValue("isSysControl") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isSysControl") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isHeading",
      header: "Heading",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isHeading") ? "default" : "secondary"}>
          {row.getValue("isHeading") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isDeptMandatory",
      header: "Dept Mandatory",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isDeptMandatory") ? "default" : "secondary"}
        >
          {row.getValue("isDeptMandatory") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isDeptMandatory") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isBargeMandatory",
      header: "Barge Mandatory",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isBargeMandatory") ? "default" : "secondary"}
        >
          {row.getValue("isBargeMandatory") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isBargeMandatory") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isJobControl",
      header: "Job Control",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isJobControl") ? "default" : "secondary"}>
          {row.getValue("isJobControl") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isJobControl") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isBankControl",
      header: "Bank Control",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isBankControl") ? "default" : "secondary"}
        >
          {row.getValue("isBankControl") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isBankControl") ? "Yes" : "No"}
        </Badge>
      ),
      size: 120,
      minSize: 100,
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
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "seqNo",
      header: "Sequence",
      cell: ({ row }) => (
        <div className="truncate" title={String(row.getValue("seqNo"))}>
          {row.getValue("seqNo")}
        </div>
      ),
      size: 100,
      minSize: 80,
      maxSize: 120,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("remarks") || "—"}>
          {row.getValue("remarks") || "—"}
        </div>
      ),
      size: 200,
      minSize: 150,
      maxSize: 300,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => (
        <div className="truncate" title={row.getValue("createBy") || "—"}>
          {row.getValue("createBy") || "—"}
        </div>
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
        if (typeof raw === "string") date = new Date(raw)
        else if (raw instanceof Date) date = raw
        const formattedDate =
          date && isValid(date) ? format(date, datetimeFormat) : "-"
        return (
          <div className="truncate" title={formattedDate}>
            {formattedDate}
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
        <div className="truncate" title={row.getValue("editBy") || "—"}>
          {row.getValue("editBy") || "—"}
        </div>
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
        if (typeof raw === "string") date = new Date(raw)
        else if (raw instanceof Date) date = raw
        const formattedDate =
          date && isValid(date) ? format(date, datetimeFormat) : "-"
        return (
          <div className="truncate" title={formattedDate}>
            {formattedDate}
          </div>
        )
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
      const newFilters: IChartofAccountFilter = {
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

  return (
    <div>
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateChartOfAccount}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName={TableName.chart_of_account}
        hideCreateButton={false}
        moduleId={moduleId || 1}
        transactionId={transactionId || MasterTransactionId.chart_of_account}
        companyId={companyId}
      />

      <div
        ref={tableContainerRef}
        className="relative w-full overflow-auto"
        style={{ height: "470px" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="relative w-full table-fixed">
            <TanstackTableHeader className="bg-muted">
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
            <TableBody>
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
                              className={
                                isActions
                                  ? "bg-background sticky left-0 z-10"
                                  : ""
                              }
                              style={{
                                position: isActions ? "sticky" : "relative",
                                left: isActions ? 0 : "auto",
                                zIndex: isActions ? 10 : 1,
                                width: cell.column.getSize(),
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
                      {isLoading ? "Loading..." : "No data found."}
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
