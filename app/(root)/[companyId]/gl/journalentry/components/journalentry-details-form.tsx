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
  IChartofAccountLookup,
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
  JobOrderChargeAutocomplete,
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

  // Handle Chart of Account selection
  const handleChartOfAccountChange = async (
    selectedAccount: IChartofAccountLookup | null
  ) => {
    if (selectedAccount) {
      // Store lookup fields in form state for later retrieval
      form.setValue("glCode", selectedAccount.glCode)
      form.setValue("glName", selectedAccount.glName)

      // Set job-specific or department-specific mode based on COA
      const accountIsJobSpecific = selectedAccount.isJobSpecific || false
      setIsJobSpecific(accountIsJobSpecific)

      // Sync header GST date
      await setGSTPercentage(
        Hdform,
        Hdform.getValues("data_details"),
        decimals[0],
        visible
      )
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
    }
  }

  // Handle Product selection
  const handleProductChange = (selectedProduct: IProductLookup | null) => {
    if (selectedProduct) {
      form.setValue("productCode", selectedProduct.productCode)
      form.setValue("productName", selectedProduct.productName)
    }
  }

  // Handle Department selection
  const handleDepartmentChange = (
    selectedDepartment: IDepartmentLookup | null
  ) => {
    if (selectedDepartment) {
      form.setValue("departmentCode", selectedDepartment.departmentCode)
      form.setValue("departmentName", selectedDepartment.departmentName)
    }
  }

  // Handle Employee selection
  const handleEmployeeChange = (selectedEmployee: IEmployeeLookup | null) => {
    if (selectedEmployee) {
      form.setValue("employeeCode", selectedEmployee.employeeCode)
      form.setValue("employeeName", selectedEmployee.employeeName)
    }
  }

  // Handle Port selection
  const handlePortChange = (selectedPort: IPortLookup | null) => {
    if (selectedPort) {
      form.setValue("portCode", selectedPort.portCode)
      form.setValue("portName", selectedPort.portName)
    }
  }

  // Handle Vessel selection
  const handleVesselChange = (selectedVessel: IVesselLookup | null) => {
    if (selectedVessel) {
      form.setValue("vesselCode", selectedVessel.vesselCode)
      form.setValue("vesselName", selectedVessel.vesselName)
    }
  }

  // Handle Barge selection
  const handleBargeChange = (selectedBarge: IBargeLookup | null) => {
    if (selectedBarge) {
      form.setValue("bargeCode", selectedBarge.bargeCode)
      form.setValue("bargeName", selectedBarge.bargeName)
    }
  }

  // Handle Voyage selection
  const handleVoyageChange = (selectedVoyage: IVoyageLookup | null) => {
    if (selectedVoyage) {
      form.setValue("voyageNo", selectedVoyage.voyageNo)
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

  // Handle job order selection
  const handleJobOrderChange = (selectedJobOrder: IJobOrderLookup | null) => {
    if (selectedJobOrder) {
      form.setValue("jobOrderNo", selectedJobOrder.jobOrderNo)
    }
    if (!selectedJobOrder) {
      // Clear task and service when job order is cleared
      form.setValue("taskId", 0)
      form.setValue("serviceId", 0)
    }
  }

  // Handle task selection
  const handleTaskChange = (selectedTask: ITaskLookup | null) => {
    if (selectedTask) {
      form.setValue("taskName", selectedTask.taskName)
    }
    if (!selectedTask) {
      // Clear service when task is cleared
      form.setValue("serviceId", 0)
    }
  }

  // Handle service selection
  const handleServiceChange = (selectedService: IServiceLookup | null) => {
    if (selectedService) {
      form.setValue("serviceName", selectedService.serviceName)
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 rounded-lg border p-3"
      >
        <div className="grid grid-cols-7 gap-2">
          {/* GL Account */}
          <ChartOfAccountAutocomplete
            form={form}
            name="glId"
            label="GL Account"
            isRequired={true}
            companyId={companyId}
            onChangeEvent={handleChartOfAccountChange}
          />

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

          {/* Department (if not job-specific) */}
          {!isJobSpecific && visible?.m_DepartmentId && (
            <DepartmentAutocomplete
              form={form}
              name="departmentId"
              label="Department"
              isRequired={required?.m_DepartmentId}
              onChangeEvent={handleDepartmentChange}
            />
          )}

          {/* Job Order (if job-specific) */}
          {isJobSpecific && visible?.m_JobOrderId && (
            <>
              <JobOrderAutocomplete
                form={form}
                name="jobOrderId"
                label="Job Order"
                isRequired={required?.m_JobOrderId}
                onChangeEvent={handleJobOrderChange}
              />

              {/* Task */}
              {(watchedJobOrderId ?? 0) > 0 && (
                <JobOrderTaskAutocomplete
                  form={form}
                  name="taskId"
                  label="Task"
                  isRequired={required?.m_JobOrderId}
                  jobOrderId={watchedJobOrderId ?? 0}
                  onChangeEvent={handleTaskChange}
                />
              )}

              {/* Service/Charge */}
              {(watchedTaskId ?? 0) > 0 && (
                <JobOrderChargeAutocomplete
                  form={form}
                  name="serviceId"
                  label="Service"
                  isRequired={required?.m_JobOrderId}
                  jobOrderId={watchedJobOrderId ?? 0}
                  taskId={watchedTaskId ?? 0}
                  onChangeEvent={handleServiceChange}
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
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" size="sm">
            {editingDetail ? "Update Row" : "Add Row"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
