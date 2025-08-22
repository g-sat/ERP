"use client"

import { useEffect, useRef, useState } from "react"
import { IUniversalDocumentDt } from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtFormValues,
  universalDocumentDtSchema,
} from "@/schemas/universal-documents"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Upload, X } from "lucide-react"
import { useForm } from "react-hook-form"

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
  onSave?: (detail: UniversalDocumentDtFormValues) => void
  onCancel: () => void
}

export function DocumentDetailsForm({
  open,
  onOpenChange,
  detail,
  onSave,
  onCancel,
}: DocumentDetailsDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const persistDetailsMutation = usePersistDocumentDetails()

  const form = useForm<UniversalDocumentDtFormValues>({
    resolver: zodResolver(universalDocumentDtSchema),
    defaultValues: {
      documentId: detail?.documentId || 0,
      docTypeId: detail?.docTypeId || 0,
      versionNo: detail?.versionNo || 0,
      documentNo: detail?.documentNo || "",
      issueOn: detail?.issueOn || null,
      validFrom: detail?.validFrom || null,
      expiryOn: detail?.expiryOn || null,
      filePath: detail?.filePath || "",
      fileType: detail?.fileType || null,
      remarks: detail?.remarks || "",
      renewalRequired: detail?.renewalRequired || false,
    },
    mode: "onChange", // Enable real-time validation
  })

  // Debug form validation state
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log("Form values changed:", { name, type, value })
      console.log("Form errors:", form.formState.errors)
      console.log("Form is valid:", form.formState.isValid)
      console.log("Form is dirty:", form.formState.isDirty)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Reset form when dialog opens/closes or detail changes
  useEffect(() => {
    if (open) {
      form.reset({
        documentId: detail?.documentId || 0,
        docTypeId: detail?.docTypeId || 0,
        versionNo: detail?.versionNo || 0,
        documentNo: detail?.documentNo || "",
        issueOn: detail?.issueOn || null,
        validFrom: detail?.validFrom || null,
        expiryOn: detail?.expiryOn || null,
        filePath: detail?.filePath || "",
        fileType: detail?.fileType || null,
        remarks: detail?.remarks || "",
        renewalRequired: detail?.renewalRequired || false,
      })
      setUploadedFile(null)
    }
  }, [open, detail, form])

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

  const handleSubmit = async (data: UniversalDocumentDtFormValues) => {
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
          data.filePath = tempFilePath
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError)
          alert("Failed to upload file. Please try again.")
          setIsUploading(false)
          return
        }
      }

      // Step 2: Save document details
      const response = await persistDetailsMutation.mutateAsync(data)

      // Step 3: Handle response
      if (response.result === 1) {
        // Success: Move file from temp to final location
        if (uploadedFile && tempFilePath) {
          try {
            const moveResponse = await fetch("/api/move-file", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fromPath: tempFilePath,
                toPath: `public/documents/upload/${uploadedFile.name}`,
              }),
            })

            if (!moveResponse.ok) {
              console.warn(
                "Failed to move file to final location, but document was saved"
              )
            }
          } catch (moveError) {
            console.warn("Error moving file to final location:", moveError)
          }
        }
        debugger
        onSave?.(data) // Call onSave callback if provided
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
                      ? "File Uploaded Successfully"
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
                    <div className="mt-4 rounded-md border border-green-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {uploadedFile.name}
                          </span>
                          <span className="text-xs text-green-600">
                            ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          disabled={isUploading}
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
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
              onClick={() => {
                console.log("Current form values:", form.getValues())
                console.log("Form errors:", form.formState.errors)
                console.log("Form is valid:", form.formState.isValid)
                console.log("Form is dirty:", form.formState.isDirty)
                form.handleSubmit(handleSubmit)()
              }}
              disabled={
                isUploading || persistDetailsMutation.isPending || !uploadedFile
              }
            >
              Debug Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const isValid = form.trigger()
                console.log("Manual validation triggered")
                isValid.then((valid) => {
                  console.log("Form is valid:", valid)
                  console.log(
                    "Form errors after validation:",
                    form.formState.errors
                  )
                })
              }}
              disabled={isUploading || persistDetailsMutation.isPending}
            >
              Test Validation
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Bypass form validation and directly call handleSubmit
                const formData = form.getValues()
                console.log(
                  "Bypassing validation, calling handleSubmit directly with:",
                  formData
                )
                handleSubmit(formData)
              }}
              disabled={
                isUploading || persistDetailsMutation.isPending || !uploadedFile
              }
            >
              Force Submit
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
    </div>
  )
}
