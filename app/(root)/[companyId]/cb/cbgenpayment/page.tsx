"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICbGenPaymentFilter,
  ICbGenPaymentHd,
} from "@/interfaces/cb-genpayment"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchemaType,
  cbGenPaymentHdSchema,
} from "@/schemas/cb-genpayment"
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
import { CbPayment } from "@/lib/api-routes"
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

import { defaultPayment } from "./components/cbgenpayment-defaultvalues"
import PaymentTable from "./components/cbgenpayment-table"
import History from "./components/history"
import Main from "./components/main-tab"

export default function GenPaymentPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbgenpayment

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isSelectingPayment, setIsSelectingPayment] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [payment, setPayment] = useState<CbGenPaymentHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbGenPaymentFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "paymentNo",
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
  const form = useForm<CbGenPaymentHdSchemaType>({
    resolver: zodResolver(cbGenPaymentHdSchema(required, visible)),
    defaultValues: payment
      ? {
          paymentId: payment.paymentId?.toString() ?? "0",
          paymentNo: payment.paymentNo ?? "",
          referenceNo: payment.referenceNo ?? "",
          trnDate: payment.trnDate ?? new Date(),
          accountDate: payment.accountDate ?? new Date(),
          currencyId: payment.currencyId ?? 0,
          currencyCode: payment.currencyCode ?? null,
          currencyName: payment.currencyName ?? null,
          exhRate: payment.exhRate ?? 0,
          ctyExhRate: payment.ctyExhRate ?? 0,
          paymentTypeId: payment.paymentTypeId ?? 0,
          paymentTypeCode: payment.paymentTypeCode ?? null,
          paymentTypeName: payment.paymentTypeName ?? null,
          bankId: payment.bankId ?? 0,
          bankCode: payment.bankCode ?? null,
          bankName: payment.bankName ?? null,
          chequeNo: payment.chequeNo ?? null,
          chequeDate: payment.chequeDate ?? new Date(),
          bankChgGLId: payment.bankChgGLId ?? 0,
          bankChgAmt: payment.bankChgAmt ?? 0,
          bankChgLocalAmt: payment.bankChgLocalAmt ?? 0,
          totAmt: payment.totAmt ?? 0,
          totLocalAmt: payment.totLocalAmt ?? 0,
          totCtyAmt: payment.totCtyAmt ?? 0,
          gstClaimDate: payment.gstClaimDate ?? new Date(),
          gstAmt: payment.gstAmt ?? 0,
          gstLocalAmt: payment.gstLocalAmt ?? 0,
          gstCtyAmt: payment.gstCtyAmt ?? 0,
          totAmtAftGst: payment.totAmtAftGst ?? 0,
          totLocalAmtAftGst: payment.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: payment.totCtyAmtAftGst ?? 0,
          remarks: payment.remarks ?? "",
          payeeTo: payment.payeeTo ?? "",
          moduleFrom: payment.moduleFrom ?? "",
          editVersion: payment.editVersion ?? 0,
          data_details:
            payment.data_details?.map((detail) => ({
              ...detail,
              paymentId: detail.paymentId?.toString() ?? "0",
              paymentNo: detail.paymentNo ?? "",
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
          ...defaultPayment,
        },
  })

  // API hooks for payments - Only fetch when List dialog is opened (optimized)
  const {
    data: paymentsResponse,
    refetch: refetchPayments,
    isLoading: isLoadingPayments,
    isRefetching: isRefetchingPayments,
  } = useGetWithDates<ICbGenPaymentHd>(
    `${CbPayment.get}`,
    TableName.cbGenPayment,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize payment data to prevent unnecessary re-renders
  const paymentsData = useMemo(
    () => (paymentsResponse as ApiResponse<ICbGenPaymentHd>)?.data ?? [],
    [paymentsResponse]
  )

  // Mutations
  const saveMutation = usePersist<CbGenPaymentHdSchemaType>(`${CbPayment.add}`)
  const updateMutation = usePersist<CbGenPaymentHdSchemaType>(
    `${CbPayment.add}`
  )
  const deleteMutation = useDelete(`${CbPayment.delete}`)

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
        form.getValues() as unknown as ICbGenPaymentHd
      )

      // Validate the form data using the schema
      const validationResult = cbGenPaymentHdSchema(
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
        Number(formValues.paymentId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const paymentData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (paymentData) {
          const updatedSchemaType = transformToSchemaType(
            paymentData as unknown as ICbGenPaymentHd
          )
          setIsSelectingPayment(true)
          setPayment(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchPayments()
      } else {
        toast.error(response.message || "Failed to save payment")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving payment")
    } finally {
      setIsSaving(false)
      setIsSelectingPayment(false)
    }
  }

  // Handle Clone
  const handleClonePayment = () => {
    if (payment) {
      // Create a proper clone with form values
      const clonedPayment: CbGenPaymentHdSchemaType = {
        ...payment,
        paymentId: "0",
        paymentNo: "",
        // Reset amounts for new payment
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
      setPayment(clonedPayment)
      form.reset(clonedPayment)
      toast.success("Payment cloned successfully")
    }
  }

  // Handle Delete
  const handlePaymentDelete = async () => {
    if (!payment) return

    try {
      const response = await deleteMutation.mutateAsync(
        payment.paymentId?.toString() ?? ""
      )
      if (response.result === 1) {
        setPayment(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultPayment,
          data_details: [],
        })
        refetchPayments()
      } else {
        toast.error(response.message || "Failed to delete payment")
      }
    } catch {
      toast.error("Network error while deleting payment")
    }
  }

  // Handle Reset
  const handlePaymentReset = () => {
    setPayment(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultPayment,
      data_details: [],
    })
    toast.success("Payment reset successfully")
  }

  // Helper function to transform ICbGenPaymentHd to CbGenPaymentHdSchemaType
  const transformToSchemaType = (
    apiPayment: ICbGenPaymentHd
  ): CbGenPaymentHdSchemaType => {
    return {
      paymentId: apiPayment.paymentId?.toString() ?? "0",
      paymentNo: apiPayment.paymentNo ?? "",
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
      currencyId: apiPayment.currencyId ?? 0,
      currencyCode: apiPayment.currencyCode ?? null,
      currencyName: apiPayment.currencyName ?? null,
      exhRate: apiPayment.exhRate ?? 0,
      ctyExhRate: apiPayment.ctyExhRate ?? 0,
      paymentTypeId: apiPayment.paymentTypeId ?? 0,
      paymentTypeCode: apiPayment.paymentTypeCode ?? null,
      paymentTypeName: apiPayment.paymentTypeName ?? null,
      bankId: apiPayment.bankId ?? 0,
      bankCode: apiPayment.bankCode ?? null,
      bankName: apiPayment.bankName ?? null,
      chequeNo: apiPayment.chequeNo ?? null,
      chequeDate: apiPayment.chequeDate
        ? format(
            parseDate(apiPayment.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankChgGLId: apiPayment.bankChgGLId ?? 0,
      bankChgAmt: apiPayment.bankChgAmt ?? 0,
      bankChgLocalAmt: apiPayment.bankChgLocalAmt ?? 0,
      totAmt: apiPayment.totAmt ?? 0,
      totLocalAmt: apiPayment.totLocalAmt ?? 0,
      totCtyAmt: apiPayment.totCtyAmt ?? 0,
      gstClaimDate: apiPayment.gstClaimDate
        ? format(
            parseDate(apiPayment.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstAmt: apiPayment.gstAmt ?? 0,
      gstLocalAmt: apiPayment.gstLocalAmt ?? 0,
      gstCtyAmt: apiPayment.gstCtyAmt ?? 0,
      totAmtAftGst: apiPayment.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiPayment.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiPayment.totCtyAmtAftGst ?? 0,
      remarks: apiPayment.remarks ?? "",
      payeeTo: apiPayment.payeeTo ?? "",
      moduleFrom: apiPayment.moduleFrom ?? "",
      createById: apiPayment.createById ?? 0,
      createBy: apiPayment.createBy ?? "",
      editById: apiPayment.editById ?? null,
      editBy: apiPayment.editBy ?? "",
      cancelById: apiPayment.cancelById ?? 0,
      cancelBy: apiPayment.cancelBy ?? "",
      createDate: apiPayment.createDate
        ? parseDate(apiPayment.createDate as string) || new Date()
        : new Date(),
      editDate: apiPayment.editDate
        ? parseDate(apiPayment.editDate as unknown as string) || null
        : null,
      cancelDate: apiPayment.cancelDate
        ? parseDate(apiPayment.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiPayment.cancelRemarks ?? null,
      editVersion: apiPayment.editVersion ?? 0,
      isPost: apiPayment.isPost ?? false,
      postById: apiPayment.postById ?? null,
      postDate: apiPayment.postDate
        ? parseDate(apiPayment.postDate as unknown as string) || null
        : null,
      appStatusId: apiPayment.appStatusId ?? null,
      appById: apiPayment.appById ?? null,
      appDate: apiPayment.appDate
        ? parseDate(apiPayment.appDate as unknown as string) || null
        : null,
      data_details:
        apiPayment.data_details?.map(
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

  const handlePaymentSelect = async (
    selectedPayment: ICbGenPaymentHd | undefined
  ) => {
    if (!selectedPayment) return

    setIsSelectingPayment(true)

    try {
      // Fetch payment details directly using selected payment's values
      const response = await getById(
        `${CbPayment.getByIdNo}/${selectedPayment.paymentId}/${selectedPayment.paymentNo}`
      )

      if (response?.result === 1) {
        const detailedPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPayment) {
          const updatedPayment = transformToSchemaType(detailedPayment)
          setPayment(updatedPayment)
          form.reset(updatedPayment)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Payment ${selectedPayment.paymentNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch payment details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching payment details:", error)
      toast.error("Error loading payment. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingPayment(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbGenPaymentFilter) => {
    setFilters(newFilters)
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

    setIsLoadingPayment(true)

    try {
      const response = await getById(`${CbPayment.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPayment) {
          const updatedPayment = transformToSchemaType(detailedPayment)
          setPayment(updatedPayment)
          form.reset(updatedPayment)
          form.trigger()

          // Show success message
          toast.success(`Payment ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch payment details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for payment")
    } finally {
      setIsLoadingPayment(false)
    }
  }

  // Determine mode and payment ID from URL
  const paymentNo = form.getValues("paymentNo")
  const isEdit = Boolean(paymentNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Gen Payment (Edit) - ${paymentNo}`
    : "CB Gen Payment (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading payment form...</p>
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
              placeholder="Search Payment No"
              className="h-8 text-sm"
              readOnly={!!payment?.paymentId && payment.paymentId !== "0"}
              disabled={!!payment?.paymentId && payment.paymentId !== "0"}
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
              disabled={!payment || payment.paymentId === "0"}
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
              disabled={!payment || payment.paymentId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!payment || payment.paymentId === "0"}
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
              handleSavePayment()
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
                  CB Gen Payment List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing payments from the list below. Use
                  search to filter records or create new payments.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingPayments || isRefetchingPayments || isSelectingPayment ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingPayment
                    ? "Loading payment details..."
                    : "Loading payments..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingPayment
                    ? "Please wait while we fetch the complete payment data"
                    : "Please wait while we fetch the payment list"}
                </p>
              </div>
            </div>
          ) : (
            <PaymentTable
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
        itemName={payment?.paymentNo || "New Payment"}
        operationType={
          payment?.paymentId && payment.paymentId !== "0" ? "update" : "create"
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
        itemName={payment?.paymentNo}
        title="Delete Payment"
        description="This action cannot be undone. All payment details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handlePaymentSearch(searchNo)}
        code={searchNo}
        typeLabel="Payment"
        showDetails={false}
        description={`Do you want to load Payment ${searchNo}?`}
        isLoading={isLoadingPayment}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handlePaymentReset}
        itemName={payment?.paymentNo}
        title="Reset Payment"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleClonePayment}
        itemName={payment?.paymentNo}
        title="Clone Payment"
        description="This will create a copy as a new payment."
      />
    </div>
  )
}
