"use client"

import { useEffect, useState } from "react"
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
import { toast } from "sonner"

import { getData } from "@/lib/api-client"
import {
  AccountSetup,
  AccountSetupCategory,
  AccountSetupDt,
} from "@/lib/api-routes"
import { MasterTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, useGet, useSave, useUpdate } from "@/hooks/use-common"
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

import { AccountSetupCategoryForm } from "./components/account-setup-category-form"
import { AccountSetupCategoryTable } from "./components/account-setup-category-table"
import { AccountSetupForm } from "./components/account-setup-form"
import { AccountSetupTable } from "./components/account-setup-table"
import { AccountSetupDtForm } from "./components/account-setupdt-form"
import { AccountSetupDtTable } from "./components/account-setupdt-table"

export default function AccountSetupPage() {
  const moduleId = ModuleId.master
  const transactionId = MasterTransactionId.account_setup
  const transactionIdCategory = MasterTransactionId.account_setup_category
  const transactionIdDt = MasterTransactionId.account_setup_dt

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
    isRefetching: isRefetchingCategory,
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
    isRefetching: isRefetchingSetup,
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
    isRefetching: isRefetchingDt,
  } = useGet<IAccountSetupDt>(
    `${AccountSetupDt.get}`,
    "accountSetupDts",
    filtersDt.search
  )

  const { data: categoryData } =
    (categoryResponse as ApiResponse<IAccountSetupCategory>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  const { data: setupData } = (setupResponse as ApiResponse<IAccountSetup>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  const { data: dtData } = (dtResponse as ApiResponse<IAccountSetupDt>) ?? {
    result: 0,
    message: "",
    data: [],
  }

  // Account Setup Category mutations
  const saveMutationCategory = useSave<AccountSetupCategoryFormValues>(
    `${AccountSetupCategory.add}`
  )
  const updateMutationCategory = useUpdate<AccountSetupCategoryFormValues>(
    `${AccountSetupCategory.add}`
  )
  const deleteMutationCategory = useDelete(`${AccountSetupCategory.delete}`)

  // Account Setup mutations
  const saveMutationSetup = useSave<AccountSetupFormValues>(
    `${AccountSetup.add}`
  )
  const updateMutationSetup = useUpdate<AccountSetupFormValues>(
    `${AccountSetup.add}`
  )
  const deleteMutationSetup = useDelete(`${AccountSetup.delete}`)

  // Account Setup Dt mutations
  const saveMutationDt = useSave<AccountSetupDtFormValues>(
    `${AccountSetupDt.add}`
  )
  const updateMutationDt = useUpdate<AccountSetupDtFormValues>(
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

  // State for code availability check
  const [showLoadDialogCategory, setShowLoadDialogCategory] = useState(false)
  const [existingCategory, setExistingCategory] =
    useState<IAccountSetupCategory | null>(null)

  const [showLoadDialogSetup, setShowLoadDialogSetup] = useState(false)
  const [existingSetup, setExistingSetup] = useState<IAccountSetup | null>(null)

  const queryClient = useQueryClient()

  useEffect(() => {
    if (filtersCategory.search !== undefined) {
      refetchCategory()
    }
  }, [filtersCategory.search])

  useEffect(() => {
    if (filtersSetup.search !== undefined) {
      refetchSetup()
    }
  }, [filtersSetup.search])

  useEffect(() => {
    if (filtersDt.search !== undefined) {
      refetchDt()
    }
  }, [filtersDt.search])

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

  const handleFormSubmitCategory = async (
    data: AccountSetupCategoryFormValues
  ) => {
    try {
      if (modalCategoryMode === "create") {
        const response = (await saveMutationCategory.mutateAsync(
          data
        )) as ApiResponse<IAccountSetupCategory>
        if (response.result === 1) {
          toast.success(
            response.message || "Account Setup Category created successfully"
          )
          queryClient.invalidateQueries({
            queryKey: ["accountSetupCategories"],
          }) // Triggers refetch
          setIsModalCategoryOpen(false)
        } else {
          toast.error(
            response.message || "Failed to create account setup category"
          )
        }
      } else if (modalCategoryMode === "edit" && selectedCategory) {
        const response = (await updateMutationCategory.mutateAsync(
          data
        )) as ApiResponse<IAccountSetupCategory>
        if (response.result === 1) {
          toast.success(
            response.message || "Account Setup Category updated successfully"
          )
          queryClient.invalidateQueries({
            queryKey: ["accountSetupCategories"],
          }) // Triggers refetch
          setIsModalCategoryOpen(false)
        } else {
          toast.error(
            response.message || "Failed to update account setup category"
          )
        }
      }
      setIsModalCategoryOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
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

  const handleFormSubmitSetup = async (data: AccountSetupFormValues) => {
    try {
      if (modalSetupMode === "create") {
        const response = (await saveMutationSetup.mutateAsync(
          data
        )) as ApiResponse<IAccountSetup>
        if (response.result === 1) {
          toast.success(
            response.message || "Account Setup created successfully"
          )
          queryClient.invalidateQueries({
            queryKey: ["accountSetups"],
          }) // Triggers refetch
          setIsModalSetupOpen(false)
        } else {
          toast.error(response.message || "Failed to create account setup")
        }
      } else if (modalSetupMode === "edit" && selectedSetup) {
        const response = (await updateMutationSetup.mutateAsync(
          data
        )) as ApiResponse<IAccountSetup>
        if (response.result === 1) {
          toast.success(
            response.message || "Account Setup updated successfully"
          )
          queryClient.invalidateQueries({ queryKey: ["accountSetups"] }) // Triggers refetch
          setIsModalSetupOpen(false)
        } else {
          toast.error(response.message || "Failed to update account setup")
        }
      }
      setIsModalSetupOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
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

  const handleFormSubmitDt = async (data: AccountSetupDtFormValues) => {
    try {
      if (modalDtMode === "create") {
        const response = (await saveMutationDt.mutateAsync(
          data
        )) as ApiResponse<IAccountSetupDt>
        if (response.result === 1) {
          toast.success(
            response.message || "Account Setup Detail created successfully"
          )
          queryClient.invalidateQueries({ queryKey: ["accountSetupDts"] }) // Triggers refetch
          setIsModalDtOpen(false)
        } else {
          toast.error(
            response.message || "Failed to create account setup detail"
          )
        }
      } else if (modalDtMode === "edit" && selectedDt) {
        const response = (await updateMutationDt.mutateAsync(
          data
        )) as ApiResponse<IAccountSetupDt>
        if (response.result === 1) {
          toast.success(
            response.message || "Account Setup Detail updated successfully"
          )
          queryClient.invalidateQueries({ queryKey: ["accountSetupDts"] }) // Triggers refetch
          setIsModalDtOpen(false)
        } else {
          toast.error(
            response.message || "Failed to update account setup detail"
          )
        }
      }
      setIsModalDtOpen(false)
    } catch (error) {
      console.error("Error in form submission:", error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteConfirmation.id) return

    let mutation
    switch (deleteConfirmation.type) {
      case "setup":
        mutation = deleteMutationSetup
        break
      case "category":
        mutation = deleteMutationCategory
        break
      case "dt":
        mutation = deleteMutationDt
        break
      default:
        return
    }

    toast.promise(mutation.mutateAsync(deleteConfirmation.id), {
      loading: `Deleting ${deleteConfirmation.name}...`,
      success: `${deleteConfirmation.name} has been deleted`,
      error: `Failed to delete ${deleteConfirmation.type}`,
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

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 @md/main:flex-row @md/main:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Account Setup</h1>
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
          {isLoadingSetup || isRefetchingSetup ? (
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
          ) : (setupResponse as ApiResponse<IAccountSetup>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <AccountSetupTable
                data={setupData || []}
                onAccountSetupSelect={canView ? handleSetupSelect : undefined}
                onDeleteAccountSetup={canDelete ? handleDeleteSetup : undefined}
                onEditAccountSetup={canEdit ? handleEditSetup : undefined}
                onCreateAccountSetup={canCreate ? handleCreateSetup : undefined}
                onRefresh={refetchSetup}
                onFilterChange={setFiltersSetup}
                moduleId={moduleId}
                transactionId={transactionId}
              />
            </LockSkeleton>
          ) : (
            <AccountSetupTable
              data={setupData || []}
              onAccountSetupSelect={canView ? handleSetupSelect : undefined}
              onDeleteAccountSetup={canDelete ? handleDeleteSetup : undefined}
              onEditAccountSetup={canEdit ? handleEditSetup : undefined}
              onCreateAccountSetup={canCreate ? handleCreateSetup : undefined}
              onRefresh={refetchSetup}
              onFilterChange={setFiltersSetup}
              moduleId={moduleId}
              transactionId={transactionId}
            />
          )}
        </TabsContent>

        <TabsContent value="account-setup-dt" className="space-y-4">
          {isLoadingDt || isRefetchingDt ? (
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
          ) : (dtResponse as ApiResponse<IAccountSetupDt>)?.result === -2 ? (
            <LockSkeleton locked={true}>
              <AccountSetupDtTable
                data={dtData || []}
                onAccountSetupDtSelect={canViewDt ? handleDtSelect : undefined}
                onDeleteAccountSetupDt={
                  canDeleteDt ? handleDeleteDt : undefined
                }
                onEditAccountSetupDt={canEditDt ? handleEditDt : undefined}
                onCreateAccountSetupDt={
                  canCreateDt ? handleCreateDt : undefined
                }
                onRefresh={refetchDt}
                onFilterChange={setFiltersDt}
                moduleId={moduleId}
                transactionId={transactionIdDt}
              />
            </LockSkeleton>
          ) : (
            <AccountSetupDtTable
              data={dtData || []}
              onAccountSetupDtSelect={canViewDt ? handleDtSelect : undefined}
              onDeleteAccountSetupDt={canDeleteDt ? handleDeleteDt : undefined}
              onEditAccountSetupDt={canEditDt ? handleEditDt : undefined}
              onCreateAccountSetupDt={canCreateDt ? handleCreateDt : undefined}
              onRefresh={refetchDt}
              onFilterChange={setFiltersDt}
              moduleId={moduleId}
              transactionId={transactionIdDt}
            />
          )}
        </TabsContent>

        <TabsContent value="account-setup-category" className="space-y-4">
          {isLoadingCategory || isRefetchingCategory ? (
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
          ) : (categoryResponse as ApiResponse<IAccountSetupCategory>)
              ?.result === -2 ? (
            <LockSkeleton locked={true}>
              <AccountSetupCategoryTable
                data={categoryData || []}
                onAccountSetupCategorySelect={
                  canViewCategory ? handleCategorySelect : undefined
                }
                onDeleteAccountSetupCategory={
                  canDeleteCategory ? handleDeleteCategory : undefined
                }
                onEditAccountSetupCategory={
                  canEditCategory ? handleEditCategory : undefined
                }
                onCreateAccountSetupCategory={
                  canCreateCategory ? handleCreateCategory : undefined
                }
                onRefresh={refetchCategory}
                onFilterChange={setFiltersCategory}
                moduleId={moduleId}
                transactionId={transactionIdCategory}
              />
            </LockSkeleton>
          ) : (
            <AccountSetupCategoryTable
              data={categoryData || []}
              onAccountSetupCategorySelect={
                canViewCategory ? handleCategorySelect : undefined
              }
              onDeleteAccountSetupCategory={
                canDeleteCategory ? handleDeleteCategory : undefined
              }
              onEditAccountSetupCategory={
                canEditCategory ? handleEditCategory : undefined
              }
              onCreateAccountSetupCategory={
                canCreateCategory ? handleCreateCategory : undefined
              }
              onRefresh={refetchCategory}
              onFilterChange={setFiltersCategory}
              moduleId={moduleId}
              transactionId={transactionIdCategory}
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
    </div>
  )
}
