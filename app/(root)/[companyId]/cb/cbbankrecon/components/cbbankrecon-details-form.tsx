"use client"

import { useEffect, useState } from "react"
import { ICbBankReconDt } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBankReconDtSchema,
  CbBankReconDtSchemaType,
  CbBankReconHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultBankReconDetails } from "./cbbankrecon-defaultvalues"

// Factory function to create default values with dynamic itemNo
const createDefaultValues = (itemNo: number): CbBankReconDtSchemaType => ({
  ...defaultBankReconDetails,
  itemNo,
})

interface BankReconDetailsFormProps {
  Hdform: UseFormReturn<CbBankReconHdSchemaType>
  onAddRowAction?: (rowData: ICbBankReconDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbBankReconDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbBankReconDtSchemaType[]
}

export default function BankReconDetailsForm({
  Hdform,
  onAddRowAction,
  onCancelEdit: _onCancelEdit,
  editingDetail,
  visible,
  required,
  companyId: _companyId,
  existingDetails: _existingDetails = [],
}: BankReconDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  // State for item selection
  const [isSelected, setIsSelected] = useState(false)

  // Calculate next item number
  const getNextItemNo = () => {
    const currentDetails = Hdform.getValues("data_details") || []
    return currentDetails.length > 0
      ? Math.max(...currentDetails.map((d) => d.itemNo || 0)) + 1
      : 1
  }

  const Dtform = useForm<CbBankReconDtSchemaType>({
    resolver: zodResolver(CbBankReconDtSchema(required, visible)),
    defaultValues: editingDetail
      ? {
          ...editingDetail,
          isSel: editingDetail.isSel ?? false,
          moduleId: editingDetail.moduleId ?? 0,
          transactionId: editingDetail.transactionId ?? 0,
          documentId: editingDetail.documentId ?? 0,
          documentNo: editingDetail.documentNo ?? "",
          docReferenceNo: editingDetail.docReferenceNo ?? "",
          accountDate: editingDetail.accountDate ?? new Date(),
          paymentTypeId: editingDetail.paymentTypeId ?? 0,
          chequeNo: editingDetail.chequeNo ?? "",
          chequeDate: editingDetail.chequeDate ?? new Date(),
          customerId: editingDetail.customerId ?? 0,
          supplierId: editingDetail.supplierId ?? 0,
          glId: editingDetail.glId ?? 0,
          isDebit: editingDetail.isDebit ?? false,
          exhRate: editingDetail.exhRate ?? 0,
          totAmt: editingDetail.totAmt ?? 0,
          totLocalAmt: editingDetail.totLocalAmt ?? 0,
          paymentFromTo: editingDetail.paymentFromTo ?? "",
          remarks: editingDetail.remarks ?? "",
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Sync checkbox with form value
  useEffect(() => {
    const isSel = Dtform.getValues("isSel")
    setIsSelected(isSel)
  }, [Dtform])

  // Handle checkbox change
  const handleSelectionChange = (checked: boolean) => {
    setIsSelected(checked)
    Dtform.setValue("isSel", checked, { shouldDirty: true })
  }

  // Handle exchange rate change to calculate local amount
  const handleExchangeRateChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const exhRate = parseFloat(e.target.value) || 0
    const totAmt = Dtform.getValues("totAmt") || 0
    const totLocalAmt = totAmt * exhRate
    Dtform.setValue("totLocalAmt", parseFloat(totLocalAmt.toFixed(locAmtDec)))
  }

  // Handle amount change to calculate local amount
  const handleAmountChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const totAmt = parseFloat(e.target.value) || 0
    const exhRate = Dtform.getValues("exhRate") || 0
    const totLocalAmt = totAmt * exhRate
    Dtform.setValue("totLocalAmt", parseFloat(totLocalAmt.toFixed(locAmtDec)))
  }

  // Handle form submit
  const onSubmit = async (data: CbBankReconDtSchemaType) => {
    // Validate detail data
      const validationResult = CbBankReconDtSchema(required, visible).safeParse(
        data
      )

      if (!validationResult.success) {
      console.error("Detail validation failed:", validationResult.error)
      toast.error("Please check all required fields")
        return
      }

    // Check if document already exists in details
    const currentDetails = Hdform.getValues("data_details") || []
    const isDuplicate = currentDetails.some(
      (detail) =>
        detail.documentId === data.documentId && detail.itemNo !== data.itemNo
    )

    if (isDuplicate) {
      toast.error("This document is already added to reconciliation")
      return
    }

    // Prepare the detail row data
    const detailRow: ICbBankReconDt = {
        reconId: data.reconId ?? "0",
        reconNo: data.reconNo ?? "",
      itemNo: data.itemNo,
      isSel: data.isSel,
      moduleId: data.moduleId,
      transactionId: data.transactionId,
      documentId: data.documentId,
      documentNo: data.documentNo,
      docReferenceNo: data.docReferenceNo ?? "",
      accountDate: data.accountDate,
      paymentTypeId: data.paymentTypeId,
      chequeNo: data.chequeNo ?? "",
      chequeDate: data.chequeDate,
      customerId: data.customerId ?? 0,
      supplierId: data.supplierId ?? 0,
        glId: data.glId ?? 0,
      isDebit: data.isDebit,
      exhRate: data.exhRate,
      totAmt: data.totAmt,
      totLocalAmt: data.totLocalAmt,
      paymentFromTo: data.paymentFromTo ?? "",
        remarks: data.remarks ?? "",
        editVersion: data.editVersion ?? 0,
      }

    // Call the parent add row action
    if (onAddRowAction) {
      onAddRowAction(detailRow)
    }

    // Reset form if not editing
    if (!editingDetail) {
      Dtform.reset(createDefaultValues(getNextItemNo() + 1))
      setIsSelected(false)
    }

    toast.success(
      editingDetail
        ? "Detail updated successfully"
        : "Detail added successfully"
    )
  }

  return (
    <FormProvider {...Dtform}>
      <form
        onSubmit={Dtform.handleSubmit(onSubmit)}
        className="grid grid-cols-6 gap-2 rounded-md border p-4"
      >
        {/* Selection Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelectionChange}
          />
          <label className="text-sm font-medium">Select</label>
        </div>

        {/* Module ID */}
          <CustomNumberInput
          form={Dtform}
          name="moduleId"
          label="Module"
          isRequired={true}
            className="text-right"
        />

        {/* Transaction ID */}
        <CustomNumberInput
          form={Dtform}
          name="transactionId"
          label="Transaction"
          isRequired={true}
          className="text-right"
        />

        {/* Document ID */}
        <CustomNumberInput
          form={Dtform}
          name="documentId"
          label="Document ID"
          isRequired={true}
          className="text-right"
        />

        {/* Document No */}
        <CustomInput
          form={Dtform}
          name="documentNo"
          label="Document No"
          isRequired={true}
        />

        {/* Document Reference No */}
        <CustomInput
          form={Dtform}
          name="docReferenceNo"
          label="Doc Reference"
        />

        {/* Account Date */}
        <CustomDateNew
          form={Dtform}
          name="accountDate"
          label="Account Date"
          isRequired={true}
        />

        {/* Payment Type ID */}
        <CustomNumberInput
          form={Dtform}
          name="paymentTypeId"
          label="Payment Type"
          isRequired={true}
          className="text-right"
        />

        {/* Cheque No */}
        <CustomInput form={Dtform} name="chequeNo" label="Cheque No" />

        {/* Cheque Date */}
        <CustomDateNew
          form={Dtform}
          name="chequeDate"
          label="Cheque Date"
          isRequired={true}
        />

        {/* Customer ID */}
        <CustomNumberInput
          form={Dtform}
          name="customerId"
          label="Customer ID"
          className="text-right"
        />

        {/* Supplier ID */}
        <CustomNumberInput
          form={Dtform}
          name="supplierId"
          label="Supplier ID"
          className="text-right"
        />

        {/* GL ID */}
        <CustomNumberInput
          form={Dtform}
          name="glId"
          label="GL Account"
          className="text-right"
        />

        {/* Debit/Credit Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={Dtform.watch("isDebit")}
            onCheckedChange={(checked) => {
              Dtform.setValue("isDebit", !!checked, { shouldDirty: true })
            }}
          />
          <label className="text-sm font-medium">Is Debit</label>
        </div>

        {/* Exchange Rate */}
        <CustomNumberInput
          form={Dtform}
          name="exhRate"
          label="Exchange Rate"
          round={exhRateDec}
          isRequired={true}
          className="text-right"
          onBlurEvent={handleExchangeRateChange}
        />

          {/* Total Amount */}
          <CustomNumberInput
          form={Dtform}
            name="totAmt"
          label="Amount"
            round={amtDec}
          isRequired={true}
            className="text-right"
          onBlurEvent={handleAmountChange}
          />

        {/* Total Local Amount */}
          <CustomNumberInput
          form={Dtform}
            name="totLocalAmt"
          label="Local Amount"
            round={locAmtDec}
          isRequired={true}
            isDisabled={true}
            className="text-right"
        />

        {/* Payment From/To */}
        <CustomInput
          form={Dtform}
          name="paymentFromTo"
          label="Payment From/To"
          className="col-span-2"
          />

          {/* Remarks */}
            <CustomTextarea
          form={Dtform}
              name="remarks"
              label="Remarks"
          className="col-span-4"
        />

        {/* Action Buttons */}
        <div className="col-span-6 flex justify-end gap-2">
          <Button type="submit" size="sm">
            {editingDetail ? "Update" : "Add"}
          </Button>
          {editingDetail && _onCancelEdit && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={_onCancelEdit}
            >
              Cancel
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
  )
}
