"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ICbPettyCashFilter, ICbPettyCashHd } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbPettyCashDtSchemaType,
  CbPettyCashHdSchemaType,
  cbPettyCashHdSchema,
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
import { CbPettyCash } from "@/lib/api-routes"
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

import { defaultPettyCash } from "./components/cbpettycash-defaultvalues"
import PettyCashTable from "./components/cbpettycash-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function PettyCashPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.cb
  const transactionId = CBTransactionId.cbpettycash

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingPettyCash, setIsLoadingPettyCash] = useState(false)
  const [isSelectingPettyCash, setIsSelectingPettyCash] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pettyCash, setPettyCash] = useState<CbPettyCashHdSchemaType | null>(
    null
  )
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<ICbPettyCashFilter>({
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
  const form = useForm<CbPettyCashHdSchemaType>({
    resolver: zodResolver(cbPettyCashHdSchema(required, visible)),
    defaultValues: pettyCash
      ? {
          paymentId: pettyCash.paymentId?.toString() ?? "0",
          paymentNo: pettyCash.paymentNo ?? "",
          referenceNo: pettyCash.referenceNo ?? "",
          trnDate: pettyCash.trnDate ?? new Date(),
          accountDate: pettyCash.accountDate ?? new Date(),
          currencyId: pettyCash.currencyId ?? 0,
          exhRate: pettyCash.exhRate ?? 0,
          ctyExhRate: pettyCash.ctyExhRate ?? 0,
          paymentTypeId: pettyCash.paymentTypeId ?? 0,
          bankId: pettyCash.bankId ?? 0,
          chequeNo: pettyCash.chequeNo ?? "",
          chequeDate: pettyCash.chequeDate ?? "",
          bankChgGLId: pettyCash.bankChgGLId ?? 0,
          bankChgAmt: pettyCash.bankChgAmt ?? 0,
          bankChgLocalAmt: pettyCash.bankChgLocalAmt ?? 0,
          totAmt: pettyCash.totAmt ?? 0,
          totLocalAmt: pettyCash.totLocalAmt ?? 0,
          totCtyAmt: pettyCash.totCtyAmt ?? 0,
          gstClaimDate: pettyCash.gstClaimDate ?? new Date(),
          gstAmt: pettyCash.gstAmt ?? 0,
          gstLocalAmt: pettyCash.gstLocalAmt ?? 0,
          gstCtyAmt: pettyCash.gstCtyAmt ?? 0,
          totAmtAftGst: pettyCash.totAmtAftGst ?? 0,
          totLocalAmtAftGst: pettyCash.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: pettyCash.totCtyAmtAftGst ?? 0,
          remarks: pettyCash.remarks ?? "",
          payeeTo: pettyCash.payeeTo ?? "",
          moduleFrom: pettyCash.moduleFrom ?? "",
          editVersion: pettyCash.editVersion ?? 0,
          data_details:
            pettyCash.data_details?.map((detail) => ({
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
          ...defaultPettyCash,
        },
  })

  // Data fetching moved to PettyCashTable component for better performance

  // Mutations
  const saveMutation = usePersist<CbPettyCashHdSchemaType>(`${CbPettyCash.add}`)
  const updateMutation = usePersist<CbPettyCashHdSchemaType>(
    `${CbPettyCash.add}`
  )
  const deleteMutation = useDelete(`${CbPettyCash.delete}`)

  // Handle Save
  const handleSavePettyCash = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as ICbPettyCashHd
      )

      // Set chequeDate to accountDate if it's empty
      if (!formValues.chequeDate || formValues.chequeDate === "") {
        formValues.chequeDate = formValues.accountDate
      }

      // Validate the form data using the schema
      const validationResult = cbPettyCashHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof CbPettyCashHdSchemaType
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
        const pettyCashData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (pettyCashData) {
          const updatedSchemaType = transformToSchemaType(
            pettyCashData as unknown as ICbPettyCashHd
          )
          setIsSelectingPettyCash(true)
          setPettyCash(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Data refresh handled by PettyCashTable component
      } else {
        toast.error(response.message || "Failed to save Petty Cash")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving Petty Cash")
    } finally {
      setIsSaving(false)
      setIsSelectingPettyCash(false)
    }
  }

  // Handle Clone
  const handleClonePettyCash = () => {
    if (pettyCash) {
      // Create a proper clone with form values
      const clonedPettyCash: CbPettyCashHdSchemaType = {
        ...pettyCash,
        paymentId: "0",
        paymentNo: "",
        // Reset amounts for new petty cash
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
      setPettyCash(clonedPettyCash)
      form.reset(clonedPettyCash)
      toast.success("Petty Cash cloned successfully")
    }
  }

  // Handle Delete
  const handlePettyCashDelete = async () => {
    if (!pettyCash) return

    try {
      const response = await deleteMutation.mutateAsync(
        pettyCash.paymentId?.toString() ?? ""
      )
      if (response.result === 1) {
        setPettyCash(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultPettyCash,
          data_details: [],
        })
        // Data refresh handled by PettyCashTable component
      } else {
        toast.error(response.message || "Failed to delete Petty Cash")
      }
    } catch {
      toast.error("Network error while deleting Petty Cash")
    }
  }

  // Handle Reset
  const handlePettyCashReset = () => {
    setPettyCash(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultPettyCash,
      data_details: [],
    })
    toast.success("Petty Cash reset successfully")
  }

  // Helper function to transform ICbPettyCashHd to CbPettyCashHdSchemaType
  const transformToSchemaType = (
    apiPettyCash: ICbPettyCashHd
  ): CbPettyCashHdSchemaType => {
    return {
      paymentId: apiPettyCash.paymentId?.toString() ?? "0",
      paymentNo: apiPettyCash.paymentNo ?? "",
      referenceNo: apiPettyCash.referenceNo ?? "",
      trnDate: apiPettyCash.trnDate
        ? format(
            parseDate(apiPettyCash.trnDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      accountDate: apiPettyCash.accountDate
        ? format(
            parseDate(apiPettyCash.accountDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      currencyId: apiPettyCash.currencyId ?? 0,
      exhRate: apiPettyCash.exhRate ?? 0,
      ctyExhRate: apiPettyCash.ctyExhRate ?? 0,
      paymentTypeId: apiPettyCash.paymentTypeId ?? 0,
      bankId: apiPettyCash.bankId ?? 0,
      chequeNo: apiPettyCash.chequeNo ?? "",
      chequeDate: apiPettyCash.chequeDate
        ? format(
            parseDate(apiPettyCash.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : apiPettyCash.accountDate
          ? format(
              parseDate(apiPettyCash.accountDate as string) || new Date(),
              clientDateFormat
            )
          : format(new Date(), clientDateFormat),
      bankChgGLId: apiPettyCash.bankChgGLId ?? 0,
      bankChgAmt: apiPettyCash.bankChgAmt ?? 0,
      bankChgLocalAmt: apiPettyCash.bankChgLocalAmt ?? 0,
      totAmt: apiPettyCash.totAmt ?? 0,
      totLocalAmt: apiPettyCash.totLocalAmt ?? 0,
      totCtyAmt: apiPettyCash.totCtyAmt ?? 0,
      gstClaimDate: apiPettyCash.gstClaimDate
        ? format(
            parseDate(apiPettyCash.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      gstAmt: apiPettyCash.gstAmt ?? 0,
      gstLocalAmt: apiPettyCash.gstLocalAmt ?? 0,
      gstCtyAmt: apiPettyCash.gstCtyAmt ?? 0,
      totAmtAftGst: apiPettyCash.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiPettyCash.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiPettyCash.totCtyAmtAftGst ?? 0,
      remarks: apiPettyCash.remarks ?? "",
      payeeTo: apiPettyCash.payeeTo ?? "",
      moduleFrom: apiPettyCash.moduleFrom ?? "",
      createBy: apiPettyCash.createBy ?? "",
      editBy: apiPettyCash.editBy ?? "",
      cancelBy: apiPettyCash.cancelBy ?? "",
      createDate: apiPettyCash.createDate
        ? parseDate(apiPettyCash.createDate as string) || new Date()
        : new Date(),
      editDate: apiPettyCash.editDate
        ? parseDate(apiPettyCash.editDate as unknown as string) || null
        : null,
      cancelDate: apiPettyCash.cancelDate
        ? parseDate(apiPettyCash.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiPettyCash.cancelRemarks ?? null,
      editVersion: apiPettyCash.editVersion ?? 0,
      isPost: apiPettyCash.isPost ?? false,
      postDate: apiPettyCash.postDate
        ? parseDate(apiPettyCash.postDate as unknown as string) || null
        : null,
      appStatusId: apiPettyCash.appStatusId ?? null,
      appById: apiPettyCash.appById ?? null,
      appDate: apiPettyCash.appDate
        ? parseDate(apiPettyCash.appDate as unknown as string) || null
        : null,
      data_details:
        apiPettyCash.data_details?.map(
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
            }) as unknown as CbPettyCashDtSchemaType
        ) || [],
    }
  }

  const handlePettyCashSelect = async (
    selectedPettyCash: ICbPettyCashHd | undefined
  ) => {
    if (!selectedPettyCash) return

    setIsSelectingPettyCash(true)

    try {
      // Fetch petty cash details directly using selected record's values
      const response = await getById(
        `${CbPettyCash.getByIdNo}/${selectedPettyCash.paymentId}/${selectedPettyCash.paymentNo}`
      )

      if (response?.result === 1) {
        const detailedPettyCash = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPettyCash) {
          const updatedPettyCash = transformToSchemaType(detailedPettyCash)
          setPettyCash(updatedPettyCash)
          form.reset(updatedPettyCash)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Petty Cash ${selectedPettyCash.paymentNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch Petty Cash details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching Petty Cash details:", error)
      toast.error("Error loading Petty Cash. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingPettyCash(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: ICbPettyCashFilter) => {
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

  const handlePettyCashSearch = async (value: string) => {
    if (!value) return

    setIsLoadingPettyCash(true)

    try {
      const response = await getById(`${CbPettyCash.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedPettyCash = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPettyCash) {
          const updatedPettyCash = transformToSchemaType(detailedPettyCash)
          setPettyCash(updatedPettyCash)
          form.reset(updatedPettyCash)
          form.trigger()

          // Show success message
          toast.success(`Petty Cash ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch Petty Cash details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for Petty Cash")
    } finally {
      setIsLoadingPettyCash(false)
    }
  }

  // Determine mode and petty cash ID from URL
  const paymentNo = form.getValues("paymentNo")
  const isEdit = Boolean(paymentNo)

  // Compose title text
  const titleText = isEdit
    ? `CB Petty Cash (Edit) - ${paymentNo}`
    : "CB Petty Cash (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading Petty Cash form...
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
              placeholder="Search Petty Cash No"
              className="h-8 text-sm"
              readOnly={!!pettyCash?.paymentId && pettyCash.paymentId !== "0"}
              disabled={!!pettyCash?.paymentId && pettyCash.paymentId !== "0"}
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
              disabled={!pettyCash || pettyCash.paymentId === "0"}
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
              disabled={!pettyCash || pettyCash.paymentId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !pettyCash ||
                pettyCash.paymentId === "0" ||
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
              handleSavePettyCash()
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
            // Data refresh handled by PettyCashTable component
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
                  CB Petty Cash List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing Petty Cash records from the list
                  below. Use search to filter records or create new Petty Cash
                  records.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isSelectingPettyCash ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingPettyCash
                    ? "Loading Petty Cash details..."
                    : "Loading Petty Cash records..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingPettyCash
                    ? "Please wait while we fetch the complete Petty Cash data"
                    : "Please wait while we fetch the Petty Cash list"}
                </p>
              </div>
            </div>
          ) : (
            <PettyCashTable
              onPettyCashSelect={handlePettyCashSelect}
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
        onConfirm={handleSavePettyCash}
        itemName={pettyCash?.paymentNo || "New Petty Cash"}
        operationType={
          pettyCash?.paymentId && pettyCash.paymentId !== "0"
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
        onConfirm={handlePettyCashDelete}
        itemName={pettyCash?.paymentNo}
        title="Delete Petty Cash"
        description="This action cannot be undone. All petty cash details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handlePettyCashSearch(searchNo)}
        code={searchNo}
        typeLabel="Petty Cash"
        showDetails={false}
        description={`Do you want to load Petty Cash ${searchNo}?`}
        isLoading={isLoadingPettyCash}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handlePettyCashReset}
        itemName={pettyCash?.paymentNo}
        title="Reset Petty Cash"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleClonePettyCash}
        itemName={pettyCash?.paymentNo}
        title="Clone Petty Cash"
        description="This will create a copy as a new petty cash record."
      />
    </div>
  )
}
