"use client"

import { useState } from "react"
import { IDocumentExpiry } from "@/interfaces/docexpiry"
import {
  DocumentExpiryFormValues,
  documentExpirySchema,
} from "@/schemas/docexpiry"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"

import { DocumentExpiry } from "@/lib/api-routes"
import { useSave } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentTypeAutocomplete from "@/components/ui-custom/autocomplete-documenttype"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextArea from "@/components/ui-custom/custom-textarea"

import DocumentUpload from "./document-upload"

interface DocumentFormProps {
  initialData?: IDocumentExpiry
  submitAction?: (data: DocumentExpiryFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
}

export default function DocumentForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: DocumentFormProps) {
  const { currentCompany, decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const saveMutation = useSave(`${DocumentExpiry.add}`)
  const [filePath, setFilePath] = useState("")

  const form = useForm<DocumentExpiryFormValues>({
    resolver: zodResolver(documentExpirySchema),
    mode: "onChange",
    defaultValues: initialData
      ? { ...initialData }
      : {
          documentId: 0,
          documentName: "",
          docTypeId: 0,
          expiryDate: "",
          remarks: "",
          filePath: "",
          issueDate: "",
          notificationDaysBefore: 30,
          isExpired: false,
        },
  })

  const handleFileUploaded = (uploadedFilePath: string) => {
    setFilePath(uploadedFilePath)
    form.setValue("filePath", uploadedFilePath)
  }

  const onSubmit = (data: DocumentExpiryFormValues) => {
    if (!currentCompany?.companyId) {
      toast.error("No company selected")
      return
    }

    const documentData = {
      ...data,
      docTypeId: Number(data.docTypeId),
      companyId: Number(currentCompany.companyId),
    }

    if (submitAction) {
      submitAction(documentData)
    } else {
      saveMutation.mutate(documentData, {
        onSuccess: () => {
          form.reset()
          setFilePath("")
          toast.success("Document saved successfully")
          window.location.reload()
        },
        onError: (error) => {
          toast.error("Failed to save document")
          console.error("Save error:", error)
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {initialData ? "Edit Document" : "Add New Document"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CustomInput
                form={form}
                name="documentName"
                label="Document Name"
                isRequired={true}
                isDisabled={isReadOnly}
              />

              <DocumentTypeAutocomplete
                form={form}
                name="docTypeId"
                label="Document Type"
                isRequired={true}
                isDisabled={isReadOnly}
              />

              <DocumentUpload
                onFileUploaded={handleFileUploaded}
                currentFilePath={filePath}
              />

              <CustomDateNew
                form={form}
                name="issueDate"
                label="Issue Date"
                isRequired={false}
                dateFormat={dateFormat}
                isDisabled={isReadOnly}
              />

              <CustomDateNew
                form={form}
                name="expiryDate"
                label="Expiry Date"
                isRequired={true}
                dateFormat={dateFormat}
                isDisabled={isReadOnly}
              />

              <CustomInput
                form={form}
                name="notificationDaysBefore"
                label="Notification Days Before"
                isRequired={false}
                type="number"
                isDisabled={isReadOnly}
              />

              <CustomTextArea
                form={form}
                name="remarks"
                label="Remarks"
                isRequired={false}
                isDisabled={isReadOnly}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                {!isReadOnly && (
                  <Button
                    type="submit"
                    disabled={isSubmitting || saveMutation.isPending}
                  >
                    {isSubmitting || saveMutation.isPending
                      ? "Saving..."
                      : initialData
                        ? "Update Document"
                        : "Add Document"}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
