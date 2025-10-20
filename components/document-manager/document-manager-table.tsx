"use client"

import { IDocType } from "@/interfaces/lookup"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { FileText } from "lucide-react"

import { TableName } from "@/lib/utils"

import { DocumentBaseTable } from "../table/table-document"

interface DocumentManagerTableProps {
  data: IDocType[]
  isLoading?: boolean
  onPreview?: (doc: IDocType) => void
  onDownload?: (doc: IDocType) => void
  onDelete?: (documentId: string) => void
  onSelect?: (documentId: string, checked: boolean) => void
  onSelectAll?: (checked: boolean) => void
  selectedDocuments?: string[]
  selectAll?: boolean
}

export default function DocumentManagerTable({
  data,
  isLoading = false,
  onPreview,
  onDownload,
  onDelete,
  onSelect: _onSelect,
  onSelectAll: _onSelectAll,
  selectedDocuments: _selectedDocuments = [],
  selectAll: _selectAll = false,
}: DocumentManagerTableProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Define columns using the same pattern as table-account
  const columns: ColumnDef<IDocType>[] = [
    {
      accessorKey: "itemNo",
      header: "Item No",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("itemNo") || "-"}</div>
      ),
      size: 60,
    },
    {
      accessorKey: "docTypeName",
      header: "Document Type",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("docTypeName")}</div>
      ),
    },
    {
      accessorKey: "docPath",
      header: "File Name",
      cell: ({ row }) => {
        const docPath = row.getValue("docPath") as string
        const documentNo = row.getValue("documentNo") as string
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              {docPath?.split("/").pop() || documentNo || "-"}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="text-muted-foreground text-sm">
          {row.getValue("remarks") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "createDate",
      header: "Created Date",
      cell: ({ row }) => {
        const date = row.getValue("createDate") as string
        return date ? format(new Date(date), dateFormat) : "-"
      },
    },
    {
      accessorKey: "createBy",
      header: "Created By",
      cell: ({ row }) => <div>{row.getValue("createBy") || "-"}</div>,
    },
    {
      accessorKey: "editDate",
      header: "Edit Date",
      cell: ({ row }) => {
        const date = row.getValue("editDate") as string
        return date ? format(new Date(date), dateFormat) : "-"
      },
    },
    {
      accessorKey: "editBy",
      header: "Edit By",
      cell: ({ row }) => <div>{row.getValue("editBy") || "-"}</div>,
    },
  ]

  return (
    <DocumentBaseTable<IDocType>
      data={data}
      columns={columns}
      isLoading={isLoading}
      tableName={TableName.document}
      emptyMessage="No documents uploaded yet"
      accessorId="documentId"
      onSelect={(item) => {
        if (item) {
          onPreview?.(item)
        }
      }}
      onDataReorder={(_newData) => {
        // Handle data reorder - this will update the parent component
        // The itemNo will be automatically updated in the table component
      }}
      onSaveOrder={(_newData) => {
        // Handle save order - this should save the new order to the backend
        console.log("Save order:", _newData)
      }}
      onDownload={onDownload}
      onDelete={onDelete}
      showHeader={false}
      showActions={true}
      hideView={false}
      hideDownload={false}
      hideDelete={false}
      hideCheckbox={false}
    />
  )
}
