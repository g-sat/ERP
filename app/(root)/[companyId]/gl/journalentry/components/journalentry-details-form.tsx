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
  IChartOfAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IJobOrderLookup,
  IPortLookup,
  IProductLookup,
  IServiceLookup,
  ITaskLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces"
import { IGLJournalDt } from "@/interfaces/gl-journalentry"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  GLJournalDtSchema,
  GLJournalDtSchemaType,
  GLJournalHdSchemaType,
} from "@/schemas/gl-journalentry"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, Path, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
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
  VesselAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultJournalDetails } from "./journalentry-defaultvalues"

// Factory function to create default values with dynamic itemNo
const createDefaultValues = (itemNo: number): GLJournalDtSchemaType => ({
  ...defaultJournalDetails,
  itemNo,
  seqNo: itemNo,
})

interface JournalDetailsFormProps {
  Hdform: UseFormReturn<GLJournalHdSchemaType>
  onAddRowAction?: (rowData: IGLJournalDt) => void
  onCancelEdit?: () => void
  editingDetail?: GLJournalDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: GLJournalDtSchemaType[]
}

export default function JournalDetailsForm({
  Hdform,
  onAddRowAction,
  onCancelEdit: _onCancelEdit,
  editingDetail,
  visible,
  required,
  companyId,
  existingDetails = [],
}: JournalDetailsFormProps) {
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
      ...existingDetails.map((d: GLJournalDtSchemaType) => d.itemNo || 0)
    )
    return maxItemNo + 1
  }

  const form = useForm<GLJournalDtSchemaType>({
    resolver: zodResolver(GLJournalDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail
      ? {
          itemNo: editingDetail.itemNo ?? getNextItemNo(),
          seqNo: editingDetail.seqNo ?? getNextItemNo(),
          glId: editingDetail.glId ?? 0,
          remarks: editingDetail.remarks ?? "",
          productId: editingDetail.productId ?? 0,
          isDebit: editingDetail.isDebit ?? false,
          totAmt: editingDetail.totAmt ?? 0,
          totLocalAmt: editingDetail.totLocalAmt ?? 0,
          totCtyAmt: editingDetail.totCtyAmt ?? 0,
          gstId: editingDetail.gstId ?? 0,
          gstPercentage: editingDetail.gstPercentage ?? 0,
          gstAmt: editingDetail.gstAmt ?? 0,
          gstLocalAmt: editingDetail.gstLocalAmt ?? 0,
          gstCtyAmt: editingDetail.gstCtyAmt ?? 0,
          departmentId: editingDetail.departmentId ?? 0,
          jobOrderId: editingDetail.jobOrderId ?? 0,
          taskId: editingDetail.taskId ?? 0,
          serviceId: editingDetail.serviceId ?? 0,
          employeeId: editingDetail.employeeId ?? 0,
          portId: editingDetail.portId ?? 0,
          vesselId: editingDetail.vesselId ?? 0,
          bargeId: editingDetail.bargeId ?? 0,
          voyageId: editingDetail.voyageId ?? 0,
          editVersion: editingDetail.editVersion ?? 0,
        }
      : createDefaultValues(getNextItemNo()),
  })

  // Watch form values to trigger re-renders when they change
  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")
  const watchedExchangeRate = Hdform.watch("exhRate")
  const watchedCityExchangeRate = Hdform.watch("ctyExhRate")

  // Recalculate local amounts when exchange rate changes
  useEffect(() => {
    const currentValues = form.getValues()

    // Only recalculate if form has values
    if ((currentValues.totAmt ?? 0) > 0) {
      const rowData = form.getValues() as unknown as IGLJournalDt

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
            ...existingDetails.map((d: GLJournalDtSchemaType) => d.itemNo || 0)
          ) + 1

    if (editingDetail) {
      // Determine if editing detail is job-specific or department-specific
      const hasJobOrder = (editingDetail.jobOrderId ?? 0) > 0
      const hasDepartment = (editingDetail.departmentId ?? 0) > 0

      if (hasJobOrder) {
        setIsJobSpecific(true)
      } else if (hasDepartment) {
        setIsJobSpecific(false)
      } else {
        setIsJobSpecific(false)
      }

      form.reset({
        itemNo: editingDetail.itemNo ?? nextItemNo,
        seqNo: editingDetail.seqNo ?? nextItemNo,
        glId: editingDetail.glId ?? 0,
        remarks: editingDetail.remarks ?? "",
        productId: editingDetail.productId ?? 0,
        isDebit: editingDetail.isDebit ?? false,
        totAmt: editingDetail.totAmt ?? 0,
        totLocalAmt: editingDetail.totLocalAmt ?? 0,
        totCtyAmt: editingDetail.totCtyAmt ?? 0,
        gstId: editingDetail.gstId ?? 0,
        gstPercentage: editingDetail.gstPercentage ?? 0,
        gstAmt: editingDetail.gstAmt ?? 0,
        gstLocalAmt: editingDetail.gstLocalAmt ?? 0,
        gstCtyAmt: editingDetail.gstCtyAmt ?? 0,
        departmentId: editingDetail.departmentId ?? 0,
        jobOrderId: editingDetail.jobOrderId ?? 0,
        taskId: editingDetail.taskId ?? 0,
        serviceId: editingDetail.serviceId ?? 0,
        employeeId: editingDetail.employeeId ?? 0,
        portId: editingDetail.portId ?? 0,
        vesselId: editingDetail.vesselId ?? 0,
        bargeId: editingDetail.bargeId ?? 0,
        voyageId: editingDetail.voyageId ?? 0,
        editVersion: editingDetail.editVersion ?? 0,
      })
    } else {
      // New record - reset to defaults
      form.reset(createDefaultValues(nextItemNo))
      setIsJobSpecific(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDetail, existingDetails.length])

  const onSubmit = async (data: GLJournalDtSchemaType) => {
    try {
      // Validate data against schema
      const validationResult = GLJournalDtSchema(required, visible).safeParse(
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

      // Build rowData with all interface fields (including lookup fields from form watch)
      const formValues = form.getValues()
      const rowData: IGLJournalDt = {
        journalId: "0",
        journalNo: "",
        itemNo: data.itemNo ?? currentItemNo,
        seqNo: data.seqNo ?? currentItemNo,
        glId: data.glId ?? 0,
        glCode: formValues.glCode ?? "",
        glName: formValues.glName ?? "",
        remarks: data.remarks ?? "",
        productId: data.productId ?? 0,
        productCode: formValues.productCode ?? "",
        productName: formValues.productName ?? "",
        isDebit: data.isDebit ?? false,
        totAmt: data.totAmt ?? 0,
        totLocalAmt: data.totLocalAmt ?? 0,
        totCtyAmt: data.totCtyAmt ?? 0,
        gstId: data.gstId ?? 0,
        gstName: formValues.gstName ?? "",
        gstPercentage: data.gstPercentage ?? 0,
        gstAmt: data.gstAmt ?? 0,
        gstLocalAmt: data.gstLocalAmt ?? 0,
        gstCtyAmt: data.gstCtyAmt ?? 0,
        departmentId: data.departmentId ?? 0,
        departmentCode: formValues.departmentCode ?? "",
        departmentName: formValues.departmentName ?? "",
        jobOrderId: data.jobOrderId ?? 0,
        jobOrderNo: formValues.jobOrderNo ?? "",
        taskId: data.taskId ?? 0,
        taskName: formValues.taskName ?? "",
        serviceId: data.serviceId ?? 0,
        serviceName: formValues.serviceName ?? "",
        employeeId: data.employeeId ?? 0,
        employeeCode: formValues.employeeCode ?? "",
        employeeName: formValues.employeeName ?? "",
        portId: data.portId ?? 0,
        portCode: formValues.portCode ?? "",
        portName: formValues.portName ?? "",
        vesselId: data.vesselId ?? 0,
        vesselCode: formValues.vesselCode ?? "",
        vesselName: formValues.vesselName ?? "",
        bargeId: data.bargeId ?? 0,
        bargeCode: formValues.bargeCode ?? "",
        bargeName: formValues.bargeName ?? "",
        voyageId: data.voyageId ?? 0,
        voyageNo: formValues.voyageNo ?? "",
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
        const nextItemNo = getNextItemNo() + 1
        form.reset(createDefaultValues(nextItemNo))
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("An error occurred while submitting the form")
    }
  }

  // Handle Product selection
  const handleProductChange = (selectedProduct: IProductLookup | null) => {
    if (selectedProduct) {
      form.setValue("productCode", selectedProduct.productCode)
      form.setValue("productName", selectedProduct.productName)
    } else {
      // Clear product fields
      form.setValue("productId", 0, { shouldValidate: true })
      form.setValue("productCode", "")
      form.setValue("productName", "")
    }
  }

  // Handle Chart of Account selection
  const handleChartOfAccountChange = async (
    selectedAccount: IChartOfAccountLookup | null
  ) => {
    if (selectedAccount) {
      // Store lookup fields in form state for later retrieval
      form.setValue("glCode", selectedAccount.glCode)
      form.setValue("glName", selectedAccount.glName)

      // Set job-specific or department-specific mode based on COA
      const accountIsJobSpecific = selectedAccount.isJobSpecific || false
      setIsJobSpecific(accountIsJobSpecific)

      // Reset dependent fields when switching between job-specific and department-specific
      // This prevents invalid data from being submitted
      if (!accountIsJobSpecific) {
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

      // Sync header GST date
      await setGSTPercentage(
        Hdform,
        Hdform.getValues("data_details"),
        decimals[0],
        visible
      )
    } else {
      // Clear COA and all related fields when account is cleared
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

  // Handle GST selection
  const handleGstChange = async (selectedGst: IGstLookup | null) => {
    if (selectedGst) {
      // Store GST name and percentage for later retrieval
      form.setValue(
        "gstName" as Path<GLJournalDtSchemaType>,
        selectedGst.gstName
      )
      form.setValue("gstPercentage", selectedGst.gstPercentage ?? 0)

      const rowData = form.getValues() as unknown as IGLJournalDt
      await handleGstPercentageChange(Hdform, rowData, decimals[0], visible)

      // Update form values
      form.setValue("gstPercentage", rowData.gstPercentage)
      form.setValue("gstAmt", rowData.gstAmt)
      form.setValue("gstLocalAmt", rowData.gstLocalAmt)
      form.setValue("gstCtyAmt", rowData.gstCtyAmt)
    } else {
      // Clear GST fields
      form.setValue("gstId", 0, { shouldValidate: true })
      form.setValue("gstName" as Path<GLJournalDtSchemaType>, "")
      form.setValue("gstPercentage", 0)
      form.setValue("gstAmt", 0)
      form.setValue("gstLocalAmt", 0)
      form.setValue("gstCtyAmt", 0)
    }
  }

  // Handle amount change
  const handleAmountBlur = () => {
    const rowData = form.getValues() as unknown as IGLJournalDt
    handleTotalamountChange(Hdform, rowData, decimals[0], visible)

    // Update form values
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
          {/* Product (if visible) */}
          {visible?.m_ProductId && (
            <ProductAutocomplete
              form={form}
              name="productId"
              label="Product"
              isRequired={required?.m_ProductId}
              onChangeEvent={handleProductChange}
            />
          )}
          {/* GL Account */}
          <ChartOfAccountAutocomplete
            form={form}
            name="glId"
            label="Chart Of Account"
            isRequired={true}
            companyId={companyId}
            onChangeEvent={handleChartOfAccountChange}
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

          {/* Debit/Credit Toggle */}
          <FormField
            control={form.control}
            name="isDebit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={field.value ? "default" : "outline"}
                      onClick={() => field.onChange(true)}
                      className="flex-1"
                    >
                      Debit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={!field.value ? "default" : "outline"}
                      onClick={() => field.onChange(false)}
                      className="flex-1"
                    >
                      Credit
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Amount */}
          <CustomNumberInput
            form={form}
            name="totAmt"
            label="Amount"
            isRequired={true}
            round={amtDec}
            className="text-right"
            onBlurEvent={handleAmountBlur}
          />

          {/* GST (if visible) */}
          {visible?.m_GstId && (
            <GSTAutocomplete
              form={form}
              name="gstId"
              label="GST"
              isRequired={required?.m_GstId}
              onChangeEvent={handleGstChange}
            />
          )}

          {/* GST Percentage */}
          {visible?.m_GstId && (
            <CustomNumberInput
              form={form}
              name="gstPercentage"
              label="GST %"
              round={2}
              isDisabled={true}
              className="text-right"
            />
          )}

          {/* GST Amount */}
          {visible?.m_GstId && (
            <CustomNumberInput
              form={form}
              name="gstAmt"
              label="GST Amount"
              round={amtDec}
              isDisabled={true}
              className="text-right"
            />
          )}

          {/* Local Amount */}
          <CustomNumberInput
            form={form}
            name="totLocalAmt"
            label="Local Amount"
            round={locAmtDec}
            isDisabled={true}
            className="text-right"
          />

          {/* GST Local Amount */}
          {visible?.m_GstId && (
            <CustomNumberInput
              form={form}
              name="gstLocalAmt"
              label="GST Local Amt"
              round={locAmtDec}
              isDisabled={true}
              className="text-right"
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

          {/* Vessel */}
          {visible?.m_VesselId && (
            <VesselAutocomplete
              form={form}
              name="vesselId"
              label="Vessel"
              isRequired={required?.m_VesselId}
              onChangeEvent={handleVesselChange}
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

          {/* Remarks */}
          {visible?.m_Remarks && (
            <CustomTextarea
              form={form}
              name="remarks"
              label="Remarks"
              isRequired={required?.m_Remarks}
              className="col-span-2"
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
                toast.info("Details Form reset")
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
                  toast.info("Details Edit cancelled")
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
