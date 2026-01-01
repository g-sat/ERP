"use client"

import React, { useState } from "react"
import { ITemplateDt } from "@/interfaces/template"
import {
  TemplateDtSchemaType,
  TemplateHdSchemaType,
  templateDtSchema,
} from "@/schemas/template"
import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { ChargeAutocomplete } from "@/components/autocomplete"
import CustomTextarea from "@/components/custom/custom-textarea"

import { TemplateDetailsTable } from "./template-details-table"

interface TemplateDetailsFormProps {
  form: UseFormReturn<TemplateHdSchemaType>
  taskId: number
  templateId: number
}

export function TemplateDetailsForm({
  form,
  taskId: _taskId,
  templateId,
}: TemplateDetailsFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState<ITemplateDt | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const detailsForm = useForm<TemplateDtSchemaType>({
    resolver: zodResolver(templateDtSchema),
    defaultValues: {
      templateId: templateId,
      itemNo: 0,
      chargeId: 0,
      remarks: "",
    },
  })

  const details = form.watch("data_details") || []

  const handleAdd = () => {
    setEditingDetail(null)
    setEditingIndex(null)
    detailsForm.reset({
      templateId: templateId,
      itemNo:
        details.length > 0 ? Math.max(...details.map((d) => d.itemNo)) + 1 : 1,
      chargeId: 0,
      remarks: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (detail: ITemplateDt, index: number) => {
    setEditingDetail(detail)
    setEditingIndex(index)
    detailsForm.reset({
      templateId: detail.templateId,
      itemNo: detail.itemNo,
      chargeId: detail.chargeId,
      chargeName: detail.chargeName,
      remarks: detail.remarks || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (index: number) => {
    const currentDetails = form.getValues("data_details") || []
    const updatedDetails = currentDetails.filter((_, i) => i !== index)
    form.setValue("data_details", updatedDetails, {
      shouldDirty: true,
      shouldTouch: true,
    })
    form.trigger("data_details")
    toast.success("Detail removed successfully")
  }

  const handleSaveDetail = (
    data: TemplateDtSchemaType,
    e?: React.BaseSyntheticEvent
  ) => {
    // Prevent event from bubbling to parent form
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const currentDetails = form.getValues("data_details") || []

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...currentDetails]
      updatedDetails[editingIndex] = {
        ...data,
        chargeName: detailsForm.getValues("chargeName"),
        remarks: data.remarks || "",
      }
      form.setValue("data_details", updatedDetails, {
        shouldDirty: true,
        shouldTouch: true,
      })
      toast.success("Detail updated successfully")
    } else {
      // Add new detail
      const newDetail: ITemplateDt = {
        ...data,
        chargeName: detailsForm.getValues("chargeName"),
        remarks: data.remarks || "",
      }
      form.setValue("data_details", [...currentDetails, newDetail], {
        shouldDirty: true,
        shouldTouch: true,
      })
      toast.success("Detail added successfully")
    }

    form.trigger("data_details")
    setIsDialogOpen(false)
    setEditingDetail(null)
    setEditingIndex(null)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingDetail(null)
    setEditingIndex(null)
    detailsForm.reset()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Template Details</h4>
      </div>

      <div className="rounded-lg border">
        <TemplateDetailsTable
          data={details.map((d) => ({
            ...d,
            remarks: d.remarks || "",
          }))}
          onEditAction={(detail) => {
            const index = details.findIndex((d) => d.itemNo === detail.itemNo)
            if (index !== -1) {
              handleEdit(detail, index)
            }
          }}
          onDeleteAction={(detail) => {
            const index = details.findIndex((d) => d.itemNo === detail.itemNo)
            if (index !== -1) {
              handleDelete(index)
            }
          }}
          onCreateAction={handleAdd}
          canEdit={true}
          canDelete={true}
          canView={true}
          canCreate={true}
          createButtonText="Add Detail"
        />
      </div>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDetail ? "Edit Detail" : "Add Detail"}
            </DialogTitle>
            <DialogDescription>
              {editingDetail
                ? "Update template detail information"
                : "Add a new template detail"}
            </DialogDescription>
          </DialogHeader>
          <Form {...detailsForm}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                detailsForm.handleSubmit((data) => handleSaveDetail(data, e))()
              }}
              className="space-y-3"
            >
              <ChargeAutocomplete
                form={detailsForm}
                name="chargeId"
                label="Charge"
                isRequired
                onChangeEvent={(selected) => {
                  if (selected) {
                    detailsForm.setValue(
                      "chargeName",
                      selected.chargeName || ""
                    )
                  }
                }}
              />
              <CustomTextarea
                form={detailsForm}
                name="remarks"
                label="Remarks"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex items-center gap-2"
                >
                  <XIcon className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDetail ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
