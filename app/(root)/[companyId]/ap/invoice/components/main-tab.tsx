// main-tab.tsx - IMPROVED VERSION
"use client"

import React, { useState } from "react"
import { IApInvoiceDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApInvoiceDtSchemaType,
  ApInvoiceHdSchemaType,
} from "@/schemas/ap-invoice"
import { UseFormReturn } from "react-hook-form"

import { Separator } from "@/components/ui/separator"

import InvoiceDetailsForm from "./invoice-details-form"
import InvoiceDetailsTable from "./invoice-details-table"
import InvoiceForm from "./invoice-form"

interface MainProps {
  form: UseFormReturn<ApInvoiceHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
}: MainProps) {
  const [editingDetail, setEditingDetail] =
    useState<ApInvoiceDtSchemaType | null>(null)

  // Watch data_details for reactive updates
  const dataDetails = form.watch("data_details") || []

  const handleAddRow = (rowData: IApInvoiceDt) => {
    const currentData = form.getValues("data_details") || []
    console.log("Adding row:", {
      rowData,
      currentDataLength: currentData.length,
    })

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as ApInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )
      console.log("Row updated:", {
        itemNo: editingDetail.itemNo,
        newDataLength: updatedData.length,
      })
      setEditingDetail(null)
    } else {
      // Add new row
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as ApInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )
      console.log("Row added:", {
        itemNo: rowData.itemNo,
        newDataLength: updatedData.length,
      })
    }

    // Trigger form validation
    form.trigger("data_details")
  }

  const handleDelete = (itemNo: number) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter((item) => item.itemNo !== itemNo)
    form.setValue("data_details", updatedData)
    form.trigger("data_details")
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter(
      (item) => !selectedItemNos.includes(item.itemNo)
    )
    form.setValue("data_details", updatedData)
    form.trigger("data_details")
  }

  const handleEdit = (detail: IApInvoiceDt) => {
    // Convert IApInvoiceDt to ApInvoiceDtSchemaType and set for editing
    setEditingDetail(detail as unknown as ApInvoiceDtSchemaType)
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: IApInvoiceDt[]) => {
    form.setValue("data_details", newData as unknown as ApInvoiceDtSchemaType[])
  }

  return (
    <div className="w-full">
      <InvoiceForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />
      <Separator />

      <InvoiceDetailsForm
        Hdform={form}
        onAddRowAction={handleAddRow}
        onCancelEdit={editingDetail ? handleCancelEdit : undefined}
        editingDetail={editingDetail}
        companyId={companyId}
        visible={visible}
        required={required}
        existingDetails={dataDetails as ApInvoiceDtSchemaType[]}
      />

      <InvoiceDetailsTable
        data={(dataDetails as unknown as IApInvoiceDt[]) || []}
        visible={visible}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onEdit={handleEdit as (template: IApInvoiceDt) => void}
        onRefresh={() => {}} // Add refresh logic if needed
        onFilterChange={() => {}} // Add filter logic if needed
        onDataReorder={handleDataReorder as (newData: IApInvoiceDt[]) => void}
      />
    </div>
  )
}
