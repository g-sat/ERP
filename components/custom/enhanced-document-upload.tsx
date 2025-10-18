"use client"

import { useCallback, useState } from "react"
import { IDocType, IDocument, IDocumentTypeLookup } from "@/interfaces/lookup"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import {
  Download,
  Eye,
  FileIcon,
  FileText,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Admin } from "@/lib/api-routes"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DocumentTypeAutocomplete from "@/components/autocomplete/autocomplete-document-type"

import CustomTextarea from "./custom-textarea"

interface EnhancedDocumentUploadProps {
  moduleId: number
  transactionId: number
  recordId?: string // Invoice ID, etc.
  recordNo?: string // Invoice No, etc.
  companyId?: number
  onUploadSuccess?: () => void
  maxFileSize?: number // in MB
  allowedFileTypes?: string[]
  maxFiles?: number
}

interface UploadFile {
  file: File
  id: string
  preview?: string
}

export default function EnhancedDocumentUpload({
  moduleId,
  transactionId,
  recordId = "0",
  recordNo = "",
  companyId,
  onUploadSuccess,
  maxFileSize = 10, // 10MB default
  allowedFileTypes = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".jpg",
    ".jpeg",
    ".png",
  ],
  maxFiles = 10,
}: EnhancedDocumentUploadProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const form = useForm()

  const [selectedDocType, setSelectedDocType] =
    useState<IDocumentTypeLookup | null>(null)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IDocType | null>(
    null
  )
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const {
    data: documents,
    isLoading,
    refetch,
  } = useGet<IDocType>(
    `${Admin.getDocumentById}/${moduleId}/${transactionId}/${recordId}`,
    "documents"
  )

  const saveDocumentMutation = usePersist<IDocument | IDocument[]>(
    Admin.saveDocument
  )
  const deleteDocumentMutation = useDelete(Admin.deleteDocument)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files))
    }
  }

  // Add files with validation
  const addFiles = (files: File[]) => {
    const newFiles: UploadFile[] = []

    for (const file of files) {
      // Check file count
      if (uploadFiles.length + newFiles.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        break
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxFileSize) {
        toast.error(`${file.name} exceeds ${maxFileSize}MB limit`)
        continue
      }

      // Check file type
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase()
      if (!allowedFileTypes.includes(fileExt)) {
        toast.error(`${file.name} type not allowed`)
        continue
      }

      // Add file
      newFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
      })
    }

    if (newFiles.length > 0) {
      setUploadFiles((prev) => [...prev, ...newFiles])
      toast.success(`${newFiles.length} file(s) added`)
    }
  }

  // Remove file from upload queue
  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadFiles.length, maxFiles, maxFileSize, allowedFileTypes]
  )

  // Upload all files
  const handleUploadAll = async () => {
    if (!selectedDocType || uploadFiles.length === 0) {
      toast.error("Please select document type and add files")
      return
    }

    if (recordId === "0") {
      toast.error("Please save the record first before uploading documents")
      return
    }

    setIsUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      // Step 1: Upload all files and collect their paths
      const documentsToSave: IDocument[] = []

      for (let index = 0; index < uploadFiles.length; index++) {
        const uploadFile = uploadFiles[index]
        try {
          // Upload the file to get the file path
          const formData = new FormData()
          formData.append("file", uploadFile.file)
          formData.append("moduleId", moduleId.toString())
          formData.append("transactionId", transactionId.toString())
          if (companyId) {
            formData.append("companyId", companyId.toString())
          }

          const uploadResponse = await fetch(`/api/documents/upload`, {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("File upload failed")
          }

          const uploadResult = await uploadResponse.json()
          const filePath = uploadResult.filePath || uploadFile.file.name

          // Collect document metadata
          const documentData: IDocument = {
            transactionId: transactionId,
            moduleId: moduleId,
            documentId: recordId,
            documentNo: recordNo,
            itemNo: index + 1,
            docTypeId: selectedDocType.docTypeId,
            docPath: filePath,
            remarks: form.getValues("remarks") || "",
          }

          documentsToSave.push(documentData)
        } catch (error) {
          console.error(`Failed to upload ${uploadFile.file.name}:`, error)
          failCount++
        }
      }

      // Step 2: Save all document metadata in one API call
      if (documentsToSave.length > 0) {
        try {
          const saveResult =
            await saveDocumentMutation.mutateAsync(documentsToSave)

          if (saveResult.result === 1) {
            successCount = documentsToSave.length
            toast.success(
              `${successCount} document(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ""}`
            )
            setUploadFiles([])
            setSelectedDocType(null)
            refetch()
            onUploadSuccess?.()
          } else {
            throw new Error(saveResult.message || "Save failed")
          }
        } catch (error) {
          console.error("Failed to save documents:", error)
          toast.error("Failed to save document metadata")
        }
      } else {
        toast.error("All uploads failed")
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Delete document
  const handleDelete = async (documentId: string) => {
    try {
      const response = await deleteDocumentMutation.mutateAsync(documentId)

      if (response.result === 1) {
        refetch()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  // Preview document
  const handlePreview = (doc: IDocType) => {
    setSelectedDocument(doc)
    setPreviewUrl(doc.docPath)
  }

  // Download document
  const handleDownload = (doc: IDocType) => {
    const link = document.createElement("a")
    link.href = doc.docPath
    link.download = doc.docPath.split("/").pop() || "document"
    link.click()
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <>
      <div className="grid grid-cols-10 gap-4">
        {/* Upload Section - 30% */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex flex-col gap-2">
                <span>Upload Documents</span>
                {recordId !== "0" && (
                  <Badge variant="outline" className="w-fit">
                    {recordNo || recordId}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Document Type Selection */}
                <div className="grid gap-2">
                  <Label>Document Type *</Label>
                  <DocumentTypeAutocomplete
                    form={form}
                    name="docTypeId"
                    label=""
                    onChangeEvent={(option) => setSelectedDocType(option)}
                  />
                  <CustomTextarea
                    form={form}
                    name="remarks"
                    label="Remarks"
                    placeholder="Enter remarks"
                  />
                </div>

                {/* Drag & Drop Zone */}
                <div
                  className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum {maxFiles} files, {maxFileSize}MB per file
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: {allowedFileTypes.join(", ")}
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept={allowedFileTypes.join(",")}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                </div>

                {/* Selected Files List */}
                {uploadFiles.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        Selected Files ({uploadFiles.length})
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFiles([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {uploadFiles.map((uploadFile) => (
                        <div
                          key={uploadFile.id}
                          className="flex items-center justify-between rounded border bg-gray-50 p-2"
                        >
                          <div className="flex flex-1 items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <div className="flex-1">
                              <p className="truncate text-sm font-medium">
                                {uploadFile.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(uploadFile.file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  type="button"
                  onClick={handleUploadAll}
                  disabled={
                    !selectedDocType ||
                    uploadFiles.length === 0 ||
                    isUploading ||
                    recordId === "0"
                  }
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Uploading {uploadFiles.length} file(s)...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload{" "}
                      {uploadFiles.length > 0 ? `${uploadFiles.length} ` : ""}
                      File(s)
                    </>
                  )}
                </Button>

                {recordId === "0" && (
                  <p className="text-center text-sm text-orange-600">
                    💡 Please save the invoice first before uploading documents
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Documents List - 70% */}
        <div className="col-span-7">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Uploaded Documents</span>
                {documents?.data && Array.isArray(documents.data) && (
                  <Badge variant="secondary">
                    {documents.data.length} document(s)
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Type</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(documents?.data) &&
                      documents.data.length > 0 ? (
                        (documents.data as IDocType[]).map((doc) => (
                          <TableRow key={doc.documentId}>
                            <TableCell className="font-medium">
                              {doc.docTypeName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  {doc.docPath?.split("/").pop() ||
                                    doc.documentNo}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {doc.createDate
                                ? format(new Date(doc.createDate), dateFormat)
                                : "-"}
                            </TableCell>
                            <TableCell>{doc.createBy || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreview(doc)}
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(doc)}
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (
                                      confirm(
                                        "Are you sure you want to delete this document?"
                                      )
                                    ) {
                                      handleDelete(doc.documentId)
                                    }
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-gray-500"
                          >
                            No documents uploaded yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!selectedDocument}
        onOpenChange={() => {
          setSelectedDocument(null)
          setPreviewUrl("")
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Document Preview</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    selectedDocument && handleDownload(selectedDocument)
                  }
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="mt-4">
              <div className="mb-2 text-sm text-gray-600">
                <p>
                  <strong>Type:</strong> {selectedDocument.docTypeName}
                </p>
                <p>
                  <strong>File:</strong>{" "}
                  {selectedDocument.docPath?.split("/").pop()}
                </p>
              </div>
              <iframe
                src={previewUrl}
                className="h-[600px] w-full rounded border"
                title="Document Preview"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
