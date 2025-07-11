"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import {
  IChartofAccount,
  IChartofAccountFilter,
} from "@/interfaces/chartofaccount"
import {
  ICoaCategory1,
  ICoaCategory1Filter,
  ICoaCategory2,
  ICoaCategory2Filter,
  ICoaCategory3,
  ICoaCategory3Filter,
} from "@/interfaces/coacategory"
import { ChartofAccountFormValues } from "@/schemas/chartofaccount"
import {
  CoaCategory1FormValues,
  CoaCategory2FormValues,
  CoaCategory3FormValues,
} from "@/schemas/coacategory"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ChartOfAccount,
  CoaCategory1,
  CoaCategory2,
  CoaCategory3,
} from "@/lib/api-routes"
import { apiProxy } from "@/lib/axios-config"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common-v1"
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
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { ChartOfAccountForm } from "./components/chartofaccounts-form"
import { ChartOfAccountsTable } from "./components/chartofaccounts-table"
import { CoaCategory1Form } from "./components/coacategory1-form"
import { CoaCategory1Table } from "./components/coacategory1-table"
import { CoaCategory2Form } from "./components/coacategory2-form"
import { CoaCategory2Table } from "./components/coacategory2-table"
import { CoaCategory3Form } from "./components/coacategory3-form"
import { CoaCategory3Table } from "./components/coacategory3-table"

