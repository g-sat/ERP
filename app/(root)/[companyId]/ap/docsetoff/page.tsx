"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
  setDueDate,
  setExchangeRate,
  setRecExchangeRate,
} from "@/helpers/account"
import {
  IApDocSetOffDt,
  IApDocSetOffFilter,
  IApDocSetOffHd,
} from "@/interfaces/ap-docsetoff"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApDocSetOffDtSchemaType,
  ApDocSetOffHdSchema,
  ApDocSetOffHdSchemaType,
} from "@/schemas/ap-docsetoff"
import { useAuthStore } from "@/stores/auth-store"
import { usePermissionStore } from "@/stores/permission-store"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  format,
  isValid,
  lastDayOfMonth,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns"
import {
  Copy,
  ListFilter,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getById } from "@/lib/api-client"
import { ApDocSetOff, BasicSetting } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { APTransactionId, ModuleId } from "@/lib/utils"
import { useDeleteWithRemarks, usePersist } from "@/hooks/use-common"
import { useGetRequiredFields, useGetVisibleFields } from "@/hooks/use-lookup"
import { useUserSettingDefaults } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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

import { getDefaultValues } from "./components/docSetOff-defaultvalues"
import DocSetOffTable from "./components/docSetOff-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function DocSetOffPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.docsetoff

  const { hasPermission } = usePermissionStore()
  const { decimals, user } = useAuthStore()
  const { defaults } = useUserSettingDefaults()
  const pageSize = defaults?.common?.trnGridTotalRecords || 100

  const dateFormat = useMemo(
    () => decimals[0]?.dateFormat || clientDateFormat,
    [decimals]
  )

  const documentNoFromQuery = useMemo(() => {
    const value =
      searchParams.get("docNo") ?? searchParams.get("documentNo") ?? ""
    return value ? value.trim() : ""
  }, [searchParams])

  const autoLoadStorageKey = useMemo(
    () => `history-doc:/${companyId}/ap/docSetOff`,
    [companyId]
  )

  const [pendingDocNo, setPendingDocNo] = useState<string>("")

  useEffect(() => {
    if (documentNoFromQuery) {
      setPendingDocNo(documentNoFromQuery)
      setSearchNo(documentNoFromQuery)
      return
    }

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(autoLoadStorageKey)
      if (stored) {
        window.localStorage.removeItem(autoLoadStorageKey)
        setPendingDocNo(stored)
        setSearchNo(stored)
      }
    }
  }, [autoLoadStorageKey, documentNoFromQuery])

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

      const fallback = parseDate(value)
      return fallback ?? null
    },
    [dateFormat]
  )

  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const _canPost = hasPermission(moduleId, transactionId, "isPost")

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [docSetOff, setReceipt] = useState<ApDocSetOffHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  // Track previous account date to send as PrevAccountDate to API
  const [previousAccountDate, setPreviousAccountDate] = useState<string>("")

  const today = useMemo(() => new Date(), [])
  const defaultFilterStartDate = useMemo(
    () => format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd"),
    [today]
  )
  const defaultFilterEndDate = useMemo(
    () => format(lastDayOfMonth(today), "yyyy-MM-dd"),
    [today]
  )

  const [filters, setFilters] = useState<IApDocSetOffFilter>({
    startDate: defaultFilterStartDate,
    endDate: defaultFilterEndDate,
    search: "",
    sortBy: "setoffNo",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: pageSize,
  })

  const { defaultDocSetOff: defaultDocSetOffValues } = useMemo(
    () => getDefaultValues(dateFormat),
    [dateFormat]
  )

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
  const form = useForm<ApDocSetOffHdSchemaType>({
    resolver: zodResolver(ApDocSetOffHdSchema(required, visible)),
    defaultValues: docSetOff
      ? {
          setoffId: docSetOff.setoffId?.toString() ?? "0",
          setoffNo: docSetOff.setoffNo ?? "",
          referenceNo: docSetOff.referenceNo ?? "",
          trnDate: docSetOff.trnDate ?? new Date(),
          accountDate: docSetOff.accountDate ?? new Date(),

          supplierId: docSetOff.supplierId ?? 0,
          currencyId: docSetOff.currencyId ?? 0,
          exhRate: docSetOff.exhRate ?? 0,

          unAllocTotAmt: docSetOff.unAllocTotAmt ?? 0,
          allocTotAmt: docSetOff.allocTotAmt ?? 0,
          balTotAmt: docSetOff.balTotAmt ?? 0,
          exhGainLoss: docSetOff.exhGainLoss ?? 0,
          remarks: docSetOff.remarks ?? "",

          moduleFrom: docSetOff.moduleFrom ?? "",
          editVersion: docSetOff.editVersion ?? 0,
          data_details:
            docSetOff.data_details?.map((detail) => ({
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
      : (() => {
          // For new docSetOff, set createDate with time and createBy
          const currentDateTime = decimals[0]?.longDateFormat
            ? format(new Date(), decimals[0].longDateFormat)
            : format(new Date(), "dd/MM/yyyy HH:mm:ss")
          const userName = user?.userName || ""

          return {
            ...defaultDocSetOffValues,
            createBy: userName,
            createDate: currentDateTime,
            data_details: [],
          }
        })(),
  })

  // Data fetching moved to ReceiptTable component for better performance

  const previousDateFormatRef = useRef<string>(dateFormat)
  const lastQueriedDocRef = useRef<string | null>(null)
  const { isDirty } = form.formState

  useEffect(() => {
    if (previousDateFormatRef.current === dateFormat) return
    previousDateFormatRef.current = dateFormat

    if (isDirty) return

    const currentReceiptId = form.getValues("setoffId") || "0"
    if (
      (docSetOff && docSetOff.setoffId && docSetOff.setoffId !== "0") ||
      currentReceiptId !== "0"
    ) {
      return
    }

    const currentDateTime = decimals[0]?.longDateFormat
      ? format(new Date(), decimals[0].longDateFormat)
      : format(new Date(), "dd/MM/yyyy HH:mm:ss")
    const userName = user?.userName || ""

    form.reset({
      ...defaultDocSetOffValues,
      createBy: userName,
      createDate: currentDateTime,
      data_details: [],
    })
  }, [
    dateFormat,
    defaultDocSetOffValues,
    decimals,
    form,
    docSetOff,
    isDirty,
    user,
  ])

  // Mutations
  const saveMutation = usePersist<ApDocSetOffHdSchemaType>(`${ApDocSetOff.add}`)
  const updateMutation = usePersist<ApDocSetOffHdSchemaType>(
    `${ApDocSetOff.add}`
  )
  const deleteMutation = useDeleteWithRemarks(`${ApDocSetOff.delete}`)

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
        form.getValues() as unknown as IApDocSetOffHd
      )

      console.log("formValues", formValues)

      // Validate the form data using the schema
      const validationResult = ApDocSetOffHdSchema(required, visible).safeParse(
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

      console.log("formValues.allocTotAmt", formValues.allocTotAmt)
      console.log("formValues.balTotAmt", formValues.balTotAmt)
      console.log("formValues", formValues)

      //check totamt and totlocalamt should be zero
      if (formValues.allocTotAmt === 0 || formValues.balTotAmt === 0) {
        toast.error("Total Amount and Total Local Amount should not be zero")
        return
      }

      if (formValues.data_details?.length === 0) {
        toast.error("Data details should not be empty")
        return
      }

      try {
        const accountDate = form.getValues("accountDate") as unknown as string
        const isNew = Number(formValues.setoffId) === 0
        const prevAccountDate = isNew ? accountDate : previousAccountDate

        console.log("accountDate", accountDate)
        console.log("prevAccountDate", prevAccountDate)

        const parsedAccountDate = parseWithFallback(accountDate)
        if (!parsedAccountDate) {
          toast.error("Invalid account date")
          return
        }

        const parsedPrevAccountDate = parseWithFallback(prevAccountDate)

        const acc = format(parsedAccountDate, "yyyy-MM-dd")
        const prev = parsedPrevAccountDate
          ? format(parsedPrevAccountDate, "yyyy-MM-dd")
          : ""

        const glCheck = await getById(
          `${BasicSetting.getCheckPeriodClosedByAccountDate}/${moduleId}/${acc}/${prev}`
        )

        if (glCheck?.result === 1) {
          toast.error("GL Period is closed for this date")
          return
        }
      } catch (_e) {
        // If the check fails to reach API, block save as safe default
        toast.error("Failed to validate GL Period. Please try again.")
        return
      }
      {
        const response =
          Number(formValues.setoffId) === 0
            ? await saveMutation.mutateAsync(formValues)
            : await updateMutation.mutateAsync(formValues)

        if (response.result === 1) {
          const receiptData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          // Transform API response back to form values
          if (receiptData) {
            const updatedSchemaType = transformToSchemaType(
              receiptData as unknown as IApDocSetOffHd
            )
            setSearchNo(updatedSchemaType.setoffNo || "")
            setReceipt(updatedSchemaType)
            const parsed = parseDate(updatedSchemaType.accountDate as string)
            setPreviousAccountDate(
              parsed
                ? format(parsed, dateFormat)
                : (updatedSchemaType.accountDate as string)
            )
            form.reset(updatedSchemaType)
            form.trigger()
          }

          // Close the save confirmation dialog
          setShowSaveConfirm(false)

          // Data refresh handled by ReceiptTable component
        } else {
          toast.error(response.message || "Failed to save docSetOff")
        }
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving docSetOff")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Clone
  const handleCloneReceipt = async () => {
    if (docSetOff) {
      // Create a proper clone with form values
      const currentDate = new Date()
      const dateStr = format(currentDate, dateFormat)

      const clonedReceipt: ApDocSetOffHdSchemaType = {
        ...docSetOff,
        setoffId: "0",
        setoffNo: "",
        // Set all dates to current date
        trnDate: dateStr,
        accountDate: dateStr,

        // Clear all audit fields
        createBy: "",
        editBy: "",
        cancelBy: "",
        createDate: "",
        editDate: "",
        cancelDate: "",
        // Clear all amounts for new docSetOff
        unAllocTotAmt: 0,
        allocTotAmt: 0,
        balTotAmt: 0,
        exhGainLoss: 0,

        // Clear data details - remove all records
        data_details: [],
      }

      setReceipt(clonedReceipt)
      form.reset(clonedReceipt)
      form.trigger("accountDate")

      // Get exchange rate decimal places
      const exhRateDec = decimals[0]?.exhRateDec || 6

      // Fetch and set new exchange rates based on new account date
      if (clonedReceipt.currencyId && clonedReceipt.accountDate) {
        try {
          // Wait a tick to ensure form state is updated before calling setExchangeRate
          await new Promise((resolve) => setTimeout(resolve, 0))

          await setExchangeRate(form, exhRateDec, visible)
          await setRecExchangeRate(form, exhRateDec)

          // Calculate and set due date (for detail records)
          await setDueDate(form)
        } catch (error) {
          console.error("Error updating exchange rates:", error)
        }
      }

      // Clear search input
      setSearchNo("")

      toast.success("DocSetOff cloned successfully")
    }
  }

  // Handle Delete - First Level: Confirmation
  const handleDeleteConfirmation = () => {
    // Close delete confirmation and open cancel confirmation
    setShowDeleteConfirm(false)
    setShowCancelConfirm(true)
  }

  // Handle Delete - Second Level: With Cancel Remarks
  const handleReceiptDelete = async (cancelRemarks: string) => {
    if (!docSetOff) return

    try {
      const response = await deleteMutation.mutateAsync({
        documentId: docSetOff.setoffId?.toString() ?? "",
        documentNo: docSetOff.setoffNo ?? "",
        cancelRemarks: cancelRemarks,
      })

      if (response.result === 1) {
        setReceipt(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultDocSetOffValues,
          data_details: [],
        })
        toast.success(`DocSetOff ${docSetOff.setoffNo} deleted successfully`)
        // Data refresh handled by ReceiptTable component
      } else {
        toast.error(response.message || "Failed to delete docSetOff")
      }
    } catch {
      toast.error("Network error while deleting docSetOff")
    }
  }

  // Handle Reset
  const handleReceiptReset = () => {
    setReceipt(null)
    setSearchNo("") // Clear search input

    // Get current date/time and user name - always set for reset (new docSetOff)
    const currentDateTime = decimals[0]?.longDateFormat
      ? format(new Date(), decimals[0].longDateFormat)
      : format(new Date(), "dd/MM/yyyy HH:mm:ss")
    const userName = user?.userName || ""

    form.reset({
      ...defaultDocSetOffValues,
      // Always set createBy and createDate to current user and current date/time on reset
      createBy: userName,
      createDate: currentDateTime,
      data_details: [],
    })
    toast.success("DocSetOff reset successfully")
  }

  // Helper function to transform IApDocSetOffHd to ApDocSetOffHdSchemaType
  const transformToSchemaType = useCallback(
    (apiReceipt: IApDocSetOffHd): ApDocSetOffHdSchemaType => {
      return {
        setoffId: apiReceipt.setoffId?.toString() ?? "0",
        setoffNo: apiReceipt.setoffNo ?? "",
        referenceNo: apiReceipt.referenceNo ?? "",
        trnDate: apiReceipt.trnDate
          ? format(
              parseDate(apiReceipt.trnDate as string) || new Date(),
              dateFormat
            )
          : dateFormat,
        accountDate: apiReceipt.accountDate
          ? format(
              parseDate(apiReceipt.accountDate as string) || new Date(),
              dateFormat
            )
          : dateFormat,

        supplierId: apiReceipt.supplierId ?? 0,
        currencyId: apiReceipt.currencyId ?? 0,
        exhRate: apiReceipt.exhRate ?? 0,
        unAllocTotAmt: apiReceipt.unAllocTotAmt ?? 0,
        allocTotAmt: apiReceipt.allocTotAmt ?? 0,
        balTotAmt: apiReceipt.balTotAmt ?? 0,
        exhGainLoss: apiReceipt.exhGainLoss ?? 0,
        remarks: apiReceipt.remarks ?? "",

        moduleFrom: apiReceipt.moduleFrom ?? "",
        editVersion: apiReceipt.editVersion ?? 0,
        createBy: apiReceipt.createById?.toString() ?? "",
        editBy: apiReceipt.editById?.toString() ?? "",
        cancelBy: apiReceipt.cancelById?.toString() ?? "",
        isCancel: apiReceipt.isCancel ?? false,
        createDate: apiReceipt.createDate
          ? format(
              parseDate(apiReceipt.createDate as string) || new Date(),
              decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
            )
          : "",
        editDate: apiReceipt.editDate
          ? format(
              parseDate(apiReceipt.editDate as unknown as string) || new Date(),
              decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
            )
          : "",
        cancelDate: apiReceipt.cancelDate
          ? format(
              parseDate(apiReceipt.cancelDate as unknown as string) ||
                new Date(),
              decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
            )
          : "",
        cancelRemarks: apiReceipt.cancelRemarks ?? "",
        data_details:
          apiReceipt.data_details?.map(
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
                      dateFormat
                    )
                  : "",
                docDueDate: detail.docDueDate
                  ? format(
                      parseDate(detail.docDueDate as string) || new Date(),
                      dateFormat
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
              }) as unknown as ApDocSetOffDtSchemaType
          ) || [],
      }
    },
    [dateFormat, decimals]
  )

  const handleDocSetOffSelect = async (
    selectedDocSetOff: IApDocSetOffHd | undefined
  ) => {
    if (!selectedDocSetOff) return

    try {
      // Fetch docSetOff details directly using selected docSetOff's values
      const response = await getById(
        `${ApDocSetOff.getByIdNo}/${selectedDocSetOff.setoffId}/${selectedDocSetOff.setoffNo}`
      )

      if (response?.result === 1) {
        const detailedReceipt = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedReceipt) {
          {
            const parsed = parseDate(detailedReceipt.accountDate as string)
            setPreviousAccountDate(
              parsed
                ? format(parsed, dateFormat)
                : (detailedReceipt.accountDate as string)
            )
          }

          // Parse dates properly
          const updatedReceipt = {
            ...detailedReceipt,
            setoffId: detailedReceipt.setoffId?.toString() ?? "0",
            setoffNo: detailedReceipt.setoffNo ?? "",
            referenceNo: detailedReceipt.referenceNo ?? "",
            trnDate: detailedReceipt.trnDate
              ? format(
                  parseDate(detailedReceipt.trnDate as string) || new Date(),
                  dateFormat
                )
              : dateFormat,
            accountDate: detailedReceipt.accountDate
              ? format(
                  parseDate(detailedReceipt.accountDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,

            supplierId: detailedReceipt.supplierId ?? 0,
            currencyId: detailedReceipt.currencyId ?? 0,
            exhRate: detailedReceipt.exhRate ?? 0,
            bankId: detailedReceipt.bankId ?? 0,
            totAmt: detailedReceipt.totAmt ?? 0,
            totLocalAmt: detailedReceipt.totLocalAmt ?? 0,
            payTotAmt: detailedReceipt.payTotAmt ?? 0,
            payTotLocalAmt: detailedReceipt.payTotLocalAmt ?? 0,
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
              detailedReceipt.data_details?.map((detail: IApDocSetOffDt) => ({
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
                      dateFormat
                    )
                  : "",
                docDueDate: detail.docDueDate
                  ? format(
                      parseDate(detail.docDueDate as string) || new Date(),
                      dateFormat
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

          //setReceipt(updatedReceipt as ApDocSetOffHdSchemaType)
          setReceipt(transformToSchemaType(updatedReceipt))
          form.reset(updatedReceipt)
          form.trigger()

          // Set the docSetOff number in search input
          setSearchNo(updatedReceipt.setoffNo || "")

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `DocSetOff ${updatedReceipt.setoffNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch docSetOff details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching docSetOff details:", error)
      toast.error("Error loading docSetOff. Please try again.")
      // Keep dialog open on error
    } finally {
      // Selection completed
    }
  }

  // Remove direct refetchReceipts from handleFilterChange
  const handleFilterChange = (newFilters: IApDocSetOffFilter) => {
    setFilters(newFilters)
    // refetchReceipts(); // Removed: will be handled by useEffect
  }

  // Set createBy and createDate for new receipts on page load/refresh
  useEffect(() => {
    if (!docSetOff && user && decimals.length > 0) {
      const currentReceiptId = form.getValues("setoffId")
      const currentReceiptNo = form.getValues("setoffNo")
      const isNewReceipt =
        !currentReceiptId || currentReceiptId === "0" || !currentReceiptNo

      if (isNewReceipt) {
        const currentDateTime = decimals[0]?.longDateFormat
          ? format(new Date(), decimals[0].longDateFormat)
          : format(new Date(), "dd/MM/yyyy HH:mm:ss")
        const userName = user?.userName || ""

        form.setValue("createBy", userName)
        form.setValue("createDate", currentDateTime)
      }
    }
  }, [docSetOff, user, decimals, form])

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

  // Clear form errors when tab changes
  useEffect(() => {
    form.clearErrors()
  }, [activeTab, form])

  const handleReceiptSearch = useCallback(
    async (value: string) => {
      if (!value) return

      setIsLoadingReceipt(true)

      try {
        const response = await getById(`${ApDocSetOff.getByIdNo}/0/${value}`)

        if (response?.result === 1) {
          const detailedReceipt = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (detailedReceipt) {
            {
              const parsed = parseDate(detailedReceipt.accountDate as string)
              setPreviousAccountDate(
                parsed
                  ? format(parsed, dateFormat)
                  : (detailedReceipt.accountDate as string)
              )
            }
            // Parse dates properly
            const updatedReceipt = {
              ...detailedReceipt,
              setoffId: detailedReceipt.setoffId?.toString() ?? "0",
              setoffNo: detailedReceipt.setoffNo ?? "",
              referenceNo: detailedReceipt.referenceNo ?? "",
              suppInvoiceNo: "", // Required by schema but not in interface
              trnDate: detailedReceipt.trnDate
                ? format(
                    parseDate(detailedReceipt.trnDate as string) || new Date(),
                    dateFormat
                  )
                : dateFormat,
              accountDate: detailedReceipt.accountDate
                ? format(
                    parseDate(detailedReceipt.accountDate as string) ||
                      new Date(),
                    dateFormat
                  )
                : dateFormat,

              supplierId: detailedReceipt.supplierId ?? 0,
              currencyId: detailedReceipt.currencyId ?? 0,
              exhRate: detailedReceipt.exhRate ?? 0,

              unAllocTotAmt: detailedReceipt.unAllocTotAmt ?? 0,
              unAllocTotLocalAmt: detailedReceipt.unAllocTotLocalAmt ?? 0,
              exhGainLoss: detailedReceipt.exhGainLoss ?? 0,
              remarks: detailedReceipt.remarks ?? "",

              allocTotAmt: detailedReceipt.allocTotAmt ?? 0,
              allocTotLocalAmt: detailedReceipt.allocTotLocalAmt ?? 0,
              balTotAmt: detailedReceipt.balTotAmt ?? 0,
              balLocalAmt: detailedReceipt.balLocalAmt ?? 0,

              moduleFrom: detailedReceipt.moduleFrom ?? "",
              editVersion: detailedReceipt.editVersion ?? 0,
              createBy: detailedReceipt.createById?.toString() ?? "",
              createDate: detailedReceipt.createDate
                ? format(
                    parseDate(detailedReceipt.createDate as string) ||
                      new Date(),
                    decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
                  )
                : "",
              editBy: detailedReceipt.editById?.toString() ?? "",
              editDate: detailedReceipt.editDate
                ? format(
                    parseDate(detailedReceipt.editDate as string) || new Date(),
                    decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
                  )
                : "",
              isCancel: detailedReceipt.isCancel ?? false,
              cancelBy: detailedReceipt.cancelById?.toString() ?? "",
              cancelDate: detailedReceipt.cancelDate
                ? format(
                    parseDate(detailedReceipt.cancelDate as string) ||
                      new Date(),
                    decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
                  )
                : "",
              cancelRemarks: detailedReceipt.cancelRemarks ?? "",

              data_details:
                detailedReceipt.data_details?.map((detail: IApDocSetOffDt) => ({
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
                        parseDate(detail.docAccountDate as string) ||
                          new Date(),
                        dateFormat
                      )
                    : "",
                  docDueDate: detail.docDueDate
                    ? format(
                        parseDate(detail.docDueDate as string) || new Date(),
                        dateFormat
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

            //setReceipt(updatedReceipt as ApDocSetOffHdSchemaType)
            setReceipt(transformToSchemaType(updatedReceipt))
            form.reset(updatedReceipt)
            form.trigger()

            // Set the docSetOff number in search input to the actual docSetOff number from database
            setSearchNo(updatedReceipt.setoffNo || "")

            // Show success message
            toast.success(
              `DocSetOff ${updatedReceipt.setoffNo || value} loaded successfully`
            )

            // Close the load confirmation dialog on success
            setShowLoadConfirm(false)
          }
        } else {
          toast.error(response?.message || "Failed to fetch docSetOff details")
          // Keep dialog open on failure so user can try again
        }
      } catch (error) {
        console.error("Error fetching docSetOff details:", error)
        toast.error("Error loading docSetOff. Please try again.")
        // Keep dialog open on error
      } finally {
        setIsLoadingReceipt(false)
      }
    },
    [
      dateFormat,
      decimals,
      form,
      setIsLoadingReceipt,
      setPreviousAccountDate,
      setReceipt,
      setShowLoadConfirm,
      transformToSchemaType,
    ]
  )

  useEffect(() => {
    if (!pendingDocNo) return
    if (lastQueriedDocRef.current === pendingDocNo) return

    lastQueriedDocRef.current = pendingDocNo
    setSearchNo(pendingDocNo)
    void handleReceiptSearch(pendingDocNo)
  }, [handleReceiptSearch, pendingDocNo])

  // Determine mode and docSetOff ID from URL
  const setoffNo = form.getValues("setoffNo")
  const isEdit = Boolean(setoffNo)
  const isCancelled = docSetOff?.isCancel === true

  // Compose title text
  const titleText = isEdit
    ? `DocSetOff (Edit)- v[${docSetOff?.editVersion}] - ${setoffNo}`
    : "DocSetOff (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading docSetOff form...
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
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Cancel Remarks Badge - Only show when cancelled */}
            {isCancelled && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  <span className="mr-1 h-2 w-2 rounded-full bg-red-400"></span>
                  Cancelled
                </span>
                {docSetOff?.cancelRemarks && (
                  <div className="max-w-xs truncate text-sm text-red-600">
                    {docSetOff.cancelRemarks}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
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
            {isEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (docSetOff?.setoffNo) {
                    setSearchNo(docSetOff.setoffNo)
                    setShowLoadConfirm(true)
                  }
                }}
                disabled={isLoadingReceipt}
                className="h-4 w-4 p-0"
                title="Refresh docSetOff data"
              >
                <RefreshCw className="h-2 w-2" />
              </Button>
            )}
          </div>

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
              placeholder="Search DocSetOff No"
              className="h-8 text-sm"
              readOnly={!!docSetOff?.setoffId && docSetOff.setoffId !== "0"}
              disabled={!!docSetOff?.setoffId && docSetOff.setoffId !== "0"}
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
              disabled={!docSetOff || docSetOff.setoffId === "0"}
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
              disabled={!docSetOff || docSetOff.setoffId === "0" || isCancelled}
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
                !docSetOff ||
                docSetOff.setoffId === "0" ||
                deleteMutation.isPending ||
                isCancelled ||
                !canDelete
              }
            >
              {deleteMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Trash2 className="mr-1 h-4 w-4" />
              )}
              {deleteMutation.isPending ? "Cancelling..." : "Cancel"}
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
        }}
      >
        <DialogContent
          className="@container flex h-auto w-[80vw] !max-w-none flex-col gap-0 overflow-hidden rounded-lg p-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="bg-background flex flex-col gap-1 border-b p-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              DocSetOff List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing receipts from the list below. Use
              search to filter records or create new receipts.
            </p>
          </div>

          {/* Table Container - Takes remaining space */}
          <div className="flex-1 overflow-auto px-4 py-2">
            <DocSetOffTable
              onDocSetOffSelect={handleDocSetOffSelect}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
              pageSize={pageSize || 50}
              onClose={() => setShowListDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation */}
      <SaveConfirmation
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={handleSaveReceipt}
        itemName={docSetOff?.setoffNo || "New DocSetOff"}
        operationType={
          docSetOff?.setoffId && docSetOff.setoffId !== "0"
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
        onConfirm={() => handleDeleteConfirmation()}
        itemName={docSetOff?.setoffNo}
        title="Delete DocSetOff"
        description="This action cannot be undone. All docSetOff details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Cancel Confirmation */}
      <CancelConfirmation
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirmAction={handleReceiptDelete}
        itemName={docSetOff?.setoffNo}
        title="Cancel DocSetOff"
        description="Please provide a reason for cancelling this docSetOff."
        isCancelling={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleReceiptSearch(searchNo)}
        code={searchNo}
        typeLabel="DocSetOff"
        showDetails={false}
        description={`Do you want to load DocSetOff ${searchNo}?`}
        isLoading={isLoadingReceipt}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleReceiptReset}
        itemName={docSetOff?.setoffNo}
        title="Reset DocSetOff"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneReceipt}
        itemName={docSetOff?.setoffNo}
        title="Clone DocSetOff"
        description="This will create a copy as a new docSetOff."
      />
    </div>
  )
}
