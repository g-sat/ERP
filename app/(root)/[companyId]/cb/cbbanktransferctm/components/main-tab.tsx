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

import { DeleteConfirmation } from "@/components/confirmation"

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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedItemsToDelete, setSelectedItemsToDelete] = useState<number[]>(
    []
  )
  const [tableKey, setTableKey] = useState(0)
  const [showSingleDeleteConfirmation, setShowSingleDeleteConfirmation] =
    useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

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

    // Create a deep copy of rowData to avoid reference issues
    const newRowData = { ...rowData }

    if (editingDetail) {
      // Update existing row by itemNo (unique identifier)
      const updatedData = currentData.map((item) =>
        item.itemNo === editingDetail.itemNo ? newRowData : { ...item }
      )
      form.setValue(
        "data_details",
        updatedData as unknown as CbBankTransferCtmDtSchemaType[],
        { shouldDirty: true, shouldTouch: true }
      )

      setEditingDetail(null)
    } else {
      // Add new row - create a copy of existing data to avoid mutations
      const updatedData = currentData.map((item) => ({ ...item }))
      updatedData.push(newRowData)
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

    // Force table to re-render and clear selection by changing the key
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

    // Force table to re-render and clear selection by changing the key
    setTableKey((prev) => prev + 1)
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
    // Update itemNo sequentially after reordering
    const reorderedData = newData.map((item, index) => ({
      ...item,
      itemNo: index + 1,
    }))
    form.setValue(
      "data_details",
      reorderedData as unknown as CbBankTransferCtmDtSchemaType[]
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
        key={tableKey}
        data={(dataDetails as unknown as ICbBankTransferCtmDt[]) || []}
        visible={visible}
        onDeleteAction={handleDelete}
        onBulkDelete={handleBulkDelete}
        onEditAction={handleEdit as (template: ICbBankTransferCtmDt) => void}
        onRefreshAction={() => {}} // Add refresh logic if needed
        onFilterChange={() => {}} // Add filter logic if needed
        onDataReorder={
          handleDataReorder as (newData: ICbBankTransferCtmDt[]) => void
        }
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
