"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  IApInvoiceDt,
  IApInvoiceFilter,
  IApInvoiceHd,
} from "@/interfaces/ap-invoice"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApInvoiceDtSchemaType,
  ApInvoiceHdSchemaType,
  apinvoiceHdSchema,
} from "@/schemas/ap-invoice"
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
import { APTransactionId, ModuleId, TableName } from "@/lib/utils"
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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CloneConfirmation,
  DeleteConfirmation,
  LoadConfirmation,
  ResetConfirmation,
  SaveConfirmation,
} from "@/components/confirmation"

import History from "./components/history"
import { defaultInvoice } from "./components/invoice-defaultvalues"
import InvoiceTable from "./components/invoice-table"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function InvoicePage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.invoice

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)
  const [isSelectingInvoice, setIsSelectingInvoice] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
    pageSize: 15,
  })

  const { data: visibleFieldsData } = useGetVisibleFields(
    moduleId,
    transactionId
  )

  const { data: requiredFieldsData } = useGetRequiredFields(
    moduleId,
    transactionId
  )

  // Use nullish coalescing to handle fallback values
  const visible: IVisibleFields = visibleFieldsData ?? null
  const required: IMandatoryFields = requiredFieldsData ?? null

  // Add form state management
  const form = useForm<ApInvoiceHdSchemaType>({
    resolver: zodResolver(apinvoiceHdSchema(required, visible)),
    defaultValues: invoice
      ? {
          invoiceId: invoice.invoiceId?.toString() ?? "0",
          invoiceNo: invoice.invoiceNo ?? "",
          referenceNo: invoice.referenceNo ?? "",
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
          addressId: invoice.addressId ?? 0,
          contactId: invoice.contactId ?? 0,
          arInvoiceId: invoice.arInvoiceId ?? "",
          arInvoiceNo: invoice.arInvoiceNo ?? "",
          editVersion: invoice.editVersion ?? 0,
          purchaseOrderId: invoice.purchaseOrderId ?? 0,
          purchaseOrderNo: invoice.purchaseOrderNo ?? "",
          data_details:
            invoice.data_details?.map((detail) => ({
              ...detail,
              invoiceId: detail.invoiceId?.toString() ?? "0",
              invoiceNo: detail.invoiceNo?.toString() ?? "",
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              deliveryDate: detail.deliveryDate ?? "",
              supplyDate: detail.supplyDate ?? "",
              remarks: detail.remarks ?? "",
              customerName: detail.customerName ?? "",
              custInvoiceNo: detail.custInvoiceNo ?? "",
              suppInvoiceNo: detail.suppInvoiceNo ?? "",
            })) || [],
        }
      : {
          ...defaultInvoice,
        },
  })

  // API hooks for invoices - Only fetch when List dialog is opened (optimized)
  const {
    data: invoicesResponse,
    refetch: refetchInvoices,
    isLoading: isLoadingInvoices,
    isRefetching: isRefetchingInvoices,
  } = useGetWithDates<IApInvoiceHd>(
    `${ApInvoice.get}`,
    TableName.apInvoice,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize invoice data to prevent unnecessary re-renders
  const invoicesData = useMemo(
    () => (invoicesResponse as ApiResponse<IApInvoiceHd>)?.data ?? [],
    [invoicesResponse]
  )

  // Mutations
  const saveMutation = usePersist<ApInvoiceHdSchemaType>(`${ApInvoice.add}`)
  const updateMutation = usePersist<ApInvoiceHdSchemaType>(`${ApInvoice.add}`)
  const deleteMutation = useDelete(`${ApInvoice.delete}`)

  // Remove the useGetInvoiceById hook for selection
  // const { data: invoiceByIdData, refetch: refetchInvoiceById } = ...

  // Handle Save
  const handleSaveInvoice = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IApInvoiceHd
      )

      // Validate the form data using the schema
      const validationResult = apinvoiceHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)
        toast.error("Please check form data and try again")
        return
      }

      const response =
        Number(formValues.invoiceId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const invoiceData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (invoiceData) {
          const updatedSchemaType = transformToSchemaType(
            invoiceData as unknown as IApInvoiceHd
          )
          setIsSelectingInvoice(true)
          setInvoice(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Check if this was a new invoice or update
        const wasNewInvoice = Number(formValues.invoiceId) === 0

        if (wasNewInvoice) {
          //toast.success(
          // `Invoice ${invoiceData?.invoiceNo || ""} saved successfully`
          //)
        } else {
          //toast.success("Invoice updated successfully")
        }

        refetchInvoices()
      } else {
        toast.error(response.message || "Failed to save invoice")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving invoice")
    } finally {
      setIsSaving(false)
      setIsSelectingInvoice(false)
    }
  }

  // Handle Clone
  const handleCloneInvoice = () => {
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
  }

  // Handle Delete
  const handleInvoiceDelete = async () => {
    if (!invoice) return

    try {
      const response = await deleteMutation.mutateAsync(
        invoice.invoiceId?.toString() ?? ""
      )
      if (response.result === 1) {
        setInvoice(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultInvoice,
          data_details: [],
        })
        //toast.success("Invoice deleted successfully")
        refetchInvoices()
      } else {
        toast.error(response.message || "Failed to delete invoice")
      }
    } catch {
      toast.error("Network error while deleting invoice")
    }
  }

  // Handle Reset
  const handleInvoiceReset = () => {
    setInvoice(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultInvoice,
      data_details: [],
    })
    toast.success("Invoice reset successfully")
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
      editVersion: apiInvoice.editVersion ?? 0,
      purchaseOrderId: apiInvoice.purchaseOrderId ?? 0,
      purchaseOrderNo: apiInvoice.purchaseOrderNo ?? "",
      createBy: apiInvoice.createBy ?? "",
      editBy: apiInvoice.editBy ?? "",
      cancelBy: apiInvoice.cancelBy ?? "",
      createDate: apiInvoice.createDate
        ? format(
            parseDate(apiInvoice.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",

      editDate: apiInvoice.editDate
        ? format(
            parseDate(apiInvoice.editDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelDate: apiInvoice.cancelDate
        ? format(
            parseDate(apiInvoice.cancelDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiInvoice.cancelRemarks ?? "",
      data_details:
        apiInvoice.data_details?.map(
          (detail) =>
            ({
              ...detail,
              invoiceId: detail.invoiceId?.toString() ?? "0",
              invoiceNo: detail.invoiceNo ?? "",
              itemNo: detail.itemNo ?? 0,
              seqNo: detail.seqNo ?? 0,
              docItemNo: detail.docItemNo ?? 0,
              productId: detail.productId ?? 0,
              productCode: detail.productCode ?? "",
              productName: detail.productName ?? "",
              glId: detail.glId ?? 0,
              glCode: detail.glCode ?? "",
              glName: detail.glName ?? "",
              qty: detail.qty ?? 0,
              billQTY: detail.billQTY ?? 0,
              uomId: detail.uomId ?? 0,
              uomCode: detail.uomCode ?? "",
              uomName: detail.uomName ?? "",
              unitPrice: detail.unitPrice ?? 0,
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              remarks: detail.remarks ?? "",
              gstId: detail.gstId ?? 0,
              gstName: detail.gstName ?? "",
              gstPercentage: detail.gstPercentage ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              deliveryDate: detail.deliveryDate
                ? format(
                    parseDate(detail.deliveryDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              departmentId: detail.departmentId ?? 0,
              departmentCode: detail.departmentCode ?? "",
              departmentName: detail.departmentName ?? "",
              jobOrderId: detail.jobOrderId ?? 0,
              jobOrderNo: detail.jobOrderNo ?? "",
              taskId: detail.taskId ?? 0,
              taskName: detail.taskName ?? "",
              serviceId: detail.serviceId ?? 0,
              serviceName: detail.serviceName ?? "",
              employeeId: detail.employeeId ?? 0,
              employeeCode: detail.employeeCode ?? "",
              employeeName: detail.employeeName ?? "",
              portId: detail.portId ?? 0,
              portCode: detail.portCode ?? "",
              portName: detail.portName ?? "",
              vesselId: detail.vesselId ?? 0,
              vesselCode: detail.vesselCode ?? "",
              vesselName: detail.vesselName ?? "",
              bargeId: detail.bargeId ?? 0,
              bargeCode: detail.bargeCode ?? "",
              bargeName: detail.bargeName ?? "",
              voyageId: detail.voyageId ?? 0,
              voyageNo: detail.voyageNo ?? "",
              operationId: detail.operationId ?? "",
              operationNo: detail.operationNo ?? "",
              opRefNo: detail.opRefNo ?? "",
              purchaseOrderId: detail.purchaseOrderId ?? "",
              purchaseOrderNo: detail.purchaseOrderNo ?? "",
              supplyDate: detail.supplyDate
                ? format(
                    parseDate(detail.supplyDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              customerName: detail.customerName ?? "",
              custInvoiceNo: detail.custInvoiceNo ?? "",
              arInvoiceId: detail.arInvoiceId ?? "",
              arInvoiceNo: detail.arInvoiceNo ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as ApInvoiceDtSchemaType
        ) || [],
    }
  }

  const handleInvoiceSelect = async (
    selectedInvoice: IApInvoiceHd | undefined
  ) => {
    if (!selectedInvoice) return

    setIsSelectingInvoice(true)

    try {
      // Fetch invoice details directly using selected invoice's values
      const response = await getById(
        `${ApInvoice.getByIdNo}/${selectedInvoice.invoiceId}/${selectedInvoice.invoiceNo}`
      )

      if (response?.result === 1) {
        const detailedInvoice = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedInvoice) {
          // Parse dates properly
          const updatedInvoice = {
            ...detailedInvoice,
            invoiceId: detailedInvoice.invoiceId?.toString() ?? "0",
            invoiceNo: detailedInvoice.invoiceNo ?? "",
            referenceNo: detailedInvoice.referenceNo ?? "",
            suppInvoiceNo: detailedInvoice.suppInvoiceNo ?? "",
            trnDate: detailedInvoice.trnDate
              ? format(
                  parseDate(detailedInvoice.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedInvoice.accountDate
              ? format(
                  parseDate(detailedInvoice.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedInvoice.dueDate
              ? format(
                  parseDate(detailedInvoice.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedInvoice.deliveryDate
              ? format(
                  parseDate(detailedInvoice.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedInvoice.gstClaimDate
              ? format(
                  parseDate(detailedInvoice.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedInvoice.supplierId ?? 0,
            currencyId: detailedInvoice.currencyId ?? 0,
            exhRate: detailedInvoice.exhRate ?? 0,
            ctyExhRate: detailedInvoice.ctyExhRate ?? 0,
            creditTermId: detailedInvoice.creditTermId ?? 0,
            bankId: detailedInvoice.bankId ?? 0,
            totAmt: detailedInvoice.totAmt ?? 0,
            totLocalAmt: detailedInvoice.totLocalAmt ?? 0,
            totCtyAmt: detailedInvoice.totCtyAmt ?? 0,
            gstAmt: detailedInvoice.gstAmt ?? 0,
            gstLocalAmt: detailedInvoice.gstLocalAmt ?? 0,
            gstCtyAmt: detailedInvoice.gstCtyAmt ?? 0,
            totAmtAftGst: detailedInvoice.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedInvoice.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedInvoice.totCtyAmtAftGst ?? 0,
            balAmt: detailedInvoice.balAmt ?? 0,
            balLocalAmt: detailedInvoice.balLocalAmt ?? 0,
            payAmt: detailedInvoice.payAmt ?? 0,
            payLocalAmt: detailedInvoice.payLocalAmt ?? 0,
            exGainLoss: detailedInvoice.exGainLoss ?? 0,
            operationId: detailedInvoice.operationId ?? 0,
            operationNo: detailedInvoice.operationNo ?? "",
            remarks: detailedInvoice.remarks ?? "",
            addressId: detailedInvoice.addressId ?? 0, // Not available in IApInvoiceHd
            contactId: detailedInvoice.contactId ?? 0, // Not available in IApInvoiceHd
            address1: detailedInvoice.address1 ?? "",
            address2: detailedInvoice.address2 ?? "",
            address3: detailedInvoice.address3 ?? "",
            address4: detailedInvoice.address4 ?? "",
            pinCode: detailedInvoice.pinCode ?? "",
            countryId: detailedInvoice.countryId ?? 0,
            phoneNo: detailedInvoice.phoneNo ?? "",
            faxNo: detailedInvoice.faxNo ?? "",
            contactName: detailedInvoice.contactName ?? "",
            mobileNo: detailedInvoice.mobileNo ?? "",
            emailAdd: detailedInvoice.emailAdd ?? "",
            moduleFrom: detailedInvoice.moduleFrom ?? "",
            customerName: detailedInvoice.customerName ?? "",
            arInvoiceId: detailedInvoice.arInvoiceId ?? "",
            arInvoiceNo: detailedInvoice.arInvoiceNo ?? "",
            editVersion: detailedInvoice.editVersion ?? 0,
            purchaseOrderId: detailedInvoice.purchaseOrderId ?? 0,
            purchaseOrderNo: detailedInvoice.purchaseOrderNo ?? "",
            createBy: detailedInvoice.createBy ?? "",
            createDate: detailedInvoice.createDate ?? "",
            editBy: detailedInvoice.editBy ?? "",
            editDate: detailedInvoice.editDate ?? "",
            cancelBy: detailedInvoice.cancelBy ?? "",
            cancelDate: detailedInvoice.cancelDate ?? "",
            cancelRemarks: detailedInvoice.cancelRemarks ?? "",
            data_details:
              detailedInvoice.data_details?.map((detail: IApInvoiceDt) => ({
                invoiceId: detail.invoiceId?.toString() ?? "0",
                invoiceNo: detail.invoiceNo ?? "",
                itemNo: detail.itemNo ?? 0,
                seqNo: detail.seqNo ?? 0,
                docItemNo: detail.docItemNo ?? 0,
                productId: detail.productId ?? 0,
                productCode: detail.productCode ?? "",
                productName: detail.productName ?? "",
                glId: detail.glId ?? 0,
                glCode: detail.glCode ?? "",
                glName: detail.glName ?? "",
                qty: detail.qty ?? 0,
                billQTY: detail.billQTY ?? 0,
                uomId: detail.uomId ?? 0,
                uomCode: detail.uomCode ?? "",
                uomName: detail.uomName ?? "",
                unitPrice: detail.unitPrice ?? 0,
                totAmt: detail.totAmt ?? 0,
                totLocalAmt: detail.totLocalAmt ?? 0,
                totCtyAmt: detail.totCtyAmt ?? 0,
                remarks: detail.remarks ?? "",
                gstId: detail.gstId ?? 0,
                gstName: detail.gstName ?? "",
                gstPercentage: detail.gstPercentage ?? 0,
                gstAmt: detail.gstAmt ?? 0,
                gstLocalAmt: detail.gstLocalAmt ?? 0,
                gstCtyAmt: detail.gstCtyAmt ?? 0,
                deliveryDate: detail.deliveryDate
                  ? format(
                      parseDate(detail.deliveryDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                departmentId: detail.departmentId ?? 0,
                departmentCode: detail.departmentCode ?? "",
                departmentName: detail.departmentName ?? "",
                jobOrderId: detail.jobOrderId ?? 0,
                jobOrderNo: detail.jobOrderNo ?? "",
                taskId: detail.taskId ?? 0,
                taskName: detail.taskName ?? "",
                serviceId: detail.serviceId ?? 0,
                serviceName: detail.serviceName ?? "",
                employeeId: detail.employeeId ?? 0,
                employeeCode: detail.employeeCode ?? "",
                employeeName: detail.employeeName ?? "",
                portId: detail.portId ?? 0,
                portCode: detail.portCode ?? "",
                portName: detail.portName ?? "",
                vesselId: detail.vesselId ?? 0,
                vesselCode: detail.vesselCode ?? "",
                vesselName: detail.vesselName ?? "",
                bargeId: detail.bargeId ?? 0,
                bargeCode: detail.bargeCode ?? "",
                bargeName: detail.bargeName ?? "",
                voyageId: detail.voyageId ?? 0,
                voyageNo: detail.voyageNo ?? "",
                operationId: detail.operationId ?? "",
                operationNo: detail.operationNo ?? "",
                opRefNo: detail.opRefNo ?? "",
                purchaseOrderId: detail.purchaseOrderId ?? "",
                purchaseOrderNo: detail.purchaseOrderNo ?? "",
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                customerName: detail.customerName ?? "",
                custInvoiceNo: detail.custInvoiceNo ?? "",
                arInvoiceId: detail.arInvoiceId ?? "",
                arInvoiceNo: detail.arInvoiceNo ?? "",
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setInvoice(updatedInvoice as ApInvoiceHdSchemaType)
          setInvoice(transformToSchemaType(updatedInvoice))
          form.reset(updatedInvoice)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Invoice ${selectedInvoice.invoiceNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch invoice details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error)
      toast.error("Error loading invoice. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingInvoice(false)
    }
  }

  // Remove direct refetchInvoices from handleFilterChange
  const handleFilterChange = (newFilters: IApInvoiceFilter) => {
    setFilters(newFilters)
    // refetchInvoices(); // Removed: will be handled by useEffect
  }

  // Refetch invoices when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchInvoices()
    }
  }, [filters, showListDialog, refetchInvoices])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        setShowSaveConfirm(true)
      }
      // Ctrl+L or Cmd+L: Open List
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault()
        setShowListDialog(true)
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  // Add unsaved changes warning
  useEffect(() => {
    const isDirty = form.formState.isDirty
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty])

  const handleInvoiceSearch = async (value: string) => {
    if (!value) return

    setIsLoadingInvoice(true)

    try {
      const response = await getById(`${ApInvoice.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedInvoice = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedInvoice) {
          // Parse dates properly
          const updatedInvoice = {
            ...detailedInvoice,
            invoiceId: detailedInvoice.invoiceId?.toString() ?? "0",
            invoiceNo: detailedInvoice.invoiceNo ?? "",
            referenceNo: detailedInvoice.referenceNo ?? "",
            suppInvoiceNo: detailedInvoice.suppInvoiceNo ?? "",
            trnDate: detailedInvoice.trnDate
              ? format(
                  parseDate(detailedInvoice.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedInvoice.accountDate
              ? format(
                  parseDate(detailedInvoice.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedInvoice.dueDate
              ? format(
                  parseDate(detailedInvoice.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedInvoice.deliveryDate
              ? format(
                  parseDate(detailedInvoice.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedInvoice.gstClaimDate
              ? format(
                  parseDate(detailedInvoice.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedInvoice.supplierId ?? 0,
            currencyId: detailedInvoice.currencyId ?? 0,
            exhRate: detailedInvoice.exhRate ?? 0,
            ctyExhRate: detailedInvoice.ctyExhRate ?? 0,
            creditTermId: detailedInvoice.creditTermId ?? 0,
            bankId: detailedInvoice.bankId ?? 0,
            totAmt: detailedInvoice.totAmt ?? 0,
            totLocalAmt: detailedInvoice.totLocalAmt ?? 0,
            totCtyAmt: detailedInvoice.totCtyAmt ?? 0,
            gstAmt: detailedInvoice.gstAmt ?? 0,
            gstLocalAmt: detailedInvoice.gstLocalAmt ?? 0,
            gstCtyAmt: detailedInvoice.gstCtyAmt ?? 0,
            totAmtAftGst: detailedInvoice.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedInvoice.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedInvoice.totCtyAmtAftGst ?? 0,
            balAmt: detailedInvoice.balAmt ?? 0,
            balLocalAmt: detailedInvoice.balLocalAmt ?? 0,
            payAmt: detailedInvoice.payAmt ?? 0,
            payLocalAmt: detailedInvoice.payLocalAmt ?? 0,
            exGainLoss: detailedInvoice.exGainLoss ?? 0,
            operationId: detailedInvoice.operationId ?? 0,
            operationNo: detailedInvoice.operationNo ?? "",
            remarks: detailedInvoice.remarks ?? "",
            addressId: detailedInvoice.addressId ?? 0, // Not available in IApInvoiceHd
            contactId: detailedInvoice.contactId ?? 0, // Not available in IApInvoiceHd
            address1: detailedInvoice.address1 ?? "",
            address2: detailedInvoice.address2 ?? "",
            address3: detailedInvoice.address3 ?? "",
            address4: detailedInvoice.address4 ?? "",
            pinCode: detailedInvoice.pinCode ?? "",
            countryId: detailedInvoice.countryId ?? 0,
            phoneNo: detailedInvoice.phoneNo ?? "",
            faxNo: detailedInvoice.faxNo ?? "",
            contactName: detailedInvoice.contactName ?? "",
            mobileNo: detailedInvoice.mobileNo ?? "",
            emailAdd: detailedInvoice.emailAdd ?? "",
            moduleFrom: detailedInvoice.moduleFrom ?? "",
            customerName: detailedInvoice.customerName ?? "",
            arInvoiceId: detailedInvoice.arInvoiceId ?? "",
            arInvoiceNo: detailedInvoice.arInvoiceNo ?? "",
            editVersion: detailedInvoice.editVersion ?? 0,
            purchaseOrderId: detailedInvoice.purchaseOrderId ?? 0,
            purchaseOrderNo: detailedInvoice.purchaseOrderNo ?? "",

            data_details:
              detailedInvoice.data_details?.map((detail: IApInvoiceDt) => ({
                invoiceId: detail.invoiceId?.toString() ?? "0",
                invoiceNo: detail.invoiceNo ?? "",
                itemNo: detail.itemNo ?? 0,
                seqNo: detail.seqNo ?? 0,
                docItemNo: detail.docItemNo ?? 0,
                productId: detail.productId ?? 0,
                productCode: detail.productCode ?? "",
                productName: detail.productName ?? "",
                glId: detail.glId ?? 0,
                glCode: detail.glCode ?? "",
                glName: detail.glName ?? "",
                qty: detail.qty ?? 0,
                billQTY: detail.billQTY ?? 0,
                uomId: detail.uomId ?? 0,
                uomCode: detail.uomCode ?? "",
                uomName: detail.uomName ?? "",
                unitPrice: detail.unitPrice ?? 0,
                totAmt: detail.totAmt ?? 0,
                totLocalAmt: detail.totLocalAmt ?? 0,
                totCtyAmt: detail.totCtyAmt ?? 0,
                remarks: detail.remarks ?? "",
                gstId: detail.gstId ?? 0,
                gstName: detail.gstName ?? "",
                gstPercentage: detail.gstPercentage ?? 0,
                gstAmt: detail.gstAmt ?? 0,
                gstLocalAmt: detail.gstLocalAmt ?? 0,
                gstCtyAmt: detail.gstCtyAmt ?? 0,
                deliveryDate: detail.deliveryDate
                  ? format(
                      parseDate(detail.deliveryDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                departmentId: detail.departmentId ?? 0,
                departmentCode: detail.departmentCode ?? "",
                departmentName: detail.departmentName ?? "",
                jobOrderId: detail.jobOrderId ?? 0,
                jobOrderNo: detail.jobOrderNo ?? "",
                taskId: detail.taskId ?? 0,
                taskName: detail.taskName ?? "",
                serviceId: detail.serviceId ?? 0,
                serviceName: detail.serviceName ?? "",
                employeeId: detail.employeeId ?? 0,
                employeeCode: detail.employeeCode ?? "",
                employeeName: detail.employeeName ?? "",
                portId: detail.portId ?? 0,
                portCode: detail.portCode ?? "",
                portName: detail.portName ?? "",
                vesselId: detail.vesselId ?? 0,
                vesselCode: detail.vesselCode ?? "",
                vesselName: detail.vesselName ?? "",
                bargeId: detail.bargeId ?? 0,
                bargeCode: detail.bargeCode ?? "",
                bargeName: detail.bargeName ?? "",
                voyageId: detail.voyageId ?? 0,
                voyageNo: detail.voyageNo ?? "",
                operationId: detail.operationId ?? "",
                operationNo: detail.operationNo ?? "",
                opRefNo: detail.opRefNo ?? "",
                purchaseOrderId: detail.purchaseOrderId ?? "",
                purchaseOrderNo: detail.purchaseOrderNo ?? "",
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                customerName: detail.customerName ?? "",
                custInvoiceNo: detail.custInvoiceNo ?? "",
                arInvoiceId: detail.arInvoiceId ?? "",
                arInvoiceNo: detail.arInvoiceNo ?? "",
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setInvoice(updatedInvoice as ApInvoiceHdSchemaType)
          setInvoice(transformToSchemaType(updatedInvoice))
          form.reset(updatedInvoice)
          form.trigger()

          // Show success message
          toast.success(`Invoice ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch invoice details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for invoice")
    } finally {
      setIsLoadingInvoice(false)
    }
  }

  // Determine mode and invoice ID from URL
  const invoiceNo = form.getValues("invoiceNo")
  const isEdit = Boolean(invoiceNo)

  // Compose title text
  const titleText = isEdit ? `Invoice (Edit) - ${invoiceNo}` : "Invoice (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading invoice form...</p>
          <p className="mt-2 text-xs text-gray-500">
            Preparing field settings and validation rules
          </p>
        </div>
      </div>
    )
  }

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
                  setShowLoadConfirm(true)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchNo.trim()) {
                  e.preventDefault()
                  setShowLoadConfirm(true)
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
              onClick={() => setShowSaveConfirm(true)}
              disabled={
                isSaving || saveMutation.isPending || updateMutation.isPending
              }
            >
              <Save className="mr-1 h-4 w-4" />
              {isSaving || saveMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!invoice || invoice.invoiceId === "0"}
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              disabled={!invoice}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={!invoice || invoice.invoiceId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!invoice || invoice.invoiceId === "0"}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <TabsContent value="main">
          <Main
            form={form}
            onSuccessAction={async () => {
              handleSaveInvoice()
            }}
            isEdit={isEdit}
            visible={visible}
            required={required}
            companyId={Number(companyId)}
          />
        </TabsContent>

        <TabsContent value="other">
          <Other form={form} />
        </TabsContent>

        <TabsContent value="history">
          <History form={form} isEdit={isEdit} />
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
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Invoice List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing invoices from the list below. Use
                  search to filter records or create new invoices.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingInvoices || isRefetchingInvoices || isSelectingInvoice ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingInvoice
                    ? "Loading invoice details..."
                    : "Loading invoices..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingInvoice
                    ? "Please wait while we fetch the complete invoice data"
                    : "Please wait while we fetch the invoice list"}
                </p>
              </div>
            </div>
          ) : (
            <InvoiceTable
              data={invoicesData || []}
              isLoading={false}
              onInvoiceSelect={handleInvoiceSelect}
              onRefresh={() => refetchInvoices()}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Save Confirmation */}
      <SaveConfirmation
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={handleSaveInvoice}
        itemName={invoice?.invoiceNo || "New Invoice"}
        operationType={
          invoice?.invoiceId && invoice.invoiceId !== "0" ? "update" : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleInvoiceDelete}
        itemName={invoice?.invoiceNo}
        title="Delete Invoice"
        description="This action cannot be undone. All invoice details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleInvoiceSearch(searchNo)}
        code={searchNo}
        typeLabel="Invoice"
        showDetails={false}
        description={`Do you want to load Invoice ${searchNo}?`}
        isLoading={isLoadingInvoice}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleInvoiceReset}
        itemName={invoice?.invoiceNo}
        title="Reset Invoice"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneInvoice}
        itemName={invoice?.invoiceNo}
        title="Clone Invoice"
        description="This will create a copy as a new invoice."
      />
    </div>
  )
}
