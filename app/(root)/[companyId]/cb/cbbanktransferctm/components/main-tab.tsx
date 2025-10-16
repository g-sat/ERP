// main-tab.tsx - IMPROVED VERSION
"use client"

import { useEffect, useState } from "react"
import { ICbBankTransferCtmDt } from "@/interfaces/cb-banktransferctm"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBankTransferCtmDtSchemaType,
  CbBankTransferCtmHdSchemaType,
} from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import BankTransferCtmDetailsForm from "./cbbanktransferctm-details-form"
import BankTransferCtmDetailsTable from "./cbbanktransferctm-details-table"
import BankTransferCtmForm from "./cbbanktransferctm-form"

interface MainProps {
  form: UseFormReturn<CbBankTransferCtmHdSchemaType>
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
    useState<CbBankTransferCtmDtSchemaType | null>(null)

  // Watch data_details for reactive updates
  const dataDetails = form.watch("data_details") || []

  // Clear editingDetail when data_details is reset/cleared
  useEffect(() => {
    if (dataDetails.length === 0 && editingDetail) {
      setEditingDetail(null)
    }
  }, [dataDetails.length, editingDetail])

  const handleAddRow = (rowData: ICbBankTransferCtmDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as CbBankTransferCtmDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      // Add new row
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as CbBankTransferCtmDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )
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

  const handleEdit = (detail: ICbBankTransferCtmDt) => {
    // console.log("Editing detail:", detail)
    // Convert ICbBankTransferCtmDt to CbBankTransferCtmDtSchemaType and set for editing
    setEditingDetail(detail as unknown as CbBankTransferCtmDtSchemaType)
    // console.log("Editing editingDetail:", editingDetail)
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: ICbBankTransferCtmDt[]) => {
    form.setValue(
      "data_details",
      newData as unknown as CbBankTransferCtmDtSchemaType[]
    )
  }

  return (
    <div className="w-full">
      <BankTransferCtmForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />

      <div className="rounded-lg border p-4 shadow-sm">
        <BankTransferCtmDetailsForm
          Hdform={form}
          onAddRowAction={handleAddRow}
          onCancelEdit={editingDetail ? handleCancelEdit : undefined}
          editingDetail={editingDetail}
          companyId={companyId}
          visible={visible}
          required={required}
          existingDetails={dataDetails as CbBankTransferCtmDtSchemaType[]}
        />

        <BankTransferCtmDetailsTable
          data={(dataDetails as unknown as ICbBankTransferCtmDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEdit as (template: ICbBankTransferCtmDt) => void}
          onRefresh={() => {}} // Add refresh logic if needed
          onFilterChange={() => {}} // Add filter logic if needed
          onDataReorder={
            handleDataReorder as (newData: ICbBankTransferCtmDt[]) => void
          }
        />
      </div>
    </div>
  )
}
