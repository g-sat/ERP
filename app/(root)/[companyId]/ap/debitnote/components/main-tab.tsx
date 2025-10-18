// main-tab.tsx - IMPROVED VERSION
"use client"

import { useEffect, useState } from "react"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
} from "@/helpers-calculations"
import { IApDebitNoteDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ApDebitNoteDtSchemaType, ApDebitNoteHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import { useUserSettingDefaults } from "@/hooks/use-settings"

import DebitNoteDetailsForm from "./debitNote-details-form"
import DebitNoteDetailsTable from "./debitNote-details-table"
import DebitNoteForm from "./debitNote-form"

interface MainProps {
  form: UseFormReturn<ApDebitNoteHdSchemaType>
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

  // Get user settings with defaults for all modules
  const { defaults } = useUserSettingDefaults()

  const [editingDetail, setEditingDetail] =
    useState<ApDebitNoteDtSchemaType | null>(null)

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
      dataDetails as unknown as IApDebitNoteDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      dataDetails as unknown as IApDebitNoteDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    // Calculate country currency totals (always calculate)
    // If m_CtyCurr is false, country amounts = local amounts
    const countryAmounts = calculateCountryAmounts(
      dataDetails as unknown as IApDebitNoteDt[],
      visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
    )
    form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
    form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
    form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetails.length, amtDec, locAmtDec, ctyAmtDec])

  const handleAddRow = (rowData: IApDebitNoteDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as ApDebitNoteDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      // Add new row
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as ApDebitNoteDtSchemaType[],
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

  const handleEdit = (detail: IApDebitNoteDt) => {
    // console.log("Editing detail:", detail)
    // Convert IApDebitNoteDt to ApDebitNoteDtSchemaType and set for editing
    setEditingDetail(detail as unknown as ApDebitNoteDtSchemaType)
    // console.log("Editing editingDetail:", editingDetail)
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: IApDebitNoteDt[]) => {
    form.setValue(
      "data_details",
      newData as unknown as ApDebitNoteDtSchemaType[]
    )
  }

  return (
    <div className="w-full">
      <DebitNoteForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
        defaultCurrencyId={defaults.ap.currencyId}
      />
      <div className="rounded-lg border p-4 shadow-sm">
        <DebitNoteDetailsForm
          Hdform={form}
          onAddRowAction={handleAddRow}
          onCancelEdit={editingDetail ? handleCancelEdit : undefined}
          editingDetail={editingDetail}
          companyId={companyId}
          visible={visible}
          required={required}
          existingDetails={dataDetails as ApDebitNoteDtSchemaType[]}
          defaultGlId={defaults.ap.debitNoteGlId}
          defaultUomId={defaults.common.uomId}
          defaultGstId={defaults.common.gstId}
        />

        <DebitNoteDetailsTable
          data={(dataDetails as unknown as IApDebitNoteDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEdit as (template: IApDebitNoteDt) => void}
          onRefresh={() => {}} // Add refresh logic if needed
          onFilterChange={() => {}} // Add filter logic if needed
          onDataReorder={
            handleDataReorder as (newData: IApDebitNoteDt[]) => void
          }
        />
      </div>
    </div>
  )
}
