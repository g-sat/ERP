"use client"

import { useState } from "react"
import {
  IBargeLookup,
  IChartofAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IJobOrderLookup,
  IProductLookup,
  IServiceLookup,
  ITaskLookup,
} from "@/interfaces/lookup"
import { ApInvoiceDtSchemaType } from "@/schemas/ap-invoice"
import { useAuthStore } from "@/stores/auth-store"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import BargeAutocomplete from "@/components/autocomplete/autocomplete-barge"
import ChartOfAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import DepartmentAutocomplete from "@/components/autocomplete/autocomplete-department"
import EmployeeAutocomplete from "@/components/autocomplete/autocomplete-employee"
import GSTAutocomplete from "@/components/autocomplete/autocomplete-gst"
import JobOrderAutocomplete from "@/components/autocomplete/autocomplete-joborder"
import JobOrderChargeAutocomplete from "@/components/autocomplete/autocomplete-joborder-charge"
import JobOrderTaskAutocomplete from "@/components/autocomplete/autocomplete-joborder-task"
import ProductAutocomplete from "@/components/autocomplete/autocomplete-product"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

// Extend ApInvoiceDtSchemaType to include id field
interface InvoiceDetailRow extends ApInvoiceDtSchemaType {
  id: string
}

interface InvoiceDetailsFormProps {
  onAddRow?: (rowData: InvoiceDetailRow) => void
  companyId: number
}

