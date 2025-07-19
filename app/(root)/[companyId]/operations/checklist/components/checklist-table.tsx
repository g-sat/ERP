"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { format } from "date-fns"
import { EditIcon } from "lucide-react"

import { OperationStatus } from "@/lib/operations-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableFooter } from "@/components/ui/data-table/data-table-footer"
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
  TableHead,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"

import { ChecklistTabs } from "./checklist-tabs"

interface ChecklistTableProps {
  data: IJobOrderHd[]
  isLoading?: boolean
  selectedStatus?: string
  onEditJob?: (jobData: IJobOrderHd) => void
}

export function ChecklistTable({
  data,
  isLoading = false,
  selectedStatus = "All",
  onEditJob,
}: ChecklistTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Filter data based on selected status
  const filteredData = useMemo(() => {
    if (selectedStatus === "All") {
      return data
    }

    return data.filter((job: IJobOrderHd) => {
      switch (selectedStatus) {
        case "Pending":
          return job.statusName === OperationStatus.Pending.toString()
        case "Completed":
          return job.statusName === OperationStatus.Completed.toString()
        case "Cancelled":
          return job.statusName === OperationStatus.Cancelled.toString()
        case "Cancel With Service":
          return job.statusName === OperationStatus.CancelWithService.toString()
        case "Confirmed":
          return job.statusName === OperationStatus.Confirmed.toString()
        case "Posted":
          return job.statusName === OperationStatus.Post.toString()
        default:
          return true
      }
    })
  }, [data, selectedStatus])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [rowSelection, setRowSelection] = useState({})
  const [selectedJob, setSelectedJob] = useState<IJobOrderHd | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Add a ref for the job number column
  const jobNoColumnRef = useRef<HTMLTableCellElement>(null)
  const [jobNoColumnWidth, setJobNoColumnWidth] = useState(120)

  useEffect(() => {
    if (jobNoColumnRef.current) {
      setJobNoColumnWidth(jobNoColumnRef.current.offsetWidth)
    }
  }, [])

  // Memoize columns to prevent infinite re-renders
  const columns: ColumnDef<IJobOrderHd>[] = useMemo(
    () => [
      {
        accessorKey: "jobOrderNo",
        header: "Job No",
        cell: ({ row }) => {
          const jobNo = row.getValue("jobOrderNo") as string
          return (
            <button
              onClick={() => {
                setSelectedJob(row.original)
                setIsDetailsOpen(true)
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {jobNo}
            </button>
          )
        },
      },
      {
        accessorKey: "jobOrderDate",
        header: "Date",
        cell: ({ row }) => {
          const date = row.original.jobOrderDate
            ? new Date(row.original.jobOrderDate)
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "customerName",
        header: "Customer",
      },
      {
        accessorKey: "currencyName",
        header: "Curr.",
      },
      {
        accessorKey: "vesselName",
        header: "Vessel",
      },
      {
        accessorKey: "statusName",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("statusName") as string
          const statusColors: Record<string, string> = {
            Pending: "bg-yellow-100 text-yellow-800",
            Completed: "bg-blue-100 text-blue-800",
            Cancelled: "bg-red-100 text-red-800",
            "Cancel with Service": "bg-orange-100 text-orange-800",
            Confirmed: "bg-green-100 text-green-800",
            Posted: "bg-purple-100 text-purple-800",
            Delivered: "bg-green-100 text-green-800",
            Approved: "bg-blue-100 text-blue-800",
          }
          return (
            <Badge
              className={`px-2 py-1 text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
            >
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: "etaDate",
        header: "ETA",
        cell: ({ row }) => {
          const date = row.original.etaDate
            ? new Date(row.original.etaDate)
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "etdDate",
        header: "ETD",
        cell: ({ row }) => {
          const date = row.original.etdDate
            ? new Date(row.original.etdDate)
            : null
          return date ? format(date, dateFormat) : "-"
        },
      },
      {
        accessorKey: "vesselDistance",
        header: "Dist. In.",
      },
      {
        accessorKey: "portName",
        header: "Port",
      },

      {
        accessorKey: "remarks",
        header: "Remarks",
      },
      {
        accessorKey: "editVersion",
        header: "Version",
        cell: ({ row }) => {
          const version = row.getValue("editVersion")
          // You can use different badge variants or colors based on version if you want
          const variant: "default" | "secondary" | "destructive" | "outline" =
            "secondary"
          return (
            <Badge
              variant={variant}
              className="px-2 py-1 text-xs font-semibold"
            >
              {version ? String(version) : "0"}
            </Badge>
          )
        },
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditJob?.(row.original)}
                className="h-8 w-8 p-0"
              >
                <EditIcon className="h-4 w-4" />
              </Button>
            </div>
          )
        },
        size: 80,
        minSize: 60,
        maxSize: 100,
      },
    ],
    [dateFormat, onEditJob]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  })

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      table.setPageIndex(page - 1)
    },
    [table]
  )

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size)
      table.setPageSize(size)
    },
    [table]
  )

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

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-green-100 text-green-800",
    Completed: "bg-blue-100 text-blue-800",
    Cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div>
      <div
        ref={tableContainerRef}
        className="relative overflow-auto"
        style={{ height: "490px" }}
      >
        <Table>
          <TanstackTableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isJobNo = header.column.id === "jobOrderNo"
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        isJobNo ? "bg-background sticky left-0 z-10" : ""
                      }
                      style={{
                        position: isJobNo ? "sticky" : "relative",
                        left: isJobNo ? 0 : "auto",
                        zIndex: isJobNo ? 10 : 1,
                        width: isJobNo
                          ? jobNoColumnWidth
                          : header.column.getSize(),
                      }}
                    >
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
          </TanstackTableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {virtualRows.length > 0 ? (
              <>
                <tr style={{ height: `${paddingTop}px` }} />
                {virtualRows.map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index]
                  return (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const isJobNo = cell.column.id === "jobOrderNo"
                        return (
                          <TableCell
                            key={cell.id}
                            ref={isJobNo ? jobNoColumnRef : null}
                            className={
                              isJobNo ? "bg-background sticky left-0 z-10" : ""
                            }
                            style={{
                              position: isJobNo ? "sticky" : "relative",
                              left: isJobNo ? 0 : "auto",
                              zIndex: isJobNo ? 10 : 1,
                              width: isJobNo
                                ? jobNoColumnWidth
                                : cell.column.getSize(),
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
      {/* Table Footer with Pagination */}
      <TableFooter
        currentPage={currentPage}
        totalPages={Math.ceil(filteredData.length / pageSize)}
        pageSize={pageSize}
        totalRecords={filteredData.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 50, 100, 500]}
      />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent
          className="@container h-[95vh] w-[90vw] !max-w-none overflow-y-auto p-0"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 pt-2 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle>
                  <div className="text-foreground text-2xl font-bold tracking-tight">
                    Job Order Details :{" "}
                    <span
                      className={`ml-auto rounded-full px-5 py-1 text-sm font-medium ${statusColors[selectedJob?.statusName as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}
                    >
                      {selectedJob?.statusName}
                    </span>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  View and manage job order details and their associated
                  services.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedJob && (
            <div className="px-4 pt-0 pb-0">
              <ChecklistTabs
                key={`${selectedJob.jobOrderId}-${selectedJob.jobOrderNo}`}
                jobData={selectedJob}
                onSuccess={() => {
                  // Don't close the dialog after successful save
                  // setIsDetailsOpen(false)
                }}
                isEdit={true}
                isNewRecord={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
