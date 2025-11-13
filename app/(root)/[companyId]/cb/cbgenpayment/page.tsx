"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import {
  mathRound,
  setDueDate,
  setExchangeRate,
  setExchangeRateLocal,
} from "@/helpers/account"
import {
  calculateCountryAmounts,
  calculateLocalAmounts,
  calculateTotalAmounts,
  recalculateAllDetailAmounts,
} from "@/helpers/cb-genpayment-calculations"
import {
  ICbGenPaymentDt,
  ICbGenPaymentFilter,
  ICbGenPaymentHd,
} from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchema,
  CbGenPaymentHdSchemaType,
} from "@/schemas"
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
import { BasicSetting, CbGenPayment } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { CBTransactionId, ModuleId } from "@/lib/utils"
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

import { getDefaultValues } from "./components/cbGenPayment-defaultvalues"
import CbGenPaymentTable from "./components/cbGenPayment-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function CbGenPaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbgenpayment

  const { hasPermission } = usePermissionStore()
  const { decimals, user } = useAuthStore()
  const { defaults } = useUserSettingDefaults()
  const pageSize = defaults?.common?.trnGridTotalRecords || 100

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
  const [isLoadingCbGenPayment, setIsLoadingCbGenPayment] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [cbGenPayment, setCbGenPayment] =
    useState<CbGenPaymentHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")
  const [pendingDocNo, setPendingDocNo] = useState("")

  const handleCbGenPaymentSearchRef = useRef<
    ((value: string) => Promise<void> | void) | null
  >(null)

  const documentNoFromQuery = useMemo(() => {
    const value =
      searchParams?.get("docNo") ?? searchParams?.get("documentNo") ?? ""
    return value ? value.trim() : ""
  }, [searchParams])

  const autoLoadStorageKey = useMemo(
    () => `history-doc:/${companyId}/ar/cbGenPayment`,
    [companyId]
  )

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
        const trimmed = stored.trim()
        if (trimmed) {
          setPendingDocNo(trimmed)
          setSearchNo(trimmed)
        }
      }
    }
  }, [autoLoadStorageKey, documentNoFromQuery])

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

  const [filters, setFilters] = useState<ICbGenPaymentFilter>({
    startDate: defaultFilterStartDate,
    endDate: defaultFilterEndDate,
    search: "",
    sortBy: "paymentNo",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: pageSize,
  })

  const defaultCbGenPaymentValues = useMemo(
    () => getDefaultValues(dateFormat).defaultCbGenPayment,
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
  const form = useForm<CbGenPaymentHdSchemaType>({
    resolver: zodResolver(CbGenPaymentHdSchema(required, visible)),
    defaultValues: cbGenPayment
      ? {
          paymentId: cbGenPayment.paymentId?.toString() ?? "0",
          paymentNo: cbGenPayment.paymentNo ?? "",
          referenceNo: cbGenPayment.referenceNo ?? "",
          trnDate: cbGenPayment.trnDate ?? new Date(),
          accountDate: cbGenPayment.accountDate ?? new Date(),
          gstClaimDate: cbGenPayment.gstClaimDate ?? new Date(),
          currencyId: cbGenPayment.currencyId ?? 0,
          exhRate: cbGenPayment.exhRate ?? 0,
          ctyExhRate: cbGenPayment.ctyExhRate ?? 0,
          bankId: cbGenPayment.bankId ?? 0,
          totAmt: cbGenPayment.totAmt ?? 0,
          totLocalAmt: cbGenPayment.totLocalAmt ?? 0,
          totCtyAmt: cbGenPayment.totCtyAmt ?? 0,
          gstAmt: cbGenPayment.gstAmt ?? 0,
          gstLocalAmt: cbGenPayment.gstLocalAmt ?? 0,
          gstCtyAmt: cbGenPayment.gstCtyAmt ?? 0,
          totAmtAftGst: cbGenPayment.totAmtAftGst ?? 0,
          totLocalAmtAftGst: cbGenPayment.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: cbGenPayment.totCtyAmtAftGst ?? 0,
          moduleFrom: cbGenPayment.moduleFrom ?? "",
          paymentTypeId: cbGenPayment.paymentTypeId ?? 0,
          chequeNo: cbGenPayment.chequeNo ?? "",
          chequeDate: cbGenPayment.chequeDate ?? "",
          bankChgGLId: cbGenPayment.bankChgGLId ?? 0,
          bankChgAmt: cbGenPayment.bankChgAmt ?? 0,
          bankChgLocalAmt: cbGenPayment.bankChgLocalAmt ?? 0,
          payeeTo: cbGenPayment.payeeTo ?? "",
          editVersion: cbGenPayment.editVersion ?? 0,
          data_details:
            cbGenPayment.data_details?.map((detail) => ({
              ...detail,
              paymentId: detail.paymentId?.toString() ?? "0",
              paymentNo: detail.paymentNo?.toString() ?? "",
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              remarks: detail.remarks ?? "",
              editVersion: detail.editVersion ?? 0,
            })) || [],
        }
      : (() => {
          // For new cbGenPayment, set createDate with time and createBy
          const currentDateTime = decimals[0]?.longDateFormat
            ? format(new Date(), decimals[0].longDateFormat)
            : format(new Date(), "dd/MM/yyyy HH:mm:ss")
          const userName = user?.userName || ""

          return {
            ...defaultCbGenPaymentValues,
            createBy: userName,
            createDate: currentDateTime,
          }
        })(),
  })

  const previousDateFormatRef = useRef<string>(dateFormat)
  const { isDirty } = form.formState

  useEffect(() => {
    if (previousDateFormatRef.current === dateFormat) return
    previousDateFormatRef.current = dateFormat

    if (isDirty) return

    const currentCbGenPaymentId = form.getValues("paymentId") || "0"
    if (
      (cbGenPayment &&
        cbGenPayment.paymentId &&
        cbGenPayment.paymentId !== "0") ||
      currentCbGenPaymentId !== "0"
    ) {
      return
    }

    const currentDateTime = decimals[0]?.longDateFormat
      ? format(new Date(), decimals[0].longDateFormat)
      : format(new Date(), "dd/MM/yyyy HH:mm:ss")
    const userName = user?.userName || ""

    form.reset({
      ...defaultCbGenPaymentValues,
      createBy: userName,
      createDate: currentDateTime,
      data_details: [],
    })
  }, [
    dateFormat,
    defaultCbGenPaymentValues,
    decimals,
    form,
    cbGenPayment,
    isDirty,
    user,
  ])

  // Mutations
  const saveMutation = usePersist<CbGenPaymentHdSchemaType>(
    `${CbGenPayment.add}`
  )
  const updateMutation = usePersist<CbGenPaymentHdSchemaType>(
    `${CbGenPayment.add}`
  )
  const deleteMutation = useDeleteWithRemarks(`${CbGenPayment.delete}`)

  // Remove the useGetCbGenPaymentById hook for selection
  // const { data: cbGenPaymentByIdData, refetch: refetchCbGenPaymentById } = ...

  // Handle Save
  const handleSaveCbGenPayment = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as ICbGenPaymentHd
      )

      // Validate the form data using the schema
      const validationResult = CbGenPaymentHdSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof CbGenPaymentHdSchemaType
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

      console.log("handleSaveCbGenPayment formValues", formValues)

      // Check GL period closed before saving (supports previous account date)
      try {
        const accountDate = form.getValues("accountDate") as unknown as string
        const isNew = Number(formValues.paymentId) === 0
        const prevAccountDate = isNew ? accountDate : previousAccountDate

        console.log("accountDate", accountDate)
        console.log("prevAccountDate", prevAccountDate)

        const parsedAccountDate = parseWithFallback(
          accountDate as unknown as string | Date | null
        )
        if (!parsedAccountDate) {
          toast.error("Invalid account date")
          return
        }

        const parsedPrevAccountDate = parseWithFallback(
          prevAccountDate as unknown as string | Date | null
        )

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
          Number(formValues.paymentId) === 0
            ? await saveMutation.mutateAsync(formValues)
            : await updateMutation.mutateAsync(formValues)

        if (response.result === 1) {
          const cbGenPaymentData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          // Transform API response back to form values
          if (cbGenPaymentData) {
            const updatedSchemaType = transformToSchemaType(
              cbGenPaymentData as unknown as ICbGenPaymentHd
            )

            setSearchNo(updatedSchemaType.paymentNo || "")
            setCbGenPayment(updatedSchemaType)
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

          // Data refresh handled by CbGenPaymentTable component
        } else {
          toast.error(response.message || "Failed to save cbGenPayment")
        }
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving cbGenPayment")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Clone
  const handleCloneCbGenPayment = async () => {
    if (cbGenPayment) {
      // Create a proper clone with form values
      const currentDate = new Date()
      const dateStr = format(currentDate, dateFormat)

      const clonedCbGenPayment: CbGenPaymentHdSchemaType = {
        ...cbGenPayment,
        paymentId: "0",
        paymentNo: "",
        // Set all dates to current date
        trnDate: dateStr,
        accountDate: dateStr,
        gstClaimDate: dateStr,
        // Clear all audit fields
        createBy: "",
        editBy: "",
        cancelBy: "",
        createDate: "",
        editDate: "",
        cancelDate: "",
        // Keep data details - do not remove
        data_details:
          cbGenPayment.data_details?.map((detail) => ({
            ...detail,
            paymentId: "0",
            paymentNo: "",
            editVersion: 0,
          })) || [],
      }

      // Calculate totals from details with proper rounding
      const amtDec = decimals[0]?.amtDec || 2
      const locAmtDec = decimals[0]?.locAmtDec || 2
      const ctyAmtDec = decimals[0]?.ctyAmtDec || 2

      const details = clonedCbGenPayment.data_details || []
      if (details.length > 0) {
        const totAmt = details.reduce((sum, d) => sum + (d.totAmt || 0), 0)
        const gstAmt = details.reduce((sum, d) => sum + (d.gstAmt || 0), 0)
        const totLocalAmt = details.reduce(
          (sum, d) => sum + (d.totLocalAmt || 0),
          0
        )
        const gstLocalAmt = details.reduce(
          (sum, d) => sum + (d.gstLocalAmt || 0),
          0
        )
        const totCtyAmt = details.reduce(
          (sum, d) => sum + (d.totCtyAmt || 0),
          0
        )
        const gstCtyAmt = details.reduce(
          (sum, d) => sum + (d.gstCtyAmt || 0),
          0
        )

        clonedCbGenPayment.totAmt = mathRound(totAmt, amtDec)
        clonedCbGenPayment.gstAmt = mathRound(gstAmt, amtDec)
        clonedCbGenPayment.totAmtAftGst = mathRound(totAmt + gstAmt, amtDec)
        clonedCbGenPayment.totLocalAmt = mathRound(totLocalAmt, locAmtDec)
        clonedCbGenPayment.gstLocalAmt = mathRound(gstLocalAmt, locAmtDec)
        clonedCbGenPayment.totLocalAmtAftGst = mathRound(
          totLocalAmt + gstLocalAmt,
          locAmtDec
        )
        clonedCbGenPayment.totCtyAmt = mathRound(totCtyAmt, ctyAmtDec)
        clonedCbGenPayment.gstCtyAmt = mathRound(gstCtyAmt, ctyAmtDec)
        clonedCbGenPayment.totCtyAmtAftGst = mathRound(
          totCtyAmt + gstCtyAmt,
          ctyAmtDec
        )
      } else {
        // Reset amounts if no details
        clonedCbGenPayment.totAmt = 0
        clonedCbGenPayment.totLocalAmt = 0
        clonedCbGenPayment.totCtyAmt = 0
        clonedCbGenPayment.gstAmt = 0
        clonedCbGenPayment.gstLocalAmt = 0
        clonedCbGenPayment.gstCtyAmt = 0
        clonedCbGenPayment.totAmtAftGst = 0
        clonedCbGenPayment.totLocalAmtAftGst = 0
        clonedCbGenPayment.totCtyAmtAftGst = 0
      }

      setCbGenPayment(clonedCbGenPayment)
      form.reset(clonedCbGenPayment)

      // Get exchange rate decimal places
      const exhRateDec = decimals[0]?.exhRateDec || 6

      // Fetch and set new exchange rates based on new account date
      if (clonedCbGenPayment.currencyId && clonedCbGenPayment.accountDate) {
        try {
          await setExchangeRate(form, exhRateDec, visible)
          if (visible?.m_CtyCurr) {
            await setExchangeRateLocal(form, exhRateDec)
          }

          // Get updated exchange rates
          const exchangeRate = form.getValues("exhRate") || 0
          const cityExchangeRate = form.getValues("ctyExhRate") || 0

          // Recalculate detail amounts with new exchange rates if details exist
          const formDetails = form.getValues("data_details")
          if (formDetails && formDetails.length > 0) {
            const updatedDetails = recalculateAllDetailAmounts(
              formDetails as unknown as ICbGenPaymentDt[],
              exchangeRate,
              cityExchangeRate,
              decimals[0],
              !!visible?.m_CtyCurr
            )

            // Update form with recalculated details
            form.setValue(
              "data_details",
              updatedDetails as unknown as CbGenPaymentDtSchemaType[],
              { shouldDirty: true, shouldTouch: true }
            )

            // Recalculate header totals from updated details
            const totals = calculateTotalAmounts(
              updatedDetails as unknown as ICbGenPaymentDt[],
              amtDec
            )
            form.setValue("totAmt", totals.totAmt)
            form.setValue("gstAmt", totals.gstAmt)
            form.setValue("totAmtAftGst", totals.totAmtAftGst)

            const localAmounts = calculateLocalAmounts(
              updatedDetails as unknown as ICbGenPaymentDt[],
              locAmtDec
            )
            form.setValue("totLocalAmt", localAmounts.totLocalAmt)
            form.setValue("gstLocalAmt", localAmounts.gstLocalAmt)
            form.setValue("totLocalAmtAftGst", localAmounts.totLocalAmtAftGst)

            if (visible?.m_CtyCurr) {
              const countryAmounts = calculateCountryAmounts(
                updatedDetails as unknown as ICbGenPaymentDt[],
                visible?.m_CtyCurr ? ctyAmtDec : locAmtDec
              )
              form.setValue("totCtyAmt", countryAmounts.totCtyAmt)
              form.setValue("gstCtyAmt", countryAmounts.gstCtyAmt)
              form.setValue("totCtyAmtAftGst", countryAmounts.totCtyAmtAftGst)
            }
          }
        } catch (error) {
          console.error("Error updating exchange rates:", error)
        }
      }

      // Calculate due date based on accountDate and credit terms
      if (clonedCbGenPayment.paymentId && clonedCbGenPayment.accountDate) {
        try {
          await setDueDate(form)
        } catch (error) {
          console.error("Error calculating due date:", error)
        }
      }

      // Clear search input
      setSearchNo("")

      toast.success("CbGenPayment cloned successfully")
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
  const handleCbGenPaymentDelete = async (cancelRemarks: string) => {
    if (!cbGenPayment) return

    try {
      console.log("Cancel remarks:", cancelRemarks)
      console.log("CbGenPayment ID:", cbGenPayment.paymentId)
      console.log("CbGenPayment No:", cbGenPayment.paymentNo)

      const response = await deleteMutation.mutateAsync({
        documentId: cbGenPayment.paymentId?.toString() ?? "",
        documentNo: cbGenPayment.paymentNo ?? "",
        cancelRemarks: cancelRemarks,
      })

      if (response.result === 1) {
        setCbGenPayment(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultCbGenPaymentValues,
          data_details: [],
        })
        toast.success(
          `CbGenPayment ${cbGenPayment.paymentNo} deleted successfully`
        )
        // Data refresh handled by CbGenPaymentTable component
      } else {
        toast.error(response.message || "Failed to delete cbGenPayment")
      }
    } catch {
      toast.error("Network error while deleting cbGenPayment")
    }
  }

  // Handle Reset
  const handleCbGenPaymentReset = () => {
    setCbGenPayment(null)
    setSearchNo("") // Clear search input

    // Get current date/time and user name - always set for reset (new cbGenPayment)
    const currentDateTime = decimals[0]?.longDateFormat
      ? format(new Date(), decimals[0].longDateFormat)
      : format(new Date(), "dd/MM/yyyy HH:mm:ss")
    const userName = user?.userName || ""

    form.reset({
      ...defaultCbGenPaymentValues,
      // Always set createBy and createDate to current user and current date/time on reset
      createBy: userName,
      createDate: currentDateTime,
      data_details: [],
    })
    toast.success("CbGenPayment reset successfully")
  }

  // Helper function to transform ICbGenPaymentHd to CbGenPaymentHdSchemaType
  const transformToSchemaType = (
    apiCbGenPayment: ICbGenPaymentHd
  ): CbGenPaymentHdSchemaType => {
    return {
      paymentId: apiCbGenPayment.paymentId?.toString() ?? "0",
      paymentNo: apiCbGenPayment.paymentNo ?? "",
      referenceNo: apiCbGenPayment.referenceNo ?? "",
      trnDate: apiCbGenPayment.trnDate
        ? format(
            parseDate(apiCbGenPayment.trnDate as string) || new Date(),
            dateFormat
          )
        : dateFormat,
      accountDate: apiCbGenPayment.accountDate
        ? format(
            parseDate(apiCbGenPayment.accountDate as string) || new Date(),
            dateFormat
          )
        : dateFormat,
      gstClaimDate: apiCbGenPayment.gstClaimDate
        ? format(
            parseDate(apiCbGenPayment.gstClaimDate as string) || new Date(),
            dateFormat
          )
        : dateFormat,
      currencyId: apiCbGenPayment.currencyId ?? 0,
      exhRate: apiCbGenPayment.exhRate ?? 0,
      ctyExhRate: apiCbGenPayment.ctyExhRate ?? 0,
      bankId: apiCbGenPayment.bankId ?? 0,
      paymentTypeId: apiCbGenPayment.paymentTypeId ?? 0,
      chequeNo: apiCbGenPayment.chequeNo ?? "",
      chequeDate: apiCbGenPayment.chequeDate ?? "",
      bankChgGLId: apiCbGenPayment.bankChgGLId ?? 0,
      bankChgAmt: apiCbGenPayment.bankChgAmt ?? 0,
      bankChgLocalAmt: apiCbGenPayment.bankChgLocalAmt ?? 0,
      payeeTo: apiCbGenPayment.payeeTo ?? "",
      totAmt: apiCbGenPayment.totAmt ?? 0,
      totLocalAmt: apiCbGenPayment.totLocalAmt ?? 0,
      totCtyAmt: apiCbGenPayment.totCtyAmt ?? 0,
      gstAmt: apiCbGenPayment.gstAmt ?? 0,
      gstLocalAmt: apiCbGenPayment.gstLocalAmt ?? 0,
      gstCtyAmt: apiCbGenPayment.gstCtyAmt ?? 0,
      totAmtAftGst: apiCbGenPayment.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiCbGenPayment.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiCbGenPayment.totCtyAmtAftGst ?? 0,
      remarks: apiCbGenPayment.remarks ?? "",
      moduleFrom: apiCbGenPayment.moduleFrom ?? "",
      editVersion: apiCbGenPayment.editVersion ?? 0,
      createBy: apiCbGenPayment.createBy ?? "",
      editBy: apiCbGenPayment.editBy ?? "",
      cancelBy: apiCbGenPayment.cancelBy ?? "",
      createDate: apiCbGenPayment.createDate
        ? format(
            parseDate(apiCbGenPayment.createDate as string) || new Date(),
            decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
          )
        : "",

      editDate: apiCbGenPayment.editDate
        ? format(
            parseDate(apiCbGenPayment.editDate as unknown as string) ||
              new Date(),
            decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
          )
        : "",
      cancelDate: apiCbGenPayment.cancelDate
        ? format(
            parseDate(apiCbGenPayment.cancelDate as unknown as string) ||
              new Date(),
            decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
          )
        : "",
      isCancel: apiCbGenPayment.isCancel ?? false,
      cancelRemarks: apiCbGenPayment.cancelRemarks ?? "",
      data_details:
        apiCbGenPayment.data_details?.map(
          (detail) =>
            ({
              ...detail,
              paymentId: detail.paymentId?.toString() ?? "0",
              paymentNo: detail.paymentNo ?? "",
              itemNo: detail.itemNo ?? 0,
              seqNo: detail.seqNo ?? 0,
              glId: detail.glId ?? 0,
              glCode: detail.glCode ?? "",
              glName: detail.glName ?? "",
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
              editVersion: detail.editVersion ?? 0,
            }) as unknown as CbGenPaymentDtSchemaType
        ) || [],
    }
  }

  const handleCbGenPaymentSelect = async (
    selectedCbGenPayment: ICbGenPaymentHd | undefined
  ) => {
    if (!selectedCbGenPayment) return

    try {
      // Fetch cbGenPayment details directly using selected cbGenPayment's values
      const response = await getById(
        `${CbGenPayment.getByIdNo}/${selectedCbGenPayment.paymentId}/${selectedCbGenPayment.paymentNo}`
      )

      if (response?.result === 1) {
        const detailedCbGenPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedCbGenPayment) {
          {
            const parsed = parseDate(detailedCbGenPayment.accountDate as string)
            setPreviousAccountDate(
              parsed
                ? format(parsed, dateFormat)
                : (detailedCbGenPayment.accountDate as string)
            )
          }
          // Parse dates properly
          const updatedCbGenPayment = {
            ...detailedCbGenPayment,
            paymentId: detailedCbGenPayment.paymentId?.toString() ?? "0",
            paymentNo: detailedCbGenPayment.paymentNo ?? "",
            referenceNo: detailedCbGenPayment.referenceNo ?? "",
            trnDate: detailedCbGenPayment.trnDate
              ? format(
                  parseDate(detailedCbGenPayment.trnDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,
            accountDate: detailedCbGenPayment.accountDate
              ? format(
                  parseDate(detailedCbGenPayment.accountDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,
            gstClaimDate: detailedCbGenPayment.gstClaimDate
              ? format(
                  parseDate(detailedCbGenPayment.gstClaimDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,

            currencyId: detailedCbGenPayment.currencyId ?? 0,
            exhRate: detailedCbGenPayment.exhRate ?? 0,
            ctyExhRate: detailedCbGenPayment.ctyExhRate ?? 0,
            bankId: detailedCbGenPayment.bankId ?? 0,
            paymentTypeId: detailedCbGenPayment.paymentTypeId ?? 0,
            chequeNo: detailedCbGenPayment.chequeNo ?? "",
            chequeDate: detailedCbGenPayment.chequeDate ?? "",
            bankChgGLId: detailedCbGenPayment.bankChgGLId ?? 0,
            bankChgAmt: detailedCbGenPayment.bankChgAmt ?? 0,
            bankChgLocalAmt: detailedCbGenPayment.bankChgLocalAmt ?? 0,
            payeeTo: detailedCbGenPayment.payeeTo ?? "",
            totAmt: detailedCbGenPayment.totAmt ?? 0,
            totLocalAmt: detailedCbGenPayment.totLocalAmt ?? 0,
            totCtyAmt: detailedCbGenPayment.totCtyAmt ?? 0,
            gstAmt: detailedCbGenPayment.gstAmt ?? 0,
            gstLocalAmt: detailedCbGenPayment.gstLocalAmt ?? 0,
            gstCtyAmt: detailedCbGenPayment.gstCtyAmt ?? 0,
            totAmtAftGst: detailedCbGenPayment.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedCbGenPayment.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedCbGenPayment.totCtyAmtAftGst ?? 0,
            remarks: detailedCbGenPayment.remarks ?? "",
            moduleFrom: detailedCbGenPayment.moduleFrom ?? "",
            editVersion: detailedCbGenPayment.editVersion ?? 0,
            createBy: detailedCbGenPayment.createBy ?? "",
            createDate: detailedCbGenPayment.createDate
              ? format(
                  parseDate(detailedCbGenPayment.createDate as string) ||
                    new Date(),
                  decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
                )
              : "",
            editBy: detailedCbGenPayment.editBy ?? "",
            editDate: detailedCbGenPayment.editDate
              ? format(
                  parseDate(detailedCbGenPayment.editDate as string) ||
                    new Date(),
                  decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
                )
              : "",
            cancelBy: detailedCbGenPayment.cancelBy ?? "",
            cancelDate: detailedCbGenPayment.cancelDate
              ? format(
                  parseDate(detailedCbGenPayment.cancelDate as string) ||
                    new Date(),
                  decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
                )
              : "",
            isCancel: detailedCbGenPayment.isCancel ?? false,
            cancelRemarks: detailedCbGenPayment.cancelRemarks ?? "",
            data_details:
              detailedCbGenPayment.data_details?.map(
                (detail: ICbGenPaymentDt) => ({
                  paymentId: detail.paymentId?.toString() ?? "0",
                  paymentNo: detail.paymentNo ?? "",
                  itemNo: detail.itemNo ?? 0,
                  seqNo: detail.seqNo ?? 0,
                  glId: detail.glId ?? 0,
                  glCode: detail.glCode ?? "",
                  glName: detail.glName ?? "",
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
                  editVersion: detail.editVersion ?? 0,
                })
              ) || [],
          }

          //setCbGenPayment(updatedCbGenPayment as CbGenPaymentHdSchemaType)
          setCbGenPayment(transformToSchemaType(updatedCbGenPayment))
          form.reset(updatedCbGenPayment)
          form.trigger()

          // Set the cbGenPayment number in search input
          setSearchNo(updatedCbGenPayment.paymentNo || "")

          // Close dialog only on success
          setShowListDialog(false)
        }
      } else {
        toast.error(response?.message || "Failed to fetch cbGenPayment details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching cbGenPayment details:", error)
      toast.error("Error loading cbGenPayment. Please try again.")
      // Keep dialog open on error
    } finally {
      // Selection completed
    }
  }

  // Remove direct refetchCbGenPayments from handleFilterChange
  const handleFilterChange = (newFilters: ICbGenPaymentFilter) => {
    setFilters(newFilters)
    // Data refresh handled by CbGenPaymentTable component
  }

  // Data refresh handled by CbGenPaymentTable component

  // Set createBy and createDate for new cbGenPayments on page load/refresh
  useEffect(() => {
    if (!cbGenPayment && user && decimals.length > 0) {
      const currentCbGenPaymentId = form.getValues("paymentId")
      const currentCbGenPaymentNo = form.getValues("paymentNo")
      const isNewCbGenPayment =
        !currentCbGenPaymentId ||
        currentCbGenPaymentId === "0" ||
        !currentCbGenPaymentNo

      if (isNewCbGenPayment) {
        const currentDateTime = decimals[0]?.longDateFormat
          ? format(new Date(), decimals[0].longDateFormat)
          : format(new Date(), "dd/MM/yyyy HH:mm:ss")
        const userName = user?.userName || ""

        form.setValue("createBy", userName)
        form.setValue("createDate", currentDateTime)
      }
    }
  }, [cbGenPayment, user, decimals, form])

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

  const handleCbGenPaymentSearch = async (value: string) => {
    if (!value) return

    setIsLoadingCbGenPayment(true)

    try {
      const response = await getById(`${CbGenPayment.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedCbGenPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedCbGenPayment) {
          {
            const parsed = parseDate(detailedCbGenPayment.accountDate as string)
            setPreviousAccountDate(
              parsed
                ? format(parsed, dateFormat)
                : (detailedCbGenPayment.accountDate as string)
            )
          }
          // Parse dates properly
          const updatedCbGenPayment = {
            ...detailedCbGenPayment,
            paymentId: detailedCbGenPayment.paymentId?.toString() ?? "0",
            paymentNo: detailedCbGenPayment.paymentNo ?? "",
            referenceNo: detailedCbGenPayment.referenceNo ?? "",
            trnDate: detailedCbGenPayment.trnDate
              ? format(
                  parseDate(detailedCbGenPayment.trnDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,
            accountDate: detailedCbGenPayment.accountDate
              ? format(
                  parseDate(detailedCbGenPayment.accountDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,

            gstClaimDate: detailedCbGenPayment.gstClaimDate
              ? format(
                  parseDate(detailedCbGenPayment.gstClaimDate as string) ||
                    new Date(),
                  dateFormat
                )
              : dateFormat,

            currencyId: detailedCbGenPayment.currencyId ?? 0,
            exhRate: detailedCbGenPayment.exhRate ?? 0,
            ctyExhRate: detailedCbGenPayment.ctyExhRate ?? 0,
            bankId: detailedCbGenPayment.bankId ?? 0,
            paymentTypeId: detailedCbGenPayment.paymentTypeId ?? 0,
            chequeNo: detailedCbGenPayment.chequeNo ?? "",
            chequeDate: detailedCbGenPayment.chequeDate ?? "",
            bankChgGLId: detailedCbGenPayment.bankChgGLId ?? 0,
            bankChgAmt: detailedCbGenPayment.bankChgAmt ?? 0,
            bankChgLocalAmt: detailedCbGenPayment.bankChgLocalAmt ?? 0,
            payeeTo: detailedCbGenPayment.payeeTo ?? "",
            totAmt: detailedCbGenPayment.totAmt ?? 0,
            totLocalAmt: detailedCbGenPayment.totLocalAmt ?? 0,
            totCtyAmt: detailedCbGenPayment.totCtyAmt ?? 0,
            gstAmt: detailedCbGenPayment.gstAmt ?? 0,
            gstLocalAmt: detailedCbGenPayment.gstLocalAmt ?? 0,
            gstCtyAmt: detailedCbGenPayment.gstCtyAmt ?? 0,
            totAmtAftGst: detailedCbGenPayment.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedCbGenPayment.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedCbGenPayment.totCtyAmtAftGst ?? 0,
            remarks: detailedCbGenPayment.remarks ?? "",
            moduleFrom: detailedCbGenPayment.moduleFrom ?? "",
            editVersion: detailedCbGenPayment.editVersion ?? 0,
            isCancel: detailedCbGenPayment.isCancel ?? false,
            cancelRemarks: detailedCbGenPayment.cancelRemarks ?? "",

            data_details:
              detailedCbGenPayment.data_details?.map(
                (detail: ICbGenPaymentDt) => ({
                  paymentId: detail.paymentId?.toString() ?? "0",
                  paymentNo: detail.paymentNo ?? "",
                  itemNo: detail.itemNo ?? 0,
                  seqNo: detail.seqNo ?? 0,
                  glId: detail.glId ?? 0,
                  glCode: detail.glCode ?? "",
                  glName: detail.glName ?? "",
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
                  editVersion: detail.editVersion ?? 0,
                })
              ) || [],
          }

          //setCbGenPayment(updatedCbGenPayment as CbGenPaymentHdSchemaType)
          setCbGenPayment(transformToSchemaType(updatedCbGenPayment))
          form.reset(updatedCbGenPayment)
          form.trigger()

          // Set the cbGenPayment number in search input to the actual cbGenPayment number from database
          setSearchNo(updatedCbGenPayment.paymentNo || "")

          // Show success message
          toast.success(
            `CbGenPayment ${updatedCbGenPayment.paymentNo || value} loaded successfully`
          )

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        // Close the load confirmation dialog on success
        setShowLoadConfirm(false)
        toast.error(
          response?.message || "Failed to fetch cbGenPayment details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for cbGenPayment")
    } finally {
      setIsLoadingCbGenPayment(false)
    }
  }

  handleCbGenPaymentSearchRef.current = handleCbGenPaymentSearch

  useEffect(() => {
    const trimmed = pendingDocNo.trim()
    if (!trimmed) return

    const executeSearch = async () => {
      const searchFn = handleCbGenPaymentSearchRef.current
      if (searchFn) {
        await searchFn(trimmed)
      }
    }

    void executeSearch()
    setPendingDocNo("")
  }, [pendingDocNo])

  // Determine mode and cbGenPayment ID from URL
  const paymentNo = form.getValues("paymentNo")
  const isEdit = Boolean(paymentNo)
  const isCancelled = cbGenPayment?.isCancel === true

  // Compose title text
  const titleText = isEdit
    ? `CbGenPayment (Edit)- v[${cbGenPayment?.editVersion}] - ${paymentNo}`
    : "CbGenPayment (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading cbGenPayment form...
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
                {cbGenPayment?.cancelRemarks && (
                  <div className="max-w-xs truncate text-sm text-red-600">
                    {cbGenPayment.cancelRemarks}
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
                  if (cbGenPayment?.paymentNo) {
                    setSearchNo(cbGenPayment.paymentNo)
                    setShowLoadConfirm(true)
                  }
                }}
                disabled={isLoadingCbGenPayment}
                className="h-4 w-4 p-0"
                title="Refresh cbGenPayment data"
              >
                <RefreshCw className="h-2 w-2" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={searchNo}
              onChange={(e) => setSearchNo(e.target.value)}
              onBlur={handleSearchNoBlur}
              onKeyDown={handleSearchNoKeyDown}
              placeholder="Search CbGenPayment No"
              className="h-8 text-sm"
              readOnly={
                !!cbGenPayment?.paymentId && cbGenPayment.paymentId !== "0"
              }
              disabled={
                !!cbGenPayment?.paymentId && cbGenPayment.paymentId !== "0"
              }
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
              disabled={!cbGenPayment || cbGenPayment.paymentId === "0"}
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              //disabled={!cbGenPayment}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={
                !cbGenPayment || cbGenPayment.paymentId === "0" || isCancelled
              }
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
                !cbGenPayment ||
                cbGenPayment.paymentId === "0" ||
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
              handleSaveCbGenPayment()
            }}
            isEdit={isEdit}
            visible={visible}
            required={required}
            companyId={Number(companyId)}
            isCancelled={isCancelled}
          />
        </TabsContent>

        <TabsContent value="other">
          <Other form={form} visible={visible} />
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
              CbGenPayment List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing cbGenPayments from the list below. Use
              search to filter records or create new cbGenPayments.
            </p>
          </div>

          {/* Table Container - Takes remaining space */}
          <div className="flex-1 overflow-auto px-4 py-2">
            <CbGenPaymentTable
              onCbGenPaymentSelect={handleCbGenPaymentSelect}
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
        onConfirm={handleSaveCbGenPayment}
        itemName={cbGenPayment?.paymentNo || "New CbGenPayment"}
        operationType={
          cbGenPayment?.paymentId && cbGenPayment.paymentId !== "0"
            ? "update"
            : "create"
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
        itemName={cbGenPayment?.paymentNo}
        title="Delete CbGenPayment"
        description="Are you sure you want to delete this cbGenPayment? You will be asked to provide a reason."
        isDeleting={false}
      />

      {/* Cancel Confirmation - Second Level */}
      <CancelConfirmation
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirmAction={handleCbGenPaymentDelete}
        itemName={cbGenPayment?.paymentNo}
        title="Cancel CbGenPayment"
        description="Please provide a reason for cancelling this cbGenPayment."
        isCancelling={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleCbGenPaymentSearch(searchNo)}
        code={searchNo}
        typeLabel="CbGenPayment"
        showDetails={false}
        description={`Do you want to load CbGenPayment ${searchNo}?`}
        isLoading={isLoadingCbGenPayment}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleCbGenPaymentReset}
        itemName={cbGenPayment?.paymentNo}
        title="Reset CbGenPayment"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneCbGenPayment}
        itemName={cbGenPayment?.paymentNo}
        title="Clone CbGenPayment"
        description="This will create a copy as a new cbGenPayment."
      />
    </div>
  )
}
