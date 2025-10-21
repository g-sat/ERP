"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import {
  IChartOfAccount,
  IChartOfAccountFilter,
} from "@/interfaces/chartofaccount"
import {
  ICoaCategory1,
  ICoaCategory1Filter,
  ICoaCategory2,
  ICoaCategory2Filter,
  ICoaCategory3,
  ICoaCategory3Filter,
} from "@/interfaces/coacategory"
import { ChartOfAccountSchemaType } from "@/schemas/chartofaccount"
import {
  CoaCategory1SchemaType,
  CoaCategory2SchemaType,
  CoaCategory3SchemaType,
} from "@/schemas/coacategory"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import {
  ChartOfAccount,
  CoaCategory1,
  CoaCategory2,
  CoaCategory3,
} from "@/lib/api-routes"
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

import { ChartOfAccountForm } from "./components/chartofaccounts-form"
import { ChartOfAccountsTable } from "./components/chartofaccounts-table"
import { CoaCategory1Form } from "./components/coacategory1-form"
import { CoaCategory1Table } from "./components/coacategory1-table"
import { CoaCategory2Form } from "./components/coacategory2-form"
import { CoaCategory2Table } from "./components/coacategory2-table"
import { CoaCategory3Form } from "./components/coacategory3-form"
import { CoaCategory3Table } from "./components/coacategory3-table"

