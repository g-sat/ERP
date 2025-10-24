"use client"

import { useEffect, useState } from "react"
import {
  handleGstPercentageChange,
  handleQtyChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import { IApCreditNoteDt } from "@/interfaces"
import {
  IBargeLookup,
  IChartOfAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IJobOrderLookup,
  IPortLookup,
  IProductLookup,
  IServiceLookup,
  ITaskLookup,
  IUomLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApCreditNoteDtSchemaType,
  ApCreditNoteHdSchemaType,
  apCreditNoteDtSchema,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  useChartOfAccountLookup,
  useGstLookup,
  useUomLookup,
} from "@/hooks/use-lookup"
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
  ProductAutocomplete,
  UomAutocomplete,
  VesselAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultCreditNoteDetails } from "./creditNote-defaultvalues"

interface CreditNoteDetailsFormProps {
  Hdform: UseFormReturn<ApCreditNoteHdSchemaType>
  onAddRowAction?: (rowData: IApCreditNoteDt) => void
  onCancelEdit?: () => void
  editingDetail?: ApCreditNoteDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: ApCreditNoteDtSchemaType[]
  defaultGlId?: number
  defaultUomId?: number
  defaultGstId?: number
}

export default function CreditNoteDetailsForm({
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
}: CreditNoteDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const qtyDec = decimals[0]?.qtyDec || 2
  // State to manage job-specific vs department-specific rendering
  const [isJobSpecific, setIsJobSpecific] = useState(false)

  // Lookup hooks
  const { data: chartOfAccounts } = useChartOfAccountLookup(companyId)
  const { data: uoms } = useUomLookup()
  const { data: gsts } = useGstLookup()

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): ApCreditNoteDtSchemaType => ({
    ...defaultCreditNoteDetails,
    itemNo,
    seqNo: itemNo,
    docItemNo: itemNo,
    glId: defaultGlId || defaultCreditNoteDetails.glId,
    uomId: defaultUomId || defaultCreditNoteDetails.uomId,
    gstId: defaultGstId || defaultCreditNoteDetails.gstId,
  })

  const form = useForm<ApCreditNoteDtSchemaType>({
    resolver: zodResolver(apCreditNoteDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          creditNoteId: editingDetail.creditNoteId ?? "0",
          creditNoteNo: editingDetail.creditNoteNo ?? "",
          itemNo: editingDetail.itemNo ?? getNextItemNo(),
          seqNo: editingDetail.seqNo ?? getNextItemNo(),
          docItemNo: editingDetail.docItemNo ?? getNextItemNo(),
          productId: editingDetail.productId ?? 0,
          productCode: editingDetail.productCode ?? "",
          productName: editingDetail.productName ?? "",
          glId: editingDetail.glId ?? 0,
          glCode: editingDetail.glCode ?? "",
          glName: editingDetail.glName ?? "",
          qty: editingDetail.qty ?? 0,
          billQTY: editingDetail.billQTY ?? 0,
          uomId: editingDetail.uomId ?? 0,
          uomCode: editingDetail.uomCode ?? "",
          uomName: editingDetail.uomName ?? "",
          unitPrice: editingDetail.unitPrice ?? 0,
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
          deliveryDate: editingDetail.deliveryDate ?? "",
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
          operationId: editingDetail.operationId ?? "",
          operationNo: editingDetail.operationNo ?? "",
          opRefNo: editingDetail.opRefNo ?? "",
          purchaseOrderId: editingDetail.purchaseOrderId ?? "",
          purchaseOrderNo: editingDetail.purchaseOrderNo ?? "",
          supplyDate: editingDetail.supplyDate ?? "",
          customerName: editingDetail.customerName ?? "",
          custCreditNoteNo: editingDetail.custCreditNoteNo ?? "",
          arCreditNoteId: editingDetail.arCreditNoteId ?? "",
          arCreditNoteNo: editingDetail.arCreditNoteNo ?? "",
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Function to populate code/name fields from lookup data
  const populateCodeNameFields = (
    formData: ApCreditNoteDtSchemaType
  ): ApCreditNoteDtSchemaType => {
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

    // Populate UOM code/name if uomId is set
    if (populatedData.uomId && populatedData.uomId > 0) {
      const uomData = uoms?.find(
        (uom: IUomLookup) => uom.uomId === populatedData.uomId
      )
      if (uomData) {
        populatedData.uomCode = uomData.uomCode || ""
        populatedData.uomName = uomData.uomName || ""
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

  // Handler for form reset
  const handleFormReset = () => {
    const nextItemNo = getNextItemNo()
    const defaultValues = createDefaultValues(nextItemNo)
    const populatedValues = populateCodeNameFields(defaultValues)
    form.reset(populatedValues)
    toast.info("Form reset")
    focusFirstVisibleField()
  }

  // Handler for cancel edit
  const handleCancelEdit = () => {
    _onCancelEdit?.()
    const nextItemNo = getNextItemNo()
    const defaultValues = createDefaultValues(nextItemNo)
    const populatedValues = populateCodeNameFields(defaultValues)
    form.reset(populatedValues)
    toast.info("Edit cancelled")
    focusFirstVisibleField()
  }

  // Watch form values to trigger re-renders when they change
  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")
  const watchedExchangeRate = Hdform.watch("exhRate")
  const watchedCityExchangeRate = Hdform.watch("ctyExhRate")

  // Set default glId, uomId, and gstId when defaults become available (not in edit mode)
  useEffect(() => {
    // Only run when defaults are loaded and we're not editing an existing row
    if (!editingDetail) {
      const currentGlId = form.getValues("glId")
      const currentUomId = form.getValues("uomId")
      const currentGstId = form.getValues("gstId")

      console.log("CreditNote Details Form - Checking defaults:", {
        currentGlId,
        currentUomId,
        currentGstId,
        defaultGlId,
        defaultUomId,
        defaultGstId,
        editingDetail,
      })

      // Only set defaults if current values are 0 and defaults are available
      if (defaultGlId > 0 && (!currentGlId || currentGlId === 0)) {
        console.log(
          "CreditNote Details Form - Setting default glId:",
          defaultGlId
        )
        form.setValue("glId", defaultGlId)
      }
      if (defaultUomId > 0 && (!currentUomId || currentUomId === 0)) {
        console.log(
          "CreditNote Details Form - Setting default uomId:",
          defaultUomId
        )
        form.setValue("uomId", defaultUomId)
      }
      if (defaultGstId > 0 && (!currentGstId || currentGstId === 0)) {
        console.log(
          "CreditNote Details Form - Setting default gstId:",
          defaultGstId
        )
        form.setValue("gstId", defaultGstId)
        // Trigger GST percentage calculation after setting default GST
        setGSTPercentage(Hdform, form, decimals[0], visible)
      }
    }
    // Only depend on values that should trigger this effect
    // form, Hdform, decimals, visible are used inside but are stable references
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGlId, defaultUomId, defaultGstId, editingDetail])

  // Populate code/name fields when defaults are applied (only for new records)
  useEffect(() => {
    if (editingDetail) return // Skip for edit mode

    const currentGlId = form.getValues("glId")
    const currentUomId = form.getValues("uomId")
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

    // Populate UOM code/name if uomId is set and code/name are empty
    if (currentUomId && currentUomId > 0 && !form.getValues("uomCode")) {
      const uomData = uoms?.find(
        (uom: IUomLookup) => uom.uomId === currentUomId
      )
      if (uomData) {
        form.setValue("uomCode", uomData.uomCode || "")
        form.setValue("uomName", uomData.uomName || "")
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
  }, [
    chartOfAccounts,
    uoms,
    gsts,
    editingDetail,
    defaultGlId,
    defaultUomId,
    defaultGstId,
  ])

  // Recalculate local amounts when exchange rate changes
  useEffect(() => {
    const currentValues = form.getValues()

    // Only recalculate if form has values
    if ((currentValues.totAmt ?? 0) > 0 || (currentValues.qty ?? 0) > 0) {
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
        creditNoteId: editingDetail.creditNoteId ?? "0",
        creditNoteNo: editingDetail.creditNoteNo ?? "",
        itemNo: editingDetail.itemNo ?? nextItemNo,
        seqNo: editingDetail.seqNo ?? nextItemNo,
        docItemNo: editingDetail.docItemNo ?? nextItemNo,
        productId: editingDetail.productId ?? 0,
        productCode: editingDetail.productCode ?? "",
        productName: editingDetail.productName ?? "",
        glId: editingDetail.glId ?? 0,
        glCode: editingDetail.glCode ?? "",
        glName: editingDetail.glName ?? "",
        qty: editingDetail.qty ?? 0,
        billQTY: editingDetail.billQTY ?? 0,
        uomId: editingDetail.uomId ?? 0,
        uomCode: editingDetail.uomCode ?? "",
        uomName: editingDetail.uomName ?? "",
        unitPrice: editingDetail.unitPrice ?? 0,
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
        deliveryDate: editingDetail.deliveryDate ?? "",
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
        operationId: editingDetail.operationId ?? "",
        operationNo: editingDetail.operationNo ?? "",
        opRefNo: editingDetail.opRefNo ?? "",
        purchaseOrderId: editingDetail.purchaseOrderId ?? "",
        purchaseOrderNo: editingDetail.purchaseOrderNo ?? "",
        supplyDate: editingDetail.supplyDate ?? "",
        customerName: editingDetail.customerName ?? "",
        custCreditNoteNo: editingDetail.custCreditNoteNo ?? "",
        arCreditNoteId: editingDetail.arCreditNoteId ?? "",
        arCreditNoteNo: editingDetail.arCreditNoteNo ?? "",
        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      // New record - reset to defaults
      form.reset(createDefaultValues(nextItemNo))
      setIsJobSpecific(false) // Default to department-specific for new records
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail, existingDetails.length])

  const onSubmit = async (data: ApCreditNoteDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = apCreditNoteDtSchema(
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

      // Populate code/name fields from lookup data
      const populatedData = populateCodeNameFields(data)

      const rowData: IApCreditNoteDt = {
        creditNoteId: populatedData.creditNoteId ?? "0",
        creditNoteNo: populatedData.creditNoteNo ?? "",
        itemNo: populatedData.itemNo ?? currentItemNo,
        seqNo: populatedData.seqNo ?? currentItemNo,
        docItemNo: populatedData.docItemNo ?? currentItemNo,
        productId: populatedData.productId ?? 0,
        productCode: populatedData.productCode ?? "",
        productName: populatedData.productName ?? "",
        glId: populatedData.glId ?? 0,
        glCode: populatedData.glCode ?? "",
        glName: populatedData.glName ?? "",
        qty: populatedData.qty ?? 0,
        billQTY: populatedData.billQTY ?? 0,
        uomId: populatedData.uomId ?? 0,
        uomCode: populatedData.uomCode ?? "",
        uomName: populatedData.uomName ?? "",
        unitPrice: populatedData.unitPrice ?? 0,
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
        deliveryDate: populatedData.deliveryDate ?? "",
        departmentId: populatedData.departmentId ?? 0,
        departmentCode: populatedData.departmentCode ?? "",
        departmentName: populatedData.departmentName ?? "",
        jobOrderId: populatedData.jobOrderId ?? 0,
        jobOrderNo: populatedData.jobOrderNo ?? "",
        taskId: populatedData.taskId ?? 0,
        taskName: populatedData.taskName ?? "",
        serviceId: populatedData.serviceId ?? 0,
        serviceName: populatedData.serviceName ?? "",
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
        operationId: populatedData.operationId ?? 0,
        operationNo: populatedData.operationNo ?? "",
        opRefNo: populatedData.opRefNo ?? "",
        purchaseOrderId: populatedData.purchaseOrderId ?? "",
        purchaseOrderNo: populatedData.purchaseOrderNo ?? "",
        supplyDate: populatedData.supplyDate ?? "",
        customerName: populatedData.customerName ?? "",
        custCreditNoteNo: populatedData.custCreditNoteNo ?? "",
        arCreditNoteId: populatedData.arCreditNoteId ?? "",
        arCreditNoteNo: populatedData.arCreditNoteNo ?? "",
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
        const nextItemNo = getNextItemNo()
        const defaultValues = createDefaultValues(nextItemNo)
        const populatedValues = populateCodeNameFields(defaultValues)
        form.reset(populatedValues)

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

  // Handle product selection
  const handleProductChange = (selectedOption: IProductLookup | null) => {
    if (selectedOption) {
      form.setValue("productId", selectedOption.productId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("productCode", selectedOption.productCode || "")
      form.setValue("productName", selectedOption.productName || "")
    }
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
      form.setValue("serviceId", 0, { shouldValidate: true })
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

  // Handle UOM selection
  const handleUomChange = (selectedOption: IUomLookup | null) => {
    if (selectedOption) {
      form.setValue("uomId", selectedOption.uomId, {
        shouldValidate: true,
        shouldDirty: true,
      })
      form.setValue("uomCode", selectedOption.uomCode || "")
      form.setValue("uomName", selectedOption.uomName || "")
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

  const handleDtQtyChange = (value: number) => {
    form.setValue("qty", value)

    // If m_BillQTY is false, set billQTY = qty
    if (!visible?.m_BillQTY) {
      form.setValue("billQTY", value)
    }

    // Get form values AFTER setting qty/billQTY
    const rowData = form.getValues()

    // ✅ Manually ensure the updated values are in rowData
    rowData.qty = value
    if (!visible?.m_BillQTY) {
      rowData.billQTY = value
    }

    // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
    const exchangeRate = Hdform.getValues("exhRate") || 0
    if (!visible?.m_CtyCurr) {
      Hdform.setValue("ctyExhRate", exchangeRate)
    }

    handleQtyChange(Hdform, rowData, decimals[0], visible)
    // Update only the calculated fields
    form.setValue("totAmt", rowData.totAmt)
    form.setValue("totLocalAmt", rowData.totLocalAmt)
    form.setValue("totCtyAmt", rowData.totCtyAmt)
    form.setValue("gstAmt", rowData.gstAmt)
    form.setValue("gstLocalAmt", rowData.gstLocalAmt)
    form.setValue("gstCtyAmt", rowData.gstCtyAmt)
  }

  const handleBillQtyChange = (value: number) => {
    form.setValue("billQTY", value)

    // Get form values AFTER setting billQTY
    const rowData = form.getValues()

    // ✅ Manually ensure the updated value is in rowData
    rowData.billQTY = value

    // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
    const exchangeRate = Hdform.getValues("exhRate") || 0
    if (!visible?.m_CtyCurr) {
      Hdform.setValue("ctyExhRate", exchangeRate)
    }

    handleQtyChange(Hdform, rowData, decimals[0], visible)
    // Update only the calculated fields
    form.setValue("totAmt", rowData.totAmt)
    form.setValue("totLocalAmt", rowData.totLocalAmt)
    form.setValue("totCtyAmt", rowData.totCtyAmt)
    form.setValue("gstAmt", rowData.gstAmt)
    form.setValue("gstLocalAmt", rowData.gstLocalAmt)
    form.setValue("gstCtyAmt", rowData.gstCtyAmt)
  }

  const handleUnitPriceChange = (value: number) => {
    form.setValue("unitPrice", value)

    // Get form values AFTER setting unitPrice
    const rowData = form.getValues()

    // ✅ Manually ensure the updated value is in rowData
    rowData.unitPrice = value

    // Ensure cityExchangeRate = exchangeRate if m_CtyCurr is false
    const exchangeRate = Hdform.getValues("exhRate") || 0
    if (!visible?.m_CtyCurr) {
      Hdform.setValue("ctyExhRate", exchangeRate)
    }

    // Recalculate using billQTY (not the value parameter)
    handleQtyChange(Hdform, rowData, decimals[0], visible)
    // Update only the calculated fields
    form.setValue("totAmt", rowData.totAmt)
    form.setValue("totLocalAmt", rowData.totLocalAmt)
    form.setValue("totCtyAmt", rowData.totCtyAmt)
    form.setValue("gstAmt", rowData.gstAmt)
    form.setValue("gstLocalAmt", rowData.gstLocalAmt)
    form.setValue("gstCtyAmt", rowData.gstCtyAmt)
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
          className="-mt-2 mb-1 grid w-full grid-cols-8 gap-1 p-2"
        >
          {/* Hidden fields to register code/name fields with React Hook Form */}
          <input type="hidden" {...form.register("glCode")} />
          <input type="hidden" {...form.register("glName")} />
          <input type="hidden" {...form.register("departmentCode")} />
          <input type="hidden" {...form.register("departmentName")} />
          <input type="hidden" {...form.register("productCode")} />
          <input type="hidden" {...form.register("productName")} />
          <input type="hidden" {...form.register("uomCode")} />
          <input type="hidden" {...form.register("uomName")} />
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
          <input type="hidden" {...form.register("jobOrderNo")} />
          <input type="hidden" {...form.register("taskName")} />
          <input type="hidden" {...form.register("serviceName")} />

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

          {/* Product */}
          {visible?.m_ProductId && (
            <ProductAutocomplete
              form={form}
              name="productId"
              label="Product"
              isRequired={required?.m_ProductId}
              onChangeEvent={handleProductChange}
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
                  //isRequired={required?.m_JobOrderId && isJobSpecific}
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
                  //isRequired={required?.m_JobOrderId && isJobSpecific}
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

          {/* Quantity */}
          {visible?.m_QTY && (
            <CustomNumberInput
              form={form}
              name="qty"
              label="Quantity"
              isRequired={required?.m_QTY}
              round={qtyDec}
              className="text-right"
              onChangeEvent={handleDtQtyChange}
            />
          )}

          {/* Bill Quantity */}
          {visible?.m_BillQTY && (
            <CustomNumberInput
              form={form}
              name="billQTY"
              label="Bill Quantity"
              round={qtyDec}
              className="text-right"
              onChangeEvent={handleBillQtyChange}
            />
          )}

          {visible?.m_UomId && (
            <UomAutocomplete
              form={form}
              name="uomId"
              label="UOM"
              isRequired={required?.m_UomId}
              onChangeEvent={handleUomChange}
            />
          )}

          {/* Unit Price */}
          {visible?.m_UnitPrice && (
            <CustomNumberInput
              form={form}
              name="unitPrice"
              label="Unit Price"
              isRequired={required?.m_UnitPrice}
              round={amtDec}
              className="text-right"
              onChangeEvent={handleUnitPriceChange}
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
              size="sm"
              onClick={handleFormReset}
            >
              Reset
            </Button>

            {editingDetail && (
              <Button
                type="button"
                variant="outline"
                title="Cancel"
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
