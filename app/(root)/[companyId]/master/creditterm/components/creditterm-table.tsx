"use client"

import { useEffect, useRef, useState } from "react"
import { ICreditTerm, ICreditTermFilter } from "@/interfaces/creditterm"
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
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { format, isValid } from "date-fns"

import { MasterTransactionId, ModuleId, TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import {
  DraggableColumnHeader,
  TableActions,
  TableFooter,
  TableHeader,
} from "@/components/ui/data-table"
import { CustomTableBody } from "@/components/ui/data-table/data-table-body"
import {
  Table,
  TableBody,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface CreditTermsTableProps {
  data: ICreditTerm[]
  isLoading?: boolean
  onCreditTermSelect?: (creditTerm: ICreditTerm | null) => void
  onDeleteCreditTerm?: (creditTermId: string) => void
  onEditCreditTerm?: (creditTerm: ICreditTerm) => void
  onCreateCreditTerm?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: ICreditTermFilter) => void
  moduleId?: number
  transactionId?: number
}

export function CreditTermsTable({
  data,
  isLoading = false,
  onCreditTermSelect,
  onDeleteCreditTerm,
  onEditCreditTerm,
  onCreateCreditTerm,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
}: CreditTermsTableProps) {
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
    TableName.credit_term
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

  const columns: ColumnDef<ICreditTerm>[] = [
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
          idAccessor="creditTermId"
          onView={onCreditTermSelect}
          onEdit={onEditCreditTerm}
          onDelete={onDeleteCreditTerm}
        />
      ),
    },
    {
      accessorKey: "creditTermCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("creditTermCode")}</div>
      ),
      size: 120,
      minSize: 50,
      maxSize: 150,
      enableColumnFilter: true,
    },
    {
      accessorKey: "creditTermName",
      header: "Name",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
    },
    {
      accessorKey: "noDays",
      header: "Days",
      cell: ({ row }) => <div>{row.getValue("noDays") || "—"}</div>,
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
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
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
      const newFilters: ICreditTermFilter = {
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
      const filters: ICreditTermFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery])

  return (
    <div>
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateCreditTerm}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName={TableName.credit_term}
        hideCreateButton={false}
        moduleId={moduleId || ModuleId.master}
        transactionId={transactionId || MasterTransactionId.credit_terms}
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
              <CustomTableBody
                table={table}
                virtualRows={virtualRows}
                paddingTop={paddingTop}
                paddingBottom={paddingBottom}
                isLoading={isLoading}
                columns={columns}
              />
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
