import { useRef, useState } from "react"
import { IArInvoiceFilter, IArInvoiceHd } from "@/interfaces/invoice"
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
import { arrayMove } from "@dnd-kit/sortable"
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
import { format, subMonths } from "date-fns"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { TableFooter } from "@/components/table/data-table-footer"
import { TableHeaderCustom } from "@/components/table/data-table-header-custom"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CustomDateNew } from "@/components/custom/custom-date-new"

export interface InvoiceTableProps {
  data: IArInvoiceHd[]
  isLoading: boolean
  onInvoiceSelect: (selectedInvoice: IArInvoiceHd | undefined) => void
  onRefresh: () => void
  onFilterChange: (filters: IArInvoiceFilter) => void
  initialFilters?: IArInvoiceFilter
}

export default function InvoiceTable({
  data,
  isLoading = false,
  onInvoiceSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: InvoiceTableProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 9
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  //const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  const form = useForm({
    defaultValues: {
      startDate:
        initialFilters?.startDate ||
        format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      endDate: initialFilters?.endDate || format(new Date(), "yyyy-MM-dd"),
    },
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rowSelection, setRowSelection] = useState({})
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const formatNumber = (value: number, decimals: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const columns: ColumnDef<IArInvoiceHd>[] = [
    {
      accessorKey: "invoiceNo",
      header: "Invoice No",
    },
    {
      accessorKey: "referenceNo",
      header: "Reference No",
    },
    {
      accessorKey: "trnDate",
      header: "Transaction Date",
      cell: ({ row }) => {
        const date = row.original.trnDate
          ? new Date(row.original.trnDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "accountDate",
      header: "Account Date",
      cell: ({ row }) => {
        const date = row.original.accountDate
          ? new Date(row.original.accountDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => {
        const date = row.original.deliveryDate
          ? new Date(row.original.deliveryDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.original.dueDate
          ? new Date(row.original.dueDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "customerCode",
      header: "Customer Code",
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
    },
    {
      accessorKey: "currencyCode",
      header: "Currency Code",
    },
    {
      accessorKey: "currencyName",
      header: "Currency Name",
    },
    {
      accessorKey: "exhRate",
      header: "Exchange Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("exhRate"), exhRateDec)}
        </div>
      ),
    },
    {
      accessorKey: "ctyExhRate",
      header: "Country Exchange Rate",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("ctyExhRate"), exhRateDec)}
        </div>
      ),
    },
    {
      accessorKey: "creditTermCode",
      header: "Credit Term Code",
    },
    {
      accessorKey: "creditTermName",
      header: "Credit Term Name",
    },
    {
      accessorKey: "bankCode",
      header: "Bank Code",
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
    },
    {
      accessorKey: "totAmt",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totLocalAmt",
      header: "Total Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("gstAmt"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("gstLocalAmt"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totAmtAftGst",
      header: "Total After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totAmtAftGst"), amtDec)}
        </div>
      ),
    },
    {
      accessorKey: "totLocalAmtAftGst",
      header: "Total Local After GST",
      cell: ({ row }) => (
        <div className="text-right">
          {formatNumber(row.getValue("totLocalAmtAftGst"), locAmtDec)}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createByCode",
      header: "Created By Code",
    },
    {
      accessorKey: "createByName",
      header: "Created By Name",
    },
    {
      accessorKey: "createDate",
      header: "Created Date",
      cell: ({ row }) => {
        const date = row.original.createDate
          ? new Date(row.original.createDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "editByCode",
      header: "Edited By Code",
    },
    {
      accessorKey: "editByName",
      header: "Edited By Name",
    },
    {
      accessorKey: "editDate",
      header: "Edited Date",
      cell: ({ row }) => {
        const date = row.original.editDate
          ? new Date(row.original.editDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "editVersion",
      header: "Edit Version",
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

  const handleRowClick = (row: IArInvoiceHd) => {
    onInvoiceSelect(row)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (data && data.length > 0) {
      table.setGlobalFilter(query)
    }
  }

  const handleSearchInvoice = () => {
    const newFilters: IArInvoiceFilter = {
      startDate: form.getValues("startDate"),
      endDate: form.getValues("endDate"),
      search: searchQuery,
      sortBy: sorting[0]?.id || "invoiceNo",
      sortOrder: sorting[0]?.desc ? "desc" : "asc",
      pageNumber: currentPage,
      pageSize: pageSize,
    }
    onFilterChange(newFilters)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    table.setPageIndex(page - 1)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    table.setPageSize(size)
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

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
    <div className="w-full overflow-auto">
      <FormProvider {...form}>
        <div className="mb-4 flex items-center gap-2">
          {/* From Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">From Date:</span>
            <CustomDateNew
              form={form}
              name="startDate"
              isRequired={true}
              dateFormat={dateFormat}
              size="sm"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">To Date:</span>
            <CustomDateNew
              form={form}
              name="endDate"
              isRequired={true}
              dateFormat={dateFormat}
              size="sm"
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleSearchInvoice}>
            Search Invoice
          </Button>
        </div>
      </FormProvider>
      <Separator className="mb-4" />
      <TableHeaderCustom
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        columns={table.getAllLeafColumns()}
        data={data}
        tableName="Invoices"
      />
      <div
        ref={tableContainerRef}
        className="relative overflow-auto rounded-md border"
        style={{ height: "490px" }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRowClick(row.original)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No records to display
                  </TableCell>
                </TableRow>
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
