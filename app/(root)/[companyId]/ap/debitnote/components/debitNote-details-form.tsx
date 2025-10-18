"use client"

import { useEffect, useState } from "react"
import {
  handleGstPercentageChange,
  handleQtyChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import { IApDebitNoteDt } from "@/interfaces"
import {
  IBargeLookup,
  IChartofAccountLookup,
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
  ApDebitNoteDtSchemaType,
  ApDebitNoteHdSchemaType,
  apdebitNoteDtSchema,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import BargeAutocomplete from "@/components/autocomplete/autocomplete-barge"
import ChartOfAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import DepartmentAutocomplete from "@/components/autocomplete/autocomplete-department"
import EmployeeAutocomplete from "@/components/autocomplete/autocomplete-employee"
import GSTAutocomplete from "@/components/autocomplete/autocomplete-gst"
import JobOrderAutocomplete from "@/components/autocomplete/autocomplete-joborder"
import JobOrderChargeAutocomplete from "@/components/autocomplete/autocomplete-joborder-charge"
import JobOrderTaskAutocomplete from "@/components/autocomplete/autocomplete-joborder-task"
import PortAutocomplete from "@/components/autocomplete/autocomplete-port"
import ProductAutocomplete from "@/components/autocomplete/autocomplete-product"
import UomAutocomplete from "@/components/autocomplete/autocomplete-uom"
import VesselAutocomplete from "@/components/autocomplete/autocomplete-vessel"
import VoyageAutocomplete from "@/components/autocomplete/autocomplete-voyage"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultDebitNoteDetails } from "./debitNote-defaultvalues"

interface DebitNoteDetailsFormProps {
  Hdform: UseFormReturn<ApDebitNoteHdSchemaType>
  onAddRowAction?: (rowData: IApDebitNoteDt) => void
  onCancelEdit?: () => void
  editingDetail?: ApDebitNoteDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: ApDebitNoteDtSchemaType[]
  defaultGlId?: number
  defaultUomId?: number
  defaultGstId?: number
}

export default function DebitNoteDetailsForm({
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
}: DebitNoteDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const qtyDec = decimals[0]?.qtyDec || 2
  // State to manage job-specific vs department-specific rendering
  const [isJobSpecific, setIsJobSpecific] = useState(false)

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): ApDebitNoteDtSchemaType => ({
    ...defaultDebitNoteDetails,
    itemNo,
    seqNo: itemNo,
    docItemNo: itemNo,
    glId: defaultGlId || defaultDebitNoteDetails.glId,
    uomId: defaultUomId || defaultDebitNoteDetails.uomId,
    gstId: defaultGstId || defaultDebitNoteDetails.gstId,
  })

  const form = useForm<ApDebitNoteDtSchemaType>({
    resolver: zodResolver(apdebitNoteDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          debitNoteId: editingDetail.debitNoteId ?? "0",
          debitNoteNo: editingDetail.debitNoteNo ?? "",
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
          arDebitNoteId: editingDetail.arDebitNoteId ?? "",
          arDebitNoteNo: editingDetail.arDebitNoteNo ?? "",
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

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

      console.log("DebitNote Details Form - Checking defaults:", {
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
          "DebitNote Details Form - Setting default glId:",
          defaultGlId
        )
        form.setValue("glId", defaultGlId)
      }
      if (defaultUomId > 0 && (!currentUomId || currentUomId === 0)) {
        console.log(
          "DebitNote Details Form - Setting default uomId:",
          defaultUomId
        )
        form.setValue("uomId", defaultUomId)
      }
      if (defaultGstId > 0 && (!currentGstId || currentGstId === 0)) {
        console.log(
          "DebitNote Details Form - Setting default gstId:",
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
        debitNoteId: editingDetail.debitNoteId ?? "0",
        debitNoteNo: editingDetail.debitNoteNo ?? "",
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
        custDebitNoteNo: editingDetail.custDebitNoteNo ?? "",
        arDebitNoteId: editingDetail.arDebitNoteId ?? "",
        arDebitNoteNo: editingDetail.arDebitNoteNo ?? "",
        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      // New record - reset to defaults
      form.reset(createDefaultValues(nextItemNo))
      setIsJobSpecific(false) // Default to department-specific for new records
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail, existingDetails.length])

  const onSubmit = async (data: ApDebitNoteDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = apdebitNoteDtSchema(required, visible).safeParse(
        data
      )

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

      const rowData: IApDebitNoteDt = {
        debitNoteId: data.debitNoteId ?? "0",
        debitNoteNo: data.debitNoteNo ?? "",
        itemNo: data.itemNo ?? currentItemNo,
        seqNo: data.seqNo ?? currentItemNo,
        docItemNo: data.docItemNo ?? currentItemNo,
        productId: data.productId ?? 0,
        productCode: data.productCode ?? "",
        productName: data.productName ?? "",
        glId: data.glId ?? 0,
        glCode: data.glCode ?? "",
        glName: data.glName ?? "",
        qty: data.qty ?? 0,
        billQTY: data.billQTY ?? 0,
        uomId: data.uomId ?? 0,
        uomCode: data.uomCode ?? "",
        uomName: data.uomName ?? "",
        unitPrice: data.unitPrice ?? 0,
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
        deliveryDate: data.deliveryDate ?? "",
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
        operationId: data.operationId ?? 0,
        operationNo: data.operationNo ?? "",
        opRefNo: data.opRefNo ?? "",
        purchaseOrderId: data.purchaseOrderId ?? "",
        purchaseOrderNo: data.purchaseOrderNo ?? "",
        supplyDate: data.supplyDate ?? "",
        customerName: data.customerName ?? "",
        custDebitNoteNo: data.custDebitNoteNo ?? "",
        arDebitNoteId: data.arDebitNoteId ?? "",
        arDebitNoteNo: data.arDebitNoteNo ?? "",
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
      <h2 className="text-xl font-semibold">
        {editingDetail
          ? `Details (Edit - Item ${editingDetail.itemNo})`
          : "Details (New)"}
      </h2>

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
          className="grid w-full grid-cols-7 gap-2 p-2"
        >
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
                  isRequired={required?.m_JobOrderId && isJobSpecific}
                  onChangeEvent={handleTaskChange}
                />
              )}

              {visible?.m_JobOrderId && (
                <JobOrderChargeAutocomplete
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
    </>
  )
}
