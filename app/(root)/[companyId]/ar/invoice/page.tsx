"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IArInvoiceDt, IArInvoiceFilter, IArInvoiceHd } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ArInvoiceDtSchemaType,
  ArInvoiceHdSchema,
  ArInvoiceHdSchemaType,
} from "@/schemas"
import { usePermissionStore } from "@/stores/permission-store"
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
import { ArInvoice } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { ARTransactionId, ModuleId } from "@/lib/utils"
import { useDeleteWithRemarks, usePersist } from "@/hooks/use-common"
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
  CancelConfirmation,
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

  const moduleId = ModuleId.ar
  const transactionId = ARTransactionId.invoice

  const { hasPermission } = usePermissionStore()

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [invoice, setInvoice] = useState<ArInvoiceHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IArInvoiceFilter>({
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
  const form = useForm<ArInvoiceHdSchemaType>({
    resolver: zodResolver(ArInvoiceHdSchema(required, visible)),
    defaultValues: invoice
      ? {
          invoiceId: invoice.invoiceId?.toString() ?? "0",
          invoiceNo: invoice.invoiceNo ?? "",
          referenceNo: invoice.referenceNo ?? "",
          suppInvoiceNo: invoice.suppInvoiceNo ?? "",
          trnDate: invoice.trnDate ?? new Date(),
          accountDate: invoice.accountDate ?? new Date(),
          dueDate: invoice.dueDate ?? new Date(),
          deliveryDate: invoice.deliveryDate ?? new Date(),
          gstClaimDate: invoice.gstClaimDate ?? new Date(),
          customerId: invoice.customerId ?? 0,
          currencyId: invoice.currencyId ?? 0,
          exhRate: invoice.exhRate ?? 0,
          ctyExhRate: invoice.ctyExhRate ?? 0,
          creditTermId: invoice.creditTermId ?? 0,
          bankId: invoice.bankId ?? 0,
          jobOrderId: invoice.jobOrderId ?? 0,
          jobOrderNo: invoice.jobOrderNo ?? "",
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
          supplierName: invoice.supplierName ?? "",
          addressId: invoice.addressId ?? 0,
          contactId: invoice.contactId ?? 0,
          apInvoiceId: invoice.apInvoiceId ?? "",
          apInvoiceNo: invoice.apInvoiceNo ?? "",
          editVersion: invoice.editVersion ?? 0,
          salesOrderId: invoice.salesOrderId ?? 0,
          salesOrderNo: invoice.salesOrderNo ?? "",
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
              supplierName: detail.supplierName ?? "",
              suppInvoiceNo: detail.suppInvoiceNo ?? "",
              apInvoiceId: detail.apInvoiceId ?? "0",
              apInvoiceNo: detail.apInvoiceNo ?? "",
              editVersion: detail.editVersion ?? 0,
            })) || [],
        }
      : {
          ...defaultInvoice,
        },
  })

  // Data fetching moved to InvoiceTable component for better performance

  // Mutations
  const saveMutation = usePersist<ArInvoiceHdSchemaType>(`${ArInvoice.add}`)
  const updateMutation = usePersist<ArInvoiceHdSchemaType>(`${ArInvoice.add}`)
  const deleteMutation = useDeleteWithRemarks(`${ArInvoice.delete}`)

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
        form.getValues() as unknown as IArInvoiceHd
      )

      // Validate the form data using the schema
      const validationResult = ArInvoiceHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(".") as keyof ArInvoiceHdSchemaType
          form.setError(fieldPath, {
            type: "validation",
            message: error.message,
          })
        })

        toast.error("Please check form data and try again")
        return
      }

      //check totamt and totlocalamt should be zero
      if (formValues.totAmt === 0 || formValues.totLocalAmt === 0) {
        toast.error("Total Amount and Total Local Amount should not be zero")
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
            invoiceData as unknown as IArInvoiceHd
          )
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

        // Data refresh handled by InvoiceTable component
      } else {
        toast.error(response.message || "Failed to save invoice")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving invoice")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Clone
  const handleCloneInvoice = () => {
    if (invoice) {
      // Create a proper clone with form values
      const clonedInvoice: ArInvoiceHdSchemaType = {
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

  // Handle Delete - First Level: Confirmation
  const handleDeleteConfirmation = () => {
    // Close delete confirmation and open cancel confirmation
    setShowDeleteConfirm(false)
    setShowCancelConfirm(true)
  }

  // Handle Search No Blur - Trim spaces before and after, then trigger load confirmation
  const handleSearchNoBlur = () => {
    // Trim leading and trailing spaces
    const trimmedValue = searchNo.trim()

    // Only update if there was a change (handles "   value   " => "value")
    if (trimmedValue !== searchNo) {
      setSearchNo(trimmedValue)
    }

    // Show load confirmation if there's a value after trimming
    if (trimmedValue) {
      setShowLoadConfirm(true)
    }
  }

  // Handle Search No Enter Key
  const handleSearchNoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Trim the value and check if it's not empty before triggering
    const trimmedValue = searchNo.trim()
    if (e.key === "Enter" && trimmedValue) {
      e.preventDefault()
      // Update the search input with trimmed value if it was changed
      if (trimmedValue !== searchNo) {
        setSearchNo(trimmedValue)
      }
      setShowLoadConfirm(true)
    }
  }

  // Handle Delete - Second Level: With Cancel Remarks
  const handleInvoiceDelete = async (cancelRemarks: string) => {
    if (!invoice) return

    try {
      console.log("Cancel remarks:", cancelRemarks)
      console.log("Invoice ID:", invoice.invoiceId)
      console.log("Invoice No:", invoice.invoiceNo)

      const response = await deleteMutation.mutateAsync({
        documentId: invoice.invoiceId?.toString() ?? "",
        documentNo: invoice.invoiceNo ?? "",
        cancelRemarks: cancelRemarks,
      })

      if (response.result === 1) {
        setInvoice(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultInvoice,
          data_details: [],
        })
        toast.success(`Invoice ${invoice.invoiceNo} deleted successfully`)
        // Data refresh handled by InvoiceTable component
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

  // Helper function to transform IArInvoiceHd to ArInvoiceHdSchemaType
  const transformToSchemaType = (
    apiInvoice: IArInvoiceHd
  ): ArInvoiceHdSchemaType => {
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
      customerId: apiInvoice.customerId ?? 0,
      currencyId: apiInvoice.currencyId ?? 0,
      exhRate: apiInvoice.exhRate ?? 0,
      ctyExhRate: apiInvoice.ctyExhRate ?? 0,
      creditTermId: apiInvoice.creditTermId ?? 0,
      bankId: apiInvoice.bankId ?? 0,
      jobOrderId: apiInvoice.jobOrderId ?? 0,
      jobOrderNo: apiInvoice.jobOrderNo ?? "",
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
      addressId: apiInvoice.addressId ?? 0, // Not available in IArInvoiceHd
      contactId: apiInvoice.contactId ?? 0, // Not available in IArInvoiceHd
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
      supplierName: apiInvoice.supplierName ?? "",
      apInvoiceId: apiInvoice.apInvoiceId ?? "",
      apInvoiceNo: apiInvoice.apInvoiceNo ?? "",
      editVersion: apiInvoice.editVersion ?? 0,
      salesOrderId: apiInvoice.salesOrderId ?? 0,
      salesOrderNo: apiInvoice.salesOrderNo ?? "",
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
      isCancel: apiInvoice.isCancel ?? false,
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
              salesOrderId: detail.salesOrderId ?? "",
              salesOrderNo: detail.salesOrderNo ?? "",
              supplyDate: detail.supplyDate
                ? format(
                    parseDate(detail.supplyDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              supplierName: detail.supplierName ?? "",
              suppInvoiceNo: detail.suppInvoiceNo ?? "",
              apInvoiceId: detail.apInvoiceId ?? "",
              apInvoiceNo: detail.apInvoiceNo ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as ArInvoiceDtSchemaType
        ) || [],
    }
  }

  const handleInvoiceSelect = async (
    selectedInvoice: IArInvoiceHd | undefined
  ) => {
    if (!selectedInvoice) return

    try {
      // Fetch invoice details directly using selected invoice's values
      const response = await getById(
        `${ArInvoice.getByIdNo}/${selectedInvoice.invoiceId}/${selectedInvoice.invoiceNo}`
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

            customerId: detailedInvoice.customerId ?? 0,
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
            addressId: detailedInvoice.addressId ?? 0, // Not available in IArInvoiceHd
            contactId: detailedInvoice.contactId ?? 0, // Not available in IArInvoiceHd
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
            apInvoiceId: detailedInvoice.apInvoiceId ?? "",
            apInvoiceNo: detailedInvoice.apInvoiceNo ?? "",
            editVersion: detailedInvoice.editVersion ?? 0,
            salesOrderId: detailedInvoice.salesOrderId ?? 0,
            salesOrderNo: detailedInvoice.salesOrderNo ?? "",
            createBy: detailedInvoice.createBy ?? "",
            createDate: detailedInvoice.createDate ?? "",
            editBy: detailedInvoice.editBy ?? "",
            editDate: detailedInvoice.editDate ?? "",
            cancelBy: detailedInvoice.cancelBy ?? "",
            cancelDate: detailedInvoice.cancelDate ?? "",
            isCancel: detailedInvoice.isCancel ?? false,
            cancelRemarks: detailedInvoice.cancelRemarks ?? "",
            data_details:
              detailedInvoice.data_details?.map((detail: IArInvoiceDt) => ({
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
                salesOrderId: detail.salesOrderId ?? "",
                salesOrderNo: detail.salesOrderNo ?? "",
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                supplierName: detail.supplierName ?? "",
                suppInvoiceNo: detail.suppInvoiceNo ?? "",
                apInvoiceId: detail.apInvoiceId ?? "",
                apInvoiceNo: detail.apInvoiceNo ?? "",
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setInvoice(updatedInvoice as ArInvoiceHdSchemaType)
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
      // Selection completed
    }
  }

  // Remove direct refetchInvoices from handleFilterChange
  const handleFilterChange = (newFilters: IArInvoiceFilter) => {
    setFilters(newFilters)
    // Data refresh handled by InvoiceTable component
  }

  // Data refresh handled by InvoiceTable component

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

  // Clear form errors when tab changes
  useEffect(() => {
    form.clearErrors()
  }, [activeTab, form])

  const handleInvoiceSearch = async (value: string) => {
    if (!value) return

    setIsLoadingInvoice(true)

    try {
      const response = await getById(`${ArInvoice.getByIdNo}/0/${value}`)

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

            customerId: detailedInvoice.customerId ?? 0,
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
            addressId: detailedInvoice.addressId ?? 0, // Not available in IArInvoiceHd
            contactId: detailedInvoice.contactId ?? 0, // Not available in IArInvoiceHd
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
            apInvoiceId: detailedInvoice.apInvoiceId ?? "",
            apInvoiceNo: detailedInvoice.apInvoiceNo ?? "",
            editVersion: detailedInvoice.editVersion ?? 0,
            salesOrderId: detailedInvoice.salesOrderId ?? 0,
            salesOrderNo: detailedInvoice.salesOrderNo ?? "",
            isCancel: detailedInvoice.isCancel ?? false,
            cancelRemarks: detailedInvoice.cancelRemarks ?? "",

            data_details:
              detailedInvoice.data_details?.map((detail: IArInvoiceDt) => ({
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
                salesOrderId: detail.salesOrderId ?? "",
                salesOrderNo: detail.salesOrderNo ?? "",
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                supplierName: detail.supplierName ?? "",
                suppInvoiceNo: detail.suppInvoiceNo ?? "",
                apInvoiceId: detail.apInvoiceId ?? "",
                apInvoiceNo: detail.apInvoiceNo ?? "",
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setInvoice(updatedInvoice as ArInvoiceHdSchemaType)
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
  const isCancelled = invoice?.isCancel === true
  // Calculate payment status
  const balAmt = invoice?.balAmt ?? 0
  const payAmt = invoice?.payAmt ?? 0
  const totAmt = invoice?.totAmt ?? 0

  const paymentStatus =
    balAmt === 0 && payAmt > 0
      ? "Fully Paid"
      : balAmt > 0 && payAmt > 0
        ? "Partially Paid"
        : balAmt > 0 && payAmt === 0
          ? "Not Paid"
          : null

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
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Cancel Remarks Badge */}
            {isCancelled && invoice?.cancelRemarks && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  <span className="mr-1 h-2 w-2 rounded-full bg-red-400"></span>
                  Cancelled
                </span>
                <div className="max-w-xs truncate text-sm text-red-600">
                  {invoice.cancelRemarks}
                </div>
              </div>
            )}

            {/* Payment Status Badge */}
            {paymentStatus === "Not Paid" && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                <span className="mr-1 h-2 w-2 rounded-full bg-red-400"></span>
                Not Paid
              </span>
            )}
            {paymentStatus === "Partially Paid" && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                <span className="mr-1 h-2 w-2 rounded-full bg-orange-400"></span>
                Partially Paid
              </span>
            )}
            {paymentStatus === "Fully Paid" && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-400"></span>
                Fully Paid
              </span>
            )}
          </div>

          <h1>
            {/* Outer wrapper: gradient border or yellow pulsing border */}
            <span
              className={`relative inline-flex rounded-full p-[2px] transition-all ${
                isEdit
                  ? "bg-gradient-to-r from-purple-500 to-blue-500" // pulsing yellow border on edit
                  : "animate-pulse bg-gradient-to-r from-purple-500 to-blue-500" // default gradient border
              } `}
            >
              {/* Inner pill: solid dark background + white text - same size as Fully Paid badge */}
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${isEdit ? "text-white" : "text-white"}`}
              >
                {titleText}
              </span>
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <Input
              value={searchNo}
              onChange={(e) => setSearchNo(e.target.value)}
              onBlur={handleSearchNoBlur}
              onKeyDown={handleSearchNoKeyDown}
              placeholder="Search Invoice No"
              className="h-8 text-sm"
              readOnly={!!invoice?.invoiceId && invoice.invoiceId !== "0"}
              disabled={!!invoice?.invoiceId && invoice.invoiceId !== "0"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={false}
            >
              <ListFilter className="mr-1 h-4 w-4" />
              List
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveConfirm(true)}
              disabled={
                !canView ||
                isSaving ||
                saveMutation.isPending ||
                updateMutation.isPending ||
                isCancelled ||
                payAmt > 0 ||
                (isEdit && !canEdit) ||
                (!isEdit && !canCreate)
              }
              className={isEdit ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {isSaving ||
              saveMutation.isPending ||
              updateMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              {isSaving || saveMutation.isPending || updateMutation.isPending
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update"
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
              //disabled={!invoice}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={!invoice || invoice.invoiceId === "0" || isCancelled}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !canView ||
                !invoice ||
                invoice.invoiceId === "0" ||
                deleteMutation.isPending ||
                isCancelled ||
                payAmt > 0 ||
                !canDelete
              }
            >
              {deleteMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Trash2 className="mr-1 h-4 w-4" />
              )}
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
            isCancelled={isCancelled}
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
            // Data refresh handled by InvoiceTable component
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

          <InvoiceTable
            onInvoiceSelect={handleInvoiceSelect}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
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

      {/* Delete Confirmation - First Level */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => handleDeleteConfirmation()}
        itemName={invoice?.invoiceNo}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? You will be asked to provide a reason."
        isDeleting={false}
      />

      {/* Cancel Confirmation - Second Level */}
      <CancelConfirmation
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirmAction={handleInvoiceDelete}
        itemName={invoice?.invoiceNo}
        title="Cancel Invoice"
        description="Please provide a reason for cancelling this invoice."
        isCancelling={deleteMutation.isPending}
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
