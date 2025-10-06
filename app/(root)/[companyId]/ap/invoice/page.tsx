"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  IApInvoiceDt,
  IApInvoiceFilter,
  IApInvoiceHd,
} from "@/interfaces/ap-invoice"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ApInvoiceHdSchemaType, apinvoiceHdSchema } from "@/schemas/ap-invoice"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, subMonths } from "date-fns"
import {
  Copy,
  ListFilter,
  Printer,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getById } from "@/lib/api-client"
import { ApInvoice } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { useDelete, useGetWithDates, usePersist } from "@/hooks/use-common"
import { useGetRequiredFields, useGetVisibleFields } from "@/hooks/use-lookup"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import History from "./components/history"
import { defaultInvoice } from "./components/invoice-defaultvalues"
import InvoiceTable from "./components/invoice-table"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function InvoicePage() {
  const params = useParams()
  const companyId = params.companyId as string

  const [showListDialog, setShowListDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState({
    save: false,
    reset: false,
    clone: false,
    delete: false,
    load: false,
  })
  const [invoice, setInvoice] = useState<ApInvoiceHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IApInvoiceFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "invoiceNo",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: 10,
  })

  const moduleId = 25
  const transactionId = 1

  const { data: visibleFieldsData } = useGetVisibleFields(
    moduleId,
    transactionId
  )
  const { data: visibleFields } = visibleFieldsData ?? {}

  const { data: requiredFieldsData } = useGetRequiredFields(
    moduleId,
    transactionId
  )
  const { data: requiredFields } = requiredFieldsData ?? {}

  // Use nullish coalescing to handle fallback values
  const visible: IVisibleFields = visibleFields ?? null
  const required: IMandatoryFields = requiredFields ?? null

  // Add form state management
  const form = useForm<ApInvoiceHdSchemaType>({
    resolver: zodResolver(apinvoiceHdSchema(required, visible)),
    defaultValues: invoice
      ? {
          invoiceId: invoice.invoiceId?.toString() ?? "0",
          invoiceNo: invoice.invoiceNo ?? "",
          referenceNo: invoice.referenceNo ?? null,
          trnDate: invoice.trnDate ?? new Date(),
          accountDate: invoice.accountDate ?? new Date(),
          dueDate: invoice.dueDate ?? new Date(),
          deliveryDate: invoice.deliveryDate ?? new Date(),
          gstClaimDate: invoice.gstClaimDate ?? new Date(),
          supplierId: invoice.supplierId ?? 0,
          currencyId: invoice.currencyId ?? 0,
          exhRate: invoice.exhRate ?? 0,
          ctyExhRate: invoice.ctyExhRate ?? 0,
          creditTermId: invoice.creditTermId ?? 0,
          bankId: invoice.bankId ?? 0,
          totAmt: invoice.totAmt ?? 0,
          totLocalAmt: invoice.totLocalAmt ?? 0,
          totCtyAmt: invoice.totCtyAmt ?? 0,
          gstAmt: invoice.gstAmt ?? 0,
          gstLocalAmt: invoice.gstLocalAmt ?? 0,
          gstCtyAmt: invoice.gstCtyAmt ?? 0,
          totAmtAftGst: invoice.totAmtAftGst ?? 0,
          totLocalAmtAftGst: invoice.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: invoice.totCtyAmtAftGst ?? 0,
          balAmt: invoice.balAmt ?? 0,
          balLocalAmt: invoice.balLocalAmt ?? 0,
          payAmt: invoice.payAmt ?? 0,
          payLocalAmt: invoice.payLocalAmt ?? 0,
          exGainLoss: invoice.exGainLoss ?? 0,
          salesOrderId: invoice.salesOrderId ?? 0,
          salesOrderNo: invoice.salesOrderNo ?? "",
          operationId: invoice.operationId ?? 0,
          operationNo: invoice.operationNo ?? "",
          remarks: invoice.remarks ?? "",
          address1: invoice.address1 ?? "",
          address2: invoice.address2 ?? "",
          address3: invoice.address3 ?? "",
          address4: invoice.address4 ?? "",
          pinCode: invoice.pinCode ?? "",
          countryId: invoice.countryId ?? 0,
          phoneNo: invoice.phoneNo ?? "",
          faxNo: invoice.faxNo ?? "",
          contactName: invoice.contactName ?? "",
          mobileNo: invoice.mobileNo ?? "",
          emailAdd: invoice.emailAdd ?? "",
          moduleFrom: invoice.moduleFrom ?? "",
          suppInvoiceNo: invoice.suppInvoiceNo ?? "",
          customerName: invoice.customerName ?? "",
          apInvoiceId: invoice.apInvoiceId ?? "",
          apInvoiceNo: invoice.apInvoiceNo ?? "",
          data_details:
            invoice.data_details?.map((detail) => ({
              ...detail,
              invoiceId: detail.invoiceId?.toString() ?? "0",
              apInvoiceNo: detail.apInvoiceNo?.toString() ?? "",
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              deliveryDate: detail.deliveryDate ?? null,
              supplyDate: detail.supplyDate ?? null,
              remarks: detail.remarks ?? "",
              customerName: detail.customerName ?? "",
              suppInvoiceNo: detail.suppInvoiceNo ?? "",
              apInvoiceId: detail.apInvoiceId ?? 0,
            })) || [],
        }
      : {
          ...defaultInvoice,
        },
  })

  // API hooks for invoices
  const {
    data: invoicesResponse,
    refetch: refetchInvoices,
    isLoading: isLoadingInvoices,
    isRefetching: isRefetchingInvoices,
  } = useGetWithDates<IApInvoiceHd>(
    `${ApInvoice.get}`,
    "apInvoiceHd",
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString()
  )

  const { data: invoicesData } =
    (invoicesResponse as ApiResponse<IApInvoiceHd>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<ApInvoiceHdSchemaType>(`${ApInvoice.add}`)
  const updateMutation = usePersist<ApInvoiceHdSchemaType>(`${ApInvoice.add}`)
  const deleteMutation = useDelete(`${ApInvoice.delete}`)

  // Remove the useGetInvoiceById hook for selection
  // const { data: invoiceByIdData, refetch: refetchInvoiceById } = ...

  const handleConfirmation = async (action: string) => {
    setShowConfirmDialog((prev) => ({ ...prev, [action]: false }))

    switch (action) {
      case "save":
        try {
          // Get form values and validate them
          const formValues = transformToSchemaType(
            form.getValues() as unknown as IApInvoiceHd
          )

          // Validate the form data using the schema
          const validationResult = apinvoiceHdSchema(
            required,
            visible
          ).safeParse(formValues)

          if (!validationResult.success) {
            console.error("Form validation failed:", validationResult.error)
            toast.error("Please check form data and try again")
            return
          }

          console.log("formValues to save", formValues)

          const response =
            Number(formValues.invoiceId) === 0
              ? await saveMutation.mutateAsync(formValues)
              : await updateMutation.mutateAsync(formValues)

          if (response.result === 1) {
            const invoiceData = Array.isArray(response.data)
              ? response.data[0]
              : response.data

            // Transform API response back to form values if needed
            if (invoiceData) {
              const updatedSchemaType = transformToSchemaType(
                invoiceData as unknown as IApInvoiceHd
              )
              setInvoice(updatedSchemaType)
            }

            toast.success("Invoice saved successfully")
            refetchInvoices()
          } else {
            toast.error(response.message || "Failed to save invoice")
          }
        } catch (error) {
          console.error("Save error:", error)
          toast.error("Network error while saving invoice")
        }
        break
      case "reset":
        handleInvoiceReset()
        break
      case "clone":
        if (invoice) {
          // Create a proper clone with form values
          const clonedInvoice: ApInvoiceHdSchemaType = {
            ...invoice,
            invoiceId: "0",
            invoiceNo: "",
            // Reset amounts for new invoice
            totAmt: 0,
            totLocalAmt: 0,
            totCtyAmt: 0,
            gstAmt: 0,
            gstLocalAmt: 0,
            gstCtyAmt: 0,
            totAmtAftGst: 0,
            totLocalAmtAftGst: 0,
            totCtyAmtAftGst: 0,
            balAmt: 0,
            balLocalAmt: 0,
            payAmt: 0,
            payLocalAmt: 0,
            exGainLoss: 0,
            // Reset data details
            data_details: [],
          }
          setInvoice(clonedInvoice)
          form.reset(clonedInvoice)
          toast.success("Invoice cloned successfully")
        }
        break
      case "delete":
        handleInvoiceDelete()
        break
    }
  }

  const handleInvoiceDelete = async () => {
    if (!invoice) return

    try {
      const response = await deleteMutation.mutateAsync(
        invoice.invoiceId?.toString() ?? ""
      )
      if (response.result === 1) {
        setInvoice(null)
        toast.success("Invoice deleted successfully")
        refetchInvoices()
      } else {
        toast.error(response.message || "Failed to delete invoice")
      }
    } catch {
      toast.error("Network error while deleting invoice")
    }

    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  const handleInvoiceReset = () => {
    setInvoice(null)
    form.reset({
      ...defaultInvoice,
      data_details: [],
    })
    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  // Helper function to transform IApInvoiceHd to ApInvoiceHdSchemaType
  const transformToSchemaType = (
    apiInvoice: IApInvoiceHd
  ): ApInvoiceHdSchemaType => {
    return {
      invoiceId: apiInvoice.invoiceId?.toString() ?? "0",
      invoiceNo: apiInvoice.invoiceNo ?? "",
      referenceNo: apiInvoice.referenceNo ?? "",
      suppInvoiceNo: apiInvoice.suppInvoiceNo ?? "",
      trnDate: apiInvoice.trnDate
        ? format(
            parseDate(apiInvoice.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiInvoice.accountDate
        ? format(
            parseDate(apiInvoice.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      dueDate: apiInvoice.dueDate
        ? format(
            parseDate(apiInvoice.dueDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      deliveryDate: apiInvoice.deliveryDate
        ? format(
            parseDate(apiInvoice.deliveryDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstClaimDate: apiInvoice.gstClaimDate
        ? format(
            parseDate(apiInvoice.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      supplierId: apiInvoice.supplierId ?? 0,
      currencyId: apiInvoice.currencyId ?? 0,
      exhRate: apiInvoice.exhRate ?? 0,
      ctyExhRate: apiInvoice.ctyExhRate ?? 0,
      creditTermId: apiInvoice.creditTermId ?? 0,
      bankId: apiInvoice.bankId ?? 0,
      totAmt: apiInvoice.totAmt ?? 0,
      totLocalAmt: apiInvoice.totLocalAmt ?? 0,
      totCtyAmt: apiInvoice.totCtyAmt ?? 0,
      gstAmt: apiInvoice.gstAmt ?? 0,
      gstLocalAmt: apiInvoice.gstLocalAmt ?? 0,
      gstCtyAmt: apiInvoice.gstCtyAmt ?? 0,
      totAmtAftGst: apiInvoice.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiInvoice.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiInvoice.totCtyAmtAftGst ?? 0,
      balAmt: apiInvoice.balAmt ?? 0,
      balLocalAmt: apiInvoice.balLocalAmt ?? 0,
      payAmt: apiInvoice.payAmt ?? 0,
      payLocalAmt: apiInvoice.payLocalAmt ?? 0,
      exGainLoss: apiInvoice.exGainLoss ?? 0,
      purchaseOrderId: apiInvoice.purchaseOrderId ?? 0,
      purchaseOrderNo: apiInvoice.purchaseOrderNo ?? "",
      operationId: apiInvoice.operationId ?? 0,
      operationNo: apiInvoice.operationNo ?? "",
      remarks: apiInvoice.remarks ?? "",
      addressId: apiInvoice.addressId ?? 0, // Not available in IApInvoiceHd
      contactId: apiInvoice.contactId ?? 0, // Not available in IApInvoiceHd
      address1: apiInvoice.address1 ?? "",
      address2: apiInvoice.address2 ?? "",
      address3: apiInvoice.address3 ?? "",
      address4: apiInvoice.address4 ?? "",
      pinCode: apiInvoice.pinCode ?? "",
      countryId: apiInvoice.countryId ?? 0,
      phoneNo: apiInvoice.phoneNo ?? "",
      faxNo: apiInvoice.faxNo ?? "",
      contactName: apiInvoice.contactName ?? "",
      mobileNo: apiInvoice.mobileNo ?? "",
      emailAdd: apiInvoice.emailAdd ?? "",
      moduleFrom: apiInvoice.moduleFrom ?? "",
      customerName: apiInvoice.customerName ?? "",

      arInvoiceId: apiInvoice.arInvoiceId ?? "",
      arInvoiceNo: apiInvoice.arInvoiceNo ?? "",
      data_details:
        apiInvoice.data_details?.map((detail) => ({
          ...detail,
          invoiceId: detail.invoiceId?.toString() ?? "0",
          invoiceNo: detail.invoiceNo?.toString() ?? "",
          totAmt: detail.totAmt ?? 0,
          totLocalAmt: detail.totLocalAmt ?? 0,
          totCtyAmt: detail.totCtyAmt ?? 0,
          gstAmt: detail.gstAmt ?? 0,
          gstLocalAmt: detail.gstLocalAmt ?? 0,
          gstCtyAmt: detail.gstCtyAmt ?? 0,
          deliveryDate: detail.deliveryDate
            ? format(
                parseDate(detail.deliveryDate as string) || new Date(),
                clientDateFormat
              )
            : null,
          supplyDate: detail.supplyDate
            ? format(
                parseDate(detail.supplyDate as string) || new Date(),
                clientDateFormat
              )
            : null,
          remarks: detail.remarks ?? "",
          customerName: detail.customerName ?? "",
          arInvoiceNo: detail.arInvoiceNo ?? "",
          arInvoiceId: detail.arInvoiceId ?? 0,
        })) || [],
    }
  }

  const handleInvoiceSelect = async (
    selectedInvoice: IApInvoiceHd | undefined
  ) => {
    if (selectedInvoice) {
      // Transform API data to form values
      const formValues = transformToSchemaType(selectedInvoice)
      setInvoice(formValues)

      try {
        // Fetch invoice details directly using selected invoice's values
        const response = await getById(
          `${ApInvoice.getByIdNo}/${selectedInvoice.invoiceId}/${selectedInvoice.invoiceNo}`
        )
        console.log("API Response (direct):", response)

        if (response?.result === 1) {
          const detailedInvoice = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (detailedInvoice) {
            // Parse dates properly
            const updatedInvoice = {
              ...detailedInvoice,
              trnDate: format(
                parseDate(detailedInvoice.trnDate as string) || new Date(),
                clientDateFormat
              ),
              accountDate: format(
                parseDate(detailedInvoice.accountDate as string) || new Date(),
                clientDateFormat
              ),
              dueDate: format(
                parseDate(detailedInvoice.dueDate as string) || new Date(),
                clientDateFormat
              ),
              deliveryDate: format(
                parseDate(detailedInvoice.deliveryDate as string) || new Date(),
                clientDateFormat
              ),
              gstClaimDate: format(
                parseDate(detailedInvoice.gstClaimDate as string) || new Date(),
                clientDateFormat
              ),
              data_details:
                detailedInvoice.data_details?.map((detail: IApInvoiceDt) => ({
                  ...detail,
                  invoiceId: detail.invoiceId?.toString() ?? "0",
                  invoiceNo: detail.invoiceNo?.toString() ?? null,
                  totAmt: detail.totAmt ?? 0,
                  totLocalAmt: detail.totLocalAmt ?? 0,
                  totCtyAmt: detail.totCtyAmt ?? 0,
                  gstAmt: detail.gstAmt ?? 0,
                  gstLocalAmt: detail.gstLocalAmt ?? 0,
                  gstCtyAmt: detail.gstCtyAmt ?? 0,
                  deliveryDate: detail.deliveryDate
                    ? format(
                        parseDate(detail.deliveryDate as string) || new Date(),
                        clientDateFormat
                      )
                    : null,
                  supplyDate: detail.supplyDate
                    ? format(
                        parseDate(detail.supplyDate as string) || new Date(),
                        clientDateFormat
                      )
                    : null,
                  remarks: detail.remarks ?? null,
                  customerName: detail.customerName ?? null,
                  arInvoiceNo: detail.arInvoiceNo ?? null,
                  arInvoiceId: detail.arInvoiceId ?? null,
                })) || [],
            }

            //setInvoice(updatedInvoice as ApInvoiceHdSchemaType)
            setInvoice(transformToSchemaType(updatedInvoice))
            form.reset(updatedInvoice)
            form.trigger()
            console.log("Form values after reset:", form.getValues())
          }
        } else {
          toast.error(
            response?.message || "Failed to fetch invoice details (direct)"
          )
        }
      } catch (error) {
        console.error("Error fetching invoice details (direct):", error)
        toast.error("Error fetching invoice details (direct)")
      }

      setShowListDialog(false)
    }
  }

  // Remove direct refetchInvoices from handleFilterChange
  const handleFilterChange = (newFilters: IApInvoiceFilter) => {
    setFilters(newFilters)
    // refetchInvoices(); // Removed: will be handled by useEffect
  }

  // Add useEffect to refetch invoices when filters change
  useEffect(() => {
    refetchInvoices()
  }, [filters, refetchInvoices])

  const handleInvoiceSearch = async (value: string) => {
    if (!value) return

    try {
      const response = await getById(`${ApInvoice.getByIdNo}/0/${value}`)
      console.log("API Response (direct):", response)

      if (response?.result === 1) {
        const detailedInvoice = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedInvoice) {
          // Parse dates properly
          const updatedInvoice = {
            ...detailedInvoice,
            trnDate: format(
              parseDate(detailedInvoice.trnDate as string) || new Date(),
              clientDateFormat
            ),
            accountDate: format(
              parseDate(detailedInvoice.accountDate as string) || new Date(),
              clientDateFormat
            ),
            dueDate: format(
              parseDate(detailedInvoice.dueDate as string) || new Date(),
              clientDateFormat
            ),
            deliveryDate: format(
              parseDate(detailedInvoice.deliveryDate as string) || new Date(),
              clientDateFormat
            ),
            gstClaimDate: format(
              parseDate(detailedInvoice.gstClaimDate as string) || new Date(),
              clientDateFormat
            ),
            data_details:
              detailedInvoice.data_details?.map((detail: IApInvoiceDt) => ({
                ...detail,
                invoiceId: detail.invoiceId?.toString() ?? "0",
                invoiceNo: detail.invoiceNo?.toString() ?? null,
                totAmt: detail.totAmt ?? 0,
                totLocalAmt: detail.totLocalAmt ?? 0,
                totCtyAmt: detail.totCtyAmt ?? 0,
                gstAmt: detail.gstAmt ?? 0,
                gstLocalAmt: detail.gstLocalAmt ?? 0,
                gstCtyAmt: detail.gstCtyAmt ?? 0,
                deliveryDate: detail.deliveryDate
                  ? format(
                      parseDate(detail.deliveryDate as string) || new Date(),
                      clientDateFormat
                    )
                  : null,
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : null,
                remarks: detail.remarks ?? null,
                customerName: detail.customerName ?? null,
                arInvoiceNo: detail.arInvoiceNo ?? null,
                arInvoiceId: detail.arInvoiceId ?? null,
              })) || [],
          }

          //setInvoice(updatedInvoice as ApInvoiceHdSchemaType)
          setInvoice(transformToSchemaType(updatedInvoice))
          form.reset(updatedInvoice)
          form.trigger()
          console.log("Form values after reset:", form.getValues())

          // Show success message
          toast.success(`Invoice ${value} loaded successfully`)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch invoice details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for invoice")
    }

    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  // Determine mode and invoice ID from URL
  const invoiceNo = form.getValues("invoiceNo")
  const isEdit = Boolean(invoiceNo)

  // Compose title text
  const titleText = isEdit ? `Invoice (Edit) - ${invoiceNo}` : "Invoice (New)"

  return (
    <div className="@container flex flex-1 flex-col p-4">
      <Tabs
        defaultValue="main"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="mb-2 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <h1>
            {/* Outer wrapper: gradient border or yellow pulsing border */}
            <span
              className={`relative inline-flex rounded-full p-[2px] transition-all ${
                isEdit
                  ? "bg-gradient-to-r from-purple-500 to-blue-500" // pulsing yellow border on edit
                  : "animate-pulse bg-gradient-to-r from-purple-500 to-blue-500" // default gradient border
              } `}
            >
              {/* Inner pill: solid dark background + white text */}
              <span
                className={`text-l block rounded-full px-6 font-semibold ${isEdit ? "text-white" : "text-white"}`}
              >
                {titleText}
              </span>
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <Input
              value={searchNo}
              onChange={(e) => setSearchNo(e.target.value)}
              onBlur={() => {
                if (searchNo.trim()) {
                  setShowConfirmDialog({ ...showConfirmDialog, load: true })
                }
              }}
              placeholder="Search Invoice No"
              className="h-8 text-sm"
              readOnly={!!invoice?.invoiceId && invoice.invoiceId !== "0"}
              disabled={!!invoice?.invoiceId && invoice.invoiceId !== "0"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
            >
              <ListFilter className="mr-1 h-4 w-4" />
              List
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, save: true })
              }
              //disabled={!form.getValues("data_details")?.length}
            >
              <Save className="mr-1 h-4 w-4" />
              Save
            </Button>

            <Button variant="outline" size="sm" disabled={!invoice}>
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, reset: true })
              }
              disabled={!form.getValues("data_details")?.length}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, clone: true })
              }
              disabled={!invoice}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, delete: true })
              }
              disabled={!invoice}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <TabsContent value="main">
          <Main
            form={form}
            onSuccessAction={handleConfirmation}
            isEdit={isEdit}
            visible={visible}
            companyId={Number(companyId)}
          />
        </TabsContent>

        <TabsContent value="other">
          <Other form={form} />
        </TabsContent>

        <TabsContent value="history">
          <History
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>
      </Tabs>

      {/* List Dialog */}
      <Dialog
        open={showListDialog}
        onOpenChange={(open) => {
          setShowListDialog(open)
          if (open) {
            refetchInvoices()
          }
        }}
      >
        <DialogContent
          className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Invoice List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing invoices from the list below. Use
              search to filter records or create new invoices.
            </p>
          </DialogHeader>
          <InvoiceTable
            data={invoicesData || []}
            isLoading={isLoadingInvoices || isRefetchingInvoices}
            onInvoiceSelect={handleInvoiceSelect}
            onRefresh={() => refetchInvoices()}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={Object.values(showConfirmDialog).some(Boolean)}
        onOpenChange={() =>
          setShowConfirmDialog({
            save: false,
            reset: false,
            clone: false,
            delete: false,
            load: false,
          })
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {showConfirmDialog.save && "Save Invoice"}
              {showConfirmDialog.reset && "Reset Invoice"}
              {showConfirmDialog.clone && "Clone Invoice"}
              {showConfirmDialog.delete && "Delete Invoice"}
              {showConfirmDialog.load && "Load Invoice"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <h3 className="mb-4 text-lg font-medium">
              {showConfirmDialog.save && "Do you want to save changes?"}
              {showConfirmDialog.reset && "Do you want to reset all fields?"}
              {showConfirmDialog.clone && "Do you want to clone this invoice?"}
              {showConfirmDialog.delete &&
                "Do you want to delete this invoice?"}
              {showConfirmDialog.load && "Do you want to load this invoice?"}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setShowConfirmDialog({
                    save: false,
                    reset: false,
                    clone: false,
                    delete: false,
                    load: false,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showConfirmDialog.save) handleConfirmation("save")
                  if (showConfirmDialog.reset) handleConfirmation("reset")
                  if (showConfirmDialog.clone) handleConfirmation("clone")
                  if (showConfirmDialog.delete) handleConfirmation("delete")
                  if (showConfirmDialog.load) handleInvoiceSearch(searchNo)
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
