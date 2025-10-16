"use client"

import React, { useEffect } from "react"
import {
  calculateMultiplierAmount,
  setToExchangeRateDetails,
} from "@/helpers/account"
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
import { toast } from "sonner"

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
  onCancelEdit: _onCancelEdit,
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
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          transferId: editingDetail.transferId ?? "0",
          transferNo: editingDetail.transferNo ?? "",
          itemNo: editingDetail.itemNo ?? getNextItemNo(),
          seqNo: editingDetail.seqNo ?? getNextItemNo(),

          // Job Order Fields
          jobOrderId: editingDetail.jobOrderId ?? 0,
          jobOrderNo: editingDetail.jobOrderNo ?? "",
          taskId: editingDetail.taskId ?? 0,
          taskName: editingDetail.taskName ?? "",
          serviceId: editingDetail.serviceId ?? 0,
          serviceName: editingDetail.serviceName ?? "",

          // To Bank Fields
          toBankId: editingDetail.toBankId ?? 0,
          toBankCode: editingDetail.toBankCode ?? "",
          toBankName: editingDetail.toBankName ?? "",
          toCurrencyId: editingDetail.toCurrencyId ?? 0,
          toCurrencyCode: editingDetail.toCurrencyCode ?? "",
          toCurrencyName: editingDetail.toCurrencyName ?? "",
          toExhRate: editingDetail.toExhRate ?? 0,
          toBankChgGLId: editingDetail.toBankChgGLId ?? 0,
          toBankChgGLCode: editingDetail.toBankChgGLCode ?? "",
          toBankChgGLName: editingDetail.toBankChgGLName ?? "",
          toBankChgAmt: editingDetail.toBankChgAmt ?? 0,
          toBankChgLocalAmt: editingDetail.toBankChgLocalAmt ?? 0,
          toTotAmt: editingDetail.toTotAmt ?? 0,
          toTotLocalAmt: editingDetail.toTotLocalAmt ?? 0,

          // Bank Exchange Fields
          bankExhRate: editingDetail.bankExhRate ?? 0,
          bankTotAmt: editingDetail.bankTotAmt ?? 0,
          bankTotLocalAmt: editingDetail.bankTotLocalAmt ?? 0,

          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")

  useEffect(() => {
    if (editingDetail) {
      form.reset({
        transferId: editingDetail.transferId ?? "0",
        transferNo: editingDetail.transferNo ?? "",
        itemNo: editingDetail.itemNo ?? getNextItemNo(),
        seqNo: editingDetail.seqNo ?? getNextItemNo(),

        // Job Order Fields
        jobOrderId: editingDetail.jobOrderId ?? 0,
        jobOrderNo: editingDetail.jobOrderNo ?? "",
        taskId: editingDetail.taskId ?? 0,
        taskName: editingDetail.taskName ?? "",
        serviceId: editingDetail.serviceId ?? 0,
        serviceName: editingDetail.serviceName ?? "",

        // To Bank Fields
        toBankId: editingDetail.toBankId ?? 0,
        toBankCode: editingDetail.toBankCode ?? "",
        toBankName: editingDetail.toBankName ?? "",
        toCurrencyId: editingDetail.toCurrencyId ?? 0,
        toCurrencyCode: editingDetail.toCurrencyCode ?? "",
        toCurrencyName: editingDetail.toCurrencyName ?? "",
        toExhRate: editingDetail.toExhRate ?? 0,
        toBankChgGLId: editingDetail.toBankChgGLId ?? 0,
        toBankChgGLCode: editingDetail.toBankChgGLCode ?? "",
        toBankChgGLName: editingDetail.toBankChgGLName ?? "",
        toBankChgAmt: editingDetail.toBankChgAmt ?? 0,
        toBankChgLocalAmt: editingDetail.toBankChgLocalAmt ?? 0,
        toTotAmt: editingDetail.toTotAmt ?? 0,
        toTotLocalAmt: editingDetail.toTotLocalAmt ?? 0,

        // Bank Exchange Fields
        bankExhRate: editingDetail.bankExhRate ?? 0,
        bankTotAmt: editingDetail.bankTotAmt ?? 0,
        bankTotLocalAmt: editingDetail.bankTotLocalAmt ?? 0,

        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      form.reset({
        ...createDefaultValues(getNextItemNo()),
        transferId: Hdform.getValues("transferId"),
        transferNo: Hdform.getValues("transferNo"),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail])

  const onSubmit = async (data: CbBankTransferCtmDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = CbBankTransferCtmDtSchema(
        required,
        visible
      ).safeParse(data)

      if (!validationResult.success) {
        const errors = validationResult.error.issues
        const errorMessage = errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ")
        toast.error(`Validation failed: ${errorMessage}`)
        console.error("Validation errors:", errors)
        return
      }

      // Use itemNo as the unique identifier
      const currentItemNo = data.itemNo || getNextItemNo()

      console.log("currentItemNo : ", currentItemNo)
      console.log("data : ", data)

      const rowData: ICbBankTransferCtmDt = {
        transferId: data.transferId ?? "0",
        transferNo: data.transferNo ?? "",
        itemNo: data.itemNo ?? currentItemNo,
        seqNo: data.seqNo ?? currentItemNo,

        // Job Order Fields
        jobOrderId: data.jobOrderId ?? 0,
        jobOrderNo: data.jobOrderNo ?? "",
        taskId: data.taskId ?? 0,
        taskName: data.taskName ?? "",
        serviceId: data.serviceId ?? 0,
        serviceName: data.serviceName ?? "",

        // To Bank Fields
        toBankId: data.toBankId ?? 0,
        toBankCode: data.toBankCode ?? "",
        toBankName: data.toBankName ?? "",
        toCurrencyId: data.toCurrencyId ?? 0,
        toCurrencyCode: data.toCurrencyCode ?? "",
        toCurrencyName: data.toCurrencyName ?? "",
        toExhRate: data.toExhRate ?? 0,
        toBankChgGLId: data.toBankChgGLId ?? 0,
        toBankChgGLCode: data.toBankChgGLCode ?? "",
        toBankChgGLName: data.toBankChgGLName ?? "",
        toBankChgAmt: data.toBankChgAmt ?? 0,
        toBankChgLocalAmt: data.toBankChgLocalAmt ?? 0,
        toTotAmt: data.toTotAmt ?? 0,
        toTotLocalAmt: data.toTotLocalAmt ?? 0,

        // Bank Exchange Fields
        bankExhRate: data.bankExhRate ?? 0,
        bankTotAmt: data.bankTotAmt ?? 0,
        bankTotLocalAmt: data.bankTotLocalAmt ?? 0,

        editVersion: data.editVersion ?? 0,
      }

      if (rowData) {
        onAddRowAction?.(rowData)

        // Show success message
        if (editingDetail) {
          toast.success(`Row ${currentItemNo} updated successfully`)
        } else {
          toast.success(`Row ${currentItemNo} added successfully`)
        }

        // Reset the form with incremented itemNo
        const nextItemNo = getNextItemNo()
        form.reset(createDefaultValues(nextItemNo))
      }
    } catch (error) {
      console.error("Error adding row:", error)
      toast.error("Failed to add row. Please check the form and try again.")
    }
  }

  // Handle Job Order selection
  const handleJobOrderChange = (selectedOption: IJobOrderLookup | null) => {
    if (selectedOption) {
      form.setValue("jobOrderId", selectedOption.jobOrderId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("jobOrderNo", selectedOption.jobOrderNo || "")
      // Reset task and service when job order changes
      form.setValue("taskId", 0, { shouldValidate: true })
      form.setValue("taskName", "")
      form.setValue("serviceId", 0, { shouldValidate: true })
      form.setValue("serviceName", "")
    } else {
      // Clear job order and related fields
      form.setValue("jobOrderId", 0, { shouldValidate: true })
      form.setValue("jobOrderNo", "")
      form.setValue("taskId", 0, { shouldValidate: true })
      form.setValue("taskName", "")
      form.setValue("serviceId", 0, { shouldValidate: true })
      form.setValue("serviceName", "")
    }
  }

  // Handle Task selection
  const handleTaskChange = (selectedOption: ITaskLookup | null) => {
    if (selectedOption) {
      form.setValue("taskId", selectedOption.taskId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("taskName", selectedOption.taskName || "")
      // Reset service when task changes
      form.setValue("serviceId", 0, { shouldValidate: true })
      form.setValue("serviceName", "")
    } else {
      // Clear task and service fields
      form.setValue("taskId", 0, { shouldValidate: true })
      form.setValue("taskName", "")
      form.setValue("serviceId", 0, { shouldValidate: true })
      form.setValue("serviceName", "")
    }
  }

  // Handle Service selection
  const handleServiceChange = (selectedOption: IServiceLookup | null) => {
    if (selectedOption) {
      form.setValue("serviceId", selectedOption.serviceId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue(
        "serviceName",
        selectedOption.serviceCode + " " + selectedOption.serviceName || ""
      )
    } else {
      // Clear service fields
      form.setValue("serviceId", 0, { shouldValidate: true })
    }
  }

  // Handle TO currency selection
  const handleToCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      if (selectedCurrency) {
        form.setValue("toCurrencyId", selectedCurrency.currencyId)

        // Use helper to get exchange rate from API using header form's accountDate
        const exhRate = await setToExchangeRateDetails(
          Hdform,
          form,
          exhRateDec,
          "toCurrencyId"
        )

        // Auto-calculate local amounts with new exchange rate using helper
        if (exhRate) {
          const toTotAmt = form.getValues("toTotAmt") || 0
          const toTotLocalAmt = calculateMultiplierAmount(
            toTotAmt,
            Number(exhRate),
            locAmtDec
          )
          form.setValue("toTotLocalAmt", toTotLocalAmt)

          const toBankChgAmt = form.getValues("toBankChgAmt") || 0
          const toBankChgLocalAmt = calculateMultiplierAmount(
            toBankChgAmt,
            Number(exhRate),
            locAmtDec
          )
          form.setValue("toBankChgLocalAmt", toBankChgLocalAmt)
        }
      } else {
        form.setValue("toCurrencyId", 0, { shouldValidate: true })
        form.setValue("toExhRate", 0)
        form.setValue("toTotLocalAmt", 0)
        form.setValue("toBankChgLocalAmt", 0)
      }
    },
    [form, Hdform, exhRateDec, locAmtDec]
  )

  // Handle TO total amount change
  const handleToTotAmtChange = React.useCallback(
    (value: number) => {
      form.setValue("toTotAmt", value)
      const toExhRate = form.getValues("toExhRate") || 0

      // Calculate local amount based on exchange rate using helper
      const toTotLocalAmt = calculateMultiplierAmount(
        value,
        toExhRate,
        locAmtDec
      )
      form.setValue("toTotLocalAmt", toTotLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle TO bank charge amount change
  const handleToBankChgAmtChange = React.useCallback(
    (value: number) => {
      form.setValue("toBankChgAmt", value)
      const toExhRate = form.getValues("toExhRate") || 0

      // Calculate local amount based on exchange rate using helper
      const toBankChgLocalAmt = calculateMultiplierAmount(
        value,
        toExhRate,
        locAmtDec
      )
      form.setValue("toBankChgLocalAmt", toBankChgLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle bank total amount change
  const handleBankTotAmtChange = React.useCallback(
    (value: number) => {
      form.setValue("bankTotAmt", value)
      const bankExhRate = form.getValues("bankExhRate") || 0

      // Calculate local amount based on bank exchange rate using helper
      const bankTotLocalAmt = calculateMultiplierAmount(
        value,
        bankExhRate,
        locAmtDec
      )
      form.setValue("bankTotLocalAmt", bankTotLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle bank exchange rate change
  const handleBankExhRateChange = React.useCallback(
    (value: number) => {
      const bankExhRate = value || 0

      // If bank exchange rate is zero, clear all bank amounts
      if (bankExhRate === 0) {
        form.setValue("bankTotAmt", 0)
        form.setValue("bankTotLocalAmt", 0)
        return
      }

      const toTotAmt = form.getValues("toTotAmt") || 0
      form.setValue("bankTotAmt", toTotAmt)

      // Calculate bank local amount using helper
      const bankTotLocalAmt = calculateMultiplierAmount(
        toTotAmt,
        bankExhRate,
        locAmtDec
      )
      form.setValue("bankTotLocalAmt", bankTotLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle TO exchange rate change
  const handleToExchangeRateChange = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const toExhRate = parseFloat(e.target.value) || 0
      const toTotAmt = form.getValues("toTotAmt") || 0

      // Calculate local amount based on exchange rate using helper
      const toTotLocalAmt = calculateMultiplierAmount(
        toTotAmt,
        toExhRate,
        locAmtDec
      )
      form.setValue("toTotLocalAmt", toTotLocalAmt)

      // Recalculate bank charge local amount using helper
      const toBankChgAmt = form.getValues("toBankChgAmt") || 0
      const toBankChgLocalAmt = calculateMultiplierAmount(
        toBankChgAmt,
        toExhRate,
        locAmtDec
      )
      form.setValue("toBankChgLocalAmt", toBankChgLocalAmt)
    },
    [form, locAmtDec]
  )

  // Handle bank selection
  const handleBankChange = (_selectedBank: IBankLookup | null) => {
    // Additional logic when bank changes if needed
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full grid-cols-7 gap-2 p-2"
      >
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

        {visible?.m_JobOrderId && (
          <>
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
          </>
        )}

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
          onChangeEvent={handleToBankChgAmtChange}
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
          onChangeEvent={handleToTotAmtChange}
        />

        <CustomNumberInput
          form={form}
          name="toTotLocalAmt"
          label="To Total Local Amt"
          round={locAmtDec}
          isDisabled={true}
          className="text-right"
        />

        <CustomNumberInput
          form={form}
          name="bankExhRate"
          label="Bank Exchange Rate"
          round={exhRateDec}
          isRequired={true}
          className="text-right"
          onChangeEvent={handleBankExhRateChange}
        />

        <CustomNumberInput
          form={form}
          name="bankTotAmt"
          label="Bank Total Amount"
          round={amtDec}
          isRequired={true}
          className="text-right"
          onChangeEvent={handleBankTotAmtChange}
        />

        <CustomNumberInput
          form={form}
          name="bankTotLocalAmt"
          label="Bank Total Local Amount"
          round={locAmtDec}
          isDisabled={true}
          className="text-right"
        />

        {/* Action buttons */}
        <div className="col-span-1 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {
              const nextItemNo = getNextItemNo()
              form.reset(createDefaultValues(nextItemNo))
              toast.info("Form reset")
            }}
          >
            Reset
          </Button>

          <Button
            type="submit"
            size="sm"
            className="ml-auto"
            disabled={form.formState.isSubmitting}
          >
            {editingDetail ? "Update" : "Add"}
          </Button>
          {editingDetail && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                _onCancelEdit?.()
                const nextItemNo = getNextItemNo()
                form.reset(createDefaultValues(nextItemNo))
                toast.info("Edit cancelled")
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
