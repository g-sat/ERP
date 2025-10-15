"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { IGLJournalFilter, IGLJournalHd } from "@/interfaces/gl-journalentry"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  GLJournalDtSchemaType,
  GLJournalHdSchema,
  GLJournalHdSchemaType,
} from "@/schemas/gl-journalentry"
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
import { GlJournal } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { GLTransactionId, ModuleId, TableName } from "@/lib/utils"
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

import History from "./components/history"
import { defaultJournal } from "./components/journalentry-defaultvalues"
import JournalTable from "./components/journalentry-table"
import Main from "./components/main-tab"

export default function JournalEntryPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.gl
  const transactionId = GLTransactionId.journalentry

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingJournal, setIsLoadingJournal] = useState(false)
  const [isSelectingJournal, setIsSelectingJournal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [journal, setJournal] = useState<GLJournalHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IGLJournalFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "journalNo",
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
  const form = useForm<GLJournalHdSchemaType>({
    resolver: zodResolver(GLJournalHdSchema(required, visible)),
    defaultValues: journal
      ? {
          journalId: journal.journalId?.toString() ?? "0",
          journalNo: journal.journalNo ?? "",
          referenceNo: journal.referenceNo ?? "",
          trnDate: journal.trnDate ?? new Date(),
          accountDate: journal.accountDate ?? new Date(),
          currencyId: journal.currencyId ?? 0,
          exhRate: journal.exhRate ?? 0,
          ctyExhRate: journal.ctyExhRate ?? 0,
          totAmt: journal.totAmt ?? 0,
          totLocalAmt: journal.totLocalAmt ?? 0,
          totCtyAmt: journal.totCtyAmt ?? 0,
          gstClaimDate: journal.gstClaimDate ?? new Date(),
          gstAmt: journal.gstAmt ?? 0,
          gstLocalAmt: journal.gstLocalAmt ?? 0,
          gstCtyAmt: journal.gstCtyAmt ?? 0,
          totAmtAftGst: journal.totAmtAftGst ?? 0,
          totLocalAmtAftGst: journal.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: journal.totCtyAmtAftGst ?? 0,
          remarks: journal.remarks ?? "",
          isReverse: journal.isReverse ?? false,
          isRecurrency: journal.isRecurrency ?? false,
          revDate: journal.revDate ?? new Date(),
          recurrenceUntil: journal.recurrenceUntil ?? new Date(),
          moduleFrom: journal.moduleFrom ?? "",
          editVersion: journal.editVersion ?? 0,
          data_details:
            journal.data_details?.map((detail) => ({
              ...detail,
              journalId: detail.journalId?.toString() ?? "0",
              journalNo: detail.journalNo ?? "",
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
          ...defaultJournal,
        },
  })

  // API hooks for journals - Only fetch when List dialog is opened (optimized)
  const {
    data: journalsResponse,
    refetch: refetchJournals,
    isLoading: isLoadingJournals,
    isRefetching: isRefetchingJournals,
  } = useGetWithDates<IGLJournalHd>(
    `${GlJournal.get}`,
    TableName.journalEntry,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize journal data to prevent unnecessary re-renders
  const journalsData = useMemo(
    () => (journalsResponse as ApiResponse<IGLJournalHd>)?.data ?? [],
    [journalsResponse]
  )

  // Mutations
  const saveMutation = usePersist<GLJournalHdSchemaType>(`${GlJournal.add}`)
  const updateMutation = usePersist<GLJournalHdSchemaType>(`${GlJournal.add}`)
  const deleteMutation = useDelete(`${GlJournal.delete}`)

  // Handle Save
  const handleSaveJournal = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IGLJournalHd
      )

      // Validate the form data using the schema
      const validationResult = GLJournalHdSchema(required, visible).safeParse(
        formValues
      )

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

      //check in details sum of isdebit=true should be equal to sum of isdebit=false
      const totalDebit = formValues.data_details
        .filter((detail) => detail.isDebit)
        .reduce((acc, detail) => acc + detail.totAmt, 0)
      const totalCredit = formValues.data_details
        .filter((detail) => !detail.isDebit)
        .reduce((acc, detail) => acc + detail.totAmt, 0)

      if (totalDebit !== totalCredit) {
        toast.error("Total Debit and Total Credit should be equal")
        return
      }

      console.log(formValues)

      const response =
        Number(formValues.journalId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const journalData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (journalData) {
          const updatedSchemaType = transformToSchemaType(
            journalData as unknown as IGLJournalHd
          )
          setIsSelectingJournal(true)
          setJournal(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        refetchJournals()
      } else {
        toast.error(response.message || "Failed to save journal entry")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving journal entry")
    } finally {
      setIsSaving(false)
      setIsSelectingJournal(false)
    }
  }

  // Handle Clone
  const handleCloneJournal = () => {
    if (journal) {
      // Create a proper clone with form values
      const clonedJournal: GLJournalHdSchemaType = {
        ...journal,
        journalId: "0",
        journalNo: "",
        // Reset amounts for new journal
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
      setJournal(clonedJournal)
      form.reset(clonedJournal)
      toast.success("Journal entry cloned successfully")
    }
  }

  // Handle Delete
  const handleJournalDelete = async () => {
    if (!journal) return

    try {
      const response = await deleteMutation.mutateAsync(
        journal.journalId?.toString() ?? ""
      )
      if (response.result === 1) {
        setJournal(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultJournal,
          data_details: [],
        })
        refetchJournals()
      } else {
        toast.error(response.message || "Failed to delete journal entry")
      }
    } catch {
      toast.error("Network error while deleting journal entry")
    }
  }

  // Handle Reset
  const handleJournalReset = () => {
    setJournal(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultJournal,
      data_details: [],
    })
    toast.success("Journal entry reset successfully")
  }

  // Helper function to transform IGLJournalHd to GLJournalHdSchemaType
  const transformToSchemaType = (
    apiJournal: IGLJournalHd
  ): GLJournalHdSchemaType => {
    return {
      journalId: apiJournal.journalId?.toString() ?? "0",
      journalNo: apiJournal.journalNo ?? "",
      referenceNo: apiJournal.referenceNo ?? "",
      trnDate: apiJournal.trnDate
        ? format(
            parseDate(apiJournal.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiJournal.accountDate
        ? format(
            parseDate(apiJournal.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      currencyId: apiJournal.currencyId ?? 0,
      exhRate: apiJournal.exhRate ?? 0,
      ctyExhRate: apiJournal.ctyExhRate ?? 0,
      totAmt: apiJournal.totAmt ?? 0,
      totLocalAmt: apiJournal.totLocalAmt ?? 0,
      totCtyAmt: apiJournal.totCtyAmt ?? 0,
      gstClaimDate: apiJournal.gstClaimDate
        ? format(
            parseDate(apiJournal.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstAmt: apiJournal.gstAmt ?? 0,
      gstLocalAmt: apiJournal.gstLocalAmt ?? 0,
      gstCtyAmt: apiJournal.gstCtyAmt ?? 0,
      totAmtAftGst: apiJournal.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiJournal.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiJournal.totCtyAmtAftGst ?? 0,
      remarks: apiJournal.remarks ?? "",
      isReverse: apiJournal.isReverse ?? false,
      isRecurrency: apiJournal.isRecurrency ?? false,
      revDate: apiJournal.revDate
        ? format(
            parseDate(apiJournal.revDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      recurrenceUntil: apiJournal.recurrenceUntil
        ? format(
            parseDate(apiJournal.recurrenceUntil as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      moduleFrom: apiJournal.moduleFrom ?? "",
      createBy: apiJournal.createBy ?? "",
      editBy: apiJournal.editBy ?? "",
      cancelBy: apiJournal.cancelBy ?? "",
      postBy: apiJournal.postBy ?? "",
      appBy: apiJournal.appBy ?? "",
      createDate: apiJournal.createDate
        ? parseDate(apiJournal.createDate as string) || new Date()
        : new Date(),
      editDate: apiJournal.editDate
        ? parseDate(apiJournal.editDate as unknown as string) || null
        : null,
      cancelDate: apiJournal.cancelDate
        ? parseDate(apiJournal.cancelDate as unknown as string) || null
        : null,
      cancelRemarks: apiJournal.cancelRemarks ?? null,
      editVersion: apiJournal.editVersion ?? 0,
      isPost: apiJournal.isPost ?? false,
      postDate: apiJournal.postDate
        ? parseDate(apiJournal.postDate as unknown as string) || null
        : null,
      appStatusId: apiJournal.appStatusId ?? null,
      appById: apiJournal.appById ?? null,
      appDate: apiJournal.appDate
        ? parseDate(apiJournal.appDate as unknown as string) || null
        : null,
      data_details:
        apiJournal.data_details?.map(
          (detail) =>
            ({
              ...detail,
              journalId: detail.journalId?.toString() ?? "0",
              journalNo: detail.journalNo ?? "",
              itemNo: detail.itemNo ?? 0,
              seqNo: detail.seqNo ?? 0,
              glId: detail.glId ?? 0,
              glCode: detail.glCode ?? "",
              glName: detail.glName ?? "",
              remarks: detail.remarks ?? "",
              productId: detail.productId ?? 0,
              productCode: detail.productCode ?? "",
              productName: detail.productName ?? "",
              isDebit: detail.isDebit ?? false,
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
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
              jobOrderId: detail.jobOrderId ?? 0,
              jobOrderNo: detail.jobOrderNo ?? "",
              taskId: detail.taskId ?? 0,
              taskName: detail.taskName ?? "",
              serviceId: detail.serviceId ?? 0,
              serviceName: detail.serviceName ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as GLJournalDtSchemaType
        ) || [],
    }
  }

  const handleJournalSelect = async (
    selectedJournal: IGLJournalHd | undefined
  ) => {
    if (!selectedJournal) return

    setIsSelectingJournal(true)

    try {
      // Fetch journal details directly using selected journal's values
      const response = await getById(
        `${GlJournal.getByIdNo}/${selectedJournal.journalId}/${selectedJournal.journalNo}`
      )

      if (response?.result === 1) {
        const detailedJournal = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedJournal) {
          const updatedJournal = transformToSchemaType(detailedJournal)
          setJournal(updatedJournal)
          form.reset(updatedJournal)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Journal Entry ${selectedJournal.journalNo} loaded successfully`
          )
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch journal entry details"
        )
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching journal entry details:", error)
      toast.error("Error loading journal entry. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingJournal(false)
    }
  }

  // Handle filter changes
  const handleFilterChange = (newFilters: IGLJournalFilter) => {
    setFilters(newFilters)
  }

  // Refetch journals when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchJournals()
    }
  }, [filters, showListDialog, refetchJournals])

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

  const handleJournalSearch = async (value: string) => {
    if (!value) return

    setIsLoadingJournal(true)

    try {
      const response = await getById(`${GlJournal.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedJournal = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedJournal) {
          const updatedJournal = transformToSchemaType(detailedJournal)
          setJournal(updatedJournal)
          form.reset(updatedJournal)
          form.trigger()

          // Show success message
          toast.success(`Journal Entry ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch journal entry details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for journal entry")
    } finally {
      setIsLoadingJournal(false)
    }
  }

  // Determine mode and journal ID from URL
  const journalNo = form.getValues("journalNo")
  const isEdit = Boolean(journalNo)

  // Compose title text
  const titleText = isEdit
    ? `GL Journal Entry (Edit) - ${journalNo}`
    : "GL Journal Entry (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading journal entry form...
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
              placeholder="Search Journal No"
              className="h-8 text-sm"
              readOnly={!!journal?.journalId && journal.journalId !== "0"}
              disabled={!!journal?.journalId && journal.journalId !== "0"}
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
              disabled={!journal || journal.journalId === "0"}
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
              disabled={!journal || journal.journalId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!journal || journal.journalId === "0"}
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
              handleSaveJournal()
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
            refetchJournals()
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
                  GL Journal Entry List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing journal entries from the list
                  below. Use search to filter records or create new journal
                  entries.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingJournals || isRefetchingJournals || isSelectingJournal ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingJournal
                    ? "Loading journal entry details..."
                    : "Loading journal entries..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingJournal
                    ? "Please wait while we fetch the complete journal entry data"
                    : "Please wait while we fetch the journal entry list"}
                </p>
              </div>
            </div>
          ) : (
            <JournalTable
              data={journalsData || []}
              isLoading={false}
              onJournalSelect={handleJournalSelect}
              onRefresh={() => refetchJournals()}
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
        onConfirm={handleSaveJournal}
        itemName={journal?.journalNo || "New Journal Entry"}
        operationType={
          journal?.journalId && journal.journalId !== "0" ? "update" : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleJournalDelete}
        itemName={journal?.journalNo}
        title="Delete Journal Entry"
        description="This action cannot be undone. All journal entry details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleJournalSearch(searchNo)}
        code={searchNo}
        typeLabel="Journal Entry"
        showDetails={false}
        description={`Do you want to load Journal Entry ${searchNo}?`}
        isLoading={isLoadingJournal}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleJournalReset}
        itemName={journal?.journalNo}
        title="Reset Journal Entry"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneJournal}
        itemName={journal?.journalNo}
        title="Clone Journal Entry"
        description="This will create a copy as a new journal entry."
      />
    </div>
  )
}
