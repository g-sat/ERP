// main-tab.tsx - IMPROVED VERSION
"use client"

import { useEffect, useState } from "react"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
} from "@/helpers/cb-genreceipt-calculations"
import { ICbGenReceiptDt } from "@/interfaces/cb-genreceipt"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenReceiptDtSchemaType,
  CbGenReceiptHdSchemaType,
} from "@/schemas/cb-genreceipt"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import ReceiptDetailsForm from "./cbgenreceipt-details-form"
import ReceiptDetailsTable from "./cbgenreceipt-details-table"
import ReceiptForm from "./cbgenreceipt-form"

interface MainProps {
  form: UseFormReturn<CbGenReceiptHdSchemaType>
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
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const ctyAmtDec = decimals[0]?.ctyAmtDec || 2

  const [editingDetail, setEditingDetail] =
    useState<CbGenReceiptDtSchemaType | null>(null)

  // Watch data_details for reactive updates
  const dataDetails = form.watch("data_details") || []

  // Clear editingDetail when data_details is reset/cleared
  useEffect(() => {
    if (dataDetails.length === 0 && editingDetail) {
      setEditingDetail(null)
    }
  }, [dataDetails.length, editingDetail])

  // Recalculate header totals when details change
  useEffect(() => {
    if (dataDetails.length === 0) {
      // Reset all amounts to 0 if no details
      form.setValue("totAmt", 0)
      form.setValue("gstAmt", 0)
      form.setValue("totAmtAftGst", 0)
      form.setValue("totLocalAmt", 0)
      form.setValue("gstLocalAmt", 0)
      form.setValue("totLocalAmtAftGst", 0)
      form.setValue("totCtyAmt", 0)
      form.setValue("gstCtyAmt", 0)
      form.setValue("totCtyAmtAftGst", 0)
      return
    }

    // Calculate base currency totals
    const totals = calculateTotalAmounts(
      dataDetails as unknown as ICbGenReceiptDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      dataDetails as unknown as ICbGenReceiptDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals (always calculate)
    // If m_CtyCurr is false, country amounts = local amounts
    const countryAmounts = calculateCountryAmounts(
      dataDetails as unknown as ICbGenReceiptDt[],
      visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
    )
    form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
    form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
    form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetails, amtDec, locAmtDec, ctyAmtDec])

  const handleAddRow = (rowData: ICbGenReceiptDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as CbGenReceiptDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      // Add new row
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as CbGenReceiptDtSchemaType[],
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

  const handleEdit = (detail: ICbGenReceiptDt) => {
    // console.log("Editing detail:", detail)
    // Convert ICbGenReceiptDt to CbGenReceiptDtSchemaType and set for editing
    setEditingDetail(detail as unknown as CbGenReceiptDtSchemaType)
    // console.log("Editing editingDetail:", editingDetail)
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: ICbGenReceiptDt[]) => {
    form.setValue(
      "data_details",
      newData as unknown as CbGenReceiptDtSchemaType[]
    )
  }

  return (
    <div className="w-full">
      <ReceiptForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />
      <div className="rounded-lg border p-4 shadow-sm">
        <ReceiptDetailsForm
          Hdform={form}
          onAddRowAction={handleAddRow}
          onCancelEdit={editingDetail ? handleCancelEdit : undefined}
          editingDetail={editingDetail}
          companyId={companyId}
          visible={visible}
          required={required}
          existingDetails={dataDetails as CbGenReceiptDtSchemaType[]}
        />

        <ReceiptDetailsTable
          data={(dataDetails as unknown as ICbGenReceiptDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEdit as (template: ICbGenReceiptDt) => void}
          onRefresh={() => {}} // Add refresh logic if needed
          onFilterChange={() => {}} // Add filter logic if needed
          onDataReorder={
            handleDataReorder as (newData: ICbGenReceiptDt[]) => void
          }
        />
      </div>
    </div>
  )
}
