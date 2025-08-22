"use client"

import { useEffect, useState } from "react"
import { IUniversalDocumentDt } from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtFormValues,
  universalDocumentDtSchema,
} from "@/schemas/universal-documents"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText } from "lucide-react"
import { useForm } from "react-hook-form"

import { usePersistDocumentDetails } from "@/hooks/use-universal-documents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import DocumentTypeAutocomplete from "@/components/ui-custom/autocomplete-document-type"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface DocumentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail?: IUniversalDocumentDt
  detailIndex?: number
  onSave: (detail: UniversalDocumentDtFormValues, index?: number) => void
  onCancel: () => void
}

export function DocumentDetailsForm({
  open,
  onOpenChange,
  detail,
  detailIndex,
  onSave,
  onCancel,
}: DocumentDetailsDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const isEditing = !!detail
  const persistDetailsMutation = usePersistDocumentDetails()

  const form = useForm<UniversalDocumentDtFormValues>({
    resolver: zodResolver(universalDocumentDtSchema),
    defaultValues: {
      documentId: detail?.documentId || 0,
      docTypeId: detail?.docTypeId || 0,
      versionNo: detail?.versionNo || 0,
      documentNo: detail?.documentNo || "",
      issueDate: detail?.issueDate || "",
      expiryDate: detail?.expiryDate || "",
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
        issueDate: detail?.issueDate || "",
        expiryDate: detail?.expiryDate || "",
        filePath: detail?.filePath || "",
        fileType: detail?.fileType || null,
        remarks: detail?.remarks || "",
        renewalRequired: detail?.renewalRequired || false,
      })
      setUploadedFile(null)
    }
  }, [open, detail, form])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      form.setValue(
        "fileType",
        file.type.split("/")[1].toUpperCase() as "PDF" | "JPEG" | "PNG" | "DOCX"
      )
      form.setValue("filePath", `public/documents/document-expiry/${file.name}`)
    }
  }

  const handleSubmit = async (data: UniversalDocumentDtFormValues) => {
    try {
      // Validate required fields
      if (data.docTypeId === 0) {
        alert("Please select a document type")
        return
      }

      await persistDetailsMutation.mutateAsync(data)
      onSave(data, detailIndex)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving document detail:", error)
      alert("Error saving document detail. Please try again.")
    }
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[60vw] !max-w-none overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? "Edit Document Detail" : "Add Document Detail"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update document detail information"
              : "Add a new document detail to the system"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              <div>
                <DocumentTypeAutocomplete
                  form={form}
                  name="docTypeId"
                  label="Document Type"
                  isRequired={true}
                  onChangeEvent={(selectedOption) => {
                    form.setValue("docTypeId", selectedOption?.docTypeId || 0)
                  }}
                />
              </div>

              <div>
                <CustomInput
                  form={form}
                  name="documentNo"
                  label="Document Number"
                  placeholder="Enter document number"
                />
              </div>

              <div>
                <CustomInput
                  form={form}
                  name="versionNo"
                  label="Version Number *"
                  type="number"
                  placeholder="Enter version number"
                  isDisabled={true}
                />
              </div>

              <div>
                <CustomInput
                  form={form}
                  name="issueDate"
                  label="Issue Date"
                  type="date"
                />
              </div>

              <div>
                <CustomInput
                  form={form}
                  name="expiryDate"
                  label="Expiry Date"
                  type="date"
                />
              </div>

              <div>
                <Label>File Upload</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.docx"
                    onChange={handleFileUpload}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {uploadedFile && (
                    <Badge variant="secondary">{uploadedFile.name}</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.getValues("renewalRequired") || false}
                  onChange={(e) =>
                    form.setValue("renewalRequired", e.target.checked)
                  }
                  className="mt-1"
                />
                <Label>Renewal Required</Label>
              </div>
            </div>

            <div>
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                minRows={3}
                maxRows={6}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={persistDetailsMutation.isPending}>
                {persistDetailsMutation.isPending
                  ? "Saving..."
                  : isEditing
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
