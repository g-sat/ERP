"use client"

import { useEffect, useState } from "react"
import { IUserRightsv1 } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import { IUserLookup } from "@/interfaces/lookup"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useUserRightSaveV1, useUserRightbyidGetV1 } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import UserAutocomplete from "@/components/ui-custom/autocomplete-user"

type PermissionType =
  | "isRead"
  | "isCreate"
  | "isEdit"
  | "isDelete"
  | "isExport"
  | "isPrint"

export function UserWiseRightsTable() {
  const form = useForm()
  const [selectedUser, setSelectedUser] = useState<IUserLookup | null>(null)
  const [groupRights, setGroupRights] = useState<IUserRightsv1[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch user group rights for selected group
  const {
    data: userRightsResponse,
    refetch: refetchUserRights,
    isFetching: isRightsLoading,
  } = useUserRightbyidGetV1(selectedUser?.userId || 0)

  // Save user group rights mutation
  const userRightSave = useUserRightSaveV1()

  // Update groupRights when userRightsResponse changes
  useEffect(() => {
    if (userRightsResponse) {
      const response = userRightsResponse as ApiResponse<IUserRightsv1>

      if (response.data && Array.isArray(response.data)) {
        setGroupRights(response.data)
      } else {
        setGroupRights([])
      }
    } else {
      setGroupRights([])
    }
  }, [userRightsResponse])

  // When group changes, refetch rights
  useEffect(() => {
    if (selectedUser?.userId) {
      refetchUserRights()
    } else {
      setGroupRights([])
    }
  }, [selectedUser?.userId, refetchUserRights])

  // Handle permission change for a specific right
  const handlePermissionChange = (
    moduleId: number,
    transactionId: number,
    permission: PermissionType,
    checked: boolean
  ) => {
    setGroupRights((prev) =>
      prev.map((right) =>
        right.moduleId === moduleId && right.transactionId === transactionId
          ? { ...right, [permission]: checked }
          : right
      )
    )
  }

  // Handle select all for a row
  const handleRowSelectAll = (
    moduleId: number,
    transactionId: number,
    checked: boolean
  ) => {
    setGroupRights((prev) =>
      prev.map((right) =>
        right.moduleId === moduleId && right.transactionId === transactionId
          ? {
              ...right,
              isRead: checked,
              isCreate: checked,
              isEdit: checked,
              isDelete: checked,
              isExport: checked,
              isPrint: checked,
            }
          : right
      )
    )
  }

  // Handle select all for a column
  const handleColumnSelectAll = (
    permission: PermissionType,
    checked: boolean
  ) => {
    setGroupRights((prev) =>
      prev.map((right) => ({
        ...right,
        [permission]: checked,
      }))
    )
  }

  // Check if all permissions in a row are selected
  const isRowAllSelected = (right: IUserRightsv1) => {
    return (
      right.isRead &&
      right.isCreate &&
      right.isEdit &&
      right.isDelete &&
      right.isExport &&
      right.isPrint
    )
  }

  // Check if all permissions in a column are selected
  const isColumnAllSelected = (permission: PermissionType) => {
    return (
      groupRights.length > 0 && groupRights.every((right) => right[permission])
    )
  }

  // Handle save button click
  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("Please select a user group first")
      return
    }

    try {
      setSaving(true)
      const rightsToSave = groupRights.map((right) => ({
        ...right,
        userId: selectedUser.userId,
      }))

      const response = await userRightSave.mutateAsync({
        data: rightsToSave,
      })

      if (response.result === 1) {
        toast.success("User group rights saved successfully")
        refetchUserRights()
      } else {
        toast.error(response.message || "Failed to save user group rights")
      }
    } catch (error) {
      console.error("Error saving user group rights:", error)
      toast.error("Failed to save user group rights")
    } finally {
      setSaving(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!selectedUser) {
      setGroupRights([])
      toast.warning("Please select a user group first")
      return
    }
    refetchUserRights()
  }

  return (
    <div className="rounded-md border bg-[#10131c] p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-end gap-4">
              <div className="w-64">
                <UserAutocomplete
                  form={form}
                  name="userId"
                  label="User"
                  onChangeEvent={(user: IUserLookup | null) =>
                    setSelectedUser(user)
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                disabled={isRightsLoading}
              >
                {isRightsLoading ? "Loading..." : "Search"}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedUser}
              size="sm"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="max-h-[460px] overflow-auto">
            <div className="relative">
              <Table>
                <TableHeader className="sticky top-0 z-20 bg-[#10131c]">
                  <TableRow>
                    <TableHead className="sticky left-0 z-30 min-w-[150px] bg-[#10131c]">
                      Module
                    </TableHead>
                    <TableHead className="sticky left-[150px] z-30 min-w-[150px] bg-[#10131c]">
                      Transaction
                    </TableHead>
                    <TableHead className="sticky left-[300px] z-30 min-w-[100px] bg-[#10131c]">
                      <div className="flex items-center gap-2">
                        <span>Select All</span>
                        <Checkbox
                          checked={
                            groupRights.length > 0 &&
                            groupRights.every(isRowAllSelected)
                          }
                          onCheckedChange={(checked) => {
                            const isChecked = Boolean(checked)
                            setGroupRights((prev) =>
                              prev.map((right) => ({
                                ...right,
                                isRead: isChecked,
                                isCreate: isChecked,
                                isEdit: isChecked,
                                isDelete: isChecked,
                                isExport: isChecked,
                                isPrint: isChecked,
                              }))
                            )
                          }}
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span>View</span>
                        <Checkbox
                          checked={isColumnAllSelected("isRead")}
                          onCheckedChange={(checked) =>
                            handleColumnSelectAll("isRead", Boolean(checked))
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span>Create</span>
                        <Checkbox
                          checked={isColumnAllSelected("isCreate")}
                          onCheckedChange={(checked) =>
                            handleColumnSelectAll("isCreate", Boolean(checked))
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span>Edit</span>
                        <Checkbox
                          checked={isColumnAllSelected("isEdit")}
                          onCheckedChange={(checked) =>
                            handleColumnSelectAll("isEdit", Boolean(checked))
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span>Delete</span>
                        <Checkbox
                          checked={isColumnAllSelected("isDelete")}
                          onCheckedChange={(checked) =>
                            handleColumnSelectAll("isDelete", Boolean(checked))
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span>Export</span>
                        <Checkbox
                          checked={isColumnAllSelected("isExport")}
                          onCheckedChange={(checked) =>
                            handleColumnSelectAll("isExport", Boolean(checked))
                          }
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <span>Print</span>
                        <Checkbox
                          checked={isColumnAllSelected("isPrint")}
                          onCheckedChange={(checked) =>
                            handleColumnSelectAll("isPrint", Boolean(checked))
                          }
                        />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isRightsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-muted-foreground text-center"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : groupRights.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-muted-foreground text-center"
                      >
                        No data. Please select a user group.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupRights.map((right) => (
                      <TableRow
                        key={`${right.moduleId}-${right.transactionId}`}
                      >
                        <TableCell className="sticky left-0 z-20 min-w-[150px] bg-[#10131c]">
                          {right.moduleName}
                        </TableCell>
                        <TableCell className="sticky left-[150px] z-20 min-w-[150px] bg-[#10131c]">
                          {right.transactionName}
                        </TableCell>
                        <TableCell className="sticky left-[300px] z-20 min-w-[100px] bg-[#10131c]">
                          <Checkbox
                            checked={isRowAllSelected(right)}
                            onCheckedChange={(checked) =>
                              handleRowSelectAll(
                                right.moduleId,
                                right.transactionId,
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Checkbox
                            checked={right.isRead}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                right.moduleId,
                                right.transactionId,
                                "isRead",
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Checkbox
                            checked={right.isCreate}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                right.moduleId,
                                right.transactionId,
                                "isCreate",
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Checkbox
                            checked={right.isEdit}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                right.moduleId,
                                right.transactionId,
                                "isEdit",
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Checkbox
                            checked={right.isDelete}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                right.moduleId,
                                right.transactionId,
                                "isDelete",
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Checkbox
                            checked={right.isExport}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                right.moduleId,
                                right.transactionId,
                                "isExport",
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <Checkbox
                            checked={right.isPrint}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                right.moduleId,
                                right.transactionId,
                                "isPrint",
                                Boolean(checked)
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
