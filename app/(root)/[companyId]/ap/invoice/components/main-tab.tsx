// main-tab.tsx - IMPROVED VERSION
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
} from "@/helpers/ap-invoice-calculations"
import { IApInvoiceDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApInvoiceDtSchemaType,
  ApInvoiceHdSchemaType,
} from "@/schemas/ap-invoice"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import { useUserSettingDefaults } from "@/hooks/use-settings"
import { DeleteConfirmation } from "@/components/confirmation"

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
  isCancelled?: boolean
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
  isCancelled = false,
}: MainProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const ctyAmtDec = decimals[0]?.ctyAmtDec || 2

  const { defaults } = useUserSettingDefaults()

  const [editingDetail, setEditingDetail] =
    useState<ApInvoiceDtSchemaType | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedItemsToDelete, setSelectedItemsToDelete] = useState<number[]>(
    []
  )
  const [tableKey, setTableKey] = useState(0)
  const [showSingleDeleteConfirmation, setShowSingleDeleteConfirmation] =
    useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const previousInvoiceKeyRef = useRef<string>("")

  const dataDetails = form.watch("data_details") || []
  const currentInvoiceId = form.watch("invoiceId")
  const currentInvoiceNo = form.watch("invoiceNo")

  const currentInvoiceKey = useMemo(
    () => `${currentInvoiceId ?? ""}::${currentInvoiceNo ?? ""}`,
    [currentInvoiceId, currentInvoiceNo]
  )

  useEffect(() => {
    if (previousInvoiceKeyRef.current === currentInvoiceKey) {
      return
    }

    previousInvoiceKeyRef.current = currentInvoiceKey
    setEditingDetail(null)
    setSelectedItemsToDelete([])
    setItemToDelete(null)
    setShowDeleteConfirmation(false)
    setShowSingleDeleteConfirmation(false)
    setTableKey((prev) => prev + 1)
  }, [currentInvoiceKey])

  useEffect(() => {
    if (dataDetails.length === 0 && editingDetail) {
      setEditingDetail(null)
    }
  }, [dataDetails.length, editingDetail])

  useEffect(() => {
    if (dataDetails.length === 0) {
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

    const totals = calculateTotalAmounts(
      dataDetails as unknown as IApInvoiceDt[],
      amtDec
    )
    form.setValue("totAmt", totals.totAmt)
    form.setValue("gstAmt", totals.gstAmt)
    form.setValue("totAmtAftGst", totals.totAmtAftGst)

    const localAmounts = calculateLocalAmounts(
      dataDetails as unknown as IApInvoiceDt[],
      locAmtDec
    )
    form.setValue("totLocalAmt", localAmounts.totLocalAmt)
    form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
    form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

    const countryAmounts = calculateCountryAmounts(
      dataDetails as unknown as IApInvoiceDt[],
      visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
    )
    form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
    form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
    form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)

    form.trigger([
      "totAmt",
      "gstAmt",
      "totAmtAftGst",
      "totLocalAmt",
      "gstLocalAmt",
      "totLocalAmtAftGst",
      "totCtyAmt",
      "gstCtyAmt",
      "totCtyAmtAftGst",
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataDetails, amtDec, locAmtDec, ctyAmtDec])

  const handleAddRow = (rowData: IApInvoiceDt) => {
    const currentData = form.getValues("data_details") || []

    if (editingDetail) {
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? rowData : item
      )
      form.setValue(
        "data_details",
        updatedData as unknown as ApInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      const updatedData = [...currentData, rowData]
      form.setValue(
        "data_details",
        updatedData as unknown as ApInvoiceDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )
    }

    form.trigger("data_details")
  }

  const handleDelete = (itemNo: number) => {
    setItemToDelete(itemNo)
    setShowSingleDeleteConfirmation(true)
  }

  const confirmSingleDelete = () => {
    if (itemToDelete === null) return

    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter(
      (item) => item.itemNo !== itemToDelete
    )
    form.setValue("data_details", updatedData)
    form.trigger("data_details")
    setShowSingleDeleteConfirmation(false)
    setItemToDelete(null)

    setTableKey((prev) => prev + 1)
  }

  const handleBulkDelete = (selectedItemNos: number[]) => {
    setSelectedItemsToDelete(selectedItemNos)
    setShowDeleteConfirmation(true)
  }

  const confirmBulkDelete = () => {
    const currentData = form.getValues("data_details") || []
    const updatedData = currentData.filter(
      (item) => !selectedItemsToDelete.includes(item.itemNo)
    )
    form.setValue("data_details", updatedData)
    form.trigger("data_details")
    setShowDeleteConfirmation(false)
    setSelectedItemsToDelete([])

    setTableKey((prev) => prev + 1)
  }

  const handleEdit = (detail: IApInvoiceDt) => {
    setEditingDetail(detail as unknown as ApInvoiceDtSchemaType)
  }

  const handleCancelEdit = () => {
    setEditingDetail(null)
  }

  const handleDataReorder = (newData: IApInvoiceDt[]) => {
    const reorderedData = newData.map((item, index) => ({
      ...item,
      itemNo: index + 1,
    }))
    form.setValue(
      "data_details",
      reorderedData as unknown as ApInvoiceDtSchemaType[]
    )
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
        defaultCurrencyId={defaults.ap.currencyId}
      />

      <InvoiceDetailsForm
        Hdform={form}
        onAddRowAction={handleAddRow}
        onCancelEdit={editingDetail ? handleCancelEdit : undefined}
        editingDetail={editingDetail}
        companyId={companyId}
        visible={visible}
        required={required}
        existingDetails={dataDetails as ApInvoiceDtSchemaType[]}
        defaultGlId={defaults.ap.invoiceGlId}
        defaultUomId={defaults.common.uomId}
        defaultGstId={defaults.common.gstId}
        isCancelled={isCancelled}
      />

      <InvoiceDetailsTable
        key={tableKey}
        data={(dataDetails as unknown as IApInvoiceDt[]) || []}
        visible={visible}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onEdit={handleEdit as (template: IApInvoiceDt) => void}
        onRefresh={() => {}}
        onFilterChange={() => {}}
        onDataReorder={handleDataReorder as (newData: IApInvoiceDt[]) => void}
        isCancelled={isCancelled}
      />

      <DeleteConfirmation
        title="Delete Selected Items"
        description="Are you sure you want to delete the selected items? This action cannot be undone."
        itemName={`${selectedItemsToDelete.length} item(s)`}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        onConfirm={confirmBulkDelete}
        onCancel={() => {
          setShowDeleteConfirmation(false)
          setSelectedItemsToDelete([])
        }}
      />

      <DeleteConfirmation
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        itemName={`Item No. ${itemToDelete}`}
        open={showSingleDeleteConfirmation}
        onOpenChange={setShowSingleDeleteConfirmation}
        onConfirm={confirmSingleDelete}
        onCancel={() => {
          setShowSingleDeleteConfirmation(false)
          setItemToDelete(null)
        }}
      />
    </div>
  )
}
