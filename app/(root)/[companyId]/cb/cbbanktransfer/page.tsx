"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ICbBankTransfer, ICbBankTransferFilter } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { CbBankTransferSchema, CbBankTransferSchemaType } from "@/schemas"
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
import { CbBankTransfer } from "@/lib/api-routes"
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

import { defaultBankTransfer } from "./components/cbbanktransfer-defaultvalues"
import BankTransferTable from "./components/cbbanktransfer-table"
import History from "./components/history"
import Main from "./components/main-tab"

export default function BankTransferPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbbanktransfer

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingBankTransfer, setIsLoadingBankTransfer] = useState(false)
  const [isSelectingBankTransfer, setIsSelectingBankTransfer] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bankTransfer, setBankTransfer] =
    useState<CbBankTransferSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbBankTransferFilter>({
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
  const form = useForm<CbBankTransferSchemaType>({
    resolver: zodResolver(CbBankTransferSchema(required, visible)),
    defaultValues: bankTransfer
      ? {
          transferId: bankTransfer.transferId?.toString() ?? "0",
          transferNo: bankTransfer.transferNo ?? "",
          referenceNo: bankTransfer.referenceNo ?? "",
          trnDate: bankTransfer.trnDate ?? new Date(),
          accountDate: bankTransfer.accountDate ?? new Date(),
          paymentTypeId: bankTransfer.paymentTypeId ?? 0,
          chequeNo: bankTransfer.chequeNo ?? "",
          chequeDate: bankTransfer.chequeDate ?? "",
          jobOrderId: bankTransfer.jobOrderId ?? 0,
          taskId: bankTransfer.taskId ?? 0,
          serviceId: bankTransfer.serviceId ?? 0,
          fromBankId: bankTransfer.fromBankId ?? 0,
          fromCurrencyId: bankTransfer.fromCurrencyId ?? 0,
          fromExhRate: bankTransfer.fromExhRate ?? 0,
          fromBankChgGLId: bankTransfer.fromBankChgGLId ?? 0,
          fromBankChgAmt: bankTransfer.fromBankChgAmt ?? 0,
          fromBankChgLocalAmt: bankTransfer.fromBankChgLocalAmt ?? 0,
          fromTotAmt: bankTransfer.fromTotAmt ?? 0,
          fromTotLocalAmt: bankTransfer.fromTotLocalAmt ?? 0,
          toBankId: bankTransfer.toBankId ?? 0,
          toCurrencyId: bankTransfer.toCurrencyId ?? 0,
          toExhRate: bankTransfer.toExhRate ?? 0,
          toBankChgGLId: bankTransfer.toBankChgGLId ?? 0,
          toBankChgAmt: bankTransfer.toBankChgAmt ?? 0,
          toBankChgLocalAmt: bankTransfer.toBankChgLocalAmt ?? 0,
          toTotAmt: bankTransfer.toTotAmt ?? 0,
          toTotLocalAmt: bankTransfer.toTotLocalAmt ?? 0,
          bankExhRate: bankTransfer.bankExhRate ?? 0,
          bankTotAmt: bankTransfer.bankTotAmt ?? 0,
          bankTotLocalAmt: bankTransfer.bankTotLocalAmt ?? 0,
          exhGainLoss: bankTransfer.exhGainLoss ?? 0,
          remarks: bankTransfer.remarks ?? "",
          payeeTo: bankTransfer.payeeTo ?? "",
          moduleFrom: bankTransfer.moduleFrom ?? "",
          editVersion: bankTransfer.editVersion ?? 0,
          isCancel: bankTransfer.isCancel ?? false,
          cancelBy: bankTransfer.cancelBy ?? "",
          cancelDate: bankTransfer.cancelDate ?? null,
          cancelRemarks: bankTransfer.cancelRemarks ?? null,
          isPost: bankTransfer.isPost ?? false,
          postBy: bankTransfer.postBy ?? "",
          postDate: bankTransfer.postDate ?? null,
          appStatusId: bankTransfer.appStatusId ?? null,
          appBy: bankTransfer.appBy ?? "",
          appDate: bankTransfer.appDate ?? null,
        }
      : {
          ...defaultBankTransfer,
        },
  })

  // API hooks for bank transfers - Only fetch when List dialog is opened (optimized)
  const {
    data: bankTransfersResponse,
    refetch: refetchBankTransfers,
    isLoading: isLoadingBankTransfers,
    isRefetching: isRefetchingBankTransfers,
  } = useGetWithDates<ICbBankTransfer>(
    `${CbBankTransfer.get}`,
    TableName.cbBankTransfer,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize bankTransfer data to prevent unnecessary re-renders
  const bankTransfersData = useMemo(
    () => (bankTransfersResponse as ApiResponse<ICbBankTransfer>)?.data ?? [],
    [bankTransfersResponse]
  )

  // Mutations
  const saveMutation = usePersist<CbBankTransferSchemaType>(
    `${CbBankTransfer.add}`
  )
  const updateMutation = usePersist<CbBankTransferSchemaType>(
    `${CbBankTransfer.add}`
  )
  const deleteMutation = useDelete(`${CbBankTransfer.delete}`)

  // Handle Save
  const handleSaveBankTransfer = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as ICbBankTransfer
      )

      // Set chequeDate to accountDate if it's empty
      if (!formValues.chequeDate || formValues.chequeDate === "") {
        formValues.chequeDate = formValues.accountDate
      }

      // Validate the form data using the schema
      const validationResult = CbBankTransferSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)
        toast.error("Please check form data and try again")
        return
      }

      //check totamt and totlocalamt should not be zero
      if (
        formValues.toTotAmt === 0 ||
        formValues.toTotLocalAmt === 0 ||
        formValues.fromTotAmt === 0 ||
        formValues.fromTotLocalAmt === 0
      ) {
        toast.error(
          "To Total Amount, To Total Local Amount, From Total Amount, From Total Local Amount should not be zero"
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
            bankTransferData as unknown as ICbBankTransfer
          )
          setIsSelectingBankTransfer(true)
          setBankTransfer(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchBankTransfers()
      } else {
        toast.error(response.message || "Failed to save bankTransfer")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving bankTransfer")
    } finally {
      setIsSaving(false)
      setIsSelectingBankTransfer(false)
    }
  }

  // Handle Clone
  const handleCloneBankTransfer = () => {
    if (bankTransfer) {
      // Create a proper clone with form values
      const clonedBankTransfer: CbBankTransferSchemaType = {
        ...bankTransfer,
        transferId: "0",
        transferNo: "",
        // Reset amounts for new bankTransfer
        fromTotAmt: 0,
        fromTotLocalAmt: 0,
        toTotAmt: 0,
        toTotLocalAmt: 0,
        bankTotAmt: 0,
        bankTotLocalAmt: 0,
        exhGainLoss: 0,
      }
      setBankTransfer(clonedBankTransfer)
      form.reset(clonedBankTransfer)
      toast.success("Bank Transfer cloned successfully")
    }
  }

  // Handle Delete
  const handleBankTransferDelete = async () => {
    if (!bankTransfer) return

    try {
      const response = await deleteMutation.mutateAsync(
        bankTransfer.transferId?.toString() ?? ""
      )
      if (response.result === 1) {
        setBankTransfer(null)
        setSearchNo("") // Clear search input
        setSearchNo("") // Clear search input
        form.reset(defaultBankTransfer)
        refetchBankTransfers()
      } else {
        toast.error(response.message || "Failed to delete Bank Transfer")
      }
    } catch {
      toast.error("Network error while deleting bank transfer")
    }
  }

  // Handle Reset
  const handleBankTransferReset = () => {
    setBankTransfer(null)
    setSearchNo("") // Clear search input
    form.reset(defaultBankTransfer)
    toast.success("Bank Transfer reset successfully")
  }

  // Helper function to transform ICbBankTransfer to CbBankTransferSchemaType
  const transformToSchemaType = (
    apiBankTransfer: ICbBankTransfer
  ): CbBankTransferSchemaType => {
    return {
      transferId: apiBankTransfer.transferId?.toString() ?? "0",
      transferNo: apiBankTransfer.transferNo ?? "",
      referenceNo: apiBankTransfer.referenceNo ?? "",
      trnDate: apiBankTransfer.trnDate
        ? format(
            parseDate(apiBankTransfer.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiBankTransfer.accountDate
        ? format(
            parseDate(apiBankTransfer.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      paymentTypeId: apiBankTransfer.paymentTypeId ?? 0,
      chequeNo: apiBankTransfer.chequeNo ?? "",
      chequeDate: apiBankTransfer.chequeDate
        ? format(
            parseDate(apiBankTransfer.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : apiBankTransfer.accountDate
          ? format(
              parseDate(apiBankTransfer.accountDate as string) || new Date(),
              clientDateFormat
            )
          : format(new Date(), clientDateFormat),
      jobOrderId: apiBankTransfer.jobOrderId ?? 0,
      taskId: apiBankTransfer.taskId ?? 0,
      serviceId: apiBankTransfer.serviceId ?? 0,

      fromBankId: apiBankTransfer.fromBankId ?? 0,
      fromCurrencyId: apiBankTransfer.fromCurrencyId ?? 0,
      fromExhRate: apiBankTransfer.fromExhRate ?? 0,
      fromBankChgGLId: apiBankTransfer.fromBankChgGLId ?? 0,
      fromBankChgAmt: apiBankTransfer.fromBankChgAmt ?? 0,
      fromBankChgLocalAmt: apiBankTransfer.fromBankChgLocalAmt ?? 0,
      fromTotAmt: apiBankTransfer.fromTotAmt ?? 0,
      fromTotLocalAmt: apiBankTransfer.fromTotLocalAmt ?? 0,

      toBankId: apiBankTransfer.toBankId ?? 0,
      toCurrencyId: apiBankTransfer.toCurrencyId ?? 0,
      toExhRate: apiBankTransfer.toExhRate ?? 0,
      toBankChgGLId: apiBankTransfer.toBankChgGLId ?? 0,
      toBankChgAmt: apiBankTransfer.toBankChgAmt ?? 0,
      toBankChgLocalAmt: apiBankTransfer.toBankChgLocalAmt ?? 0,
      toTotAmt: apiBankTransfer.toTotAmt ?? 0,
      toTotLocalAmt: apiBankTransfer.toTotLocalAmt ?? 0,

      bankExhRate: apiBankTransfer.bankExhRate ?? 0,
      bankTotAmt: apiBankTransfer.bankTotAmt ?? 0,
      bankTotLocalAmt: apiBankTransfer.bankTotLocalAmt ?? 0,

      remarks: apiBankTransfer.remarks ?? "",
      payeeTo: apiBankTransfer.payeeTo ?? "",
      moduleFrom: apiBankTransfer.moduleFrom ?? "",
      exhGainLoss: apiBankTransfer.exhGainLoss ?? 0,
      createBy: apiBankTransfer.createBy ?? "",
      editBy: apiBankTransfer.editBy ?? "",
      cancelBy: apiBankTransfer.cancelBy ?? "",
      createDate: apiBankTransfer.createDate
        ? parseDate(apiBankTransfer.createDate as string) || new Date()
        : new Date(),
      editDate: apiBankTransfer.editDate
        ? parseDate(apiBankTransfer.editDate as unknown as string) || null
        : null,
      cancelDate: apiBankTransfer.cancelDate
        ? parseDate(apiBankTransfer.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiBankTransfer.cancelRemarks ?? null,
      editVersion: apiBankTransfer.editVersion ?? 0,
      isPost: apiBankTransfer.isPost ?? false,
      postDate: apiBankTransfer.postDate
        ? parseDate(apiBankTransfer.postDate as unknown as string) || null
        : null,
      appStatusId: apiBankTransfer.appStatusId ?? null,
      appBy: apiBankTransfer.appBy ?? "",
      appDate: apiBankTransfer.appDate
        ? parseDate(apiBankTransfer.appDate as unknown as string) || null
        : null,
    }
  }

  const handleBankTransferSelect = async (
    selectedBankTransfer: ICbBankTransfer | undefined
  ) => {
    if (!selectedBankTransfer) return

    setIsSelectingBankTransfer(true)

    try {
      // Fetch bankTransfer details directly using selected bankTransfer's values
      const response = await getById(
        `${CbBankTransfer.getByIdNo}/${selectedBankTransfer.transferId}/${selectedBankTransfer.transferNo}`
      )

      if (response?.result === 1) {
        const detailedBankTransfer = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBankTransfer) {
          const updatedBankTransfer =
            transformToSchemaType(detailedBankTransfer)
          setBankTransfer(updatedBankTransfer)
          form.reset(updatedBankTransfer)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `BankTransfer ${selectedBankTransfer.transferNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch bankTransfer details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching bankTransfer details:", error)
      toast.error("Error loading bankTransfer. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingBankTransfer(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbBankTransferFilter) => {
    setFilters(newFilters)
  }

  // Refetch bank transfers when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchBankTransfers()
    }
  }, [filters, showListDialog, refetchBankTransfers])

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

  const handleBankTransferSearch = async (value: string) => {
    if (!value) return

    setIsLoadingBankTransfer(true)

    try {
      const response = await getById(`${CbBankTransfer.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedBankTransfer = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBankTransfer) {
          const updatedBankTransfer =
            transformToSchemaType(detailedBankTransfer)
          setBankTransfer(updatedBankTransfer)
          form.reset(updatedBankTransfer)
          form.trigger()

          // Show success message
          toast.success(`BankTransfer ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch bankTransfer details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for bankTransfer")
    } finally {
      setIsLoadingBankTransfer(false)
    }
  }

  // Determine mode and bankTransfer ID from URL
  const transferNo = form.getValues("transferNo")
  const isEdit = Boolean(transferNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Bank Transfer (Edit) - ${transferNo}`
    : "CB Bank Transfer (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading bankTransfer form...
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
              placeholder="Search BankTransfer No"
              className="h-8 text-sm"
              readOnly={
                !!bankTransfer?.transferId && bankTransfer.transferId !== "0"
              }
              disabled={
                !!bankTransfer?.transferId && bankTransfer.transferId !== "0"
              }
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
              disabled={!bankTransfer || bankTransfer.transferId === "0"}
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
              disabled={!bankTransfer || bankTransfer.transferId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!bankTransfer || bankTransfer.transferId === "0"}
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
              handleSaveBankTransfer()
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
            refetchBankTransfers()
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
                  Manage and select existing bank transfers from the list below.
                  Use search to filter records or create new bank transfers.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingBankTransfers ||
          isRefetchingBankTransfers ||
          isSelectingBankTransfer ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingBankTransfer
                    ? "Loading bank transfer details..."
                    : "Loading bank transfers..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingBankTransfer
                    ? "Please wait while we fetch the complete bank transfer data"
                    : "Please wait while we fetch the bank transfer list"}
                </p>
              </div>
            </div>
          ) : (
            <BankTransferTable
              data={bankTransfersData || []}
              isLoading={false}
              onBankTransferSelect={handleBankTransferSelect}
              onRefresh={() => refetchBankTransfers()}
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
        onConfirm={handleSaveBankTransfer}
        itemName={bankTransfer?.transferNo || "New Bank Transfer"}
        operationType={
          bankTransfer?.transferId && bankTransfer.transferId !== "0"
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
        onConfirm={handleBankTransferDelete}
        itemName={bankTransfer?.transferNo}
        title="Delete Bank Transfer"
        description="This action cannot be undone. All bank transfer details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleBankTransferSearch(searchNo)}
        code={searchNo}
        typeLabel="Bank Transfer"
        showDetails={false}
        description={`Do you want to load Bank Transfer ${searchNo}?`}
        isLoading={isLoadingBankTransfer}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleBankTransferReset}
        itemName={bankTransfer?.transferNo}
        title="Reset Bank Transfer"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneBankTransfer}
        itemName={bankTransfer?.transferNo}
        title="Clone Bank Transfer"
        description="This will create a copy as a new bank transfer."
      />
    </div>
  )
}
