"use client"

import { useEffect, useRef, useState } from "react"
import { IUniversalDocumentDt } from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtFormValues,
  universalDocumentDtSchema,
} from "@/schemas/universal-documents"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { FileText, Upload, X } from "lucide-react"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { usePersistDocumentDetails } from "@/hooks/use-universal-documents"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import DocumentTypeAutocomplete from "@/components/ui-custom/autocomplete-document-type"
import FileTypeAutocomplete from "@/components/ui-custom/autocomplete-file-type"
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
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
      fileType: detail?.fileType || null,
      remarks: detail?.remarks || "",
      renewalRequired: detail?.renewalRequired || false,
    },
    mode: "onChange", // Enable real-time validation
  })

  // Debug form validation state
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      console.log("Form values changed:", { name, value })
      console.log("Form errors:", form.formState.errors)
      console.log("Form is valid:", form.formState.isValid)
      console.log("Form is dirty:", form.formState.isDirty)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Debug documentId usage
  useEffect(() => {
    console.log("DocumentDetailsForm - documentId:", documentId)
    console.log("DocumentDetailsForm - detail:", detail)
    console.log(
      "DocumentDetailsForm - final documentId:",
      detail?.documentId || documentId
    )
  }, [documentId, detail])

  // Reset form when dialog opens/closes or detail changes
  useEffect(() => {
    if (open) {
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
        fileType: detail?.fileType || null,
        remarks: detail?.remarks || "",
        renewalRequired: detail?.renewalRequired || false,
      })

      // Load existing file information for preview
      if (detail?.filePath && detail?.fileType) {
        // Create a mock file object for preview
        const mockFile = new File(
          [],
          detail.filePath.split("/").pop() || "document",
          {
            type:
              detail.fileType === "PDF"
                ? "application/pdf"
                : detail.fileType === "JPEG"
                  ? "image/jpeg"
                  : detail.fileType === "PNG"
                    ? "image/png"
                    : "application/octet-stream",
          }
        )
        setUploadedFile(mockFile)
      } else {
        setUploadedFile(null)
      }
    }
  }, [open, detail, form, documentId])

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ]
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid file type (PDF, JPEG, JPG, PNG)")
        return
      }

      // Validate file size (7MB limit)
      if (file.size > 7 * 1024 * 1024) {
        alert("File size must be less than 7MB")
        return
      }

      setUploadedFile(file)

      // Set file type in form
      const fileExtension = file.name.split(".").pop()?.toUpperCase()
      if (fileExtension === "PDF") {
        form.setValue("fileType", "PDF")
      } else if (fileExtension === "JPEG" || fileExtension === "JPG") {
        form.setValue("fileType", "JPEG")
      } else if (fileExtension === "PNG") {
        form.setValue("fileType", "PNG")
      }
    }
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    form.setValue("filePath", "")
    form.setValue("fileType", null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownloadFile = () => {
    if (uploadedFile) {
      // If it's a new file (has size), use the blob URL
      if (uploadedFile.size > 0) {
        const url = URL.createObjectURL(uploadedFile)
        const a = document.createElement("a")
        a.href = url
        a.download = uploadedFile.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // If it's an existing file (mock file), download from server
        const filePath = uploadedFile.name
        if (filePath) {
          const a = document.createElement("a")
          a.href = `/${filePath}` // Assuming the file is accessible via this path
          a.download = uploadedFile.name
          a.target = "_blank"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      }
    }
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleAddAnotherFile = () => {
    handleChooseFile()
  }

  const handleSubmit = async (data: UniversalDocumentDtFormValues) => {
    debugger
    console.log("Form submitted with data:", data)
    console.log("Form errors:", form.formState.errors)
    console.log("Form is valid:", form.formState.isValid)

    try {
      if (data.docTypeId === 0) {
        alert("Please select a document type")
        return
      }

      // Check if file is uploaded
      if (!uploadedFile) {
        alert("Please upload a file before saving")
        return
      }

      setIsUploading(true)

      // Step 1: Upload file to temp location if file is selected
      let tempFilePath = ""
      if (uploadedFile) {
        try {
          // Create FormData for file upload
          const formData = new FormData()
          formData.append("file", uploadedFile)
          formData.append("tempPath", "public/temp/upload")

          // Upload to temp location
          const uploadResponse = await fetch("/api/upload-temp", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file to temp location")
          }

          const uploadResult = await uploadResponse.json()
          tempFilePath = uploadResult.filePath

          // Update form with temp file path
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError)
          alert("Failed to upload file. Please try again.")
          setIsUploading(false)
          return
        }
      }
      data.filePath = `public/documents/upload/${uploadedFile.name}`

      // Step 2: Save document details
      const response = await persistDetailsMutation.mutateAsync(data)

      // Step 3: Handle response
      if (response.result === 1) {
        debugger
        // Success: Move file from temp to final location
        if (uploadedFile && tempFilePath) {
          try {
            // Use the actual save path for documents
            const finalFilePath = `public/documents/upload/${uploadedFile.name}`

            const moveResponse = await fetch("/api/move-file", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fromPath: tempFilePath,
                toPath: finalFilePath,
              }),
            })

            if (!moveResponse.ok) {
              console.warn(
                "Failed to move file to final location, but document was saved"
              )
            } else {
              // Update the filePath to the final location
              data.filePath = finalFilePath
            }
          } catch (moveError) {
            console.warn("Error moving file to final location:", moveError)
          }
        }
        debugger
        onOpenChange(false)
      } else {
        // Failure: Remove temp file if it exists
        if (tempFilePath) {
          try {
            await fetch("/api/delete-temp-file", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                filePath: tempFilePath,
              }),
            })
          } catch (deleteError) {
            console.warn("Error deleting temp file:", deleteError)
          }
        }
        // Dialog stays open, error message shown via toast
      }
    } catch (error) {
      console.error("Error saving document detail:", error)
      // Don't close dialog on error
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
      {/* Warning banner when no file is uploaded */}
      {!uploadedFile && (
        <div className="rounded-md border border-red-200 p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              ⚠️ File Upload Required: Please upload a document file before
              saving
            </span>
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("Form submit event triggered")
            console.log("Form errors before submit:", form.formState.errors)
            console.log("Form is valid:", form.formState.isValid)
            form.handleSubmit(handleSubmit)(e)
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            {/* Left Section - File Upload */}
            <div className="space-y-4">
              <div
                className={`rounded-lg border-2 border-dashed p-8 text-center ${
                  uploadedFile ? "border-green-300" : "border-red-300"
                }`}
              >
                <div className="space-y-4">
                  <p className="text-lg font-medium">
                    {uploadedFile
                      ? uploadedFile.size > 0
                        ? "File Uploaded Successfully"
                        : "Existing File Loaded"
                      : "Drag & Drop File Here"}
                  </p>
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                      uploadedFile
                        ? "bg-gradient-to-br from-green-400 to-green-600"
                        : "bg-gradient-to-br from-red-400 to-red-600"
                    }`}
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">- or -</p>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleChooseFile}
                    disabled={isUploading}
                  >
                    Choose file to upload
                  </Button>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Show uploaded file */}
                  {uploadedFile && (
                    <div className="relative mt-4">
                      {/* File Preview Container */}
                      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                        {/* File Preview Area */}
                        <div className="flex min-h-[200px] items-center justify-center bg-gray-50 p-8">
                          <div className="text-center">
                            <div className="mx-auto mb-4">
                              {/* File Type Icon */}
                              {uploadedFile.type.includes("pdf") ? (
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-red-100">
                                  <FileText className="h-8 w-8 text-red-600" />
                                </div>
                              ) : (
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100">
                                  <FileText className="h-8 w-8 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {uploadedFile.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {uploadedFile.size > 0
                                ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                                : "Existing file"}
                            </div>
                            {uploadedFile.size === 0 && (
                              <div className="mt-1 text-xs text-blue-600">
                                Click download to retrieve file
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dark Floating Toolbar */}
                        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center space-x-2 rounded-lg bg-gray-800 p-2 shadow-lg">
                          {/* Image/File Icon */}
                          <button className="rounded p-2 text-white hover:bg-gray-700">
                            <FileText className="h-4 w-4" />
                          </button>

                          {/* Plus Icon */}
                          <button
                            onClick={handleAddAnotherFile}
                            className="rounded p-2 text-white hover:bg-gray-700"
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>

                          {/* Download Icon */}
                          <button
                            onClick={handleDownloadFile}
                            className="rounded p-2 text-white hover:bg-gray-700"
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
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </button>

                          {/* Expand Icon */}
                          <button
                            onClick={handleToggleFullscreen}
                            className="rounded p-2 text-white hover:bg-gray-700"
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
                            onClick={handleRemoveFile}
                            disabled={isUploading}
                            className="rounded p-2 text-white hover:bg-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show warning when no file is uploaded */}
                  {!uploadedFile && (
                    <div className="mt-4 rounded-md border border-red-200 p-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Please upload a file to continue
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>
                      Supported formats: PDF, JPEG, JPG, PNG. Max size: 7MB.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Document Details */}
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
                placeholder="Enter document number"
                isRequired
              />

              <CustomInput
                form={form}
                label="Version Number"
                name="versionNo"
                placeholder="Enter version number"
                isRequired
                isDisabled={true}
              />
              <FileTypeAutocomplete
                form={form}
                label="File Type"
                name="fileType"
                isRequired
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
                isUploading || persistDetailsMutation.isPending || !uploadedFile
              }
              className={!uploadedFile ? "cursor-not-allowed opacity-50" : ""}
              title={!uploadedFile ? "Please upload a file before saving" : ""}
            >
              {isUploading || persistDetailsMutation.isPending
                ? "Saving..."
                : !uploadedFile
                  ? "Upload File First"
                  : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading || persistDetailsMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && uploadedFile && (
        <div className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-lg bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-medium">{uploadedFile.name}</h3>
              <button
                onClick={handleToggleFullscreen}
                className="rounded p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex min-h-[400px] items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto mb-4">
                  {/* File Type Icon */}
                  {uploadedFile.type.includes("pdf") ? (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-red-100">
                      <FileText className="h-12 w-12 text-red-600" />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="mb-2 text-lg font-medium text-gray-900">
                  {uploadedFile.name}
                </div>
                <div className="mb-4 text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={handleDownloadFile}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Download
                  </button>
                  <button
                    onClick={handleToggleFullscreen}
                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
