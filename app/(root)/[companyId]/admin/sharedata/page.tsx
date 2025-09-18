"use client"

import { usePermissionStore } from "@/stores/permission-store"

import { AdminTransactionId, ModuleId } from "@/lib/utils"

import { ShareDataTable } from "../components/sharedata-table"

export default function AdminShareDataPage() {
  const moduleId = ModuleId.admin
  const transactionIdShareData = AdminTransactionId.shareData

  const { hasPermission } = usePermissionStore()

  const canEdit = hasPermission(moduleId, transactionIdShareData, "isEdit")
  const canDelete = hasPermission(moduleId, transactionIdShareData, "isDelete")
  const canView = hasPermission(moduleId, transactionIdShareData, "isRead")
  const canCreate = hasPermission(moduleId, transactionIdShareData, "isCreate")

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {<ShareDataTable />}
    </div>
  )
}
