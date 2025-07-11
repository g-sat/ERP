"use client"

import { useEffect, useRef, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields } from "@/interfaces/setting"
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
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  useMandatoryFieldSave,
  useMandatoryFieldbyidGet,
} from "@/hooks/use-setting"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader as TanstackTableHeader,
} from "@/components/ui/table"
import ModuleAutocomplete from "@/components/ui-custom/autocomplete-module"

export function MandatoryTable() {
  const form = useForm()
  const [selectedModule, setSelectedModule] = useState<{
    moduleId: number
    moduleName: string
  } | null>(null)
  const [mandatoryFields, setMandatoryFields] = useState<IMandatoryFields[]>([])
  const [saving, setSaving] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnSizing, setColumnSizing] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Fetch mandatory fields for selected module
  const {
    data: mandatoryFieldsResponse,
    refetch: refetchMandatoryFields,
    isFetching: isFieldsLoading,
  } = useMandatoryFieldbyidGet(selectedModule?.moduleId || 0)

  // Save mandatory fields mutation
  const mandatoryFieldSave = useMandatoryFieldSave()

  // Update mandatoryFields when mandatoryFieldsResponse changes
  useEffect(() => {
    if (mandatoryFieldsResponse) {
      const response = mandatoryFieldsResponse as ApiResponse<IMandatoryFields>
      if (response.data && Array.isArray(response.data)) {
        setMandatoryFields(response.data)
      } else {
        setMandatoryFields([])
      }
    } else {
      setMandatoryFields([])
    }
  }, [mandatoryFieldsResponse])

  // Update mandatoryFields when response changes
  useEffect(() => {
    if (mandatoryFieldsResponse?.data) {
      setMandatoryFields(mandatoryFieldsResponse.data)
    } else {
      setMandatoryFields([])
    }
  }, [mandatoryFieldsResponse])

  // When module changes, refetch fields
  useEffect(() => {
    if (selectedModule?.moduleId) {
      refetchMandatoryFields()
    } else {
      setMandatoryFields([])
    }
  }, [selectedModule?.moduleId, refetchMandatoryFields])

  const columns: ColumnDef<IMandatoryFields>[] = [
    {
      accessorKey: "moduleName",
      header: "Module Name",
      size: 150,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "transactionName",
      header: "Transaction Name",
      size: 150,
      minSize: 100,
      maxSize: 200,
    },
    {
      accessorKey: "m_ProductId",
      header: "Product",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_ProductId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_ProductId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_GLId",
      header: "GL",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_GLId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_GLId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_QTY",
      header: "QTY",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_QTY")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_QTY", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_UomId",
      header: "UOM",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_UomId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_UomId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_UnitPrice",
      header: "Unit Price",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_UnitPrice")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_UnitPrice", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_TotAmt",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_TotAmt")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_TotAmt", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Remarks")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_Remarks", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_GstId",
      header: "GST",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_GstId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_GstId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_DeliveryDate",
      header: "Delivery Date",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_DeliveryDate")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_DeliveryDate",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_DepartmentId",
      header: "Department",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_DepartmentId")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_DepartmentId",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_EmployeeId",
      header: "Employee",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_EmployeeId")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_EmployeeId",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_PortId",
      header: "Port",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_PortId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_PortId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_VesselId",
      header: "Vessel",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_VesselId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_VesselId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_BargeId",
      header: "Barge",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_BargeId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_BargeId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_VoyageId",
      header: "Voyage",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_VoyageId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_VoyageId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_SupplyDate",
      header: "Supply Date",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_SupplyDate")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_SupplyDate",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_ReferenceNo",
      header: "Reference No",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_ReferenceNo")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_ReferenceNo",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_SuppInvoiceNo",
      header: "Supplier Invoice No",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_SuppInvoiceNo")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_SuppInvoiceNo",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_BankId",
      header: "Bank",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_BankId")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_BankId", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Remarks_Hd",
      header: "Remarks Hd",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Remarks_Hd")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_Remarks_Hd",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Address1",
      header: "Address 1",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Address1")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_Address1", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Address2",
      header: "Address 2",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Address2")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_Address2", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Address3",
      header: "Address 3",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Address3")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_Address3", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Address4",
      header: "Address 4",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Address4")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_Address4", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_PinCode",
      header: "Pincode",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_PinCode")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_PinCode", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_Countryd",
      header: "Country",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_Countryd")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_Countryd", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_PhoneNo",
      header: "Phone No",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_PhoneNo")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_PhoneNo", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_ContactName",
      header: "Contact Name",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_ContactName")}
            onCheckedChange={(checked) =>
              handleFieldChange(
                row.original,
                "m_ContactName",
                checked as boolean
              )
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_MobileNo",
      header: "Mobile No",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_MobileNo")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_MobileNo", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "m_EmailAdd",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("m_EmailAdd")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "m_EmailAdd", checked as boolean)
            }
          />
        </div>
      ),
      size: 100,
    },
  ]

  const table = useReactTable({
    data: mandatoryFields,
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
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnSizing,
      rowSelection,
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

  const handleFieldChange = (
    field: IMandatoryFields,
    key: string,
    checked: boolean
  ) => {
    setMandatoryFields((prev) =>
      prev.map((f) =>
        f.moduleId === field.moduleId && f.transactionId === field.transactionId
          ? { ...f, [key]: checked }
          : f
      )
    )
  }

  const handleSave = async () => {
    if (!selectedModule) {
      toast.error("Please select a module first")
      return
    }

    try {
      setSaving(true)
      const response = await mandatoryFieldSave.mutateAsync({
        data: mandatoryFields.map((field) => ({
          ...field,
          moduleId: selectedModule.moduleId,
        })),
      })

      if (response.result === 1) {
        toast.success("Mandatory fields saved successfully")
        refetchMandatoryFields()
      } else {
        toast.error(response.message || "Failed to save mandatory fields")
      }
    } catch (error) {
      console.error("Error saving mandatory fields:", error)
      toast.error("Failed to save mandatory fields")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => refetchMandatoryFields())}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-end gap-4">
              <div className="w-64">
                <ModuleAutocomplete
                  form={form}
                  name="moduleId"
                  onChangeEvent={(module) =>
                    setSelectedModule(
                      module
                        ? {
                            moduleId: module.moduleId,
                            moduleName: module.moduleName,
                          }
                        : null
                    )
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                disabled={isFieldsLoading}
              >
                {isFieldsLoading ? "Loading..." : "Search"}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedModule}
              size="sm"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>

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
                  >
                    <div className="flex items-center justify-between">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                      />
                    )}
                  </TableHead>
                ))}
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
                    {isFieldsLoading
                      ? "Loading..."
                      : "No mandatory fields found."}
                  </TableCell>
                </TableRow>
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
