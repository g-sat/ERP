"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICbGenReceiptFilter,
  ICbGenReceiptHd,
} from "@/interfaces/cb-genreceipt"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenReceiptDtSchemaType,
  CbGenReceiptHdSchemaType,
  cbGenReceiptHdSchema,
} from "@/schemas/cb-genreceipt"
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
import { CbReceipt } from "@/lib/api-routes"
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

import { defaultReceipt } from "./components/cbgenreceipt-defaultvalues"
import ReceiptTable from "./components/cbgenreceipt-table"
import History from "./components/history"
import Main from "./components/main-tab"

export default function GenReceiptPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbgenreceipt

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)
  const [isSelectingReceipt, setIsSelectingReceipt] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [receipt, setReceipt] = useState<CbGenReceiptHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbGenReceiptFilter>({
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
  const form = useForm<CbGenReceiptHdSchemaType>({
    resolver: zodResolver(cbGenReceiptHdSchema(required, visible)),
    defaultValues: receipt
      ? {
          receiptId: receipt.receiptId?.toString() ?? "0",
          receiptNo: receipt.receiptNo ?? "",
          referenceNo: receipt.referenceNo ?? "",
          trnDate: receipt.trnDate ?? new Date(),
          accountDate: receipt.accountDate ?? new Date(),
          currencyId: receipt.currencyId ?? 0,
          currencyCode: receipt.currencyCode ?? null,
          currencyName: receipt.currencyName ?? null,
          exhRate: receipt.exhRate ?? 0,
          ctyExhRate: receipt.ctyExhRate ?? 0,
          paymentTypeId: receipt.paymentTypeId ?? 0,
          paymentTypeCode: receipt.paymentTypeCode ?? null,
          paymentTypeName: receipt.paymentTypeName ?? null,
          bankId: receipt.bankId ?? 0,
          bankCode: receipt.bankCode ?? null,
          bankName: receipt.bankName ?? null,
          chequeNo: receipt.chequeNo ?? null,
          chequeDate: receipt.chequeDate ?? new Date(),
          bankChgGLId: receipt.bankChgGLId ?? 0,
          bankChgAmt: receipt.bankChgAmt ?? 0,
          bankChgLocalAmt: receipt.bankChgLocalAmt ?? 0,
          totAmt: receipt.totAmt ?? 0,
          totLocalAmt: receipt.totLocalAmt ?? 0,
          totCtyAmt: receipt.totCtyAmt ?? 0,
          gstClaimDate: receipt.gstClaimDate ?? new Date(),
          gstAmt: receipt.gstAmt ?? 0,
          gstLocalAmt: receipt.gstLocalAmt ?? 0,
          gstCtyAmt: receipt.gstCtyAmt ?? 0,
          totAmtAftGst: receipt.totAmtAftGst ?? 0,
          totLocalAmtAftGst: receipt.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: receipt.totCtyAmtAftGst ?? 0,
          remarks: receipt.remarks ?? "",
          payeeTo: receipt.payeeTo ?? "",
          moduleFrom: receipt.moduleFrom ?? "",
          editVersion: receipt.editVersion ?? 0,
          data_details:
            receipt.data_details?.map((detail) => ({
              ...detail,
              receiptId: detail.receiptId?.toString() ?? "0",
              receiptNo: detail.receiptNo ?? "",
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              remarks: detail.remarks ?? "",
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
  } = useGetWithDates<ICbGenReceiptHd>(
    `${CbReceipt.get}`,
    TableName.cbGenReceipt,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize receipt data to prevent unnecessary re-renders
  const receiptsData = useMemo(
    () => (receiptsResponse as ApiResponse<ICbGenReceiptHd>)?.data ?? [],
    [receiptsResponse]
  )

  // Mutations
  const saveMutation = usePersist<CbGenReceiptHdSchemaType>(`${CbReceipt.add}`)
  const updateMutation = usePersist<CbGenReceiptHdSchemaType>(
    `${CbReceipt.add}`
  )
  const deleteMutation = useDelete(`${CbReceipt.delete}`)

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
        form.getValues() as unknown as ICbGenReceiptHd
      )

      // Validate the form data using the schema
      const validationResult = cbGenReceiptHdSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)
        toast.error("Please check form data and try again")
        return
      }

      //check totamt and totlocalamt should not be zero
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
            receiptData as unknown as ICbGenReceiptHd
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
      const clonedReceipt: CbGenReceiptHdSchemaType = {
        ...receipt,
        receiptId: "0",
        receiptNo: "",
        // Reset amounts for new receipt
        totAmt: 0,
        totLocalAmt: 0,
        totCtyAmt: 0,
        gstAmt: 0,
        gstLocalAmt: 0,
        gstCtyAmt: 0,
        totAmtAftGst: 0,
        totLocalAmtAftGst: 0,
        totCtyAmtAftGst: 0,
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

  // Helper function to transform ICbGenReceiptHd to CbGenReceiptHdSchemaType
  const transformToSchemaType = (
    apiReceipt: ICbGenReceiptHd
  ): CbGenReceiptHdSchemaType => {
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
      currencyId: apiReceipt.currencyId ?? 0,
      currencyCode: apiReceipt.currencyCode ?? null,
      currencyName: apiReceipt.currencyName ?? null,
      exhRate: apiReceipt.exhRate ?? 0,
      ctyExhRate: apiReceipt.ctyExhRate ?? 0,
      paymentTypeId: apiReceipt.paymentTypeId ?? 0,
      paymentTypeCode: apiReceipt.paymentTypeCode ?? null,
      paymentTypeName: apiReceipt.paymentTypeName ?? null,
      bankId: apiReceipt.bankId ?? 0,
      bankCode: apiReceipt.bankCode ?? null,
      bankName: apiReceipt.bankName ?? null,
      chequeNo: apiReceipt.chequeNo ?? null,
      chequeDate: apiReceipt.chequeDate
        ? format(
            parseDate(apiReceipt.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankChgGLId: apiReceipt.bankChgGLId ?? 0,
      bankChgAmt: apiReceipt.bankChgAmt ?? 0,
      bankChgLocalAmt: apiReceipt.bankChgLocalAmt ?? 0,
      totAmt: apiReceipt.totAmt ?? 0,
      totLocalAmt: apiReceipt.totLocalAmt ?? 0,
      totCtyAmt: apiReceipt.totCtyAmt ?? 0,
      gstClaimDate: apiReceipt.gstClaimDate
        ? format(
            parseDate(apiReceipt.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstAmt: apiReceipt.gstAmt ?? 0,
      gstLocalAmt: apiReceipt.gstLocalAmt ?? 0,
      gstCtyAmt: apiReceipt.gstCtyAmt ?? 0,
      totAmtAftGst: apiReceipt.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiReceipt.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiReceipt.totCtyAmtAftGst ?? 0,
      remarks: apiReceipt.remarks ?? "",
      payeeTo: apiReceipt.payeeTo ?? "",
      moduleFrom: apiReceipt.moduleFrom ?? "",
      createById: apiReceipt.createById ?? 0,
      createBy: apiReceipt.createBy ?? "",
      editById: apiReceipt.editById ?? null,
      editBy: apiReceipt.editBy ?? "",
      cancelById: apiReceipt.cancelById ?? 0,
      cancelBy: apiReceipt.cancelBy ?? "",
      createDate: apiReceipt.createDate
        ? parseDate(apiReceipt.createDate as string) || new Date()
        : new Date(),
      editDate: apiReceipt.editDate
        ? parseDate(apiReceipt.editDate as unknown as string) || null
        : null,
      cancelDate: apiReceipt.cancelDate
        ? parseDate(apiReceipt.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiReceipt.cancelRemarks ?? null,
      editVersion: apiReceipt.editVersion ?? 0,
      isPost: apiReceipt.isPost ?? false,
      postById: apiReceipt.postById ?? null,
      postDate: apiReceipt.postDate
        ? parseDate(apiReceipt.postDate as unknown as string) || null
        : null,
      appStatusId: apiReceipt.appStatusId ?? null,
      appById: apiReceipt.appById ?? null,
      appDate: apiReceipt.appDate
        ? parseDate(apiReceipt.appDate as unknown as string) || null
        : null,
      data_details:
        apiReceipt.data_details?.map(
          (detail) =>
            ({
              ...detail,
              receiptId: detail.receiptId?.toString() ?? "0",
              receiptNo: detail.receiptNo ?? "",
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
            }) as unknown as CbGenReceiptDtSchemaType
        ) || [],
    }
  }

  const handleReceiptSelect = async (
    selectedReceipt: ICbGenReceiptHd | undefined
  ) => {
    if (!selectedReceipt) return

    setIsSelectingReceipt(true)

    try {
      // Fetch receipt details directly using selected receipt's values
      const response = await getById(
        `${CbReceipt.getByIdNo}/${selectedReceipt.receiptId}/${selectedReceipt.receiptNo}`
      )

      if (response?.result === 1) {
        const detailedReceipt = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedReceipt) {
          const updatedReceipt = transformToSchemaType(detailedReceipt)
          setReceipt(updatedReceipt)
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

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbGenReceiptFilter) => {
    setFilters(newFilters)
  }

  // Refetch receipts when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchReceipts()
    }
  }, [filters, showListDialog, refetchReceipts])

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

  const handleReceiptSearch = async (value: string) => {
    if (!value) return

    setIsLoadingReceipt(true)

    try {
      const response = await getById(`${CbReceipt.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedReceipt = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedReceipt) {
          const updatedReceipt = transformToSchemaType(detailedReceipt)
          setReceipt(updatedReceipt)
          form.reset(updatedReceipt)
          form.trigger()

          // Show success message
          toast.success(`Receipt ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch receipt details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for receipt")
    } finally {
      setIsLoadingReceipt(false)
    }
  }

  // Determine mode and receipt ID from URL
  const receiptNo = form.getValues("receiptNo")
  const isEdit = Boolean(receiptNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Gen Receipt (Edit) - ${receiptNo}`
    : "CB Gen Receipt (New)"

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
              disabled={!receipt || receipt.receiptId === "0"}
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
              disabled={!receipt || receipt.receiptId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!receipt || receipt.receiptId === "0"}
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
              handleSaveReceipt()
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
                  CB Gen Receipt List
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
