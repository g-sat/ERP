"use client"

import { useState } from "react"
import { IDocumentExpiry } from "@/interfaces/docexpiry"
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
import { AlertCircle, FileText, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { DocumentExpiry } from "@/lib/api-routes"
import { useDelete, useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import DocumentViewer from "./document-viewer"

export default function DocumentList() {
  const {
    data: response,
    isLoading,
    error,
  } = useGet<IDocumentExpiry>(`${DocumentExpiry.get}`, "expDocuments")

  const deleteMutation = useDelete(`${DocumentExpiry.delete}`)

  const documents = response?.data || []

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const handleDelete = (documentId: number) => {
    deleteMutation.mutate(documentId.toString(), {
      onSuccess: () => {
        toast.success("Document deleted successfully")
      },
    })
  }

  const columns: ColumnDef<IDocumentExpiry>[] = [
    {
      accessorKey: "documentName",
      header: "Document Name",
      cell: ({ row }) => <div>{row.getValue("documentName")}</div>,
    },
    {
      accessorKey: "docTypeName",
      header: "Type",
      cell: ({ row }) => <div>{row.getValue("docTypeName")}</div>,
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => {
        const issueDate = row.getValue("issueDate") as string
        return (
          <div>
            {issueDate ? new Date(issueDate).toLocaleDateString() : "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => {
        const expiryDate = row.getValue("expiryDate") as string
        return (
          <div>
            {expiryDate ? new Date(expiryDate).toLocaleDateString() : "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "isExpired",
      header: "Status",
      cell: ({ row }) => {
        const isExpired = row.getValue("isExpired") as boolean
        return (
          <Badge variant={isExpired ? "destructive" : "default"}>
            {isExpired ? "Expired" : "Updated"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "filePath",
      header: "Document",
      cell: ({ row }) => {
        const filePath = row.getValue("filePath") as string
        const documentName = row.getValue("documentName") as string
        return (
          <div>
            {filePath ? (
              <DocumentViewer
                filePath={filePath}
                documentName={documentName}
                size="sm"
              />
            ) : (
              <div className="text-muted-foreground flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                <span className="text-xs">No file</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const document = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(document.documentId)}
            disabled={deleteMutation.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: documents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <span className="ml-2">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive flex items-center justify-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Error loading documents. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground flex items-center justify-center">
            <FileText className="mr-2 h-5 w-5" />
            <span>No documents found.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document List</CardTitle>
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter by document name..."
            value={
              (table.getColumn("documentName")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("documentName")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
