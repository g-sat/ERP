import React, { useEffect, useState } from "react"
import { ICbPettyCashDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { ColumnDef } from "@tanstack/react-table"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Use flexible data type that can work with form data
interface PettyCashDetailsTableProps {
  data: ICbPettyCashDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: ICbPettyCashDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ICbPettyCashDt[]) => void
  visible: IVisibleFields
}

export default function PettyCashDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible,
}: PettyCashDetailsTableProps) {
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
  const columns: ColumnDef<ICbPettyCashDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
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

    {
      accessorKey: "totAmt",
      header: "Amount",
      size: 100,
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.totAmt}</div>
      ),
    },

    {
      accessorKey: "gstPercentage",
      header: "GST %",
      size: 50,
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.gstPercentage}</div>
      ),
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      size: 100,
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.gstAmt}</div>
      ),
    },

    {
      accessorKey: "totLocalAmt",
      header: "Local Amount",
      size: 100,
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.totLocalAmt}</div>
      ),
    },
    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "totCtyAmt",
            header: "Country Amount",
            size: 100,
            cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
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
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.gstLocalAmt}</div>
      ),
    },
    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "gstCtyAmt",
            header: "GST Country Amount",
            size: 100,
            cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
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
            accessorKey: "voyageNo",
            header: "Voyage",
            size: 200,
          },
        ]
      : []),

    {
      accessorKey: "seqNo",
      header: "Seq No",
      size: 60,
      cell: ({ row }: { row: { original: ICbPettyCashDt } }) => (
        <div className="text-right">{row.original.seqNo}</div>
      ),
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full p-2">
      <AccountBaseTable
        data={data}
        columns={columns}
        moduleId={ModuleId.cb}
        transactionId={CBTransactionId.cbpettycash}
        tableName={TableName.cbPettyCashDt}
        emptyMessage="No Petty Cash details found."
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
