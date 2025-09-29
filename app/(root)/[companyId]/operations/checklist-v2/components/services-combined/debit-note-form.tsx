"use client"

import { useEffect } from "react"
import { IDebitNoteDt } from "@/interfaces/checklist"
import { IChargeLookup, IGstLookup } from "@/interfaces/lookup"
import { DebitNoteDtSchemaType, debitNoteDtSchema } from "@/schemas/checklist"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import ChargeAutocomplete from "@/components/autocomplete/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import GstAutocomplete from "@/components/autocomplete/autocomplete-gst"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextArea from "@/components/custom/custom-textarea"

interface DebitNoteFormProps {
  initialData?: IDebitNoteDt
  submitAction: (data: DebitNoteDtSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
  taskId: number
  exchangeRate?: number // Add exchange rate prop
  companyId?: number
}

export function DebitNoteForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
  taskId,
  exchangeRate = 1, // Default to 1 if not provided
  companyId,
}: DebitNoteFormProps) {
  console.log("taskId :", taskId)
  console.log("initialData :", initialData)
  console.log("isConfirmed DebitNoteForm :", isConfirmed)
  console.log("exchangeRate :", exchangeRate)

  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(companyId)
  )

  const form = useForm<DebitNoteDtSchemaType>({
    resolver: zodResolver(debitNoteDtSchema),
    defaultValues: {
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      itemNo: initialData?.itemNo ?? 0,
      taskId: taskId,
      taskName: initialData?.taskName ?? "",
      chargeId: initialData?.chargeId ?? 0,
      chargeName: initialData?.chargeName ?? "",
      glId: initialData?.glId ?? 0,
      glName: initialData?.glName ?? "",
      qty: initialData?.qty ?? 0,
      unitPrice: initialData?.unitPrice ?? 0,
      totAmt: initialData?.totAmt ?? 0,
      gstId: initialData?.gstId ?? 0,
      gstName: initialData?.gstName ?? "",
      gstPercentage: initialData?.gstPercentage ?? 0,
      gstAmt: initialData?.gstAmt ?? 0,
      totAftGstAmt: initialData?.totAftGstAmt ?? 0,
      remarks: initialData?.remarks ?? "",
      editVersion: initialData?.editVersion ?? 0,
      totLocalAmt: initialData?.totLocalAmt ?? 0,
      isServiceCharge: initialData?.isServiceCharge ?? false,
      serviceCharge: initialData?.serviceCharge ?? 0,
    },
  })

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculation functions
  const calculateTotalAmount = (qty: number, unitPrice: number): number => {
    return qty * unitPrice
  }

  const calculateGSTAmount = (
    totalAmount: number,
    gstPercentage: number
  ): number => {
    return (totalAmount * gstPercentage) / 100
  }

  const calculateTotalAfterGST = (
    totalAmount: number,
    gstAmount: number
  ): number => {
    return totalAmount + gstAmount
  }

  const convertLocalToTotal = (localAmount: number, exRate: number): number => {
    return exRate > 0 ? localAmount / exRate : localAmount
  }

  // Effect for quantity * unit price calculation
  useEffect(() => {
    const { qty, unitPrice } = watchedValues
    if (qty > 0 && unitPrice > 0) {
      const calculatedTotal = calculateTotalAmount(qty, unitPrice)
      form.setValue("totAmt", calculatedTotal)

      // Recalculate GST and total after GST
      const gstPercentage = form.getValues("gstPercentage")
      if (gstPercentage > 0) {
        const gstAmount = calculateGSTAmount(calculatedTotal, gstPercentage)
        form.setValue("gstAmt", gstAmount)
        form.setValue(
          "totAftGstAmt",
          calculateTotalAfterGST(calculatedTotal, gstAmount)
        )
      }
    }
  }, [watchedValues.qty, watchedValues.unitPrice, form])

  // Effect for GST percentage changes
  useEffect(() => {
    const { totAmt, gstPercentage } = watchedValues
    if (totAmt > 0 && gstPercentage > 0) {
      const gstAmount = calculateGSTAmount(totAmt, gstPercentage)
      form.setValue("gstAmt", gstAmount)
      form.setValue("totAftGstAmt", calculateTotalAfterGST(totAmt, gstAmount))
    } else if (gstPercentage === 0) {
      form.setValue("gstAmt", 0)
      form.setValue("totAftGstAmt", totAmt)
    }
  }, [watchedValues.gstPercentage, watchedValues.totAmt, form])

  // Effect for local amount changes
  useEffect(() => {
    const { totLocalAmt } = watchedValues
    if (totLocalAmt > 0 && exchangeRate > 0) {
      const calculatedTotal = convertLocalToTotal(totLocalAmt, exchangeRate)
      form.setValue("totAmt", calculatedTotal)

      // Recalculate GST and total after GST
      const gstPercentage = form.getValues("gstPercentage")
      if (gstPercentage > 0) {
        const gstAmount = calculateGSTAmount(calculatedTotal, gstPercentage)
        form.setValue("gstAmt", gstAmount)
        form.setValue(
          "totAftGstAmt",
          calculateTotalAfterGST(calculatedTotal, gstAmount)
        )
      }
    }
  }, [watchedValues.totLocalAmt, exchangeRate, form])

  // Effect for charge autocomplete changes (to update GL ID)
  const handleChargeChange = (selectedCharge: IChargeLookup | null) => {
    if (selectedCharge) {
      form.setValue("chargeId", selectedCharge.chargeId)
      form.setValue("chargeName", selectedCharge.chargeName)
      // Automatically set the GL ID from the selected charge
      form.setValue("glId", selectedCharge.glId)
    } else {
      // Clear related data when charge is cleared
      form.setValue("chargeId", 0)
      form.setValue("chargeName", "")
      form.setValue("glId", 0)
    }
  }

  // Effect for GST autocomplete changes (to update GST percentage)
  const handleGSTChange = (selectedGst: IGstLookup | null) => {
    if (selectedGst) {
      form.setValue("gstId", selectedGst.gstId)
      form.setValue("gstName", selectedGst.gstName)
      form.setValue("gstPercentage", selectedGst.gstPercentage || 0)

      // Recalculate GST amount and total after GST
      const totAmt = form.getValues("totAmt")
      if (totAmt > 0 && selectedGst.gstPercentage > 0) {
        const gstAmount = calculateGSTAmount(totAmt, selectedGst.gstPercentage)
        form.setValue("gstAmt", gstAmount)
        form.setValue("totAftGstAmt", calculateTotalAfterGST(totAmt, gstAmount))
      }
    }
  }

  useEffect(() => {
    form.reset({
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
      itemNo: initialData?.itemNo ?? 0,
      taskId: taskId,
      taskName: initialData?.taskName ?? "",
      chargeId: initialData?.chargeId ?? 0,
      chargeName: initialData?.chargeName ?? "",
      glId: initialData?.glId ?? 0,
      glName: initialData?.glName ?? "",
      qty: initialData?.qty ?? 0,
      unitPrice: initialData?.unitPrice ?? 0,
      totAmt: initialData?.totAmt ?? 0,
      gstId: initialData?.gstId ?? 0,
      gstName: initialData?.gstName ?? "",
      gstPercentage: initialData?.gstPercentage ?? 0,
      gstAmt: initialData?.gstAmt ?? 0,
      totAftGstAmt: initialData?.totAftGstAmt ?? 0,
      remarks: initialData?.remarks ?? "",
      editVersion: initialData?.editVersion ?? 0,
      totLocalAmt: initialData?.totLocalAmt ?? 0,
      isServiceCharge: initialData?.isServiceCharge ?? false,
      serviceCharge: initialData?.serviceCharge ?? 0,
    })
  }, [initialData, form, taskId, isChartOfAccountLoading])

  const onSubmit = (data: DebitNoteDtSchemaType) => {
    console.log("data :", data)

    submitAction(data)
  }

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            {/* Header Information */}
            <div className="grid grid-cols-6 gap-2">
              <CustomNumberInput
                form={form}
                name="itemNo"
                label="Item No"
                round={0}
                isDisabled={isConfirmed || !initialData} // Disable if confirmed or if creating new item
              />

              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={taskId}
                isRequired={true}
                isDisabled={isConfirmed}
                onChangeEvent={handleChargeChange}
              />

              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isDisabled={isConfirmed}
                isRequired={true}
                companyId={companyId}
              />

              <CustomNumberInput
                form={form}
                name="qty"
                label="Quantity"
                round={0}
                isDisabled={isConfirmed}
              />

              <CustomNumberInput
                form={form}
                name="unitPrice"
                label="Unit Price"
                round={2}
                isDisabled={isConfirmed}
              />

              <CustomNumberInput
                form={form}
                name="totLocalAmt"
                label="Amount Local"
                round={2}
                isDisabled={isConfirmed}
              />

              <CustomNumberInput
                form={form}
                name="totAmt"
                label="Total Amount"
                round={2}
                isDisabled={isConfirmed}
              />

              <GstAutocomplete
                form={form}
                name="gstId"
                label="GST"
                isDisabled={isConfirmed}
                onChangeEvent={handleGSTChange}
              />

              <CustomNumberInput
                form={form}
                name="gstPercentage"
                label="GST %"
                round={2}
                isDisabled={isConfirmed}
              />

              <CustomNumberInput
                form={form}
                name="gstAmt"
                label="GST Amount"
                round={2}
                isDisabled={isConfirmed}
              />

              <CustomNumberInput
                form={form}
                name="totAftGstAmt"
                label="Total After GST"
                round={2}
                isDisabled={isConfirmed}
              />

              <CustomSwitch
                form={form}
                name="isServiceCharge"
                label="Service Charge"
                isDisabled={isConfirmed}
              />

              <CustomNumberInput
                form={form}
                name="serviceCharge"
                label="Service Charge"
                round={2}
                isDisabled={isConfirmed}
              />
            </div>

            {/* Remarks */}
            <div className="grid grid-cols-1 gap-2">
              <CustomTextArea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isConfirmed}
            >
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Debit Note Details"
                    : "Add Debit Note Details"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

export default DebitNoteForm
