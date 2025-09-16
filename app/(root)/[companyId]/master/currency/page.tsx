"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  ICurrency,
  ICurrencyDt,
  ICurrencyFilter,
  ICurrencyLocalDt,
} from "@/interfaces/currency"
import {
  CurrencyDtFormValues,
  CurrencyFormValues,
  CurrencyLocalDtFormValues,
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
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { CurrencyForm } from "./components/currency-form"
import { CurrenciesTable } from "./components/currency-table"
import { CurrencyDtForm } from "./components/currencydt-form"
import { CurrencyDtsTable } from "./components/currencydt-table"
import { CurrencyLocalDtForm } from "./components/currencylocaldt-form"
import { CurrencyLocalDtsTable } from "./components/currencylocaldt-table"

const MODULE_ID = ModuleId.master
const TRANSACTION_ID = MasterTransactionId.currency
const TRANSACTION_ID_DT = MasterTransactionId.currency_dt
const TRANSACTION_ID_LOCAL_DT = MasterTransactionId.currency_local_dt

export default function CurrencyPage() {
  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const permissions = useMemo(
    () => ({
      currency: {
        create: hasPermission(MODULE_ID, TRANSACTION_ID, "isCreate"),
        view: hasPermission(MODULE_ID, TRANSACTION_ID, "isRead"),
        edit: hasPermission(MODULE_ID, TRANSACTION_ID, "isEdit"),
        delete: hasPermission(MODULE_ID, TRANSACTION_ID, "isDelete"),
      },
      dt: {
        create: hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isCreate"),
        view: hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isRead"),
        edit: hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isEdit"),
        delete: hasPermission(MODULE_ID, TRANSACTION_ID_DT, "isDelete"),
      },
      localDt: {
        create: hasPermission(MODULE_ID, TRANSACTION_ID_LOCAL_DT, "isCreate"),
        view: hasPermission(MODULE_ID, TRANSACTION_ID_LOCAL_DT, "isRead"),
        edit: hasPermission(MODULE_ID, TRANSACTION_ID_LOCAL_DT, "isEdit"),
        delete: hasPermission(MODULE_ID, TRANSACTION_ID_LOCAL_DT, "isDelete"),
      },
    }),
    [hasPermission]
  )

  // State for filters
  const [filters, setFilters] = useState<ICurrencyFilter>({})
  const [dtFilters, setDtFilters] = useState<ICurrencyFilter>({})
  const [localDtFilters, setLocalDtFilters] = useState<ICurrencyFilter>({})

  // Data fetching
  const currencyQuery = useGet<ICurrency>(
    `${Currency.get}`,
    "currencies",
    filters.search
  )
  const currencyDtQuery = useGet<ICurrencyDt>(
    `${Currency.getDt}`,
    "currencyDt",
    dtFilters.search
  )
  const currencyLocalDtQuery = useGet<ICurrencyLocalDt>(
    `${Currency.getLocalDt}`,
    "currencyLocalDt",
    localDtFilters.search
  )

  // Extract data from responses
  const { data: currenciesData } =
    (currencyQuery.data as ApiResponse<ICurrency>) || { data: [] }
  const { data: currencyDtData } =
    (currencyDtQuery.data as ApiResponse<ICurrencyDt>) || { data: [] }
  const { data: currencyLocalDtData } =
    (currencyLocalDtQuery.data as ApiResponse<ICurrencyLocalDt>) || { data: [] }

  // Mutations
  const currencyMutations = {
    save: usePersist<CurrencyFormValues>(`${Currency.add}`),
    update: usePersist<CurrencyFormValues>(`${Currency.add}`),
    delete: useDelete(`${Currency.delete}`),
  }

  const dtMutations = {
    save: usePersist<CurrencyDtFormValues>(`${Currency.addDt}`),
    update: usePersist<CurrencyDtFormValues>(`${Currency.addDt}`),
    delete: useDelete(`${Currency.deleteDt}`),
  }

  const localDtMutations = {
    save: usePersist<CurrencyLocalDtFormValues>(`${Currency.addLocalDt}`),
    update: usePersist<CurrencyLocalDtFormValues>(`${Currency.addLocalDt}`),
    delete: useDelete(`${Currency.deleteLocalDt}`),
  }

  // State management
  const [selectedCurrency, setSelectedCurrency] = useState<ICurrency>()
  const [selectedCurrencyDt, setSelectedCurrencyDt] = useState<ICurrencyDt>()
  const [selectedCurrencyLocalDt, setSelectedCurrencyLocalDt] =
    useState<ICurrencyLocalDt>()

  const [modalStates, setModalStates] = useState({
    currency: false,
    dt: false,
    localDt: false,
    mode: "create" as "create" | "edit" | "view",
  })

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
    if (filters.search !== undefined) currencyQuery.refetch()
  }, [filters.search, currencyQuery])

  useEffect(() => {
    if (dtFilters.search !== undefined) currencyDtQuery.refetch()
  }, [dtFilters.search, currencyDtQuery])

  useEffect(() => {
    if (localDtFilters.search !== undefined) currencyLocalDtQuery.refetch()
  }, [localDtFilters.search, currencyLocalDtQuery])

  // Action handlers
  const handleCurrencyAction = useCallback(
    (action: "create" | "edit" | "view", currency?: ICurrency | null) => {
      setModalStates({
        currency: true,
        dt: false,
        localDt: false,
        mode: action,
      })
      setSelectedCurrency(currency || undefined)
    },
    []
  )

  const handleCurrencyDtAction = useCallback(
    (action: "create" | "edit" | "view", currencyDt?: ICurrencyDt | null) => {
      setModalStates({
        currency: false,
        dt: true,
        localDt: false,
        mode: action,
      })
      setSelectedCurrencyDt(currencyDt || undefined)
    },
    []
  )

  const handleCurrencyLocalDtAction = useCallback(
    (
      action: "create" | "edit" | "view",
      currencyLocalDt?: ICurrencyLocalDt | null
    ) => {
      setModalStates({
        currency: false,
        dt: false,
        localDt: true,
        mode: action,
      })
      setSelectedCurrencyLocalDt(currencyLocalDt || undefined)
    },
    []
  )

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
      | CurrencyFormValues
      | CurrencyDtFormValues
      | CurrencyLocalDtFormValues
      | null
    type: "currency" | "currencydt" | "currencylocaldt"
  }>({
    isOpen: false,
    data: null,
    type: "currency",
  })

  // Form submission handlers
  const handleCurrencySubmit = useCallback(
    async (data: CurrencyFormValues) => {
      try {
        const mutation =
          modalStates.mode === "create"
            ? currencyMutations.save
            : currencyMutations.update

        const response = (await mutation.mutateAsync(
          data
        )) as ApiResponse<ICurrency>

        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencies"] })
          setModalStates((prev) => ({ ...prev, currency: false }))
        }
      } catch (error) {
        console.error("Currency form submission error:", error)
      }
    },
    [
      modalStates.mode,
      handleApiResponse,
      currencyMutations.save,
      currencyMutations.update,
      queryClient,
    ]
  )

  const handleCurrencyDtSubmit = useCallback(
    async (data: CurrencyDtFormValues) => {
      try {
        const mutation =
          modalStates.mode === "create" ? dtMutations.save : dtMutations.update

        const response = (await mutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyDt>

        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencyDt"] })
          setModalStates((prev) => ({ ...prev, dt: false }))
        }
      } catch (error) {
        console.error("Currency details form submission error:", error)
      }
    },
    [
      modalStates.mode,
      handleApiResponse,
      dtMutations.save,
      dtMutations.update,
      queryClient,
    ]
  )

  const handleCurrencyLocalDtSubmit = useCallback(
    async (data: CurrencyLocalDtFormValues) => {
      try {
        const mutation =
          modalStates.mode === "create"
            ? localDtMutations.save
            : localDtMutations.update

        const response = (await mutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyLocalDt>

        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["currencyLocalDt"] })
          setModalStates((prev) => ({ ...prev, localDt: false }))
        }
      } catch (error) {
        console.error("Local currency details form submission error:", error)
      }
    },
    [
      modalStates.mode,
      handleApiResponse,
      localDtMutations.save,
      localDtMutations.update,
      queryClient,
    ]
  )

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (
    data: CurrencyFormValues | CurrencyDtFormValues | CurrencyLocalDtFormValues
  ) => {
    let type: "currency" | "currencydt" | "currencylocaldt" = "currency"
    if (modalStates.dt) type = "currencydt"
    else if (modalStates.localDt) type = "currencylocaldt"

    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: type,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data: CurrencyFormValues | CurrencyDtFormValues | CurrencyLocalDtFormValues
  ) => {
    try {
      if (saveConfirmation.type === "currencydt") {
        await handleCurrencyDtSubmit(data as CurrencyDtFormValues)
      } else if (saveConfirmation.type === "currencylocaldt") {
        await handleCurrencyLocalDtSubmit(data as CurrencyLocalDtFormValues)
      } else {
        await handleCurrencySubmit(data as CurrencyFormValues)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Delete handlers
  const handleDelete = useCallback(
    (
      type: "currency" | "currencydt" | "currencylocaldt",
      id: string,
      name: string
    ) => {
      setDeleteConfirmation({
        isOpen: true,
        id,
        name,
        type,
      })
    },
    []
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation.id) return

    const mutation =
      deleteConfirmation.type === "currency"
        ? currencyMutations.delete
        : deleteConfirmation.type === "currencydt"
          ? dtMutations.delete
          : localDtMutations.delete

    try {
      await mutation.mutateAsync(deleteConfirmation.id).then(() => {
        queryClient.invalidateQueries({
          queryKey: [deleteConfirmation.type],
        })
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [
          deleteConfirmation.type === "currency"
            ? "currencies"
            : deleteConfirmation.type === "currencydt"
              ? "currencyDt"
              : "currencyLocalDt",
        ],
      })
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        id: null,
        name: null,
        type: "currency",
      })
    }
  }, [
    deleteConfirmation,
    currencyMutations.delete,
    dtMutations.delete,
    localDtMutations.delete,
    queryClient,
  ])

  // Duplicate detection
  const handleCodeBlur = useCallback(
    async (code: string) => {
      if (modalStates.mode !== "create") return

      const trimmedCode = code?.trim()
      if (!trimmedCode) return

      try {
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
      } catch (error) {
        console.error("Error checking code availability:", error)
      }
    },
    [modalStates.mode]
  )

  // Load existing records
  const handleLoadExistingCurrency = useCallback(() => {
    if (existingCurrency) {
      setModalStates({
        currency: true,
        dt: false,
        localDt: false,
        mode: "edit",
      })
      setSelectedCurrency(existingCurrency)
      setShowLoadDialogCurrency(false)
      setExistingCurrency(null)
    }
  }, [existingCurrency])

  // Loading states
  const isLoadingStates = {
    currency: currencyQuery.isLoading || currencyQuery.isRefetching,
    dt: currencyDtQuery.isLoading || currencyDtQuery.isRefetching,
    localDt:
      currencyLocalDtQuery.isLoading || currencyLocalDtQuery.isRefetching,
  }

  // Modal titles and descriptions
  const modalConfigs = {
    currency: {
      title:
        modalStates.mode === "create"
          ? "Create Currency"
          : modalStates.mode === "edit"
            ? "Update Currency"
            : "View Currency",
      description:
        modalStates.mode === "create"
          ? "Add a new currency to the system database."
          : modalStates.mode === "edit"
            ? "Update currency information in the system database."
            : "View currency details.",
    },
    dt: {
      title:
        modalStates.mode === "create"
          ? "Create Currency Details"
          : modalStates.mode === "edit"
            ? "Update Currency Details"
            : "View Currency Details",
      description:
        modalStates.mode === "create"
          ? "Add new currency details to the system database."
          : modalStates.mode === "edit"
            ? "Update currency details information."
            : "View currency details.",
    },
    localDt: {
      title:
        modalStates.mode === "create"
          ? "Create Local Currency Details"
          : modalStates.mode === "edit"
            ? "Update Local Currency Details"
            : "View Local Currency Details",
      description:
        modalStates.mode === "create"
          ? "Add new local currency details to the system database."
          : modalStates.mode === "edit"
            ? "Update local currency details information."
            : "View local currency details.",
    },
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
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
          {isLoadingStates.currency ? (
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
          ) : (currencyQuery.data as ApiResponse<ICurrency>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <CurrenciesTable
                data={currenciesData || []}
                onSelect={
                  permissions.currency.view
                    ? (currency: ICurrency | null) =>
                        handleCurrencyAction("view", currency)
                    : undefined
                }
                onDelete={
                  permissions.currency.delete
                    ? (id: string) =>
                        handleDelete(
                          "currency",
                          id,
                          currenciesData?.find(
                            (c) => c.currencyId.toString() === id
                          )?.currencyName || ""
                        )
                    : undefined
                }
                onEdit={
                  permissions.currency.edit
                    ? (currency: ICurrency) =>
                        handleCurrencyAction("edit", currency)
                    : undefined
                }
                onCreate={
                  permissions.currency.create
                    ? () => handleCurrencyAction("create")
                    : undefined
                }
                onRefresh={currencyQuery.refetch}
                onFilterChange={handleCurrencyFilterChange}
                moduleId={MODULE_ID}
                transactionId={TRANSACTION_ID}
              />
            </LockSkeleton>
          ) : (
            <CurrenciesTable
              data={currenciesData || []}
              onSelect={
                permissions.currency.view
                  ? (currency: ICurrency | null) =>
                      handleCurrencyAction("view", currency)
                  : undefined
              }
              onDelete={
                permissions.currency.delete
                  ? (id: string) =>
                      handleDelete(
                        "currency",
                        id,
                        currenciesData?.find(
                          (c) => c.currencyId.toString() === id
                        )?.currencyName || ""
                      )
                  : undefined
              }
              onEdit={
                permissions.currency.edit
                  ? (currency: ICurrency) =>
                      handleCurrencyAction("edit", currency)
                  : undefined
              }
              onCreate={
                permissions.currency.create
                  ? () => handleCurrencyAction("create")
                  : undefined
              }
              onRefresh={currencyQuery.refetch}
              onFilterChange={handleCurrencyFilterChange}
              moduleId={MODULE_ID}
              transactionId={TRANSACTION_ID}
            />
          )}
        </TabsContent>

        {/* Currency Details Tab */}
        <TabsContent value="currencydt" className="space-y-4">
          {isLoadingStates.dt ? (
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
          ) : (currencyDtQuery.data as ApiResponse<ICurrencyDt>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <CurrencyDtsTable
                data={currencyDtData || []}
                isLoading={isLoadingStates.dt}
                onSelect={
                  permissions.dt.view
                    ? (dt: ICurrencyDt | null) =>
                        handleCurrencyDtAction("view", dt)
                    : undefined
                }
                onDelete={
                  permissions.dt.delete
                    ? (id: string) =>
                        handleDelete(
                          "currencydt",
                          id,
                          currencyDtData?.find(
                            (c) => c.currencyId.toString() === id
                          )?.currencyName || ""
                        )
                    : undefined
                }
                onEdit={
                  permissions.dt.edit
                    ? (dt: ICurrencyDt) => handleCurrencyDtAction("edit", dt)
                    : undefined
                }
                onCreate={
                  permissions.dt.create
                    ? () => handleCurrencyDtAction("create")
                    : undefined
                }
                onRefresh={currencyDtQuery.refetch}
                onFilterChange={handleCurrencyDtFilterChange}
                moduleId={MODULE_ID}
                transactionId={TRANSACTION_ID_DT}
              />
            </LockSkeleton>
          ) : (
            <CurrencyDtsTable
              data={currencyDtData || []}
              isLoading={isLoadingStates.dt}
              onSelect={
                permissions.dt.view
                  ? (dt: ICurrencyDt | null) =>
                      handleCurrencyDtAction("view", dt)
                  : undefined
              }
              onDelete={
                permissions.dt.delete
                  ? (id: string) =>
                      handleDelete(
                        "currencydt",
                        id,
                        currencyDtData?.find(
                          (c) => c.currencyId.toString() === id
                        )?.currencyName || ""
                      )
                  : undefined
              }
              onEdit={
                permissions.dt.edit
                  ? (dt: ICurrencyDt) => handleCurrencyDtAction("edit", dt)
                  : undefined
              }
              onCreate={
                permissions.dt.create
                  ? () => handleCurrencyDtAction("create")
                  : undefined
              }
              onRefresh={currencyDtQuery.refetch}
              onFilterChange={handleCurrencyDtFilterChange}
              moduleId={MODULE_ID}
              transactionId={TRANSACTION_ID_DT}
            />
          )}
        </TabsContent>

        {/* Local Currency Details Tab */}
        <TabsContent value="currencylocaldt" className="space-y-4">
          {isLoadingStates.localDt ? (
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
          ) : (currencyLocalDtQuery.data as ApiResponse<ICurrencyLocalDt>)
              ?.result === -2 ? (
            <LockSkeleton locked={true}>
              <CurrencyLocalDtsTable
                data={currencyLocalDtData || []}
                isLoading={isLoadingStates.localDt}
                onSelect={
                  permissions.localDt.view
                    ? (localDt: ICurrencyLocalDt | null) =>
                        handleCurrencyLocalDtAction("view", localDt)
                    : undefined
                }
                onDelete={
                  permissions.localDt.delete
                    ? (id: string) =>
                        handleDelete(
                          "currencylocaldt",
                          id,
                          currencyLocalDtData?.find(
                            (c) => c.currencyId.toString() === id
                          )?.currencyName || ""
                        )
                    : undefined
                }
                onEdit={
                  permissions.localDt.edit
                    ? (localDt: ICurrencyLocalDt) =>
                        handleCurrencyLocalDtAction("edit", localDt)
                    : undefined
                }
                onCreate={
                  permissions.localDt.create
                    ? () => handleCurrencyLocalDtAction("create")
                    : undefined
                }
                onRefresh={currencyLocalDtQuery.refetch}
                onFilterChange={handleCurrencyLocalDtFilterChange}
                moduleId={MODULE_ID}
                transactionId={TRANSACTION_ID_LOCAL_DT}
              />
            </LockSkeleton>
          ) : (
            <CurrencyLocalDtsTable
              data={currencyLocalDtData || []}
              isLoading={isLoadingStates.localDt}
              onSelect={
                permissions.localDt.view
                  ? (localDt: ICurrencyLocalDt | null) =>
                      handleCurrencyLocalDtAction("view", localDt)
                  : undefined
              }
              onDelete={
                permissions.localDt.delete
                  ? (id: string) =>
                      handleDelete(
                        "currencylocaldt",
                        id,
                        currencyLocalDtData?.find(
                          (c) => c.currencyId.toString() === id
                        )?.currencyName || ""
                      )
                  : undefined
              }
              onEdit={
                permissions.localDt.edit
                  ? (localDt: ICurrencyLocalDt) =>
                      handleCurrencyLocalDtAction("edit", localDt)
                  : undefined
              }
              onCreate={
                permissions.localDt.create
                  ? () => handleCurrencyLocalDtAction("create")
                  : undefined
              }
              onRefresh={currencyLocalDtQuery.refetch}
              onFilterChange={handleCurrencyLocalDtFilterChange}
              moduleId={MODULE_ID}
              transactionId={TRANSACTION_ID_LOCAL_DT}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Currency Form Modal */}
      <Dialog
        open={modalStates.currency}
        onOpenChange={(open) =>
          setModalStates((prev) => ({ ...prev, currency: open }))
        }
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{modalConfigs.currency.title}</DialogTitle>
            <DialogDescription>
              {modalConfigs.currency.description}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CurrencyForm
            initialData={
              modalStates.mode !== "create" ? selectedCurrency : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() =>
              setModalStates((prev) => ({ ...prev, currency: false }))
            }
            isSubmitting={
              (modalStates.mode === "create" &&
                currencyMutations.save.isPending) ||
              (modalStates.mode === "edit" &&
                currencyMutations.update.isPending)
            }
            isReadOnly={modalStates.mode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Currency Details Form Modal */}
      <Dialog
        open={modalStates.dt}
        onOpenChange={(open) =>
          setModalStates((prev) => ({ ...prev, dt: open }))
        }
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{modalConfigs.dt.title}</DialogTitle>
            <DialogDescription>{modalConfigs.dt.description}</DialogDescription>
          </DialogHeader>
          <Separator />
          <CurrencyDtForm
            initialData={
              modalStates.mode !== "create" ? selectedCurrencyDt : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setModalStates((prev) => ({ ...prev, dt: false }))}
            isSubmitting={
              (modalStates.mode === "create" && dtMutations.save.isPending) ||
              (modalStates.mode === "edit" && dtMutations.update.isPending)
            }
            isReadOnly={modalStates.mode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Local Currency Details Form Modal */}
      <Dialog
        open={modalStates.localDt}
        onOpenChange={(open) =>
          setModalStates((prev) => ({ ...prev, localDt: open }))
        }
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{modalConfigs.localDt.title}</DialogTitle>
            <DialogDescription>
              {modalConfigs.localDt.description}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CurrencyLocalDtForm
            initialData={
              modalStates.mode !== "create"
                ? selectedCurrencyLocalDt
                : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() =>
              setModalStates((prev) => ({ ...prev, localDt: false }))
            }
            isSubmitting={
              (modalStates.mode === "create" &&
                localDtMutations.save.isPending) ||
              (modalStates.mode === "edit" && localDtMutations.update.isPending)
            }
            isReadOnly={modalStates.mode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialog */}
      <LoadExistingDialog
        open={showLoadDialogCurrency}
        onOpenChange={setShowLoadDialogCurrency}
        onLoad={handleLoadExistingCurrency}
        onCancel={() => setExistingCurrency(null)}
        code={existingCurrency?.currencyCode}
        name={existingCurrency?.currencyName}
        typeLabel="Currency"
        isLoading={
          currencyMutations.save.isPending || currencyMutations.update.isPending
        }
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
            ? currencyMutations.delete.isPending
            : deleteConfirmation.type === "currencydt"
              ? dtMutations.delete.isPending
              : localDtMutations.delete.isPending
        }
      />

      {/* Save Confirmation Dialog */}
      <SaveConfirmation
        open={saveConfirmation.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmation((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalStates.mode === "create"
            ? `Create ${saveConfirmation.type.toUpperCase()}`
            : `Update ${saveConfirmation.type.toUpperCase()}`
        }
        itemName={
          saveConfirmation.type === "currency"
            ? (saveConfirmation.data as CurrencyFormValues)?.currencyName || ""
            : saveConfirmation.type === "currencydt"
              ? (
                  saveConfirmation.data as CurrencyDtFormValues
                )?.currencyId?.toString() || ""
              : (
                  saveConfirmation.data as CurrencyLocalDtFormValues
                )?.currencyId?.toString() || ""
        }
        operationType={modalStates.mode === "create" ? "create" : "update"}
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
            ? currencyMutations.save.isPending ||
              currencyMutations.update.isPending
            : saveConfirmation.type === "currencydt"
              ? dtMutations.save.isPending || dtMutations.update.isPending
              : localDtMutations.save.isPending ||
                localDtMutations.update.isPending
        }
      />
    </div>
  )
}
