import { useEffect, useState } from "react"
import { ICbBatchPaymentDt } from "@/interfaces"
import { IVisibleFields } from "@/interfaces/setting"
import { ColumnDef } from "@tanstack/react-table"

import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
import { AccountBaseTable } from "@/components/table/table-account"

// Use flexible data type that can work with form data
interface BatchPaymentDetailsTableProps {
  data: ICbBatchPaymentDt[]
  onDelete?: (itemNo: number) => void
  onBulkDelete?: (selectedItemNos: number[]) => void
  onEdit?: (template: ICbBatchPaymentDt) => void
  onRefresh?: () => void
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void
  onDataReorder?: (newData: ICbBatchPaymentDt[]) => void
  visible: IVisibleFields
}

export default function BatchPaymentDetailsTable({
  data,
  onDelete,
  onBulkDelete,
  onEdit,
  onRefresh,
  onFilterChange,
  onDataReorder,
  visible,
}: BatchPaymentDetailsTableProps) {
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
  const columns: ColumnDef<ICbBatchPaymentDt>[] = [
    {
      accessorKey: "itemNo",
      header: "No",
      size: 50,
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
        <div className="text-right">{row.original.itemNo}</div>
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      size: 80,
    },
    {
      accessorKey: "invoiceNo",
      header: "Invoice No",
      size: 120,
    },
    {
      accessorKey: "supplierName",
      header: "Supplier",
      size: 120,
    },
    {
      accessorKey: "glCode",
      header: "Code",
      size: 80,
    },
    {
      accessorKey: "glName",
      header: "Account",
      size: 100,
    },
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
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
        <div className="text-right">{row.original.totAmt}</div>
      ),
    },

    {
      accessorKey: "gstPercentage",
      header: "GST %",
      size: 50,
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
        <div className="text-right">{row.original.gstPercentage}</div>
      ),
    },
    {
      accessorKey: "gstAmt",
      header: "GST Amount",
      size: 100,
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
        <div className="text-right">{row.original.gstAmt}</div>
      ),
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
    ...(visible?.m_JobOrderId
      ? [
          {
            accessorKey: "jobOrderNo",
            header: "JobOrder",
            size: 120,
          },
        ]
      : []),

    ...(visible?.m_JobOrderId
      ? [
          {
            accessorKey: "taskName",
            header: "Task Name",
            size: 200,
          },
          {
            accessorKey: "serviceName",
            header: "Service Name",
            size: 200,
          },
        ]
      : []),

    {
      accessorKey: "totLocalAmt",
      header: "Local Amount",
      size: 100,
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
        <div className="text-right">{row.original.totLocalAmt}</div>
      ),
    },
    {
      accessorKey: "gstLocalAmt",
      header: "GST Local Amount",
      size: 100,
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
        <div className="text-right">{row.original.gstLocalAmt}</div>
      ),
    },
    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "totCtyAmt",
            header: "Country Amount",
            size: 100,
            cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
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

    ...(visible?.m_CtyCurr
      ? [
          {
            accessorKey: "gstCtyAmt",
            header: "GST Country Amount",
            size: 100,
            cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
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
      cell: ({ row }: { row: { original: ICbBatchPaymentDt } }) => (
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
        transactionId={CBTransactionId.cbbatchpayment}
        tableName={TableName.cbBatchPaymentDt}
        emptyMessage="No Batch Payment details found."
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