export default function ChartOfAccountPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.chartOfAccount
  const transactionId1 = MasterTransactionId.coaCategory1
  const transactionId2 = MasterTransactionId.coaCategory2
  const transactionId3 = MasterTransactionId.coaCategory3

  const { hasPermission } = usePermissionStore()
  const queryClient = useQueryClient()

  // Permissions
  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit1 = hasPermission(moduleId, transactionId1, "isEdit")
  const canDelete1 = hasPermission(moduleId, transactionId1, "isDelete")
  const canCreate1 = hasPermission(moduleId, transactionId1, "isCreate")
  const canView1 = hasPermission(moduleId, transactionId1, "isRead")
  const canEdit2 = hasPermission(moduleId, transactionId2, "isEdit")
  const canDelete2 = hasPermission(moduleId, transactionId2, "isDelete")
  const canView2 = hasPermission(moduleId, transactionId2, "isRead")
  const canCreate2 = hasPermission(moduleId, transactionId2, "isCreate")
  const canEdit3 = hasPermission(moduleId, transactionId3, "isEdit")
  const canDelete3 = hasPermission(moduleId, transactionId3, "isDelete")
  const canView3 = hasPermission(moduleId, transactionId3, "isRead")
  const canCreate3 = hasPermission(moduleId, transactionId3, "isCreate")

  // State for filters
  const [filters1, setFilters1] = useState<ICoaCategory1Filter>({})
  const [filters2, setFilters2] = useState<ICoaCategory2Filter>({})
  const [filters3, setFilters3] = useState<ICoaCategory3Filter>({})
  const [filtersChart, setFiltersChart] = useState<IChartOfAccountFilter>({})
  const [activeTab, setActiveTab] = useState("chartofaccount")

  // Data fetching
  const {
    data: category1Response,
    refetch: refetch1,
    isLoading: isLoading1,
  } = useGet<ICoaCategory1>(
    `${CoaCategory1.get}`,
    "coacategory1",
    filters1.search
  )

  const {
    data: category2Response,
    refetch: refetch2,
    isLoading: isLoading2,
  } = useGet<ICoaCategory2>(
    `${CoaCategory2.get}`,
    "coacategory2",
    filters2.search
  )

  const {
    data: category3Response,
    refetch: refetch3,
    isLoading: isLoading3,
  } = useGet<ICoaCategory3>(
    `${CoaCategory3.get}`,
    "coacategory3",
    filters3.search
  )

  const {
    data: chartOfAccountsResponse,
    refetch: refetchChart,
    isLoading: isLoadingChart,
  } = useGet<IChartOfAccount>(
    `${ChartOfAccount.get}`,
    "chartofaccounts",
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
    (chartOfAccountsResponse as ApiResponse<IChartOfAccount>)?.data || []

  // Mutations
  const saveMutation1 = usePersist<CoaCategory1SchemaType>(
    `${CoaCategory1.add}`
  )
  const updateMutation1 = usePersist<CoaCategory1SchemaType>(
    `${CoaCategory1.add}`
  )
  const deleteMutation1 = useDelete(`${CoaCategory1.delete}`)

  const saveMutation2 = usePersist<CoaCategory2SchemaType>(
    `${CoaCategory2.add}`
  )
  const updateMutation2 = usePersist<CoaCategory2SchemaType>(
    `${CoaCategory2.add}`
  )
  const deleteMutation2 = useDelete(`${CoaCategory2.delete}`)

  const saveMutation3 = usePersist<CoaCategory3SchemaType>(
    `${CoaCategory3.add}`
  )
  const updateMutation3 = usePersist<CoaCategory3SchemaType>(
    `${CoaCategory3.add}`
  )
  const deleteMutation3 = useDelete(`${CoaCategory3.delete}`)

  const saveMutationChart = usePersist<ChartOfAccountSchemaType>(
    `${ChartOfAccount.add}`
  )
  const updateMutationChart = usePersist<ChartOfAccountSchemaType>(
    `${ChartOfAccount.add}`
  )
  const deleteMutationChart = useDelete(`${ChartOfAccount.delete}`)

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
    IChartOfAccount | undefined
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
    queryKey: "" as string,
  })

  // Duplicate detection states
  const [showLoadDialogChart, setShowLoadDialogChart] = useState(false)
  const [existingChartOfAccount, setExistingChartOfAccount] =
    useState<IChartOfAccount | null>(null)

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
  }, [filters1.search, refetch1])

  useEffect(() => {
    if (filters2.search !== undefined) refetch2()
  }, [filters2.search, refetch2])

  useEffect(() => {
    if (filters3.search !== undefined) refetch3()
  }, [filters3.search, refetch3])

  useEffect(() => {
    if (filtersChart.search !== undefined) refetchChart()
  }, [filtersChart.search, refetchChart])

  // Action handlers
  const handleCreateChartOfAccount = () => {
    setModalMode("create")
    setSelectedChartOfAccount(undefined)
    setIsModalChartOpen(true)
  }

  const handleEditChartOfAccount = (chartOfAccount: IChartOfAccount) => {
    setModalMode("edit")
    setSelectedChartOfAccount(chartOfAccount)
    setIsModalChartOpen(true)
  }

  const handleViewChartOfAccount = (chartOfAccount: IChartOfAccount | null) => {
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

  const handleEdit1 = (category: ICoaCategory1) => {
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

  const handleEdit2 = (category: ICoaCategory2) => {
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

  const handleEdit3 = (category: ICoaCategory3) => {
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
  const handleChartFilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    setFiltersChart(filters as IChartOfAccountFilter)
  }

  const handleCategory1FilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    setFilters1(filters as ICoaCategory1Filter)
  }

  const handleCategory2FilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    setFilters2(filters as ICoaCategory2Filter)
  }

  const handleCategory3FilterChange = (filters: {
    search?: string
    sortOrder?: string
  }) => {
    setFilters3(filters as ICoaCategory3Filter)
  }

  // Helper function for API responses
  const handleApiResponse = (
    response: ApiResponse<
      IChartOfAccount | ICoaCategory1 | ICoaCategory2 | ICoaCategory3
    >
  ) => {
    if (response.result === 1) {
      return true
    } else {
      return false
    }
  }

  // Specialized form handlers
  const handleChartSubmit = async (data: ChartOfAccountSchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutationChart.mutateAsync(
          data
        )) as ApiResponse<IChartOfAccount>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["chartofaccounts"] })
        }
      } else if (modalMode === "edit" && selectedChartOfAccount) {
        const response = (await updateMutationChart.mutateAsync(
          data
        )) as ApiResponse<IChartOfAccount>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["chartofaccounts"] })
        }
      }
    } catch (error) {
      console.error("Chart of Account form submission error:", error)
    }
  }

  const handleCategory1Submit = async (data: CoaCategory1SchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation1.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory1>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["coacategory1"] })
        }
      } else if (modalMode === "edit" && selectedCategory1) {
        const response = (await updateMutation1.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory1>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["coacategory1"] })
        }
      }
    } catch (error) {
      console.error("Category 1 form submission error:", error)
    }
  }

  const handleCategory2Submit = async (data: CoaCategory2SchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation2.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory2>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["coacategory2"] })
        }
      } else if (modalMode === "edit" && selectedCategory2) {
        const response = (await updateMutation2.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory2>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["coacategory2"] })
        }
      }
    } catch (error) {
      console.error("Category 2 form submission error:", error)
    }
  }

  const handleCategory3Submit = async (data: CoaCategory3SchemaType) => {
    try {
      if (modalMode === "create") {
        const response = (await saveMutation3.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory3>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["coacategory3"] })
        }
      } else if (modalMode === "edit" && selectedCategory3) {
        const response = (await updateMutation3.mutateAsync(
          data
        )) as ApiResponse<ICoaCategory3>
        if (handleApiResponse(response)) {
          queryClient.invalidateQueries({ queryKey: ["coacategory3"] })
        }
      }
    } catch (error) {
      console.error("Category 3 form submission error:", error)
    }
  }

  // State for save confirmations
  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean
    data:
      | ChartOfAccountSchemaType
      | CoaCategory1SchemaType
      | CoaCategory2SchemaType
      | CoaCategory3SchemaType
      | null
    type: "chartofaccount" | "category1" | "category2" | "category3"
  }>({
    isOpen: false,
    data: null,
    type: "chartofaccount",
  })

  // Main form submit handler - shows confirmation first
  const handleFormSubmit = (
    data:
      | ChartOfAccountSchemaType
      | CoaCategory1SchemaType
      | CoaCategory2SchemaType
      | CoaCategory3SchemaType
  ) => {
    let type: "chartofaccount" | "category1" | "category2" | "category3" =
      "chartofaccount"
    if (isModalCategory1Open) type = "category1"
    else if (isModalCategory2Open) type = "category2"
    else if (isModalCategory3Open) type = "category3"

    setSaveConfirmation({
      isOpen: true,
      data: data,
      type: type,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmit = async (
    data:
      | ChartOfAccountSchemaType
      | CoaCategory1SchemaType
      | CoaCategory2SchemaType
      | CoaCategory3SchemaType
  ) => {
    try {
      if (saveConfirmation.type === "chartofaccount") {
        await handleChartSubmit(data as ChartOfAccountSchemaType)
        setIsModalChartOpen(false)
      } else if (saveConfirmation.type === "category1") {
        await handleCategory1Submit(data as CoaCategory1SchemaType)
        setIsModalCategory1Open(false)
      } else if (saveConfirmation.type === "category2") {
        await handleCategory2Submit(data as CoaCategory2SchemaType)
        setIsModalCategory2Open(false)
      } else if (saveConfirmation.type === "category3") {
        await handleCategory3Submit(data as CoaCategory3SchemaType)
        setIsModalCategory3Open(false)
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  // Delete handlers
  const handleDeleteChartOfAccount = (chartOfAccountId: string) => {
    const chartOfAccountToDelete = chartOfAccountsData.find(
      (b) => b.glId === Number(chartOfAccountId)
    )
    if (!chartOfAccountToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: chartOfAccountId.toString(),
      name: chartOfAccountToDelete.glName,
      type: "chartofaccount",
      queryKey: "chartofaccounts",
    })
  }

  const handleDelete1 = (id: string) => {
    const categoryToDelete = category1Data.find(
      (c) => c.coaCategoryId === Number(id)
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.coaCategoryName,
      type: "category1",
      queryKey: "coacategory1",
    })
  }

  const handleDelete2 = (id: string) => {
    const categoryToDelete = category2Data.find(
      (c) => c.coaCategoryId === Number(id)
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.coaCategoryName,
      type: "category2",
      queryKey: "coacategory2",
    })
  }

  const handleDelete3 = (id: string) => {
    const categoryToDelete = category3Data.find(
      (c) => c.coaCategoryId === Number(id)
    )
    if (!categoryToDelete) return

    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.coaCategoryName,
      type: "category3",
      queryKey: "coacategory3",
    })
  }

  // Individual deletion executors for each entity type
  const executeDeleteChartOfAccount = async (id: string) => {
    await deleteMutationChart.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ["chartofaccounts"] })
  }

  const executeDeleteCategory1 = async (id: string) => {
    await deleteMutation1.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ["coacategory1"] })
  }

  const executeDeleteCategory2 = async (id: string) => {
    await deleteMutation2.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ["coacategory2"] })
  }

  const executeDeleteCategory3 = async (id: string) => {
    await deleteMutation3.mutateAsync(id)
    queryClient.invalidateQueries({ queryKey: ["coacategory3"] })
  }

  // Mapping of deletion types to their executor functions
  const deletionExecutors = {
    chartofaccount: executeDeleteChartOfAccount,
    category1: executeDeleteCategory1,
    category2: executeDeleteCategory2,
    category3: executeDeleteCategory3,
  } as const

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.id || !deleteConfirmation.type) return

    const executor = deletionExecutors[deleteConfirmation.type]
    if (!executor) return

    await executor(deleteConfirmation.id)

    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "chartofaccount",
      queryKey: "",
    })
  }

  // Duplicate detection - Chart of Account
  const handleChartCodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = (await getData(
        `${ChartOfAccount.getByCode}/${trimmedCode}`
      )) as ApiResponse<IChartOfAccount>

      if (response.result === 1 && response.data) {
        const chartData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (chartData) {
          setExistingChartOfAccount(chartData as IChartOfAccount)
          setShowLoadDialogChart(true)
        }
      }
    } catch (error) {
      console.error("Error checking Chart of Account code availability:", error)
    }
  }

  // Duplicate detection - Category 1
  const handleCategory1CodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = (await getData(
        `${CoaCategory1.getByCode}/${trimmedCode}`
      )) as ApiResponse<ICoaCategory1>

      if (response.result === 1 && response.data) {
        const category1Data = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (category1Data) {
          setExistingCoaCategory1(category1Data as ICoaCategory1)
          setShowLoadDialogCategory1(true)
        }
      }
    } catch (error) {
      console.error("Error checking Category 1 code availability:", error)
    }
  }

  // Duplicate detection - Category 2
  const handleCategory2CodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = (await getData(
        `${CoaCategory2.getByCode}/${trimmedCode}`
      )) as ApiResponse<ICoaCategory2>

      if (response.result === 1 && response.data) {
        const category2Data = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (category2Data) {
          setExistingCoaCategory2(category2Data as ICoaCategory2)
          setShowLoadDialogCategory2(true)
        }
      }
    } catch (error) {
      console.error("Error checking Category 2 code availability:", error)
    }
  }

  // Duplicate detection - Category 3
  const handleCategory3CodeBlur = async (code: string) => {
    if (modalMode === "edit" || modalMode === "view") return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      const response = (await getData(
        `${CoaCategory3.getByCode}/${trimmedCode}`
      )) as ApiResponse<ICoaCategory3>

      if (response.result === 1 && response.data) {
        const category3Data = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (category3Data) {
          setExistingCoaCategory3(category3Data as ICoaCategory3)
          setShowLoadDialogCategory3(true)
        }
      }
    } catch (error) {
      console.error("Error checking Category 3 code availability:", error)
    }
  }

  // Load existing records
  const handleLoadExistingChartOfAccount = () => {
    if (existingChartOfAccount) {
      setModalMode("edit")
      setSelectedChartOfAccount(existingChartOfAccount)
      setShowLoadDialogChart(false)
      setExistingChartOfAccount(null)
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
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
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
          {isLoadingChart ? (
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
          ) : (chartOfAccountsResponse as ApiResponse<IChartOfAccount>)
              ?.result === -2 ||
            !canView ||
            !canEdit ||
            !canDelete ||
            !canCreate ? (
            <LockSkeleton locked={true}>
              <ChartOfAccountsTable
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={moduleId}
                transactionId={transactionId}
                canView={false}
                canCreate={false}
                canEdit={false}
                canDelete={false}
              />
            </LockSkeleton>
          ) : (
            <ChartOfAccountsTable
              data={chartOfAccountsData}
              onSelect={canView ? handleViewChartOfAccount : undefined}
              onDelete={canDelete ? handleDeleteChartOfAccount : undefined}
              onEdit={canEdit ? handleEditChartOfAccount : undefined}
              onCreate={canCreate ? handleCreateChartOfAccount : undefined}
              onRefresh={refetchChart}
              onFilterChange={handleChartFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canView={canView}
              canCreate={canCreate}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="category1" className="space-y-4">
          {isLoading1 ? (
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
              -2 ||
            !canView1 ||
            !canEdit1 ||
            !canDelete1 ||
            !canCreate1 ? (
            <LockSkeleton locked={true}>
              <CoaCategory1Table
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={moduleId}
                transactionId={transactionId}
                canView={false}
                canCreate={false}
                canEdit={false}
                canDelete={false}
              />
            </LockSkeleton>
          ) : (
            <CoaCategory1Table
              data={category1Data}
              isLoading={isLoading1}
              onSelect={canView ? handleViewCategory1 : undefined}
              onDelete={canDelete1 ? handleDelete1 : undefined}
              onEdit={canEdit ? handleEdit1 : undefined}
              onCreate={canCreate ? handleCreateCategory1 : undefined}
              onRefresh={refetch1}
              onFilterChange={handleCategory1FilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canView={canView1}
              canCreate={canCreate1}
              canEdit={canEdit1}
              canDelete={canDelete1}
            />
          )}
        </TabsContent>

        <TabsContent value="category2" className="space-y-4">
          {isLoading2 ? (
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
              -2 ||
            !canView2 ||
            !canEdit2 ||
            !canDelete2 ||
            !canCreate2 ? (
            <LockSkeleton locked={true}>
              <CoaCategory2Table
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={moduleId}
                transactionId={transactionId}
                canView={false}
                canCreate={false}
                canEdit={false}
                canDelete={false}
              />
            </LockSkeleton>
          ) : (
            <CoaCategory2Table
              data={category2Data}
              isLoading={isLoading2}
              onSelect={canView ? handleViewCategory2 : undefined}
              onDelete={canDelete2 ? handleDelete2 : undefined}
              onEdit={canEdit ? handleEdit2 : undefined}
              onCreate={canCreate ? handleCreateCategory2 : undefined}
              onRefresh={refetch2}
              onFilterChange={handleCategory2FilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canView={canView2}
              canCreate={canCreate2}
              canEdit={canEdit2}
              canDelete={canDelete2}
            />
          )}
        </TabsContent>

        <TabsContent value="category3" className="space-y-4">
          {isLoading3 ? (
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
              -2 ||
            !canView3 ||
            !canEdit3 ||
            !canDelete3 ||
            !canCreate3 ? (
            <LockSkeleton locked={true}>
              <CoaCategory3Table
                data={[]}
                isLoading={false}
                onSelect={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
                onCreate={() => {}}
                onRefresh={() => {}}
                onFilterChange={() => {}}
                moduleId={moduleId}
                transactionId={transactionId}
                canView={false}
                canCreate={false}
                canEdit={false}
                canDelete={false}
              />
            </LockSkeleton>
          ) : (
            <CoaCategory3Table
              data={category3Data}
              isLoading={isLoading3}
              onSelect={canView ? handleViewCategory3 : undefined}
              onDelete={canDelete3 ? handleDelete3 : undefined}
              onEdit={canEdit ? handleEdit3 : undefined}
              onCreate={canCreate ? handleCreateCategory3 : undefined}
              onRefresh={refetch3}
              onFilterChange={handleCategory3FilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              canView={canView3}
              canCreate={canCreate3}
              canEdit={canEdit3}
              canDelete={canDelete3}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Chart of Account Dialog */}
      <Dialog open={isModalChartOpen} onOpenChange={setIsModalChartOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-3xl overflow-auto sm:max-w-2xl"
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
            onCancelAction={() => setIsModalChartOpen(false)}
            isSubmitting={
              saveMutationChart.isPending || updateMutationChart.isPending
            }
            isReadOnly={modalMode === "view" || !canEdit}
            onCodeBlur={handleChartCodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Category 1 Dialog */}
      <Dialog
        open={isModalCategory1Open}
        onOpenChange={setIsModalCategory1Open}
      >
        <DialogContent
          className="max-h-[90vh] max-w-3xl overflow-auto sm:max-w-2xl"
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
            onCancelAction={() => setIsModalCategory1Open(false)}
            isSubmitting={saveMutation1.isPending || updateMutation1.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCategory1CodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Category 2 Dialog */}
      <Dialog
        open={isModalCategory2Open}
        onOpenChange={setIsModalCategory2Open}
      >
        <DialogContent
          className="max-h-[90vh] max-w-3xl overflow-auto sm:max-w-2xl"
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
            onCancelAction={() => setIsModalCategory2Open(false)}
            isSubmitting={saveMutation2.isPending || updateMutation2.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCategory2CodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Category 3 Dialog */}
      <Dialog
        open={isModalCategory3Open}
        onOpenChange={setIsModalCategory3Open}
      >
        <DialogContent
          className="max-h-[90vh] max-w-3xl overflow-auto sm:max-w-2xl"
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
            onCancelAction={() => setIsModalCategory3Open(false)}
            isSubmitting={saveMutation3.isPending || updateMutation3.isPending}
            isReadOnly={modalMode === "view"}
            onCodeBlur={handleCategory3CodeBlur}
          />
        </DialogContent>
      </Dialog>

      {/* Duplicate Record Dialogs */}
      <LoadConfirmation
        open={showLoadDialogChart}
        onOpenChange={setShowLoadDialogChart}
        onLoad={handleLoadExistingChartOfAccount}
        onCancel={() => setExistingChartOfAccount(null)}
        code={existingChartOfAccount?.glCode}
        name={existingChartOfAccount?.glName}
        typeLabel="Chart of Account"
        isLoading={saveMutationChart.isPending || updateMutationChart.isPending}
      />

      <LoadConfirmation
        open={showLoadDialogCategory1}
        onOpenChange={setShowLoadDialogCategory1}
        onLoad={handleLoadExistingCoaCategory1}
        onCancel={() => setExistingCoaCategory1(null)}
        code={existingCoaCategory1?.coaCategoryCode}
        name={existingCoaCategory1?.coaCategoryName}
        typeLabel="COA Category 1"
        isLoading={saveMutation1.isPending || updateMutation1.isPending}
      />

      <LoadConfirmation
        open={showLoadDialogCategory2}
        onOpenChange={setShowLoadDialogCategory2}
        onLoad={handleLoadExistingCoaCategory2}
        onCancel={() => setExistingCoaCategory2(null)}
        code={existingCoaCategory2?.coaCategoryCode}
        name={existingCoaCategory2?.coaCategoryName}
        typeLabel="COA Category 2"
        isLoading={saveMutation2.isPending || updateMutation2.isPending}
      />

      <LoadConfirmation
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
            queryKey: "",
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
          saveConfirmation.type === "chartofaccount"
            ? (saveConfirmation.data as ChartOfAccountSchemaType)?.glName || ""
            : saveConfirmation.type === "category1"
              ? (saveConfirmation.data as CoaCategory1SchemaType)
                  ?.coaCategoryName || ""
              : saveConfirmation.type === "category2"
                ? (saveConfirmation.data as CoaCategory2SchemaType)
                    ?.coaCategoryName || ""
                : (saveConfirmation.data as CoaCategory3SchemaType)
                    ?.coaCategoryName || ""
        }
        operationType={modalMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmation.data) {
            handleConfirmedFormSubmit(saveConfirmation.data)
          }
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "chartofaccount",
          })
        }}
        onCancel={() =>
          setSaveConfirmation({
            isOpen: false,
            data: null,
            type: "chartofaccount",
          })
        }
        isSaving={
          saveConfirmation.type === "chartofaccount"
            ? saveMutationChart.isPending || updateMutationChart.isPending
            : saveConfirmation.type === "category1"
              ? saveMutation1.isPending || updateMutation1.isPending
              : saveConfirmation.type === "category2"
                ? saveMutation2.isPending || updateMutation2.isPending
                : saveMutation3.isPending || updateMutation3.isPending
        }
      />
    </div>
  )
}
