"use client"

import { useEffect } from "react"
import { ICbBankTransferCtmDt } from "@/interfaces"
import {
  IBankLookup,
  ICurrencyLookup,
  IJobOrderLookup,
  IServiceLookup,
  ITaskLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBankTransferCtmDtSchema,
  CbBankTransferCtmDtSchemaType,
  CbBankTransferCtmHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  BankAutocomplete,
  BankChartOfAccountAutocomplete,
  CurrencyAutocomplete,
  JobOrderAutocomplete,
  JobOrderChargeAutocomplete,
  JobOrderTaskAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"

import { defaultBankTransferCtmDt } from "./cbbanktransferctm-defaultvalues"

// Factory function to create default values with dynamic itemNo
const createDefaultValues = (
  itemNo: number
): CbBankTransferCtmDtSchemaType => ({
  ...defaultBankTransferCtmDt,
  itemNo,
})

interface BankTransferCtmDetailsFormProps {
  Hdform: UseFormReturn<CbBankTransferCtmHdSchemaType>
  onAddRowAction?: (rowData: ICbBankTransferCtmDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbBankTransferCtmDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbBankTransferCtmDtSchemaType[]
}

export default function BankTransferCtmDetailsForm({
  Hdform,
  onAddRowAction,
  onCancelEdit,
  editingDetail,
  visible,
  required,
  companyId,
  existingDetails = [],
}: BankTransferCtmDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const exhRateDec = decimals[0]?.exhRateDec || 6

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  const form = useForm<CbBankTransferCtmDtSchemaType>({
    resolver: zodResolver(CbBankTransferCtmDtSchema(required, visible)),
    defaultValues: editingDetail || createDefaultValues(getNextItemNo()),
  })

  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")

  useEffect(() => {
    if (editingDetail) {
      form.reset(editingDetail)
    } else {
      form.reset({
        ...createDefaultValues(getNextItemNo()),
        transferId: Hdform.getValues("transferId"),
        transferNo: Hdform.getValues("transferNo"),
      })
    }
  }, [editingDetail, form, Hdform])

  const onSubmit = async (data: CbBankTransferCtmDtSchemaType) => {
    if (onAddRowAction) {
      const newItemNo = editingDetail ? editingDetail.itemNo : getNextItemNo()

      onAddRowAction({
        ...data,
        itemNo: newItemNo,
        transferId: Hdform.getValues("transferId") || "0",
        transferNo: Hdform.getValues("transferNo") || "",
        // Lookup fields (populated by API on fetch)
        jobOrderNo: "",
        taskName: "",
        serviceName: "",
        toBankCode: "",
        toBankName: "",
        toCurrencyCode: "",
        toCurrencyName: "",
        toBankChgGLCode: "",
        toBankChgGLName: "",
      } as ICbBankTransferCtmDt)

      // Reset form for next entry
      if (!editingDetail) {
        form.reset(createDefaultValues(newItemNo + 1))
      }
    }
  }

  // Handle Job Order selection
  const handleJobOrderChange = (selectedOption: IJobOrderLookup | null) => {
    if (selectedOption) {
      form.setValue("jobOrderId", selectedOption.jobOrderId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      // Reset task and service when job order changes
      form.setValue("taskId", 0, { shouldValidate: true })
      form.setValue("serviceId", 0, { shouldValidate: true })
    }
  }

  // Handle Task selection
  const handleTaskChange = (selectedOption: ITaskLookup | null) => {
    if (selectedOption) {
      form.setValue("taskId", selectedOption.taskId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      // Reset service when task changes
      form.setValue("serviceId", 0, { shouldValidate: true })
    }
  }

  // Handle Service selection
  const handleServiceChange = (selectedOption: IServiceLookup | null) => {
    if (selectedOption) {
      form.setValue("serviceId", selectedOption.serviceId, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  // Handle TO currency selection
  const handleToCurrencyChange = (selectedCurrency: ICurrencyLookup | null) => {
    if (selectedCurrency) {
      // Set default exchange rate to 1.0 when currency is selected
      const currentExhRate = form.getValues("toExhRate")
      if (!currentExhRate || currentExhRate === 0) {
        form.setValue("toExhRate", 1.0)
      }
    }
  }

  // Handle TO exchange rate change
  const handleToExchangeRateChange = (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const toExhRate = parseFloat(e.target.value) || 0
    const toTotAmt = form.getValues("toTotAmt") || 0

    // Calculate local amount based on exchange rate
    const toTotLocalAmt = toTotAmt * toExhRate
    form.setValue("toTotLocalAmt", parseFloat(toTotLocalAmt.toFixed(locAmtDec)))

    // Recalculate bank charge local amount
    const toBankChgAmt = form.getValues("toBankChgAmt") || 0
    const toBankChgLocalAmt = toBankChgAmt * toExhRate
    form.setValue(
      "toBankChgLocalAmt",
      parseFloat(toBankChgLocalAmt.toFixed(locAmtDec))
    )
  }

  // Handle bank selection
  const handleBankChange = (_selectedBank: IBankLookup | null) => {
    // Additional logic when bank changes if needed
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-md p-4"
      >
        {/* ============ JOB ORDER SECTION ============ */}
        {visible?.m_JobOrderId && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
            <h3 className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
              Job Order Details
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <JobOrderAutocomplete
                form={form}
                name="jobOrderId"
                label="Job Order"
                isRequired={required?.m_JobOrderId}
                onChangeEvent={handleJobOrderChange}
              />

              <JobOrderTaskAutocomplete
                key={`task-${watchedJobOrderId}`}
                form={form}
                name="taskId"
                jobOrderId={watchedJobOrderId || 0}
                label="Task"
                isRequired={required?.m_JobOrderId}
                onChangeEvent={handleTaskChange}
              />

              <JobOrderChargeAutocomplete
                key={`service-${watchedJobOrderId}-${watchedTaskId}`}
                form={form}
                name="serviceId"
                jobOrderId={watchedJobOrderId || 0}
                taskId={watchedTaskId || 0}
                label="Service"
                isRequired={required?.m_JobOrderId}
                onChangeEvent={handleServiceChange}
              />
            </div>
          </div>
        )}

        {/* ============ TO BANK SECTION ============ */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
          <h3 className="mb-3 text-sm font-semibold text-green-700 dark:text-green-300">
            To Bank Details
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <BankAutocomplete
              form={form}
              name="toBankId"
              label="To Bank"
              isRequired={true}
              onChangeEvent={handleBankChange}
            />

            <CurrencyAutocomplete
              form={form}
              name="toCurrencyId"
              label="To Currency"
              isRequired={true}
              onChangeEvent={handleToCurrencyChange}
            />

            <CustomNumberInput
              form={form}
              name="toExhRate"
              label="To Exchange Rate"
              round={exhRateDec}
              isRequired={true}
              className="text-right"
              onBlurEvent={handleToExchangeRateChange}
            />

            <BankChartOfAccountAutocomplete
              form={form}
              name="toBankChgGLId"
              label="To Bank Charge GL"
              companyId={companyId}
            />

            <CustomNumberInput
              form={form}
              name="toBankChgAmt"
              label="To Bank Charge Amt"
              round={amtDec}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="toBankChgLocalAmt"
              label="To Bank Charge Local Amt"
              round={locAmtDec}
              isDisabled={true}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="toTotAmt"
              label="To Total Amount"
              round={amtDec}
              isRequired={true}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="toTotLocalAmt"
              label="To Total Local Amt"
              round={locAmtDec}
              isDisabled={true}
              className="text-right"
            />
          </div>
        </div>

        {/* ============ BANK EXCHANGE SECTION ============ */}
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-900/20">
          <h3 className="mb-3 text-sm font-semibold text-purple-700 dark:text-purple-300">
            Bank Exchange Details
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <CustomNumberInput
              form={form}
              name="bankExhRate"
              label="Bank Exchange Rate"
              round={exhRateDec}
              isRequired={true}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="bankTotAmt"
              label="Bank Total Amount"
              round={amtDec}
              isRequired={true}
              className="text-right"
            />

            <CustomNumberInput
              form={form}
              name="bankTotLocalAmt"
              label="Bank Total Local Amount"
              round={locAmtDec}
              isDisabled={true}
              className="text-right"
            />
          </div>
        </div>

        {/* ============ ACTION BUTTONS ============ */}
        <div className="flex justify-end gap-2">
          {editingDetail && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {editingDetail ? "Update Detail" : "Add Detail"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
