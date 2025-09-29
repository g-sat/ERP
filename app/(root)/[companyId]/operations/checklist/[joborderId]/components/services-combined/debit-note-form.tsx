"use client"

import { useEffect, useMemo } from "react"
import { calculateDebitNoteDetailAmounts } from "@/helpers/debit-note-calculations"
import { IDebitNoteDt, IDebitNoteHd } from "@/interfaces/checklist"
import { IChargeLookup, IGstLookup } from "@/interfaces/lookup"
import { DebitNoteDtSchemaType, debitNoteDtSchema } from "@/schemas/checklist"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import { parseDate } from "@/lib/date-utils"
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
  debitNoteHd?: IDebitNoteHd
  initialData?: IDebitNoteDt
  submitAction: (data: DebitNoteDtSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
  taskId: number
  exchangeRate?: number // Add exchange rate prop
  companyId?: number
  onChargeChange?: (chargeName: string) => void // Add callback for charge name changes
  shouldReset?: boolean // Add prop to trigger form reset
}

export default function DebitNoteForm({
  debitNoteHd,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
  taskId,
  exchangeRate = 1, // Default to 1 if not provided
  companyId,
  onChargeChange,
  shouldReset = false,
}: DebitNoteFormProps) {
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(companyId)
  )

  const defaultValues = useMemo(
    () => ({
      debitNoteId: initialData?.debitNoteId ?? debitNoteHd?.debitNoteId,
      debitNoteNo: debitNoteHd?.debitNoteNo,
      itemNo: 0,
      taskId: taskId,
      chargeId: 0,
      glId: debitNoteHd?.glId ?? 0,
      qty: 0,
      unitPrice: 0,
      totAmt: 0,
      gstId: 0,
      gstPercentage: 0,
      gstAmt: 0,
      totAftGstAmt: 0,
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
      debitNoteHd?.glId,
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
          glId: initialData?.glId ?? 0,
          qty: initialData?.qty ?? 0,
          unitPrice: initialData?.unitPrice ?? 0,
          totAmt: initialData?.totAmt ?? 0,
          gstId: initialData?.gstId ?? 0,
          gstPercentage: initialData?.gstPercentage ?? 0,
          gstAmt: initialData?.gstAmt ?? 0,
          totAftGstAmt: initialData?.totAftGstAmt ?? 0,
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

  // Watch form values for calculations
  const watchedValues = form.watch()

  // Calculation functions using helper functions
  const calculateTotalAmount = (qty: number, unitPrice: number): number => {
    return calculateDebitNoteDetailAmounts(qty, unitPrice, 0, { amtDec: 2 })
      .totalAmount
  }

  const calculateGSTAmount = (
    totalAmount: number,
    gstPercentage: number
  ): number => {
    return calculateDebitNoteDetailAmounts(1, totalAmount, gstPercentage, {
      amtDec: 2,
    }).vatAmount
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

      // Recalculate VAT and total after VAT
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

  // Effect for VAT percentage changes
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

      // Recalculate VAT and total after VAT
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

  // Effect for service charge switch changes
  useEffect(() => {
    if (!watchedValues.isServiceCharge) {
      form.setValue("serviceCharge", 0)
    }
  }, [watchedValues.isServiceCharge, form])

  // Effect for charge autocomplete changes (to update GL ID)
  const handleChargeChange = (selectedCharge: IChargeLookup | null) => {
    if (selectedCharge) {
      form.setValue("chargeId", selectedCharge.chargeId)
      // Automatically set the GL ID from the selected charge
      form.setValue("glId", selectedCharge.glId)

      // Add charge name to remarks when charge changes
      const currentRemarks = form.getValues("remarks") || ""
      const newRemarks = currentRemarks
        ? `${currentRemarks}\n${selectedCharge.chargeName}`
        : selectedCharge.chargeName
      form.setValue("remarks", newRemarks)

      // Notify parent component of charge name change
      onChargeChange?.(selectedCharge.chargeName)
    } else {
      // Clear related data when charge is cleared
      form.setValue("chargeId", 0)
      form.setValue("glId", 0)

      // Notify parent component that charge is cleared
      onChargeChange?.("")
    }
  }

  // Effect for VAT autocomplete changes (to update VAT percentage)
  const handleGSTChange = async (selectedGst: IGstLookup | null) => {
    if (selectedGst) {
      form.setValue("gstId", selectedGst.gstId)

      // Get GST percentage from API if debit note header date is available
      const accountDate = debitNoteHd?.debitNoteDate
      if (accountDate && selectedGst.gstId) {
        try {
          // Validate and parse the date
          const parsedDate = parseDate(accountDate.toString()) || new Date()
          const dt = format(parsedDate, "yyyy-MM-dd")

          const res = await getData(
            `${BasicSetting.getGstPercentage}/${selectedGst.gstId}/${dt}`
          )
          // Update the GST percentage for this specific row
          const gstPercentage = res?.data || 0
          form.setValue("gstPercentage", gstPercentage)

          // Recalculate VAT amount and total after VAT
          const totAmt = form.getValues("totAmt")
          if (totAmt > 0 && gstPercentage > 0) {
            const gstAmount = calculateGSTAmount(totAmt, gstPercentage)
            form.setValue("gstAmt", gstAmount)
            form.setValue(
              "totAftGstAmt",
              calculateTotalAfterGST(totAmt, gstAmount)
            )
          }
        } catch (error) {
          console.error("Error fetching GST percentage:", error)
          // Fallback to the GST percentage from the lookup
          form.setValue("gstPercentage", selectedGst.gstPercentage || 0)
        }
      } else {
        // Use the GST percentage from the lookup if no date available
        form.setValue("gstPercentage", selectedGst.gstPercentage || 0)

        // Recalculate VAT amount and total after VAT
        const totAmt = form.getValues("totAmt")
        if (totAmt > 0 && selectedGst.gstPercentage > 0) {
          const gstAmount = calculateGSTAmount(
            totAmt,
            selectedGst.gstPercentage
          )
          form.setValue("gstAmt", gstAmount)
          form.setValue(
            "totAftGstAmt",
            calculateTotalAfterGST(totAmt, gstAmount)
          )
        }
      }
    }
  }

  useEffect(() => {
    form.reset(
      initialData
        ? {
            debitNoteId:
              initialData?.debitNoteId ?? debitNoteHd?.debitNoteId ?? 0,
            debitNoteNo:
              initialData?.debitNoteNo ?? debitNoteHd?.debitNoteNo ?? "",
            itemNo: initialData?.itemNo ?? 0,
            taskId: taskId,
            chargeId: initialData?.chargeId ?? 0,
            glId: initialData?.glId ?? 0,
            qty: initialData?.qty ?? 0,
            unitPrice: initialData?.unitPrice ?? 0,
            totAmt: initialData?.totAmt ?? 0,
            gstId: initialData?.gstId ?? 0,
            gstPercentage: initialData?.gstPercentage ?? 0,
            gstAmt: initialData?.gstAmt ?? 0,
            totAftGstAmt: initialData?.totAftGstAmt ?? 0,
            remarks: initialData?.remarks ?? "",
            editVersion: initialData?.editVersion ?? 0,
            totLocalAmt: initialData?.totLocalAmt ?? 0,
            isServiceCharge: initialData?.isServiceCharge ?? false,
            serviceCharge: initialData?.serviceCharge ?? 0,
          }
        : {
            ...defaultValues,
          }
    )
  }, [
    initialData,
    form,
    taskId,
    isChartOfAccountLoading,
    debitNoteHd?.debitNoteId,
    debitNoteHd?.debitNoteNo,
  ])

  // Effect to reset form when shouldReset changes
  useEffect(() => {
    if (shouldReset) {
      form.reset({
        ...defaultValues,
      })
      // Notify parent that charge is cleared
      onChargeChange?.("")
    }
  }, [shouldReset, form, defaultValues, onChargeChange])

  const onSubmit = (data: DebitNoteDtSchemaType) => {
    submitAction(data)
  }

  const handleReset = () => {
    form.reset({
      ...defaultValues,
    })
  }

  return (
    <div className="flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          {/* Row 1 */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="itemNo"
                label="Item No"
                round={0}
                isDisabled={isConfirmed || !initialData}
              />
            </div>

            <div className="col-span-2">
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge Name"
                taskId={taskId}
                isRequired={true}
                isDisabled={isConfirmed}
                onChangeEvent={handleChargeChange}
              />
            </div>

            <div className="col-span-2">
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isDisabled={isConfirmed}
                isRequired={true}
                companyId={companyId}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="qty"
                label="Quantity"
                round={0}
                isDisabled={isConfirmed}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="unitPrice"
                label="Unit Price"
                round={2}
                isDisabled={isConfirmed}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="totLocalAmt"
                label="Amount Local"
                round={2}
                isDisabled={isConfirmed}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="totAmt"
                label="Total Amount"
                round={2}
                isDisabled={isConfirmed}
              />
            </div>

            <div className="col-span-1">
              <GstAutocomplete
                form={form}
                name="gstId"
                label="VAT"
                isDisabled={isConfirmed}
                onChangeEvent={handleGSTChange}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="gstPercentage"
                label="VAT %"
                round={2}
                isDisabled={true}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="gstAmt"
                label="VAT Amount"
                round={2}
                isDisabled={isConfirmed}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="totAftGstAmt"
                label="Total After VAT"
                round={2}
                isDisabled={true}
              />
            </div>

            <div className="col-span-1">
              <CustomSwitch
                form={form}
                name="isServiceCharge"
                label="Is Ser. Chrg.?"
                isDisabled={isConfirmed}
              />
            </div>

            <div className="col-span-1">
              <CustomNumberInput
                form={form}
                name="serviceCharge"
                label="Service Charge"
                round={2}
                isDisabled={isConfirmed || !watchedValues.isServiceCharge}
              />
            </div>

            <div className="col-span-4">
              <CustomTextArea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
                isRequired={true}
              />
            </div>

            <div className="col-span-5 flex items-center justify-end">
              <div className="flex gap-2">
                {!isConfirmed && (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                )}
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
                        ? "Update"
                        : "Add"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
