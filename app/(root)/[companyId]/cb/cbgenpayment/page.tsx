"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ICbGenPaymentFilter, ICbGenPaymentHd } from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchemaType,
  cbGenPaymentHdSchema,
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

import { defaultGenPayment } from "./components/cbgenpayment-defaultvalues"
import GenPaymentTable from "./components/cbgenpayment-table"
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
  const [isLoadingGenPayment, setIsLoadingGenPayment] = useState(false)
  const [isSelectingGenPayment, setIsSelectingGenPayment] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [genPayment, setGenPayment] = useState<CbGenPaymentHdSchemaType | null>(
    null
  )
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
    defaultValues: genPayment
      ? {
          paymentId: genPayment.paymentId?.toString() ?? "0",
          paymentNo: genPayment.paymentNo ?? "",
          referenceNo: genPayment.referenceNo ?? "",
          trnDate: genPayment.trnDate ?? new Date(),
          accountDate: genPayment.accountDate ?? new Date(),
          currencyId: genPayment.currencyId ?? 0,
          exhRate: genPayment.exhRate ?? 0,
          ctyExhRate: genPayment.ctyExhRate ?? 0,
          paymentTypeId: genPayment.paymentTypeId ?? 0,
          bankId: genPayment.bankId ?? 0,
          chequeNo: genPayment.chequeNo ?? "",
          chequeDate: genPayment.chequeDate ?? "",
          bankChgGLId: genPayment.bankChgGLId ?? 0,
          bankChgAmt: genPayment.bankChgAmt ?? 0,
          bankChgLocalAmt: genPayment.bankChgLocalAmt ?? 0,
          totAmt: genPayment.totAmt ?? 0,
          totLocalAmt: genPayment.totLocalAmt ?? 0,
          totCtyAmt: genPayment.totCtyAmt ?? 0,
          gstClaimDate: genPayment.gstClaimDate ?? new Date(),
          gstAmt: genPayment.gstAmt ?? 0,
          gstLocalAmt: genPayment.gstLocalAmt ?? 0,
          gstCtyAmt: genPayment.gstCtyAmt ?? 0,
          totAmtAftGst: genPayment.totAmtAftGst ?? 0,
          totLocalAmtAftGst: genPayment.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: genPayment.totCtyAmtAftGst ?? 0,
          remarks: genPayment.remarks ?? "",
          payeeTo: genPayment.payeeTo ?? "",
          moduleFrom: genPayment.moduleFrom ?? "",
          editVersion: genPayment.editVersion ?? 0,
          data_details:
            genPayment.data_details?.map((detail) => ({
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
          ...defaultGenPayment,
        },
  })

  // API hooks for gen payment records - Only fetch when List dialog is opened (optimized)
  const {
    data: genPaymentsResponse,
    refetch: refetchGenPayments,
    isLoading: isLoadingGenPaymentsList,
    isRefetching: isRefetchingGenPayments,
  } = useGetWithDates<ICbGenPaymentHd>(
    `${CbPayment.get}`,
    TableName.cbGenPayment,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize gen payment data to prevent unnecessary re-renders
  const genPaymentsData = useMemo(
    () => (genPaymentsResponse as ApiResponse<ICbGenPaymentHd>)?.data ?? [],
    [genPaymentsResponse]
  )

  // Mutations
  const saveMutation = usePersist<CbGenPaymentHdSchemaType>(`${CbPayment.add}`)
  const updateMutation = usePersist<CbGenPaymentHdSchemaType>(
    `${CbPayment.add}`
  )
  const deleteMutation = useDelete(`${CbPayment.delete}`)

  // Handle Save
  const handleSaveGenPayment = async () => {
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

      // Set chequeDate to accountDate if it's empty
      if (!formValues.chequeDate || formValues.chequeDate === "") {
        formValues.chequeDate = formValues.accountDate
      }

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

      console.log(formValues)

      const response =
        Number(formValues.paymentId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const genPaymentData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (genPaymentData) {
          const updatedSchemaType = transformToSchemaType(
            genPaymentData as unknown as ICbGenPaymentHd
          )
          setIsSelectingGenPayment(true)
          setGenPayment(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchGenPayments()
      } else {
        toast.error(response.message || "Failed to save Gen Payment")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving Gen Payment")
    } finally {
      setIsSaving(false)
      setIsSelectingGenPayment(false)
    }
  }

  // Handle Clone
  const handleCloneGenPayment = () => {
    if (genPayment) {
      // Create a proper clone with form values
      const clonedGenPayment: CbGenPaymentHdSchemaType = {
        ...genPayment,
        paymentId: "0",
        paymentNo: "",
        // Reset amounts for new gen payment
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
      setGenPayment(clonedGenPayment)
      form.reset(clonedGenPayment)
      toast.success("Gen Payment cloned successfully")
    }
  }

  // Handle Delete
  const handleGenPaymentDelete = async () => {
    if (!genPayment) return

    try {
      const response = await deleteMutation.mutateAsync(
        genPayment.paymentId?.toString() ?? ""
      )
      if (response.result === 1) {
        setGenPayment(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultGenPayment,
          data_details: [],
        })
        refetchGenPayments()
      } else {
        toast.error(response.message || "Failed to delete Gen Payment")
      }
    } catch {
      toast.error("Network error while deleting Gen Payment")
    }
  }

  // Handle Reset
  const handleGenPaymentReset = () => {
    setGenPayment(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultGenPayment,
      data_details: [],
    })
    toast.success("Gen Payment reset successfully")
  }

  // Helper function to transform ICbGenPaymentHd to CbGenPaymentHdSchemaType
  const transformToSchemaType = (
    apiGenPayment: ICbGenPaymentHd
  ): CbGenPaymentHdSchemaType => {
    return {
      paymentId: apiGenPayment.paymentId?.toString() ?? "0",
      paymentNo: apiGenPayment.paymentNo ?? "",
      referenceNo: apiGenPayment.referenceNo ?? "",
      trnDate: apiGenPayment.trnDate
        ? format(
            parseDate(apiGenPayment.trnDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      accountDate: apiGenPayment.accountDate
        ? format(
            parseDate(apiGenPayment.accountDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      currencyId: apiGenPayment.currencyId ?? 0,
      exhRate: apiGenPayment.exhRate ?? 0,
      ctyExhRate: apiGenPayment.ctyExhRate ?? 0,
      paymentTypeId: apiGenPayment.paymentTypeId ?? 0,
      bankId: apiGenPayment.bankId ?? 0,
      chequeNo: apiGenPayment.chequeNo ?? "",
      chequeDate: apiGenPayment.chequeDate
        ? format(
            parseDate(apiGenPayment.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : apiGenPayment.accountDate
          ? format(
              parseDate(apiGenPayment.accountDate as string) || new Date(),
              clientDateFormat
            )
          : format(new Date(), clientDateFormat),
      bankChgGLId: apiGenPayment.bankChgGLId ?? 0,
      bankChgAmt: apiGenPayment.bankChgAmt ?? 0,
      bankChgLocalAmt: apiGenPayment.bankChgLocalAmt ?? 0,
      totAmt: apiGenPayment.totAmt ?? 0,
      totLocalAmt: apiGenPayment.totLocalAmt ?? 0,
      totCtyAmt: apiGenPayment.totCtyAmt ?? 0,
      gstClaimDate: apiGenPayment.gstClaimDate
        ? format(
            parseDate(apiGenPayment.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      gstAmt: apiGenPayment.gstAmt ?? 0,
      gstLocalAmt: apiGenPayment.gstLocalAmt ?? 0,
      gstCtyAmt: apiGenPayment.gstCtyAmt ?? 0,
      totAmtAftGst: apiGenPayment.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiGenPayment.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiGenPayment.totCtyAmtAftGst ?? 0,
      remarks: apiGenPayment.remarks ?? "",
      payeeTo: apiGenPayment.payeeTo ?? "",
      moduleFrom: apiGenPayment.moduleFrom ?? "",
      createBy: apiGenPayment.createBy ?? "",
      editBy: apiGenPayment.editBy ?? "",
      cancelBy: apiGenPayment.cancelBy ?? "",
      createDate: apiGenPayment.createDate
        ? parseDate(apiGenPayment.createDate as string) || new Date()
        : new Date(),
      editDate: apiGenPayment.editDate
        ? parseDate(apiGenPayment.editDate as unknown as string) || null
        : null,
      cancelDate: apiGenPayment.cancelDate
        ? parseDate(apiGenPayment.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiGenPayment.cancelRemarks ?? null,
      editVersion: apiGenPayment.editVersion ?? 0,
      isPost: apiGenPayment.isPost ?? false,
      postDate: apiGenPayment.postDate
        ? parseDate(apiGenPayment.postDate as unknown as string) || null
        : null,
      appStatusId: apiGenPayment.appStatusId ?? null,
      appById: apiGenPayment.appById ?? null,
      appDate: apiGenPayment.appDate
        ? parseDate(apiGenPayment.appDate as unknown as string) || null
        : null,
      data_details:
        apiGenPayment.data_details?.map(
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

  const handleGenPaymentSelect = async (
    selectedGenPayment: ICbGenPaymentHd | undefined
  ) => {
    if (!selectedGenPayment) return

    setIsSelectingGenPayment(true)

    try {
      // Fetch gen payment details directly using selected gen payment's values
      const response = await getById(
        `${CbPayment.getByIdNo}/${selectedGenPayment.paymentId}/${selectedGenPayment.paymentNo}`
      )

      if (response?.result === 1) {
        const detailedGenPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedGenPayment) {
          const updatedGenPayment = transformToSchemaType(detailedGenPayment)
          setGenPayment(updatedGenPayment)
          form.reset(updatedGenPayment)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Gen Payment ${selectedGenPayment.paymentNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch Gen Payment details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching Gen Payment details:", error)
      toast.error("Error loading Gen Payment. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingGenPayment(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbGenPaymentFilter) => {
    setFilters(newFilters)
  }

  // Refetch gen payments when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchGenPayments()
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

  const handleGenPaymentSearch = async (value: string) => {
    if (!value) return

    setIsLoadingGenPayment(true)

    try {
      const response = await getById(`${CbPayment.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedGenPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedGenPayment) {
          const updatedGenPayment = transformToSchemaType(detailedGenPayment)
          setGenPayment(updatedGenPayment)
          form.reset(updatedGenPayment)
          form.trigger()

          // Show success message
          toast.success(`Gen Payment ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch Gen Payment details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for Gen Payment")
    } finally {
      setIsLoadingGenPayment(false)
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
          <p className="mt-4 text-sm text-gray-600">
            Loading Gen Payment form...
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
              placeholder="Search Gen Payment No"
              className="h-8 text-sm"
              readOnly={!!genPayment?.paymentId && genPayment.paymentId !== "0"}
              disabled={!!genPayment?.paymentId && genPayment.paymentId !== "0"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={isLoadingGenPayments || isRefetchingGenPayments}
            >
              {isLoadingGenPayments || isRefetchingGenPayments ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <ListFilter className="mr-1 h-4 w-4" />
              )}
              {isLoadingGenPayments || isRefetchingGenPayments
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
              disabled={!genPayment || genPayment.paymentId === "0"}
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
              disabled={!genPayment || genPayment.paymentId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !genPayment ||
                genPayment.paymentId === "0" ||
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
              handleSaveGenPayment()
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
            refetchGenPayments()
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
                  Manage and select existing Gen Payments from the list below.
                  Use search to filter records or create new Gen Payments.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingGenPaymentsList ||
          isRefetchingGenPayments ||
          isSelectingGenPayment ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingGenPayment
                    ? "Loading Gen Payment details..."
                    : "Loading Gen Payments..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingGenPayment
                    ? "Please wait while we fetch the complete Gen Payment data"
                    : "Please wait while we fetch the Gen Payment list"}
                </p>
              </div>
            </div>
          ) : (
            <GenPaymentTable
              data={genPaymentsData || []}
              isLoading={false}
              onGenPaymentSelect={handleGenPaymentSelect}
              onRefresh={() => refetchGenPayments()}
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
        onConfirm={handleSaveGenPayment}
        itemName={genPayment?.paymentNo || "New Gen Payment"}
        operationType={
          genPayment?.paymentId && genPayment.paymentId !== "0"
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
        onConfirm={handleGenPaymentDelete}
        itemName={genPayment?.paymentNo}
        title="Delete Gen Payment"
        description="This action cannot be undone. All gen payment details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleGenPaymentSearch(searchNo)}
        code={searchNo}
        typeLabel="Gen Payment"
        showDetails={false}
        description={`Do you want to load Gen Payment ${searchNo}?`}
        isLoading={isLoadingGenPayment}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleGenPaymentReset}
        itemName={genPayment?.paymentNo}
        title="Reset Gen Payment"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneGenPayment}
        itemName={genPayment?.paymentNo}
        title="Clone Gen Payment"
        description="This will create a copy as a new gen payment record."
      />
    </div>
  )
}
