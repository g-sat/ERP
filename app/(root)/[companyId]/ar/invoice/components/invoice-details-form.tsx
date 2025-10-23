"use client"

import { useEffect } from "react"
import {
  handleGstPercentageChange,
  handleQtyChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import { IArInvoiceDt } from "@/interfaces"
import {
  IBargeLookup,
  IChartOfAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IPortLookup,
  IProductLookup,
  IUomLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ArInvoiceDtSchema,
  ArInvoiceDtSchemaType,
  ArInvoiceHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { RotateCcwIcon, XIcon } from "lucide-react"
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
  PortAutocomplete,
  ProductAutocomplete,
  UomAutocomplete,
  VesselAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultInvoiceDetails } from "./invoice-defaultvalues"

interface InvoiceDetailsFormProps {
  Hdform: UseFormReturn<ArInvoiceHdSchemaType>
  onAddRowAction?: (rowData: IArInvoiceDt) => void
  onCancelEdit?: () => void
  editingDetail?: ArInvoiceDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: ArInvoiceDtSchemaType[]
  defaultGlId?: number
  defaultUomId?: number
  defaultGstId?: number
}

export default function InvoiceDetailsForm({
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
}: InvoiceDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const qtyDec = decimals[0]?.qtyDec || 2

  // Calculate next itemNo based on existing details
  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  // Factory function to create default values with dynamic itemNo and defaults
  const createDefaultValues = (itemNo: number): ArInvoiceDtSchemaType => ({
    ...defaultInvoiceDetails,
    itemNo,
    seqNo: itemNo,
    docItemNo: itemNo,
    glId: defaultGlId || defaultInvoiceDetails.glId,
    uomId: defaultUomId || defaultInvoiceDetails.uomId,
    gstId: defaultGstId || defaultInvoiceDetails.gstId,
  })

  const form = useForm<ArInvoiceDtSchemaType>({
    resolver: zodResolver(ArInvoiceDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          invoiceId: editingDetail.invoiceId ?? "0",
          invoiceNo: editingDetail.invoiceNo ?? "",
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
          salesOrderId: editingDetail.salesOrderId ?? "",
          salesOrderNo: editingDetail.salesOrderNo ?? "",
          supplyDate: editingDetail.supplyDate ?? "",
          supplierName: editingDetail.supplierName ?? "",
          suppInvoiceNo: editingDetail.suppInvoiceNo ?? "",
          apInvoiceId: editingDetail.apInvoiceId ?? "",
          apInvoiceNo: editingDetail.apInvoiceNo ?? "",
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Fetch lookup data for autocomplete fields
  const { data: chartOfAccounts } = useChartOfAccountLookup(companyId)
  const { data: uoms } = useUomLookup()
  const { data: gsts } = useGstLookup()

  // Function to populate code/name fields from lookup data
  const populateCodeNameFields = (
    formData: ArInvoiceDtSchemaType
  ): ArInvoiceDtSchemaType => {
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

  // Watch form values to trigger re-renders when they change
  const watchedExchangeRate = Hdform.watch("exhRate")
  const watchedCityExchangeRate = Hdform.watch("ctyExhRate")

  // Apply default IDs when they become available (only for new records)
  useEffect(() => {
    if (editingDetail) return // Skip for edit mode

    const currentGlId = form.getValues("glId")
    const currentUomId = form.getValues("uomId")
    const currentGstId = form.getValues("gstId")

    // Set default GL ID if not already set
    if (defaultGlId && defaultGlId > 0 && (!currentGlId || currentGlId === 0)) {
      form.setValue("glId", defaultGlId)
    }

    // Set default UOM ID if not already set
    if (
      defaultUomId &&
      defaultUomId > 0 &&
      (!currentUomId || currentUomId === 0)
    ) {
      form.setValue("uomId", defaultUomId)
    }

    // Set default GST ID if not already set
    if (
      defaultGstId &&
      defaultGstId > 0 &&
      (!currentGstId || currentGstId === 0)
    ) {
      form.setValue("gstId", defaultGstId)
    }
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
      form.reset({
        invoiceId: editingDetail.invoiceId ?? "0",
        invoiceNo: editingDetail.invoiceNo ?? "",
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
        salesOrderId: editingDetail.salesOrderId ?? "",
        salesOrderNo: editingDetail.salesOrderNo ?? "",
        supplyDate: editingDetail.supplyDate ?? "",
        supplierName: editingDetail.supplierName ?? "",
        suppInvoiceNo: editingDetail.suppInvoiceNo ?? "",
        apInvoiceId: editingDetail.apInvoiceId ?? "",
        apInvoiceNo: editingDetail.apInvoiceNo ?? "",
        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      // New record - reset to defaults
      form.reset(createDefaultValues(nextItemNo))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail, existingDetails.length])

  const onSubmit = async (data: ArInvoiceDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = ArInvoiceDtSchema(required, visible).safeParse(
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

      // Populate code/name fields from lookup data
      const populatedData = populateCodeNameFields(data)

      const rowData: IArInvoiceDt = {
        invoiceId: data.invoiceId ?? "0",
        invoiceNo: data.invoiceNo ?? "",
        itemNo: data.itemNo ?? currentItemNo,
        seqNo: data.seqNo ?? currentItemNo,
        docItemNo: data.docItemNo ?? currentItemNo,
        productId: data.productId ?? 0,
        productCode: data.productCode ?? "",
        productName: data.productName ?? "",
        glId: populatedData.glId ?? 0,
        glCode: populatedData.glCode ?? "",
        glName: populatedData.glName ?? "",
        qty: data.qty ?? 0,
        billQTY: data.billQTY ?? 0,
        uomId: populatedData.uomId ?? 0,
        uomCode: populatedData.uomCode ?? "",
        uomName: populatedData.uomName ?? "",
        unitPrice: data.unitPrice ?? 0,
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
        deliveryDate: data.deliveryDate ?? "",
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
        operationId: data.operationId ?? 0,
        operationNo: data.operationNo ?? "",
        opRefNo: data.opRefNo ?? "",
        salesOrderId: data.salesOrderId ?? "",
        salesOrderNo: data.salesOrderNo ?? "",
        supplyDate: data.supplyDate ?? "",
        supplierName: data.supplierName ?? "",
        suppInvoiceNo: data.suppInvoiceNo ?? "",
        apInvoiceId: data.apInvoiceId ?? "0",
        apInvoiceNo: data.apInvoiceNo ?? "",
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
              size="sm"
              onClick={() => {
                const nextItemNo = getNextItemNo()
                form.reset(createDefaultValues(nextItemNo))
                toast.info("Form reset")
              }}
            >
              Reset
            </Button>

            {editingDetail && (
              <Button
                type="button"
                variant="outline"
                title="Cancel"
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
