"use client"

import React, { useState } from "react"
import { ITariffDt } from "@/interfaces/tariff"
import {
  TariffDtSchemaType,
  TariffHdSchemaType,
  tariffDtSchema,
} from "@/schemas/tariff"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { XIcon } from "lucide-react"
import { UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

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
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomSwitch from "@/components/custom/custom-switch"

import { TariffDetailsTable } from "./tariff-details-table"

interface TariffDetailsFormProps {
  form: UseFormReturn<TariffHdSchemaType>
  tariffId: number
  companyId: number
}

export function TariffDetailsForm({
  form,
  tariffId,
  companyId: _companyId,
}: TariffDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState<ITariffDt | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const detailsForm = useForm<TariffDtSchemaType>({
    resolver: zodResolver(tariffDtSchema),
    defaultValues: {
      tariffId: tariffId,
      itemNo: 0,
      displayRate: 0,
      basicRate: 0,
      minUnit: 0,
      maxUnit: 0,
      isAdditional: false,
      additionalUnit: 0,
      additionalRate: 0,
      editVersion: 0,
    },
  })

  const details = form.watch("data_details") || []

  const handleAdd = () => {
    setEditingDetail(null)
    setEditingIndex(null)
    detailsForm.reset({
      tariffId: tariffId,
      itemNo:
        details.length > 0 ? Math.max(...details.map((d) => d.itemNo)) + 1 : 1,
      displayRate: 0,
      basicRate: 0,
      minUnit: 0,
      maxUnit: 0,
      isAdditional: false,
      additionalUnit: 0,
      additionalRate: 0,
      editVersion: 0,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (detail: ITariffDt, index: number) => {
    setEditingDetail(detail)
    setEditingIndex(index)
    detailsForm.reset({
      tariffId: detail.tariffId,
      itemNo: detail.itemNo,
      displayRate: detail.displayRate,
      basicRate: detail.basicRate,
      minUnit: detail.minUnit,
      maxUnit: detail.maxUnit,
      isAdditional: detail.isAdditional,
      additionalUnit: detail.additionalUnit,
      additionalRate: detail.additionalRate,
      editVersion: detail.editVersion,
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
    data: TariffDtSchemaType,
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
      }
      form.setValue("data_details", updatedDetails, {
        shouldDirty: true,
        shouldTouch: true,
      })
      toast.success("Detail updated successfully")
    } else {
      // Add new detail
      const newDetail: ITariffDt = {
        ...data,
      }
      form.setValue("data_details", [...currentDetails, newDetail], {
        shouldDirty: true,
        shouldTouch: true,
      })
      toast.success("Detail added successfully")
    }

    // Trigger validation after updating data_details
    form.trigger("data_details")
    // Also trigger full form validation to update error state
    form.trigger()
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

  // Watch isAdditional for conditional fields
  const isAdditional = detailsForm.watch("isAdditional")

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Badge
          variant="outline"
          className="border-indigo-400 bg-gradient-to-r from-indigo-100 to-indigo-200 text-sm font-medium text-indigo-800 shadow-sm"
        >
          <span className="mr-1.5">•</span>Tariff Details
        </Badge>
      </div>

      <TariffDetailsTable
        data={details}
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

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDetail ? "Edit Detail" : "Add Detail"}
            </DialogTitle>
            <DialogDescription>
              {editingDetail
                ? "Update tariff detail information"
                : "Add a new tariff detail"}
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
              <div className="bg-card grid grid-cols-4 gap-2 rounded-lg border p-2 shadow-sm">
                <CustomNumberInput
                  form={detailsForm}
                  name="displayRate"
                  label="Display Rate"
                  isRequired
                  round={amtDec}
                />
                <CustomNumberInput
                  form={detailsForm}
                  name="basicRate"
                  label="Basic Rate"
                  isRequired
                  round={amtDec}
                />
                <CustomNumberInput
                  form={detailsForm}
                  name="minUnit"
                  label="Min Unit"
                  isRequired
                  round={amtDec}
                />
                <CustomNumberInput
                  form={detailsForm}
                  name="maxUnit"
                  label="Max Unit"
                  isRequired
                  round={amtDec}
                />
              </div>
              <div className="bg-card grid grid-cols-3 gap-2 rounded-lg border p-2 shadow-sm">
                <CustomSwitch
                  form={detailsForm}
                  name="isAdditional"
                  label="Additional"
                />
                <CustomNumberInput
                  form={detailsForm}
                  name="additionalUnit"
                  label="Additional Unit"
                  isRequired={isAdditional}
                  isDisabled={!isAdditional}
                  round={amtDec}
                />
                <CustomNumberInput
                  form={detailsForm}
                  name="additionalRate"
                  label="Additional Rate"
                  isRequired={isAdditional}
                  isDisabled={!isAdditional}
                  round={amtDec}
                />
              </div>
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
