"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ICbBankReconFilter, ICbBankReconHd } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBankReconDtSchemaType,
  CbBankReconHdSchema,
  CbBankReconHdSchemaType,
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
import { CbBankRecon } from "@/lib/api-routes"
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

import { defaultBankRecon } from "./components/cbbankrecon-defaultvalues"
import BankReconTable from "./components/cbbankrecon-table"
import History from "./components/history"
import Main from "./components/main-tab"

export default function BankReconPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbbankrecon

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingBankRecon, setIsLoadingBankRecon] = useState(false)
  const [isSelectingBankRecon, setIsSelectingBankRecon] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bankRecon, setBankRecon] = useState<CbBankReconHdSchemaType | null>(
    null
  )
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbBankReconFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "reconNo",
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
  const form = useForm<CbBankReconHdSchemaType>({
    resolver: zodResolver(CbBankReconHdSchema(required, visible)),
    defaultValues: bankRecon
      ? {
          reconId: bankRecon.reconId?.toString() ?? "0",
          reconNo: bankRecon.reconNo ?? "",
          prevReconId: bankRecon.prevReconId ?? 0,
          prevReconNo: bankRecon.prevReconNo ?? "",
          referenceNo: bankRecon.referenceNo ?? "",
          trnDate: bankRecon.trnDate ?? new Date(),
          accountDate: bankRecon.accountDate ?? new Date(),
          bankId: bankRecon.bankId ?? 0,
          currencyId: bankRecon.currencyId ?? 0,
          fromDate: bankRecon.fromDate ?? new Date(),
          toDate: bankRecon.toDate ?? new Date(),
          remarks: bankRecon.remarks ?? "",
          totAmt: bankRecon.totAmt ?? 0,
          opBalAmt: bankRecon.opBalAmt ?? 0,
          clBalAmt: bankRecon.clBalAmt ?? 0,
          editVersion: bankRecon.editVersion ?? 0,
          data_details:
            bankRecon.data_details?.map((detail) => ({
              ...detail,
              reconId: detail.reconId?.toString() ?? "0",
              reconNo: detail.reconNo ?? "",
              itemNo: detail.itemNo ?? 0,
              isSel: detail.isSel ?? false,
              moduleId: detail.moduleId ?? 0,
              transactionId: detail.transactionId ?? 0,
              documentId: detail.documentId ?? 0,
              documentNo: detail.documentNo ?? "",
              docReferenceNo: detail.docReferenceNo ?? "",
              accountDate: detail.accountDate ?? new Date(),
              paymentTypeId: detail.paymentTypeId ?? 0,
              chequeNo: detail.chequeNo ?? "",
              chequeDate: detail.chequeDate ?? new Date(),
              customerId: detail.customerId ?? 0,
              supplierId: detail.supplierId ?? 0,
              glId: detail.glId ?? 0,
              isDebit: detail.isDebit ?? false,
              exhRate: detail.exhRate ?? 0,
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              paymentFromTo: detail.paymentFromTo ?? "",
              remarks: detail.remarks ?? "",
              editVersion: detail.editVersion ?? 0,
            })) || [],
        }
      : {
          ...defaultBankRecon,
        },
  })

  // API hooks for bank reconciliations - Only fetch when List dialog is opened (optimized)
  const {
    data: bankReconsResponse,
    refetch: refetchBankRecons,
    isLoading: isLoadingBankRecons,
    isRefetching: isRefetchingBankRecons,
  } = useGetWithDates<ICbBankReconHd>(
    `${CbBankRecon.get}`,
    TableName.cbBankRecon,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize bank recon data to prevent unnecessary re-renders
  const bankReconsData = useMemo(
    () => (bankReconsResponse as ApiResponse<ICbBankReconHd>)?.data ?? [],
    [bankReconsResponse]
  )

  // Mutations
  const saveMutation = usePersist<CbBankReconHdSchemaType>(`${CbBankRecon.add}`)
  const updateMutation = usePersist<CbBankReconHdSchemaType>(
    `${CbBankRecon.add}`
  )
  const deleteMutation = useDelete(`${CbBankRecon.delete}`)

  // Handle Save
  const handleSaveBankRecon = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as ICbBankReconHd
      )

      // Validate the form data using the schema
      const validationResult = CbBankReconHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)
        toast.error("Please check form data and try again")
        return
      }

      // Check if at least one detail is selected
      if (!formValues.data_details || formValues.data_details.length === 0) {
        toast.error("Please add at least one reconciliation detail")
        return
      }

      console.log(formValues)

      const response =
        Number(formValues.reconId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const bankReconData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (bankReconData) {
          const updatedSchemaType = transformToSchemaType(
            bankReconData as unknown as ICbBankReconHd
          )
          setIsSelectingBankRecon(true)
          setBankRecon(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchBankRecons()
      } else {
        toast.error(response.message || "Failed to save Bank Reconciliation")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving Bank Reconciliation")
    } finally {
      setIsSaving(false)
      setIsSelectingBankRecon(false)
    }
  }

  // Handle Clone
  const handleCloneBankRecon = () => {
    if (bankRecon) {
      // Create a proper clone with form values
      const clonedBankRecon: CbBankReconHdSchemaType = {
        ...bankRecon,
        reconId: "0",
        reconNo: "",
        prevReconId: 0,
        prevReconNo: "",
        // Reset amounts for new reconciliation
        totAmt: 0,
        opBalAmt: 0,
        clBalAmt: 0,
        // Reset data details
        data_details: [],
      }
      setBankRecon(clonedBankRecon)
      form.reset(clonedBankRecon)
      toast.success("Bank Reconciliation cloned successfully")
    }
  }

  // Handle Delete
  const handleBankReconDelete = async () => {
    if (!bankRecon) return

    try {
      const response = await deleteMutation.mutateAsync(
        bankRecon.reconId?.toString() ?? ""
      )
      if (response.result === 1) {
        setBankRecon(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultBankRecon,
          data_details: [],
        })
        refetchBankRecons()
      } else {
        toast.error(response.message || "Failed to delete Bank Reconciliation")
      }
    } catch {
      toast.error("Network error while deleting Bank Reconciliation")
    }
  }

  // Handle Reset
  const handleBankReconReset = () => {
    setBankRecon(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultBankRecon,
      data_details: [],
    })
    toast.success("Bank Reconciliation reset successfully")
  }

  // Helper function to transform ICbBankReconHd to CbBankReconHdSchemaType
  const transformToSchemaType = (
    apiBankRecon: ICbBankReconHd
  ): CbBankReconHdSchemaType => {
    return {
      reconId: apiBankRecon.reconId?.toString() ?? "0",
      reconNo: apiBankRecon.reconNo ?? "",
      prevReconId: apiBankRecon.prevReconId ?? 0,
      prevReconNo: apiBankRecon.prevReconNo ?? "",
      referenceNo: apiBankRecon.referenceNo ?? "",
      trnDate: apiBankRecon.trnDate
        ? format(
            parseDate(apiBankRecon.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiBankRecon.accountDate
        ? format(
            parseDate(apiBankRecon.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankId: apiBankRecon.bankId ?? 0,
      currencyId: apiBankRecon.currencyId ?? 0,
      fromDate: apiBankRecon.fromDate
        ? format(
            parseDate(apiBankRecon.fromDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      toDate: apiBankRecon.toDate
        ? format(
            parseDate(apiBankRecon.toDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      remarks: apiBankRecon.remarks ?? "",
      totAmt: apiBankRecon.totAmt ?? 0,
      opBalAmt: apiBankRecon.opBalAmt ?? 0,
      clBalAmt: apiBankRecon.clBalAmt ?? 0,
      createById: apiBankRecon.createById ?? 0,
      createDate: apiBankRecon.createDate
        ? parseDate(apiBankRecon.createDate as string) || new Date()
        : new Date(),
      editById: apiBankRecon.editById ?? undefined,
      editDate: apiBankRecon.editDate
        ? parseDate(apiBankRecon.editDate as unknown as string) || null
        : null,
      editVersion: apiBankRecon.editVersion ?? 0,
      isCancel: apiBankRecon.isCancel ?? false,
      cancelById: apiBankRecon.cancelById ?? undefined,
      cancelDate: apiBankRecon.cancelDate
        ? parseDate(apiBankRecon.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiBankRecon.cancelRemarks ?? null,
      isPost: apiBankRecon.isPost ?? false,
      postById: apiBankRecon.postById ?? undefined,
      postDate: apiBankRecon.postDate
        ? parseDate(apiBankRecon.postDate as unknown as string) || null
        : null,
      appStatusId: apiBankRecon.appStatusId ?? null,
      appById: apiBankRecon.appById ?? null,
      appDate: apiBankRecon.appDate
        ? parseDate(apiBankRecon.appDate as unknown as string) || null
        : null,
      data_details:
        apiBankRecon.data_details?.map(
          (detail) =>
            ({
              ...detail,
              reconId: detail.reconId?.toString() ?? "0",
              reconNo: detail.reconNo ?? "",
              itemNo: detail.itemNo ?? 0,
              isSel: detail.isSel ?? false,
              moduleId: detail.moduleId ?? 0,
              transactionId: detail.transactionId ?? 0,
              documentId: detail.documentId ?? 0,
              documentNo: detail.documentNo ?? "",
              docReferenceNo: detail.docReferenceNo ?? "",
              accountDate: detail.accountDate
                ? format(
                    parseDate(detail.accountDate as string) || new Date(),
                    clientDateFormat
                  )
                : clientDateFormat,
              paymentTypeId: detail.paymentTypeId ?? 0,
              chequeNo: detail.chequeNo ?? "",
              chequeDate: detail.chequeDate
                ? format(
                    parseDate(detail.chequeDate as string) || new Date(),
                    clientDateFormat
                  )
                : clientDateFormat,
              customerId: detail.customerId ?? 0,
              supplierId: detail.supplierId ?? 0,
              glId: detail.glId ?? 0,
              isDebit: detail.isDebit ?? false,
              exhRate: detail.exhRate ?? 0,
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              paymentFromTo: detail.paymentFromTo ?? "",
              remarks: detail.remarks ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as CbBankReconDtSchemaType
        ) || [],
    }
  }

  const handleBankReconSelect = async (
    selectedBankRecon: ICbBankReconHd | undefined
  ) => {
    if (!selectedBankRecon) return

    setIsSelectingBankRecon(true)

    try {
      // Fetch Bank Reconciliation details directly using selected reconciliation's values
      const response = await getById(
        `${CbBankRecon.getByIdNo}/${selectedBankRecon.reconId}/${selectedBankRecon.reconNo}`
      )

      if (response?.result === 1) {
        const detailedBankRecon = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBankRecon) {
          const updatedBankRecon = transformToSchemaType(detailedBankRecon)
          setBankRecon(updatedBankRecon)
          form.reset(updatedBankRecon)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `BankRecon ${selectedBankRecon.reconNo} loaded successfully`
          )
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch Bank Reconciliation details"
        )
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching Bank Reconciliation details:", error)
      toast.error("Error loading Bank Reconciliation. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingBankRecon(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbBankReconFilter) => {
    setFilters(newFilters)
  }

  // Refetch bank reconciliations when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchBankRecons()
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

  const handleBankReconSearch = async (value: string) => {
    if (!value) return

    setIsLoadingBankRecon(true)

    try {
      const response = await getById(`${CbBankRecon.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedBankRecon = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBankRecon) {
          const updatedBankRecon = transformToSchemaType(detailedBankRecon)
          setBankRecon(updatedBankRecon)
          form.reset(updatedBankRecon)
          form.trigger()

          // Show success message
          toast.success(`Bank Reconciliation ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message ||
            "Failed to fetch Bank Reconciliation details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for Bank Reconciliation")
    } finally {
      setIsLoadingBankRecon(false)
    }
  }

  // Determine mode and bank recon ID from URL
  const reconNo = form.getValues("reconNo")
  const isEdit = Boolean(reconNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Bank Reconciliation (Edit) - ${reconNo}`
    : "CB Bank Reconciliation (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading Bank Reconciliation form...
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
              placeholder="Search Reconciliation No"
              className="h-8 text-sm"
              readOnly={!!bankRecon?.reconId && bankRecon.reconId !== "0"}
              disabled={!!bankRecon?.reconId && bankRecon.reconId !== "0"}
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
              disabled={!bankRecon || bankRecon.reconId === "0"}
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
              disabled={!bankRecon || bankRecon.reconId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!bankRecon || bankRecon.reconId === "0"}
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
              handleSaveBankRecon()
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
            refetchBankRecons()
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
                  CB Bank Reconciliation List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing Bank Reconciliations from the list
                  below. Use search to filter records or create new Bank
                  Reconciliations.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingBankRecons ||
          isRefetchingBankRecons ||
          isSelectingBankRecon ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingBankRecon
                    ? "Loading Bank Reconciliation details..."
                    : "Loading Bank Reconciliations..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingBankRecon
                    ? "Please wait while we fetch the complete Bank Reconciliation data"
                    : "Please wait while we fetch the Bank Reconciliation list"}
                </p>
              </div>
            </div>
          ) : (
            <BankReconTable
              data={bankReconsData || []}
              isLoading={false}
              onBankReconSelect={handleBankReconSelect}
              onRefresh={() => refetchBankRecons()}
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
        onConfirm={handleSaveBankRecon}
        itemName={bankRecon?.reconNo || "New Bank Reconciliation"}
        operationType={
          bankRecon?.reconId && bankRecon.reconId !== "0" ? "update" : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBankReconDelete}
        itemName={bankRecon?.reconNo}
        title="Delete Bank Reconciliation"
        description="This action cannot be undone. All bank reconciliation details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleBankReconSearch(searchNo)}
        code={searchNo}
        typeLabel="Bank Reconciliation"
        showDetails={false}
        description={`Do you want to load Bank Reconciliation ${searchNo}?`}
        isLoading={isLoadingBankRecon}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleBankReconReset}
        itemName={bankRecon?.reconNo}
        title="Reset Bank Reconciliation"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneBankRecon}
        itemName={bankRecon?.reconNo}
        title="Clone Bank Reconciliation"
        description="This will create a copy as a new bank reconciliation."
      />
    </div>
  )
}
