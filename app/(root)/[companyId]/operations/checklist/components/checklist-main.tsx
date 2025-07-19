"use client"

import React, { useEffect } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { ICurrencyLookup } from "@/interfaces/lookup"
import { JobOrderHdFormValues, JobOrderHdSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/format"
import { saveJobOrderDirect, updateJobOrderDirect } from "@/hooks/use-checklist"
import { Form } from "@/components/ui/form"
import AddressAutocomplete from "@/components/ui-custom/autocomplete-address"
import ContactAutocomplete from "@/components/ui-custom/autocomplete-contact"
import CurrencyAutocomplete from "@/components/ui-custom/autocomplete-currency"
import CustomerAutocomplete from "@/components/ui-custom/autocomplete-customer"
import GstAutocomplete from "@/components/ui-custom/autocomplete-gst"
import PortAutocomplete from "@/components/ui-custom/autocomplete-port"
import StatusAutocomplete from "@/components/ui-custom/autocomplete-status"
import VesselAutocomplete from "@/components/ui-custom/autocomplete-vessel"
import VoyageAutocomplete from "@/components/ui-custom/autocomplete-voyage"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface ChecklistMainProps {
  jobData?: IJobOrderHd | null
  onSuccess?: () => void
  isEdit?: boolean
  setFormRef?: (ref: HTMLFormElement | null) => void
}

export function ChecklistMain({
  jobData,
  onSuccess,
  isEdit = false,
  setFormRef,
}: ChecklistMainProps) {
  const { decimals } = useAuthStore()
  const exhRateDec = decimals[0]?.exhRateDec || 6

  type JobOrderFormValues = z.infer<typeof JobOrderHdSchema>

  // Direct API functions using api-client.ts for save, update operations

  const form = useForm<JobOrderHdFormValues>({
    resolver: zodResolver(JobOrderHdSchema),
    defaultValues: {
      jobOrderId: jobData?.jobOrderId ?? 0,
      jobOrderNo: jobData?.jobOrderNo ?? "",
      jobOrderDate: jobData?.jobOrderDate
        ? format(
            parseDate(jobData.jobOrderDate as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
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
      etaDate: jobData?.etaDate ?? "",
      etdDate: jobData?.etdDate ?? "",
      ownerName: jobData?.ownerName ?? "",
      ownerAgent: jobData?.ownerAgent ?? "",
      masterName: jobData?.masterName ?? "",
      charters: jobData?.charters ?? "",
      chartersAgent: jobData?.chartersAgent ?? "",
      invoiceDate: jobData?.invoiceDate ?? "",
      seriesDate: jobData?.seriesDate ?? "",
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

  useEffect(() => {
    form.reset({
      jobOrderId: jobData?.jobOrderId ?? 0,
      jobOrderNo: jobData?.jobOrderNo ?? "",
      jobOrderDate: jobData?.jobOrderDate
        ? format(
            parseDate(jobData.jobOrderDate as string) || new Date(),
            clientDateFormat
          )
        : format(new Date(), clientDateFormat),
      portId: jobData?.portId ?? 0,
      customerId: jobData?.customerId ?? 0,
      currencyId: jobData?.currencyId ?? 0,
      exhRate: jobData?.exhRate ?? 0,
      vesselId: jobData?.vesselId ?? 0,
      voyageId: jobData?.voyageId ?? 0,
      lastPortId: jobData?.lastPortId ?? 0,
      nextPortId: jobData?.nextPortId ?? 0,
      etaDate: jobData?.etaDate ?? "",
      etdDate: jobData?.etdDate ?? "",
      ownerName: jobData?.ownerName ?? "",
      ownerAgent: jobData?.ownerAgent ?? "",
      masterName: jobData?.masterName ?? "",
      charters: jobData?.charters ?? "",
      chartersAgent: jobData?.chartersAgent ?? "",
      invoiceDate: jobData?.invoiceDate ?? "",
      seriesDate: jobData?.seriesDate ?? "",
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

  const onSubmit = async (data: JobOrderFormValues) => {
    console.log("=== FORM SUBMISSION STARTED ===")
    console.log("Form data received:", data)
    console.log("Form errors:", form.formState.errors)
    console.log("Is edit mode:", isEdit)

    try {
      const formData: Partial<IJobOrderHd> = {
        ...data,
      }

      console.log("Formatted form data:", formData)

      if (isEdit) {
        console.log("Calling updateJobOrder API using api-client.ts...")
        const response = await updateJobOrderDirect(formData)
        console.log("Update API call completed:", response)
        if (response.result === 1) {
          toast.success(response.message || "Job order updated successfully!")
          onSuccess?.()
        } else {
          toast.error(response.message || "Update failed")
        }
      } else {
        console.log("Calling saveJobOrder API using api-client.ts...")
        const response = await saveJobOrderDirect(formData)
        console.log("Save API call completed:", response)
        if (response.result === 1) {
          toast.success(response.message || "Job order created successfully!")
          onSuccess?.()
        } else {
          toast.error(response.message || "Creation failed")
        }
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
          parseDate(jobOrderDate as string) || new Date(),
          clientDateFormat
        )
        const res = await getData(
          `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
        )
        const exhRate = res?.data

        form.setValue("exhRate", +Number(exhRate).toFixed(exhRateDec))
      }
    },
    []
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
          {/* Operation Card */}
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-2 text-lg font-semibold">Operation</div>
            <div className="grid grid-cols-5 gap-2">
              <CustomDateNew
                form={form}
                name="jobOrderDate"
                label="Job Order Date"
                isRequired={true}
                dateFormat="dd/MM/yyyy"
              />
              <CustomerAutocomplete
                form={form}
                name="customerId"
                label="Customer"
                isRequired={true}
                onChangeEvent={(selectedCustomer) => {
                  // Reset address and contact when customer changes
                  if (selectedCustomer?.customerId !== customerId) {
                    form.setValue("addressId", 0)
                    form.setValue("contactId", 0)
                    form.setValue("currencyId", selectedCustomer?.currencyId)

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
              />

              <CustomInput
                form={form}
                name="jobOrderNo"
                label="Job Order No"
                isRequired={true}
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
                    console.log("Setting IMO code to:", selectedVessel.imoCode)
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
              />
              <CustomInput
                form={form}
                name="imoCode"
                label="IMO No"
                isRequired={false}
              />
              <VoyageAutocomplete
                form={form}
                name="voyageId"
                label="Voyage"
                isRequired={false}
              />
              <PortAutocomplete
                form={form}
                name="lastPortId"
                label="Last Port"
                isRequired={false}
              />
              <PortAutocomplete
                form={form}
                name="nextPortId"
                label="Next Port"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="vesselDistance"
                label="Vessel Distance (NM)"
                type="number"
                isRequired={true}
              />

              <CustomDateNew
                form={form}
                name="etaDate"
                label="ETA Date"
                dateFormat="dd/MM/yyyy"
                isRequired={false}
              />
              <CustomDateNew
                form={form}
                name="etdDate"
                label="ETD Date"
                dateFormat="dd/MM/yyyy"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="ownerName"
                label="Owner Name"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="ownerAgent"
                label="Owner Agent"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="masterName"
                label="Master Name"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="charters"
                label="Charters"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="chartersAgent"
                label="Charters Agent"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="natureOfCall"
                label="Nature of Call"
                isRequired={false}
              />
              <CustomInput
                form={form}
                name="isps"
                label="ISPS"
                isRequired={false}
              />
              <StatusAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
              />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2"></div>
          </div>

          {/* Accounts Card */}
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-2 text-lg font-semibold">Accounts</div>
            <div className="grid grid-cols-5 gap-2">
              <CustomDateNew
                form={form}
                name="invoiceDate"
                label="Invoice Date"
                dateFormat="dd/MM/yyyy"
              />
              <CustomDateNew
                form={form}
                name="seriesDate"
                label="Series Date"
                dateFormat="dd/MM/yyyy"
              />
              <AddressAutocomplete
                form={form}
                name="addressId"
                label="Address"
                isRequired
                customerId={customerId || 0}
              />
              <ContactAutocomplete
                form={form}
                name="contactId"
                label="Contact"
                isRequired
                customerId={customerId || 0}
              />
              <CustomSwitch
                form={form}
                name="isTaxable"
                label="Taxable"
                isRequired={false}
              />
              {isTaxable && (
                <GstAutocomplete
                  form={form}
                  name="gstId"
                  label="GST"
                  isRequired={true}
                />
              )}
              {isTaxable && (
                <CustomNumberInput
                  form={form}
                  name="gstPercentage"
                  label="GST %"
                  isRequired={true}
                />
              )}
            </div>
          </div>

          {/* Status Card */}
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-2 text-lg font-semibold">Status</div>
            <div className="grid grid-cols-4 gap-2">
              <CustomSwitch
                form={form}
                name="isClose"
                label="Close"
                isRequired={false}
              />
              <CustomSwitch
                form={form}
                name="isPost"
                label="Post"
                isRequired={false}
              />
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
              />
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isRequired={false}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