export default function ChartOfAccountPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.chart_of_account
  const transactionIdCategory1 = MasterTransactionId.coa_category1
  const transactionIdCategory2 = MasterTransactionId.coa_category2
  const transactionIdCategory3 = MasterTransactionId.coa_category3

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")

  const canEditCategory1 = hasPermission(
    moduleId,
    transactionIdCategory1,
    "isEdit"
  )
  const canDeleteCategory1 = hasPermission(
    moduleId,
    transactionIdCategory1,
    "isDelete"
  )
  const canEditCategory2 = hasPermission(
    moduleId,
    transactionIdCategory2,
    "isEdit"
  )
  const canDeleteCategory2 = hasPermission(
    moduleId,
    transactionIdCategory2,
    "isDelete"
  )
  const canEditCategory3 = hasPermission(
    moduleId,
    transactionIdCategory3,
    "isEdit"
  )
  const canDeleteCategory3 = hasPermission(
    moduleId,
    transactionIdCategory3,
    "isDelete"
  )

  // State for filters
  const [filters1, setFilters1] = useState<ICoaCategory1Filter>({})
  const [filters2, setFilters2] = useState<ICoaCategory2Filter>({})
  const [filters3, setFilters3] = useState<ICoaCategory3Filter>({})
  const [filtersChart, setFiltersChart] = useState<IChartofAccountFilter>({})
  const [activeTab, setActiveTab] = useState("chartofaccount")

  // Data fetching
  const {
    data: category1Response,
    refetch: refetch1,
    isLoading: isLoading1,
    isRefetching: isRefetching1,
  } = useGet<ICoaCategory1>(
    `${CoaCategory1.get}`,
    "coacategory1",
    companyId,
    filters1.search
  )

  const {
    data: category2Response,
    refetch: refetch2,
    isLoading: isLoading2,
    isRefetching: isRefetching2,
  } = useGet<ICoaCategory2>(
    `${CoaCategory2.get}`,
    "coacategory2",
    companyId,
    filters2.search
  )

  const {
    data: category3Response,
    refetch: refetch3,
    isLoading: isLoading3,
    isRefetching: isRefetching3,
  } = useGet<ICoaCategory3>(
    `${CoaCategory3.get}`,
    "coacategory3",
    companyId,
    filters3.search
  )

  const {
    data: chartOfAccountsResponse,
    refetch: refetchChart,
    isLoading: isLoadingChart,
    isRefetching: isRefetchingChart,
  } = useGet<IChartofAccount>(
    `${ChartOfAccount.get}`,
    "chartofaccounts",
    companyId,
    filtersChart.search
  )

  // Extract data from responses
  const category1Data =
    (category1Response as ApiResponse<ICoaCategory1>)?.data || []
  const category2Data =
    (category2Response as ApiResponse<ICoaCategory2>)?.data || []
  const category3Data =
    (category3Response as ApiResponse<ICoaCategory3>)?.data || []
  const chartOfAccountsData =
    (chartOfAccountsResponse as ApiResponse<IChartofAccount>)?.data || []

  // Mutations
  const saveMutation1 = useSave<CoaCategory1FormValues>(
    `${CoaCategory1.add}`,
    "coacategory1",
    companyId
  )
  const updateMutation1 = useUpdate<CoaCategory1FormValues>(
    `${CoaCategory1.add}`,
    "coacategory1",
    companyId
  )
  const deleteMutation1 = useDelete(
    `${CoaCategory1.delete}`,
    "coacategory1",
    companyId
  )

  const saveMutation2 = useSave<CoaCategory2FormValues>(
    `${CoaCategory2.add}`,
    "coacategory2",
    companyId
  )
  const updateMutation2 = useUpdate<CoaCategory2FormValues>(
    `${CoaCategory2.add}`,
    "coacategory2",
    companyId
  )
  const deleteMutation2 = useDelete(
    `${CoaCategory2.delete}`,
    "coacategory2",
    companyId
  )

  const saveMutation3 = useSave<CoaCategory3FormValues>(
    `${CoaCategory3.add}`,
    "coacategory3",
    companyId
  )
  const updateMutation3 = useUpdate<CoaCategory3FormValues>(
    `${CoaCategory3.add}`,
    "coacategory3",
    companyId
  )
  const deleteMutation3 = useDelete(
    `${CoaCategory3.delete}`,
    "coacategory3",
    companyId
  )

  const saveMutationChart = useSave<ChartofAccountFormValues>(
    `${ChartOfAccount.add}`,
    "chartofaccounts",
    companyId
  )
  const updateMutationChart = useUpdate<ChartofAccountFormValues>(
    `${ChartOfAccount.add}`,
    "chartofaccounts",
    companyId
  )
  const deleteMutationChart = useDelete(
    `${ChartOfAccount.delete}`,
    "chartofaccounts",
    companyId
  )

  // State management
  const [selectedCategory1, setSelectedCategory1] = useState<
    ICoaCategory1 | undefined
  >()
  const [selectedCategory2, setSelectedCategory2] = useState<
    ICoaCategory2 | undefined
  >()
  const [selectedCategory3, setSelectedCategory3] = useState<
    ICoaCategory3 | undefined
  >()
  const [selectedChartOfAccount, setSelectedChartOfAccount] = useState<
    IChartofAccount | undefined
  >()

  const [isModalChartOpen, setIsModalChartOpen] = useState(false)
  const [isModalCategory1Open, setIsModalCategory1Open] = useState(false)
  const [isModalCategory2Open, setIsModalCategory2Open] = useState(false)
  const [isModalCategory3Open, setIsModalCategory3Open] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    id: null as string | null,
    name: null as string | null,
    type: "chartofaccount" as
      | "chartofaccount"
      | "category1"
      | "category2"
      | "category3",
  })

  // Duplicate detection states
  const [showLoadDialogChart, setShowLoadDialogChart] = useState(false)
  const [existingChartofAccount, setExistingChartofAccount] =
    useState<IChartofAccount | null>(null)

  const [showLoadDialogCategory1, setShowLoadDialogCategory1] = useState(false)
  const [existingCoaCategory1, setExistingCoaCategory1] =
    useState<ICoaCategory1 | null>(null)

  const [showLoadDialogCategory2, setShowLoadDialogCategory2] = useState(false)
  const [existingCoaCategory2, setExistingCoaCategory2] =
    useState<ICoaCategory2 | null>(null)

  const [showLoadDialogCategory3, setShowLoadDialogCategory3] = useState(false)
  const [existingCoaCategory3, setExistingCoaCategory3] =
    useState<ICoaCategory3 | null>(null)

  // Refetch when filters change
  useEffect(() => {
    if (filters1.search !== undefined) refetch1()
  }, [filters1.search])

  useEffect(() => {
    if (filters2.search !== undefined) refetch2()
  }, [filters2.search])

  useEffect(() => {
    if (filters3.search !== undefined) refetch3()
  }, [filters3.search])

  useEffect(() => {
    if (filtersChart.search !== undefined) refetchChart()
  }, [filtersChart.search])

  // Action handlers
  const handleCreateChartOfAccount = () => {
    setModalMode("create")
    setSelectedChartOfAccount(undefined)
    setIsModalChartOpen(true)
  }

  const handleEditChartOfAccount = (chartOfAccount: IChartofAccount) => {
    setModalMode("edit")
    setSelectedChartOfAccount(chartOfAccount)
    setIsModalChartOpen(true)
  }

  const handleViewChartOfAccount = (chartOfAccount: IChartofAccount | null) => {
    if (!chartOfAccount) return
    setModalMode("view")
    setSelectedChartOfAccount(chartOfAccount)
    setIsModalChartOpen(true)
  }

  const handleCreateCategory1 = () => {
    setModalMode("create")
    setSelectedCategory1(undefined)
    setIsModalCategory1Open(true)
  }

  const handleEditCategory1 = (category: ICoaCategory1) => {
    setModalMode("edit")
    setSelectedCategory1(category)
    setIsModalCategory1Open(true)
  }

  const handleViewCategory1 = (category: ICoaCategory1 | null) => {
    if (!category) return
    setModalMode("view")
    setSelectedCategory1(category)
    setIsModalCategory1Open(true)
  }

  const handleCreateCategory2 = () => {
    setModalMode("create")
    setSelectedCategory2(undefined)
    setIsModalCategory2Open(true)
  }

  const handleEditCategory2 = (category: ICoaCategory2) => {
    setModalMode("edit")
    setSelectedCategory2(category)
    setIsModalCategory2Open(true)
  }

  const handleViewCategory2 = (category: ICoaCategory2 | null) => {
    if (!category) return
    setModalMode("view")
    setSelectedCategory2(category)
    setIsModalCategory2Open(true)
  }

  const handleCreateCategory3 = () => {
    setModalMode("create")
    setSelectedCategory3(undefined)
    setIsModalCategory3Open(true)
  }

  const handleEditCategory3 = (category: ICoaCategory3) => {
    setModalMode("edit")
    setSelectedCategory3(category)
    setIsModalCategory3Open(true)
  }

  const handleViewCategory3 = (category: ICoaCategory3 | null) => {
    if (!category) return
    setModalMode("view")
    setSelectedCategory3(category)
    setIsModalCategory3Open(true)
  }

  // Filter handlers
  const handleChartFilterChange = (filters: IChartofAccountFilter) => {
    setFiltersChart(filters)
  }

  const handleCategory1FilterChange = (filters: ICoaCategory1Filter) => {
    setFilters1(filters)
  }

  const handleCategory2FilterChange = (filters: ICoaCategory2Filter) => {
    setFilters2(filters)
  }

  const handleCategory3FilterChange = (filters: ICoaCategory3Filter) => {
    setFilters3(filters)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<
      IChartofAccount | ICoaCategory1 | ICoaCategory2 | ICoaCategory3
    >,
    successMessage: string,
    errorPrefix: string
  ) => {
    if (response.result === 1) {
      toast.success(response.message || successMessage)
      return true
    } else {
      toast.error(response.message || `${errorPrefix} failed`)
      return false
    }
  }

  // Specialized form handlers
  const handleChartSubmit = async (data: ChartofAccountFormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutationChart.mutateAsync(
          data
        )) as ApiResponse<IChartofAccount>
        if (
          handleApiResponse(
            response,
            "Chart of Account created successfully",
            "Create Chart of Account"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["chartofaccounts"] })
        }
      } else if (modalMode === "edit" && selectedChartOfAccount) {
        const response = (await updateMutationChart.mutateAsync(
          data
        )) as ApiResponse<IChartofAccount>
        if (
          handleApiResponse(
            response,
            "Chart of Account updated successfully",
            "Update Chart of Account"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["chartofaccounts"] })
        }
      }
    } catch (error) {
      console.error("Chart of Account form submission error:", error)
      toast.error("Failed to process chart of account request")
    }
  }

  const handleCategory1Submit = async (data: CoaCategory1FormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation1.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory1>
        if (
          handleApiResponse(
            response,
            "Category 1 created successfully",
            "Create Category 1"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["coacategory1"] })
        }
      } else if (modalMode === "edit" && selectedCategory1) {
        const response = (await updateMutation1.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory1>
        if (
          handleApiResponse(
            response,
            "Category 1 updated successfully",
            "Update Category 1"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["coacategory1"] })
        }
      }
    } catch (error) {
      console.error("Category 1 form submission error:", error)
      toast.error("Failed to process category 1 request")
    }
  }

  const handleCategory2Submit = async (data: CoaCategory2FormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation2.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory2>
        if (
          handleApiResponse(
            response,
            "Category 2 created successfully",
            "Create Category 2"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["coacategory2"] })
        }
      } else if (modalMode === "edit" && selectedCategory2) {
        const response = (await updateMutation2.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory2>
        if (
          handleApiResponse(
            response,
            "Category 2 updated successfully",
            "Update Category 2"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["coacategory2"] })
        }
      }
    } catch (error) {
      console.error("Category 2 form submission error:", error)
      toast.error("Failed to process category 2 request")
    }
  }

  const handleCategory3Submit = async (data: CoaCategory3FormValues) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation3.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory3>
        if (
          handleApiResponse(
            response,
            "Category 3 created successfully",
            "Create Category 3"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["coacategory3"] })
        }
      } else if (modalMode === "edit" && selectedCategory3) {
        const response = (await updateMutation3.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory3>
        if (
          handleApiResponse(
            response,
            "Category 3 updated successfully",
            "Update Category 3"
          )
        ) {
          queryClient.invalidateQueries({ queryKey: ["coacategory3"] })
        }
      }
    } catch (error) {
      console.error("Category 3 form submission error:", error)
      toast.error("Failed to process category 3 request")
    }
  }

  // Main form submit handler
  const handleFormSubmit = async (
    data:
      | ChartofAccountFormValues
      | CoaCategory1FormValues
      | CoaCategory2FormValues
      | CoaCategory3FormValues
  ) => {
    try {
      if (isModalChartOpen) {
        await handleChartSubmit(data as ChartofAccountFormValues)
        setIsModalChartOpen(false)
      } else if (isModalCategory1Open) {
        await handleCategory1Submit(data as CoaCategory1FormValues)
        setIsModalCategory1Open(false)
      } else if (isModalCategory2Open) {
        await handleCategory2Submit(data as CoaCategory2FormValues)
        setIsModalCategory2Open(false)
      } else if (isModalCategory3Open) {
        await handleCategory3Submit(data as CoaCategory3FormValues)
        setIsModalCategory3Open(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error("An unexpected error occurred during form submission")
    }
  }

  // Delete handlers
  const handleDeleteChartOfAccount = (chartOfAccountId: number) => {
    const chartOfAccountToDelete = chartOfAccountsData.find(
      (b) => b.glId === chartOfAccountId
    )
    if (!chartOfAccountToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: chartOfAccountId.toString(),
      name: chartOfAccountToDelete.glName,
      type: "chartofaccount",
    })
  }

  const handleDeleteCategory1 = (id: string) => {
    const categoryToDelete = category1Data.find(
      (c) => c.coaCategoryId === Number(id)
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.coaCategoryName,
      type: "category1",
    })
  }

  const handleDeleteCategory2 = (id: string) => {
    const categoryToDelete = category2Data.find(
      (c) => c.coaCategoryId === Number(id)
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.coaCategoryName,
      type: "category2",
    })
  }

  const handleDeleteCategory3 = (id: string) => {
    const categoryToDelete = category3Data.find(
      (c) => c.coaCategoryId === Number(id)
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.coaCategoryName,
      type: "category3",
    })
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "chartofaccount":
        mutation = deleteMutationChart
        break
      case "category1":
        mutation = deleteMutation1
        break
      case "category2":
        mutation = deleteMutation2
        break
      case "category3":
        mutation = deleteMutation3
        break
      default:
        return
    }

    toast.promise(mutation.mutateAsync(deleteConfirmation.id), {
      loading: `Deleting ${deleteConfirmation.name}...`,
      success: `${deleteConfirmation.name} has been deleted`,
      error: `Failed to delete ${deleteConfirmation.name}`,
    })

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "chartofaccount",
    })
  }

  // Duplicate detection
  const handleCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = await apiProxy.get<ApiResponse<IChartofAccount>>(
        `${ChartOfAccount.getByCode}/${trimmedCode}`
      )

      if (response.data.result === 1 && response.data.data) {
        const chartData = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data

        if (chartData) {
          setExistingChartofAccount(chartData as IChartofAccount)
          setShowLoadDialogChart(true)
        }
      }

      const responseCategory1 = await apiProxy.get<ApiResponse<ICoaCategory1>>(
        `${CoaCategory1.getByCode}/${trimmedCode}`
      )

      if (responseCategory1.data.result === 1 && responseCategory1.data.data) {
        const category1Data = Array.isArray(responseCategory1.data.data)
          ? responseCategory1.data.data[0]
          : responseCategory1.data.data

        if (category1Data) {
          setExistingCoaCategory1(category1Data as ICoaCategory1)
          setShowLoadDialogCategory1(true)
        }
      }

      const responseCategory2 = await apiProxy.get<ApiResponse<ICoaCategory2>>(
        `${CoaCategory2.getByCode}/${trimmedCode}`
      )

      if (responseCategory2.data.result === 1 && responseCategory2.data.data) {
        const category2Data = Array.isArray(responseCategory2.data.data)
          ? responseCategory2.data.data[0]
          : responseCategory2.data.data

        if (category2Data) {
          setExistingCoaCategory2(category2Data as ICoaCategory2)
          setShowLoadDialogCategory2(true)
        }
      }

      const responseCategory3 = await apiProxy.get<ApiResponse<ICoaCategory3>>(
        `${CoaCategory3.getByCode}/${trimmedCode}`
      )

      if (responseCategory3.data.result === 1 && responseCategory3.data.data) {
        const category3Data = Array.isArray(responseCategory3.data.data)
          ? responseCategory3.data.data[0]
          : responseCategory3.data.data

        if (category3Data) {
          setExistingCoaCategory3(category3Data as ICoaCategory3)
          setShowLoadDialogCategory3(true)
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingChartofAccount = () => {
    if (existingChartofAccount) {
      setModalMode("edit")
      setSelectedChartOfAccount(existingChartofAccount)
      setShowLoadDialogChart(false)
      setExistingChartofAccount(null)
    }
  }

  const handleLoadExistingCoaCategory1 = () => {
    if (existingCoaCategory1) {
      setModalMode("edit")
      setSelectedCategory1(existingCoaCategory1)
      setShowLoadDialogCategory1(false)
      setExistingCoaCategory1(null)
    }
  }

  const handleLoadExistingCoaCategory2 = () => {
    if (existingCoaCategory2) {
      setModalMode("edit")
      setSelectedCategory2(existingCoaCategory2)
      setShowLoadDialogCategory2(false)
      setExistingCoaCategory2(null)
    }
  }

  const handleLoadExistingCoaCategory3 = () => {
    if (existingCoaCategory3) {
      setModalMode("edit")
      setSelectedCategory3(existingCoaCategory3)
      setShowLoadDialogCategory3(false)
      setExistingCoaCategory3(null)
    }
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Chart of Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage account information and settings
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="chartofaccount"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="chartofaccount" className="flex-1">
            Chart of Account
          </TabsTrigger>
          <TabsTrigger value="category1" className="flex-1">
            Category-1
          </TabsTrigger>
          <TabsTrigger value="category2" className="flex-1">
            Category-2
          </TabsTrigger>
          <TabsTrigger value="category3" className="flex-1">
            Category-3
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chartofaccount" className="space-y-4">
          {isLoadingChart || isRefetchingChart ? (
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
          ) : (chartOfAccountsResponse as ApiResponse<IChartofAccount>)
              ?.result === -2 ? (
            <LockSkeleton locked={true}>
              <ChartOfAccountsTable
                data={chartOfAccountsData}
                onChartOfAccountSelect={
                  canView ? handleViewChartOfAccount : undefined
                }
                onDeleteChartOfAccount={
                  canDelete ? handleDeleteChartOfAccount : undefined
                }
                onEditChartOfAccount={
                  canEdit ? handleEditChartOfAccount : undefined
                }
                onCreateChartOfAccount={
                  canCreate ? handleCreateChartOfAccount : undefined
                }
                onRefresh={refetchChart}
                onFilterChange={handleChartFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                companyId={companyId}
              />
            </LockSkeleton>
          ) : (
            <ChartOfAccountsTable
              data={chartOfAccountsData}
              onChartOfAccountSelect={
                canView ? handleViewChartOfAccount : undefined
              }
              onDeleteChartOfAccount={
                canDelete ? handleDeleteChartOfAccount : undefined
              }
              onEditChartOfAccount={
                canEdit ? handleEditChartOfAccount : undefined
              }
              onCreateChartOfAccount={
                canCreate ? handleCreateChartOfAccount : undefined
              }
              onRefresh={refetchChart}
              onFilterChange={handleChartFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              companyId={companyId}
            />
          )}
        </TabsContent>

        <TabsContent value="category1" className="space-y-4">
          {isLoading1 || isRefetching1 ? (
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
          ) : (category1Response as ApiResponse<ICoaCategory1>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <CoaCategory1Table
                data={category1Data}
                onCoaCategory1Select={handleViewCategory1}
                onDeleteCoaCategory1={
                  canDeleteCategory1 ? handleDeleteCategory1 : undefined
                }
                onEditCoaCategory1={
                  canEditCategory1 ? handleEditCategory1 : undefined
                }
                onCreateCoaCategory1={
                  canCreate ? handleCreateChartOfAccount : undefined
                }
                onRefresh={refetchChart}
                onFilterChange={handleChartFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                companyId={companyId}
              />
            </LockSkeleton>
          ) : (
            <CoaCategory1Table
              data={category1Data}
              onCoaCategory1Select={canView ? handleViewCategory1 : undefined}
              onDeleteCoaCategory1={
                canDeleteCategory1 ? handleDeleteCategory1 : undefined
              }
              onEditCoaCategory1={canEdit ? handleEditCategory1 : undefined}
              onCreateCoaCategory1={
                canCreate ? handleCreateCategory1 : undefined
              }
              onRefresh={refetch1}
              onFilterChange={handleCategory1FilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              companyId={companyId}
            />
          )}
        </TabsContent>

        <TabsContent value="category2" className="space-y-4">
          {isLoading2 || isRefetching2 ? (
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
          ) : (category2Response as ApiResponse<ICoaCategory2>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <CoaCategory2Table
                data={category2Data}
                onCoaCategory2Select={handleViewCategory2}
                onDeleteCoaCategory2={
                  canDeleteCategory2 ? handleDeleteCategory2 : undefined
                }
                onEditCoaCategory2={
                  canEditCategory2 ? handleEditCategory2 : undefined
                }
                onCreateCoaCategory2={
                  canCreate ? handleCreateChartOfAccount : undefined
                }
                onRefresh={refetch2}
                onFilterChange={handleCategory2FilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                companyId={companyId}
              />
            </LockSkeleton>
          ) : (
            <CoaCategory2Table
              data={category2Data}
              onCoaCategory2Select={canView ? handleViewCategory2 : undefined}
              onDeleteCoaCategory2={
                canDeleteCategory2 ? handleDeleteCategory2 : undefined
              }
              onEditCoaCategory2={canEdit ? handleEditCategory2 : undefined}
              onCreateCoaCategory2={
                canCreate ? handleCreateCategory2 : undefined
              }
              onRefresh={refetch2}
              onFilterChange={handleCategory2FilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              companyId={companyId}
            />
          )}
        </TabsContent>

        <TabsContent value="category3" className="space-y-4">
          {isLoading3 || isRefetching3 ? (
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
          ) : (category3Response as ApiResponse<ICoaCategory3>)?.result ===
            -2 ? (
            <LockSkeleton locked={true}>
              <CoaCategory3Table
                data={category3Data}
                onCoaCategory3Select={handleViewCategory3}
                onDeleteCoaCategory3={
                  canDeleteCategory3 ? handleDeleteCategory3 : undefined
                }
                onEditCoaCategory3={
                  canEditCategory3 ? handleEditCategory3 : undefined
                }
                onCreateCoaCategory3={
                  canCreate ? handleCreateCategory3 : undefined
                }
                onRefresh={refetch3}
                onFilterChange={handleCategory3FilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                companyId={companyId}
              />
            </LockSkeleton>
          ) : (
            <CoaCategory3Table
              data={category3Data}
              onCoaCategory3Select={canView ? handleViewCategory3 : undefined}
              onDeleteCoaCategory3={
                canDeleteCategory1 ? handleDeleteCategory1 : undefined
              }
              onEditCoaCategory3={canEdit ? handleEditCategory3 : undefined}
              onCreateCoaCategory3={
                canCreate ? handleCreateCategory1 : undefined
              }
              onRefresh={refetch3}
              onFilterChange={handleCategory3FilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              companyId={companyId}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Chart of Account Dialog */}
      <Dialog open={isModalChartOpen} onOpenChange={setIsModalChartOpen}>
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Chart of Account"}
              {modalMode === "edit" && "Update Chart of Account"}
              {modalMode === "view" && "View Chart of Account"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new chart of account to the system database."
                : modalMode === "edit"
                  ? "Update chart of account information in the system database."
                  : "View chart of account details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <ChartOfAccountForm
            initialData={
              modalMode !== "create" ? selectedChartOfAccount : undefined
            }
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalChartOpen(false)}
            isSubmitting={
              saveMutationChart.isPending || updateMutationChart.isPending
            }
            isReadOnly={modalMode === "view" || !canEdit}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Category 1 Dialog */}
      <Dialog
        open={isModalCategory1Open}
        onOpenChange={setIsModalCategory1Open}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Category 1"}
              {modalMode === "edit" && "Update Category 1"}
              {modalMode === "view" && "View Category 1"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new category 1 to the system database."
                : modalMode === "edit"
                  ? "Update category 1 information in the system database."
                  : "View category 1 details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CoaCategory1Form
            initialData={modalMode !== "create" ? selectedCategory1 : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalCategory1Open(false)}
            isSubmitting={saveMutation1.isPending || updateMutation1.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Category 2 Dialog */}
      <Dialog
        open={isModalCategory2Open}
        onOpenChange={setIsModalCategory2Open}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Category 2"}
              {modalMode === "edit" && "Update Category 2"}
              {modalMode === "view" && "View Category 2"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new category 2 to the system database."
                : modalMode === "edit"
                  ? "Update category 2 information in the system database."
                  : "View category 2 details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CoaCategory2Form
            initialData={modalMode !== "create" ? selectedCategory2 : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalCategory2Open(false)}
            isSubmitting={saveMutation2.isPending || updateMutation2.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Category 3 Dialog */}
      <Dialog
        open={isModalCategory3Open}
        onOpenChange={setIsModalCategory3Open}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" && "Create Category 3"}
              {modalMode === "edit" && "Update Category 3"}
              {modalMode === "view" && "View Category 3"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new category 3 to the system database."
                : modalMode === "edit"
                  ? "Update category 3 information in the system database."
                  : "View category 3 details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <CoaCategory3Form
            initialData={modalMode !== "create" ? selectedCategory3 : undefined}
            submitAction={handleFormSubmit}
            onCancel={() => setIsModalCategory3Open(false)}
            isSubmitting={saveMutation3.isPending || updateMutation3.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialogs */}
      <LoadExistingDialog
        open={showLoadDialogChart}
        onOpenChange={setShowLoadDialogChart}
        onLoad={handleLoadExistingChartofAccount}
        onCancel={() => setExistingChartofAccount(null)}
        code={existingChartofAccount?.glCode}
        name={existingChartofAccount?.glName}
        typeLabel="Chart of Account"
        isLoading={saveMutationChart.isPending || updateMutationChart.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory1}
        onOpenChange={setShowLoadDialogCategory1}
        onLoad={handleLoadExistingCoaCategory1}
        onCancel={() => setExistingCoaCategory1(null)}
        code={existingCoaCategory1?.coaCategoryCode}
        name={existingCoaCategory1?.coaCategoryName}
        typeLabel="COA Category 1"
        isLoading={saveMutation1.isPending || updateMutation1.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory2}
        onOpenChange={setShowLoadDialogCategory2}
        onLoad={handleLoadExistingCoaCategory2}
        onCancel={() => setExistingCoaCategory2(null)}
        code={existingCoaCategory2?.coaCategoryCode}
        name={existingCoaCategory2?.coaCategoryName}
        typeLabel="COA Category 2"
        isLoading={saveMutation2.isPending || updateMutation2.isPending}
      />

      <LoadExistingDialog
        open={showLoadDialogCategory3}
        onOpenChange={setShowLoadDialogCategory3}
        onLoad={handleLoadExistingCoaCategory3}
        onCancel={() => setExistingCoaCategory3(null)}
        code={existingCoaCategory3?.coaCategoryCode}
        name={existingCoaCategory3?.coaCategoryName}
        typeLabel="COA Category 3"
        isLoading={saveMutation3.isPending || updateMutation3.isPending}
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
            type: "chartofaccount",
          })
        }
        isDeleting={
          deleteConfirmation.type === "chartofaccount"
            ? deleteMutationChart.isPending
            : deleteConfirmation.type === "category1"
              ? deleteMutation1.isPending
              : deleteConfirmation.type === "category2"
                ? deleteMutation2.isPending
                : deleteMutation3.isPending
        }
      />
    </div>
  )
}
