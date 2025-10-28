"use client"

import { useCallback, useState } from "react"
import { IDocType, IDocument, IDocumentTypeLookup } from "@/interfaces/lookup"
import { useAuthStore } from "@/stores/auth-store"
import { useQueryClient } from "@tanstack/react-query"
import {
  Download,
  FileIcon,
  FileText,
  RotateCcw,
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
import DocumentTypeAutocomplete from "@/components/autocomplete/autocomplete-document-type"
import CustomTextarea from "@/components/custom/custom-textarea"

import DocumentManagerTable from "./document-manager-table"

interface DocumentManagerProps {
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
  progress?: number
  status?: "pending" | "uploading" | "success" | "failed"
  error?: string
}

export default function DocumentManager({
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
}: DocumentManagerProps) {
  const { decimals: _decimals } = useAuthStore()
  const form = useForm()
  const queryClient = useQueryClient()

  const [selectedDocType, setSelectedDocType] =
    useState<IDocumentTypeLookup | null>(null)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IDocType | null>(
    null
  )
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const { data: documents, isLoading } = useGet<IDocType>(
    `${Admin.getDocumentById}/${moduleId}/${transactionId}/${recordId}`,
    `documents-${moduleId}-${transactionId}-${recordId}`
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
        progress: 0,
        status: "pending",
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

  // Retry failed upload
  const retryUpload = (id: string) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: "pending", progress: 0, error: undefined }
          : f
      )
    )
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
      // Step 1: Get the maximum itemNo from existing documents
      let maxItemNo = 0
      if (Array.isArray(documents?.data) && documents.data.length > 0) {
        maxItemNo = Math.max(
          ...(documents.data as IDocType[]).map((doc) => doc.itemNo || 0)
        )
      }

      // Step 2: Upload all files and collect their paths
      const documentsToSave: IDocument[] = []

      for (let index = 0; index < uploadFiles.length; index++) {
        const uploadFile = uploadFiles[index]

        // Update status to uploading
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "uploading", progress: 0 }
              : f
          )
        )

        try {
          // Upload the file to get the file path
          const formData = new FormData()
          formData.append("file", uploadFile.file)
          formData.append("moduleId", moduleId.toString())
          formData.append("transactionId", transactionId.toString())
          if (companyId) {
            formData.append("companyId", companyId.toString())
          }

          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id && f.status === "uploading"
                  ? {
                      ...f,
                      progress: Math.min(
                        (f.progress || 0) + Math.random() * 20,
                        90
                      ),
                    }
                  : f
              )
            )
          }, 200)

          const uploadResponse = await fetch(`/api/documents/upload`, {
            method: "POST",
            body: formData,
          })

          clearInterval(progressInterval)

          if (!uploadResponse.ok) {
            throw new Error("File upload failed")
          }

          const uploadResult = await uploadResponse.json()
          const filePath = uploadResult.filePath || uploadFile.file.name

          // Update status to success
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "success", progress: 100 }
                : f
            )
          )

          // Collect document metadata with incremented itemNo
          const documentData: IDocument = {
            transactionId: transactionId,
            moduleId: moduleId,
            documentId: recordId,
            documentNo: recordNo,
            itemNo: maxItemNo + index + 1,
            docTypeId: selectedDocType.docTypeId,
            docPath: filePath,
            remarks: form.getValues("remarks") || "",
          }

          documentsToSave.push(documentData)
          successCount++
        } catch (error) {
          console.error(`Failed to upload ${uploadFile.file.name}:`, error)
          failCount++

          // Update status to failed
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "failed",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          )
        }
      }

      // Step 3: Save all document metadata in one API call
      if (documentsToSave.length > 0) {
        try {
          const saveResult =
            await saveDocumentMutation.mutateAsync(documentsToSave)

          if (saveResult.result === 1) {
            toast.success(
              `${successCount} document(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ""}`
            )

            // Clear successful uploads after a delay
            setTimeout(() => {
              setUploadFiles((prev) =>
                prev.filter((f) => f.status !== "success")
              )
              if (uploadFiles.every((f) => f.status === "success")) {
                setSelectedDocType(null)
                form.setValue("docTypeId", "")
                form.setValue("remarks", "")
              }
            }, 2000)

            queryClient.invalidateQueries({
              queryKey: [`documents-${moduleId}-${transactionId}-${recordId}`],
            })
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
        queryClient.invalidateQueries({
          queryKey: [`documents-${moduleId}-${transactionId}-${recordId}`],
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  // Preview document
  const handlePreview = (doc: IDocType) => {
    setSelectedDocument(doc)
    // Use API route for serving documents with proper cache control
    const cacheBuster = `?v=${Date.now()}`
    setPreviewUrl(
      `/api/documents/serve${doc.docPath.replace("/documents", "")}${cacheBuster}`
    )
  }

  // Download document
  const handleDownload = (doc: IDocType) => {
    const link = document.createElement("a")
    // Use API route for serving documents with proper cache control
    const cacheBuster = `?v=${Date.now()}`
    link.href = `/api/documents/serve${doc.docPath.replace("/documents", "")}${cacheBuster}`
    link.download = doc.docPath.split("/").pop() || "document"
    link.click()
  }

  // Handle checkbox selection
  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments((prev) => [...prev, documentId])
    } else {
      setSelectedDocuments((prev) => prev.filter((id) => id !== documentId))
    }
  }

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked && Array.isArray(documents?.data)) {
      const allIds = (documents.data as IDocType[]).map((doc) => doc.documentId)
      setSelectedDocuments(allIds)
    } else {
      setSelectedDocuments([])
    }
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
      <div className="grid grid-cols-10 gap-2">
        {/* Upload Section - 30% */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Upload Documents</span>
                  {recordId !== "0" && (
                    <Badge variant="outline" className="w-fit">
                      {recordNo || recordId}
                    </Badge>
                  )}
                </div>
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
                    onChangeEvent={(option) => {
                      setSelectedDocType(option)
                      // Clear remarks when document type changes
                      form.setValue("remarks", "")
                    }}
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
                  <p className="mt-2 text-sm">
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
                    <div className="space-y-3">
                      {uploadFiles.map((uploadFile) => (
                        <div
                          key={uploadFile.id}
                          className="rounded-lg border border-gray-200 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full">
                                <FileText className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {uploadFile.file.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  {uploadFile.status === "uploading" && (
                                    <span className="text-xs font-medium">
                                      {Math.round(uploadFile.progress || 0)}%
                                    </span>
                                  )}
                                  {uploadFile.status === "success" && (
                                    <span className="text-xs font-medium">
                                      Complete
                                    </span>
                                  )}
                                  {uploadFile.status === "failed" && (
                                    <span className="text-xs font-medium">
                                      Failed
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="mb-2 text-xs text-gray-500">
                                {formatFileSize(uploadFile.file.size)}
                              </p>

                              {/* Progress Bar */}
                              {(uploadFile.status === "uploading" ||
                                uploadFile.status === "success") && (
                                <div className="h-2 w-full rounded-full">
                                  <div
                                    className="h-2 rounded-full bg-gray-500 transition-all duration-300"
                                    style={{
                                      width: `${uploadFile.progress || 0}%`,
                                    }}
                                  />
                                </div>
                              )}

                              {/* Error Message */}
                              {uploadFile.status === "failed" &&
                                uploadFile.error && (
                                  <p className="mt-1 text-xs">
                                    {uploadFile.error}
                                  </p>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                              {uploadFile.status === "failed" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => retryUpload(uploadFile.id)}
                                  className="h-8 w-8 p-0 hover:text-gray-700"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(uploadFile.id)}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
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
                      Uploading{" "}
                      {
                        uploadFiles.filter((f) => f.status === "uploading")
                          .length
                      }{" "}
                      of {uploadFiles.length} file(s)...
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
                <div className="flex items-center gap-2">
                  {selectedDocuments.length > 0 && (
                    <Badge variant="default">
                      {selectedDocuments.length} selected
                    </Badge>
                  )}
                  {documents?.data && Array.isArray(documents.data) && (
                    <Badge variant="secondary">
                      {documents.data.length} document(s)
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentManagerTable
                data={
                  Array.isArray(documents?.data)
                    ? (documents.data as IDocType[])
                    : []
                }
                isLoading={isLoading}
                onPreview={handlePreview}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onSelect={handleSelectDocument}
                onSelectAll={handleSelectAll}
                selectedDocuments={selectedDocuments}
                selectAll={selectAll}
              />
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
        <DialogContent className="h-[90vh] w-[90vw] !max-w-none">
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
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Type:</strong> {selectedDocument.docTypeName}
                  </p>
                  <p>
                    <strong>File Name:</strong>{" "}
                    {selectedDocument.docPath?.split("/").pop()}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Remarks:</strong>{" "}
                    {selectedDocument.remarks || "N/A"}
                  </p>
                  <p>
                    By {selectedDocument.createBy || "N/A"} on{" "}
                    {selectedDocument.createDate
                      ? new Date(
                          selectedDocument.createDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
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
