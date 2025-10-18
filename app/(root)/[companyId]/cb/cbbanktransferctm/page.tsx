"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { calculateAdditionAmount, mathRound } from "@/helpers/account"
import { ICbBankTransferCtmFilter, ICbBankTransferCtmHd } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBankTransferCtmHdSchema,
  CbBankTransferCtmHdSchemaType,
} from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { add, format, subMonths } from "date-fns"
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
import { CbBankTransferCtm } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { CBTransactionId, ModuleId, TableName } from "@/lib/utils"
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

import { defaultBankTransferCtmHd } from "./components/cbbanktransferctm-defaultvalues"
import BankTransferCtmTable from "./components/cbbanktransferctm-table"
import History from "./components/history"
import Main from "./components/main-tab"

export default function BankTransferCtmPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbbanktransferctm

  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingBankTransferCtm, setIsLoadingBankTransferCtm] =
    useState(false)
  const [isSelectingBankTransferCtm, setIsSelectingBankTransferCtm] =
    useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bankTransferCtm, setBankTransferCtm] =
    useState<CbBankTransferCtmHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbBankTransferCtmFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "transferNo",
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
  const form = useForm<CbBankTransferCtmHdSchemaType>({
    resolver: zodResolver(CbBankTransferCtmHdSchema(required, visible)),
    defaultValues: bankTransferCtm
      ? {
          transferId: bankTransferCtm.transferId?.toString() ?? "0",
          transferNo: bankTransferCtm.transferNo ?? "",
          referenceNo: bankTransferCtm.referenceNo ?? "",
          trnDate: bankTransferCtm.trnDate ?? new Date(),
          accountDate: bankTransferCtm.accountDate ?? new Date(),
          paymentTypeId: bankTransferCtm.paymentTypeId ?? 0,
          chequeNo: bankTransferCtm.chequeNo ?? "",
          chequeDate: bankTransferCtm.chequeDate ?? "",
          fromBankId: bankTransferCtm.fromBankId ?? 0,
          fromCurrencyId: bankTransferCtm.fromCurrencyId ?? 0,
          fromExhRate: bankTransferCtm.fromExhRate ?? 0,
          fromBankChgGLId: bankTransferCtm.fromBankChgGLId ?? 0,
          fromBankChgAmt: bankTransferCtm.fromBankChgAmt ?? 0,
          fromBankChgLocalAmt: bankTransferCtm.fromBankChgLocalAmt ?? 0,
          fromTotAmt: bankTransferCtm.fromTotAmt ?? 0,
          fromTotLocalAmt: bankTransferCtm.fromTotLocalAmt ?? 0,
          exhGainLoss: bankTransferCtm.exhGainLoss ?? 0,
          remarks: bankTransferCtm.remarks ?? "",
          payeeTo: bankTransferCtm.payeeTo ?? "",
          moduleFrom: bankTransferCtm.moduleFrom ?? "",
          editVersion: bankTransferCtm.editVersion ?? 0,
          isCancel: bankTransferCtm.isCancel ?? false,
          cancelBy: bankTransferCtm.cancelBy ?? "",
          cancelDate: bankTransferCtm.cancelDate ?? null,
          cancelRemarks: bankTransferCtm.cancelRemarks ?? null,
          isPost: bankTransferCtm.isPost ?? false,
          postBy: bankTransferCtm.postBy ?? "",
          postDate: bankTransferCtm.postDate ?? null,
          appStatusId: bankTransferCtm.appStatusId ?? null,
          appBy: bankTransferCtm.appBy ?? "",
          appDate: bankTransferCtm.appDate ?? null,
          data_details: bankTransferCtm.data_details ?? [],
        }
      : {
          ...defaultBankTransferCtmHd,
        },
  })

  // API hooks for bank transfers - Only fetch when List dialog is opened (optimized)
  const {
    data: bankTransfersResponse,
    refetch: refetchBankTransferCtms,
    isLoading: isLoadingBankTransferCtms,
    isRefetching: isRefetchingBankTransferCtms,
  } = useGetWithDates<ICbBankTransferCtmHd>(
    `${CbBankTransferCtm.get}`,
    TableName.cbBankTransferCtm,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize Bank Transfer CTM data to prevent unnecessary re-renders
  const bankTransfersData = useMemo(
    () =>
      (bankTransfersResponse as ApiResponse<ICbBankTransferCtmHd>)?.data ?? [],
    [bankTransfersResponse]
  )

  // Mutations
  const saveMutation = usePersist<CbBankTransferCtmHdSchemaType>(
    `${CbBankTransferCtm.add}`
  )
  const updateMutation = usePersist<CbBankTransferCtmHdSchemaType>(
    `${CbBankTransferCtm.add}`
  )
  const deleteMutation = useDelete(`${CbBankTransferCtm.delete}`)

  // Handle Save
  const handleSaveBankTransferCtm = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as ICbBankTransferCtmHd
      )

      // Set chequeDate to accountDate if it's empty
      if (!formValues.chequeDate || formValues.chequeDate === "") {
        formValues.chequeDate = formValues.accountDate
      }

      // Validate the form data using the schema
      const validationResult = CbBankTransferCtmHdSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)
        toast.error("Please check form data and try again")
        return
      }

      // Check if there are detail items
      if (!formValues.data_details || formValues.data_details.length === 0) {
        toast.warning("Please add at least one transfer detail")
        return
      }

      // Check header from total amounts should not be zero
      if (formValues.fromTotAmt === 0 || formValues.fromTotLocalAmt === 0) {
        toast.warning(
          "From Total Amount and From Total Local Amount should not be zero"
        )
        return
      }

      // Validate: fromTotLocalAmt should match sum of details (toTotLocalAmt + toBankChgLocalAmt)
      const sumOfDetailsLocalAmt = formValues.data_details.reduce(
        (sum, detail) => {
          const toTotLocalAmt = Number(detail.toTotLocalAmt) || 0
          const toBankChgLocalAmt = Number(detail.toBankChgLocalAmt) || 0
          console.log("toTotLocalAmt :", toTotLocalAmt)
          console.log("toBankChgLocalAmt :", toBankChgLocalAmt)
          // Use helper to add amounts with proper precision
          const detailTotal = calculateAdditionAmount(
            toTotLocalAmt,
            toBankChgLocalAmt,
            locAmtDec
          )
          return calculateAdditionAmount(sum, detailTotal, locAmtDec)
        },
        0
      )

      console.log("sumOfDetailsLocalAmt :", sumOfDetailsLocalAmt)
      console.log("formValues.fromTotLocalAmt :", formValues.fromTotLocalAmt)

      // Round to 2 decimal places for comparison using account helper
      const fromTotLocalAmtRounded = mathRound(
        formValues.fromTotLocalAmt,
        locAmtDec
      )
      const sumOfDetailsRounded = mathRound(sumOfDetailsLocalAmt, locAmtDec)

      if (fromTotLocalAmtRounded !== sumOfDetailsRounded) {
        toast.warning(
          `From Total Local Amount (${fromTotLocalAmtRounded.toFixed(locAmtDec)}) does not match the sum of details (${sumOfDetailsRounded.toFixed(locAmtDec)}). Please check the amounts.`
        )
        return
      }

      console.log(formValues)

      const response =
        Number(formValues.transferId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const bankTransferData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (bankTransferData) {
          const updatedSchemaType = transformToSchemaType(
            bankTransferData as unknown as ICbBankTransferCtmHd
          )
          setIsSelectingBankTransferCtm(true)
          setBankTransferCtm(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchBankTransferCtms()
      } else {
        toast.error(response.message || "Failed to save Bank Transfer CTM")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving Bank Transfer CTM")
    } finally {
      setIsSaving(false)
      setIsSelectingBankTransferCtm(false)
    }
  }

  // Handle Clone
  const handleCloneBankTransferCtm = () => {
    if (bankTransferCtm) {
      // Create a proper clone with form values
      const clonedBankTransferCtm: CbBankTransferCtmHdSchemaType = {
        ...bankTransferCtm,
        transferId: "0",
        transferNo: "",
        // Reset amounts for new Bank Transfer CTM
        fromTotAmt: 0,
        fromTotLocalAmt: 0,
        exhGainLoss: 0,
        // Clone details with reset IDs
        data_details:
          bankTransferCtm.data_details?.map((detail) => ({
            ...detail,
            transferId: "0",
            transferNo: "",
          })) || [],
      }
      setBankTransferCtm(clonedBankTransferCtm)
      form.reset(clonedBankTransferCtm)
      toast.success("Bank Transfer CTM cloned successfully")
    }
  }

  // Handle Delete
  const handleBankTransferCtmDelete = async () => {
    if (!bankTransferCtm) return

    try {
      const response = await deleteMutation.mutateAsync(
        bankTransferCtm.transferId?.toString() ?? ""
      )
      if (response.result === 1) {
        setBankTransferCtm(null)
        setSearchNo("") // Clear search input
        setSearchNo("") // Clear search input
        form.reset(defaultBankTransferCtmHd)
        refetchBankTransferCtms()
      } else {
        toast.error(response.message || "Failed to delete Bank Transfer CTM")
      }
    } catch {
      toast.error("Network error while deleting Bank Transfer CTM")
    }
  }

  // Handle Reset
  const handleBankTransferCtmReset = () => {
    setBankTransferCtm(null)
    setSearchNo("") // Clear search input
    form.reset(defaultBankTransferCtmHd)
    toast.success("Bank Transfer CTM reset successfully")
  }

  // Helper function to transform ICbBankTransferCtm to CbBankTransferCtmSchemaType
  const transformToSchemaType = (
    apiBankTransferCtm: ICbBankTransferCtmHd
  ): CbBankTransferCtmHdSchemaType => {
    return {
      transferId: apiBankTransferCtm.transferId?.toString() ?? "0",
      transferNo: apiBankTransferCtm.transferNo ?? "",
      referenceNo: apiBankTransferCtm.referenceNo ?? "",
      trnDate: apiBankTransferCtm.trnDate
        ? format(
            parseDate(apiBankTransferCtm.trnDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      accountDate: apiBankTransferCtm.accountDate
        ? format(
            parseDate(apiBankTransferCtm.accountDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      paymentTypeId: apiBankTransferCtm.paymentTypeId ?? 0,
      chequeNo: apiBankTransferCtm.chequeNo ?? "",
      chequeDate: apiBankTransferCtm.chequeDate
        ? format(
            parseDate(apiBankTransferCtm.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : apiBankTransferCtm.accountDate
          ? format(
              parseDate(apiBankTransferCtm.accountDate as string) || new Date(),
              clientDateFormat
            )
          : format(new Date(), clientDateFormat),

      fromBankId: apiBankTransferCtm.fromBankId ?? 0,
      fromCurrencyId: apiBankTransferCtm.fromCurrencyId ?? 0,
      fromExhRate: apiBankTransferCtm.fromExhRate ?? 0,
      fromBankChgGLId: apiBankTransferCtm.fromBankChgGLId ?? 0,
      fromBankChgAmt: apiBankTransferCtm.fromBankChgAmt ?? 0,
      fromBankChgLocalAmt: apiBankTransferCtm.fromBankChgLocalAmt ?? 0,
      fromTotAmt: apiBankTransferCtm.fromTotAmt ?? 0,
      fromTotLocalAmt: apiBankTransferCtm.fromTotLocalAmt ?? 0,

      remarks: apiBankTransferCtm.remarks ?? "",
      payeeTo: apiBankTransferCtm.payeeTo ?? "",
      moduleFrom: apiBankTransferCtm.moduleFrom ?? "",
      exhGainLoss: apiBankTransferCtm.exhGainLoss ?? 0,
      createBy: apiBankTransferCtm.createBy ?? "",
      editBy: apiBankTransferCtm.editBy ?? "",
      cancelBy: apiBankTransferCtm.cancelBy ?? "",
      createDate: apiBankTransferCtm.createDate
        ? parseDate(apiBankTransferCtm.createDate as string) || new Date()
        : new Date(),
      editDate: apiBankTransferCtm.editDate
        ? parseDate(apiBankTransferCtm.editDate as unknown as string) || null
        : null,
      cancelDate: apiBankTransferCtm.cancelDate
        ? parseDate(apiBankTransferCtm.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiBankTransferCtm.cancelRemarks ?? null,
      editVersion: apiBankTransferCtm.editVersion ?? 0,
      isPost: apiBankTransferCtm.isPost ?? false,
      postBy: apiBankTransferCtm.postBy ?? "",
      postDate: apiBankTransferCtm.postDate
        ? parseDate(apiBankTransferCtm.postDate as unknown as string) || null
        : null,
      appStatusId: apiBankTransferCtm.appStatusId ?? null,
      appBy: apiBankTransferCtm.appBy ?? "",
      appDate: apiBankTransferCtm.appDate
        ? parseDate(apiBankTransferCtm.appDate as unknown as string) || null
        : null,
      data_details:
        apiBankTransferCtm.data_details?.map((detail) => ({
          transferId: detail.transferId?.toString() ?? "0",
          transferNo: detail.transferNo ?? "",
          itemNo: detail.itemNo ?? 0,
          seqNo: detail.seqNo ?? 0,
          jobOrderId: detail.jobOrderId ?? 0,
          taskId: detail.taskId ?? 0,
          serviceId: detail.serviceId ?? 0,
          toBankId: detail.toBankId ?? 0,
          toCurrencyId: detail.toCurrencyId ?? 0,
          toExhRate: detail.toExhRate ?? 0,
          toBankChgGLId: detail.toBankChgGLId ?? 0,
          toBankChgAmt: detail.toBankChgAmt ?? 0,
          toBankChgLocalAmt: detail.toBankChgLocalAmt ?? 0,
          toTotAmt: detail.toTotAmt ?? 0,
          toTotLocalAmt: detail.toTotLocalAmt ?? 0,
          bankExhRate: detail.bankExhRate ?? 0,
          bankTotAmt: detail.bankTotAmt ?? 0,
          bankTotLocalAmt: detail.bankTotLocalAmt ?? 0,
          editVersion: detail.editVersion ?? 0,
        })) || [],
    }
  }

  const handleBankTransferCtmSelect = async (
    selectedBankTransferCtm: ICbBankTransferCtmHd | undefined
  ) => {
    if (!selectedBankTransferCtm) return

    setIsSelectingBankTransferCtm(true)

    try {
      // Fetch Bank Transfer CTM details directly using selected Bank Transfer CTM's values
      const response = await getById(
        `${CbBankTransferCtm.getByIdNo}/${selectedBankTransferCtm.transferId}/${selectedBankTransferCtm.transferNo}`
      )

      if (response?.result === 1) {
        const detailedBankTransferCtm = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBankTransferCtm) {
          const updatedBankTransferCtm = transformToSchemaType(
            detailedBankTransferCtm
          )
          setBankTransferCtm(updatedBankTransferCtm)
          form.reset(updatedBankTransferCtm)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Bank Transfer CTM ${selectedBankTransferCtm.transferNo} loaded successfully`
          )
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch Bank Transfer CTM details"
        )
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching Bank Transfer CTM details:", error)
      toast.error("Error loading Bank Transfer CTM. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingBankTransferCtm(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbBankTransferCtmFilter) => {
    setFilters(newFilters)
  }

  // Refetch bank transfers when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchBankTransferCtms()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, showListDialog])

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

  const handleBankTransferCtmSearch = async (value: string) => {
    if (!value) return

    setIsLoadingBankTransferCtm(true)

    try {
      const response = await getById(
        `${CbBankTransferCtm.getByIdNo}/0/${value}`
      )

      if (response?.result === 1) {
        const detailedBankTransferCtm = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBankTransferCtm) {
          const updatedBankTransferCtm = transformToSchemaType(
            detailedBankTransferCtm
          )
          setBankTransferCtm(updatedBankTransferCtm)
          form.reset(updatedBankTransferCtm)
          form.trigger()

          // Show success message
          toast.success(`Bank Transfer CTM ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message ||
            "Failed to fetch Bank Transfer CTM details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for Bank Transfer CTM")
    } finally {
      setIsLoadingBankTransferCtm(false)
    }
  }

  // Determine mode and Bank Transfer CTM ID from URL
  const transferNo = form.getValues("transferNo")
  const isEdit = Boolean(transferNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Bank Transfer CTM (Edit) - ${transferNo}`
    : "CB Bank Transfer CTM (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading Bank Transfer CTM form...
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
              placeholder="Search Bank Transfer CTM No"
              className="h-8 text-sm"
              readOnly={
                !!bankTransferCtm?.transferId &&
                bankTransferCtm.transferId !== "0"
              }
              disabled={
                !!bankTransferCtm?.transferId &&
                bankTransferCtm.transferId !== "0"
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={
                isLoadingBankTransferCtms || isRefetchingBankTransferCtms
              }
            >
              {isLoadingBankTransferCtms || isRefetchingBankTransferCtms ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <ListFilter className="mr-1 h-4 w-4" />
              )}
              {isLoadingBankTransferCtms || isRefetchingBankTransferCtms
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
              disabled={!bankTransferCtm || bankTransferCtm.transferId === "0"}
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={!bankTransferCtm || bankTransferCtm.transferId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !bankTransferCtm ||
                bankTransferCtm.transferId === "0" ||
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
              handleSaveBankTransferCtm()
            }}
            isEdit={isEdit}
            visible={visible}
            required={required}
            companyId={Number(companyId)}
          />
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
            refetchBankTransferCtms()
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
                  CB Bank Transfer List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing Bank Transfer CTMs from the list
                  below. Use search to filter records or create new Bank
                  Transfer CTMs.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingBankTransferCtms ||
          isRefetchingBankTransferCtms ||
          isSelectingBankTransferCtm ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingBankTransferCtm
                    ? "Loading Bank Transfer CTM details..."
                    : "Loading Bank Transfer CTMs..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingBankTransferCtm
                    ? "Please wait while we fetch the complete Bank Transfer CTM data"
                    : "Please wait while we fetch the Bank Transfer CTM list"}
                </p>
              </div>
            </div>
          ) : (
            <BankTransferCtmTable
              data={bankTransfersData || []}
              isLoading={false}
              onBankTransferCtmSelect={handleBankTransferCtmSelect}
              onRefresh={() => refetchBankTransferCtms()}
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
        onConfirm={handleSaveBankTransferCtm}
        itemName={bankTransferCtm?.transferNo || "New Bank Transfer CTM"}
        operationType={
          bankTransferCtm?.transferId && bankTransferCtm.transferId !== "0"
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
        onConfirm={handleBankTransferCtmDelete}
        itemName={bankTransferCtm?.transferNo}
        title="Delete Bank Transfer CTM"
        description="This action cannot be undone. All Bank Transfer CTM details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleBankTransferCtmSearch(searchNo)}
        code={searchNo}
        typeLabel="Bank Transfer CTM"
        showDetails={false}
        description={`Do you want to load Bank Transfer CTM ${searchNo}?`}
        isLoading={isLoadingBankTransferCtm}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleBankTransferCtmReset}
        itemName={bankTransferCtm?.transferNo}
        title="Reset Bank Transfer CTM"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneBankTransferCtm}
        itemName={bankTransferCtm?.transferNo}
        title="Clone Bank Transfer CTM"
        description="This will create a copy as a new Bank Transfer CTM."
      />
    </div>
  )
}
