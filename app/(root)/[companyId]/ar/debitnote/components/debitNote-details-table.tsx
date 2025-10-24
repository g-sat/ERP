import React, { useEffect, useState } from "react"
import { IArDebitNoteDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { ColumnDef } from "@tanstack/react-table"

import { ARTransactionId, ModuleId, TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Use flexible data type that can work with form data
interface DebitNoteDetailsTableProps {
  data: IArDebitNoteDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: IArDebitNoteDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: IArDebitNoteDt[]) => void
  visible: IVisibleFields
}

export default function DebitNoteDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible,
}: DebitNoteDetailsTableProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wrapper functions to convert string to number
  const handleDelete = (itemId: string) => {
    if (onDelete) {
      onDelete(Number(itemId))
    }
  }

  const handleBulkDelete = (selectedIds: string[]) => {
    if (onBulkDelete) {
      onBulkDelete(selectedIds.map((id) => Number(id)))
    }
  }

  // Define columns with visible prop checks
  const columns: ColumnDef<IArDebitNoteDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
    {
      accessorKey: "seqNo",
      header: "Seq No",
      size: 60,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.seqNo}</div>
      ),
    },
    ...(visible?.m_ProductId
      ? [
          {
            accessorKey: "productName",
            header: "Product",
            size: 100,
          },
        ]
      : []),
    {
      accessorKey: "glCode",
      header: "Code",
      size: 100,
    },
    {
      accessorKey: "glName",
      header: "Account",
      size: 100,
    },
    ...(visible?.m_DepartmentId
      ? [
          {
            accessorKey: "departmentName",
            header: "Department",
            size: 100,
          },
        ]
      : []),
    ...(visible?.m_Remarks
      ? [
          {
            accessorKey: "remarks",
            header: "Remarks",
            size: 200,
          },
        ]
      : []),
    ...(visible?.m_QTY
      ? [
          {
            accessorKey: "qty",
            header: "Qty",
            size: 60,
            cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
              <div className="text-right">{row.original.qty}</div>
            ),
          },
        ]
      : []),

    ...(visible?.m_UomId
      ? [
          {
            accessorKey: "uomName",
            header: "UOM",
            size: 100,
          },
        ]
      : []),
    ...(visible?.m_UnitPrice
      ? [
          {
            accessorKey: "unitPrice",
            header: "Price",
            size: 100,
            cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
              <div className="text-right">{row.original.unitPrice}</div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "totAmt",
      header: "Amount",
      size: 100,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.totAmt}</div>
      ),
    },

    {
      accessorKey: "gstPercentage",
      header: "GST %",
      size: 50,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.gstPercentage}</div>
      ),
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      size: 100,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.gstAmt}</div>
      ),
    },
    ...(visible?.m_BillQTY
      ? [
          {
            accessorKey: "billQTY",
            header: "Bill Qty",
            size: 60,
            cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
              <div className="text-right">{row.original.billQTY}</div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "totLocalAmt",
      header: "Local Amount",
      size: 100,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.totLocalAmt}</div>
      ),
    },
    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "totCtyAmt",
            header: "Country Amount",
            size: 100,
            cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
              <div className="text-right">{row.original.totCtyAmt}</div>
            ),
          },
        ]
      : []),
    ...(visible?.m_GstId
      ? [
          {
            accessorKey: "gstName",
            header: "Gst",
            size: 100,
          },
        ]
      : []),
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      size: 100,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.gstLocalAmt}</div>
      ),
    },
    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "gstCtyAmt",
            header: "GST Country Amount",
            size: 100,
            cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
              <div className="text-right">{row.original.gstCtyAmt}</div>
            ),
          },
        ]
      : []),

    ...(visible?.m_EmployeeId
      ? [
          {
            accessorKey: "employeeName",
            header: "Employee",
            size: 200,
          },
        ]
      : []),
    ...(visible?.m_PortId
      ? [
          {
            accessorKey: "portName",
            header: "Port",
            size: 200,
          },
        ]
      : []),
    ...(visible?.m_VesselId
      ? [
          {
            accessorKey: "vesselName",
            header: "Vessel",
            size: 200,
          },
        ]
      : []),
    ...(visible?.m_BargeId
      ? [
          {
            accessorKey: "bargeName",
            header: "Barge",
            size: 200,
          },
        ]
      : []),
    ...(visible?.m_VoyageId
      ? [
          {
            accessorKey: "voyageName",
            header: "Voyage",
            size: 200,
          },
        ]
      : []),
    {
      accessorKey: "docItemNo",
      header: "Doc Item No",
      size: 80,
      cell: ({ row }: { row: { original: IArDebitNoteDt } }) => (
        <div className="text-right">{row.original.docItemNo}</div>
      ),
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full px-2 pt-1 pb-2">
      <AccountBaseTable
        data={data}
        columns={columns}
        moduleId={ModuleId.ar}
        transactionId={ARTransactionId.debitNote}
        tableName={TableName.arDebitNoteDt}
        emptyMessage="No debitNote details found."
        accessorId="itemNo"
        onRefresh={onRefresh}
        onFilterChange={onFilterChange}
        onBulkDelete={handleBulkDelete}
        onBulkSelectionChange={() => {}}
        onDataReorder={onDataReorder}
        onEdit={onEdit}
        onDelete={handleDelete}
        showHeader={true}
        showActions={true}
        hideView={false}
        hideEdit={false}
        hideDelete={false}
        hideCheckbox={false}
        disableOnAccountExists={false}
      />
    </div>
  )
}
