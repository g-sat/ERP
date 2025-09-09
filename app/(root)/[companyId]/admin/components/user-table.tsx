"use client"

import { useEffect, useRef, useState } from "react"
import { IUser, IUserFilter } from "@/interfaces/admin"
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
import { Key } from "lucide-react"

import { AdminTransactionId, TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DraggableColumnHeader,
  TableActions,
  TableFooter,
  TableHeader,
} from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

import { ResetPassword } from "./reset-password"

interface UsersTableProps {
  data: IUser[]
  isLoading?: boolean
  onUserSelect?: (user: IUser | undefined) => void
  onDeleteUser?: (userId: string) => void
  onEditUser?: (user: IUser) => void
  onCreateUser?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: IUserFilter) => void
  moduleId?: number
  transactionId?: number
}

export function UserTable({
  data,
  isLoading = false,
  onUserSelect,
  onDeleteUser,
  onEditUser,
  onCreateUser,
  onRefresh,
  onFilterChange,
  moduleId,
  transactionId,
}: UsersTableProps) {
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
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [selectedUserForReset, setSelectedUserForReset] =
    useState<IUser | null>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    TableName.user
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

  const columns: ColumnDef<IUser>[] = [
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      size: 100,
      minSize: 80,
      maxSize: 150,
      cell: ({ row }) => {
        const user = row.original
        return (
          <TableActions
            row={user}
            idAccessor="userId"
            onView={onUserSelect}
            onEdit={onEditUser}
            onDelete={onDeleteUser}
          />
        )
      },
    },
    {
      id: "resetPassword",
      header: "Pswd",
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      minSize: 60,
      maxSize: 100,
      cell: ({ row }) => (
        <div
          className="flex justify-center"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleResetPassword(row.original)
            }}
          >
            <Key className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "Name",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
    },
    {
      accessorKey: "userCode",
      header: "Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("userCode")}</div>
      ),
      size: 120,
      minSize: 50,
      maxSize: 150,
      enableColumnFilter: true,
    },
    {
      accessorKey: "userEmail",
      header: "Email",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
    },

    {
      accessorKey: "userRoleName",
      header: "Role",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
    },

    {
      accessorKey: "userGroupName",
      header: "Group",
      size: 200,
      minSize: 50,
      maxSize: 300,
      enableColumnFilter: true,
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
      accessorKey: "isLocked",
      header: "Locked",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isLocked") ? "destructive" : "secondary"}>
          {row.getValue("isLocked") ? (
            <IconCircleCheckFilled className="mr-1 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconSquareRoundedXFilled className="mr-1 fill-red-500 dark:fill-red-400" />
          )}
          {row.getValue("isLocked") ? "Locked" : "Unlocked"}
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
      const newFilters: IUserFilter = {
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

  const handleResetPassword = (user: IUser) => {
    // Simply open the reset password dialog
    setSelectedUserForReset(user)
    setIsResetPasswordOpen(true)
  }

  const handleCancelReset = () => {
    setIsResetPasswordOpen(false)
    setSelectedUserForReset(null)
  }

  const handleResetSuccess = () => {
    setIsResetPasswordOpen(false)
    setSelectedUserForReset(null)
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
    if (!data?.length && onFilterChange && searchQuery) {
      const filters: IUserFilter = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery])

  const visibleLeafColumns = table.getVisibleLeafColumns()

  return (
    <>
      <TableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onCreate={onCreateUser}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName={TableName.user}
        hideCreateButton={false}
        moduleId={moduleId || 1}
        transactionId={transactionId || AdminTransactionId.user}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            {/* Header table */}
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                {visibleLeafColumns.map((col) => (
                  <col key={col.id} style={{ width: `${col.getSize()}px` }} />
                ))}
              </colgroup>
              <TanstackTableHeader className="bg-background sticky top-0 z-20">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    <SortableContext
                      items={headerGroup.headers.map((header) => header.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableColumnHeader
                          key={header.id}
                          header={header}
                        />
                      ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TanstackTableHeader>
            </Table>

            {/* Scrollable body table */}
            <div
              ref={tableContainerRef}
              className="max-h-[500px] overflow-y-auto"
            >
              <Table className="w-full table-fixed border-collapse">
                <colgroup>
                  {visibleLeafColumns.map((col) => (
                    <col key={col.id} style={{ width: `${col.getSize()}px` }} />
                  ))}
                </colgroup>
                <TableBody>
                  {virtualRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center"
                      >
                        {isLoading ? "Loading..." : "No users found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      <tr style={{ height: `${paddingTop}px` }} />
                      {virtualRows.map((virtualRow) => {
                        const row = table.getRowModel().rows[virtualRow.index]
                        return (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell, cellIndex) => (
                              <TableCell
                                key={cell.id}
                                className={`py-2 ${cellIndex === 0 ? "bg-background sticky left-0 z-10" : ""}`}
                              >
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
                  )}
                </TableBody>
              </Table>
            </div>
          </Table>
        </div>
      </DndContext>

      <TableFooter
        currentPage={currentPage}
        totalPages={Math.ceil(data.length / pageSize)}
        pageSize={pageSize}
        totalRecords={data.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 50, 100, 500]}
      />

      {/* Reset Password Dialog */}
      {selectedUserForReset && (
        <Dialog
          open={isResetPasswordOpen}
          onOpenChange={setIsResetPasswordOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Reset Password
              </DialogTitle>
              <DialogDescription>
                Set a new password for user: {selectedUserForReset.userName}
              </DialogDescription>
            </DialogHeader>
            <ResetPassword
              userId={selectedUserForReset.userId}
              userCode={selectedUserForReset.userCode}
              onCancel={handleCancelReset}
              onSuccess={handleResetSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
