"use client"

import { useEffect } from "react"
import { IUniversalDocumentDt } from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtFormValues,
  universalDocumentDtSchema,
} from "@/schemas/universal-documents"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Upload } from "lucide-react"
import { useForm } from "react-hook-form"

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
  const form = useForm<UniversalDocumentDtFormValues>({
    resolver: zodResolver(universalDocumentDtSchema),
    defaultValues: {
      documentId: detail?.documentId || 0,
      docTypeId: detail?.docTypeId || 0,
      versionNo: detail?.versionNo || 1,
      documentNo: detail?.documentNo || "",
      issueOn: detail?.issueOn || "",
      validFrom: detail?.validFrom || "",
      expiryOn: detail?.expiryOn || "",
      filePath: detail?.filePath || "",
      fileType: detail?.fileType || null,
      remarks: detail?.remarks || "",
      renewalRequired: detail?.renewalRequired || false,
    },
  })

  // Reset form when dialog opens/closes or detail changes
  useEffect(() => {
    if (open) {
      form.reset({
        documentId: detail?.documentId || 0,
        docTypeId: detail?.docTypeId || 0,
        versionNo: detail?.versionNo || 1,
        documentNo: detail?.documentNo || "",
        issueOn: detail?.issueOn || "",
        validFrom: detail?.validFrom || "",
        expiryOn: detail?.expiryOn || "",
        filePath: detail?.filePath || "",
        fileType: detail?.fileType || null,
        remarks: detail?.remarks || "",
        renewalRequired: detail?.renewalRequired || false,
      })
    }
  }, [open, detail, form])

  const handleSubmit = async (data: UniversalDocumentDtFormValues) => {
    try {
      if (data.docTypeId === 0) {
        alert("Please select a document type")
        return
      }

      onSave?.(data) // Call onSave callback if provided
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving document detail:", error)
    }
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Section - File Upload */}
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <div className="space-y-4">
                  <p className="text-lg font-medium">Drag & Drop File Here</p>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-500">- or -</p>
                  <Button variant="outline" type="button">
                    Choose file to upload
                  </Button>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>
                      You can upload a maximum of 2 files. please ensure each
                      file size should not exceed 7MB.
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
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
