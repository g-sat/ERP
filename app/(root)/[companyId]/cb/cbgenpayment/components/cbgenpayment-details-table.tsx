import React, { useEffect, useState } from "react"
import { ICbGenPaymentDt } from "@/interfaces/cb-genpayment"
import { IVisibleFields } from "@/interfaces/setting"
import { ColumnDef } from "@tanstack/react-table"

import { TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

interface PaymentDetailsTableProps {
  data: ICbGenPaymentDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: ICbGenPaymentDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ICbGenPaymentDt[]) => void
  visible: IVisibleFields
}

export default function PaymentDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible,
}: PaymentDetailsTableProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const columns: ColumnDef<ICbGenPaymentDt>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      size: 60,
      cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
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
    ...(visible?.m_EmployeeId
      ? [
          {
            accessorKey: "employeeName",
            header: "Employee",
            size: 100,
          },
        ]
      : []),
    ...(visible?.m_PortId
      ? [
          {
            accessorKey: "portName",
            header: "Port",
            size: 100,
          },
        ]
      : []),
    ...(visible?.m_VesselId
      ? [
          {
            accessorKey: "vesselName",
            header: "Vessel",
            size: 100,
          },
        ]
      : []),
    ...(visible?.m_BargeId
      ? [
          {
            accessorKey: "bargeName",
            header: "Barge",
            size: 100,
          },
        ]
      : []),
    ...(visible?.m_VoyageId
      ? [
          {
            accessorKey: "voyageNo",
            header: "Voyage",
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
      cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
        <div className="text-right">{row.original.totAmt}</div>
      ),
    },
    {
      accessorKey: "gstPercentage",
      header: "GST %",
      size: 60,
      cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
        <div className="text-right">{row.original.gstPercentage}</div>
      ),
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amt",
      size: 100,
      cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
        <div className="text-right">{row.original.gstAmt}</div>
      ),
    },
    {
      accessorKey: "totLocalAmt",
      header: "Local Amt",
      size: 100,
      cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
        <div className="text-right">{row.original.totLocalAmt}</div>
      ),
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amt",
      size: 100,
      cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
        <div className="text-right">{row.original.gstLocalAmt}</div>
      ),
    },
    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "totCtyAmt",
            header: "Country Amt",
            size: 100,
            cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
              <div className="text-right">{row.original.totCtyAmt}</div>
            ),
          },
          {
            accessorKey: "gstCtyAmt",
            header: "GST Country Amt",
            size: 100,
            cell: ({ row }: { row: { original: ICbGenPaymentDt } }) => (
              <div className="text-right">{row.original.gstCtyAmt}</div>
            ),
          },
        ]
      : []),
  ]

  if (!mounted) {
    return null
  }

  return (
    <AccountBaseTable
      data={data}
      columns={columns as ColumnDef<unknown>[]}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onEdit={onEdit as ((item: unknown) => void) | undefined}
      onRefresh={onRefresh}
      onFilterChange={onFilterChange}
      onDataReorder={
        onDataReorder as ((newData: unknown[]) => void) | undefined
      }
      accessorId={"itemNo" as never}
      tableName={TableName.cbGenPaymentDt}
    />
  )
}
