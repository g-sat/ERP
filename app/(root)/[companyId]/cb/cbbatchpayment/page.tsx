"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ICbBatchPaymentFilter, ICbBatchPaymentHd } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbBatchPaymentDtSchemaType,
  CbBatchPaymentHdSchemaType,
  cbBatchPaymentHdSchema,
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
import { CbBatchPayment } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { CBTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, usePersist } from "@/hooks/use-common"
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

import { defaultBatchPayment } from "./components/cbbatchpayment-defaultvalues"
import BatchPaymentTable from "./components/cbbatchpayment-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function BatchPaymentPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbbatchpayment

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isSearchingBatchPayment, setIsSearchingBatchPayment] = useState(false)
  const [isSelectingBatchPayment, setIsSelectingBatchPayment] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [batchPayment, setBatchPayment] =
    useState<CbBatchPaymentHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbBatchPaymentFilter>({
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
  const form = useForm<CbBatchPaymentHdSchemaType>({
    resolver: zodResolver(cbBatchPaymentHdSchema(required, visible)),
    defaultValues: batchPayment
      ? {
          paymentId: batchPayment.paymentId?.toString() ?? "0",
          paymentNo: batchPayment.paymentNo ?? "",
          referenceNo: batchPayment.referenceNo ?? "",
          trnDate: batchPayment.trnDate ?? new Date(),
          accountDate: batchPayment.accountDate ?? new Date(),
          currencyId: batchPayment.currencyId ?? 0,
          exhRate: batchPayment.exhRate ?? 0,
          ctyExhRate: batchPayment.ctyExhRate ?? 0,
          bankId: batchPayment.bankId ?? 0,
          totAmt: batchPayment.totAmt ?? 0,
          totLocalAmt: batchPayment.totLocalAmt ?? 0,
          totCtyAmt: batchPayment.totCtyAmt ?? 0,
          gstClaimDate: batchPayment.gstClaimDate ?? new Date(),
          gstAmt: batchPayment.gstAmt ?? 0,
          gstLocalAmt: batchPayment.gstLocalAmt ?? 0,
          gstCtyAmt: batchPayment.gstCtyAmt ?? 0,
          totAmtAftGst: batchPayment.totAmtAftGst ?? 0,
          totLocalAmtAftGst: batchPayment.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: batchPayment.totCtyAmtAftGst ?? 0,
          remarks: batchPayment.remarks ?? "",
          moduleFrom: batchPayment.moduleFrom ?? "",
          editVersion: batchPayment.editVersion ?? 0,
          data_details:
            batchPayment.data_details?.map((detail) => ({
              ...detail,
              paymentId: detail.paymentId?.toString() ?? "0",
              paymentNo: detail.paymentNo ?? "",
              invoiceDate: detail.invoiceDate ?? new Date(),
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
          ...defaultBatchPayment,
        },
  })

  // Data fetching moved to BatchPaymentTable component for better performance

  // Mutations
  const saveMutation = usePersist<CbBatchPaymentHdSchemaType>(
    `${CbBatchPayment.add}`
  )
  const updateMutation = usePersist<CbBatchPaymentHdSchemaType>(
    `${CbBatchPayment.add}`
  )
  const deleteMutation = useDelete(`${CbBatchPayment.delete}`)

  // Handle Save
  const handleSaveBatchPayment = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as ICbBatchPaymentHd
      )

      // Validate the form data using the schema
      const validationResult = cbBatchPaymentHdSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof CbBatchPaymentHdSchemaType
          form.setError(fieldPath, {
            type: "validation",
            message: error.message,
          })
        })

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
        const batchPaymentData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (batchPaymentData) {
          const updatedSchemaType = transformToSchemaType(
            batchPaymentData as unknown as ICbBatchPaymentHd
          )
          setIsSelectingBatchPayment(true)
          setBatchPayment(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Data refresh handled by BatchPaymentTable component
      } else {
        toast.error(response.message || "Failed to save Batch Payment")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving Batch Payment")
    } finally {
      setIsSaving(false)
      setIsSelectingBatchPayment(false)
    }
  }

  // Handle Clone
  const handleCloneBatchPayment = () => {
    if (batchPayment) {
      // Create a proper clone with form values
      const clonedBatchPayment: CbBatchPaymentHdSchemaType = {
        ...batchPayment,
        paymentId: "0",
        paymentNo: "",
        // Reset amounts for new Batch Payment
        totAmt: 0,
        totLocalAmt: 0,
        totCtyAmt: 0,
        gstAmt: 0,
        gstLocalAmt: 0,
        gstCtyAmt: 0,
        totAmtAftGst: 0,
        totLocalAmtAftGst: 0,
        totCtyAmtAftGst: 0,
        // Reset data details
        data_details: [],
      }
      setBatchPayment(clonedBatchPayment)
      form.reset(clonedBatchPayment)
      toast.success("Batch Payment cloned successfully")
    }
  }

  // Handle Delete
  const handleBatchPaymentDelete = async () => {
    if (!batchPayment) return

    try {
      const response = await deleteMutation.mutateAsync(
        batchPayment.paymentId?.toString() ?? ""
      )
      if (response.result === 1) {
        setBatchPayment(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultBatchPayment,
          data_details: [],
        })
        // Data refresh handled by BatchPaymentTable component
      } else {
        toast.error(response.message || "Failed to delete Batch Payment")
      }
    } catch {
      toast.error("Network error while deleting Batch Payment")
    }
  }

  // Handle Reset
  const handleBatchPaymentReset = () => {
    setBatchPayment(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultBatchPayment,
      data_details: [],
    })
    toast.success("Batch Payment reset successfully")
  }

  // Helper function to transform ICbBatchPaymentHd to CbBatchPaymentHdSchemaType
  const transformToSchemaType = (
    apiBatchPayment: ICbBatchPaymentHd
  ): CbBatchPaymentHdSchemaType => {
    return {
      paymentId: apiBatchPayment.paymentId?.toString() ?? "0",
      paymentNo: apiBatchPayment.paymentNo ?? "",
      referenceNo: apiBatchPayment.referenceNo ?? "",
      trnDate: apiBatchPayment.trnDate
        ? format(
            parseDate(apiBatchPayment.trnDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      accountDate: apiBatchPayment.accountDate
        ? format(
            parseDate(apiBatchPayment.accountDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      currencyId: apiBatchPayment.currencyId ?? 0,
      exhRate: apiBatchPayment.exhRate ?? 0,
      ctyExhRate: apiBatchPayment.ctyExhRate ?? 0,
      bankId: apiBatchPayment.bankId ?? 0,
      totAmt: apiBatchPayment.totAmt ?? 0,
      totLocalAmt: apiBatchPayment.totLocalAmt ?? 0,
      totCtyAmt: apiBatchPayment.totCtyAmt ?? 0,
      gstClaimDate: apiBatchPayment.gstClaimDate
        ? format(
            parseDate(apiBatchPayment.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      gstAmt: apiBatchPayment.gstAmt ?? 0,
      gstLocalAmt: apiBatchPayment.gstLocalAmt ?? 0,
      gstCtyAmt: apiBatchPayment.gstCtyAmt ?? 0,
      totAmtAftGst: apiBatchPayment.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiBatchPayment.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiBatchPayment.totCtyAmtAftGst ?? 0,
      remarks: apiBatchPayment.remarks ?? "",
      moduleFrom: apiBatchPayment.moduleFrom ?? "",
      createBy: apiBatchPayment.createBy ?? "",
      editBy: apiBatchPayment.editBy ?? "",
      cancelBy: apiBatchPayment.cancelBy ?? "",
      createDate: apiBatchPayment.createDate
        ? parseDate(apiBatchPayment.createDate as string) || new Date()
        : new Date(),
      editDate: apiBatchPayment.editDate
        ? parseDate(apiBatchPayment.editDate as unknown as string) || null
        : null,
      cancelDate: apiBatchPayment.cancelDate
        ? parseDate(apiBatchPayment.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiBatchPayment.cancelRemarks ?? null,
      editVersion: apiBatchPayment.editVersion ?? 0,
      isPost: apiBatchPayment.isPost ?? false,
      postDate: apiBatchPayment.postDate
        ? parseDate(apiBatchPayment.postDate as unknown as string) || null
        : null,
      appStatusId: apiBatchPayment.appStatusId ?? null,
      appById: apiBatchPayment.appById ?? null,
      appDate: apiBatchPayment.appDate
        ? parseDate(apiBatchPayment.appDate as unknown as string) || null
        : null,
      data_details:
        apiBatchPayment.data_details?.map(
          (detail) =>
            ({
              ...detail,
              paymentId: detail.paymentId?.toString() ?? "0",
              paymentNo: detail.paymentNo ?? "",
              itemNo: detail.itemNo ?? 0,
              seqNo: detail.seqNo ?? 0,
              invoiceDate: detail.invoiceDate
                ? format(
                    parseDate(detail.invoiceDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              invoiceNo: detail.invoiceNo ?? "",
              supplierName: detail.supplierName ?? "",
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
            }) as unknown as CbBatchPaymentDtSchemaType
        ) || [],
    }
  }

  const handleBatchPaymentSelect = async (
    selectedBatchPayment: ICbBatchPaymentHd | undefined
  ) => {
    if (!selectedBatchPayment) return

    setIsSelectingBatchPayment(true)

    try {
      // Fetch Batch Payment details directly using selected Batch Payment's values
      const response = await getById(
        `${CbBatchPayment.getByIdNo}/${selectedBatchPayment.paymentId}/${selectedBatchPayment.paymentNo}`
      )

      if (response?.result === 1) {
        const detailedBatchPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBatchPayment) {
          const updatedBatchPayment =
            transformToSchemaType(detailedBatchPayment)
          setBatchPayment(updatedBatchPayment)
          form.reset(updatedBatchPayment)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Batch Payment ${selectedBatchPayment.paymentNo} loaded successfully`
          )
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch Batch Payment details"
        )
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching Batch Payment details:", error)
      toast.error("Error loading Batch Payment. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingBatchPayment(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbBatchPaymentFilter) => {
    setFilters(newFilters)
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

  const handleBatchPaymentSearch = async (value: string) => {
    if (!value) return

    setIsSearchingBatchPayment(true)

    try {
      const response = await getById(`${CbBatchPayment.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedBatchPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedBatchPayment) {
          const updatedBatchPayment =
            transformToSchemaType(detailedBatchPayment)
          setBatchPayment(updatedBatchPayment)
          form.reset(updatedBatchPayment)
          form.trigger()

          // Show success message
          toast.success(`Batch Payment ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch Batch Payment details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for Batch Payment")
    } finally {
      setIsSearchingBatchPayment(false)
    }
  }

  // Determine mode and batch payment ID from URL
  const paymentNo = form.getValues("paymentNo")
  const isEdit = Boolean(paymentNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Batch Payment (Edit) - ${paymentNo}`
    : "CB Batch Payment (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading Batch Payment form...
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
              placeholder="Search Batch Payment No"
              className="h-8 text-sm"
              readOnly={
                !!batchPayment?.paymentId && batchPayment.paymentId !== "0"
              }
              disabled={
                !!batchPayment?.paymentId && batchPayment.paymentId !== "0"
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
              disabled={!batchPayment || batchPayment.paymentId === "0"}
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
              disabled={!batchPayment || batchPayment.paymentId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !batchPayment ||
                batchPayment.paymentId === "0" ||
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
              handleSaveBatchPayment()
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
            // Data refresh handled by BatchPaymentTable component
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
                  CB Batch Payment List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing Batch Payments from the list below.
                  Use search to filter records or create new Batch Payments.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isSelectingBatchPayment ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingBatchPayment
                    ? "Loading Batch Payment details..."
                    : "Loading Batch Payments..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingBatchPayment
                    ? "Please wait while we fetch the complete Batch Payment data"
                    : "Please wait while we fetch the Batch Payment list"}
                </p>
              </div>
            </div>
          ) : (
            <BatchPaymentTable
              onBatchPaymentSelect={handleBatchPaymentSelect}
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
        onConfirm={handleSaveBatchPayment}
        itemName={batchPayment?.paymentNo || "New Batch Payment"}
        operationType={
          batchPayment?.paymentId && batchPayment.paymentId !== "0"
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
        onConfirm={handleBatchPaymentDelete}
        itemName={batchPayment?.paymentNo}
        title="Delete Batch Payment"
        description="This action cannot be undone. All batch payment details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleBatchPaymentSearch(searchNo)}
        code={searchNo}
        typeLabel="Batch Payment"
        showDetails={false}
        description={`Do you want to load Batch Payment ${searchNo}?`}
        isLoading={isSearchingBatchPayment}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleBatchPaymentReset}
        itemName={batchPayment?.paymentNo}
        title="Reset Batch Payment"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneBatchPayment}
        itemName={batchPayment?.paymentNo}
        title="Clone Batch Payment"
        description="This will create a copy as a new batch payment."
      />
    </div>
  )
}
