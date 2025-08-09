"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CountryAutocomplete from "@/components/ui-custom/autocomplete-country"
import FileTypeAutocomplete from "@/components/ui-custom/autocomplete-file-type"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"

// Document upload schema
const documentUploadSchema = z.object({
  fileType: z.string().min(1, "File type is required"),
  documentNumber: z.string().min(1, "Document number is required"),
  countryId: z.number().optional(),
  issuedOn: z.string().min(1, "Issued date is required"),
  validFrom: z.string().optional(),
  expiresOn: z.string().min(1, "Expiry date is required"),
})

type DocumentUploadValues = z.infer<typeof documentUploadSchema>

interface Props {
  onCancel?: () => void
  onSubmit?: (data: DocumentUploadValues) => void
}

export function DocumentUploadForm({ onCancel, onSubmit }: Props) {
  const form = useForm<DocumentUploadValues>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      fileType: "",
      documentNumber: "",
      countryId: 0,
      issuedOn: "",
      validFrom: "",
      expiresOn: "",
    },
  })

  const handleSubmit = (data: DocumentUploadValues) => {
    console.log("Document upload form data:", data)
    onSubmit?.(data)
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
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
                    You can upload a maximum of 2 files. please ensure each file
                    size should not exceed 7MB.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Document Details */}
          <div className="space-y-4">
            <FileTypeAutocomplete
              form={form}
              label="File Type"
              name="fileType"
              isRequired
            />

            <CustomInput
              form={form}
              label="Document Number"
              name="documentNumber"
              placeholder="Enter document number"
              isRequired
            />

            <CountryAutocomplete form={form} label="Country" name="countryId" />

            <CustomDateNew
              form={form}
              label="Issued on"
              name="issuedOn"
              isRequired
            />

            <CustomDateNew form={form} label="Valid from" name="validFrom" />

            <CustomDateNew
              form={form}
              label="Expires on"
              name="expiresOn"
              isRequired
            />
          </div>
        </div>

        <div className="flex justify-start space-x-2 pt-4">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
