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
  ICbBatchPaymentDt,
  IChartofAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IJobOrderLookup,
  IPortLookup,
  IServiceLookup,
  ITaskLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBatchPaymentDtSchemaType,
  CbBatchPaymentHdSchemaType,
  cbBatchPaymentDtSchema,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BargeAutocomplete,
  ChartOfAccountAutocomplete,
  DepartmentAutocomplete,
  EmployeeAutocomplete,
  GSTAutocomplete,
  JobOrderAutocomplete,
  JobOrderServiceAutocomplete,
  JobOrderTaskAutocomplete,
  PortAutocomplete,
  VesselAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
import { DuplicateConfirmation } from "@/components/confirmation"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultBatchPaymentDetails } from "./cbbatchpayment-defaultvalues"

interface BatchPaymentDetailsFormProps {
  Hdform: UseFormReturn<CbBatchPaymentHdSchemaType>
  onAddRowAction?: (rowData: ICbBatchPaymentDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbBatchPaymentDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbBatchPaymentDtSchemaType[]
  defaultGlId?: number
  defaultUomId?: number
  defaultGstId?: number
}

export default function BatchPaymentDetailsForm({
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
}: BatchPaymentDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const _qtyDec = decimals[0]?.qtyDec || 2
  // State to manage job-specific vs department-specific rendering
  const [isJobSpecific, setIsJobSpecific] = useState(false)
  // State for duplicate confirmation dialog
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] =
    useState(false)
  const [pendingSubmitData, setPendingSubmitData] =
    useState<CbBatchPaymentDtSchemaType | null>(null)

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(
      ...existingDetails.map((d: CbBatchPaymentDtSchemaType) => d.itemNo || 0)
    )
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): CbBatchPaymentDtSchemaType => ({
    ...defaultBatchPaymentDetails,
    itemNo,
    seqNo: itemNo,
    glId: defaultGlId || defaultBatchPaymentDetails.glId,
    gstId: defaultGstId || defaultBatchPaymentDetails.gstId,
  })

  const form = useForm<CbBatchPaymentDtSchemaType>({
    resolver: zodResolver(cbBatchPaymentDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          paymentId: editingDetail.paymentId ?? "0",
          paymentNo: editingDetail.paymentNo ?? "",
          itemNo: editingDetail.itemNo ?? getNextItemNo(),
          seqNo: editingDetail.seqNo ?? getNextItemNo(),
          invoiceDate: editingDetail.invoiceDate ?? "",
          invoiceNo: editingDetail.invoiceNo ?? "",
          supplierName: editingDetail.supplierName ?? "",
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
          jobOrderId: editingDetail.jobOrderId ?? 0,
          jobOrderNo: editingDetail.jobOrderNo ?? "",
          taskId: editingDetail.taskId ?? 0,
          taskName: editingDetail.taskName ?? "",
          serviceId: editingDetail.serviceId ?? 0,
          serviceName: editingDetail.serviceName ?? "",
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
  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")
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
              (d: CbBatchPaymentDtSchemaType) => d.itemNo || 0
            )
          ) + 1

    if (editingDetail) {
      // Determine if editing detail is job-specific or department-specific
      // Infer initial mode from existing data
      const hasJobOrder = (editingDetail.jobOrderId ?? 0) > 0
      const hasDepartment = (editingDetail.departmentId ?? 0) > 0

      if (hasJobOrder) {
        setIsJobSpecific(true)
      } else if (hasDepartment) {
        setIsJobSpecific(false)
      } else {
        // Both are 0: Default to department mode
        // The Chart of Account autocomplete already has the COA data loaded
        // When it renders, it will trigger handleChartOfAccountChange if needed
        // which will auto-correct the mode based on the COA's isJobSpecific property
        setIsJobSpecific(false)
      }

      form.reset({
        paymentId: editingDetail.paymentId ?? "0",
        paymentNo: editingDetail.paymentNo ?? "",
        itemNo: editingDetail.itemNo ?? nextItemNo,
        seqNo: editingDetail.seqNo ?? nextItemNo,
        invoiceDate: editingDetail.invoiceDate ?? "",
        invoiceNo: editingDetail.invoiceNo ?? "",
        supplierName: editingDetail.supplierName ?? "",

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
        jobOrderId: editingDetail.jobOrderId ?? 0,
        jobOrderNo: editingDetail.jobOrderNo ?? "",
        taskId: editingDetail.taskId ?? 0,
        taskName: editingDetail.taskName ?? "",
        serviceId: editingDetail.serviceId ?? 0,
        serviceName: editingDetail.serviceName ?? "",
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

  // Process the submission (common logic for both direct submit and duplicate confirmation)
  const processSubmit = async (data: CbBatchPaymentDtSchemaType) => {
    try {
      // Use itemNo as the unique identifier
      const currentItemNo = data.itemNo || getNextItemNo()

      console.log("currentItemNo : ", currentItemNo)
      console.log("data : ", data)

      const rowData: ICbBatchPaymentDt = {
        paymentId: data.paymentId ?? "0",
        paymentNo: data.paymentNo ?? "",
        itemNo: data.itemNo ?? currentItemNo,
        seqNo: data.seqNo ?? currentItemNo,
        invoiceDate: data.invoiceDate
          ? format(
              parseDate(data.invoiceDate as string) || new Date(),
              clientDateFormat
            )
          : "",
        invoiceNo: data.invoiceNo ?? "",
        supplierName: data.supplierName ?? "",

        glId: data.glId ?? 0,
        glCode: data.glCode ?? "",
        glName: data.glName ?? "",

        totAmt: data.totAmt ?? 0,
        totLocalAmt: data.totLocalAmt ?? 0,
        totCtyAmt: data.totCtyAmt ?? 0,
        remarks: data.remarks ?? "",
        gstId: data.gstId ?? 0,
        gstName: data.gstName ?? "",
        gstPercentage: data.gstPercentage ?? 0,
        gstAmt: data.gstAmt ?? 0,
        gstLocalAmt: data.gstLocalAmt ?? 0,
        gstCtyAmt: data.gstCtyAmt ?? 0,

        departmentId: data.departmentId ?? 0,
        departmentCode: data.departmentCode ?? "",
        departmentName: data.departmentName ?? "",
        jobOrderId: data.jobOrderId ?? 0,
        jobOrderNo: data.jobOrderNo ?? "",
        taskId: data.taskId ?? 0,
        taskName: data.taskName ?? "",
        serviceId: data.serviceId ?? 0,
        serviceName: data.serviceName ?? "",
        employeeId: data.employeeId ?? 0,
        employeeCode: data.employeeCode ?? "",
        employeeName: data.employeeName ?? "",
        portId: data.portId ?? 0,
        portCode: data.portCode ?? "",
        portName: data.portName ?? "",
        vesselId: data.vesselId ?? 0,
        vesselCode: data.vesselCode ?? "",
        vesselName: data.vesselName ?? "",
        bargeId: data.bargeId ?? 0,
        bargeCode: data.bargeCode ?? "",
        bargeName: data.bargeName ?? "",
        voyageId: data.voyageId ?? 0,
        voyageNo: data.voyageNo ?? "",

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

  const onSubmit = async (data: CbBatchPaymentDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = cbBatchPaymentDtSchema(
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

      // Check for duplicate records
      const duplicateRecord = checkDuplicateRecord(data)
      if (duplicateRecord) {
        // Store the duplicate record and show confirmation dialog
        setPendingSubmitData(duplicateRecord)
        setShowDuplicateConfirmation(true)
        return
      }

      // No duplicates, proceed with submission
      await processSubmit(data)
    } catch (error) {
      console.error("Error in onSubmit:", error)
      toast.error("Failed to process submission")
    }
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Check for duplicate records based on invoiceDate, invoiceNo, and supplierName
  const checkDuplicateRecord = (
    data: CbBatchPaymentDtSchemaType
  ): CbBatchPaymentDtSchemaType | null => {
    if (existingDetails.length === 0) return null

    // Find if any existing record has the same invoiceDate, invoiceNo, and supplierName
    const duplicate = existingDetails.find(
      (detail: CbBatchPaymentDtSchemaType) =>
        detail.invoiceDate === data.invoiceDate &&
        detail.invoiceNo === data.invoiceNo &&
        detail.supplierName === data.supplierName &&
        detail.itemNo !== data.itemNo // Exclude the current record if editing
    )

    return duplicate || null
  }

  // Check for duplicates on field change
  const checkDuplicateOnChange = () => {
    const currentData = form.getValues()
    // Only check if all three fields have values
    if (
      currentData.invoiceDate &&
      currentData.invoiceNo &&
      currentData.supplierName
    ) {
      const duplicateRecord = checkDuplicateRecord(currentData)
      if (duplicateRecord) {
        setPendingSubmitData(duplicateRecord)
        setShowDuplicateConfirmation(true)
      }
    }
  }

  // Handle duplicate confirmation - keep data in form for user to modify
  const handleDuplicateConfirm = () => {
    // Don't submit - just keep the data in the form for user to modify
    setPendingSubmitData(null)
    toast.info("You can modify the data and submit again")
  }

  // Handle duplicate confirmation - cancel and reset form
  const handleDuplicateCancel = () => {
    setPendingSubmitData(null)
    const nextItemNo = getNextItemNo()
    form.reset(createDefaultValues(nextItemNo))
    toast.info("Form reset due to duplicate record")
  }

  // Handle chart of account selection
  const handleChartOfAccountChange = (
    selectedOption: IChartofAccountLookup | null
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

      // Reset dependent fields when switching between job-specific and department-specific
      // This prevents invalid data from being submitted
      if (!isJobSpecificAccount) {
        // Department-Specific: Reset job-related fields
        form.setValue("jobOrderId", 0, { shouldValidate: true })
        form.setValue("jobOrderNo", "")
        form.setValue("taskId", 0, { shouldValidate: true })
        form.setValue("taskName", "")
        form.setValue("serviceId", 0, { shouldValidate: true })
        form.setValue("serviceName", "")
      } else {
        // Job-Specific: Reset department field
        form.setValue("departmentId", 0, { shouldValidate: true })
        form.setValue("departmentCode", "")
        form.setValue("departmentName", "")
      }
    } else {
      // Clear COA and all related fields when account is cleared
      form.setValue("glId", 0, { shouldValidate: true })
      form.setValue("glCode", "")
      form.setValue("glName", "")

      // Clear all dimensional fields
      form.setValue("departmentId", 0, { shouldValidate: true })
      form.setValue("departmentCode", "")
      form.setValue("departmentName", "")

      form.setValue("jobOrderId", 0, { shouldValidate: true })
      form.setValue("jobOrderNo", "")
      form.setValue("taskId", 0, { shouldValidate: true })
      form.setValue("taskName", "")
      form.setValue("serviceId", 0, { shouldValidate: true })
      form.setValue("serviceName", "")

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

      // Reset to department mode by default
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

  // Handle job order selection
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

  // Handle task selection
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

  // Handle service selection
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
      form.setValue("serviceName", "")
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

  // Handle repeat last record
  const handleRepeatLastRecord = () => {
    if (existingDetails.length === 0) {
      toast.error("No records to repeat")
      return
    }

    // Get the last record
    const lastRecord = existingDetails[existingDetails.length - 1]
    const nextItemNo = getNextItemNo()

    // Determine if last record was job-specific or department-specific
    const hasJobOrder = (lastRecord.jobOrderId ?? 0) > 0
    const hasDepartment = (lastRecord.departmentId ?? 0) > 0

    if (hasJobOrder) {
      setIsJobSpecific(true)
    } else if (hasDepartment) {
      setIsJobSpecific(false)
    }

    // Reset form with last record data but clear all amounts and set next itemNo
    form.reset({
      paymentId: lastRecord.paymentId ?? "0",
      paymentNo: lastRecord.paymentNo ?? "",
      itemNo: nextItemNo,
      seqNo: nextItemNo,
      invoiceDate: lastRecord.invoiceDate ?? "",
      invoiceNo: lastRecord.invoiceNo ?? "",
      supplierName: lastRecord.supplierName ?? "",

      glId: lastRecord.glId ?? 0,
      glCode: lastRecord.glCode ?? "",
      glName: lastRecord.glName ?? "",

      // Clear all amounts
      totAmt: 0,
      totLocalAmt: 0,
      totCtyAmt: 0,
      remarks: lastRecord.remarks ?? "",
      gstId: lastRecord.gstId ?? 0,
      gstName: lastRecord.gstName ?? "",
      gstPercentage: lastRecord.gstPercentage ?? 0,
      // Clear GST amounts
      gstAmt: 0,
      gstLocalAmt: 0,
      gstCtyAmt: 0,

      departmentId: lastRecord.departmentId ?? 0,
      departmentCode: lastRecord.departmentCode ?? "",
      departmentName: lastRecord.departmentName ?? "",
      jobOrderId: lastRecord.jobOrderId ?? 0,
      jobOrderNo: lastRecord.jobOrderNo ?? "",
      taskId: lastRecord.taskId ?? 0,
      taskName: lastRecord.taskName ?? "",
      serviceId: lastRecord.serviceId ?? 0,
      serviceName: lastRecord.serviceName ?? "",
      employeeId: lastRecord.employeeId ?? 0,
      employeeCode: lastRecord.employeeCode ?? "",
      employeeName: lastRecord.employeeName ?? "",
      portId: lastRecord.portId ?? 0,
      portCode: lastRecord.portCode ?? "",
      portName: lastRecord.portName ?? "",
      vesselId: lastRecord.vesselId ?? 0,
      vesselCode: lastRecord.vesselCode ?? "",
      vesselName: lastRecord.vesselName ?? "",
      bargeId: lastRecord.bargeId ?? 0,
      bargeCode: lastRecord.bargeCode ?? "",
      bargeName: lastRecord.bargeName ?? "",
      voyageId: lastRecord.voyageId ?? 0,
      voyageNo: lastRecord.voyageNo ?? "",

      editVersion: 0,
    })

    toast.success("Last record loaded for repeat")
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
          className="-mt-2 mb-4 grid w-full grid-cols-7 gap-2 p-2"
        >
          {/* Section Header */}
          <div className="col-span-7 mb-1">
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

          {/* Invoice Date */}
          <CustomDateNew
            form={form}
            name="invoiceDate"
            label="Invoice Date"
            isRequired={true}
            onChangeEvent={checkDuplicateOnChange}
          />

          {/* Invoice No */}
          <CustomInput
            form={form}
            name="invoiceNo"
            label="Invoice No"
            isRequired={true}
            onChangeEvent={checkDuplicateOnChange}
          />

          {/* Supplier Name */}
          <CustomInput
            form={form}
            name="supplierName"
            label="Supplier Name"
            isRequired={true}
            onChangeEvent={checkDuplicateOnChange}
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

          {/* 
            CONDITIONAL RENDERING BASED ON CHART OF ACCOUNT TYPE
            =====================================================
            If Chart of Account is Job-Specific (isJobSpecific = true):
              - Shows: Job Order → Task → Service (cascading dropdowns)
              - Hides: Department
            
            If Chart of Account is Department-Specific (isJobSpecific = false):
              - Shows: Department
              - Hides: Job Order, Task, Service
            
            The isJobSpecific state is set by:
            1. Chart of Account selection (handleChartOfAccountChange)
            2. Edit mode detection (useEffect checking existing jobOrderId/departmentId)
          */}
          {isJobSpecific ? (
            <>
              {/* JOB-SPECIFIC MODE: Job Order → Task → Service */}
              {visible?.m_JobOrderId && (
                <JobOrderAutocomplete
                  form={form}
                  name="jobOrderId"
                  label="Job Order"
                  isRequired={required?.m_JobOrderId && isJobSpecific}
                  onChangeEvent={handleJobOrderChange}
                />
              )}

              {visible?.m_JobOrderId && (
                <JobOrderTaskAutocomplete
                  key={`task-${watchedJobOrderId}`}
                  form={form}
                  name="taskId"
                  jobOrderId={watchedJobOrderId || 0}
                  label="Task"
                  isRequired={required?.m_JobOrderId && isJobSpecific}
                  onChangeEvent={handleTaskChange}
                />
              )}

              {visible?.m_JobOrderId && (
                <JobOrderServiceAutocomplete
                  key={`service-${watchedJobOrderId}-${watchedTaskId}`}
                  form={form}
                  name="serviceId"
                  jobOrderId={watchedJobOrderId || 0}
                  taskId={watchedTaskId || 0}
                  label="Service"
                  isRequired={required?.m_JobOrderId && isJobSpecific}
                  onChangeEvent={handleServiceChange}
                />
              )}
            </>
          ) : (
            <>
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
            </>
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
              onClick={() => {
                const nextItemNo = getNextItemNo()
                form.reset(createDefaultValues(nextItemNo))
                toast.info("Form reset")
              }}
            >
              Reset
            </Button>
            {existingDetails.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRepeatLastRecord}
              >
                Repeat
              </Button>
            )}
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

      {/* Duplicate Confirmation */}
      <DuplicateConfirmation
        open={showDuplicateConfirmation}
        onOpenChange={setShowDuplicateConfirmation}
        onConfirm={handleDuplicateConfirm}
        onCancel={handleDuplicateCancel}
        duplicateInfo={
          pendingSubmitData
            ? {
                invoiceDate:
                  pendingSubmitData.invoiceDate instanceof Date
                    ? format(pendingSubmitData.invoiceDate, clientDateFormat)
                    : typeof pendingSubmitData.invoiceDate === "string"
                      ? format(
                          parseDate(pendingSubmitData.invoiceDate) ||
                            new Date(),
                          clientDateFormat
                        )
                      : "",
                invoiceNo: pendingSubmitData.invoiceNo,
                supplierName: pendingSubmitData.supplierName,
                glCode: pendingSubmitData.glCode,
                glName: pendingSubmitData.glName,
                totAmt: pendingSubmitData.totAmt,
                totLocalAmt: pendingSubmitData.totLocalAmt,
                gstPercentage: pendingSubmitData.gstPercentage,
                gstAmt: pendingSubmitData.gstAmt,
                remarks: pendingSubmitData.remarks,
              }
            : undefined
        }
      />
    </>
  )
}
