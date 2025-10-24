"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { IArReceiptDt, IArReceiptFilter, IArReceiptHd } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ArReceiptDtSchemaType,
  ArReceiptHdSchemaType,
  arreceiptHdSchema,
} from "@/schemas"
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
import { ArReceipt } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils"
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
import Main from "./components/main-tab"
import Other from "./components/other"
import { defaultReceipt } from "./components/receipt-defaultvalues"
import ReceiptTable from "./components/receipt-table"

export default function ReceiptPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ar
  const transactionId = ARTransactionId.receipt

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)
  const [isSelectingReceipt, setIsSelectingReceipt] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [receipt, setReceipt] = useState<ArReceiptHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IArReceiptFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "receiptNo",
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
  const form = useForm<ArReceiptHdSchemaType>({
    resolver: zodResolver(arreceiptHdSchema(required, visible)),
    defaultValues: receipt
      ? {
          receiptId: receipt.receiptId?.toString() ?? "0",
          receiptNo: receipt.receiptNo ?? "",
          referenceNo: receipt.referenceNo ?? "",
          trnDate: receipt.trnDate ?? new Date(),
          accountDate: receipt.accountDate ?? new Date(),
          bankId: receipt.bankId ?? 0,
          paymentTypeId: receipt.paymentTypeId ?? 0,
          chequeNo: receipt.chequeNo ?? "",
          chequeDate: receipt.chequeDate ?? new Date(),
          bankChgGLId: receipt.bankChgGLId ?? 0,
          bankChgAmt: receipt.bankChgAmt ?? 0,
          bankChgLocalAmt: receipt.bankChgLocalAmt ?? 0,
          customerId: receipt.customerId ?? 0,
          currencyId: receipt.currencyId ?? 0,
          exhRate: receipt.exhRate ?? 0,
          totAmt: receipt.totAmt ?? 0,
          totLocalAmt: receipt.totLocalAmt ?? 0,
          recCurrencyId: receipt.recCurrencyId ?? 0,
          recExhRate: receipt.recExhRate ?? 0,
          recTotAmt: receipt.recTotAmt ?? 0,
          recTotLocalAmt: receipt.recTotLocalAmt ?? 0,
          unAllocTotAmt: receipt.unAllocTotAmt ?? 0,
          unAllocTotLocalAmt: receipt.unAllocTotLocalAmt ?? 0,
          exhGainLoss: receipt.exhGainLoss ?? 0,
          remarks: receipt.remarks ?? "",
          docExhRate: receipt.docExhRate ?? 0,
          docTotAmt: receipt.docTotAmt ?? 0,
          docTotLocalAmt: receipt.docTotLocalAmt ?? 0,
          allocTotAmt: receipt.allocTotAmt ?? 0,
          allocTotLocalAmt: receipt.allocTotLocalAmt ?? 0,
          jobOrderId: receipt.jobOrderId ?? 0,
          jobOrderNo: receipt.jobOrderNo ?? "",
          moduleFrom: receipt.moduleFrom ?? "",
          editVersion: receipt.editVersion ?? 0,
          data_details:
            receipt.data_details?.map((detail) => ({
              ...detail,
              receiptId: detail.receiptId?.toString() ?? "0",
              receiptNo: detail.receiptNo ?? "",
              documentId: detail.documentId?.toString() ?? "0",
              documentNo: detail.documentNo ?? "",
              referenceNo: detail.referenceNo ?? "",
              docCurrencyId: detail.docCurrencyId ?? 0,
              docExhRate: detail.docExhRate ?? 0,
              docAccountDate: detail.docAccountDate ?? "",
              docDueDate: detail.docDueDate ?? "",
              docTotAmt: detail.docTotAmt ?? 0,
              docTotLocalAmt: detail.docTotLocalAmt ?? 0,
              docBalAmt: detail.docBalAmt ?? 0,
              docBalLocalAmt: detail.docBalLocalAmt ?? 0,
              allocAmt: detail.allocAmt ?? 0,
              allocLocalAmt: detail.allocLocalAmt ?? 0,
              docAllocAmt: detail.docAllocAmt ?? 0,
              docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
              centDiff: detail.centDiff ?? 0,
              exhGainLoss: detail.exhGainLoss ?? 0,
              editVersion: detail.editVersion ?? 0,
            })) || [],
        }
      : {
          ...defaultReceipt,
        },
  })

  // API hooks for receipts - Only fetch when List dialog is opened (optimized)
  const {
    data: receiptsResponse,
    refetch: refetchReceipts,
    isLoading: isLoadingReceipts,
    isRefetching: isRefetchingReceipts,
  } = useGetWithDates<IArReceiptHd>(
    `${ArReceipt.get}`,
    TableName.arReceipt,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize receipt data to prevent unnecessary re-renders
  const receiptsData = useMemo(
    () => (receiptsResponse as ApiResponse<IArReceiptHd>)?.data ?? [],
    [receiptsResponse]
  )

  // Mutations
  const saveMutation = usePersist<ArReceiptHdSchemaType>(`${ArReceipt.add}`)
  const updateMutation = usePersist<ArReceiptHdSchemaType>(`${ArReceipt.add}`)
  const deleteMutation = useDelete(`${ArReceipt.delete}`)

  // Remove the useGetReceiptById hook for selection
  // const { data: receiptByIdData, refetch: refetchReceiptById } = ...

  // Handle Save
  const handleSaveReceipt = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IArReceiptHd
      )

      console.log("formValues", formValues)

      // Validate the form data using the schema
      const validationResult = arreceiptHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(".") as keyof ArReceiptHdSchemaType
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
        Number(formValues.receiptId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const receiptData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (receiptData) {
          const updatedSchemaType = transformToSchemaType(
            receiptData as unknown as IArReceiptHd
          )
          setIsSelectingReceipt(true)
          setReceipt(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchReceipts()
      } else {
        toast.error(response.message || "Failed to save receipt")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving receipt")
    } finally {
      setIsSaving(false)
      setIsSelectingReceipt(false)
    }
  }

  // Handle Clone
  const handleCloneReceipt = () => {
    if (receipt) {
      // Create a proper clone with form values
      const clonedReceipt: ArReceiptHdSchemaType = {
        ...receipt,
        receiptId: "0",
        receiptNo: "",
        // Reset amounts for new receipt
        totAmt: 0,
        totLocalAmt: 0,
        recTotAmt: 0,
        recTotLocalAmt: 0,
        unAllocTotAmt: 0,
        unAllocTotLocalAmt: 0,
        exhGainLoss: 0,
        docTotAmt: 0,
        docTotLocalAmt: 0,
        allocTotAmt: 0,
        allocTotLocalAmt: 0,
        bankChgAmt: 0,
        bankChgLocalAmt: 0,
        // Reset data details
        data_details: [],
      }
      setReceipt(clonedReceipt)
      form.reset(clonedReceipt)
      toast.success("Receipt cloned successfully")
    }
  }

  // Handle Delete
  const handleReceiptDelete = async () => {
    if (!receipt) return

    try {
      const response = await deleteMutation.mutateAsync(
        receipt.receiptId?.toString() ?? ""
      )
      if (response.result === 1) {
        setReceipt(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultReceipt,
          data_details: [],
        })
        //toast.success("Receipt deleted successfully")
        refetchReceipts()
      } else {
        toast.error(response.message || "Failed to delete receipt")
      }
    } catch {
      toast.error("Network error while deleting receipt")
    }
  }

  // Handle Reset
  const handleReceiptReset = () => {
    setReceipt(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultReceipt,
      data_details: [],
    })
    toast.success("Receipt reset successfully")
  }

  // Helper function to transform IArReceiptHd to ArReceiptHdSchemaType
  const transformToSchemaType = (
    apiReceipt: IArReceiptHd
  ): ArReceiptHdSchemaType => {
    return {
      receiptId: apiReceipt.receiptId?.toString() ?? "0",
      receiptNo: apiReceipt.receiptNo ?? "",
      referenceNo: apiReceipt.referenceNo ?? "",
      trnDate: apiReceipt.trnDate
        ? format(
            parseDate(apiReceipt.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiReceipt.accountDate
        ? format(
            parseDate(apiReceipt.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankId: apiReceipt.bankId ?? 0,
      paymentTypeId: apiReceipt.paymentTypeId ?? 0,
      chequeNo: apiReceipt.chequeNo ?? "",
      chequeDate: apiReceipt.chequeDate
        ? format(
            parseDate(apiReceipt.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankChgGLId: apiReceipt.bankChgGLId ?? 0,
      bankChgAmt: apiReceipt.bankChgAmt ?? 0,
      bankChgLocalAmt: apiReceipt.bankChgLocalAmt ?? 0,
      customerId: apiReceipt.customerId ?? 0,
      currencyId: apiReceipt.currencyId ?? 0,
      exhRate: apiReceipt.exhRate ?? 0,
      totAmt: apiReceipt.totAmt ?? 0,
      totLocalAmt: apiReceipt.totLocalAmt ?? 0,
      recCurrencyId: apiReceipt.recCurrencyId ?? 0,
      recExhRate: apiReceipt.recExhRate ?? 0,
      recTotAmt: apiReceipt.recTotAmt ?? 0,
      recTotLocalAmt: apiReceipt.recTotLocalAmt ?? 0,
      unAllocTotAmt: apiReceipt.unAllocTotAmt ?? 0,
      unAllocTotLocalAmt: apiReceipt.unAllocTotLocalAmt ?? 0,
      exhGainLoss: apiReceipt.exhGainLoss ?? 0,
      remarks: apiReceipt.remarks ?? "",
      docExhRate: apiReceipt.docExhRate ?? 0,
      docTotAmt: apiReceipt.docTotAmt ?? 0,
      docTotLocalAmt: apiReceipt.docTotLocalAmt ?? 0,
      allocTotAmt: apiReceipt.allocTotAmt ?? 0,
      allocTotLocalAmt: apiReceipt.allocTotLocalAmt ?? 0,
      jobOrderId: apiReceipt.jobOrderId ?? 0,
      jobOrderNo: apiReceipt.jobOrderNo ?? "",
      moduleFrom: apiReceipt.moduleFrom ?? "",
      editVersion: apiReceipt.editVersion ?? 0,
      createBy: apiReceipt.createById?.toString() ?? "",
      editBy: apiReceipt.editById?.toString() ?? "",
      cancelBy: apiReceipt.cancelById?.toString() ?? "",
      createDate: apiReceipt.createDate
        ? format(
            parseDate(apiReceipt.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      editDate: apiReceipt.editDate
        ? format(
            parseDate(apiReceipt.editDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelDate: apiReceipt.cancelDate
        ? format(
            parseDate(apiReceipt.cancelDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiReceipt.cancelRemarks ?? "",
      data_details:
        apiReceipt.data_details?.map(
          (detail) =>
            ({
              ...detail,
              receiptId: detail.receiptId?.toString() ?? "0",
              receiptNo: detail.receiptNo ?? "",
              itemNo: detail.itemNo ?? 0,
              transactionId: detail.transactionId ?? 0,
              documentId: detail.documentId?.toString() ?? "0",
              documentNo: detail.documentNo ?? "",
              referenceNo: detail.referenceNo ?? "",
              docCurrencyId: detail.docCurrencyId ?? 0,
              docExhRate: detail.docExhRate ?? 0,
              docAccountDate: detail.docAccountDate
                ? format(
                    parseDate(detail.docAccountDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              docDueDate: detail.docDueDate
                ? format(
                    parseDate(detail.docDueDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              docTotAmt: detail.docTotAmt ?? 0,
              docTotLocalAmt: detail.docTotLocalAmt ?? 0,
              docBalAmt: detail.docBalAmt ?? 0,
              docBalLocalAmt: detail.docBalLocalAmt ?? 0,
              allocAmt: detail.allocAmt ?? 0,
              allocLocalAmt: detail.allocLocalAmt ?? 0,
              docAllocAmt: detail.docAllocAmt ?? 0,
              docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
              centDiff: detail.centDiff ?? 0,
              exhGainLoss: detail.exhGainLoss ?? 0,
              editVersion: detail.editVersion ?? 0,
            }) as unknown as ArReceiptDtSchemaType
        ) || [],
    }
  }

  const handleReceiptSelect = async (
    selectedReceipt: IArReceiptHd | undefined
  ) => {
    if (!selectedReceipt) return

    setIsSelectingReceipt(true)

    try {
      // Fetch receipt details directly using selected receipt's values
      const response = await getById(
        `${ArReceipt.getByIdNo}/${selectedReceipt.receiptId}/${selectedReceipt.receiptNo}`
      )

      if (response?.result === 1) {
        const detailedReceipt = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedReceipt) {
          // Parse dates properly
          const updatedReceipt = {
            ...detailedReceipt,
            receiptId: detailedReceipt.receiptId?.toString() ?? "0",
            receiptNo: detailedReceipt.receiptNo ?? "",
            referenceNo: detailedReceipt.referenceNo ?? "",
            trnDate: detailedReceipt.trnDate
              ? format(
                  parseDate(detailedReceipt.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedReceipt.accountDate
              ? format(
                  parseDate(detailedReceipt.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            customerId: detailedReceipt.customerId ?? 0,
            currencyId: detailedReceipt.currencyId ?? 0,
            exhRate: detailedReceipt.exhRate ?? 0,
            bankId: detailedReceipt.bankId ?? 0,
            totAmt: detailedReceipt.totAmt ?? 0,
            totLocalAmt: detailedReceipt.totLocalAmt ?? 0,
            recTotAmt: detailedReceipt.recTotAmt ?? 0,
            recTotLocalAmt: detailedReceipt.recTotLocalAmt ?? 0,
            unAllocTotAmt: detailedReceipt.unAllocTotAmt ?? 0,
            unAllocTotLocalAmt: detailedReceipt.unAllocTotLocalAmt ?? 0,
            exhGainLoss: detailedReceipt.exhGainLoss ?? 0,
            remarks: detailedReceipt.remarks ?? "",
            docExhRate: detailedReceipt.docExhRate ?? 0,
            docTotAmt: detailedReceipt.docTotAmt ?? 0,
            docTotLocalAmt: detailedReceipt.docTotLocalAmt ?? 0,
            allocTotAmt: detailedReceipt.allocTotAmt ?? 0,
            allocTotLocalAmt: detailedReceipt.allocTotLocalAmt ?? 0,
            bankChgAmt: detailedReceipt.bankChgAmt ?? 0,
            bankChgLocalAmt: detailedReceipt.bankChgLocalAmt ?? 0,
            data_details:
              detailedReceipt.data_details?.map((detail: IArReceiptDt) => ({
                receiptId: detail.receiptId?.toString() ?? "0",
                receiptNo: detail.receiptNo ?? "",
                itemNo: detail.itemNo ?? 0,
                transactionId: detail.transactionId ?? 0,
                documentId: detail.documentId?.toString() ?? "0",
                documentNo: detail.documentNo ?? "",
                referenceNo: detail.referenceNo ?? "",
                docCurrencyId: detail.docCurrencyId ?? 0,
                docExhRate: detail.docExhRate ?? 0,
                docAccountDate: detail.docAccountDate
                  ? format(
                      parseDate(detail.docAccountDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                docDueDate: detail.docDueDate
                  ? format(
                      parseDate(detail.docDueDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                docTotAmt: detail.docTotAmt ?? 0,
                docTotLocalAmt: detail.docTotLocalAmt ?? 0,
                docBalAmt: detail.docBalAmt ?? 0,
                docBalLocalAmt: detail.docBalLocalAmt ?? 0,
                allocAmt: detail.allocAmt ?? 0,
                allocLocalAmt: detail.allocLocalAmt ?? 0,
                docAllocAmt: detail.docAllocAmt ?? 0,
                docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
                centDiff: detail.centDiff ?? 0,
                exhGainLoss: detail.exhGainLoss ?? 0,
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setReceipt(updatedReceipt as ArReceiptHdSchemaType)
          setReceipt(transformToSchemaType(updatedReceipt))
          form.reset(updatedReceipt)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Receipt ${selectedReceipt.receiptNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch receipt details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching receipt details:", error)
      toast.error("Error loading receipt. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingReceipt(false)
    }
  }

  // Remove direct refetchReceipts from handleFilterChange
  const handleFilterChange = (newFilters: IArReceiptFilter) => {
    setFilters(newFilters)
    // refetchReceipts(); // Removed: will be handled by useEffect
  }

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
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty])

  // Clear form errors when tab changes (optional)
  useEffect(() => {
    // Only clear errors if there are any errors present
    if (Object.keys(form.formState.errors).length > 0) {
      form.clearErrors()
    }
  }, [activeTab, form])

  const handleReceiptSearch = async (value: string) => {
    if (!value) return

    setIsLoadingReceipt(true)

    try {
      const response = await getById(`${ArReceipt.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedReceipt = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedReceipt) {
          // Parse dates properly
          const updatedReceipt = {
            ...detailedReceipt,
            receiptId: detailedReceipt.receiptId?.toString() ?? "0",
            receiptNo: detailedReceipt.receiptNo ?? "",
            referenceNo: detailedReceipt.referenceNo ?? "",
            suppInvoiceNo: "", // Required by schema but not in interface
            trnDate: detailedReceipt.trnDate
              ? format(
                  parseDate(detailedReceipt.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedReceipt.accountDate
              ? format(
                  parseDate(detailedReceipt.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            customerId: detailedReceipt.customerId ?? 0,
            currencyId: detailedReceipt.currencyId ?? 0,
            exhRate: detailedReceipt.exhRate ?? 0,
            bankId: detailedReceipt.bankId ?? 0,
            paymentTypeId: detailedReceipt.paymentTypeId ?? 0,
            chequeNo: detailedReceipt.chequeNo ?? "",
            chequeDate: detailedReceipt.chequeDate
              ? format(
                  parseDate(detailedReceipt.chequeDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            bankChgGLId: detailedReceipt.bankChgGLId ?? 0,
            bankChgAmt: detailedReceipt.bankChgAmt ?? 0,
            bankChgLocalAmt: detailedReceipt.bankChgLocalAmt ?? 0,
            totAmt: detailedReceipt.totAmt ?? 0,
            totLocalAmt: detailedReceipt.totLocalAmt ?? 0,
            recCurrencyId: detailedReceipt.recCurrencyId ?? 0,
            recExhRate: detailedReceipt.recExhRate ?? 0,
            recTotAmt: detailedReceipt.recTotAmt ?? 0,
            recTotLocalAmt: detailedReceipt.recTotLocalAmt ?? 0,
            unAllocTotAmt: detailedReceipt.unAllocTotAmt ?? 0,
            unAllocTotLocalAmt: detailedReceipt.unAllocTotLocalAmt ?? 0,
            exhGainLoss: detailedReceipt.exhGainLoss ?? 0,
            remarks: detailedReceipt.remarks ?? "",
            docExhRate: detailedReceipt.docExhRate ?? 0,
            docTotAmt: detailedReceipt.docTotAmt ?? 0,
            docTotLocalAmt: detailedReceipt.docTotLocalAmt ?? 0,
            allocTotAmt: detailedReceipt.allocTotAmt ?? 0,
            allocTotLocalAmt: detailedReceipt.allocTotLocalAmt ?? 0,
            jobOrderId: detailedReceipt.jobOrderId ?? 0,
            jobOrderNo: detailedReceipt.jobOrderNo ?? "",
            moduleFrom: detailedReceipt.moduleFrom ?? "",
            editVersion: detailedReceipt.editVersion ?? 0,
            createBy: detailedReceipt.createById?.toString() ?? "",
            createDate: detailedReceipt.createDate
              ? format(
                  parseDate(detailedReceipt.createDate as string) || new Date(),
                  clientDateFormat
                )
              : "",
            editBy: detailedReceipt.editById?.toString() ?? "",
            editDate: detailedReceipt.editDate
              ? format(
                  parseDate(detailedReceipt.editDate as string) || new Date(),
                  clientDateFormat
                )
              : "",
            cancelBy: detailedReceipt.cancelById?.toString() ?? "",
            cancelDate: detailedReceipt.cancelDate
              ? format(
                  parseDate(detailedReceipt.cancelDate as string) || new Date(),
                  clientDateFormat
                )
              : "",
            cancelRemarks: detailedReceipt.cancelRemarks ?? "",

            data_details:
              detailedReceipt.data_details?.map((detail: IArReceiptDt) => ({
                receiptId: detail.receiptId?.toString() ?? "0",
                receiptNo: detail.receiptNo ?? "",
                itemNo: detail.itemNo ?? 0,
                transactionId: detail.transactionId ?? 0,
                documentId: detail.documentId?.toString() ?? "0",
                documentNo: detail.documentNo ?? "",
                referenceNo: detail.referenceNo ?? "",
                docCurrencyId: detail.docCurrencyId ?? 0,
                docExhRate: detail.docExhRate ?? 0,
                docAccountDate: detail.docAccountDate
                  ? format(
                      parseDate(detail.docAccountDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                docDueDate: detail.docDueDate
                  ? format(
                      parseDate(detail.docDueDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                docTotAmt: detail.docTotAmt ?? 0,
                docTotLocalAmt: detail.docTotLocalAmt ?? 0,
                docBalAmt: detail.docBalAmt ?? 0,
                docBalLocalAmt: detail.docBalLocalAmt ?? 0,
                allocAmt: detail.allocAmt ?? 0,
                allocLocalAmt: detail.allocLocalAmt ?? 0,
                docAllocAmt: detail.docAllocAmt ?? 0,
                docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
                centDiff: detail.centDiff ?? 0,
                exhGainLoss: detail.exhGainLoss ?? 0,
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setReceipt(updatedReceipt as ArReceiptHdSchemaType)
          setReceipt(transformToSchemaType(updatedReceipt))
          form.reset(updatedReceipt)
          form.trigger()

          // Show success message
          toast.success(`Receipt ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(response?.message || "Failed to fetch receipt details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching receipt details:", error)
      toast.error("Error loading receipt. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsLoadingReceipt(false)
    }
  }

  // Determine mode and receipt ID from URL
  const receiptNo = form.getValues("receiptNo")
  const isEdit = Boolean(receiptNo)

  // Compose title text
  const titleText = isEdit ? `Receipt (Edit) - ${receiptNo}` : "Receipt (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading receipt form...</p>
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
              placeholder="Search Receipt No"
              className="h-8 text-sm"
              readOnly={!!receipt?.receiptId && receipt.receiptId !== "0"}
              disabled={!!receipt?.receiptId && receipt.receiptId !== "0"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={isLoadingReceipts || isRefetchingReceipts}
            >
              {isLoadingReceipts || isRefetchingReceipts ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <ListFilter className="mr-1 h-4 w-4" />
              )}
              {isLoadingReceipts || isRefetchingReceipts
                ? "Loading..."
                : "List"}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveConfirm(true)}
              disabled={
                isSaving || saveMutation.isPending || updateMutation.isPending
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
              disabled={!receipt || receipt.receiptId === "0"}
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
              disabled={!receipt || receipt.receiptId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !receipt ||
                receipt.receiptId === "0" ||
                deleteMutation.isPending
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
              handleSaveReceipt()
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
            refetchReceipts()
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
                  Receipt List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing receipts from the list below. Use
                  search to filter records or create new receipts.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingReceipts || isRefetchingReceipts || isSelectingReceipt ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingReceipt
                    ? "Loading receipt details..."
                    : "Loading receipts..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingReceipt
                    ? "Please wait while we fetch the complete receipt data"
                    : "Please wait while we fetch the receipt list"}
                </p>
              </div>
            </div>
          ) : (
            <ReceiptTable
              data={receiptsData || []}
              isLoading={false}
              onReceiptSelect={handleReceiptSelect}
              onRefresh={() => refetchReceipts()}
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
        onConfirm={handleSaveReceipt}
        itemName={receipt?.receiptNo || "New Receipt"}
        operationType={
          receipt?.receiptId && receipt.receiptId !== "0" ? "update" : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleReceiptDelete}
        itemName={receipt?.receiptNo}
        title="Delete Receipt"
        description="This action cannot be undone. All receipt details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleReceiptSearch(searchNo)}
        code={searchNo}
        typeLabel="Receipt"
        showDetails={false}
        description={`Do you want to load Receipt ${searchNo}?`}
        isLoading={isLoadingReceipt}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleReceiptReset}
        itemName={receipt?.receiptNo}
        title="Reset Receipt"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneReceipt}
        itemName={receipt?.receiptNo}
        title="Clone Receipt"
        description="This will create a copy as a new receipt."
      />
    </div>
  )
}
