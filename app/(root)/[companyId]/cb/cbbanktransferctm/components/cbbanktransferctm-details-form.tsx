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
  JobOrderServiceAutocomplete,
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

  // Helper function to populate code/name fields from lookup data
  const populateCodeNameFields = (data: CbBankTransferCtmDtSchemaType) => {
    // Populate toBankCode and toBankName
    if (data.toBankId && data.toBankId > 0) {
      // This would need to be implemented based on your bank lookup data
      // For now, keeping existing values
    }

    // Populate toCurrencyCode and toCurrencyName
    if (data.toCurrencyId && data.toCurrencyId > 0) {
      // This would need to be implemented based on your currency lookup data
      // For now, keeping existing values
    }

    // Populate toBankChgGLCode and toBankChgGLName
    if (data.toBankChgGLId && data.toBankChgGLId > 0) {
      // This would need to be implemented based on your chart of account lookup data
      // For now, keeping existing values
    }

    return data
  }

  // Helper function to focus first visible field
  const focusFirstVisibleField = () => {
    // Focus on the first input field after form operations
    setTimeout(() => {
      const firstInput = document.querySelector(
        'input:not([disabled]):not([type="hidden"])'
      ) as HTMLInputElement
      firstInput?.focus()
    }, 100)
  }

  // Handle form reset
  const handleFormReset = () => {
    const updatedDetails = Hdform.getValues("data_details") || []
    const nextItemNo =
      updatedDetails.length > 0
        ? Math.max(...updatedDetails.map((d) => d.itemNo || 0)) + 1
        : 1
    form.reset({
      ...createDefaultValues(nextItemNo),
      transferId: Hdform.getValues("transferId"),
      transferNo: Hdform.getValues("transferNo"),
    })
    focusFirstVisibleField()
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    _onCancelEdit?.()
    handleFormReset()
    toast.info("Edit cancelled")
  }

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

      // Populate code/name fields before creating rowData
      const populatedData = populateCodeNameFields(data)

      const rowData: ICbBankTransferCtmDt = {
        transferId: populatedData.transferId ?? "0",
        transferNo: populatedData.transferNo ?? "",
        itemNo: populatedData.itemNo ?? currentItemNo,
        seqNo: populatedData.seqNo ?? currentItemNo,

        // Job Order Fields
        jobOrderId: populatedData.jobOrderId ?? 0,
        jobOrderNo: populatedData.jobOrderNo ?? "",
        taskId: populatedData.taskId ?? 0,
        taskName: populatedData.taskName ?? "",
        serviceId: populatedData.serviceId ?? 0,
        serviceName: populatedData.serviceName ?? "",

        // To Bank Fields
        toBankId: populatedData.toBankId ?? 0,
        toBankCode: populatedData.toBankCode ?? "",
        toBankName: populatedData.toBankName ?? "",
        toCurrencyId: populatedData.toCurrencyId ?? 0,
        toCurrencyCode: populatedData.toCurrencyCode ?? "",
        toCurrencyName: populatedData.toCurrencyName ?? "",
        toExhRate: populatedData.toExhRate ?? 0,
        toBankChgGLId: populatedData.toBankChgGLId ?? 0,
        toBankChgGLCode: populatedData.toBankChgGLCode ?? "",
        toBankChgGLName: populatedData.toBankChgGLName ?? "",
        toBankChgAmt: populatedData.toBankChgAmt ?? 0,
        toBankChgLocalAmt: populatedData.toBankChgLocalAmt ?? 0,
        toTotAmt: populatedData.toTotAmt ?? 0,
        toTotLocalAmt: populatedData.toTotLocalAmt ?? 0,

        // Bank Exchange Fields
        bankExhRate: populatedData.bankExhRate ?? 0,
        bankTotAmt: populatedData.bankTotAmt ?? 0,
        bankTotLocalAmt: populatedData.bankTotLocalAmt ?? 0,

        editVersion: populatedData.editVersion ?? 0,
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
        handleFormReset()
        focusFirstVisibleField()
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

  // Common handler to calculate bank charges based on difference
  const calculateBankCharges = React.useCallback(() => {
    const bankExhRate = form.getValues("bankExhRate") || 0
    const toExhRate = form.getValues("toExhRate") || 0

    // Only calculate if bank exchange rate is set (user has entered it)
    if (bankExhRate === 0) {
      return
    }

    const bankTotLocalAmt = form.getValues("bankTotLocalAmt") || 0
    const toTotLocalAmt = form.getValues("toTotLocalAmt") || 0

    // Calculate difference and set to toBankChgLocalAmt
    const toBankChgLocalAmt = bankTotLocalAmt - toTotLocalAmt
    form.setValue("toBankChgLocalAmt", toBankChgLocalAmt)

    // Calculate toBankChgAmt if toExhRate is not zero
    if (toExhRate !== 0) {
      const toBankChgAmt = toBankChgLocalAmt / toExhRate
      form.setValue("toBankChgAmt", Number(toBankChgAmt.toFixed(amtDec)))
    } else {
      form.setValue("toBankChgAmt", 0)
    }
  }, [form, amtDec])

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

          // Calculate bank charges based on difference
          setTimeout(() => calculateBankCharges(), 0)
        }
      } else {
        form.setValue("toCurrencyId", 0, { shouldValidate: true })
        form.setValue("toExhRate", 0)
        form.setValue("toTotLocalAmt", 0)
        form.setValue("toBankChgLocalAmt", 0)
        form.setValue("toBankChgAmt", 0)
      }
    },
    [form, Hdform, exhRateDec, locAmtDec, calculateBankCharges]
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

      // Calculate bank charges based on difference
      setTimeout(() => calculateBankCharges(), 0)
    },
    [form, locAmtDec, calculateBankCharges]
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

      // Calculate bank charges based on difference
      setTimeout(() => calculateBankCharges(), 0)
    },
    [form, locAmtDec, calculateBankCharges]
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

      // Calculate bank charges based on difference
      setTimeout(() => calculateBankCharges(), 0)
    },
    [form, locAmtDec, calculateBankCharges]
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

      // Calculate bank charges based on difference
      setTimeout(() => calculateBankCharges(), 0)
    },
    [form, locAmtDec, calculateBankCharges]
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

            <JobOrderServiceAutocomplete
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
          isDisabled={true}
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
            onClick={handleFormReset}
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
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
