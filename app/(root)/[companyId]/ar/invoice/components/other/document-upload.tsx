import { useState } from "react"
import { IDocType, IDocumentTypeLookup } from "@/interfaces/lookup"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useGetDocumentType } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableHeaderCustom } from "@/components/ui/data-table/data-table-header-custom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DocumentTypeAutocomplete from "@/components/ui-custom/autocomplete-document-type"

interface DocumentUploadProps {
  moduleId: number
  transactionId: number
}

export default function DocumentUpload({
  moduleId,
  transactionId,
}: DocumentUploadProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const form = useForm()

  const [selectedDocType, setSelectedDocType] =
    useState<IDocumentTypeLookup | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IDocType | null>(
    null
  )

  const {
    data: documents,
    isLoading,
    refetch,
  } = useGetDocumentType<IDocType[]>(moduleId, transactionId, "", {})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedDocType || !selectedFile) {
      toast.error("Please select document type and file")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("moduleId", moduleId.toString())
      formData.append("transactionId", transactionId.toString())
      formData.append("itemNo", "1")
      formData.append("docTypeId", selectedDocType.docTypeId.toString())

      const response = await fetch(`/api/documents/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      toast.success("Document uploaded successfully")
      setSelectedDocType(null)
      setSelectedFile(null)
      refetch()
    } catch (error) {
      toast.error("Failed to upload document")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const columns = [
    {
      accessorKey: "docTypeName",
      header: "Document Type",
    },
    {
      accessorKey: "documentNo",
      header: "Document No",
    },
    {
      accessorKey: "createDate",
      header: "Created Date",
      cell: ({ row }: { row: { original: IDocType } }) => {
        const date = row.original.createDate
          ? new Date(row.original.createDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "createBy",
      header: "Created By",
    },
    {
      accessorKey: "editDate",
      header: "Edited Date",
      cell: ({ row }: { row: { original: IDocType } }) => {
        const date = row.original.editDate
          ? new Date(row.original.editDate)
          : null
        return date ? format(date, dateFormat) : "-"
      },
    },
    {
      accessorKey: "editBy",
      header: "Edited By",
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Document Type</Label>
              <DocumentTypeAutocomplete
                form={form}
                name="docTypeId"
                onChangeEvent={(option) => setSelectedDocType(option)}
              />
            </div>
            <div className="grid gap-2">
              <Label>File</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!selectedDocType || !selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <TableHeaderCustom
            searchQuery=""
            onSearchChange={() => {}}
            onRefresh={refetch}
            columns={[]}
            data={documents?.data || []}
            tableName="Documents"
          />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.accessorKey || column.id}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : documents?.data?.length ? (
                  (documents.data as unknown as IDocType[]).map((document) => (
                    <TableRow
                      key={document.documentId}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedDocument(document)}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.accessorKey || column.id}>
                          {column.cell
                            ? column.cell({ row: { original: document } })
                            : String(
                                document[
                                  column.accessorKey as keyof IDocType
                                ] || "-"
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
                      No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedDocument}
        onOpenChange={() => setSelectedDocument(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="mt-4">
              <iframe
                src={`/company/document/${selectedDocument.docPath}`}
                className="h-[600px] w-full"
                title="Document Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
