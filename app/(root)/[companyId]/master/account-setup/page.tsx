"use client"

import { useCallback, useState } from "react"
import {
  IAccountSetup,
  IAccountSetupCategory,
  IAccountSetupCategoryFilter,
  IAccountSetupDt,
  IAccountSetupDtFilter,
  IAccountSetupFilter,
} from "@/interfaces/accountsetup"
import { ApiResponse } from "@/interfaces/auth"
import {
  AccountSetupCategoryFormValues,
  AccountSetupDtFormValues,
  AccountSetupFormValues,
} from "@/schemas/accountsetup"
import { usePermissionStore } from "@/stores/permission-store"
import { useQueryClient } from "@tanstack/react-query"

import { getData } from "@/lib/api-client"
import {
  AccountSetup,
  AccountSetupCategory,
  AccountSetupDt,
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
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { SaveConfirmation } from "@/components/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { LockSkeleton } from "@/components/skeleton/lock-skeleton"
import { LoadExistingDialog } from "@/components/ui-custom/master-loadexisting-dialog"

import { AccountSetupCategoryForm } from "./components/account-setup-category-form"
import { AccountSetupCategoryTable } from "./components/account-setup-category-table"
import { AccountSetupForm } from "./components/account-setup-form"
import { AccountSetupTable } from "./components/account-setup-table"
import { AccountSetupDtForm } from "./components/account-setupdt-form"
import { AccountSetupDtTable } from "./components/account-setupdt-table"

export default function AccountSetupPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.accountSetup
  const transactionIdCategory = MasterTransactionId.accountSetupCategory
  const transactionIdDt = MasterTransactionId.accountSetupDt

  const { hasPermission } = usePermissionStore()

  const canCreate = hasPermission(moduleId, transactionId, "isCreate")
  const canView = hasPermission(moduleId, transactionId, "isRead")
  const canEdit = hasPermission(moduleId, transactionId, "isEdit")
  const canDelete = hasPermission(moduleId, transactionId, "isDelete")

  const canCreateCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isCreate"
  )
  const canViewCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isRead"
  )
  const canEditCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isEdit"
  )
  const canDeleteCategory = hasPermission(
    moduleId,
    transactionIdCategory,
    "isDelete"
  )

  const canCreateDt = hasPermission(moduleId, transactionIdDt, "isCreate")
  const canViewDt = hasPermission(moduleId, transactionIdDt, "isRead")
  const canEditDt = hasPermission(moduleId, transactionIdDt, "isEdit")
  const canDeleteDt = hasPermission(moduleId, transactionIdDt, "isDelete")

  const [filtersCategory, setFiltersCategory] =
    useState<IAccountSetupCategoryFilter>({})
  const [filtersSetup, setFiltersSetup] = useState<IAccountSetupFilter>({})
  const [filtersDt, setFiltersDt] = useState<IAccountSetupDtFilter>({})

  // Account Setup Category data
  const {
    data: categoryResponse,
    refetch: refetchCategory,
    isLoading: isLoadingCategory,
  } = useGet<IAccountSetupCategory>(
    `${AccountSetupCategory.get}`,
    "accountSetupCategories",
    filtersCategory.search
  )

  // Account Setup data
  const {
    data: setupResponse,
    refetch: refetchSetup,
    isLoading: isLoadingSetup,
  } = useGet<IAccountSetup>(
    `${AccountSetup.get}`,
    "accountSetups",
    filtersSetup.search
  )

  // Account Setup Dt data
  const {
    data: dtResponse,
    refetch: refetchDt,
    isLoading: isLoadingDt,
  } = useGet<IAccountSetupDt>(
    `${AccountSetupDt.get}`,
    "accountSetupDts",
    filtersDt.search
  )

  const { result: categoryResult, data: categoryData } =
    (categoryResponse as ApiResponse<IAccountSetupCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { result: setupResult, data: setupData } =
    (setupResponse as ApiResponse<IAccountSetup>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { result: dtResult, data: dtData } =
    (dtResponse as ApiResponse<IAccountSetupDt>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Account Setup Category mutations
  const saveMutationCategory = usePersist<AccountSetupCategoryFormValues>(
    `${AccountSetupCategory.add}`
  )
  const updateMutationCategory = usePersist<AccountSetupCategoryFormValues>(
    `${AccountSetupCategory.add}`
  )
  const deleteMutationCategory = useDelete(`${AccountSetupCategory.delete}`)

  // Account Setup mutations
  const saveMutationSetup = usePersist<AccountSetupFormValues>(
    `${AccountSetup.add}`
  )
  const updateMutationSetup = usePersist<AccountSetupFormValues>(
    `${AccountSetup.add}`
  )
  const deleteMutationSetup = useDelete(`${AccountSetup.delete}`)

  // Account Setup Dt mutations
  const saveMutationDt = usePersist<AccountSetupDtFormValues>(
    `${AccountSetupDt.add}`
  )
  const updateMutationDt = usePersist<AccountSetupDtFormValues>(
    `${AccountSetupDt.add}`
  )
  const deleteMutationDt = useDelete(`${AccountSetupDt.delete}`)

  // Account Setup Category state
  const [selectedCategory, setSelectedCategory] = useState<
    IAccountSetupCategory | undefined
  >(undefined)
  const [isModalCategoryOpen, setIsModalCategoryOpen] = useState(false)
  const [modalCategoryMode, setModalCategoryMode] = useState<
    "create" | "edit" | "view"
  >("create")

  // Account Setup state
  const [selectedSetup, setSelectedSetup] = useState<IAccountSetup | undefined>(
    undefined
  )
  const [isModalSetupOpen, setIsModalSetupOpen] = useState(false)
  const [modalSetupMode, setModalSetupMode] = useState<
    "create" | "edit" | "view"
  >("create")

  // Account Setup Dt state
  const [selectedDt, setSelectedDt] = useState<IAccountSetupDt | undefined>(
    undefined
  )
  const [isModalDtOpen, setIsModalDtOpen] = useState(false)
  const [modalDtMode, setModalDtMode] = useState<"create" | "edit" | "view">(
    "create"
  )

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    id: string | null
    name: string | null
    type: "setup" | "category" | "dt"
  }>({
    isOpen: false,
    id: null,
    name: null,
    type: "setup",
  })

  // State for save confirmations
  const [saveConfirmationCategory, setSaveConfirmationCategory] = useState<{
    isOpen: boolean
    data: AccountSetupCategoryFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  const [saveConfirmationSetup, setSaveConfirmationSetup] = useState<{
    isOpen: boolean
    data: AccountSetupFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  const [saveConfirmationDt, setSaveConfirmationDt] = useState<{
    isOpen: boolean
    data: AccountSetupDtFormValues | null
  }>({
    isOpen: false,
    data: null,
  })

  // State for code availability check
  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingCategory, setExistingCategory] =
    useState<IAccountSetupCategory | null>(null)

  const [showLoadDialogSetup, setShowLoadDialogSetup] = useState(false)
  const [existingSetup, setExistingSetup] = useState<IAccountSetup | null>(null)

  // Filter change handlers
  const handleCategoryFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Category filter change called with:", newFilters)
      setFiltersCategory(newFilters as IAccountSetupCategoryFilter)
    },
    []
  )

  const handleSetupFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Setup filter change called with:", newFilters)
      setFiltersSetup(newFilters as IAccountSetupFilter)
    },
    []
  )

  const handleDtFilterChange = useCallback(
    (newFilters: { search?: string; sortOrder?: string }) => {
      console.log("Dt filter change called with:", newFilters)
      setFiltersDt(newFilters as IAccountSetupDtFilter)
    },
    []
  )

  const handleCategorySelect = (category: IAccountSetupCategory | null) => {
    if (!category) return
    setModalCategoryMode("view")
    setSelectedCategory(category)
    setIsModalCategoryOpen(true)
  }

  const handleCreateCategory = () => {
    setModalCategoryMode("create")
    setSelectedCategory(undefined)
    setIsModalCategoryOpen(true)
  }

  const handleEditCategory = (category: IAccountSetupCategory) => {
    setModalCategoryMode("edit")
    setSelectedCategory(category)
    setIsModalCategoryOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    const categoryToDelete = categoryData?.find(
      (c) => c.accSetupCategoryId.toString() === id
    )
    if (!categoryToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: categoryToDelete.accSetupCategoryName,
      type: "category",
    })
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmitCategory = (data: AccountSetupCategoryFormValues) => {
    setSaveConfirmationCategory({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmitCategory = async (
    data: AccountSetupCategoryFormValues
  ) => {
    try {
      if (modalCategoryMode === "create") {
        const response = await saveMutationCategory.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({
            queryKey: ["accountSetupCategories"],
          })
        }
      } else if (modalCategoryMode === "edit" && selectedCategory) {
        const response = await updateMutationCategory.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({
            queryKey: ["accountSetupCategories"],
          })
        }
      }
      setIsModalCategoryOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleSetupSelect = (setup: IAccountSetup | null) => {
    if (!setup) return
    setModalSetupMode("view")
    setSelectedSetup(setup)
    setIsModalSetupOpen(true)
  }

  const handleCreateSetup = () => {
    setModalSetupMode("create")
    setSelectedSetup(undefined)
    setIsModalSetupOpen(true)
  }

  const handleEditSetup = (setup: IAccountSetup) => {
    setModalSetupMode("edit")
    setSelectedSetup(setup)
    setIsModalSetupOpen(true)
  }

  const handleDeleteSetup = (id: string) => {
    const setupToDelete = setupData?.find((c) => c.accSetupId.toString() === id)
    if (!setupToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: setupToDelete.accSetupName,
      type: "setup",
    })
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmitSetup = (data: AccountSetupFormValues) => {
    setSaveConfirmationSetup({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmitSetup = async (
    data: AccountSetupFormValues
  ) => {
    try {
      if (modalSetupMode === "create") {
        const response = await saveMutationSetup.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({
            queryKey: ["accountSetups"],
          })
        }
      } else if (modalSetupMode === "edit" && selectedSetup) {
        const response = await updateMutationSetup.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["accountSetups"] })
        }
      }
      setIsModalSetupOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleDtSelect = (dt: IAccountSetupDt | null) => {
    if (!dt) return
    setModalDtMode("view")
    setSelectedDt(dt)
    setIsModalDtOpen(true)
  }

  const handleCreateDt = () => {
    setModalDtMode("create")
    setSelectedDt(undefined)
    setIsModalDtOpen(true)
  }

  const handleEditDt = (dt: IAccountSetupDt) => {
    setModalDtMode("edit")
    setSelectedDt(dt)
    setIsModalDtOpen(true)
  }

  const handleDeleteDt = (id: string) => {
    const dtToDelete = dtData?.find((c) => c.accSetupId.toString() === id)
    if (!dtToDelete) return
    setDeleteConfirmation({
      isOpen: true,
      id: id,
      name: dtToDelete.accSetupName,
      type: "dt",
    })
  }

  // Handler for form submission (create or edit) - shows confirmation first
  const handleFormSubmitDt = (data: AccountSetupDtFormValues) => {
    setSaveConfirmationDt({
      isOpen: true,
      data: data,
    })
  }

  // Handler for confirmed form submission
  const handleConfirmedFormSubmitDt = async (
    data: AccountSetupDtFormValues
  ) => {
    try {
      if (modalDtMode === "create") {
        const response = await saveMutationDt.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["accountSetupDts"] })
        }
      } else if (modalDtMode === "edit" && selectedDt) {
        const response = await updateMutationDt.mutateAsync(data)
        if (response.result === 1) {
          queryClient.invalidateQueries({ queryKey: ["accountSetupDts"] })
        }
      }
      setIsModalDtOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    let queryKey
    switch (deleteConfirmation.type) {
      case "setup":
        mutation = deleteMutationSetup
        queryKey = ["accountSetups"]
        break
      case "category":
        mutation = deleteMutationCategory
        queryKey = ["accountSetupCategories"]
        break
      case "dt":
        mutation = deleteMutationDt
        queryKey = ["accountSetupDts"]
        break
      default:
        return
    }

    mutation.mutateAsync(deleteConfirmation.id).then(() => {
      queryClient.invalidateQueries({ queryKey })
    })
    setDeleteConfirmation({
      isOpen: false,
      id: null,
      name: null,
      type: "setup",
    })
  }

  // Handler for code availability check
  const handleCodeBlur = async (code: string, type: "category" | "setup") => {
    if (
      modalCategoryMode === "edit" ||
      modalCategoryMode === "view" ||
      modalSetupMode === "edit" ||
      modalSetupMode === "view"
    )
      return

    const trimmedCode = code?.trim()
    if (!trimmedCode) return

    try {
      if (type === "category" && isModalCategoryOpen) {
        const response = (await getData(
          `${AccountSetupCategory.getByCode}/${trimmedCode}`
        )) as ApiResponse<IAccountSetupCategory>
        if (response.result === 1 && response.data) {
          const categoryData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (categoryData) {
            const validCategoryData: IAccountSetupCategory = {
              accSetupCategoryId: categoryData.accSetupCategoryId,
              accSetupCategoryCode: categoryData.accSetupCategoryCode,
              accSetupCategoryName: categoryData.accSetupCategoryName,
              companyId: categoryData.companyId,
              createById: categoryData.createById || 0,
              editById: categoryData.editById || 0,
              remarks: categoryData.remarks || "",
              isActive: categoryData.isActive ?? true,
              createBy: categoryData.createBy,
              editBy: categoryData.editBy,
              createDate: categoryData.createDate,
              editDate: categoryData.editDate,
            }
            setExistingCategory(validCategoryData)
            setShowLoadDialogCategory(true)
          }
        }
      } else if (type === "setup" && isModalSetupOpen) {
        const response = (await getData(
          `${AccountSetup.getByCode}/${trimmedCode}`
        )) as ApiResponse<IAccountSetup>
        if (response.result === 1 && response.data) {
          const setupData = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (setupData) {
            const validSetupData: IAccountSetup = {
              accSetupId: setupData.accSetupId,
              accSetupCode: setupData.accSetupCode,
              accSetupName: setupData.accSetupName,
              accSetupCategoryId: setupData.accSetupCategoryId,
              accSetupCategoryCode: setupData.accSetupCategoryCode || "",
              accSetupCategoryName: setupData.accSetupCategoryName || "",
              companyId: setupData.companyId,
              createById: setupData.createById || 0,
              editById: setupData.editById || 0,
              remarks: setupData.remarks || "",
              isActive: setupData.isActive ?? true,
              createBy: setupData.createBy,
              editBy: setupData.editBy,
              createDate: setupData.createDate,
              editDate: setupData.editDate,
            }
            setExistingSetup(validSetupData)
            setShowLoadDialogSetup(true)
          }
        }
      }
    } catch (error) {
      console.error("Error checking code availability:", error)
    }
  }

  // Handler for loading existing category
  const handleLoadExistingCategory = () => {
    if (existingCategory) {
      setModalCategoryMode("edit")
      setSelectedCategory(existingCategory)
      setShowLoadDialogCategory(false)
      setExistingCategory(null)
    }
  }

  // Handler for loading existing setup
  const handleLoadExistingSetup = () => {
    if (existingSetup) {
      setModalSetupMode("edit")
      setSelectedSetup(existingSetup)
      setShowLoadDialogSetup(false)
      setExistingSetup(null)
    }
  }

  const queryClient = useQueryClient()

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Account Setup
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage account setup information and settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="account-setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account-setup">Account Setup</TabsTrigger>
          <TabsTrigger value="account-setup-dt">
            Account Setup Detail
          </TabsTrigger>
          <TabsTrigger value="account-setup-category">
            Account Setup Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account-setup" className="space-y-4">
          {isLoadingSetup ? (
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
          ) : setupResult === -2 ? (
            <LockSkeleton locked={true}>
              <AccountSetupTable
                data={[]}
                isLoading={false}
                onSelect={canView ? handleSetupSelect : undefined}
                onDelete={canDelete ? handleDeleteSetup : undefined}
                onEdit={canEdit ? handleEditSetup : undefined}
                onCreate={canCreate ? handleCreateSetup : undefined}
                onRefresh={refetchSetup}
                onFilterChange={handleSetupFilterChange}
                moduleId={moduleId}
                transactionId={transactionId}
                // Pass permissions to table
                canEdit={canEdit}
                canDelete={canDelete}
                canView={canView}
                canCreate={canCreate}
              />
            </LockSkeleton>
          ) : (
            <AccountSetupTable
              data={filtersSetup.search ? [] : setupData || []}
              onSelect={canView ? handleSetupSelect : undefined}
              onDelete={canDelete ? handleDeleteSetup : undefined}
              onEdit={canEdit ? handleEditSetup : undefined}
              onCreate={canCreate ? handleCreateSetup : undefined}
              onRefresh={refetchSetup}
              onFilterChange={handleSetupFilterChange}
              moduleId={moduleId}
              transactionId={transactionId}
              // Pass permissions to table
              canEdit={canEdit}
              canDelete={canDelete}
              canView={canView}
              canCreate={canCreate}
            />
          )}
        </TabsContent>

        <TabsContent value="account-setup-dt" className="space-y-4">
          {isLoadingDt ? (
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
          ) : dtResult === -2 ? (
            <LockSkeleton locked={true}>
              <AccountSetupDtTable
                data={[]}
                isLoading={false}
                onSelect={canViewDt ? handleDtSelect : undefined}
                onDelete={canDeleteDt ? handleDeleteDt : undefined}
                onEdit={canEditDt ? handleEditDt : undefined}
                onCreate={canCreateDt ? handleCreateDt : undefined}
                onRefresh={refetchDt}
                onFilterChange={handleDtFilterChange}
                moduleId={moduleId}
                transactionId={transactionIdDt}
                canEdit={canEditDt}
                canDelete={canDeleteDt}
                canView={canViewDt}
                canCreate={canCreateDt}
              />
            </LockSkeleton>
          ) : (
            <AccountSetupDtTable
              data={filtersDt.search ? [] : dtData || []}
              onSelect={canViewDt ? handleDtSelect : undefined}
              onDelete={canDeleteDt ? handleDeleteDt : undefined}
              onEdit={canEditDt ? handleEditDt : undefined}
              onCreate={canCreateDt ? handleCreateDt : undefined}
              onRefresh={refetchDt}
              onFilterChange={handleDtFilterChange}
              moduleId={moduleId}
              transactionId={transactionIdDt}
              canEdit={canEditDt}
              canDelete={canDeleteDt}
              canView={canViewDt}
              canCreate={canCreateDt}
            />
          )}
        </TabsContent>

        <TabsContent value="account-setup-category" className="space-y-4">
          {isLoadingCategory ? (
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
          ) : categoryResult === -2 ? (
            <LockSkeleton locked={true}>
              <AccountSetupCategoryTable
                data={[]}
                onSelect={canViewCategory ? handleCategorySelect : undefined}
                onDelete={canDeleteCategory ? handleDeleteCategory : undefined}
                onEdit={canEditCategory ? handleEditCategory : undefined}
                onCreate={canCreateCategory ? handleCreateCategory : undefined}
                onRefresh={refetchCategory}
                onFilterChange={handleCategoryFilterChange}
                moduleId={moduleId}
                transactionId={transactionIdCategory}
                canEdit={canEditCategory}
                canDelete={canDeleteCategory}
                canView={canViewCategory}
                canCreate={canCreateCategory}
              />
            </LockSkeleton>
          ) : (
            <AccountSetupCategoryTable
              data={filtersCategory.search ? [] : categoryData || []}
              onSelect={canViewCategory ? handleCategorySelect : undefined}
              onDelete={canDeleteCategory ? handleDeleteCategory : undefined}
              onEdit={canEditCategory ? handleEditCategory : undefined}
              onCreate={canCreateCategory ? handleCreateCategory : undefined}
              onRefresh={refetchCategory}
              onFilterChange={handleCategoryFilterChange}
              moduleId={moduleId}
              transactionId={transactionIdCategory}
              canEdit={canEditCategory}
              canDelete={canDeleteCategory}
              canView={canViewCategory}
              canCreate={canCreateCategory}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Account Setup Category Dialog */}
      <Dialog
        open={isModalCategoryOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalCategoryOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalCategoryMode === "create" &&
                "Create Account Setup Category"}
              {modalCategoryMode === "edit" && "Update Account Setup Category"}
              {modalCategoryMode === "view" && "View Account Setup Category"}
            </DialogTitle>
            <DialogDescription>
              {modalCategoryMode === "create"
                ? "Add a new account setup category to the system database."
                : modalCategoryMode === "edit"
                  ? "Update account setup category information in the system database."
                  : "View account setup category details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <AccountSetupCategoryForm
            initialData={
              modalCategoryMode === "edit" || modalCategoryMode === "view"
                ? selectedCategory
                : undefined
            }
            submitAction={handleFormSubmitCategory}
            onCancel={() => setIsModalCategoryOpen(false)}
            isSubmitting={
              saveMutationCategory.isPending || updateMutationCategory.isPending
            }
            isReadOnly={modalCategoryMode === "view"}
            onCodeBlur={(code) => handleCodeBlur(code, "category")}
          />
        </DialogContent>
      </Dialog>

      {/* Account Setup Dialog */}
      <Dialog
        open={isModalSetupOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalSetupOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalSetupMode === "create" && "Create Account Setup"}
              {modalSetupMode === "edit" && "Update Account Setup"}
              {modalSetupMode === "view" && "View Account Setup"}
            </DialogTitle>
            <DialogDescription>
              {modalSetupMode === "create"
                ? "Add a new account setup to the system database."
                : modalSetupMode === "edit"
                  ? "Update account setup information in the system database."
                  : "View account setup details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <AccountSetupForm
            initialData={
              modalSetupMode === "edit" || modalSetupMode === "view"
                ? selectedSetup
                : undefined
            }
            submitAction={handleFormSubmitSetup}
            onCancel={() => setIsModalSetupOpen(false)}
            isSubmitting={
              saveMutationSetup.isPending || updateMutationSetup.isPending
            }
            isReadOnly={modalSetupMode === "view"}
            onCodeBlur={(code) => handleCodeBlur(code, "setup")}
          />
        </DialogContent>
      </Dialog>

      {/* Account Setup Dt Dialog */}
      <Dialog
        open={isModalDtOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalDtOpen(false)
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {modalDtMode === "create" && "Create Account Setup Detail"}
              {modalDtMode === "edit" && "Update Account Setup Detail"}
              {modalDtMode === "view" && "View Account Setup Detail"}
            </DialogTitle>
            <DialogDescription>
              {modalDtMode === "create"
                ? "Add a new account setup detail to the system database."
                : modalDtMode === "edit"
                  ? "Update account setup detail information in the system database."
                  : "View account setup detail details."}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <AccountSetupDtForm
            initialData={
              modalDtMode === "edit" || modalDtMode === "view"
                ? selectedDt
                : undefined
            }
            submitAction={handleFormSubmitDt}
            onCancel={() => setIsModalDtOpen(false)}
            isSubmitting={
              saveMutationDt.isPending || updateMutationDt.isPending
            }
            isReadOnly={modalDtMode === "view"}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for existing Account Setup Category record */}
      <LoadExistingDialog
        open={showLoadDialogCategory}
        onOpenChange={setShowLoadDialogCategory}
        onLoad={handleLoadExistingCategory}
        onCancel={() => setExistingCategory(null)}
        code={existingCategory?.accSetupCategoryCode}
        name={existingCategory?.accSetupCategoryName}
        typeLabel="Account Setup Category"
        isLoading={
          saveMutationCategory.isPending || updateMutationCategory.isPending
        }
      />

      {/* Dialog for existing Account Setup record */}
      <LoadExistingDialog
        open={showLoadDialogSetup}
        onOpenChange={setShowLoadDialogSetup}
        onLoad={handleLoadExistingSetup}
        onCancel={() => setExistingSetup(null)}
        code={existingSetup?.accSetupCode}
        name={existingSetup?.accSetupName}
        typeLabel="Account Setup"
        isLoading={saveMutationSetup.isPending || updateMutationSetup.isPending}
      />

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
            type: "setup",
          })
        }
        isDeleting={
          deleteConfirmation.type === "setup"
            ? deleteMutationSetup.isPending
            : deleteConfirmation.type === "category"
              ? deleteMutationCategory.isPending
              : deleteMutationDt.isPending
        }
      />

      {/* Save Confirmation Dialogs */}
      <SaveConfirmation
        open={saveConfirmationCategory.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmationCategory((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalCategoryMode === "create"
            ? "Create Account Setup Category"
            : "Update Account Setup Category"
        }
        itemName={saveConfirmationCategory.data?.accSetupCategoryName || ""}
        operationType={modalCategoryMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmationCategory.data) {
            handleConfirmedFormSubmitCategory(saveConfirmationCategory.data)
          }
          setSaveConfirmationCategory({
            isOpen: false,
            data: null,
          })
        }}
        onCancel={() =>
          setSaveConfirmationCategory({
            isOpen: false,
            data: null,
          })
        }
        isSaving={
          saveMutationCategory.isPending || updateMutationCategory.isPending
        }
      />

      <SaveConfirmation
        open={saveConfirmationSetup.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmationSetup((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalSetupMode === "create"
            ? "Create Account Setup"
            : "Update Account Setup"
        }
        itemName={saveConfirmationSetup.data?.accSetupName || ""}
        operationType={modalSetupMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmationSetup.data) {
            handleConfirmedFormSubmitSetup(saveConfirmationSetup.data)
          }
          setSaveConfirmationSetup({
            isOpen: false,
            data: null,
          })
        }}
        onCancel={() =>
          setSaveConfirmationSetup({
            isOpen: false,
            data: null,
          })
        }
        isSaving={saveMutationSetup.isPending || updateMutationSetup.isPending}
      />

      <SaveConfirmation
        open={saveConfirmationDt.isOpen}
        onOpenChange={(isOpen) =>
          setSaveConfirmationDt((prev) => ({ ...prev, isOpen }))
        }
        title={
          modalDtMode === "create"
            ? "Create Account Setup Detail"
            : "Update Account Setup Detail"
        }
        itemName={saveConfirmationDt.data?.currencyId?.toString() || ""}
        operationType={modalDtMode === "create" ? "create" : "update"}
        onConfirm={() => {
          if (saveConfirmationDt.data) {
            handleConfirmedFormSubmitDt(saveConfirmationDt.data)
          }
          setSaveConfirmationDt({
            isOpen: false,
            data: null,
          })
        }}
        onCancel={() =>
          setSaveConfirmationDt({
            isOpen: false,
            data: null,
          })
        }
        isSaving={saveMutationDt.isPending || updateMutationDt.isPending}
      />
    </div>
  )
}
