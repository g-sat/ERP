"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { IGLContraFilter, IGLContraHd } from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { GLContraHdSchemaType, glcontraHdSchema } from "@/schemas/gl-arapcontra"
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
import { GlContra } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { GLTransactionId, ModuleId } from "@/lib/utils"
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

import { defaultContra } from "./components/arapcontra-defaultvalues"
import ContraTable from "./components/arapcontra-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function GLContraPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.gl
  const transactionId = GLTransactionId.arapcontra

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingContra, setIsLoadingContra] = useState(false)
  const [isSelectingContra, setIsSelectingContra] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [contra, setContra] = useState<GLContraHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IGLContraFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "contraNo",
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
  const form = useForm<GLContraHdSchemaType>({
    resolver: zodResolver(glcontraHdSchema(required, visible)),
    defaultValues: {
      ...defaultContra,
    },
  })

  // Data fetching moved to ArapcontraTable component for better performance

  // Mutations
  const saveMutation = usePersist<GLContraHdSchemaType>(`${GlContra.add}`)
  const updateMutation = usePersist<GLContraHdSchemaType>(`${GlContra.add}`)
  const deleteMutation = useDelete(`${GlContra.delete}`)

  // Helper function to transform IGLContraHd to GLContraHdSchemaType
  const transformToSchemaType = (
    apiContra: IGLContraHd
  ): GLContraHdSchemaType => {
    return {
      contraId: apiContra.contraId?.toString() ?? "0",
      contraNo: apiContra.contraNo ?? "",
      referenceNo: apiContra.referenceNo ?? "",
      trnDate: apiContra.trnDate
        ? format(
            parseDate(apiContra.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiContra.accountDate
        ? format(
            parseDate(apiContra.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      supplierId: apiContra.supplierId ?? 0,
      customerId: apiContra.customerId ?? 0,
      currencyId: apiContra.currencyId ?? 0,
      exhRate: apiContra.exhRate ?? 0,
      remarks: apiContra.remarks ?? "",
      totAmt: apiContra.totAmt ?? 0,
      totLocalAmt: apiContra.totLocalAmt ?? 0,
      exhGainLoss: apiContra.exhGainLoss ?? 0,
      moduleFrom: apiContra.moduleFrom ?? "",
      createById: apiContra.createById ?? 0,
      createDate: apiContra.createDate
        ? format(
            parseDate(apiContra.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      editVer: apiContra.editVer ?? 0,
      editById: apiContra.editById ?? 0,
      editDate: apiContra.editDate
        ? format(
            parseDate(apiContra.editDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      editVersion: apiContra.editVersion ?? 0,
      isCancel: apiContra.isCancel ?? false,
      cancelById: apiContra.cancelById ?? 0,
      cancelDate: apiContra.cancelDate
        ? format(
            parseDate(apiContra.cancelDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiContra.cancelRemarks ?? "",
      isPost: apiContra.isPost ?? false,
      postById: apiContra.postById ?? 0,
      postDate: apiContra.postDate
        ? format(
            parseDate(apiContra.postDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      appStatusId: apiContra.appStatusId ?? 0,
      appById: apiContra.appById ?? 0,
      appDate: apiContra.appDate
        ? format(
            parseDate(apiContra.appDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      data_details:
        apiContra.data_details?.map((detail) => ({
          companyId: detail.companyId ?? 0,
          contraId: detail.contraId ?? 0,
          contraNo: detail.contraNo ?? "",
          itemNo: detail.itemNo ?? 0,
          moduleId: detail.moduleId ?? 0,
          transactionId: detail.transactionId ?? 0,
          documentId: detail.documentId ?? 0,
          documentNo: detail.documentNo ?? "",
          docCurrencyId: detail.docCurrencyId ?? 0,
          docExhRate: detail.docExhRate ?? 0,
          referenceNo: detail.referenceNo ?? "",
          docAccountDate: detail.docAccountDate
            ? format(
                parseDate(detail.docAccountDate as string) || new Date(),
                clientDateFormat
              )
            : "",
          docDueDate: detail.docDueDate
            ? format(
                parseDate(detail.docDueDate as string) || new Date(),
                clientDateFormat
              )
            : "",
          docTotAmt: detail.docTotAmt ?? 0,
          docTotLocalAmt: detail.docTotLocalAmt ?? 0,
          docBalAmt: detail.docBalAmt ?? 0,
          docBalLocalAmt: detail.docBalLocalAmt ?? 0,
          allocAmt: detail.allocAmt ?? 0,
          allocLocalAmt: detail.allocLocalAmt ?? 0,
          docAllocAmt: detail.docAllocAmt ?? 0,
          docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
          centDiff: detail.centDiff ?? 0,
          exhGainLoss: detail.exhGainLoss ?? 0,
          editVersion: detail.editVersion ?? 0,
        })) || [],
    }
  }

  // Handle Save
  const handleSaveContra = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IGLContraHd
      )

      // Validate the form data using the schema
      const validationResult = glcontraHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof GlArapContraHdSchemaType
          form.setError(fieldPath, {
            type: "validation",
            message: error.message,
          })
        })

        toast.error("Please check form data and try again")
        return
      }

      const response =
        Number(formValues.contraId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const contraData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (contraData) {
          const updatedSchemaType = transformToSchemaType(
            contraData as unknown as IGLContraHd
          )
          setIsSelectingContra(true)
          setContra(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Data refresh handled by ContraTable component
      } else {
        toast.error(response.message || "Failed to save contra")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving contra")
    } finally {
      setIsSaving(false)
      setIsSelectingContra(false)
    }
  }

  // Handle Delete
  const handleDeleteContra = async () => {
    if (!contra) return

    try {
      const response = await deleteMutation.mutateAsync(
        contra.contraId?.toString() ?? ""
      )
      if (response.result === 1) {
        setContra(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultContra,
          data_details: [],
        })
        // Data refresh handled by ContraTable component
      } else {
        toast.error(response.message || "Failed to delete contra")
      }
    } catch {
      toast.error("Network error while deleting contra")
    }
  }

  // Handle Reset
  const handleReset = () => {
    setContra(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultContra,
      data_details: [],
    })
    setShowResetConfirm(false)
    setActiveTab("main")
    toast.success("Contra reset successfully")
  }

  // Handle Clone
  const handleClone = () => {
    if (contra) {
      // Create a proper clone with form values
      const clonedContra: GLContraHdSchemaType = {
        ...contra,
        contraId: "0",
        contraNo: "",
        // Reset amounts for new contra
        totAmt: 0,
        totLocalAmt: 0,
        exhGainLoss: 0,
        // Reset data details
        data_details: [],
      }
      setContra(clonedContra)
      form.reset(clonedContra)
      setShowCloneConfirm(false)
      toast.success("Contra cloned successfully")
    }
  }

  // Handle contra selection from list
  const handleContraSelect = async (
    selectedContra: IGLContraHd | undefined
  ) => {
    if (!selectedContra) return

    setIsSelectingContra(true)

    try {
      // Fetch contra details directly using selected contra's values
      const response = await getById(
        `${GlContra.getByIdNo}/${selectedContra.contraId}/${selectedContra.contraNo}`
      )

      if (response?.result === 1) {
        const detailedContra = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedContra) {
          const updatedContra = transformToSchemaType(detailedContra)

          setContra(updatedContra)
          form.reset(updatedContra)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(`Contra ${selectedContra.contraNo} loaded successfully`)
        }
      } else {
        toast.error(response?.message || "Failed to fetch contra details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching contra details:", error)
      toast.error("Error loading contra. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingContra(false)
    }
  }

  // Handle search by contra number
  const handleContraSearch = async (value: string) => {
    if (!value) return

    setIsLoadingContra(true)

    try {
      const response = await getById(`${GlContra.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedContra = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedContra) {
          const updatedContra = transformToSchemaType(detailedContra)

          setContra(updatedContra)
          form.reset(updatedContra)
          form.trigger()

          // Show success message
          toast.success(`Contra ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(response?.message || "Failed to fetch contra details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching contra details:", error)
      toast.error("Error loading contra. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsLoadingContra(false)
    }
  }

  // Handle filter change
  const handleFilterChange = (newFilters: IGLContraFilter) => {
    setFilters(newFilters)
  }

  // Data refresh handled by ContraTable component

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

  // Determine mode and contra ID from form
  const contraNo = form.getValues("contraNo")
  const isEdit = Boolean(contraNo)

  // Compose title text
  const titleText = isEdit ? `Contra (Edit) - ${contraNo}` : "Contra (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading contra form...</p>
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
            <TabsTrigger value="history" disabled={!isEdit}>
              History
            </TabsTrigger>
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
              placeholder="Search Contra No"
              className="h-8 text-sm"
              readOnly={!!contra?.contraId && contra.contraId !== "0"}
              disabled={!!contra?.contraId && contra.contraId !== "0"}
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
              disabled={!contra || contra.contraId === "0"}
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
              disabled={!contra || contra.contraId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!contra || contra.contraId === "0"}
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
              handleSaveContra()
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
            // Data refresh handled by ContraTable component
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
                  Contra List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing contra entries from the list below.
                  Use search to filter records or create new entries.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isSelectingContra ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingContra
                    ? "Loading contra details..."
                    : "Loading contra list..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingContra
                    ? "Please wait while we fetch the complete contra data"
                    : "Please wait while we fetch the contra list"}
                </p>
              </div>
            </div>
          ) : (
            <ContraTable
              onArapcontraSelect={handleContraSelect}
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
        onConfirm={handleSaveContra}
        itemName={contra?.contraNo || "New Contra"}
        operationType={
          contra?.contraId && contra.contraId !== "0" ? "update" : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteContra}
        itemName={contra?.contraNo}
        title="Delete Contra"
        description="This action cannot be undone. All contra details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleContraSearch(searchNo)}
        code={searchNo}
        typeLabel="Contra"
        showDetails={false}
        description={`Do you want to load Contra ${searchNo}?`}
        isLoading={isLoadingContra}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleReset}
        itemName={contra?.contraNo}
        title="Reset Contra"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleClone}
        itemName={contra?.contraNo}
        title="Clone Contra"
        description="This will create a copy as a new contra."
      />
    </div>
  )
}
