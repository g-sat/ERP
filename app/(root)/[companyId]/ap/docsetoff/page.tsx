"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  IApDocsetoffDt,
  IApDocsetoffFilter,
  IApDocsetoffHd,
} from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApDocsetoffDtSchemaType,
  ApDocsetoffHdSchemaType,
  apdocsetoffHdSchema,
  appaymentHdSchema,
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
import { ApDocsetoff } from "@/lib/api-routes"
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

import { defaultDocsetoff } from "./components/docsetoff-defaultvalues"
import DocsetoffTable from "./components/docsetoff-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function DocsetoffPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.docsetoff

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingDocsetoff, setIsLoadingDocsetoff] = useState(false)
  const [isSelectingPayment, setIsSelectingPayment] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [docsetoff, setDocsetoff] = useState<ApDocsetoffHdSchemaType | null>(
    null
  )
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IApDocsetoffFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "setoffNo",
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
  const form = useForm<ApDocsetoffHdSchemaType>({
    resolver: zodResolver(apdocsetoffHdSchema(required, visible)),
    defaultValues: docsetoff
      ? {
          setoffId: docsetoff.setoffId?.toString() ?? "0",
          setoffNo: docsetoff.setoffNo ?? "",
          referenceNo: docsetoff.referenceNo ?? "",
          trnDate: docsetoff.trnDate ?? new Date(),
          accountDate: docsetoff.accountDate ?? new Date(),
          bankId: docsetoff.bankId ?? 0,
          paymentTypeId: docsetoff.paymentTypeId ?? 0,
          chequeNo: docsetoff.chequeNo ?? "",
          chequeDate: docsetoff.chequeDate ?? new Date(),
          bankChgGLId: docsetoff.bankChgGLId ?? 0,
          bankChgAmt: docsetoff.bankChgAmt ?? 0,
          bankChgLocalAmt: docsetoff.bankChgLocalAmt ?? 0,
          supplierId: docsetoff.supplierId ?? 0,
          currencyId: docsetoff.currencyId ?? 0,
          exhRate: docsetoff.exhRate ?? 0,
          totAmt: docsetoff.totAmt ?? 0,
          totLocalAmt: docsetoff.totLocalAmt ?? 0,
          payCurrencyId: docsetoff.payCurrencyId ?? 0,
          payExhRate: docsetoff.payExhRate ?? 0,
          payTotAmt: docsetoff.payTotAmt ?? 0,
          payTotLocalAmt: docsetoff.payTotLocalAmt ?? 0,
          unAllocTotAmt: docsetoff.unAllocTotAmt ?? 0,
          unAllocTotLocalAmt: docsetoff.unAllocTotLocalAmt ?? 0,
          exhGainLoss: docsetoff.exhGainLoss ?? 0,
          remarks: docsetoff.remarks ?? "",
          docExhRate: docsetoff.docExhRate ?? 0,
          docTotAmt: docsetoff.docTotAmt ?? 0,
          docTotLocalAmt: docsetoff.docTotLocalAmt ?? 0,
          allocTotAmt: docsetoff.allocTotAmt ?? 0,
          allocTotLocalAmt: docsetoff.allocTotLocalAmt ?? 0,
          moduleFrom: docsetoff.moduleFrom ?? "",
          editVersion: docsetoff.editVersion ?? 0,
          data_details:
            docsetoff.data_details?.map((detail) => ({
              ...detail,
              setoffId: detail.setoffId?.toString() ?? "0",
              setoffNo: detail.setoffNo ?? "",
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
          ...defaultDocsetoff,
        },
  })

  // API hooks for payments - Only fetch when List dialog is opened (optimized)
  const {
    data: paymentsResponse,
    refetch: refetchPayments,
    isLoading: isLoadingDocsetoffs,
    isRefetching: isRefetchingPayments,
  } = useGetWithDates<IApDocsetoffHd>(
    `${ApDocsetoff.get}`,
    TableName.apPayment,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize docsetoff data to prevent unnecessary re-renders
  const paymentsData = useMemo(
    () => (paymentsResponse as ApiResponse<IApDocsetoffHd>)?.data ?? [],
    [paymentsResponse]
  )

  // Mutations
  const saveMutation = usePersist<ApDocsetoffHdSchemaType>(`${ApDocsetoff.add}`)
  const updateMutation = usePersist<ApDocsetoffHdSchemaType>(
    `${ApDocsetoff.add}`
  )
  const deleteMutation = useDelete(`${ApDocsetoff.delete}`)

  // Remove the useGetPaymentById hook for selection
  // const { data: paymentByIdData, refetch: refetchPaymentById } = ...

  // Handle Save
  const handleSavePayment = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IApDocsetoffHd
      )

      console.log("formValues", formValues)

      // Validate the form data using the schema
      const validationResult = appaymentHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof ApDocSetOffHdSchemaType
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
        Number(formValues.setoffId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const paymentData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (paymentData) {
          const updatedSchemaType = transformToSchemaType(
            paymentData as unknown as IApDocsetoffHd
          )
          setIsSelectingPayment(true)
          setDocsetoff(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Check if this was a new docsetoff or update
        const wasNewPayment = Number(formValues.setoffId) === 0

        if (wasNewPayment) {
          //toast.success(
          // `Docsetoff ${paymentData?.setoffNo || ""} saved successfully`
          //)
        } else {
          //toast.success("Docsetoff updated successfully")
        }

        refetchPayments()
      } else {
        toast.error(response.message || "Failed to save docsetoff")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving docsetoff")
    } finally {
      setIsSaving(false)
      setIsSelectingPayment(false)
    }
  }

  // Handle Clone
  const handleClonePayment = () => {
    if (docsetoff) {
      // Create a proper clone with form values
      const clonedPayment: ApDocsetoffHdSchemaType = {
        ...docsetoff,
        setoffId: "0",
        setoffNo: "",
        // Reset amounts for new docsetoff
        totAmt: 0,
        totLocalAmt: 0,
        payTotAmt: 0,
        payTotLocalAmt: 0,
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
      setDocsetoff(clonedPayment)
      form.reset(clonedPayment)
      toast.success("Docsetoff cloned successfully")
    }
  }

  // Handle Delete
  const handlePaymentDelete = async () => {
    if (!docsetoff) return

    try {
      const response = await deleteMutation.mutateAsync(
        docsetoff.setoffId?.toString() ?? ""
      )
      if (response.result === 1) {
        setDocsetoff(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultDocsetoff,
          data_details: [],
        })
        //toast.success("Docsetoff deleted successfully")
        refetchPayments()
      } else {
        toast.error(response.message || "Failed to delete docsetoff")
      }
    } catch {
      toast.error("Network error while deleting docsetoff")
    }
  }

  // Handle Reset
  const handlePaymentReset = () => {
    setDocsetoff(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultDocsetoff,
      data_details: [],
    })
    toast.success("Docsetoff reset successfully")
  }

  // Helper function to transform IApDocsetoffHd to ApDocsetoffHdSchemaType
  const transformToSchemaType = (
    apiPayment: IApDocsetoffHd
  ): ApDocsetoffHdSchemaType => {
    return {
      setoffId: apiPayment.setoffId?.toString() ?? "0",
      setoffNo: apiPayment.setoffNo ?? "",
      suppInvoiceNo: "", // Required by schema but not in interface
      referenceNo: apiPayment.referenceNo ?? "",
      trnDate: apiPayment.trnDate
        ? format(
            parseDate(apiPayment.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiPayment.accountDate
        ? format(
            parseDate(apiPayment.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankId: apiPayment.bankId ?? 0,
      paymentTypeId: apiPayment.paymentTypeId ?? 0,
      chequeNo: apiPayment.chequeNo ?? "",
      chequeDate: apiPayment.chequeDate
        ? format(
            parseDate(apiPayment.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankChgGLId: apiPayment.bankChgGLId ?? 0,
      bankChgAmt: apiPayment.bankChgAmt ?? 0,
      bankChgLocalAmt: apiPayment.bankChgLocalAmt ?? 0,
      supplierId: apiPayment.supplierId ?? 0,
      currencyId: apiPayment.currencyId ?? 0,
      exhRate: apiPayment.exhRate ?? 0,
      totAmt: apiPayment.totAmt ?? 0,
      totLocalAmt: apiPayment.totLocalAmt ?? 0,
      payCurrencyId: apiPayment.payCurrencyId ?? 0,
      payExhRate: apiPayment.payExhRate ?? 0,
      payTotAmt: apiPayment.payTotAmt ?? 0,
      payTotLocalAmt: apiPayment.payTotLocalAmt ?? 0,
      unAllocTotAmt: apiPayment.unAllocTotAmt ?? 0,
      unAllocTotLocalAmt: apiPayment.unAllocTotLocalAmt ?? 0,
      exhGainLoss: apiPayment.exhGainLoss ?? 0,
      remarks: apiPayment.remarks ?? "",
      docExhRate: apiPayment.docExhRate ?? 0,
      docTotAmt: apiPayment.docTotAmt ?? 0,
      docTotLocalAmt: apiPayment.docTotLocalAmt ?? 0,
      allocTotAmt: apiPayment.allocTotAmt ?? 0,
      allocTotLocalAmt: apiPayment.allocTotLocalAmt ?? 0,
      moduleFrom: apiPayment.moduleFrom ?? "",
      editVersion: apiPayment.editVersion ?? 0,
      createBy: apiPayment.createById?.toString() ?? "",
      editBy: apiPayment.editById?.toString() ?? "",
      cancelBy: apiPayment.cancelById?.toString() ?? "",
      createDate: apiPayment.createDate
        ? format(
            parseDate(apiPayment.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      editDate: apiPayment.editDate
        ? format(
            parseDate(apiPayment.editDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelDate: apiPayment.cancelDate
        ? format(
            parseDate(apiPayment.cancelDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiPayment.cancelRemarks ?? "",
      data_details:
        apiPayment.data_details?.map(
          (detail) =>
            ({
              ...detail,
              setoffId: detail.setoffId?.toString() ?? "0",
              setoffNo: detail.setoffNo ?? "",
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
            }) as unknown as ApDocsetoffDtSchemaType
        ) || [],
    }
  }

  const handlePaymentSelect = async (
    selectedPayment: IApDocsetoffHd | undefined
  ) => {
    if (!selectedPayment) return

    setIsSelectingPayment(true)

    try {
      // Fetch docsetoff details directly using selected docsetoff's values
      const response = await getById(
        `${ApDocsetoff.getByIdNo}/${selectedPayment.setoffId}/${selectedPayment.setoffNo}`
      )

      if (response?.result === 1) {
        const detailedPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPayment) {
          // Parse dates properly
          const updatedPayment = {
            ...detailedPayment,
            setoffId: detailedPayment.setoffId?.toString() ?? "0",
            setoffNo: detailedPayment.setoffNo ?? "",
            referenceNo: detailedPayment.referenceNo ?? "",
            trnDate: detailedPayment.trnDate
              ? format(
                  parseDate(detailedPayment.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedPayment.accountDate
              ? format(
                  parseDate(detailedPayment.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedPayment.supplierId ?? 0,
            currencyId: detailedPayment.currencyId ?? 0,
            exhRate: detailedPayment.exhRate ?? 0,
            bankId: detailedPayment.bankId ?? 0,
            totAmt: detailedPayment.totAmt ?? 0,
            totLocalAmt: detailedPayment.totLocalAmt ?? 0,
            payTotAmt: detailedPayment.payTotAmt ?? 0,
            payTotLocalAmt: detailedPayment.payTotLocalAmt ?? 0,
            unAllocTotAmt: detailedPayment.unAllocTotAmt ?? 0,
            unAllocTotLocalAmt: detailedPayment.unAllocTotLocalAmt ?? 0,
            exhGainLoss: detailedPayment.exhGainLoss ?? 0,
            remarks: detailedPayment.remarks ?? "",
            docExhRate: detailedPayment.docExhRate ?? 0,
            docTotAmt: detailedPayment.docTotAmt ?? 0,
            docTotLocalAmt: detailedPayment.docTotLocalAmt ?? 0,
            allocTotAmt: detailedPayment.allocTotAmt ?? 0,
            allocTotLocalAmt: detailedPayment.allocTotLocalAmt ?? 0,
            bankChgAmt: detailedPayment.bankChgAmt ?? 0,
            bankChgLocalAmt: detailedPayment.bankChgLocalAmt ?? 0,
            data_details:
              detailedPayment.data_details?.map((detail: IApDocsetoffDt) => ({
                setoffId: detail.setoffId?.toString() ?? "0",
                setoffNo: detail.setoffNo ?? "",
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

          //setDocsetoff(updatedPayment as ApDocsetoffHdSchemaType)
          setDocsetoff(transformToSchemaType(updatedPayment))
          form.reset(updatedPayment)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Docsetoff ${selectedPayment.setoffNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch docsetoff details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching docsetoff details:", error)
      toast.error("Error loading docsetoff. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingPayment(false)
    }
  }

  // Remove direct refetchPayments from handleFilterChange
  const handleFilterChange = (newFilters: IApDocsetoffFilter) => {
    setFilters(newFilters)
    // refetchPayments(); // Removed: will be handled by useEffect
  }

  // Refetch payments when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchPayments()
    }
  }, [filters, showListDialog, refetchPayments])

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

  const handlePaymentSearch = async (value: string) => {
    if (!value) return

    setIsLoadingDocsetoff(true)

    try {
      const response = await getById(`${ApDocsetoff.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPayment) {
          // Parse dates properly
          const updatedPayment = {
            ...detailedPayment,
            setoffId: detailedPayment.setoffId?.toString() ?? "0",
            setoffNo: detailedPayment.setoffNo ?? "",
            referenceNo: detailedPayment.referenceNo ?? "",
            suppInvoiceNo: "", // Required by schema but not in interface
            trnDate: detailedPayment.trnDate
              ? format(
                  parseDate(detailedPayment.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedPayment.accountDate
              ? format(
                  parseDate(detailedPayment.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedPayment.supplierId ?? 0,
            currencyId: detailedPayment.currencyId ?? 0,
            exhRate: detailedPayment.exhRate ?? 0,
            bankId: detailedPayment.bankId ?? 0,
            paymentTypeId: detailedPayment.paymentTypeId ?? 0,
            chequeNo: detailedPayment.chequeNo ?? "",
            chequeDate: detailedPayment.chequeDate
              ? format(
                  parseDate(detailedPayment.chequeDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            bankChgGLId: detailedPayment.bankChgGLId ?? 0,
            bankChgAmt: detailedPayment.bankChgAmt ?? 0,
            bankChgLocalAmt: detailedPayment.bankChgLocalAmt ?? 0,
            totAmt: detailedPayment.totAmt ?? 0,
            totLocalAmt: detailedPayment.totLocalAmt ?? 0,
            payCurrencyId: detailedPayment.payCurrencyId ?? 0,
            payExhRate: detailedPayment.payExhRate ?? 0,
            payTotAmt: detailedPayment.payTotAmt ?? 0,
            payTotLocalAmt: detailedPayment.payTotLocalAmt ?? 0,
            unAllocTotAmt: detailedPayment.unAllocTotAmt ?? 0,
            unAllocTotLocalAmt: detailedPayment.unAllocTotLocalAmt ?? 0,
            exhGainLoss: detailedPayment.exhGainLoss ?? 0,
            remarks: detailedPayment.remarks ?? "",
            docExhRate: detailedPayment.docExhRate ?? 0,
            docTotAmt: detailedPayment.docTotAmt ?? 0,
            docTotLocalAmt: detailedPayment.docTotLocalAmt ?? 0,
            allocTotAmt: detailedPayment.allocTotAmt ?? 0,
            allocTotLocalAmt: detailedPayment.allocTotLocalAmt ?? 0,
            moduleFrom: detailedPayment.moduleFrom ?? "",
            editVersion: detailedPayment.editVersion ?? 0,
            createBy: detailedPayment.createById?.toString() ?? "",
            createDate: detailedPayment.createDate
              ? format(
                  parseDate(detailedPayment.createDate as string) || new Date(),
                  clientDateFormat
                )
              : "",
            editBy: detailedPayment.editById?.toString() ?? "",
            editDate: detailedPayment.editDate
              ? format(
                  parseDate(detailedPayment.editDate as string) || new Date(),
                  clientDateFormat
                )
              : "",
            cancelBy: detailedPayment.cancelById?.toString() ?? "",
            cancelDate: detailedPayment.cancelDate
              ? format(
                  parseDate(detailedPayment.cancelDate as string) || new Date(),
                  clientDateFormat
                )
              : "",
            cancelRemarks: detailedPayment.cancelRemarks ?? "",

            data_details:
              detailedPayment.data_details?.map((detail: IApDocsetoffDt) => ({
                setoffId: detail.setoffId?.toString() ?? "0",
                setoffNo: detail.setoffNo ?? "",
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

          //setDocsetoff(updatedPayment as ApDocsetoffHdSchemaType)
          setDocsetoff(transformToSchemaType(updatedPayment))
          form.reset(updatedPayment)
          form.trigger()

          // Show success message
          toast.success(`Docsetoff ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(response?.message || "Failed to fetch docsetoff details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching docsetoff details:", error)
      toast.error("Error loading docsetoff. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsLoadingDocsetoff(false)
    }
  }

  // Determine mode and docsetoff ID from URL
  const setoffNo = form.getValues("setoffNo")
  const isEdit = Boolean(setoffNo)

  // Compose title text
  const titleText = isEdit
    ? `Docsetoff (Edit) - ${setoffNo}`
    : "Docsetoff (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading docsetoff form...
          </p>
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
              readOnly={!!docsetoff?.setoffId && docsetoff.setoffId !== "0"}
              disabled={!!docsetoff?.setoffId && docsetoff.setoffId !== "0"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={isLoadingDocsetoffs || isRefetchingPayments}
            >
              {isLoadingDocsetoffs || isRefetchingPayments ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <ListFilter className="mr-1 h-4 w-4" />
              )}
              {isLoadingDocsetoffs || isRefetchingPayments
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
              disabled={!docsetoff || docsetoff.setoffId === "0"}
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
              disabled={!docsetoff || docsetoff.setoffId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !docsetoff ||
                docsetoff.setoffId === "0" ||
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
              handleSavePayment()
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
            refetchPayments()
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
                  Docsetoff List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing payments from the list below. Use
                  search to filter records or create new payments.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingDocsetoffs || isRefetchingPayments || isSelectingPayment ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingPayment
                    ? "Loading docsetoff details..."
                    : "Loading payments..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingPayment
                    ? "Please wait while we fetch the complete docsetoff data"
                    : "Please wait while we fetch the docsetoff list"}
                </p>
              </div>
            </div>
          ) : (
            <DocsetoffTable
              data={paymentsData || []}
              isLoading={false}
              onPaymentSelect={handlePaymentSelect}
              onRefresh={() => refetchPayments()}
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
        onConfirm={handleSavePayment}
        itemName={docsetoff?.setoffNo || "New Docsetoff"}
        operationType={
          docsetoff?.setoffId && docsetoff.setoffId !== "0"
            ? "update"
            : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handlePaymentDelete}
        itemName={docsetoff?.setoffNo}
        title="Delete Docsetoff"
        description="This action cannot be undone. All docsetoff details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handlePaymentSearch(searchNo)}
        code={searchNo}
        typeLabel="Docsetoff"
        showDetails={false}
        description={`Do you want to load Docsetoff ${searchNo}?`}
        isLoading={isLoadingDocsetoff}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handlePaymentReset}
        itemName={docsetoff?.setoffNo}
        title="Reset Docsetoff"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleClonePayment}
        itemName={docsetoff?.setoffNo}
        title="Clone Docsetoff"
        description="This will create a copy as a new docsetoff."
      />
    </div>
  )
}
