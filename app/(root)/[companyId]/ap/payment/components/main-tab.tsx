// main-tab.tsx - IMPROVED VERSION
"use client"

import { useEffect, useState } from "react"
import {
  calculateLocalAmounts,
  calculateTotalAmounts,
} from "@/helpers/ap-payment-calculations"
import { IApPaymentDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApPaymentDtSchemaType,
  ApPaymentHdSchemaType,
} from "@/schemas/ap-payment"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import PaymentDetailsTable from "./payment-details-table"
import PaymentForm from "./payment-form"

interface MainProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
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
    useState<ApPaymentDtSchemaType | null>(null)

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
      form.setValue("totLocalAmt", 0)
      return
    }

    // Calculate base currency totals
    const totals = calculateTotalAmounts(
      dataDetails as unknown as IApPaymentDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)

    // Calculate local currency totals (always calculate)
    const localAmounts = calculateLocalAmounts(
      dataDetails as unknown as IApPaymentDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetails.length, amtDec, locAmtDec, ctyAmtDec])

  const handleAddRow = (rowData: IApPaymentDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as ApPaymentDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      // Add new row
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as ApPaymentDtSchemaType[],
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

  const handleEdit = (detail: IApPaymentDt) => {
    // console.log("Editing detail:", detail)
    // Convert IApPaymentDt to ApPaymentDtSchemaType and set for editing
    setEditingDetail(detail as unknown as ApPaymentDtSchemaType)
    // console.log("Editing editingDetail:", editingDetail)
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: IApPaymentDt[]) => {
    form.setValue("data_details", newData as unknown as ApPaymentDtSchemaType[])
  }

  return (
    <div className="w-full">
      <PaymentForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />

      <div className="rounded-lg border p-4 shadow-sm">
        {/* Control Row */}
        <div className="mb-4 flex items-center gap-2">
          <Button>Select Transaction</Button>
          <Button>Auto Allocation</Button>
          <Input value="0.00" readOnly className="w-[120px] text-right" />
          <Input value="0.00" readOnly className="w-[120px] text-right" />
          <Button variant="outline">Reset Allocation</Button>
        </div>
        <PaymentDetailsTable
          data={(dataDetails as unknown as IApPaymentDt[]) || []}
          visible={visible}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEdit as (template: IApPaymentDt) => void}
          onRefresh={() => {}} // Add refresh logic if needed
          onFilterChange={() => {}} // Add filter logic if needed
          onDataReorder={handleDataReorder as (newData: IApPaymentDt[]) => void}
        />
      </div>
    </div>
  )
}
