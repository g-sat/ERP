"use client"

import { useEffect, useMemo } from "react"
import { IDebitNoteDt, IDebitNoteHd } from "@/interfaces/checklist"
import { DebitNoteDtSchemaType, debitNoteDtSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useChartOfAccountLookup } from "@/hooks/use-lookup"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { ChargeAutocomplete, GSTAutocomplete } from "@/components/autocomplete"
import CustomCheckbox from "@/components/custom/custom-checkbox"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextArea from "@/components/custom/custom-textarea"

interface DebitNoteFormProps {
  debitNoteHd?: IDebitNoteHd
  initialData?: IDebitNoteDt
  submitAction: (data: DebitNoteDtSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
  taskId: number
  companyId?: number
  onChargeChange?: (chargeName: string) => void // Add callback for charge name changes
  summaryTotals?: {
    totalAmount: number
    vatAmount: number
    totalAfterVat: number
  } // Summary totals from table
  currencyCode?: string // Currency code for remarks update
}

export default function DebitNoteForm({
  debitNoteHd,
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isConfirmed,
  taskId,
  companyId,
  onChargeChange,
  summaryTotals,
  currencyCode,
}: DebitNoteFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const { isLoading: isChartOfAccountLoading } = useChartOfAccountLookup(
    Number(companyId)
  )

  const defaultValues = useMemo(
    () => ({
      debitNoteId: initialData?.debitNoteId ?? debitNoteHd?.debitNoteId,
      debitNoteNo: debitNoteHd?.debitNoteNo,
      itemNo: 0,
      taskId: taskId,
      chargeId: 0,
      qty: 0,
      unitPrice: 0,
      totAmt: 0,
      gstId: 0,
      gstPercentage: 0,
      gstAmt: 0,
      totAmtAftGst: 0,
      remarks: "",
      editVersion: 0,
      totLocalAmt: 0,
      isServiceCharge: false,
      serviceCharge: 0,
    }),
    [
      initialData?.debitNoteId,
      debitNoteHd?.debitNoteId,
      debitNoteHd?.debitNoteNo,
      taskId,
    ]
  )

  const form = useForm<DebitNoteDtSchemaType>({
    resolver: zodResolver(debitNoteDtSchema),
    mode: "onChange", // Validate on blur to show errors after user interaction
    defaultValues: initialData
      ? {
          debitNoteId:
            initialData?.debitNoteId ?? debitNoteHd?.debitNoteId ?? 0,
          debitNoteNo:
            initialData?.debitNoteNo ?? debitNoteHd?.debitNoteNo ?? "",
          itemNo: initialData?.itemNo ?? 0,
          taskId: taskId,
          chargeId: initialData?.chargeId ?? 0,
          qty: initialData?.qty ?? 0,
          unitPrice: initialData?.unitPrice ?? 0,
          totAmt: initialData?.totAmt ?? 0,
          gstId: initialData?.gstId ?? 0,
          gstPercentage: initialData?.gstPercentage ?? 0,
          gstAmt: initialData?.gstAmt ?? 0,
          totAmtAftGst: initialData?.totAmtAftGst ?? 0,
          remarks: initialData?.remarks ?? "",
          editVersion: initialData?.editVersion ?? 0,
          totLocalAmt: initialData?.totLocalAmt ?? 0,
          isServiceCharge: initialData?.isServiceCharge ?? false,
          serviceCharge: initialData?.serviceCharge ?? 0,
        }
      : {
          ...defaultValues,
        },
  })

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        debitNoteId: initialData?.debitNoteId ?? debitNoteHd?.debitNoteId ?? 0,
        debitNoteNo: initialData?.debitNoteNo ?? debitNoteHd?.debitNoteNo ?? "",
        itemNo: initialData?.itemNo ?? 0,
        taskId: taskId,
        chargeId: initialData?.chargeId ?? 0,
        qty: initialData?.qty ?? 0,
        unitPrice: initialData?.unitPrice ?? 0,
        totAmt: initialData?.totAmt ?? 0,
        gstId: initialData?.gstId ?? 0,
        gstPercentage: initialData?.gstPercentage ?? 0,
        gstAmt: initialData?.gstAmt ?? 0,
        totAmtAftGst: initialData?.totAmtAftGst ?? 0,
        remarks: initialData?.remarks ?? "",
        editVersion: initialData?.editVersion ?? 0,
        totLocalAmt: initialData?.totLocalAmt ?? 0,
        isServiceCharge: initialData?.isServiceCharge ?? false,
        serviceCharge: initialData?.serviceCharge ?? 0,
      })
    } else {
      // Reset to default values when initialData is cleared (create mode)
      form.reset(defaultValues)
    }
    // Use itemNo as the key to detect changes - when it changes or becomes undefined, reset form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.itemNo, form])

  const onSubmit = (data: DebitNoteDtSchemaType) => {
    submitAction(data)
  }

  const handleCancel = () => {
    // Reset form to default values
    form.reset({
      ...defaultValues,
    })
    // Reset refs

    // Notify parent that charge is cleared
    onChargeChange?.("")
    // Call the onCancelAction callback if provided
    onCancelAction?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-12 gap-2"
      >
        {/* Left Section: Form Fields */}
        <Card className="col-span-10">
          <CardContent className="bg-transparent px-3 py-0">
            <div className="space-y-2">
              {/* Row 1: Charge, Qty, Unit Price, Amt Local, Total Amt */}
              <div className="grid grid-cols-10 gap-2">
                <div className="col-span-2">
                  <ChargeAutocomplete
                    form={form}
                    name="chargeId"
                    label="Charge Name"
                    taskId={taskId}
                    isRequired={true}
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="qty"
                    label="Qty"
                    round={0}
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="unitPrice"
                    label="Unit Price"
                    round={amtDec}
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="totLocalAmt"
                    label="Amt Local"
                    round={locAmtDec}
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="totAmt"
                    label="Total Amt"
                    round={amtDec}
                    isDisabled={isConfirmed}
                  />
                </div>
                <div className="col-span-1">
                  <GSTAutocomplete
                    form={form}
                    name="gstId"
                    label="Vat"
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="gstPercentage"
                    label="Vat %"
                    round={amtDec}
                    isDisabled={true}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="gstAmt"
                    label="Vat Amt"
                    round={amtDec}
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="totAmtAftGst"
                    label="Tot Aft Vat"
                    round={amtDec}
                    isDisabled={true}
                  />
                </div>
              </div>

              {/* Row 2: Vat, Vat %, Vat Amt, Tot Aft Vat, Is Sr Chg?, Service Chg, Remarks, Action Buttons */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-1">
                  <CustomCheckbox
                    form={form}
                    name="isServiceCharge"
                    label="Is Sr Chg?"
                    isDisabled={isConfirmed}
                  />
                </div>

                <div className="col-span-1">
                  <CustomNumberInput
                    form={form}
                    name="serviceCharge"
                    label="Service Chg"
                    round={amtDec}
                  />
                </div>

                <div className="col-span-5">
                  <CustomTextArea
                    form={form}
                    name="remarks"
                    label="Remarks"
                    isDisabled={isConfirmed}
                    isRequired={true}
                  />
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex items-end justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleCancel}
                    disabled={isConfirmed}
                    size="sm"
                  >
                    {isConfirmed ? "Close" : "Cancel"}
                  </Button>
                  {!isConfirmed && (
                    <Button type="submit" disabled={isSubmitting} size="sm">
                      {isSubmitting
                        ? "Saving..."
                        : initialData
                          ? "Update"
                          : "Add"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Section: Summary Box */}
        <Card className="col-span-2">
          <CardContent className="bg-transparent px-3 py-0">
            <div className="w-full rounded-md border border-blue-200 bg-blue-50 p-3 shadow-sm">
              {/* Header */}
              <div className="mb-2 border-b border-blue-300 pb-2 text-center text-sm font-bold text-blue-800">
                Total Summary
              </div>

              {/* Summary Values */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-600">Amt</span>
                  <span className="font-medium text-gray-700">
                    {(summaryTotals?.totalAmount || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-600">VAT</span>
                  <span className="font-medium text-gray-700">
                    {(summaryTotals?.vatAmount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <hr className="my-1 border-blue-300" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-800">Total</span>
                  <span className="font-bold text-blue-900">
                    {(summaryTotals?.totalAfterVat || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
