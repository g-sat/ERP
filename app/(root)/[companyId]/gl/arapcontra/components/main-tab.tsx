// main-tab.tsx - GL Contra Main Tab
"use client"

import { useCallback, useEffect, useState } from "react"
import { IGLContraDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  GLContraDtSchemaType,
  GLContraHdSchemaType,
} from "@/schemas/gl-arapcontra"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import ApDetailsTable from "./ap-details-table"
import ArDetailsTable from "./ar-details-table"
import ContraForm from "./arapcontra-form"

interface MainProps {
  form: UseFormReturn<GLContraHdSchemaType>
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
    useState<GLContraDtSchemaType | null>(null)

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
      form.setValue("exhGainLoss", 0)
      return
    }

    // Calculate totals from details
    const details = dataDetails as unknown as IGLContraDt[]

    // Calculate base currency totals
    const totAmt = details.reduce(
      (sum, detail) => sum + (detail.allocAmt || 0),
      0
    )
    const roundedTotAmt = parseFloat(totAmt.toFixed(amtDec))
    form.setValue("totAmt", roundedTotAmt)

    // Calculate local currency totals
    const totLocalAmt = details.reduce(
      (sum, detail) => sum + (detail.allocLocalAmt || 0),
      0
    )
    const roundedTotLocalAmt = parseFloat(totLocalAmt.toFixed(locAmtDec))
    form.setValue("totLocalAmt", roundedTotLocalAmt)

    // Calculate exchange gain/loss
    const exhGainLoss = details.reduce(
      (sum, detail) => sum + (detail.exhGainLoss || 0),
      0
    )
    const roundedExhGainLoss = parseFloat(exhGainLoss.toFixed(locAmtDec))
    form.setValue("exhGainLoss", roundedExhGainLoss)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetails.length, amtDec, locAmtDec])

  // Handler for deleting a detail row (ready for future table implementation)
  const _handleDelete = useCallback(
    (itemNo: number) => {
      const currentData = form.getValues("data_details") || []
      const updatedData = currentData.filter((item) => item.itemNo !== itemNo)
      form.setValue("data_details", updatedData)
      form.trigger("data_details")
    },
    [form]
  )

  // Handler for bulk deleting detail rows (ready for future table implementation)
  const _handleBulkDelete = useCallback(
    (selectedItemNos: number[]) => {
      const currentData = form.getValues("data_details") || []
      const updatedData = currentData.filter(
        (item) => !selectedItemNos.includes(item.itemNo)
      )
      form.setValue("data_details", updatedData)
      form.trigger("data_details")
    },
    [form]
  )

  // Handler for editing a detail row (ready for future table implementation)
  const _handleEdit = useCallback((detail: IGLContraDt) => {
    setEditingDetail(detail as unknown as GLContraDtSchemaType)
  }, [])

  // Handler for canceling edit (ready for future implementation)
  const _handleCancelEdit = useCallback(() => {
    setEditingDetail(null)
  }, [])

  // Handler for data reordering (ready for future table implementation)
  const _handleDataReorder = useCallback(
    (newData: IGLContraDt[]) => {
      form.setValue(
        "data_details",
        newData as unknown as GLContraDtSchemaType[]
      )
    },
    [form]
  )

  // Handle Select AP Transaction button click
  const handleSelectAPTransaction = useCallback(() => {
    const supplierId = form.getValues("supplierId")
    const currencyId = form.getValues("currencyId")
    const accountDate = form.getValues("accountDate")

    if (!supplierId || !currencyId || !accountDate) {
      toast.warning("Please select Supplier, Currency, and Account Date first")
      return
    }

    // TODO: Open AP transaction selection dialog
    toast.info("AP Transaction selection coming soon")
  }, [form])

  // Handle Select AR Transaction button click
  const handleSelectARTransaction = useCallback(() => {
    const customerId = form.getValues("customerId")
    const currencyId = form.getValues("currencyId")
    const accountDate = form.getValues("accountDate")

    if (!customerId || !currencyId || !accountDate) {
      toast.warning("Please select Customer, Currency, and Account Date first")
      return
    }

    // TODO: Open AR transaction selection dialog
    toast.info("AR Transaction selection coming soon")
  }, [form])

  // Handle Auto Allocation
  const handleAutoAllocation = useCallback(() => {
    // TODO: Implement auto allocation logic
    toast.info("Auto allocation coming soon")
  }, [])

  // Handle Reset Allocation
  const handleResetAllocation = useCallback(() => {
    const currentData = form.getValues("data_details") || []
    const resetData = currentData.map((detail) => ({
      ...detail,
      allocAmt: 0,
      allocLocalAmt: 0,
      docAllocAmt: 0,
      docAllocLocalAmt: 0,
      centDiff: 0,
      exhGainLoss: 0,
    }))
    form.setValue("data_details", resetData)
    form.trigger("data_details")
    toast.success("Allocations reset successfully")
  }, [form])

  // Filter AP and AR transactions
  const apTransactions = (dataDetails as unknown as IGLContraDt[]).filter(
    (detail) => detail.moduleId === 2 // AP Module
  )
  const arTransactions = (dataDetails as unknown as IGLContraDt[]).filter(
    (detail) => detail.moduleId === 3 // AR Module
  )

  return (
    <div className="w-full space-y-4">
      {/* Header Form */}
      <ContraForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />

      {/* Details Section */}
      <div className="rounded-lg border p-4 shadow-sm">
        {/* Control Row */}
        <div className="mb-4 flex items-center gap-2">
          <Button onClick={handleAutoAllocation}>Auto Allocation</Button>
          <Button variant="outline" onClick={handleResetAllocation}>
            Reset Allocation
          </Button>
        </div>

        {/* AP and AR Details Tables Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* AR (Customer) Details Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                AR Transactions (Customer)
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectARTransaction}
              >
                Select AR Transaction
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border">
              <ArDetailsTable data={arTransactions} />
            </div>
          </div>

          {/* AP (Supplier) Details Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                AP Transactions (Supplier)
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAPTransaction}
              >
                Select AP Transaction
              </Button>
            </div>
            <div className="overflow-hidden rounded-md border">
              <ApDetailsTable data={apTransactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
