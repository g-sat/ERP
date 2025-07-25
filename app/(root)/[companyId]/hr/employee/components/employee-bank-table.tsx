"use client"

import { useEffect, useRef, useState } from "react"
import { IEmployeeBank } from "@/interfaces/employee"
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
import { DraggableColumnHeader, TableActions } from "@/components/ui/data-table"
import { CustomTableBody } from "@/components/ui/data-table/data-table-body"
import { TableHeader } from "@/components/ui/data-table/data-table-header"
import {
  Table,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface EmployeeBankTableProps {
  data: IEmployeeBank[]
  isLoading?: boolean
  onEmployeeBankSelect?: (employeeBank: IEmployeeBank | undefined) => void
  onDeleteEmployeeBank?: (employeeBankId: string) => Promise<void>
  onEditEmployeeBank?: (employeeBank: IEmployeeBank | undefined) => void
  onCreateEmployeeBank?: () => void
  onRefresh?: () => void
  moduleId?: number
  transactionId?: number
}

export function EmployeeBankTable({
  data,
  isLoading = false,
  onEmployeeBankSelect,
  onDeleteEmployeeBank,
  onEditEmployeeBank,
  onCreateEmployeeBank,
  onRefresh,
  moduleId,
  transactionId,
}: EmployeeBankTableProps) {
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
    TableName.employee_bank
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

  const columns: ColumnDef<IEmployeeBank>[] = [
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      size: 100,
      minSize: 80,
      maxSize: 150,
      cell: ({ row }) => {
        const employeeBank = row.original
        return (
          <TableActions
            row={employeeBank}
            idAccessor="itemNo"
            onView={onEmployeeBankSelect}
            onEdit={onEditEmployeeBank}
            onDelete={onDeleteEmployeeBank}
          />
        )
      },
    },
    {
      accessorKey: "itemNo",
      header: "Item No",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("itemNo")}</div>
      ),
      size: 100,
      minSize: 50,
      maxSize: 120,
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
    },
    {
      accessorKey: "accountNo",
      header: "Account Number",
      size: 150,
      minSize: 50,
      maxSize: 200,
      enableColumnFilter: true,
    },
    {
      accessorKey: "swiftCode",
      header: "Swift Code",
      cell: ({ row }) => <div>{row.getValue("swiftCode") || "—"}</div>,
      size: 120,
      minSize: 50,
      maxSize: 150,
    },
    {
      accessorKey: "iban",
      header: "IBAN",
      cell: ({ row }) => <div>{row.getValue("iban") || "—"}</div>,
      size: 150,
      minSize: 50,
      maxSize: 200,
    },
    {
      accessorKey: "isDefaultBank",
      header: "Default Bank",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isDefaultBank") ? "default" : "secondary"}
        >
          {row.getValue("isDefaultBank") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isDefaultBank") ? "Yes" : "No"}
        </Badge>
      ),
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

    if (active.id !== over?.id) {
      const oldIndex = table
        .getAllColumns()
        .findIndex((col) => col.id === active.id)
      const newIndex = table
        .getAllColumns()
        .findIndex((col) => col.id === over?.id)

      const newColumnOrder = arrayMove(
        table.getAllColumns().map((col) => col.id),
        oldIndex,
        newIndex
      )

      table.setColumnOrder(newColumnOrder)
    }
  }

  return (
    <div>
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateEmployeeBank}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName={TableName.employee_bank}
        hideCreateButton={false}
        moduleId={moduleId || ModuleId.master}
        transactionId={transactionId || MasterTransactionId.employee}
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
            <CustomTableBody
              table={table}
              virtualRows={virtualRows}
              paddingTop={paddingTop}
              paddingBottom={paddingBottom}
              isLoading={isLoading}
              columns={columns}
              noDataMessage="No employee banks found."
            />
          </Table>
        </DndContext>
      </div>
    </div>
  )
}
