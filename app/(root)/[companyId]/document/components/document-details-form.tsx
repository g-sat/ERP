"use client"

import { useEffect, useRef, useState } from "react"
import { IUniversalDocumentDt } from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtFormValues,
  universalDocumentDtSchema,
} from "@/schemas/universal-documents"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { FileText, Trash2, X } from "lucide-react"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { usePersistDocumentDetails } from "@/hooks/use-universal-documents"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import DocumentTypeAutocomplete from "@/components/ui-custom/autocomplete-document-type"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"

interface DocumentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail?: IUniversalDocumentDt
  documentId?: number
  onCancel: () => void
}

export function DocumentDetailsForm({
  open,
  onOpenChange,
  detail,
  documentId,
  onCancel,
}: DocumentDetailsDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const persistDetailsMutation = usePersistDocumentDetails()

  const form = useForm<UniversalDocumentDtFormValues>({
    resolver: zodResolver(universalDocumentDtSchema),
    defaultValues: {
      documentId: documentId,
      docTypeId: detail?.docTypeId || 0,
      versionNo: detail?.versionNo || 0,
      documentNo: detail?.documentNo || "",
      issueOn: detail?.issueOn
        ? format(
            parseDate(detail.issueOn as string) || new Date(),
            clientDateFormat
          )
        : null,
      validFrom: detail?.validFrom
        ? format(
            parseDate(detail.validFrom as string) || new Date(),
            clientDateFormat
          )
        : null,
      expiryOn: detail?.expiryOn
        ? format(
            parseDate(detail.expiryOn as string) || new Date(),
            clientDateFormat
          )
        : null,
      filePath: detail?.filePath || "",
      remarks: detail?.remarks || "",
      renewalRequired: detail?.renewalRequired || false,
    },
    mode: "onChange",
  })

  // Reset form & load preview when dialog opens
  useEffect(() => {
    if (!open) return

    form.reset({
      documentId: detail?.documentId || documentId,
      docTypeId: detail?.docTypeId || 0,
      versionNo: detail?.versionNo || 0,
      documentNo: detail?.documentNo || "",
      issueOn: detail?.issueOn
        ? format(
            parseDate(detail.issueOn as string) || new Date(),
            clientDateFormat
          )
        : null,
      validFrom: detail?.validFrom
        ? format(
            parseDate(detail.validFrom as string) || new Date(),
            clientDateFormat
          )
        : null,
      expiryOn: detail?.expiryOn
        ? format(
            parseDate(detail.expiryOn as string) || new Date(),
            clientDateFormat
          )
        : null,
      filePath: detail?.filePath || "",
      remarks: detail?.remarks || "",
      renewalRequired: detail?.renewalRequired || false,
    })

    // Only load preview if editing existing record
    if (detail && detail.filePath) {
      const mockFile = new File(
        [],
        detail.filePath.split("/").pop() || "document",
        {
          type: "application/octet-stream",
        }
      )
      setUploadedFiles([mockFile])
    } else {
      setUploadedFiles([])
    }
  }, [open, detail, form, documentId])

  // File handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    const validFiles: File[] = []

    if (uploadedFiles.length + files.length > 2) {
      alert("You can upload a maximum of 2 files.")
      return
    }

    files.forEach((file) => {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
      if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type for ${file.name}. Allowed: PDF, JPEG, PNG`)
        return
      }
      if (file.size > 7 * 1024 * 1024) {
        alert(`File size must be less than 7MB for ${file.name}`)
        return
      }
      // Prevent duplicates
      if (uploadedFiles.find((f) => f.name === file.name)) {
        alert(`${file.name} already uploaded`)
        return
      }
      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    processFiles(files)
  }

  const handleChooseFile = () => fileInputRef.current?.click()
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    if (uploadedFiles.length === 1) {
      form.setValue("filePath", "")
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  const handleToggleFullscreen = (file: File) => {
    setSelectedFile(file)
    setIsFullscreen(true)
  }

  const handleSubmit = async (data: UniversalDocumentDtFormValues) => {
    try {
      if (data.docTypeId === 0) {
        alert("Please select a document type")
        return
      }
      if (uploadedFiles.length === 0) {
        alert("Please upload at least one file before saving")
        return
      }

      setIsUploading(true)

      // Upload to temp
      const tempFilePaths: string[] = []
      for (const file of uploadedFiles) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("tempPath", "public/temp/upload")

        const uploadResponse = await fetch("/api/upload-temp", {
          method: "POST",
          body: formData,
        })
        if (!uploadResponse.ok) throw new Error("Upload failed")

        const result = await uploadResponse.json()
        tempFilePaths.push(result.filePath)
      }

      // Assign final path
      data.filePath = `public/documents/upload/${uploadedFiles[0].name}`

      const response = await persistDetailsMutation.mutateAsync(data)

      if (response.result === 1) {
        // Move files
        for (let i = 0; i < uploadedFiles.length; i++) {
          const finalFilePath = `public/documents/upload/${uploadedFiles[i].name}`
          await fetch("/api/move-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromPath: tempFilePaths[i],
              toPath: finalFilePath,
            }),
          })
        }
        onOpenChange(false)
      } else {
        // Cleanup temp
        for (const path of tempFilePaths) {
          await fetch("/api/delete-temp-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: path }),
          })
        }
      }
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Upload Section */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`rounded-lg border-2 border-dashed p-8 text-center transition ${
                uploadedFiles.length > 0
                  ? "border-green-300"
                  : "border-gray-300"
              }`}
            >
              {uploadedFiles.length === 0 ? (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    Drag & Drop File Here
                  </p>
                  <div className="mx-auto my-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-pink-500 shadow-sm">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">- or -</p>
                  <Button
                    type="button"
                    onClick={handleChooseFile}
                    disabled={isUploading}
                    className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    Choose file to upload
                  </Button>
                  <div className="mt-4 flex items-start space-x-2 text-sm text-gray-600">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-200">
                      <svg
                        className="h-3 w-3 text-orange-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p>You can upload a maximum of 2 files. please</p>
                      <p>ensure each file size should not exceed 7MB.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative overflow-hidden rounded-lg bg-white">
                  {/* File Preview Area */}
                  <div className="flex min-h-[200px] items-center justify-center p-4">
                    <div className="text-center">
                      {uploadedFiles[activeImageIndex] ? (
                        <>
                          {/* File Type Icon */}
                          {uploadedFiles[activeImageIndex].type.includes(
                            "pdf"
                          ) ? (
                            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-red-100">
                              <FileText className="h-24 w-24 text-red-600" />
                            </div>
                          ) : (
                            <div className="mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                              <img
                                src={URL.createObjectURL(
                                  uploadedFiles[activeImageIndex]
                                )}
                                alt={uploadedFiles[activeImageIndex].name}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div className="mt-2 text-sm font-medium text-gray-900">
                            {uploadedFiles[activeImageIndex].name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {uploadedFiles[activeImageIndex].size > 0
                              ? `${(uploadedFiles[activeImageIndex].size / 1024 / 1024).toFixed(2)} MB`
                              : "Existing file"}
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                            <svg
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                          <div className="mt-2 text-sm font-medium text-gray-500">
                            No File
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dark Blue Floating Toolbar */}
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center space-x-2 rounded-lg bg-blue-800 p-2 shadow-lg">
                    {/* 1st file button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!uploadedFiles[0]) {
                          handleChooseFile()
                        } else {
                          setActiveImageIndex(0)
                        }
                      }}
                      className={`rounded p-2 text-white hover:bg-blue-700 ${
                        activeImageIndex === 0 && uploadedFiles[0]
                          ? "bg-blue-600"
                          : ""
                      }`}
                    >
                      {!uploadedFiles[0] ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* 2nd file button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!uploadedFiles[1]) {
                          handleChooseFile()
                        } else {
                          setActiveImageIndex(1)
                        }
                      }}
                      className={`rounded p-2 text-white hover:bg-blue-700 ${
                        activeImageIndex === 1 && uploadedFiles[1]
                          ? "bg-blue-600"
                          : ""
                      }`}
                    >
                      {!uploadedFiles[1] ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>

                    {/* Expand Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        const activeFile = uploadedFiles[activeImageIndex]
                        if (activeFile) {
                          handleToggleFullscreen(activeFile)
                        }
                      }}
                      className="rounded p-2 text-white hover:bg-blue-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    </button>

                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        const activeFile = uploadedFiles[activeImageIndex]
                        if (activeFile) {
                          handleRemoveFile(activeImageIndex)
                          // Reset to first image if available after deletion
                          if (activeImageIndex === 1 && uploadedFiles[0]) {
                            setActiveImageIndex(0)
                          }
                        }
                      }}
                      disabled={isUploading}
                      className="rounded p-2 text-white hover:bg-blue-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-2 gap-2">
              <DocumentTypeAutocomplete
                form={form}
                label="Document Type"
                name="docTypeId"
                isRequired
              />
              <CustomInput
                form={form}
                label="Document Number"
                name="documentNo"
                isRequired
              />
              <CustomInput
                form={form}
                label="Version Number"
                name="versionNo"
                isDisabled
              />

              <CustomDateNew
                form={form}
                label="Issued on"
                name="issueOn"
                isRequired
              />
              <CustomDateNew form={form} label="Valid from" name="validFrom" />
              <CustomDateNew
                form={form}
                label="Expires on"
                name="expiryOn"
                isRequired
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="submit"
              disabled={
                isUploading ||
                persistDetailsMutation.isPending ||
                uploadedFiles.length === 0
              }
            >
              {isUploading || persistDetailsMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {/* Fullscreen Preview Dialog */}
      {isFullscreen && selectedFile && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="h-[90vh] w-[90vw] overflow-hidden rounded-lg border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-medium">
                File Preview - {selectedFile.name}
              </h3>
              <button
                onClick={() => {
                  setIsFullscreen(false)
                  setSelectedFile(null)
                }}
                className="rounded p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex h-full items-center justify-center p-4">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={selectedFile.name}
                className="h-[70%] w-[70%] rounded object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
