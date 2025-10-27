"use client"

import { useEffect, useState } from "react"
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

import { TableName } from "@/lib/utils"
import { useGetGridLayout } from "@/hooks/use-settings"

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { SortableTableHeader } from "./sortable-table-header"
import { DialogDataTableHeader } from "./table-dialog-header"
import { MainTableFooter } from "./table-main-footer"

interface DialogDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  moduleId?: number
  transactionId?: number
  tableName: TableName
  emptyMessage?: string
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onRowSelect?: (row: T | null) => void
}

export function DialogDataTable<T>({
  data,
  columns,
  isLoading,
  moduleId,
  transactionId,
  tableName,
  emptyMessage = "No data found.",
  onRefresh,
  onFilterChange,
  onRowSelect,
}: DialogDataTableProps<T>) {
  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "",
    transactionId?.toString() || "",
    tableName
  )

  const gridSettingsData = gridSettings?.data

  const getInitialSorting = (): SortingState => {
    if (gridSettingsData?.grdSort) {
      try {
        return JSON.parse(gridSettingsData.grdSort) || []
      } catch {
        return []
      }
    }
    return []
  }

  const getInitialColumnVisibility = (): VisibilityState => {
    if (gridSettingsData?.grdColVisible) {
      try {
        return JSON.parse(gridSettingsData.grdColVisible) || {}
      } catch {
        return {}
      }
    }
    return {}
  }

  const getInitialColumnSizing = () => {
    if (gridSettingsData?.grdColSize) {
      try {
        return JSON.parse(gridSettingsData.grdColSize) || {}
      } catch {
        return {}
      }
    }
    return {}
  }

  const [sorting, setSorting] = useState<SortingState>(getInitialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    getInitialColumnVisibility
  )
  const [columnSizing, setColumnSizing] = useState(getInitialColumnSizing)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    if (gridSettingsData) {
      try {
        const colVisible = JSON.parse(gridSettingsData.grdColVisible || "{}")
        const colSize = JSON.parse(gridSettingsData.grdColSize || "{}")
        const sort = JSON.parse(gridSettingsData.grdSort || "[]")

        setColumnVisibility((prev) => {
          const newVisibility =
            JSON.stringify(prev) !== JSON.stringify(colVisible)
              ? colVisible
              : prev
          return newVisibility
        })

        setSorting((prev) => {
          const newSorting =
            JSON.stringify(prev) !== JSON.stringify(sort) ? sort : prev
          return newSorting
        })

        if (Object.keys(colSize).length > 0) {
          setColumnSizing((prev: Record<string, number>) => {
            const newSizing =
              JSON.stringify(prev) !== JSON.stringify(colSize) ? colSize : prev
            return newSizing
          })
        }
      } catch (error) {
        console.error("Error parsing grid settings:", error)
      }
    }
  }, [gridSettingsData])

  const tableColumns: ColumnDef<T>[] = [...columns]

  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount: Math.ceil(data.length / pageSize),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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

  useEffect(() => {
    if (gridSettingsData && table) {
      try {
        const colOrder = JSON.parse(gridSettingsData.grdColOrder || "[]")
        if (colOrder.length > 0) {
          table.setColumnOrder(colOrder)
        }
      } catch (error) {
        console.error("Error parsing column order:", error)
      }
    }
  }, [gridSettingsData, table])

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
      const newFilters = {
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
      const oldIndex = table.getAllColumns().findIndex((col) => col.id === active.id)
      const newIndex = table.getAllColumns().findIndex((col) => col.id === over.id)
      const newColumnOrder = arrayMove(table.getAllColumns(), oldIndex, newIndex)
      table.setColumnOrder(newColumnOrder.map((col) => col.id))
    }
  }

  const handleRowClick = (row: T) => {
    if (onRowSelect) {
      onRowSelect(row)
    }
  }

  useEffect(() => {
    if (!data?.length && !isLoading && onFilterChange) {
      const filters = {
        search: searchQuery,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      }
      onFilterChange(filters)
    }
  }, [sorting, searchQuery, data?.length, isLoading])

  return (
    <>
      <DialogDataTableHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onRefresh={onRefresh}
        columns={table
          .getHeaderGroups()
          .flatMap((group) => group.headers)
          .map((header) => header.column)}
        data={data}
        tableName={tableName}
        moduleId={moduleId || 1}
        transactionId={transactionId || 1}
      />

      {/* DndContext wraps the scroll container — OUTSIDE <Table> */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto rounded-lg border">

          {/* ONLY ONE <Table> */}
          <Table className="w-full caption-bottom text-sm">

            <colgroup>
              {table.getAllLeafColumns().map((col) => (
                <col
                  key={col.id}
                  style={{
                    width: `${col.getSize()}px`,
                    minWidth: `${col.getSize()}px`,
                    maxWidth: `${col.getSize()}px`,
                  }}
                />
              ))}
            </colgroup>

            {/* HEADER */}
            <TableHeader className="sticky top-0 bg-background z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  <SortableContext
                    items={headerGroup.headers.map((h) => h.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => (
                      <SortableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>

            {/* BODY - Scrollable */}
            <tbody className="max-h-[480px] overflow-y-auto block">
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  className={`py-1 ${onRowSelect ? "hover:bg-muted/50 cursor-pointer" : ""}`}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const isActions = cell.column.id === "actions"
                    const isFirstColumn = cellIndex === 0

                    return (
                      <TableCell
                        key={cell.id}
                        className={`px-2 py-1 ${
                          isFirstColumn || isActions
                            ? "bg-background sticky left-0 z-10"
                            : ""
                        }`}
                        style={{
                          width: `${cell.column.getSize()}px`,
                          minWidth: `${cell.column.getSize()}px`,
                          maxWidth: `${cell.column.getSize()}px`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          position: isFirstColumn || isActions ? "sticky" : "relative",
                          left: isFirstColumn || isActions ? 0 : "auto",
                          zIndex: isFirstColumn || isActions ? 10 : 1,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}

              {/* Empty Rows */}
              {Array.from({
                length: Math.min(
                  Math.max(0, pageSize - table.getRowModel().rows.length),
                  10
                ),
              }).map((_, index) => (
                <TableRow key={`empty-${index}`} className="h-7">
                  {table.getAllLeafColumns().map((column, cellIndex) => {
                    const isActions = column.id === "actions"
                    const isFirstColumn = cellIndex === 0

                    return (
                      <TableCell
                        key={`empty-${index}-${column.id}`}
                        className={`px-2 py-1 ${
                          isFirstColumn || isActions
                            ? "bg-background sticky left-0 z-10"
                            : ""
                        }`}
                        style={{
                          width: `${column.getSize()}px`,
                          minWidth: `${column.getSize()}px`,
                          maxWidth: `${column.getSize()}px`,
                          position: isFirstColumn || isActions ? "sticky" : "relative",
                          left: isFirstColumn || isActions ? 0 : "auto",
                          zIndex: isFirstColumn || isActions ? 10 : 1,
                        }}
                      />
                    )
                  })}
                </TableRow>
              ))}

              {/* Empty State */}
              {table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-7 py-2 text-center">
                    {isLoading ? "Loading..." : emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </div>
      </DndContext>

      <MainTableFooter
        currentPage={currentPage}
        totalPages={Math.ceil(data.length / pageSize)}
        pageSize={pageSize}
        totalRecords={data.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[15, 50, 100, 500]}
      />
    </>
  )
}