"use client"

import { useEffect, useState } from "react"
import {
  handleGstPercentageChange,
  handleQtyChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import {
  IBargeLookup,
  ICbGenPaymentDt,
  IChartOfAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IPortLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchemaType,
  cbGenPaymentDtSchema,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BargeAutocomplete,
  ChartOfAccountAutocomplete,
  DepartmentAutocomplete,
  EmployeeAutocomplete,
  GSTAutocomplete,
  PortAutocomplete,
  VesselAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultGenPaymentDetails } from "./cbgenpayment-defaultvalues"

interface GenPaymentDetailsFormProps {
  Hdform: UseFormReturn<CbGenPaymentHdSchemaType>
  onAddRowAction?: (rowData: ICbGenPaymentDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbGenPaymentDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbGenPaymentDtSchemaType[]
  defaultGlId?: number
  defaultUomId?: number
  defaultGstId?: number
}

export default function GenPaymentDetailsForm({
  Hdform,
  onAddRowAction,
  onCancelEdit: _onCancelEdit,
  editingDetail,
  visible,
  required,
  companyId,
  existingDetails = [],
  defaultGlId = 0,
  defaultUomId = 0,
  defaultGstId = 0,
}: GenPaymentDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const _qtyDec = decimals[0]?.qtyDec || 2
  // State to manage job-specific vs department-specific rendering
  const [isJobSpecific, setIsJobSpecific] = useState(false)

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(
      ...existingDetails.map((d: CbGenPaymentDtSchemaType) => d.itemNo || 0)
    )
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): CbGenPaymentDtSchemaType => ({
    ...defaultGenPaymentDetails,
    itemNo,
    seqNo: itemNo,
    glId: defaultGlId || defaultGenPaymentDetails.glId,
    gstId: defaultGstId || defaultGenPaymentDetails.gstId,
  })

  const form = useForm<CbGenPaymentDtSchemaType>({
    resolver: zodResolver(cbGenPaymentDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          paymentId: editingDetail.paymentId ?? "0",
          paymentNo: editingDetail.paymentNo ?? "",
          itemNo: editingDetail.itemNo ?? getNextItemNo(),
          seqNo: editingDetail.seqNo ?? getNextItemNo(),
          glId: editingDetail.glId ?? 0,
          glCode: editingDetail.glCode ?? "",
          glName: editingDetail.glName ?? "",
          totAmt: editingDetail.totAmt ?? 0,
          totLocalAmt: editingDetail.totLocalAmt ?? 0,
          totCtyAmt: editingDetail.totCtyAmt ?? 0,
          remarks: editingDetail.remarks ?? "",
          gstId: editingDetail.gstId ?? 0,
          gstName: editingDetail.gstName ?? "",
          gstPercentage: editingDetail.gstPercentage ?? 0,
          gstAmt: editingDetail.gstAmt ?? 0,
          gstLocalAmt: editingDetail.gstLocalAmt ?? 0,
          gstCtyAmt: editingDetail.gstCtyAmt ?? 0,
          departmentId: editingDetail.departmentId ?? 0,
          departmentCode: editingDetail.departmentCode ?? "",
          departmentName: editingDetail.departmentName ?? "",

          employeeId: editingDetail.employeeId ?? 0,
          employeeCode: editingDetail.employeeCode ?? "",
          employeeName: editingDetail.employeeName ?? "",
          portId: editingDetail.portId ?? 0,
          portCode: editingDetail.portCode ?? "",
          portName: editingDetail.portName ?? "",
          vesselId: editingDetail.vesselId ?? 0,
          vesselCode: editingDetail.vesselCode ?? "",
          vesselName: editingDetail.vesselName ?? "",
          bargeId: editingDetail.bargeId ?? 0,
          bargeCode: editingDetail.bargeCode ?? "",
          bargeName: editingDetail.bargeName ?? "",
          voyageId: editingDetail.voyageId ?? 0,
          voyageNo: editingDetail.voyageNo ?? "",
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Watch form values to trigger re-renders when they change
  const watchedExchangeRate = Hdform.watch("exhRate")
  const watchedCityExchangeRate = Hdform.watch("ctyExhRate")

  // Set default glId and gstId when defaults become available (not in edit mode)
  useEffect(() => {
    if (!editingDetail) {
      const currentGlId = form.getValues("glId")
      const currentGstId = form.getValues("gstId")

      // Only set defaults if current values are 0 and defaults are available
      if (defaultGlId > 0 && (!currentGlId || currentGlId === 0)) {
        form.setValue("glId", defaultGlId)
      }
      if (defaultGstId > 0 && (!currentGstId || currentGstId === 0)) {
        form.setValue("gstId", defaultGstId)
        // Trigger GST percentage calculation after setting default GST
        setGSTPercentage(Hdform, form, decimals[0], visible)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGlId, defaultGstId, editingDetail])

  // Recalculate local amounts when exchange rate changes
  useEffect(() => {
    const currentValues = form.getValues()

    // Only recalculate if form has values
    if ((currentValues.totAmt ?? 0) > 0) {
      const rowData = form.getValues()

      // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
      if (!visible?.m_CtyCurr) {
        Hdform.setValue("ctyExhRate", watchedExchangeRate)
      }

      // Recalculate all amounts with new exchange rate
      handleQtyChange(Hdform, rowData, decimals[0], visible)

      // Update form with recalculated values
      form.setValue("totLocalAmt", rowData.totLocalAmt)
      form.setValue("totCtyAmt", rowData.totCtyAmt)
      form.setValue("gstLocalAmt", rowData.gstLocalAmt)
      form.setValue("gstCtyAmt", rowData.gstCtyAmt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedExchangeRate, watchedCityExchangeRate])

  // Reset form when editingDetail changes
  useEffect(() => {
    const nextItemNo =
      existingDetails.length === 0
        ? 1
        : Math.max(
            ...existingDetails.map(
              (d: CbGenPaymentDtSchemaType) => d.itemNo || 0
            )
          ) + 1

    if (editingDetail) {
      // Infer initial mode from existing data
      form.reset({
        paymentId: editingDetail.paymentId ?? "0",
        paymentNo: editingDetail.paymentNo ?? "",
        itemNo: editingDetail.itemNo ?? nextItemNo,
        seqNo: editingDetail.seqNo ?? nextItemNo,
        glId: editingDetail.glId ?? 0,
        glCode: editingDetail.glCode ?? "",
        glName: editingDetail.glName ?? "",

        totAmt: editingDetail.totAmt ?? 0,
        totLocalAmt: editingDetail.totLocalAmt ?? 0,
        totCtyAmt: editingDetail.totCtyAmt ?? 0,
        remarks: editingDetail.remarks ?? "",
        gstId: editingDetail.gstId ?? 0,
        gstName: editingDetail.gstName ?? "",
        gstPercentage: editingDetail.gstPercentage ?? 0,
        gstAmt: editingDetail.gstAmt ?? 0,
        gstLocalAmt: editingDetail.gstLocalAmt ?? 0,
        gstCtyAmt: editingDetail.gstCtyAmt ?? 0,

        departmentId: editingDetail.departmentId ?? 0,
        departmentCode: editingDetail.departmentCode ?? "",
        departmentName: editingDetail.departmentName ?? "",

        employeeId: editingDetail.employeeId ?? 0,
        employeeCode: editingDetail.employeeCode ?? "",
        employeeName: editingDetail.employeeName ?? "",
        portId: editingDetail.portId ?? 0,
        portCode: editingDetail.portCode ?? "",
        portName: editingDetail.portName ?? "",
        vesselId: editingDetail.vesselId ?? 0,
        vesselCode: editingDetail.vesselCode ?? "",
        vesselName: editingDetail.vesselName ?? "",
        bargeId: editingDetail.bargeId ?? 0,
        bargeCode: editingDetail.bargeCode ?? "",
        bargeName: editingDetail.bargeName ?? "",
        voyageId: editingDetail.voyageId ?? 0,
        voyageNo: editingDetail.voyageNo ?? "",

        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      // New record - reset to defaults
      form.reset(createDefaultValues(nextItemNo))
      setIsJobSpecific(false) // Default to department-specific for new records
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail, existingDetails.length])

  // Helper function to populate code/name fields from lookup data
  const populateCodeNameFields = (data: CbGenPaymentDtSchemaType) => {
    // Populate glCode and glName
    if (data.glId && data.glId > 0) {
      // This would need to be implemented based on your chart of account lookup data
      // For now, keeping existing values
    }

    // Populate gstName
    if (data.gstId && data.gstId > 0) {
      // This would need to be implemented based on your GST lookup data
      // For now, keeping existing values
    }

    // Populate departmentCode and departmentName
    if (data.departmentId && data.departmentId > 0) {
      // This would need to be implemented based on your department lookup data
      // For now, keeping existing values
    }

    // Populate employeeCode and employeeName
    if (data.employeeId && data.employeeId > 0) {
      // This would need to be implemented based on your employee lookup data
      // For now, keeping existing values
    }

    // Populate portCode and portName
    if (data.portId && data.portId > 0) {
      // This would need to be implemented based on your port lookup data
      // For now, keeping existing values
    }

    // Populate vesselCode and vesselName
    if (data.vesselId && data.vesselId > 0) {
      // This would need to be implemented based on your vessel lookup data
      // For now, keeping existing values
    }

    // Populate bargeCode and bargeName
    if (data.bargeId && data.bargeId > 0) {
      // This would need to be implemented based on your barge lookup data
      // For now, keeping existing values
    }

    // Populate voyageNo
    if (data.voyageId && data.voyageId > 0) {
      // This would need to be implemented based on your voyage lookup data
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
    const nextItemNo = getNextItemNo()
    form.reset(createDefaultValues(nextItemNo))
    focusFirstVisibleField()
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    _onCancelEdit?.()
    handleFormReset()
    toast.info("Edit cancelled")
  }

  const onSubmit = async (data: CbGenPaymentDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = cbGenPaymentDtSchema(
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

      const rowData: ICbGenPaymentDt = {
        paymentId: populatedData.paymentId ?? "0",
        paymentNo: populatedData.paymentNo ?? "",
        itemNo: populatedData.itemNo ?? currentItemNo,
        seqNo: populatedData.seqNo ?? currentItemNo,

        glId: populatedData.glId ?? 0,
        glCode: populatedData.glCode ?? "",
        glName: populatedData.glName ?? "",

        totAmt: populatedData.totAmt ?? 0,
        totLocalAmt: populatedData.totLocalAmt ?? 0,
        totCtyAmt: populatedData.totCtyAmt ?? 0,
        remarks: populatedData.remarks ?? "",
        gstId: populatedData.gstId ?? 0,
        gstName: populatedData.gstName ?? "",
        gstPercentage: populatedData.gstPercentage ?? 0,
        gstAmt: populatedData.gstAmt ?? 0,
        gstLocalAmt: populatedData.gstLocalAmt ?? 0,
        gstCtyAmt: populatedData.gstCtyAmt ?? 0,

        departmentId: populatedData.departmentId ?? 0,
        departmentCode: populatedData.departmentCode ?? "",
        departmentName: populatedData.departmentName ?? "",

        employeeId: populatedData.employeeId ?? 0,
        employeeCode: populatedData.employeeCode ?? "",
        employeeName: populatedData.employeeName ?? "",
        portId: populatedData.portId ?? 0,
        portCode: populatedData.portCode ?? "",
        portName: populatedData.portName ?? "",
        vesselId: populatedData.vesselId ?? 0,
        vesselCode: populatedData.vesselCode ?? "",
        vesselName: populatedData.vesselName ?? "",
        bargeId: populatedData.bargeId ?? 0,
        bargeCode: populatedData.bargeCode ?? "",
        bargeName: populatedData.bargeName ?? "",
        voyageId: populatedData.voyageId ?? 0,
        voyageNo: populatedData.voyageNo ?? "",

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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Handle chart of account selection
  const handleChartOfAccountChange = (
    selectedOption: IChartOfAccountLookup | null
  ) => {
    if (selectedOption) {
      form.setValue("glId", selectedOption.glId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("glCode", selectedOption.glCode || "")
      form.setValue("glName", selectedOption.glName || "")

      // CRITICAL: Use the actual isJobSpecific property from the chart of account data
      // This determines which fields will be shown/required
      const isJobSpecificAccount = selectedOption.isJobSpecific || false

      setIsJobSpecific(isJobSpecificAccount)
    } else {
      // Clear COA and all related fields
      form.setValue("glId", 0, { shouldValidate: true })
      form.setValue("glCode", "")
      form.setValue("glName", "")
      form.setValue("departmentId", 0, { shouldValidate: true })
      form.setValue("departmentCode", "")
      form.setValue("departmentName", "")
      form.setValue("employeeId", 0, { shouldValidate: true })
      form.setValue("employeeCode", "")
      form.setValue("employeeName", "")
      form.setValue("portId", 0, { shouldValidate: true })
      form.setValue("portCode", "")
      form.setValue("portName", "")
      form.setValue("vesselId", 0, { shouldValidate: true })
      form.setValue("vesselCode", "")
      form.setValue("vesselName", "")
      form.setValue("bargeId", 0, { shouldValidate: true })
      form.setValue("bargeCode", "")
      form.setValue("bargeName", "")
      form.setValue("voyageId", 0, { shouldValidate: true })
      form.setValue("voyageNo", "")
      setIsJobSpecific(false)
    }
  }

  const handleGSTChange = async (selectedOption: IGstLookup | null) => {
    if (selectedOption) {
      form.setValue("gstId", selectedOption.gstId)
      form.setValue("gstName", selectedOption.gstName || "")
      await setGSTPercentage(Hdform, form, decimals[0], visible)
    } else {
      // Clear GST fields
      form.setValue("gstId", 0, { shouldValidate: true })
      form.setValue("gstName", "")
      form.setValue("gstPercentage", 0)
      form.setValue("gstAmt", 0)
      form.setValue("gstLocalAmt", 0)
      form.setValue("gstCtyAmt", 0)
    }
  }

  // Handle department selection
  const handleDepartmentChange = (selectedOption: IDepartmentLookup | null) => {
    if (selectedOption) {
      form.setValue("departmentId", selectedOption.departmentId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("departmentCode", selectedOption.departmentCode || "")
      form.setValue("departmentName", selectedOption.departmentName || "")
    } else {
      // Clear department fields
      form.setValue("departmentId", 0, { shouldValidate: true })
      form.setValue("departmentCode", "")
      form.setValue("departmentName", "")
    }
  }

  // Handle employee selection
  const handleEmployeeChange = (selectedOption: IEmployeeLookup | null) => {
    if (selectedOption) {
      form.setValue("employeeId", selectedOption.employeeId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("employeeCode", selectedOption.employeeCode || "")
      form.setValue("employeeName", selectedOption.employeeName || "")
    } else {
      // Clear employee fields
      form.setValue("employeeId", 0, { shouldValidate: true })
      form.setValue("employeeCode", "")
      form.setValue("employeeName", "")
    }
  }

  // Handle barge selection
  const handleBargeChange = (selectedOption: IBargeLookup | null) => {
    if (selectedOption) {
      form.setValue("bargeId", selectedOption.bargeId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("bargeCode", selectedOption.bargeCode || "")
      form.setValue("bargeName", selectedOption.bargeName || "")
    } else {
      // Clear barge fields
      form.setValue("bargeId", 0, { shouldValidate: true })
      form.setValue("bargeCode", "")
      form.setValue("bargeName", "")
    }
  }

  // Handle Port selection
  const handlePortChange = (selectedOption: IPortLookup | null) => {
    if (selectedOption) {
      form.setValue("portId", selectedOption.portId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("portCode", selectedOption.portCode || "")
      form.setValue("portName", selectedOption.portName || "")
    } else {
      // Clear port fields
      form.setValue("portId", 0, { shouldValidate: true })
      form.setValue("portCode", "")
      form.setValue("portName", "")
    }
  }

  // Handle Vessel selection
  const handleVesselChange = (selectedOption: IVesselLookup | null) => {
    if (selectedOption) {
      form.setValue("vesselId", selectedOption.vesselId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("vesselCode", selectedOption.vesselCode || "")
      form.setValue("vesselName", selectedOption.vesselName || "")
    } else {
      // Clear vessel fields
      form.setValue("vesselId", 0, { shouldValidate: true })
      form.setValue("vesselCode", "")
      form.setValue("vesselName", "")
    }
  }

  // Handle Voyage selection
  const handleVoyageChange = (selectedOption: IVoyageLookup | null) => {
    if (selectedOption) {
      form.setValue("voyageId", selectedOption.voyageId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("voyageNo", selectedOption.voyageNo || "")
    } else {
      // Clear voyage fields
      form.setValue("voyageId", 0, { shouldValidate: true })
      form.setValue("voyageNo", "")
    }
  }

  // ============================================================================
  // CALCULATION HANDLERS
  // ============================================================================

  const triggerTotalAmountCalculation = () => {
    const rowData = form.getValues()

    // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
    const exchangeRate = Hdform.getValues("exhRate") || 0
    if (!visible?.m_CtyCurr) {
      Hdform.setValue("ctyExhRate", exchangeRate)
    }

    handleTotalamountChange(Hdform, rowData, decimals[0], visible)
    // Update only the calculated fields
    form.setValue("totLocalAmt", rowData.totLocalAmt)
    form.setValue("totCtyAmt", rowData.totCtyAmt)
    form.setValue("gstAmt", rowData.gstAmt)
    form.setValue("gstLocalAmt", rowData.gstLocalAmt)
    form.setValue("gstCtyAmt", rowData.gstCtyAmt)
  }

  const triggerGstCalculation = () => {
    const rowData = form.getValues()

    // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
    const exchangeRate = Hdform.getValues("exhRate") || 0
    if (!visible?.m_CtyCurr) {
      Hdform.setValue("ctyExhRate", exchangeRate)
    }

    handleGstPercentageChange(Hdform, rowData, decimals[0], visible)
    // Update only the calculated fields
    form.setValue("gstAmt", rowData.gstAmt)
    form.setValue("gstLocalAmt", rowData.gstLocalAmt)
    form.setValue("gstCtyAmt", rowData.gstCtyAmt)
  }

  const handleTotalAmountChange = (value: number) => {
    form.setValue("totAmt", value)
    triggerTotalAmountCalculation()
  }

  const handleGstPercentageManualChange = (value: number) => {
    form.setValue("gstPercentage", value)
    triggerGstCalculation()
  }

  const handleGstAmountChange = (value: number) => {
    form.setValue("gstAmt", value)
  }

  return (
    <>
      {/* Display form errors */}
      {Object.keys(form.formState.errors).length > 0 && (
        <div className="mx-2 mb-2 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="mb-1 font-semibold text-red-800">
            Please fix the following errors:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <li key={field}>
                <span className="font-medium capitalize">{field}:</span>{" "}
                {error?.message?.toString() || "Invalid value"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="-mt-2 mb-4 grid w-full grid-cols-8 gap-1 p-2"
        >
          {/* Section Header */}
          <div className="col-span-8 mb-1">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={`px-3 py-1 text-sm font-medium ${
                  editingDetail
                    ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {editingDetail
                  ? `Details (Edit Mode - Item No. ${editingDetail.itemNo})`
                  : "Details (Add New)"}
              </Badge>
            </div>
          </div>
          {/* Item No */}
          <CustomNumberInput
            form={form}
            name="itemNo"
            label="Item No"
            round={0}
            className="text-right"
            isDisabled={true}
          />

          {/* Chart Of Account */}
          <ChartOfAccountAutocomplete
            form={form}
            name="glId"
            label="Chart Of Account"
            isRequired={required?.m_GLId}
            onChangeEvent={handleChartOfAccountChange}
            companyId={companyId}
          />

          {/* DEPARTMENT-SPECIFIC MODE: Department only */}
          {visible?.m_DepartmentId && (
            <DepartmentAutocomplete
              form={form}
              name="departmentId"
              label="Department"
              isRequired={required?.m_DepartmentId && !isJobSpecific}
              onChangeEvent={handleDepartmentChange}
            />
          )}

          {/* Employee */}
          {visible?.m_EmployeeId && (
            <EmployeeAutocomplete
              form={form}
              name="employeeId"
              label="Employee"
              isRequired={required?.m_EmployeeId}
              onChangeEvent={handleEmployeeChange}
            />
          )}

          {/* Barge */}
          {visible?.m_BargeId && (
            <BargeAutocomplete
              form={form}
              name="bargeId"
              label="Barge"
              isRequired={required?.m_BargeId}
              onChangeEvent={handleBargeChange}
            />
          )}

          {/* Port */}
          {visible?.m_PortId && (
            <PortAutocomplete
              form={form}
              name="portId"
              label="Port"
              isRequired={required?.m_PortId}
              onChangeEvent={handlePortChange}
            />
          )}

          {/* Barge */}
          {visible?.m_VesselId && (
            <VesselAutocomplete
              form={form}
              name="vesselId"
              label="Vessel"
              isRequired={required?.m_VesselId}
              onChangeEvent={handleVesselChange}
            />
          )}

          {/* Voyage */}
          {visible?.m_VoyageId && (
            <VoyageAutocomplete
              form={form}
              name="voyageId"
              label="Voyage"
              isRequired={required?.m_VoyageId}
              onChangeEvent={handleVoyageChange}
            />
          )}

          {/* Total Amount */}
          <CustomNumberInput
            form={form}
            name="totAmt"
            label="Total Amount"
            isRequired={required?.m_TotAmt}
            round={amtDec}
            className="text-right"
            onChangeEvent={handleTotalAmountChange}
          />

          {/* Local Amount */}
          <CustomNumberInput
            form={form}
            name="totLocalAmt"
            label="Total Local Amount"
            round={locAmtDec}
            className="text-right"
            isDisabled={true}
          />

          {/* GST */}
          {visible?.m_GstId && (
            <GSTAutocomplete
              form={form}
              name="gstId"
              label="GST"
              isRequired={required?.m_GstId}
              onChangeEvent={handleGSTChange}
            />
          )}

          {/* GST Percentage */}
          <CustomNumberInput
            form={form}
            name="gstPercentage"
            label="GST Percentage"
            round={2}
            className="text-right"
            onChangeEvent={handleGstPercentageManualChange}
          />

          {/* GST Amount */}
          <CustomNumberInput
            form={form}
            name="gstAmt"
            label="GST Amount"
            round={amtDec}
            isDisabled
            className="col-span-1 text-right"
            onChangeEvent={handleGstAmountChange}
          />

          {/* GST Local Amount */}
          <CustomNumberInput
            form={form}
            name="gstLocalAmt"
            label="GST Local Amount"
            round={locAmtDec}
            className="col-span-1 text-right"
            isDisabled={true}
          />

          {/* Remarks */}
          {visible?.m_Remarks && (
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isRequired={required?.m_Remarks}
              className="col-span-1"
              minRows={2}
              maxRows={6}
            />
          )}

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
    </>
  )
}
