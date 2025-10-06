"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IGLContraDt,
  IGLContraFilter,
  IGLContraHd,
} from "@/interfaces/gl-arapcontra"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { defaultContra } from "./components/contra-defaultvalues"
import ContraTable from "./components/contra-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function ContraPage() {
  const [showListDialog, setShowListDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState({
    save: false,
    reset: false,
    clone: false,
    delete: false,
    load: false,
  })
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
    pageSize: 10,
  })

  const moduleId = 26 // GL Contra module
  const transactionId = 1

  const { data: visibleFieldsData } = useGetVisibleFields(
    moduleId,
    transactionId
  )
  const { data: visibleFields } = visibleFieldsData ?? {}

  const { data: requiredFieldsData } = useGetRequiredFields(
    moduleId,
    transactionId
  )
  const { data: requiredFields } = requiredFieldsData ?? {}

  // Use nullish coalescing to handle fallback values
  const visible: IVisibleFields = visibleFields ?? null
  const required: IMandatoryFields = requiredFields ?? null

  // Add form state management
  const form = useForm<GLContraHdSchemaType>({
    resolver: zodResolver(glcontraHdSchema(required, visible)),
    defaultValues: contra
      ? {
          contraId: contra.contraId?.toString() ?? "0",
          contraNo: contra.contraNo ?? "",
          referenceNo: contra.referenceNo ?? "",
          trnDate: contra.trnDate ?? new Date(),
          accountDate: contra.accountDate ?? new Date(),
          supplierId: contra.supplierId ?? 0,
          customerId: contra.customerId ?? 0,
          currencyId: contra.currencyId ?? 0,
          exhRate: contra.exhRate ?? 0,
          remarks: contra.remarks ?? "",
          totAmt: contra.totAmt ?? 0,
          totLocalAmt: contra.totLocalAmt ?? 0,
          exhGainLoss: contra.exhGainLoss ?? 0,
          moduleFrom: contra.moduleFrom ?? "",
          createById: contra.createById ?? 0,
          createDate: contra.createDate ?? new Date(),
          editVer: contra.editVer ?? 0,
          editById: contra.editById ?? null,
          editDate: contra.editDate ?? null,
          editVersion: contra.editVersion ?? 0,
          isCancel: contra.isCancel ?? false,
          cancelById: contra.cancelById ?? null,
          cancelDate: contra.cancelDate ?? null,
          cancelRemarks: contra.cancelRemarks ?? null,
          isPost: contra.isPost ?? null,
          postById: contra.postById ?? null,
          postDate: contra.postDate ?? null,
          appStatusId: contra.appStatusId ?? null,
          appById: contra.appById ?? null,
          appDate: contra.appDate ?? null,
          data_details:
            contra.data_details?.map((detail) => ({
              ...detail,
              contraId: detail.contraId?.toString() ?? "0",
              contraNo: detail.contraNo ?? "",
              itemNo: detail.itemNo ?? 0,
              moduleId: detail.moduleId ?? 0,
              transactionId: detail.transactionId ?? 0,
              documentId: detail.documentId ?? 0,
              documentNo: detail.documentNo ?? "",
              docCurrencyId: detail.docCurrencyId ?? 0,
              docExhRate: detail.docExhRate ?? 0,
              referenceNo: detail.referenceNo ?? "",
              docAccountDate: detail.docAccountDate ?? new Date(),
              docDueDate: detail.docDueDate ?? new Date(),
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
      : {
          ...defaultContra,
        },
  })

  // API hooks for contra
  const {
    data: contraResponse,
    refetch: refetchContra,
    isLoading: isLoadingContra,
    isRefetching: isRefetchingContra,
  } = useGetWithDates<IGLContraHd>(
    `${GlContra.get}`,
    "glContraHd",
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString()
  )

  const { data: contraData } = (contraResponse as ApiResponse<IGLContraHd>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Mutations
  const saveMutation = usePersist<GLContraHdSchemaType>(`${GlContra.add}`)
  const updateMutation = usePersist<GLContraHdSchemaType>(`${GlContra.add}`)
  const deleteMutation = useDelete(`${GlContra.delete}`)

  const handleConfirmation = async (action: string) => {
    setShowConfirmDialog((prev) => ({ ...prev, [action]: false }))

    switch (action) {
      case "save":
        try {
          // Get form values and validate them
          const formValues = transformToSchemaType(
            form.getValues() as unknown as IGLContraHd
          )

          // Validate the form data using the schema
          const validationResult = glcontraHdSchema(
            required,
            visible
          ).safeParse(formValues)

          if (!validationResult.success) {
            console.error("Form validation failed:", validationResult.error)
            toast.error("Please check form data and try again")
            return
          }

          console.log("formValues to save", formValues)

          const response =
            Number(formValues.contraId) === 0
              ? await saveMutation.mutateAsync(formValues)
              : await updateMutation.mutateAsync(formValues)

          if (response.result === 1) {
            const contraData = Array.isArray(response.data)
              ? response.data[0]
              : response.data

            // Transform API response back to form values if needed
            if (contraData) {
              const updatedSchemaType = transformToSchemaType(
                contraData as unknown as IGLContraHd
              )
              setContra(updatedSchemaType)
            }

            toast.success("Contra saved successfully")
            refetchContra()
          } else {
            toast.error(response.message || "Failed to save contra")
          }
        } catch (error) {
          console.error("Save error:", error)
          toast.error("Network error while saving contra")
        }
        break
      case "reset":
        handleContraReset()
        break
      case "clone":
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
          toast.success("Contra cloned successfully")
        }
        break
      case "delete":
        handleContraDelete()
        break
    }
  }

  const handleContraDelete = async () => {
    if (!contra) return

    try {
      const response = await deleteMutation.mutateAsync(
        contra.contraId?.toString() ?? ""
      )
      if (response.result === 1) {
        setContra(null)
        toast.success("Contra deleted successfully")
        refetchContra()
      } else {
        toast.error(response.message || "Failed to delete contra")
      }
    } catch {
      toast.error("Network error while deleting contra")
    }

    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  const handleContraReset = () => {
    setContra(null)
    form.reset({
      ...defaultContra,
      data_details: [],
    })
    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

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
        : clientDateFormat,
      editVer: apiContra.editVer ?? 0,
      editById: apiContra.editById ?? null,
      editDate: apiContra.editDate
        ? format(
            parseDate(apiContra.editDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      editVersion: apiContra.editVersion ?? 0,
      isCancel: apiContra.isCancel ?? false,
      cancelById: apiContra.cancelById ?? null,
      cancelDate: apiContra.cancelDate
        ? format(
            parseDate(apiContra.cancelDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      cancelRemarks: apiContra.cancelRemarks ?? null,
      isPost: apiContra.isPost ?? null,
      postById: apiContra.postById ?? null,
      postDate: apiContra.postDate
        ? format(
            parseDate(apiContra.postDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      appStatusId: apiContra.appStatusId ?? null,
      appById: apiContra.appById ?? null,
      appDate: apiContra.appDate
        ? format(
            parseDate(apiContra.appDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      data_details:
        apiContra.data_details?.map((detail) => ({
          ...detail,
          contraId: detail.contraId?.toString() ?? "0",
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
            : clientDateFormat,
          docDueDate: detail.docDueDate
            ? format(
                parseDate(detail.docDueDate as string) || new Date(),
                clientDateFormat
              )
            : clientDateFormat,
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

  const handleContraSelect = async (
    selectedContra: IGLContraHd | undefined
  ) => {
    if (selectedContra) {
      // Transform API data to form values
      const formValues = transformToSchemaType(selectedContra)
      setContra(formValues)

      try {
        // Fetch contra details directly using selected contra's values
        const response = await getById(
          `${GlContra.getByIdNo}/${selectedContra.contraId}/${selectedContra.contraNo}`
        )
        console.log("API Response (direct):", response)

        if (response?.result === 1) {
          const detailedContra = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (detailedContra) {
            // Parse dates properly
            const updatedContra = {
              ...detailedContra,
              trnDate: format(
                parseDate(detailedContra.trnDate as string) || new Date(),
                clientDateFormat
              ),
              accountDate: format(
                parseDate(detailedContra.accountDate as string) || new Date(),
                clientDateFormat
              ),
              data_details:
                detailedContra.data_details?.map((detail: IGLContraDt) => ({
                  ...detail,
                  contraId: detail.contraId?.toString() ?? "0",
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
                        parseDate(detail.docAccountDate as string) ||
                          new Date(),
                        clientDateFormat
                      )
                    : clientDateFormat,
                  docDueDate: detail.docDueDate
                    ? format(
                        parseDate(detail.docDueDate as string) || new Date(),
                        clientDateFormat
                      )
                    : clientDateFormat,
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

            setContra(transformToSchemaType(updatedContra))
            form.reset(updatedContra)
            form.trigger()
            console.log("Form values after reset:", form.getValues())
          }
        } else {
          toast.error(
            response?.message || "Failed to fetch contra details (direct)"
          )
        }
      } catch (error) {
        console.error("Error fetching contra details (direct):", error)
        toast.error("Error fetching contra details (direct)")
      }

      setShowListDialog(false)
    }
  }

  // Remove direct refetchContra from handleFilterChange
  const handleFilterChange = (newFilters: IGLContraFilter) => {
    setFilters(newFilters)
  }

  // Add useEffect to refetch contra when filters change
  useEffect(() => {
    refetchContra()
  }, [filters, refetchContra])

  const handleContraSearch = async (value: string) => {
    if (!value) return

    try {
      const response = await getById(`${GlContra.getByIdNo}/0/${value}`)
      console.log("API Response (direct):", response)

      if (response?.result === 1) {
        const detailedContra = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedContra) {
          // Parse dates properly
          const updatedContra = {
            ...detailedContra,
            trnDate: format(
              parseDate(detailedContra.trnDate as string) || new Date(),
              clientDateFormat
            ),
            accountDate: format(
              parseDate(detailedContra.accountDate as string) || new Date(),
              clientDateFormat
            ),
            data_details:
              detailedContra.data_details?.map((detail: IGLContraDt) => ({
                ...detail,
                contraId: detail.contraId?.toString() ?? "0",
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
                  : clientDateFormat,
                docDueDate: detail.docDueDate
                  ? format(
                      parseDate(detail.docDueDate as string) || new Date(),
                      clientDateFormat
                    )
                  : clientDateFormat,
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

          setContra(transformToSchemaType(updatedContra))
          form.reset(updatedContra)
          form.trigger()
          console.log("Form values after reset:", form.getValues())

          // Show success message
          toast.success(`Contra ${value} loaded successfully`)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch contra details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for contra")
    }

    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  // Determine mode and contra ID from URL
  const contraNo = form.getValues("contraNo")
  const isEdit = Boolean(contraNo)

  // Compose title text
  const titleText = isEdit
    ? `AR/AP Contra (Edit) - ${contraNo}`
    : "AR/AP Contra (New)"

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
                  setShowConfirmDialog({ ...showConfirmDialog, load: true })
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
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, save: true })
              }
              //disabled={!form.getValues("data_details")?.length}
            >
              <Save className="mr-1 h-4 w-4" />
              Save
            </Button>

            <Button variant="outline" size="sm" disabled={!contra}>
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, reset: true })
              }
              disabled={!form.getValues("data_details")?.length}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, clone: true })
              }
              disabled={!contra}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, delete: true })
              }
              disabled={!contra}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <TabsContent value="main">
          <Main
            form={form}
            onSuccessAction={handleConfirmation}
            isEdit={isEdit}
            visible={visible}
          />
        </TabsContent>

        <TabsContent value="other">
          <Other form={form} />
        </TabsContent>

        <TabsContent value="history">
          <History
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>
      </Tabs>

      {/* List Dialog */}
      <Dialog
        open={showListDialog}
        onOpenChange={(open) => {
          setShowListDialog(open)
          if (open) {
            refetchContra()
          }
        }}
      >
        <DialogContent
          className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              AR/AP Contra List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing contra entries from the list below. Use
              search to filter records or create new contra entries.
            </p>
          </DialogHeader>
          <ContraTable
            data={contraData || []}
            isLoading={isLoadingContra || isRefetchingContra}
            onContraSelect={handleContraSelect}
            onRefresh={() => refetchContra()}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={Object.values(showConfirmDialog).some(Boolean)}
        onOpenChange={() =>
          setShowConfirmDialog({
            save: false,
            reset: false,
            clone: false,
            delete: false,
            load: false,
          })
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {showConfirmDialog.save && "Save Contra"}
              {showConfirmDialog.reset && "Reset Contra"}
              {showConfirmDialog.clone && "Clone Contra"}
              {showConfirmDialog.delete && "Delete Contra"}
              {showConfirmDialog.load && "Load Contra"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <h3 className="mb-4 text-lg font-medium">
              {showConfirmDialog.save && "Do you want to save changes?"}
              {showConfirmDialog.reset && "Do you want to reset all fields?"}
              {showConfirmDialog.clone && "Do you want to clone this contra?"}
              {showConfirmDialog.delete && "Do you want to delete this contra?"}
              {showConfirmDialog.load && "Do you want to load this contra?"}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setShowConfirmDialog({
                    save: false,
                    reset: false,
                    clone: false,
                    delete: false,
                    load: false,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showConfirmDialog.save) handleConfirmation("save")
                  if (showConfirmDialog.reset) handleConfirmation("reset")
                  if (showConfirmDialog.clone) handleConfirmation("clone")
                  if (showConfirmDialog.delete) handleConfirmation("delete")
                  if (showConfirmDialog.load) handleContraSearch(searchNo)
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
