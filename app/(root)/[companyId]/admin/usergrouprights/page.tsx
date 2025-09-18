"use client"

import { usePermissionStore } from "@/stores/permission-store"

import { AdminTransactionId, ModuleId } from "@/lib/utils"

import { UserGroupSettingTable } from "../components/usergrouprights-table"

export default function AdminGroupRightsPage() {
  const moduleId = ModuleId.admin
  const transactionIdGroup = AdminTransactionId.userGroupRights

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionIdGroup, "isEdit")
  const canDelete = hasPermission(moduleId, transactionIdGroup, "isDelete")
  const canView = hasPermission(moduleId, transactionIdGroup, "isRead")
  const canCreate = hasPermission(moduleId, transactionIdGroup, "isCreate")

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          Group Rights
        </h1>
        <p className="text-muted-foreground text-sm">Manage group rights</p>
      </div>
      <UserGroupSettingTable />
    </div>
  )
}
