"use client"

import { useEffect, useRef, useState } from "react"
import { IEmployee, IEmployeeFilter } from "@/interfaces/employee"
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
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface EmployeesTableProps {
  data: IEmployee[]
  isLoading?: boolean
  onEmployeeSelect?: (employee: IEmployee | undefined) => void
  onDeleteEmployee?: (employeeId: string) => void
  onEditEmployee?: (employee: IEmployee) => void
  onCreateEmployee?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: IEmployeeFilter) => void
  moduleId?: number
  transactionId?: number
}

export function EmployeesTable({
  data,
  isLoading = false,
  onEmployeeSelect,
  onDeleteEmployee,
  onEditEmployee,
  onCreateEmployee,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
}: EmployeesTableProps) {
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
    TableName.employee
  )

  const columns: ColumnDef<IEmployee>[] = [
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      size: 100,
      minSize: 80,
      maxSize: 150,
      cell: ({ row }) => {
        const employee = row.original
        return (
          <TableActions
            row={employee}
            idAccessor="employeeId"
            onView={onEmployeeSelect}
            onEdit={onEditEmployee}
            onDelete={onDeleteEmployee}
          />
        )
      },
    },
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => {
        const photo = row.getValue("photo") as string
        return (
          <div className="flex items-center justify-center">
            {photo ? (
              <img
                src={
                  photo.startsWith("data:") || photo.length > 100
                    ? `data:image/jpeg;base64,${photo}`
                    : photo
                }
                alt="Employee photo"
                className="h-10 w-10 rounded-full border object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/uploads/employee/default.png"
                }}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                <img
                  src="/uploads/employee/default.png"
                  alt="Default employee photo"
                  className="h-10 w-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML =
                        '<span class="text-xs text-gray-500">No Photo</span>'
                    }
                  }}
                />
              </div>
            )}
          </div>
        )
      },
      size: 80,
      minSize: 60,
      maxSize: 100,
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("code")}</div>
      ),
      size: 120,
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const { firstName = "", lastName = "", otherName = "" } = row.original
        return (
          <span>{`${firstName} ${lastName} ${otherName}`.trim() || "—"}</span>
        )
      },
      size: 200,
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => <div>{row.getValue("gender") || "—"}</div>,
      size: 100,
    },
    {
      accessorKey: "martialStatus",
      header: "Marital Status",
      cell: ({ row }) => <div>{row.getValue("martialStatus") || "—"}</div>,
      size: 120,
    },
    {
      accessorKey: "dob",
      header: "DOB",
      cell: ({ row }) => {
        const raw = row.getValue("dob")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, "dd/MM/yyyy") : "—"
      },
      size: 120,
    },
    {
      accessorKey: "joinDate",
      header: "Join Date",
      cell: ({ row }) => {
        const raw = row.getValue("joinDate")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, "dd/MM/yyyy") : "—"
      },
      size: 120,
    },
    {
      accessorKey: "lastDate",
      header: "Last Date",
      cell: ({ row }) => {
        const raw = row.getValue("lastDate")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, "dd/MM/yyyy") : "—"
      },
      size: 120,
    },
    {
      accessorKey: "phoneNo",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phoneNo") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "bankName",
      header: "Bank",
      cell: ({ row }) => <div>{row.getValue("bankName") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "accountNo",
      header: "Account No",
      cell: ({ row }) => <div>{row.getValue("accountNo") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "swiftCode",
      header: "Swift Code",
      cell: ({ row }) => <div>{row.getValue("swiftCode") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "iban",
      header: "IBAN",
      cell: ({ row }) => <div>{row.getValue("iban") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "offEmailAdd",
      header: "Office Email",
      cell: ({ row }) => <div>{row.getValue("offEmailAdd") || "—"}</div>,
      size: 180,
    },
    {
      accessorKey: "otherEmailAdd",
      header: "Other Email",
      cell: ({ row }) => <div>{row.getValue("otherEmailAdd") || "—"}</div>,
      size: 180,
    },
    {
      accessorKey: "departmentName",
      header: "Department",
      cell: ({ row }) => <div>{row.getValue("departmentName") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "empCategoryName",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("empCategoryName") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "passportNo",
      header: "Passport No",
      cell: ({ row }) => <div>{row.getValue("passportNo") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "passportExpiry",
      header: "Passport Expiry",
      cell: ({ row }) => {
        const raw = row.getValue("passportExpiry")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, datetimeFormat) : "—"
      },
      size: 150,
    },
    {
      accessorKey: "visaNo",
      header: "Visa No",
      cell: ({ row }) => <div>{row.getValue("visaNo") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "visaExpiry",
      header: "Visa Expiry",
      cell: ({ row }) => {
        const raw = row.getValue("visaExpiry")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, datetimeFormat) : "—"
      },
      size: 150,
    },
    {
      accessorKey: "nationality",
      header: "Nationality",
      cell: ({ row }) => <div>{row.getValue("nationality") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "emiratesIDNo",
      header: "Emirates ID No",
      cell: ({ row }) => <div>{row.getValue("emiratesIDNo") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "emiratesIDExpiry",
      header: "Emirates ID Expiry",
      cell: ({ row }) => {
        const raw = row.getValue("emiratesIDExpiry")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, datetimeFormat) : "—"
      },
      size: 150,
    },

    {
      accessorKey: "mohreContractIDNo",
      header: "MOHRE Contract No",
      cell: ({ row }) => <div>{row.getValue("mohreContractIDNo") || "—"}</div>,
      size: 150,
    },
    {
      accessorKey: "mohreContractExpiry",
      header: "MOHRE Contract Expiry",
      cell: ({ row }) => {
        const raw = row.getValue("mohreContractExpiry")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, datetimeFormat) : "—"
      },
      size: 150,
    },

    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500" />
          )}
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => <div>{row.getValue("remarks") || "—"}</div>,
      size: 200,
    },
    {
      accessorKey: "createBy",
      header: "Create By",
      cell: ({ row }) => <div>{row.getValue("createBy") || "—"}</div>,
      size: 120,
    },
    {
      accessorKey: "createDate",
      header: "Create Date",
      cell: ({ row }) => {
        const raw = row.getValue("createDate")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, datetimeFormat) : "—"
      },
      size: 180,
    },
    {
      accessorKey: "editBy",
      header: "Edit By",
      cell: ({ row }) => <div>{row.getValue("editBy") || "—"}</div>,
      size: 120,
    },
    {
      accessorKey: "editDate",
      header: "Edit Date",
      cell: ({ row }) => {
        const raw = row.getValue("editDate")
        const date = raw ? new Date(raw as string) : null
        return date && isValid(date) ? format(date, datetimeFormat) : "—"
      },
      size: 180,
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
    } else if (onFilterChange) {
      const newFilters: IEmployeeFilter = {
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
      const filters: IEmployeeFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery])

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

  return (
    <div>
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateEmployee}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName={TableName.employee}
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
