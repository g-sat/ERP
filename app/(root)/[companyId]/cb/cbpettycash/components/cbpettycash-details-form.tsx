"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  handleGstPercentageChange,
  handleQtyChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import { ICbPettyCashDt } from "@/interfaces"
import {
  IBargeLookup,
  IChartOfAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IJobOrderLookup,
  IPortLookup,
  IServiceLookup,
  IServiceTypeLookup,
  ITaskLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbPettyCashDtSchema,
  CbPettyCashDtSchemaType,
  CbPettyCashHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { useChartOfAccountLookup, useGstLookup } from "@/hooks/use-lookup"
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
  ServiceTypeAutocomplete,
  VesselAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
import { DuplicateConfirmation } from "@/components/confirmation/duplicate-confirmation"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { getDefaultValues } from "./cbPettyCash-defaultvalues"

interface CbPettyCashDetailsFormProps {
  Hdform: UseFormReturn<CbPettyCashHdSchemaType>
  onAddRowAction?: (rowData: ICbPettyCashDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbPettyCashDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbPettyCashDtSchemaType[]
  defaultGlId?: number
  defaultGstId?: number
  isCancelled?: boolean
}

export default function CbPettyCashDetailsForm({
  Hdform,
  onAddRowAction,
  onCancelEdit: _onCancelEdit,
  editingDetail,
  visible,
  required,
  companyId,
  existingDetails = [],
  defaultGlId = 0,
  defaultGstId = 0,
  isCancelled = false,
}: CbPettyCashDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )
  const defaultCbPettyCashDetails = useMemo(
    () => getDefaultValues(dateFormat).defaultCbPettyCashDetails,
    [dateFormat]
  )

  // State to manage job-specific vs department-specific rendering
  const [isJobSpecific, setIsJobSpecific] = useState(false)
  // State for duplicate confirmation dialog
  const [showDuplicateConfirmation, setShowDuplicateConfirmation] =
    useState(false)
  const [pendingSubmitData, setPendingSubmitData] =
    useState<CbPettyCashDtSchemaType | null>(null)

  // Track if submit was attempted to show errors only after submit
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Refs to store original values on focus for comparison on change
  const originalTotAmtRef = useRef<number>(0)
  const originalGstPercentageRef = useRef<number>(0)

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): CbPettyCashDtSchemaType => {
    // Use defaults if available, otherwise use defaultCbPettyCashDetails values
    const glId =
      defaultGlId && defaultGlId > 0
        ? defaultGlId
        : defaultCbPettyCashDetails.glId
    const gstId =
      defaultGstId && defaultGstId > 0
        ? defaultGstId
        : defaultCbPettyCashDetails.gstId

    return {
      ...defaultCbPettyCashDetails,
      itemNo,
      seqNo: itemNo,
      glId,
      gstId,
    }
  }

  const form = useForm<CbPettyCashDtSchemaType>({
    resolver: zodResolver(CbPettyCashDtSchema(required, visible)),
    mode: "onSubmit",
    reValidateMode: "onChange",
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
          invoiceDate: editingDetail.invoiceDate ?? "",
          invoiceNo: editingDetail.invoiceNo ?? "",
          supplierName: editingDetail.supplierName ?? "",
          jobOrderId: editingDetail.jobOrderId ?? 0,
          jobOrderNo: editingDetail.jobOrderNo ?? "",
          taskId: editingDetail.taskId ?? 0,
          taskName: editingDetail.taskName ?? "",
          serviceId: editingDetail.serviceId ?? 0,
          serviceName: editingDetail.serviceName ?? "",
          serviceTypeId: editingDetail.serviceTypeId ?? 0,
          serviceTypeName: editingDetail.serviceTypeName ?? "",
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Fetch lookup data for autocomplete fields
  const { data: chartOfAccounts } = useChartOfAccountLookup(companyId)
  const { data: gsts } = useGstLookup()

  // Function to populate code/name fields from lookup data
  const populateCodeNameFields = (
    formData: CbPettyCashDtSchemaType
  ): CbPettyCashDtSchemaType => {
    const populatedData = { ...formData }

    // Populate GL code/name if glId is set
    if (populatedData.glId && populatedData.glId > 0) {
      const glData = chartOfAccounts?.find(
        (gl: IChartOfAccountLookup) => gl.glId === populatedData.glId
      )
      if (glData) {
        populatedData.glCode = glData.glCode || ""
        populatedData.glName = glData.glName || ""
      }
    }

    // Populate GST name if gstId is set
    if (populatedData.gstId && populatedData.gstId > 0) {
      const gstData = gsts?.find(
        (gst: IGstLookup) => gst.gstId === populatedData.gstId
      )
      if (gstData) {
        populatedData.gstName = gstData.gstName || ""
      }
    }

    return populatedData
  }

  // Function to focus on the first visible field after form operations
  const focusFirstVisibleField = () => {
    setTimeout(() => {
      if (visible?.m_ProductId) {
        const productSelect = document.querySelector(
          `div[class*="react-select__control"] input[aria-label*="productId"]`
        ) as HTMLInputElement
        if (productSelect) {
          productSelect.focus()
        } else {
          const firstSelectInput = document.querySelector(
            'div[class*="react-select__control"] input'
          ) as HTMLInputElement
          if (firstSelectInput) {
            firstSelectInput.focus()
          }
        }
      } else {
        const glSelect = document.querySelector(
          `div[class*="react-select__control"] input[aria-label*="glId"]`
        ) as HTMLInputElement
        if (glSelect) {
          glSelect.focus()
        } else {
          const firstSelectInput = document.querySelector(
            'div[class*="react-select__control"] input'
          ) as HTMLInputElement
          if (firstSelectInput) {
            firstSelectInput.focus()
          }
        }
      }
    }, 300)
  }

  // Handler for cancel edit
  const handleCancelEdit = () => {
    _onCancelEdit?.()
    const nextItemNo = getNextItemNo()
    const defaultValues = createDefaultValues(nextItemNo)
    const populatedValues = populateCodeNameFields(defaultValues)
    form.reset(populatedValues)
    // Reset submit attempted flag when canceling
    setSubmitAttempted(false)
    toast.info("Detail cancelled")
    focusFirstVisibleField()
  }

  // Watch form values to trigger re-renders when they change
  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")
  const watchedExchangeRate = Hdform.watch("exhRate")
  const watchedCityExchangeRate = Hdform.watch("ctyExhRate")

  // Apply default IDs when they become available (only for new records)
  useEffect(() => {
    if (editingDetail) return // Skip for edit mode

    // Wait a bit to ensure form is reset before applying defaults
    const timeoutId = setTimeout(() => {
      const currentGlId = form.getValues("glId")
      const currentGstId = form.getValues("gstId")

      // Set default GL ID if not already set
      if (
        defaultGlId &&
        defaultGlId > 0 &&
        (!currentGlId || currentGlId === 0)
      ) {
        form.setValue("glId", defaultGlId, { shouldValidate: false })
      }

      // Set default GST ID if not already set
      if (
        defaultGstId &&
        defaultGstId > 0 &&
        (!currentGstId || currentGstId === 0)
      ) {
        form.setValue("gstId", defaultGstId, { shouldValidate: false })
      }
    }, 100)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGlId, defaultGstId, editingDetail, existingDetails.length])

  // Populate code/name fields when defaults are applied (only for new records)
  useEffect(() => {
    if (editingDetail) return // Skip for edit mode

    const currentGlId = form.getValues("glId")
    const currentGstId = form.getValues("gstId")

    // Populate GL code/name if glId is set and code/name are empty
    if (currentGlId && currentGlId > 0 && !form.getValues("glCode")) {
      const glData = chartOfAccounts?.find(
        (gl: IChartOfAccountLookup) => gl.glId === currentGlId
      )
      if (glData) {
        form.setValue("glCode", glData.glCode || "")
        form.setValue("glName", glData.glName || "")
      }
    }

    // Populate GST name if gstId is set and name is empty
    if (currentGstId && currentGstId > 0 && !form.getValues("gstName")) {
      const gstData = gsts?.find(
        (gst: IGstLookup) => gst.gstId === currentGstId
      )
      if (gstData) {
        form.setValue("gstName", gstData.gstName || "")
        // Trigger GST percentage calculation after setting default GST
        setGSTPercentage(Hdform, form, decimals[0], visible)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartOfAccounts, gsts, editingDetail, defaultGlId, defaultGstId])

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
        : Math.max(...existingDetails.map((d) => d.itemNo || 0)) + 1

    if (editingDetail) {
      // Determine if editing detail is job-specific or department-specific
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
        invoiceDate: editingDetail.invoiceDate ?? "",
        invoiceNo: editingDetail.invoiceNo ?? "",
        supplierName: editingDetail.supplierName ?? "",
        jobOrderId: editingDetail.jobOrderId ?? 0,
        jobOrderNo: editingDetail.jobOrderNo ?? "",
        taskId: editingDetail.taskId ?? 0,
        taskName: editingDetail.taskName ?? "",
        serviceId: editingDetail.serviceId ?? 0,
        serviceName: editingDetail.serviceName ?? "",
        serviceTypeId: editingDetail.serviceTypeId ?? 0,
        serviceTypeName: editingDetail.serviceTypeName ?? "",
        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      // New record - reset to defaults with proper default values
      const defaultValues = createDefaultValues(nextItemNo)
      form.reset(defaultValues)

      // Reset submit attempted flag when creating new record
      setSubmitAttempted(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail, existingDetails.length])

  const onSubmit = async (data: CbPettyCashDtSchemaType) => {
    try {
      console.log("data : ", data)
      // Trigger validation - React Hook Form will validate automatically via zodResolver
      // but we'll also validate manually to ensure all errors are caught
      const isValid = await form.trigger()

      if (!isValid) {
        // Validation failed - React Hook Form will display errors automatically
        const errors = form.formState.errors
        const errorFields = Object.keys(errors)
        const errorMessages = errorFields
          .map((field) => {
            const error = errors[field as keyof typeof errors]
            return error?.message || `${field} is invalid`
          })
          .filter(Boolean)

        if (errorMessages.length > 0) {
          toast.error(
            `Please fix validation errors: ${errorMessages.join(", ")}`
          )
        } else {
          toast.error("Please fix form validation errors")
        }
        console.error("Form validation errors:", errors)
        return
      }

      // Additional Zod validation for safety
      const validationResult = CbPettyCashDtSchema(required, visible).safeParse(
        data
      )

      if (!validationResult.success) {
        // Set field-level errors from Zod validation
        validationResult.error.issues.forEach((issue) => {
          const fieldPath = issue.path.join(
            "."
          ) as keyof CbPettyCashDtSchemaType
          form.setError(fieldPath, {
            type: "validation",
            message: issue.message,
          })
        })

        const errors = validationResult.error.issues
        const errorMessage = errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ")
        toast.error(`Validation failed: ${errorMessage}`)
        setSubmitAttempted(true)
        console.error("Zod validation errors:", errors)
        return
      }

      // Use itemNo as the unique identifier
      const currentItemNo = data.itemNo || getNextItemNo()

      console.log("currentItemNo : ", currentItemNo)
      console.log("data : ", data)

      // Populate code/name fields from lookup data
      const populatedData = populateCodeNameFields(data)

      const rowData: ICbPettyCashDt = {
        paymentId: data.paymentId ?? "0",
        paymentNo: data.paymentNo ?? "",
        itemNo: data.itemNo ?? currentItemNo,
        seqNo: data.seqNo ?? currentItemNo,
        glId: populatedData.glId ?? 0,
        glCode: populatedData.glCode ?? "",
        glName: populatedData.glName ?? "",
        totAmt: data.totAmt ?? 0,
        totLocalAmt: data.totLocalAmt ?? 0,
        totCtyAmt: data.totCtyAmt ?? 0,
        remarks: data.remarks ?? "",
        gstId: populatedData.gstId ?? 0,
        gstName: populatedData.gstName ?? "",
        gstPercentage: data.gstPercentage ?? 0,
        gstAmt: data.gstAmt ?? 0,
        gstLocalAmt: data.gstLocalAmt ?? 0,
        gstCtyAmt: data.gstCtyAmt ?? 0,
        departmentId: data.departmentId ?? 0,
        departmentCode: data.departmentCode ?? "",
        departmentName: data.departmentName ?? "",
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
        invoiceDate: data.invoiceDate ?? "",
        invoiceNo: data.invoiceNo ?? "",
        supplierName: data.supplierName ?? "",
        gstNo: data.gstNo ?? "",
        jobOrderId: data.jobOrderId ?? 0,
        jobOrderNo: data.jobOrderNo ?? "",
        taskId: data.taskId ?? 0,
        taskName: data.taskName ?? "",
        serviceId: data.serviceId ?? 0,
        serviceName: data.serviceName ?? "",
        serviceTypeId: data.serviceTypeId ?? 0,
        serviceTypeName: data.serviceTypeName ?? "",
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
        const defaultValues = createDefaultValues(nextItemNo)
        const populatedValues = populateCodeNameFields(defaultValues)
        form.reset(populatedValues)

        // Reset submit attempted flag on successful submission
        setSubmitAttempted(false)

        // Focus on the first visible field after successful submission
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

  // Check for duplicate records based on invoiceDate, invoiceNo, and supplierName
  const checkDuplicateRecord = (
    data: CbPettyCashDtSchemaType
  ): CbPettyCashDtSchemaType | null => {
    if (existingDetails.length === 0) return null

    // Find if any existing record has the same invoiceDate, invoiceNo, and supplierName
    const duplicate = existingDetails.find(
      (detail: CbPettyCashDtSchemaType) =>
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
    }
  }

  // Handle Service Type change
  const handleServiceTypeChange = (
    selectedOption: IServiceTypeLookup | null
  ) => {
    if (selectedOption) {
      form.setValue("serviceTypeId", selectedOption.serviceTypeId, {
        shouldValidate: true,
        shouldDirty: true,
      })
    } else {
      form.setValue("serviceTypeId", 0, { shouldValidate: true })
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

  // Handle totAmt focus - capture original value
  const handleTotalAmountFocus = () => {
    originalTotAmtRef.current = form.getValues("totAmt") || 0
    console.log(
      "handleTotalAmountFocus - original value:",
      originalTotAmtRef.current
    )
  }

  const handleTotalAmountChange = (value: number) => {
    const originalTotAmt = originalTotAmtRef.current

    console.log("handleTotalAmountChange", {
      newValue: value,
      originalValue: originalTotAmt,
      isDifferent: value !== originalTotAmt,
    })

    // Only recalculate if value is different from original
    if (value === originalTotAmt) {
      console.log("Total Amount unchanged - skipping recalculation")
      return
    }

    console.log("Total Amount changed - recalculating amounts")
    form.setValue("totAmt", value)
    triggerTotalAmountCalculation()
  }

  // Handle gstPercentage focus - capture original value
  const handleGstPercentageFocus = () => {
    originalGstPercentageRef.current = form.getValues("gstPercentage") || 0
    console.log(
      "handleGstPercentageFocus - original value:",
      originalGstPercentageRef.current
    )
  }

  const handleGstPercentageManualChange = (value: number) => {
    const originalGstPercentage = originalGstPercentageRef.current

    console.log("handleGstPercentageManualChange", {
      newValue: value,
      originalValue: originalGstPercentage,
      isDifferent: value !== originalGstPercentage,
    })

    // Only recalculate if value is different from original
    if (value === originalGstPercentage) {
      console.log("GST Percentage unchanged - skipping recalculation")
      return
    }

    console.log("GST Percentage changed - recalculating amounts")
    form.setValue("gstPercentage", value)
    triggerGstCalculation()
  }

  const handleGstAmountChange = (value: number) => {
    form.setValue("gstAmt", value)
  }

  const gstPercentage = form.watch("gstPercentage")

  const isServiceTypeRequired = useCallback(() => {
    const value = Number(gstPercentage ?? 0)
    return value > 0
  }, [gstPercentage])

  return (
    <>
      {/* Display form errors only after submit attempt */}
      {submitAttempted && Object.keys(form.formState.errors).length > 0 && (
        <div className="mx-2 mb-2 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="mb-1 font-semibold text-red-800">
            Please fix the following errors:
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-red-700">
            {Object.entries(form.formState.errors).map(([field, error]) => (
              <li key={field}>
                {/* <span className="font-medium capitalize">{field}:</span>{" "} */}
                {error?.message?.toString() || "Invalid value"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`-mt-2 mb-1 grid w-full grid-cols-8 gap-1 p-2 ${
            isCancelled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {/* Hidden fields to register code/name fields with React Hook Form */}
          <input type="hidden" {...form.register("glCode")} />
          <input type="hidden" {...form.register("glName")} />
          <input type="hidden" {...form.register("departmentCode")} />
          <input type="hidden" {...form.register("departmentName")} />
          <input type="hidden" {...form.register("gstName")} />
          <input type="hidden" {...form.register("employeeCode")} />
          <input type="hidden" {...form.register("employeeName")} />
          <input type="hidden" {...form.register("bargeCode")} />
          <input type="hidden" {...form.register("bargeName")} />
          <input type="hidden" {...form.register("portCode")} />
          <input type="hidden" {...form.register("portName")} />
          <input type="hidden" {...form.register("vesselCode")} />
          <input type="hidden" {...form.register("vesselName")} />
          <input type="hidden" {...form.register("voyageNo")} />
          <input type="hidden" {...form.register("supplierName")} />
          <input type="hidden" {...form.register("gstNo")} />
          <input type="hidden" {...form.register("jobOrderNo")} />
          <input type="hidden" {...form.register("taskName")} />
          <input type="hidden" {...form.register("serviceName")} />
          <input type="hidden" {...form.register("serviceTypeName")} />

          {/* Section Header */}
          <div className="col-span-8 mb-1">
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className={`px-3 py-1 text-sm font-medium ${
                  isCancelled
                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                    : editingDetail
                      ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {isCancelled
                  ? "Details (Disabled - CbPettyCash Cancelled)"
                  : editingDetail
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
          {visible?.m_InvoiceDate && (
            <CustomDateNew
              form={form}
              name="invoiceDate"
              label="Invoice Date"
              isRequired={true}
              onChangeEvent={checkDuplicateOnChange}
            />
          )}

          {/* Supplier Name */}
          {visible?.m_InvoiceNo && (
            <CustomInput
              form={form}
              name="invoiceNo"
              label="Invoice No"
              isRequired={true}
              onChangeEvent={checkDuplicateOnChange}
            />
          )}

          {/* Supplier Name */}
          {visible?.m_SupplierName && (
            <CustomInput
              form={form}
              name="supplierName"
              label="Supplier Name"
              isRequired={true}
              onChangeEvent={checkDuplicateOnChange}
            />
          )}

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
            onFocusEvent={handleTotalAmountFocus}
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

          {/* City Amount */}
          {visible?.m_CtyCurr && (
            <CustomNumberInput
              form={form}
              name="totCtyAmt"
              label="Total City Amount"
              round={locAmtDec}
              className="text-right"
              isDisabled={true}
            />
          )}

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
            round={amtDec}
            className="text-right"
            onFocusEvent={handleGstPercentageFocus}
            onChangeEvent={handleGstPercentageManualChange}
          />

          {/* GST Amount */}
          <CustomNumberInput
            form={form}
            name="gstAmt"
            label="GST Amount"
            round={amtDec}
            isDisabled
            className="text-right"
            onChangeEvent={handleGstAmountChange}
          />

          {/* GST Local Amount */}
          <CustomNumberInput
            form={form}
            name="gstLocalAmt"
            label="GST Local Amount"
            round={locAmtDec}
            className="text-right"
            isDisabled={true}
          />

          {/* GST City Amount */}
          {visible?.m_CtyCurr && (
            <CustomNumberInput
              form={form}
              name="gstCtyAmt"
              label="GST City Amount"
              round={locAmtDec}
              className="text-right"
              isDisabled={true}
            />
          )}

          {/* GST No */}
          {visible?.m_GstNo && (
            <CustomInput
              form={form}
              name="gstNo"
              label="GST No"
              isRequired={isServiceTypeRequired()}
            />
          )}

          {/* Service Type */}
          {visible?.m_ServiceTypeId && (
            <ServiceTypeAutocomplete
              form={form}
              name="serviceTypeId"
              label="Service Type"
              isRequired={isServiceTypeRequired()}
              onChangeEvent={handleServiceTypeChange}
            />
          )}

          {/* Remarks */}
          {visible?.m_Remarks && (
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isRequired={required?.m_Remarks}
              className="col-span-2"
              minRows={2}
              maxRows={6}
            />
          )}

          {/* Action buttons */}
          <div className="col-span-1 flex items-center gap-1">
            <Button
              type="submit"
              size="sm"
              variant="default"
              className={
                editingDetail
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
              disabled={form.formState.isSubmitting}
              title="Update | Add"
            >
              {editingDetail ? "Update" : "Add"}
            </Button>

            <Button
              type="button"
              variant="outline"
              title="Cancel"
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
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
