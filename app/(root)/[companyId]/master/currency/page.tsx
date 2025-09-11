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
  }, [filters.search])

  useEffect(() => {
    if (dtFilters.search !== undefined) currencyDtQuery.refetch()
  }, [dtFilters.search])

  useEffect(() => {
    if (localDtFilters.search !== undefined) currencyLocalDtQuery.refetch()
  }, [localDtFilters.search])

  // Action handlers
  const handleCurrencyAction = useCallback(
    (action: "create" | "edit" | "view", currency?: ICurrency) => {
      setModalStates({
        currency: true,
        dt: false,
        localDt: false,
        mode: action,
      })
      setSelectedCurrency(currency)
    },
    []
  )

  const handleCurrencyDtAction = useCallback(
    (action: "create" | "edit" | "view", currencyDt?: ICurrencyDt) => {
      setModalStates({
        currency: false,
        dt: true,
        localDt: false,
        mode: action,
      })
      setSelectedCurrencyDt(currencyDt)
    },
    []
  )

  const handleCurrencyLocalDtAction = useCallback(
    (
      action: "create" | "edit" | "view",
      currencyLocalDt?: ICurrencyLocalDt
    ) => {
      setModalStates({
        currency: false,
        dt: false,
        localDt: true,
        mode: action,
      })
      setSelectedCurrencyLocalDt(currencyLocalDt)
    },
    []
  )

  // Filter handlers
  const handleCurrencyFilterChange = useCallback((filters: ICurrencyFilter) => {
    setFilters(filters)
  }, [])

  const handleCurrencyDtFilterChange = useCallback(
    (filters: ICurrencyFilter) => {
      setDtFilters(filters)
    },
    []
  )

  const handleCurrencyLocalDtFilterChange = useCallback(
    (filters: ICurrencyFilter) => {
      setLocalDtFilters(filters)
    },
    []
  )

  // Helper function for API responses
  const handleApiResponse = useCallback(
    (
      response: ApiResponse<ICurrency | ICurrencyDt | ICurrencyLocalDt>,
      successMessage: string,
      errorPrefix: string
    ) => {
      if (response.result === 1) {
        return true
      } else {
        return false
      }
    },
    []
  )

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

        if (
          handleApiResponse(
            response,
            modalStates.mode === "create"
              ? "Currency created successfully"
              : "Currency updated successfully",
            modalStates.mode === "create"
              ? "Create Currency"
              : "Update Currency"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["currencies"] })
          setModalStates((prev) => ({ ...prev, currency: false }))
        }
      } catch (error) {
        console.error("Currency form submission error:", error)
      }
    },
    [modalStates.mode, handleApiResponse]
  )

  const handleCurrencyDtSubmit = useCallback(
    async (data: CurrencyDtFormValues) => {
      try {
        const mutation =
          modalStates.mode === "create" ? dtMutations.save : dtMutations.update

        const response = (await mutation.mutateAsync(
          data
        )) as ApiResponse<ICurrencyDt>

        if (
          handleApiResponse(
            response,
            modalStates.mode === "create"
              ? "Currency details created successfully"
              : "Currency details updated successfully",
            modalStates.mode === "create"
              ? "Create Currency Details"
              : "Update Currency Details"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["currencyDt"] })
          setModalStates((prev) => ({ ...prev, dt: false }))
        }
      } catch (error) {
        console.error("Currency details form submission error:", error)
      }
    },
    [modalStates.mode, handleApiResponse]
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

        if (
          handleApiResponse(
            response,
            modalStates.mode === "create"
              ? "Local currency details created successfully"
              : "Local currency details updated successfully",
            modalStates.mode === "create"
              ? "Create Local Currency Details"
              : "Update Local Currency Details"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["currencyLocalDt"] })
          setModalStates((prev) => ({ ...prev, localDt: false }))
        }
      } catch (error) {
        console.error("Local currency details form submission error:", error)
      }
    },
    [modalStates.mode, handleApiResponse]
  )

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
          queryKey: [deleteConfirmation.queryKey],
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
  }, [deleteConfirmation])

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
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Currency</h1>
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
                onCurrencySelect={
                  permissions.currency.view
                    ? (currency) => handleCurrencyAction("view", currency)
                    : undefined
                }
                onDeleteCurrency={
                  permissions.currency.delete
                    ? (id) =>
                        handleDelete(
                          "currency",
                          id,
                          currenciesData?.find(
                            (c) => c.currencyId.toString() === id
                          )?.currencyName || ""
                        )
                    : undefined
                }
                onEditCurrency={
                  permissions.currency.edit
                    ? (currency) => handleCurrencyAction("edit", currency)
                    : undefined
                }
                onCreateCurrency={
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
              onCurrencySelect={
                permissions.currency.view
                  ? (currency) => handleCurrencyAction("view", currency)
                  : undefined
              }
              onDeleteCurrency={
                permissions.currency.delete
                  ? (id) =>
                      handleDelete(
                        "currency",
                        id,
                        currenciesData?.find(
                          (c) => c.currencyId.toString() === id
                        )?.currencyName || ""
                      )
                  : undefined
              }
              onEditCurrency={
                permissions.currency.edit
                  ? (currency) => handleCurrencyAction("edit", currency)
                  : undefined
              }
              onCreateCurrency={
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
                onCurrencyDtSelect={
                  permissions.dt.view
                    ? (dt) => handleCurrencyDtAction("view", dt)
                    : undefined
                }
                onDeleteCurrencyDt={
                  permissions.dt.delete
                    ? (id) =>
                        handleDelete(
                          "currencydt",
                          id,
                          currencyDtData?.find(
                            (c) => c.currencyId.toString() === id
                          )?.currencyName || ""
                        )
                    : undefined
                }
                onEditCurrencyDt={
                  permissions.dt.edit
                    ? (dt) => handleCurrencyDtAction("edit", dt)
                    : undefined
                }
                onCreateCurrencyDt={
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
              onCurrencyDtSelect={
                permissions.dt.view
                  ? (dt) => handleCurrencyDtAction("view", dt)
                  : undefined
              }
              onDeleteCurrencyDt={
                permissions.dt.delete
                  ? (id) =>
                      handleDelete(
                        "currencydt",
                        id,
                        currencyDtData?.find(
                          (c) => c.currencyId.toString() === id
                        )?.currencyName || ""
                      )
                  : undefined
              }
              onEditCurrencyDt={
                permissions.dt.edit
                  ? (dt) => handleCurrencyDtAction("edit", dt)
                  : undefined
              }
              onCreateCurrencyDt={
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
                onCurrencyLocalDtSelect={
                  permissions.localDt.view
                    ? (localDt) => handleCurrencyLocalDtAction("view", localDt)
                    : undefined
                }
                onDeleteCurrencyLocalDt={
                  permissions.localDt.delete
                    ? (id) =>
                        handleDelete(
                          "currencylocaldt",
                          id,
                          currencyLocalDtData?.find(
                            (c) => c.currencyId.toString() === id
                          )?.currencyName || ""
                        )
                    : undefined
                }
                onEditCurrencyLocalDt={
                  permissions.localDt.edit
                    ? (localDt) => handleCurrencyLocalDtAction("edit", localDt)
                    : undefined
                }
                onCreateCurrencyLocalDt={
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
              onCurrencyLocalDtSelect={
                permissions.localDt.view
                  ? (localDt) => handleCurrencyLocalDtAction("view", localDt)
                  : undefined
              }
              onDeleteCurrencyLocalDt={
                permissions.localDt.delete
                  ? (id) =>
                      handleDelete(
                        "currencylocaldt",
                        id,
                        currencyLocalDtData?.find(
                          (c) => c.currencyId.toString() === id
                        )?.currencyName || ""
                      )
                  : undefined
              }
              onEditCurrencyLocalDt={
                permissions.localDt.edit
                  ? (localDt) => handleCurrencyLocalDtAction("edit", localDt)
                  : undefined
              }
              onCreateCurrencyLocalDt={
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
            submitAction={handleCurrencySubmit}
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
            submitAction={handleCurrencyDtSubmit}
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
            submitAction={handleCurrencyLocalDtSubmit}
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
    </div>
  )
}
