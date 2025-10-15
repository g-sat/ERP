// main-tab.tsx - Bank Reconciliation
"use client"

import { useEffect, useState } from "react"
import {
  calculateLocalAmounts,
  calculateTotalAmounts,
} from "@/helpers/cb-bankrecon-calculations"
import { ICbBankReconDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { CbBankReconDtSchemaType, CbBankReconHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import BankReconDetailsForm from "./cbbankrecon-details-form"
import BankReconDetailsTable from "./cbbankrecon-details-table"
import BankReconForm from "./cbbankrecon-form"

interface MainProps {
  form: UseFormReturn<CbBankReconHdSchemaType>
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

  const [editingDetail, setEditingDetail] =
    useState<CbBankReconDtSchemaType | null>(null)

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
      return
    }

    // Calculate base currency totals
    const totals = calculateTotalAmounts(
      dataDetails as unknown as ICbBankReconDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)

    // Calculate local currency totals
    const localAmounts = calculateLocalAmounts(
      dataDetails as unknown as ICbBankReconDt[],
      locAmtDec
    )
    // Note: Bank reconciliation header doesn't have totLocalAmt field
    // This is just calculated from details

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetails.length, amtDec, locAmtDec])

  const handleAddRow = (rowData: ICbBankReconDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as CbBankReconDtSchemaType[],
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      )
      setEditingDetail(null)
    } else {
      // Add new row
      form.setValue(
        "data_details",
        [...currentData, rowData] as unknown as CbBankReconDtSchemaType[],
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      )
    }

    form.trigger("data_details")
  }

  const handleEdit = (detail: ICbBankReconDt) => {
    setEditingDetail(detail as unknown as CbBankReconDtSchemaType)
  }

  const handleDelete = (itemNo: number) => {
    const currentData = form.getValues("data_details") || []
    const filteredData = currentData.filter((item) => item.itemNo !== itemNo)

    form.setValue(
      "data_details",
      filteredData as unknown as CbBankReconDtSchemaType[],
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    )
    form.trigger("data_details")
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    const currentData = form.getValues("data_details") || []
    const filteredData = currentData.filter(
      (item) => !selectedItemNos.includes(item.itemNo ?? 0)
    )

    form.setValue(
      "data_details",
      filteredData as unknown as CbBankReconDtSchemaType[],
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    )
    form.trigger("data_details")
  }

  const handleDataReorder = (newData: ICbBankReconDt[]) => {
    form.setValue(
      "data_details",
      newData as unknown as CbBankReconDtSchemaType[],
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    )
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  return (
    <div className="w-full space-y-4">
      <BankReconForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />

      <BankReconDetailsForm
        Hdform={form}
        onAddRowAction={handleAddRow}
        onCancelEdit={handleCancelEdit}
        editingDetail={editingDetail}
        visible={visible}
        required={required}
        companyId={companyId}
        existingDetails={dataDetails as unknown as CbBankReconDtSchemaType[]}
      />

      <BankReconDetailsTable
        data={dataDetails as unknown as ICbBankReconDt[]}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onEdit={handleEdit}
        onDataReorder={handleDataReorder}
        visible={visible}
      />
    </div>
  )
}
