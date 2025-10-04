"use client"

import { useCallback, useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICurrency,
  ICurrencyDt,
  ICurrencyFilter,
  ICurrencyLocalDt,
} from "@/interfaces/currency"
import {
  CurrencyDtSchemaType,
  CurrencyLocalDtSchemaType,
  CurrencySchemaType,
} from "@/schemas/currency"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import { Currency } from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteConfirmation } from "@/components/confirmation/delete-confirmation"
import { LoadConfirmation } from "@/components/confirmation/load-confirmation"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"

import { CurrencyForm } from "./components/currency-form"
import { CurrenciesTable } from "./components/currency-table"
import { CurrencyDtForm } from "./components/currencydt-form"
import { CurrencyDtsTable } from "./components/currencydt-table"
import { CurrencyLocalDtForm } from "./components/currencylocaldt-form"
import { CurrencyLocalDtsTable } from "./components/currencylocaldt-table"

const MODULE_ID = ModuleId.master
const TRANSACTION_ID = MasterTransactionId.currency
const TRANSACTION_ID_DT = MasterTransactionId.currencyDt
const TRANSACTION_ID_LOCAL_DT = MasterTransactionId.currencyLocalDt

export default function CurrencyPage() {
  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(MODULE_ID, TRANSACTION_ID, "isCreate")
  const canEdit = hasPermission(MODULE_ID, TRANSACTION_ID, "isEdit")
  const canDelete = hasPermission(MODULE_ID, TRANSACTION_ID, "isDelete")
  const canView = hasPermission(MODULE_ID, TRANSACTION_ID, "isRead")
  const canCreateDt = hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isCreate")
  const canEditDt = hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isEdit")
  const canDeleteDt = hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isDelete")
  const canViewDt = hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isRead")
  const canCreateLocalDt = hasPermission(
    MODULE_ID,
    TRANSACTION_ID_LOCAL_DT,
    "isCreate"
  )
  const canEditLocalDt = hasPermission(
    MODULE_ID,
    TRANSACTION_ID_LOCAL_DT,
    "isEdit"
  )
  const canDeleteLocalDt = hasPermission(
    MODULE_ID,
    TRANSACTION_ID_LOCAL_DT,
    "isDelete"
  )
  const canViewLocalDt = hasPermission(
    MODULE_ID,
    TRANSACTION_ID_LOCAL_DT,
    "isRead"
  )

  // State for filters
  const [filters, setFilters] = useState<ICurrencyFilter>({})
  const [dtFilters, setDtFilters] = useState<ICurrencyFilter>({})
  const [localDtFilters, setLocalDtFilters] = useState<ICurrencyFilter>({})

  // Data fetching
  const {
    data: currenciesResponse,
    refetch: refetchCurrency,
    isLoading: isLoadingCurrency,
  } = useGet<ICurrency>(`${Currency.get}`, "currencies", filters.search)

  const {
    data: currencyDtResponse,
    refetch: refetchCurrencyDt,
    isLoading: isLoadingCurrencyDt,
  } = useGet<ICurrencyDt>(`${Currency.getDt}`, "currencyDt", dtFilters.search)

  const {
    data: currencyLocalDtResponse,
    refetch: refetchCurrencyLocalDt,
    isLoading: isLoadingCurrencyLocalDt,
  } = useGet<ICurrencyLocalDt>(
    `${Currency.getLocalDt}`,
    "currencyLocalDt",
    localDtFilters.search
  )

  // Extract data from responses with fallback values
  const { result: currenciesResult, data: currenciesData } =
    (currenciesResponse as ApiResponse<ICurrency>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: currencyDtResult, data: currencyDtData } =
    (currencyDtResponse as ApiResponse<ICurrencyDt>) ?? {
      result: 0,
      message: "",
      data: [],
    }
  const { result: currencyLocalDtResult, data: currencyLocalDtData } =
    (currencyLocalDtResponse as ApiResponse<ICurrencyLocalDt>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<CurrencySchemaType>(`${Currency.add}`)
  const updateMutation = usePersist<CurrencySchemaType>(`${Currency.add}`)
  const deleteMutation = useDelete(`${Currency.delete}`)

  const saveDtMutation = usePersist<CurrencyDtSchemaType>(`${Currency.addDt}`)
  const updateDtMutation = usePersist<CurrencyDtSchemaType>(`${Currency.addDt}`)
  const deleteDtMutation = useDelete(`${Currency.deleteDt}`)

  const saveLocalDtMutation = usePersist<CurrencyLocalDtSchemaType>(
    `${Currency.addLocalDt}`
  )
  const updateLocalDtMutation = usePersist<CurrencyLocalDtSchemaType>(
    `${Currency.addLocalDt}`
  )
  const deleteLocalDtMutation = useDelete(`${Currency.deleteLocalDt}`)

  // State management
  const [selectedCurrency, setSelectedCurrency] = useState<
    ICurrency | undefined
  >()
  const [selectedCurrencyDt, setSelectedCurrencyDt] = useState<
    ICurrencyDt | undefined
  >()
  const [selectedCurrencyLocalDt, setSelectedCurrencyLocalDt] = useState<
    ICurrencyLocalDt | undefined
  >()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDtModalOpen, setIsDtModalOpen] = useState(false)
  const [isLocalDtModalOpen, setIsLocalDtModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "currency" as "currency" | "currencydt" | "currencylocaldt",
  })

  // Duplicate detection states
  const [showLoadDialogCurrency, setShowLoadDialogCurrency] = useState(false)
  const [existingCurrency, setExistingCurrency] = useState<ICurrency | null>(
    null
  )

  // Refetch when filters change
  useEffect(() => {
    if (filters.search !== undefined) refetchCurrency()
  }, [filters.search, refetchCurrency])

  useEffect(() => {
    if (dtFilters.search !== undefined) refetchCurrencyDt()
  }, [dtFilters.search, refetchCurrencyDt])

  useEffect(() => {
    if (localDtFilters.search !== undefined) refetchCurrencyLocalDt()
  }, [localDtFilters.search, refetchCurrencyLocalDt])

  // Action handlers
  const handleCreateCurrency = () => {
    setModalMode("create")
    setSelectedCurrency(undefined)
    setIsModalOpen(true)
  }

  const handleEditCurrency = (currency: ICurrency) => {
    setModalMode("edit")
    setSelectedCurrency(currency)
    setIsModalOpen(true)
  }

  const handleViewCurrency = (currency: ICurrency | null) => {
    if (!currency) return
    setModalMode("view")
    setSelectedCurrency(currency)
    setIsModalOpen(true)
  }

  const handleCreateCurrencyDt = () => {
    setModalMode("create")
    setSelectedCurrencyDt(undefined)
    setIsDtModalOpen(true)
  }

  const handleEditCurrencyDt = (currencyDt: ICurrencyDt) => {
    setModalMode("edit")
    setSelectedCurrencyDt(currencyDt)
    setIsDtModalOpen(true)
  }

  const handleViewCurrencyDt = (currencyDt: ICurrencyDt | null) => {
    if (!currencyDt) return
    setModalMode("view")
    setSelectedCurrencyDt(currencyDt)
    setIsDtModalOpen(true)
  }

  const handleCreateCurrencyLocalDt = () => {
    setModalMode("create")
    setSelectedCurrencyLocalDt(undefined)
    setIsLocalDtModalOpen(true)
  }

  const handleEditCurrencyLocalDt = (currencyLocalDt: ICurrencyLocalDt) => {
    setModalMode("edit")
    setSelectedCurrencyLocalDt(currencyLocalDt)
    setIsLocalDtModalOpen(true)
  }

  const handleViewCurrencyLocalDt = (
    currencyLocalDt: ICurrencyLocalDt | null
  ) => {
    if (!currencyLocalDt) return
    setModalMode("view")
    setSelectedCurrencyLocalDt(currencyLocalDt)
    setIsLocalDtModalOpen(true)
  }

  // Filter handlers
  const handleCurrencyFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setFilters(newFilters as ICurrencyFilter)
    },
    []
  )

  const handleCurrencyDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setDtFilters(newFilters as ICurrencyFilter)
    },
    []
  )

  const handleCurrencyLocalDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      setLocalDtFilters(newFilters as ICurrencyFilter)
    },
    []
  )

  // Helper function for API responses
  const handleApiResponse = useCallback(
    (response: ApiResponse<ICurrency | ICurrencyDt | ICurrencyLocalDt>) => {
      if (response.result === 1) {
        return true
      } else {
        return false
      }
    },
    []
  )

  // State for save confirmations
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data:
      | CurrencySchemaType
      | CurrencyDtSchemaType
      | CurrencyLocalDtSchemaType
      | null
    type: "currency" | "currencydt" | "currencylocaldt"
  }>({
    isOpen: false,
    data: null,
    type: "currency",
  })

  // Form submission handlers
  const handleCurrencySubmit = async (data: CurrencySchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation.mutateAsync(
          data
        )) as ApiResponse<ICurrency>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencies"] })
        }
      } else if (modalMode === "edit" && selectedCurrency) {
        const response = (await updateMutation.mutateAsync(
          data
        )) as ApiResponse<ICurrency>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencies"] })
        }
      }
    } catch (error) {
      console.error("Currency form submission error:", error)
    }
  }

  const handleCurrencyDtSubmit = async (data: CurrencyDtSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveDtMutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencyDt"] })
        }
      } else if (modalMode === "edit" && selectedCurrencyDt) {
        const response = (await updateDtMutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencyDt"] })
        }
      }
    } catch (error) {
      console.error("Currency details form submission error:", error)
    }
  }

  const handleCurrencyLocalDtSubmit = async (
    data: CurrencyLocalDtSchemaType
  ) => {
    try {
      if (modalMode === "create") {
        const response = (await saveLocalDtMutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyLocalDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencyLocalDt"] })
        }
      } else if (modalMode === "edit" && selectedCurrencyLocalDt) {
        const response = (await updateLocalDtMutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyLocalDt>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencyLocalDt"] })
        }
      }
    } catch (error) {
      console.error("Local currency details form submission error:", error)
    }
  }

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (
    data: CurrencySchemaType | CurrencyDtSchemaType | CurrencyLocalDtSchemaType
  ) => {
    let type: "currency" | "currencydt" | "currencylocaldt" = "currency"
    if (isDtModalOpen) type = "currencydt"
    else if (isLocalDtModalOpen) type = "currencylocaldt"

    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: type,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: CurrencySchemaType | CurrencyDtSchemaType | CurrencyLocalDtSchemaType
  ) => {
    try {
      if (saveConfirmation.type === "currencydt") {
        await handleCurrencyDtSubmit(data as CurrencyDtSchemaType)
        setIsDtModalOpen(false)
      } else if (saveConfirmation.type === "currencylocaldt") {
        await handleCurrencyLocalDtSubmit(data as CurrencyLocalDtSchemaType)
        setIsLocalDtModalOpen(false)
      } else {
        await handleCurrencySubmit(data as CurrencySchemaType)
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Delete handlers
  const handleDeleteCurrency = (currencyId: string) => {
    const currencyToDelete = currenciesData?.find(
      (c) => c.currencyId.toString() === currencyId
    )
    if (!currencyToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: currencyId,
      name: currencyToDelete.currencyName,
      type: "currency",
    })
  }

  const handleDeleteCurrencyDt = (currencyId: string) => {
    const currencyDtToDelete = currencyDtData?.find(
      (c) => c.currencyId.toString() === currencyId
    )
    if (!currencyDtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: currencyId,
      name: currencyDtToDelete.currencyName,
      type: "currencydt",
    })
  }

  const handleDeleteCurrencyLocalDt = (currencyId: string) => {
    const currencyLocalDtToDelete = currencyLocalDtData?.find(
      (c) => c.currencyId.toString() === currencyId
    )
    if (!currencyLocalDtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: currencyId,
      name: currencyLocalDtToDelete.currencyName,
      type: "currencylocaldt",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "currency":
        mutation = deleteMutation
        break
      case "currencydt":
        mutation = deleteDtMutation
        break
      case "currencylocaldt":
        mutation = deleteLocalDtMutation
        break
      default:
        return
    }

    mutation.mutateAsync(deleteConfirmation.id).then(() => {
      queryClient.invalidateQueries({ queryKey: [deleteConfirmation.type] })
    })

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "currency",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      if (isModalOpen) {
        const response = await getData(`${Currency.getByCode}/${trimmedCode}`)

        if (response.data.result === 1 && response.data.data) {
          const currencyData = Array.isArray(response.data.data)
            ? response.data.data[0]
            : response.data.data

          if (currencyData) {
            setExistingCurrency(currencyData as ICurrency)
            setShowLoadDialogCurrency(true)
          }
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingCurrency = () => {
    if (existingCurrency) {
      setModalMode("edit")
      setSelectedCurrency(existingCurrency)
      setShowLoadDialogCurrency(false)
      setExistingCurrency(null)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Currency
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage currency information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="currency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="currencydt">Currency Details</TabsTrigger>
          <TabsTrigger value="currencylocaldt">
            Local Currency Details
          </TabsTrigger>
        </TabsList>

        {/* Currency Tab */}
        <TabsContent value="currency" className="space-y-4">
          {isLoadingCurrency ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : currenciesResult === -2 ||
            (!canView && !canEdit && !canDelete && !canCreate) ? (
            <LockSkeleton locked={true}>
              <CurrenciesTable
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={MODULE_ID}
                transactionId={TRANSACTION_ID}
                canEdit={false}
                canDelete={false}
                canView={false}
                canCreate={false}
              />
            </LockSkeleton>
          ) : currenciesResult ? (
            <CurrenciesTable
              data={filters.search ? [] : currenciesData || []}
              isLoading={isLoadingCurrency}
              onSelect={canView ? handleViewCurrency : undefined}
              onDelete={canDelete ? handleDeleteCurrency : undefined}
              onEdit={canEdit ? handleEditCurrency : undefined}
              onCreate={canCreate ? handleCreateCurrency : undefined}
              onRefresh={refetchCurrency}
              onFilterChange={handleCurrencyFilterChange}
              moduleId={MODULE_ID}
              transactionId={TRANSACTION_ID}
              canEdit={canEdit}
              canDelete={canDelete}
              canView={canView}
              canCreate={canCreate}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {currenciesResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Currency Details Tab */}
        <TabsContent value="currencydt" className="space-y-4">
          {isLoadingCurrencyDt ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : currencyDtResult === -2 ||
            (!canViewDt && !canEditDt && !canDeleteDt && !canCreateDt) ? (
            <LockSkeleton locked={true}>
              <CurrencyDtsTable
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={MODULE_ID}
                transactionId={TRANSACTION_ID_DT}
                canEdit={false}
                canDelete={false}
                canView={false}
                canCreate={false}
              />
            </LockSkeleton>
          ) : currencyDtResult ? (
            <CurrencyDtsTable
              data={dtFilters.search ? [] : currencyDtData || []}
              isLoading={isLoadingCurrencyDt}
              onSelect={canViewDt ? handleViewCurrencyDt : undefined}
              onDelete={canDeleteDt ? handleDeleteCurrencyDt : undefined}
              onEdit={canEditDt ? handleEditCurrencyDt : undefined}
              onCreate={canCreateDt ? handleCreateCurrencyDt : undefined}
              onRefresh={refetchCurrencyDt}
              onFilterChange={handleCurrencyDtFilterChange}
              moduleId={MODULE_ID}
              transactionId={TRANSACTION_ID_DT}
              canEdit={canEditDt}
              canDelete={canDeleteDt}
              canView={canViewDt}
              canCreate={canCreateDt}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {currencyDtResult === 0 ? "No data available" : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Local Currency Details Tab */}
        <TabsContent value="currencylocaldt" className="space-y-4">
          {isLoadingCurrencyLocalDt ? (
            <DataTableSkeleton
              columnCount={8}
              filterCount={2}
              cellWidths={[
                "10rem",
                "30rem",
                "10rem",
                "10rem",
                "10rem",
                "10rem",
                "6rem",
                "6rem",
              ]}
              shrinkZero
            />
          ) : currencyLocalDtResult === -2 ||
            (!canViewLocalDt &&
              !canEditLocalDt &&
              !canDeleteLocalDt &&
              !canCreateLocalDt) ? (
            <LockSkeleton locked={true}>
              <CurrencyLocalDtsTable
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={MODULE_ID}
                transactionId={TRANSACTION_ID_LOCAL_DT}
                canEdit={false}
                canDelete={canDeleteLocalDt}
                canView={canViewLocalDt}
                canCreate={canCreateLocalDt}
              />
            </LockSkeleton>
          ) : currencyLocalDtResult ? (
            <CurrencyLocalDtsTable
              data={localDtFilters.search ? [] : currencyLocalDtData || []}
              isLoading={isLoadingCurrencyLocalDt}
              onSelect={canViewLocalDt ? handleViewCurrencyLocalDt : undefined}
              onDelete={
                canDeleteLocalDt ? handleDeleteCurrencyLocalDt : undefined
              }
              onEdit={canEditLocalDt ? handleEditCurrencyLocalDt : undefined}
              onCreate={
                canCreateLocalDt ? handleCreateCurrencyLocalDt : undefined
              }
              onRefresh={refetchCurrencyLocalDt}
              onFilterChange={handleCurrencyLocalDtFilterChange}
              moduleId={MODULE_ID}
              transactionId={TRANSACTION_ID_LOCAL_DT}
              canEdit={canEditLocalDt}
              canDelete={canDeleteLocalDt}
              canView={canViewLocalDt}
              canCreate={canCreateLocalDt}
            />
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {currencyLocalDtResult === 0
                  ? "No data available"
                  : "Loading..."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Currency Form Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Currency"}
              {modalMode === "edit" && "Update Currency"}
              {modalMode === "view" && "View Currency"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new currency to the system database."
                : modalMode === "edit"
                  ? "Update currency information in the system database."
                  : "View currency details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CurrencyForm
            initialData={modalMode !== "create" ? selectedCurrency : undefined}
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsModalOpen(false)}
            isSubmitting={saveMutation.isPending || updateMutation.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Currency Details Form Modal */}
      <Dialog
        open={isDtModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDtModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Currency Details"}
              {modalMode === "edit" && "Update Currency Details"}
              {modalMode === "view" && "View Currency Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add new currency details to the system database."
                : modalMode === "edit"
                  ? "Update currency details information."
                  : "View currency details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CurrencyDtForm
            initialData={
              modalMode !== "create" ? selectedCurrencyDt : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsDtModalOpen(false)}
            isSubmitting={
              saveDtMutation.isPending || updateDtMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Local Currency Details Form Modal */}
      <Dialog
        open={isLocalDtModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsLocalDtModalOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Local Currency Details"}
              {modalMode === "edit" && "Update Local Currency Details"}
              {modalMode === "view" && "View Local Currency Details"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add new local currency details to the system database."
                : modalMode === "edit"
                  ? "Update local currency details information."
                  : "View local currency details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CurrencyLocalDtForm
            initialData={
              modalMode !== "create" ? selectedCurrencyLocalDt : undefined
            }
            submitAction={handleFormSubmit}
            onCancelAction={() => setIsLocalDtModalOpen(false)}
            isSubmitting={
              saveLocalDtMutation.isPending || updateLocalDtMutation.isPending
            }
            isReadOnly={modalMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialog */}
      <LoadConfirmation
        open={showLoadDialogCurrency}
        onOpenChange={setShowLoadDialogCurrency}
        onLoad={handleLoadExistingCurrency}
        onCancel={() => setExistingCurrency(null)}
        code={existingCurrency?.currencyCode}
        name={existingCurrency?.currencyName}
        typeLabel="Currency"
        isLoading={saveMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={`Delete ${deleteConfirmation.type.toUpperCase()}`}
        description={`This action cannot be undone. This will permanently delete the ${deleteConfirmation.type} from our servers.`}
        itemName={deleteConfirmation.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            id: null,
            name: null,
            type: "currency",
          })
        }
        isDeleting={
          deleteConfirmation.type === "currency"
            ? deleteMutation.isPending
            : deleteConfirmation.type === "currencydt"
              ? deleteDtMutation.isPending
              : deleteLocalDtMutation.isPending
        }
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalMode === "create"
            ? `Create ${saveConfirmation.type.toUpperCase()}`
            : `Update ${saveConfirmation.type.toUpperCase()}`
        }
        itemName={
          saveConfirmation.type === "currency"
            ? (saveConfirmation.data as CurrencySchemaType)?.currencyName || ""
            : saveConfirmation.type === "currencydt"
              ? (
                  saveConfirmation.data as CurrencyDtSchemaType
                )?.currencyId?.toString() || ""
              : (
                  saveConfirmation.data as CurrencyLocalDtSchemaType
                )?.currencyId?.toString() || ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "currency",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "currency",
          })
        }
        isSaving={
          saveConfirmation.type === "currency"
            ? saveMutation.isPending || updateMutation.isPending
            : saveConfirmation.type === "currencydt"
              ? saveDtMutation.isPending || updateDtMutation.isPending
              : saveLocalDtMutation.isPending || updateLocalDtMutation.isPending
        }
      />
    </div>
  )
}
