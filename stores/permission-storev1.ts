// stores/permission-store.ts
import { IUserRightsv1 } from "@/interfaces/admin"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PermissionState {
  permissions: Record<string, IUserRightsv1>
  setPermissions: (permissions: IUserRightsv1[]) => void
  getPermissions: (
    moduleId: number,
    transactionId: number
  ) => IUserRightsv1 | undefined
  hasPermission: (
    moduleId: number,
    transactionId: number,
    action: keyof IUserRightsv1
  ) => boolean
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: {},

      setPermissions: (permissions: IUserRightsv1[]) =>
        set(() => {
          const newPermissions: Record<string, IUserRightsv1> = {}

          // Check if permissions is an array before calling forEach
          if (Array.isArray(permissions)) {
            permissions.forEach((permission) => {
              const key = `${permission.moduleId}-${permission.transactionId}`
              newPermissions[key] = permission
            })
          } else {
            console.warn("setPermissions received non-array data:", permissions)
          }

          return {
            permissions: newPermissions,
          }
        }),

      getPermissions: (moduleId: number, transactionId: number) => {
        const key = `${moduleId}-${transactionId}`
        return get().permissions[key]
      },

      hasPermission: (
        moduleId: number,
        transactionId: number,
        action: keyof IUserRightsv1
      ) => {
        const permission = get().getPermissions(moduleId, transactionId)
        return permission ? Boolean(permission[action]) : false
      },
    }),
    {
      name: "permission-storage",
    }
  )
)
