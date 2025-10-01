"use client"

import React, { useEffect, useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { ICurrencyLookup } from "@/interfaces/lookup"
import { JobOrderHdSchema, JobOrderHdSchemaType } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import {
  clientDateFormat,
  formatDateWithoutTimezone,
  parseDate,
} from "@/lib/date-utils"
import { updateJobOrderDirect } from "@/hooks/use-checklist"
import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/ui/form"
import AddressAutocomplete from "@/components/autocomplete/autocomplete-address"
import ContactAutocomplete from "@/components/autocomplete/autocomplete-contact"
import CurrencyAutocomplete from "@/components/autocomplete/autocomplete-currency"
import CustomerAutocomplete from "@/components/autocomplete/autocomplete-customer"
import GstAutocomplete from "@/components/autocomplete/autocomplete-gst"
import PortAutocomplete from "@/components/autocomplete/autocomplete-port"
import StatusAutocomplete from "@/components/autocomplete/autocomplete-status"
import VesselAutocomplete from "@/components/autocomplete/autocomplete-vessel"
import VoyageAutocomplete from "@/components/autocomplete/autocomplete-voyage"
import CustomCheckbox from "@/components/custom/custom-checkbox"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import { CustomDateTimePicker } from "@/components/custom/custom-date-time-picker"
import CustomInput from "@/components/custom/custom-input"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

interface ChecklistMainProps {
  jobData?: IJobOrderHd | null
  setFormRef?: (ref: HTMLFormElement | null) => void
  isConfirmed?: boolean
}

export function ChecklistMain({
  jobData,
  setFormRef,
  isConfirmed,
}: ChecklistMainProps) {
  const { decimals } = useAuthStore()
  const exhRateDec = decimals[0]?.exhRateDec || 6

  // State to track customer code for label display
  const [customerCode, setCustomerCode] = useState<string>("")

  type JobOrderSchemaType = z.infer<typeof JobOrderHdSchema>

  // Direct API functions using api-client.ts for save, update operations

  const form = useForm<JobOrderHdSchemaType>({
    resolver: zodResolver(JobOrderHdSchema),
    defaultValues: {
      jobOrderId: jobData?.jobOrderId ?? 0,
      jobOrderNo: jobData?.jobOrderNo ?? "",
      jobOrderDate: jobData?.jobOrderDate
        ? parseDate(jobData.jobOrderDate as string) || undefined
        : new Date(),
      imoCode: jobData?.imoCode ?? "",
      vesselDistance: jobData?.vesselDistance ?? 10,
      portId: jobData?.portId ?? 0,
      customerId: jobData?.customerId ?? 0,
      currencyId: jobData?.currencyId ?? 0,
      exhRate: jobData?.exhRate ?? 0,
      vesselId: jobData?.vesselId ?? 0,
      voyageId: jobData?.voyageId ?? 0,
      lastPortId: jobData?.lastPortId ?? 0,
      nextPortId: jobData?.nextPortId ?? 0,
      etaDate: jobData?.etaDate
        ? parseDate(jobData.etaDate as string) || undefined
        : undefined,
      etdDate: jobData?.etdDate
        ? parseDate(jobData.etdDate as string) || undefined
        : undefined,
      ownerName: jobData?.ownerName ?? "",
      ownerAgent: jobData?.ownerAgent ?? "",
      masterName: jobData?.masterName ?? "",
      charters: jobData?.charters ?? "",
      chartersAgent: jobData?.chartersAgent ?? "",
      invoiceDate: jobData?.invoiceDate
        ? parseDate(jobData.invoiceDate as string) || undefined
        : undefined,
      seriesDate: jobData?.seriesDate
        ? parseDate(jobData.seriesDate as string) || undefined
        : undefined,
      addressId: jobData?.addressId ?? 0,
      contactId: jobData?.contactId ?? 0,
      natureOfCall: jobData?.natureOfCall ?? "",
      isps: jobData?.isps ?? "",
      isTaxable: jobData?.isTaxable ?? false,
      isClose: jobData?.isClose ?? false,
      isPost: jobData?.isPost ?? false,
      isActive: jobData?.isActive ?? true,
      remarks: jobData?.remarks ?? "",
      statusId: jobData?.statusId ?? 201,
      gstId: jobData?.gstId ?? 0,
      gstPercentage: jobData?.gstPercentage ?? 0,
      editVersion: jobData?.editVersion ?? "",
    },
  })

  // Watch isTaxable to conditionally show GST field
  const isTaxable = form.watch("isTaxable")

  // Watch customerId to reset address and contact when customer changes
  const customerId = form.watch("customerId")

  // Watch jobOrderDate to update invoiceDate
  const jobOrderDate = form.watch("jobOrderDate")

  useEffect(() => {
    form.reset({
      jobOrderId: jobData?.jobOrderId ?? 0,
      jobOrderNo: jobData?.jobOrderNo ?? "",
      jobOrderDate: jobData?.jobOrderDate
        ? parseDate(jobData.jobOrderDate as string) || new Date()
        : new Date(),
      portId: jobData?.portId ?? 0,
      customerId: jobData?.customerId ?? 0,
      currencyId: jobData?.currencyId ?? 0,
      exhRate: jobData?.exhRate ?? 0,
      vesselId: jobData?.vesselId ?? 0,
      voyageId: jobData?.voyageId ?? 0,
      lastPortId: jobData?.lastPortId ?? 0,
      nextPortId: jobData?.nextPortId ?? 0,
      etaDate: jobData?.etaDate
        ? parseDate(jobData.etaDate as string) || undefined
        : undefined,
      etdDate: jobData?.etdDate
        ? parseDate(jobData.etdDate as string) || undefined
        : undefined,
      ownerName: jobData?.ownerName ?? "",
      ownerAgent: jobData?.ownerAgent ?? "",
      masterName: jobData?.masterName ?? "",
      charters: jobData?.charters ?? "",
      chartersAgent: jobData?.chartersAgent ?? "",
      invoiceDate: jobData?.invoiceDate
        ? parseDate(jobData.invoiceDate as string) || undefined
        : undefined,
      seriesDate: jobData?.seriesDate
        ? parseDate(jobData.seriesDate as string) || undefined
        : undefined,
      addressId: jobData?.addressId ?? 0,
      contactId: jobData?.contactId ?? 0,
      natureOfCall: jobData?.natureOfCall ?? "",
      isps: jobData?.isps ?? "",
      imoCode: jobData?.imoCode ?? "",
      isTaxable: jobData?.isTaxable ?? false,
      isClose: jobData?.isClose ?? false,
      isPost: jobData?.isPost ?? false,
      isActive: jobData?.isActive ?? true,
      remarks: jobData?.remarks ?? "",
      statusId: jobData?.statusId ?? 201,
      gstId: jobData?.gstId ?? 0,
      gstPercentage: jobData?.gstPercentage ?? 0,
      editVersion: jobData?.editVersion ?? "",
      vesselDistance: jobData?.vesselDistance ?? 10,
    })
  }, [jobData, form])

  // Reset address and contact when customer changes (only for new selections, not initial load)
  useEffect(() => {
    const currentAddressId = form.getValues("addressId")
    const currentContactId = form.getValues("contactId")

    // Only reset if we have a customer change and there were previously selected address/contact
    if (
      customerId &&
      customerId !== jobData?.customerId &&
      (currentAddressId || currentContactId)
    ) {
      form.setValue("addressId", 0)
      form.setValue("contactId", 0)
      toast.info("Address and contact have been reset for the new customer.")
    }
  }, [customerId, jobData?.customerId, form])

  // Update invoiceDate when jobOrderDate changes
  useEffect(() => {
    if (jobOrderDate) {
      form.setValue("invoiceDate", jobOrderDate)
    }
  }, [jobOrderDate, form])

  // Initialize customer code when jobData is loaded
  useEffect(() => {
    if (jobData?.customerCode) {
      setCustomerCode(jobData.customerCode)
    }
  }, [jobData?.customerCode])

  const onSubmit = async (data: JobOrderSchemaType) => {
    try {
      const formData: Partial<IJobOrderHd> = {
        ...data,
        jobOrderDate:
          data.jobOrderDate instanceof Date
            ? formatDateWithoutTimezone(data.jobOrderDate)
            : data.jobOrderDate,
        etaDate: formatDateWithoutTimezone(data.etaDate),
        etdDate: formatDateWithoutTimezone(data.etdDate),
        invoiceDate:
          data.invoiceDate instanceof Date
            ? formatDateWithoutTimezone(data.invoiceDate)
            : data.invoiceDate,
        seriesDate:
          data.seriesDate instanceof Date
            ? formatDateWithoutTimezone(data.seriesDate)
            : data.seriesDate,
      }

      console.log("Formatted form data:", formData)

      console.log("Calling updateJobOrder API using api-client.ts...")
      const response = await updateJobOrderDirect(formData)
      console.log("Update API call completed:", response)
      if (response.result === 1) {
        toast.success(response.message || "Job order updated successfully!")
      } else {
        toast.error(response.message || "Update failed")
      }
    } catch (error) {
      console.error("Error saving job order:", error)
      toast.error("Failed to save job order. Please try again.")
      // Don't call onSuccess on failure - keep dialog open
    }
  }

  // Handle currency selection
  const handleCurrencyChange = React.useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      // Additional logic when currency changes
      console.log("Selected currency:", selectedCurrency)
      const currencyId = selectedCurrency?.currencyId || 0
      const jobOrderDate = form.getValues("jobOrderDate")

      if (currencyId && jobOrderDate) {
        const dt = format(
          jobOrderDate instanceof Date
            ? jobOrderDate
            : parseDate(jobOrderDate as string) || new Date(),
          clientDateFormat
        )
        const res = await getData(
          `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
        )
        const exhRate = res?.data

        form.setValue("exhRate", +Number(exhRate).toFixed(exhRateDec))
      }
    },
    [exhRateDec, form]
  )

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("Form submit event triggered")
            form.handleSubmit(onSubmit)(e)
          }}
          className="space-y-6"
          ref={setFormRef}
        >
          {/* Main Content - Side by Side Layout */}
          <div className="flex gap-4">
            {/* Operation Card - 75% */}
            <div className="w-[75%] rounded-lg border p-4">
              <div className="mb-2 flex">
                <Badge
                  variant="secondary"
                  className="border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm transition-colors duration-200 hover:bg-blue-200"
                >
                  🔧 Operation
                </Badge>
              </div>
              <div className="mb-4 border-b border-gray-200"></div>
              <div className="grid grid-cols-3 gap-2">
                <CustomDateNew
                  form={form}
                  name="jobOrderDate"
                  label="Job Order Date"
                  isRequired={true}
                  isDisabled={isConfirmed}
                />
                <CustomerAutocomplete
                  form={form}
                  name="customerId"
                  label={`Customer${customerCode ? ` (${customerCode})` : ""}`}
                  isRequired={true}
                  isDisabled={isConfirmed}
                  onChangeEvent={(selectedCustomer) => {
                    // Reset address and contact when customer changes
                    if (selectedCustomer?.customerId !== customerId) {
                      form.setValue("addressId", 0)
                      form.setValue("contactId", 0)
                      form.setValue(
                        "currencyId",
                        selectedCustomer?.currencyId ?? 0
                      )

                      // Store customer code for label display
                      if (selectedCustomer?.customerCode) {
                        setCustomerCode(selectedCustomer.customerCode)
                      } else {
                        setCustomerCode("")
                      }

                      // Trigger currency change to update exchange rate
                      if (selectedCustomer?.currencyId) {
                        // Create a minimal currency object for the API call
                        const currencyObj = {
                          currencyId: selectedCustomer.currencyId,
                          currencyCode: "",
                          currencyName: "",
                          isMultiply: false,
                        }
                        handleCurrencyChange(currencyObj)
                      }

                      toast.info(
                        "Address and contact have been reset for the new customer."
                      )
                    }
                  }}
                />
                <CurrencyAutocomplete
                  form={form}
                  name="currencyId"
                  label="Currency"
                  isRequired={true}
                  isDisabled={true}
                  onChangeEvent={handleCurrencyChange}
                />
                {/* Exchange Rate */}
                <CustomNumberInput
                  form={form}
                  name="exhRate"
                  label="Exchange Rate"
                  isRequired={true}
                  isDisabled={true}
                  round={exhRateDec}
                  className="text-right"
                />

                <PortAutocomplete
                  form={form}
                  name="portId"
                  label="Port"
                  isRequired={true}
                  isDisabled={isConfirmed}
                />

                <CustomInput
                  form={form}
                  name="jobOrderNo"
                  label="Job Order No"
                  isDisabled={isConfirmed}
                />
                <VesselAutocomplete
                  form={form}
                  name="vesselId"
                  label="Vessel"
                  isRequired={true}
                  onChangeEvent={(selectedVessel) => {
                    console.log("Selected vessel:", selectedVessel)
                    console.log(
                      "Selected vessel IMO code:",
                      selectedVessel?.imoCode
                    )
                    console.log("All vessel data:", selectedVessel)

                    // Populate IMO code when vessel changes
                    if (selectedVessel?.imoCode) {
                      console.log(
                        "Setting IMO code to:",
                        selectedVessel.imoCode
                      )
                      form.setValue("imoCode", selectedVessel.imoCode)
                      toast.info(
                        `IMO code has been populated: ${selectedVessel.imoCode}`
                      )
                    } else {
                      console.log("No IMO code found, clearing field")
                      form.setValue("imoCode", "")
                      if (selectedVessel) {
                        toast.info("Selected vessel has no IMO code")
                      }
                    }
                  }}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="imoCode"
                  label="IMO No"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <VoyageAutocomplete
                  form={form}
                  name="voyageId"
                  label="Voyage"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <PortAutocomplete
                  form={form}
                  name="lastPortId"
                  label="Last Port"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <PortAutocomplete
                  form={form}
                  name="nextPortId"
                  label="Next Port"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="vesselDistance"
                  label="Vessel Distance (NM)"
                  type="number"
                  isRequired={true}
                  isDisabled={isConfirmed}
                />

                <CustomDateTimePicker
                  form={form}
                  name="etaDate"
                  label="ETA Date"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomDateTimePicker
                  form={form}
                  name="etdDate"
                  label="ETD Date"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="ownerName"
                  label="Owner Name"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="ownerAgent"
                  label="Owner Agent"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="masterName"
                  label="Master Name"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="charters"
                  label="Charters"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="chartersAgent"
                  label="Charters Agent"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="natureOfCall"
                  label="Nature of Call"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomInput
                  form={form}
                  name="isps"
                  label="ISPS"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <StatusAutocomplete
                  form={form}
                  name="statusId"
                  label="Status"
                  isRequired={true}
                  isDisabled={isConfirmed}
                />
                <div className="col-span-2">
                  <CustomTextarea
                    form={form}
                    name="remarks"
                    label="Remarks"
                    isRequired={false}
                    isDisabled={isConfirmed}
                  />
                </div>
              </div>
            </div>

            {/* Accounts Card - 25% */}
            <div className="w-[25%] rounded-lg border p-4">
              <div className="mb-2 flex">
                <Badge
                  variant="outline"
                  className="border-green-300 bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm transition-colors duration-200 hover:bg-green-200"
                >
                  💰 Accounts
                </Badge>
              </div>
              <div className="mb-4 border-b border-gray-200"></div>
              <div className="grid grid-cols-1 gap-2">
                <CustomDateNew
                  form={form}
                  name="invoiceDate"
                  label="Invoice Date"
                  isDisabled={isConfirmed}
                />
                <CustomDateNew
                  form={form}
                  name="seriesDate"
                  label="Series Date"
                  isDisabled={isConfirmed}
                />
                <AddressAutocomplete
                  form={form}
                  name="addressId"
                  label="Address"
                  isRequired
                  customerId={customerId || 0}
                  isDisabled={isConfirmed}
                />
                <ContactAutocomplete
                  form={form}
                  name="contactId"
                  label="Contact"
                  isRequired
                  customerId={customerId || 0}
                  isDisabled={isConfirmed}
                />

                <CustomCheckbox
                  form={form}
                  name="isTaxable"
                  label="Taxable"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />

                {isTaxable && (
                  <GstAutocomplete
                    form={form}
                    name="gstId"
                    label="GST"
                    isRequired={true}
                    isDisabled={isConfirmed}
                  />
                )}
                {isTaxable && (
                  <CustomNumberInput
                    form={form}
                    name="gstPercentage"
                    label="GST %"
                    isRequired={true}
                    isDisabled={isConfirmed}
                  />
                )}

                <CustomCheckbox
                  form={form}
                  name="isClose"
                  label="Close"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomCheckbox
                  form={form}
                  name="isPost"
                  label="Post"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
                <CustomCheckbox
                  form={form}
                  name="isActive"
                  label="Active"
                  isRequired={false}
                  isDisabled={isConfirmed}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
