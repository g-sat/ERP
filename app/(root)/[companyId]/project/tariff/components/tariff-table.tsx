"use client"

import { useEffect, useRef, useState } from "react"
import { ITariff, ITariffFilter } from "@/interfaces/tariff"
import { useAuthStore } from "@/stores/auth-store"
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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TableHeaderCustom } from "@/components/ui/data-table/data-table-header-custom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

interface TariffTableProps {
  data: ITariff[]
  isLoading?: boolean
  onTariffSelect?: (tariff: ITariff) => void
  onDeleteTariff?: (tariffId: string, task: string) => void
  onEditTariff?: (tariff: ITariff) => void
  onCreateTariff?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: ITariffFilter) => void
  companyId: string
}

export function TariffTable({
  data,
  isLoading = false,
  onTariffSelect,
  onDeleteTariff,
  onEditTariff,
  onCreateTariff,
  onRefresh,
  onFilterChange,
  companyId,
}: TariffTableProps) {
  // References and states
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [rowSelection, setRowSelection] = useState({})
  const [isFilterOpen, setFilterOpen] = useState(false)

  // Define columns for the table
  const columns: ColumnDef<ITariff>[] = [
    {
      accessorKey: "task",
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
      cell: ({ row }) => <div>{row.getValue("task")}</div>,
    },
    {
      accessorKey: "charge",
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
      accessorKey: "uom",
      header: "UOM",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "fromPlace",
      header: "From Place",
    },
    {
      accessorKey: "toPlace",
      header: "To Place",
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
      accessorKey: "prepaymentRate",
      header: "Prepayment Rate",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("prepaymentRate")}</div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Is Active",
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tariff = row.original
        return (
          <div className="flex items-center justify-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onEditTariff && onEditTariff(tariff)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  onClick={() =>
                    onDeleteTariff &&
                    onDeleteTariff(tariff.tariffId, tariff.task)
                  }
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // Initialize table
  const table = useReactTable({
    data,
    columns,

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

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (data && data.length > 0) {
      // Apply client-side filtering when local data exists
      table.setGlobalFilter(query)
    } else if (onFilterChange) {
      const newFilters: ITariffFilter = {
        search: query,
      }

      onFilterChange(newFilters)
    }
  }

  useEffect(() => {
    if (!data?.length && onFilterChange) {
      const filters: ITariffFilter = {
        search: searchQuery,
      }

      onFilterChange(filters)
    }
  }, [sorting, searchQuery])

  return (
    <div className="space-y-4">
      {/* Custom Table Header with Actions */}
      <TableHeaderCustom
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        onFilterToggle={() => setFilterOpen(!isFilterOpen)}
        columns={table.getAllLeafColumns()}
        isFilterOpen={isFilterOpen}
        data={data}
        tableName="Tariffs"
        companyId={companyId}
      />

      {/* Table with fixed height and scrolling */}
      <div
        ref={tableContainerRef}
        className="relative overflow-auto"
        style={{ height: "490px" }}
      >
        <Table>
          <TanstackTableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                    className="bg-muted group hover:bg-muted/80 relative transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between">
                      {header.isPlaceholder ? null : (
                        <>
                          <span className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ArrowUpIcon className="h-4 w-4" />,
                              desc: <ArrowDownIcon className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                          {/* <span className="text-muted-foreground ml-2 text-xs">
                            {`${Math.round(header.getSize())}px`}
                          </span> */}
                        </>
                      )}
                    </div>

                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "resizer bg-border absolute top-0 right-0 h-full w-1 cursor-col-resize opacity-0 transition-opacity",
                          "group-hover:opacity-100",
                          header.column.getIsResizing() &&
                            "bg-primary opacity-100"
                        )}
                        aria-label="Resize column"
                      />
                    )}
                  </TableHead>
                ))}
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
                    <TableRow key={row.id}>
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
                    {isLoading ? "Loading..." : "No data found."}
                  </TableCell>
                </TableRow>

                {/* Add empty rows to maintain consistent height */}
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
      </div>
    </div>
  )
}
