// hooks/use-permissions.ts
import { usePermissionStore } from "@/stores/permission-store"

export const usePermissions = (moduleId: number, transactionId: number) => {
  const { hasPermission } = usePermissionStore()

  return {
    canCreate: hasPermission(moduleId, transactionId, "isCreate"),
    canEdit: hasPermission(moduleId, transactionId, "isEdit"),
    canDelete: hasPermission(moduleId, transactionId, "isDelete"),
    canView: hasPermission(moduleId, transactionId, "isRead"),
    canPrint: hasPermission(moduleId, transactionId, "isPrint"),
    canExport: hasPermission(moduleId, transactionId, "isExport"),
    canPost: hasPermission(moduleId, transactionId, "isPost"),
  }
}
