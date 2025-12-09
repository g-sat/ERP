"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  calculateMultiplierAmount,
  handleGstPercentageChange,
  handleQtyChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import { ICbGenPaymentDt } from "@/interfaces"
import {
  IBargeLookup,
  IChartOfAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IPortLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchema,
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { clientDateFormat } from "@/lib/date-utils"
import { useChartOfAccountLookup, useGstLookup } from "@/hooks/use-lookup"
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

import { getDefaultValues } from "./cbGenPayment-defaultvalues"

interface CbGenPaymentDetailsFormProps {
  Hdform: UseFormReturn<CbGenPaymentHdSchemaType>
  onAddRowAction?: (rowData: ICbGenPaymentDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbGenPaymentDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbGenPaymentDtSchemaType[]
  defaultGlId?: number
  defaultGstId?: number
  isCancelled?: boolean
}

export default function CbGenPaymentDetailsForm({
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
}: CbGenPaymentDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )
  const defaultCbGenPaymentDetails = useMemo(
    () => getDefaultValues(dateFormat).defaultCbGenPaymentDetails,
    [dateFormat]
  )

  // Track if submit was attempted to show errors only after submit
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Refs to store original values on focus for comparison on change
  const originalTotAmtRef = useRef<number>(0)
  const originalGstPercentageRef = useRef<number>(0)

  // Refs to track previous exchange rates to detect changes
  const prevExchangeRateRef = useRef<number>(0)
  const prevCountryExchangeRateRef = useRef<number>(0)

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): CbGenPaymentDtSchemaType => {
    // Use defaults if available, otherwise use defaultCbGenPaymentDetails values
    const glId =
      defaultGlId && defaultGlId > 0
        ? defaultGlId
        : defaultCbGenPaymentDetails.glId
    const gstId =
      defaultGstId && defaultGstId > 0
        ? defaultGstId
        : defaultCbGenPaymentDetails.gstId

    return {
      ...defaultCbGenPaymentDetails,
      itemNo,
      seqNo: itemNo,
      glId,
      gstId,
    }
  }

  const form = useForm<CbGenPaymentDtSchemaType>({
    resolver: zodResolver(CbGenPaymentDtSchema(required, visible)),
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
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Fetch lookup data for autocomplete fields
  const { data: chartOfAccounts } = useChartOfAccountLookup(companyId)
  const { data: gsts } = useGstLookup()

  // Function to populate code/name fields from lookup data
  const populateCodeNameFields = (
    formData: CbGenPaymentDtSchemaType
  ): CbGenPaymentDtSchemaType => {
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
  const watchedExchangeRate = Hdform.watch("exhRate")
  const watchedCountryExchangeRate = Hdform.watch("ctyExhRate")

  // Initialize exchange rate refs with current values on mount
  useEffect(() => {
    const currentExhRate = Hdform.getValues("exhRate") || 0
    const currentCtyExhRate = Hdform.getValues("ctyExhRate") || 0
    prevExchangeRateRef.current = currentExhRate
    prevCountryExchangeRateRef.current = currentCtyExhRate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // Recalculate local amounts when exchange rate changes (only on actual change, works in edit mode too)
  useEffect(() => {
    const currentExchangeRate = watchedExchangeRate || 0
    const currentCountryExchangeRate = watchedCountryExchangeRate || 0

    // Check if exchange rates have actually changed
    const exchangeRateChanged =
      currentExchangeRate !== prevExchangeRateRef.current
    const countryExchangeRateChanged =
      currentCountryExchangeRate !== prevCountryExchangeRateRef.current

    // Only recalculate if exchange rates have changed
    if (!exchangeRateChanged && !countryExchangeRateChanged) {
      return
    }

    // Update refs with current values
    prevExchangeRateRef.current = currentExchangeRate
    prevCountryExchangeRateRef.current = currentCountryExchangeRate

    const currentValues = form.getValues()

    // Only recalculate if form has a valid totAmt (don't recalculate if totAmt is 0)
    // We need totAmt to exist to calculate local amounts
    if ((currentValues.totAmt ?? 0) > 0) {
      const rowData = form.getValues()
      const totAmt = rowData.totAmt || 0
      const gstAmt = rowData.gstAmt || 0

      // Ensure countryExchangeRate = exchangeRate if m_CtyCurr is false
      const exchangeRate = currentExchangeRate
      if (!visible?.m_CtyCurr) {
        Hdform.setValue("ctyExhRate", exchangeRate)
      }

      // Recalculate total local amount (preserve existing totAmt)
      const totLocalAmt = calculateMultiplierAmount(
        totAmt,
        exchangeRate,
        decimals[0]?.locAmtDec || 2
      )

      // Recalculate total city amount
      const countryExchangeRate = visible?.m_CtyCurr
        ? currentCountryExchangeRate
        : exchangeRate
      let totCtyAmt = 0
      if (visible?.m_CtyCurr) {
        totCtyAmt = calculateMultiplierAmount(
          totAmt,
          countryExchangeRate,
          decimals[0]?.locAmtDec || 2
        )
      } else {
        totCtyAmt = totLocalAmt
      }

      // Recalculate GST local amount (preserve existing gstAmt, don't recalculate from percentage)
      const gstLocalAmt = calculateMultiplierAmount(
        gstAmt,
        exchangeRate,
        decimals[0]?.locAmtDec || 2
      )

      // Recalculate GST city amount
      let gstCtyAmt = 0
      if (visible?.m_CtyCurr) {
        gstCtyAmt = calculateMultiplierAmount(
          gstAmt,
          countryExchangeRate,
          decimals[0]?.locAmtDec || 2
        )
      } else {
        gstCtyAmt = gstLocalAmt
      }

      // Update form with recalculated values
      form.setValue("totLocalAmt", totLocalAmt)
      form.setValue("totCtyAmt", totCtyAmt)
      form.setValue("gstLocalAmt", gstLocalAmt)
      form.setValue("gstCtyAmt", gstCtyAmt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedExchangeRate, watchedCountryExchangeRate])

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

  const onSubmit = async (data: CbGenPaymentDtSchemaType) => {
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
      const validationResult = CbGenPaymentDtSchema(
        required,
        visible
      ).safeParse(data)

      if (!validationResult.success) {
        // Set field-level errors from Zod validation
        validationResult.error.issues.forEach((issue) => {
          const fieldPath = issue.path.join(
            "."
          ) as keyof CbGenPaymentDtSchemaType
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

      const rowData: ICbGenPaymentDt = {
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
    }
  }

  const handleGSTChange = async (selectedOption: IGstLookup | null) => {
    if (selectedOption) {
      form.setValue("gstId", selectedOption.gstId)
      form.setValue("gstName", selectedOption.gstName || "")
      await setGSTPercentage(Hdform, form, decimals[0], visible)
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

  // ============================================================================
  // CALCULATION HANDLERS
  // ============================================================================

  const triggerTotalAmountCalculation = () => {
    const rowData = form.getValues()

    // Ensure countryExchangeRate = exchangeRate if m_CtyCurr is false
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

    // Ensure countryExchangeRate = exchangeRate if m_CtyCurr is false
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
                  ? "Details (Disabled - CbGenPayment Cancelled)"
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
              isRequired={required?.m_DepartmentId}
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

          {/* Country Amount */}
          {visible?.m_CtyCurr && (
            <CustomNumberInput
              form={form}
              name="totCtyAmt"
              label="Total Country Amount"
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
              label="VAT"
              isRequired={required?.m_GstId}
              onChangeEvent={handleGSTChange}
            />
          )}

          {/* GST Percentage */}
          <CustomNumberInput
            form={form}
            name="gstPercentage"
            label="VAT Percentage"
            round={amtDec}
            className="text-right"
            onFocusEvent={handleGstPercentageFocus}
            onChangeEvent={handleGstPercentageManualChange}
          />

          {/* GST Amount */}
          <CustomNumberInput
            form={form}
            name="gstAmt"
            label="VAT Amount"
            round={amtDec}
            isDisabled={false}
            className="text-right"
            onChangeEvent={handleGstAmountChange}
          />

          {/* GST Local Amount */}
          <CustomNumberInput
            form={form}
            name="gstLocalAmt"
            label="VAT Local Amount"
            round={locAmtDec}
            className="text-right"
            isDisabled={true}
          />

          {/* GST Country Amount */}
          {visible?.m_CtyCurr && (
            <CustomNumberInput
              form={form}
              name="gstCtyAmt"
              label="GST Country Amount"
              round={locAmtDec}
              className="text-right"
              isDisabled={true}
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
    </>
  )
}