export default function InvoiceDetailsForm({
  onAddRow,
  companyId,
}: InvoiceDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2

  // State to manage job-specific vs department-specific rendering
  const [isJobSpecific, setIsJobSpecific] = useState(false)

  const form = useForm<ApInvoiceDtSchemaType>({
    defaultValues: {
      invoiceId: "0",
      invoiceNo: "",
      itemNo: 1,
      seqNo: 1,
      docItemNo: 0,
      productId: 0,
      glId: 0,
      qty: 0,
      billQTY: 0,
      uomId: 0,
      unitPrice: 0,
      totAmt: 0,
      totLocalAmt: 0,
      totCtyAmt: 0,
      remarks: "",
      gstId: 0,
      gstPercentage: 0,
      gstAmt: 0,
      gstLocalAmt: 0,
      gstCtyAmt: 0,
      deliveryDate: null,
      departmentId: 0,
      jobOrderId: 0,
      taskId: 0,
      serviceId: 0,
      employeeId: 0,
      portId: 0,
      vesselId: 0,
      bargeId: 0,
      voyageId: 0,
      operationId: null,
      operationNo: null,
      opRefNo: null,
      salesOrderId: null,
      salesOrderNo: null,
      supplyDate: null,
      customerName: null,
      suppInvoiceNo: null,
      apInvoiceId: null,
      apInvoiceNo: null,
      editVersion: 0,
    },
  })

  // Watch form values to trigger re-renders when they change
  const watchedJobOrderId = form.watch("jobOrderId")
  const watchedTaskId = form.watch("taskId")

  // Debug logging
  console.log("Watched values:", { watchedJobOrderId, watchedTaskId })

  const onSubmit = (data: ApInvoiceDtSchemaType) => {
    if (onAddRow) {
      // Generate a unique ID for the new row
      const newId = crypto.randomUUID
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0
            const v = c === "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })

      const rowData: InvoiceDetailRow = {
        ...data,
        id: newId,
        invoiceId: "0",
        invoiceNo: "",
        itemNo: 0,
        seqNo: 0,
        docItemNo: 0,
        deliveryDate: data.deliveryDate || "",
        supplyDate: data.supplyDate || "",
        operationId: data.operationId || "0",
        operationNo: data.operationNo || "",
        opRefNo: data.opRefNo || "",
        salesOrderId: data.salesOrderId || "",
        salesOrderNo: data.salesOrderNo || "",
        customerName: data.customerName || "",
        suppInvoiceNo: data.suppInvoiceNo || "",
        apInvoiceId: data.apInvoiceId || "",
        apInvoiceNo: data.apInvoiceNo || "",
        editVersion: 0,
      }

      onAddRow(rowData)

      // Reset the form after adding
      form.reset()
    }
  }

  // Handle product selection
  const handleProductChange = (selectedOption: IProductLookup | null) => {
    if (selectedOption) {
      form.setValue("productId", selectedOption.productId)
    }
  }

  // Handle department selection
  const handleDepartmentChange = (selectedOption: IDepartmentLookup | null) => {
    if (selectedOption) {
      form.setValue("departmentId", selectedOption.departmentId)
    }
  }

  // Handle employee selection
  const handleEmployeeChange = (selectedOption: IEmployeeLookup | null) => {
    if (selectedOption) {
      form.setValue("employeeId", selectedOption.employeeId)
    }
  }

  // Handle barge selection
  const handleBargeChange = (selectedOption: IBargeLookup | null) => {
    if (selectedOption) {
      form.setValue("bargeId", selectedOption.bargeId)
    }
  }

  // Handle chart of account selection
  const handleChartOfAccountChange = (
    selectedOption: IChartofAccountLookup | null
  ) => {
    if (selectedOption) {
      console.log(selectedOption)
      form.setValue("glId", selectedOption.glId)

      // Use the actual isJobSpecific property from the chart of account data
      const isJobSpecificAccount = selectedOption.isJobSpecific || false

      setIsJobSpecific(isJobSpecificAccount)

      // Reset dependent fields when switching between job-specific and department-specific
      if (!isJobSpecificAccount) {
        // If switching to department-specific, reset job-related fields
        form.setValue("jobOrderId", 0)
        form.setValue("taskId", 0)
        form.setValue("serviceId", 0)
      } else {
        // If switching to job-specific, reset department field
        form.setValue("departmentId", 0)
      }
    }
  }

  // Handle GST selection
  const handleGSTChange = (selectedOption: IGstLookup | null) => {
    if (selectedOption) {
      form.setValue("gstId", selectedOption.gstId)
      form.setValue("gstPercentage", selectedOption.gstPercentage)

      // Recalculate GST amounts
      const totAmt = form.getValues("totAmt") || 0
      const totLocalAmt = form.getValues("totLocalAmt") || 0
      const gstPercentage = selectedOption.gstPercentage || 0

      const gstAmt = (totAmt * gstPercentage) / 100
      const gstLocalAmt = (totLocalAmt * gstPercentage) / 100

      form.setValue("gstAmt", gstAmt)
      form.setValue("gstLocalAmt", gstLocalAmt)
    }
  }

  // Handle job order selection
  const handleJobOrderChange = (selectedOption: IJobOrderLookup | null) => {
    if (selectedOption) {
      console.log("Job Order selected:", selectedOption)
      form.setValue("jobOrderId", selectedOption.jobOrderId)
      // Reset task and service when job order changes
      form.setValue("taskId", 0)
      form.setValue("serviceId", 0)
      // Trigger form validation to update dependent fields
      form.trigger(["taskId", "serviceId"])
    }
  }

  // Handle task selection
  const handleTaskChange = (selectedOption: ITaskLookup | null) => {
    if (selectedOption) {
      console.log("Task selected:", selectedOption)
      form.setValue("taskId", selectedOption.taskId)
      // Reset service when task changes
      form.setValue("serviceId", 0)
      // Trigger form validation to update dependent fields
      form.trigger(["serviceId"])
    }
  }

  // Handle service selection
  const handleServiceChange = (selectedOption: IServiceLookup | null) => {
    if (selectedOption) {
      console.log("Service selected:", selectedOption)
      form.setValue("serviceId", selectedOption.serviceId)
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Details (New)</h2>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid w-full grid-cols-7 gap-2 p-4"
        >
          {/* Product */}
          <ProductAutocomplete
            form={form}
            name="productId"
            label="Product"
            isRequired={true}
            onChangeEvent={handleProductChange}
          />

          {/* Chart Of Account */}
          <ChartOfAccountAutocomplete
            form={form}
            name="glId"
            label="Chart Of Account"
            isRequired={true}
            onChangeEvent={handleChartOfAccountChange}
            companyId={companyId}
          />

          {/* Conditional rendering based on isJobSpecific */}
          {isJobSpecific ? (
            <>
              {/* Job Order Components */}
              <JobOrderAutocomplete
                form={form}
                name="jobOrderId"
                label="Job Order"
                isRequired={true}
                onChangeEvent={handleJobOrderChange}
              />

              <JobOrderTaskAutocomplete
                key={`task-${watchedJobOrderId}`}
                form={form}
                name="taskId"
                jobOrderId={watchedJobOrderId || 0}
                label="Task"
                isRequired={true}
                onChangeEvent={handleTaskChange}
              />

              <JobOrderChargeAutocomplete
                key={`service-${watchedJobOrderId}-${watchedTaskId}`}
                form={form}
                name="serviceId"
                jobOrderId={watchedJobOrderId || 0}
                taskId={watchedTaskId || 0}
                label="Service"
                isRequired={true}
                onChangeEvent={handleServiceChange}
              />
            </>
          ) : (
            <>
              {/* Department Component */}
              <DepartmentAutocomplete
                form={form}
                name="departmentId"
                label="Department"
                isRequired={true}
                onChangeEvent={handleDepartmentChange}
              />

              {/* Empty divs to maintain grid layout */}
              {/*<div></div> */}
              {/*<div></div> */}
            </>
          )}

          {/* Employee */}
          <EmployeeAutocomplete
            form={form}
            name="employeeId"
            label="Employee"
            isRequired={true}
            onChangeEvent={handleEmployeeChange}
          />

          {/* Barge */}
          <BargeAutocomplete
            form={form}
            name="bargeId"
            label="Barge"
            isRequired={true}
            onChangeEvent={handleBargeChange}
          />

          {/* Total Amount */}
          <CustomNumberInput
            form={form}
            name="totAmt"
            label="Total Amount"
            round={amtDec}
            className="text-right"
          />

          {/* Local Amount */}
          <CustomNumberInput
            form={form}
            name="totLocalAmt"
            label="Total Local Amount"
            round={locAmtDec}
            className="text-right"
          />

          {/* GST */}
          <GSTAutocomplete
            form={form}
            name="gstId"
            label="GST"
            isRequired={true}
            onChangeEvent={handleGSTChange}
          />

          {/* GST Percentage */}
          <CustomNumberInput
            form={form}
            name="gstPercentage"
            label="GST Percentage"
            round={2}
            className="text-right"
          />

          {/* GST Amount */}
          <CustomNumberInput
            form={form}
            name="gstAmt"
            label="GST Amount"
            round={amtDec}
            isDisabled
            className="text-right"
          />

          {/* GST Local Amount */}
          <CustomNumberInput
            form={form}
            name="gstLocalAmt"
            label="GST Local Amount"
            round={locAmtDec}
            isDisabled
            className="text-right"
          />

          {/* Remarks */}
          <CustomTextarea
            form={form}
            name="remarks"
            label="Remarks"
            className="col-span-2"
            minRows={2}
            maxRows={6}
          />

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" size="sm" className="ml-auto">
              Add
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
