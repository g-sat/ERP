"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { IJobOrderHd } from "@/interfaces/checklist"
import { ICurrencyLookup } from "@/interfaces/lookup"
import { JobOrderHdSchema, JobOrderHdSchemaType } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { useSaveJobOrder } from "@/hooks/use-checklist"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export default function NewChecklistPage() {
  const { decimals } = useAuthStore()
  const exhRateDec = decimals[0]?.exhRateDec || 6
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string

  // Use the useSaveJobOrder hook
  const saveJobOrderMutation = useSaveJobOrder()

  // State to track customer code for label display
  const [customerCode, setCustomerCode] = useState<string>("")

  const form = useForm<JobOrderHdSchemaType>({
    resolver: zodResolver(JobOrderHdSchema),
    defaultValues: {
      jobOrderId: 0,
      jobOrderNo: "",
      jobOrderDate: new Date(),
      imoCode: "",
      vesselDistance: 10,
      portId: 0,
      customerId: 0,
      currencyId: 0,
      exhRate: 0,
      vesselId: 0,
      voyageId: 0,
      lastPortId: 0,
      nextPortId: 0,
      etaDate: undefined,
      etdDate: undefined,
      ownerName: "",
      ownerAgent: "",
      masterName: "",
      charters: "",
      chartersAgent: "",
      invoiceDate: new Date(), // Set to current date for new records
      seriesDate: undefined,
      addressId: 0,
      contactId: 0,
      natureOfCall: "",
      isps: "",
      isTaxable: false,
      isClose: false,
      isPost: false,
      isActive: true,
      remarks: "",
      statusId: 201,
      gstId: 0,
      gstPercentage: 0,
      editVersion: "",
    },
  })

  // Watch isTaxable to conditionally show GST field
  const isTaxable = form.watch("isTaxable")

  // Watch customerId to reset address and contact when customer changes
  const customerId = form.watch("customerId")

  // Watch jobOrderDate to update invoiceDate
  const jobOrderDate = form.watch("jobOrderDate")

  // Watch isActive to debug the value
  const isActive = form.watch("isActive")
  console.log("isActive value:", isActive)

  // Reset address and contact when customer changes
  useEffect(() => {
    const currentAddressId = form.getValues("addressId")
    const currentContactId = form.getValues("contactId")

    // Reset address and contact when customer changes (for new form)
    if (customerId && (currentAddressId || currentContactId)) {
      form.setValue("addressId", 0)
      form.setValue("contactId", 0)
      toast.info("Address and contact have been reset for the new customer.")
    }
  }, [customerId, form])

  // Update invoiceDate when jobOrderDate changes
  useEffect(() => {
    if (jobOrderDate) {
      form.setValue("invoiceDate", jobOrderDate)
    }
  }, [jobOrderDate, form])

  // Ensure form is properly initialized with default values
  useEffect(() => {
    form.reset({
      jobOrderId: 0,
      jobOrderNo: "",
      jobOrderDate: new Date(),
      imoCode: "",
      vesselDistance: 10,
      portId: 0,
      customerId: 0,
      currencyId: 0,
      exhRate: 0,
      vesselId: 0,
      voyageId: 0,
      lastPortId: 0,
      nextPortId: 0,
      etaDate: undefined,
      etdDate: undefined,
      ownerName: "",
      ownerAgent: "",
      masterName: "",
      charters: "",
      chartersAgent: "",
      invoiceDate: new Date(),
      seriesDate: undefined,
      addressId: 0,
      contactId: 0,
      natureOfCall: "",
      isps: "",
      isTaxable: false,
      isClose: false,
      isPost: false,
      isActive: true, // Ensure this is explicitly set to true
      remarks: "",
      statusId: 201,
      gstId: 0,
      gstPercentage: 0,
      editVersion: "",
    })

    // Explicitly set isActive to true after a short delay to ensure it's properly set
    setTimeout(() => {
      form.setValue("isActive", true)
      console.log("Explicitly set isActive to true")
    }, 100)
  }, [form])

  // Handle currency selection
  const handleCurrencyChange = useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
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

  // Handle save using useSaveJobOrder hook
  const handleSave = async () => {
    try {
      const formData = form.getValues()
      const response = await saveJobOrderMutation.mutateAsync(formData)

      if (response.result === 1) {
        toast.success(response.message || "Job order created successfully!")
        // Redirect to the new job order page
        const jobOrderId = Array.isArray(response.data)
          ? (response.data[0] as IJobOrderHd)?.jobOrderId
          : (response.data as IJobOrderHd)?.jobOrderId
        if (jobOrderId) {
          router.push(`/${companyId}/operations/checklist/${jobOrderId}`)
        } else {
          // Fallback: redirect to main checklist page
          router.push(`/${companyId}/operations/checklist/new`)
        }
      } else {
        toast.error(response.message || "Failed to create job order")
        // Keep form open and don't reset any data on API error
        // User can retry or make corrections without losing their work
      }
    } catch {
      toast.error("Failed to save job order. Please try again.")
    }
  }

  // Handle reset form
  const handleReset = () => {
    form.reset()
    toast.info("Form has been reset")
  }

  return (
    <div className="container mx-auto space-y-2 px-2 py-2">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create New Job Order
            </h1>
            <p className="text-muted-foreground text-sm">
              Fill in the details to create a new job order
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>

      {/* Form Section */}
      <div>
        <Form {...form}>
          <form className="space-y-6">
            {/* Main Content - Side by Side Layout */}
            <div className="flex gap-4">
              {/* Operation Card - 70% */}
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
                  />
                  <CustomerAutocomplete
                    form={form}
                    name="customerId"
                    label={`Customer${customerCode ? ` (${customerCode})` : ""}`}
                    isRequired={true}
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
                  />

                  <CustomInput
                    form={form}
                    name="jobOrderNo"
                    label="Job Order No"
                  />
                  <VesselAutocomplete
                    form={form}
                    name="vesselId"
                    label="Vessel"
                    isRequired={true}
                    onChangeEvent={(selectedVessel) => {
                      // Populate IMO code when vessel changes
                      if (selectedVessel?.imoCode) {
                        form.setValue("imoCode", selectedVessel.imoCode)
                        toast.info(
                          `IMO code has been populated: ${selectedVessel.imoCode}`
                        )
                      } else {
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

                  <CustomDateTimePicker
                    form={form}
                    name="etaDate"
                    label="ETA Date"
                    isRequired={false}
                  />
                  <CustomDateTimePicker
                    form={form}
                    name="etdDate"
                    label="ETD Date"
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
                  <div className="col-span-2">
                    <CustomTextarea
                      form={form}
                      name="remarks"
                      label="Remarks"
                      isRequired={false}
                    />
                  </div>
                </div>
              </div>

              {/* Accounts Card - 30% */}
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
                  />
                  <CustomDateNew
                    form={form}
                    name="seriesDate"
                    label="Series Date"
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

                  <CustomCheckbox
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

                  <CustomCheckbox
                    form={form}
                    name="isClose"
                    label="Close"
                    isRequired={false}
                  />
                  <CustomCheckbox
                    form={form}
                    name="isPost"
                    label="Post"
                    isRequired={false}
                  />
                  <CustomCheckbox
                    form={form}
                    name="isActive"
                    label="Active Status"
                    isRequired={false}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
