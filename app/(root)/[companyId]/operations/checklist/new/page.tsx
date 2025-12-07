"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { setExchangeRate_JobOrder } from "@/helpers/account"
import { IJobOrderHd } from "@/interfaces/checklist"
import {
  ICurrencyLookup,
  ICustomerLookup,
  IVesselLookup,
} from "@/interfaces/lookup"
import { JobOrderHdSchema, JobOrderHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, isValid, parse } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import {
  clientDateFormat,
  formatDateWithoutTimezone,
  parseDate,
} from "@/lib/date-utils"
import { useSaveJobOrder } from "@/hooks/use-checklist"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  AddressAutocomplete,
  ContactAutocomplete,
  CurrencyAutocomplete,
  CustomerAutocomplete,
  DynamicVesselAutocomplete,
  GSTAutocomplete,
  PortAutocomplete,
  StatusAutocomplete,
  VoyageAutocomplete,
} from "@/components/autocomplete"
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

  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )

  const parseWithFallback = useCallback(
    (value: string | Date | null | undefined): Date | null => {
      if (!value) return null
      if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value
      }

      if (typeof value !== "string") return null

      const parsed = parse(value, dateFormat, new Date())
      if (isValid(parsed)) {
        return parsed
      }

      return parseDate(value)
    },
    [dateFormat]
  )

  // Use the useSaveJobOrder hook
  const saveJobOrderMutation = useSaveJobOrder()

  // State to track customer code for label display
  const [customerCode, setCustomerCode] = useState<string>("")

  const form = useForm<JobOrderHdSchemaType>({
    resolver: zodResolver(JobOrderHdSchema),
    defaultValues: {
      jobOrderId: 0,
      jobOrderNo: "",
      jobOrderDate: format(new Date(), dateFormat),
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
      accountDate: format(new Date(), dateFormat), // Set to current date as string for new records
      seriesDate: format(new Date(), dateFormat), // Set to current date as string for new records
      addressId: 0,
      contactId: 0,
      natureOfCall: "",
      isps: "",
      isTaxable: false,
      isClose: false,
      isPost: false,
      isActive: true,
      remarks: "",
      jobStatusId: 201,
      gstId: 0,
      gstPercentage: 0,
      editVersion: 0,
    },
  })

  // Watch isTaxable to conditionally show GST field
  const isTaxable = form.watch("isTaxable")

  // Watch customerId to reset address and contact when customer changes
  const customerId = form.watch("customerId")

  // Watch jobOrderDate to update accountDate
  const jobOrderDate = form.watch("jobOrderDate")

  // Watch accountDate to update exchange rate
  const accountDate = form.watch("accountDate")

  // Watch currencyId to update exchange rate
  const currencyId = form.watch("currencyId")

  // Watch etaDate and etdDate for validation
  const etaDate = form.watch("etaDate")
  const etdDate = form.watch("etdDate")

  // Validate etaDate and etdDate rules
  useEffect(() => {
    // Rule 1: If etaDate is empty, then etdDate should be empty
    if (!etaDate && etdDate) {
      form.setValue("etdDate", undefined, { shouldValidate: false })
      toast.info("ETD Date has been cleared because ETA Date is empty")
      return
    }

    // Rule 2 & 3: If etaDate >= etdDate (with time), then etdDate should be empty
    if (etaDate && etdDate) {
      const eta = etaDate instanceof Date ? etaDate : new Date(etaDate)
      const etd = etdDate instanceof Date ? etdDate : new Date(etdDate)

      // Compare dates with time (full timestamp comparison)
      if (eta.getTime() >= etd.getTime()) {
        form.setValue("etdDate", undefined, { shouldValidate: false })
        toast.error(
          "ETD Date must be greater than ETA Date (with time). ETD Date has been cleared."
        )
      }
    }
  }, [etaDate, etdDate, form])

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

  // Update accountDate when jobOrderDate changes
  useEffect(() => {
    if (jobOrderDate) {
      // Ensure accountDate is set as string
      const accountDateStr =
        typeof jobOrderDate === "string"
          ? jobOrderDate
          : format(jobOrderDate, dateFormat)
      form.setValue("accountDate", accountDateStr)
    }
  }, [dateFormat, form, jobOrderDate])

  // Update exchange rate when accountDate or currencyId changes
  useEffect(() => {
    const updateExchangeRate = async () => {
      if (accountDate && currencyId) {
        try {
          // Format date to yyyy-MM-dd (matching account.ts pattern)
          // accountDate is always a string in clientDateFormat
          const parsedAccountDate = parseWithFallback(accountDate)
          if (!parsedAccountDate) return

          const dt = format(parsedAccountDate, "yyyy-MM-dd")
          const res = await getData(
            `${BasicSetting.getExchangeRate}/${currencyId}/${dt}`
          )
          const exhRate = res?.data

          if (exhRate) {
            form.setValue("exhRate", +Number(exhRate).toFixed(exhRateDec))
          }
        } catch (error) {
          console.error("Error fetching exchange rate:", error)
        }
      }
    }

    updateExchangeRate()
  }, [accountDate, currencyId, exhRateDec, form, parseWithFallback])

  // Handle currency selection
  const handleCurrencyChange = useCallback(
    async (selectedCurrency: ICurrencyLookup | null) => {
      const selectedCurrencyId = selectedCurrency?.currencyId || 0
      const accountDate =
        form.getValues("accountDate") || form.getValues("jobOrderDate")

      if (selectedCurrencyId && accountDate) {
        // Format date to yyyy-MM-dd (matching account.ts pattern)
        // accountDate is always a string in clientDateFormat
        const parsedAccountDate = parseWithFallback(accountDate)
        if (!parsedAccountDate) return

        const dt = format(parsedAccountDate, "yyyy-MM-dd")
        const res = await getData(
          `${BasicSetting.getExchangeRate}/${selectedCurrencyId}/${dt}`
        )
        const exhRate = res?.data

        if (exhRate) {
          form.setValue("exhRate", +Number(exhRate).toFixed(exhRateDec))
        }
      }
    },
    [exhRateDec, form, parseWithFallback]
  )

  // Handle customer selection
  const handleCustomerChange = useCallback(
    async (selectedCustomer: ICustomerLookup | null) => {
      if (selectedCustomer) {
        // Reset address and contact when customer changes
        form.setValue("addressId", 0)
        form.setValue("contactId", 0)
        form.setValue("currencyId", selectedCustomer.currencyId || 0)

        // Store customer code for label display
        if (selectedCustomer.customerCode) {
          setCustomerCode(selectedCustomer.customerCode)
        } else {
          setCustomerCode("")
        }

        // Set exchange rate using the job order specific function
        await setExchangeRate_JobOrder(form, exhRateDec)

        toast.info("Address and contact have been reset for the new customer.")
      } else {
        // Clear fields when customer is cleared
        form.setValue("addressId", 0)
        form.setValue("contactId", 0)
        form.setValue("currencyId", 0)
        setCustomerCode("")
        form.setValue("exhRate", 0)
      }
    },
    [form, exhRateDec]
  )

  // Handle vessel selection
  const handleVesselChange = useCallback(
    (selectedVessel: IVesselLookup | null) => {
      if (selectedVessel) {
        // Populate IMO code when vessel changes
        if (selectedVessel.imoCode) {
          form.setValue("imoCode", selectedVessel.imoCode)
          toast.info(`IMO code has been populated: ${selectedVessel.imoCode}`)
        } else {
          form.setValue("imoCode", "")
          toast.info("Selected vessel has no IMO code")
        }
      } else {
        // Clear IMO code when vessel is cleared
        form.setValue("imoCode", "")
      }
    },
    [form]
  )

  // Handle form submission
  const onSubmit = async (values: JobOrderHdSchemaType) => {
    console.log("onSubmit:", values)
    try {
      // Validate etaDate < etdDate before submission (with time)
      if (values.etaDate && values.etdDate) {
        const eta =
          values.etaDate instanceof Date
            ? values.etaDate
            : new Date(values.etaDate)
        const etd =
          values.etdDate instanceof Date
            ? values.etdDate
            : new Date(values.etdDate)

        // Compare dates with time (full timestamp comparison)
        if (eta.getTime() >= etd.getTime()) {
          toast.error("ETD Date must be greater than ETA Date (with time)")
          return
        }
      }

      // Format dates - following ar-invoice pattern
      // Transform form values to ensure dates are properly formatted as strings
      // Use transformToSchemaType pattern (like AR invoice) to ensure consistency
      const transformToSchemaType = (
        formData: JobOrderHdSchemaType
      ): JobOrderHdSchemaType => {
        return {
          ...formData,
          // Date-only fields: ensure they are strings in "dd/MM/yyyy" format
          jobOrderDate:
            typeof formData.jobOrderDate === "string"
              ? formData.jobOrderDate
              : format(
                  formData.jobOrderDate instanceof Date
                    ? formData.jobOrderDate
                    : parseWithFallback(formData.jobOrderDate) || new Date(),
                  dateFormat
                ),
          accountDate:
            typeof formData.accountDate === "string"
              ? formData.accountDate
              : format(
                  formData.accountDate instanceof Date
                    ? formData.accountDate
                    : parseWithFallback(formData.accountDate) || new Date(),
                  dateFormat
                ),
          seriesDate:
            typeof formData.seriesDate === "string"
              ? formData.seriesDate
              : format(
                  formData.seriesDate instanceof Date
                    ? formData.seriesDate
                    : parseWithFallback(formData.seriesDate) || new Date(),
                  dateFormat
                ),
        }
      }

      const formValues = transformToSchemaType(values)

      // Format DateTime fields - convert null to undefined to match IJobOrderHd interface
      const etaDateFormatted = values.etaDate
        ? formatDateWithoutTimezone(values.etaDate)
        : undefined
      const etdDateFormatted = values.etdDate
        ? formatDateWithoutTimezone(values.etdDate)
        : undefined

      const formData: Partial<IJobOrderHd> = {
        ...formValues,
        // Date-only fields: already strings formatted with company date format (from transformToSchemaType)
        jobOrderDate: formValues.jobOrderDate as string,
        accountDate: formValues.accountDate as string,
        seriesDate: formValues.seriesDate as string,
        // DateTime fields: format with time using formatDateWithoutTimezone
        // Convert null to undefined to match IJobOrderHd interface (Date | string | undefined, not null)
        etaDate: etaDateFormatted,
        etdDate: etdDateFormatted,
      }

      const response = await saveJobOrderMutation.mutateAsync(
        formData as JobOrderHdSchemaType
      )

      if (response.result === 1) {
        // Extract job order data from response (handle array or object)
        const jobOrderData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Get jobOrderId from response data
        const jobOrderId = (jobOrderData as IJobOrderHd)?.jobOrderId

        toast.success(response.message || "Job order created successfully!")

        // Redirect to the new job order page
        if (jobOrderId) {
          router.push(`/${companyId}/operations/checklist/${jobOrderId}`)
        } else {
          // Fallback: redirect to main checklist page
          router.push(`/${companyId}/operations/checklist`)
        }
      } else {
        toast.error(response.message || "Failed to create job order")
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
    <div className="@container mx-auto space-y-2 px-2 py-2">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create New Checklist
            </h1>
            <p className="text-muted-foreground text-sm">
              Fill in the details to create a new checklist
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            type="submit"
            form="job-order-form"
            disabled={saveJobOrderMutation.isPending}
          >
            {saveJobOrderMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Form Section */}
      <div>
        <Form {...form}>
          <form
            id="job-order-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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
                <div className="grid grid-cols-4 gap-2">
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
                    onChangeEvent={handleCustomerChange}
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
                  <DynamicVesselAutocomplete
                    form={form}
                    name="vesselId"
                    label="Vessel"
                    isRequired={true}
                    onChangeEvent={handleVesselChange}
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
                    isFutureShow={true}
                  />
                  <CustomDateTimePicker
                    form={form}
                    name="etdDate"
                    label="ETD Date"
                    isRequired={false}
                    isFutureShow={true}
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
                    name="jobStatusId"
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
                    name="accountDate"
                    label="Account Date"
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
                    <GSTAutocomplete
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
