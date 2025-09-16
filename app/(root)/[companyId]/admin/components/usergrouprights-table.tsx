"use client"

import { useEffect, useState } from "react"
import { IUserGroupRights } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  useUserGroupRightSave,
  useUserGroupRightbyidGet,
} from "@/hooks/use-admin"
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
import UserGroupAutocomplete from "@/components/ui-custom/autocomplete-usergroup"

type UserGroup = {
  userGroupId: number
  userGroupName: string
}

type PermissionType =
  | "isRead"
  | "isCreate"
  | "isEdit"
  | "isDelete"
  | "isExport"
  | "isPrint"

export function UserGroupRightsTable() {
  const form = useForm()
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  const [groupRights, setGroupRights] = useState<IUserGroupRights[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch user group rights for selected group
  const {
    data: userGroupRightsResponse,
    refetch: refetchUserGroupRights,
    isFetching: isRightsLoading,
  } = useUserGroupRightbyidGet(selectedGroup?.userGroupId || 0)

  // Save user group rights mutation
  const userGroupRightSave = useUserGroupRightSave()

  // Update groupRights when userGroupRightsResponse changes
  useEffect(() => {
    if (userGroupRightsResponse) {
      const response = userGroupRightsResponse as ApiResponse<IUserGroupRights>
      if (response.data && Array.isArray(response.data)) {
        setGroupRights(response.data)
      } else {
        setGroupRights([])
      }
    } else {
      setGroupRights([])
    }
  }, [userGroupRightsResponse])

  // When group changes, refetch rights
  useEffect(() => {
    if (selectedGroup?.userGroupId) {
      refetchUserGroupRights()
    } else {
      setGroupRights([])
    }
  }, [selectedGroup?.userGroupId, refetchUserGroupRights])

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
  const isRowAllSelected = (right: IUserGroupRights) => {
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
    if (!selectedGroup) {
      toast.error("Please select a user group first")
      return
    }

    try {
      setSaving(true)
      const rightsToSave = groupRights.map((right) => ({
        ...right,
        userGroupId: selectedGroup.userGroupId,
      }))

      const response = await userGroupRightSave.mutateAsync({
        data: rightsToSave,
      })

      if (response.result === 1) {
        toast.success("User group rights saved successfully")
        refetchUserGroupRights()
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
    if (!selectedGroup) {
      setGroupRights([])
      toast.warning("Please select a user group first")
      return
    }
    refetchUserGroupRights()
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-end gap-4">
              <div className="w-64">
                <UserGroupAutocomplete
                  form={form}
                  name="userGroupId"
                  label="User Group"
                  onChangeEvent={(group: UserGroup | null) =>
                    setSelectedGroup(group)
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
              disabled={saving || !selectedGroup}
              size="sm"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              {/* Fixed header table with column sizing */}
              <Table className="w-full table-fixed border-collapse">
                {/* Column group for consistent sizing */}
                <colgroup>
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "100px" }} />
                </colgroup>

                {/* Sticky table header */}
                <TableHeader className="bg-background sticky top-0 z-20">
                  <TableRow className="bg-muted/50">
                    <TableHead>Module</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>
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
                    <TableHead>
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
                    <TableHead>
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
                    <TableHead>
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
                    <TableHead>
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
                    <TableHead>
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
                    <TableHead>
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
              </Table>

              {/* Scrollable body container */}
              <div className="max-h-[460px] overflow-y-auto">
                {/* Body table with same column sizing as header */}
                <Table className="w-full table-fixed border-collapse">
                  {/* Column group matching header for alignment */}
                  <colgroup>
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "150px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "100px" }} />
                  </colgroup>

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
                          <TableCell className="py-1">
                            {right.moduleName}
                          </TableCell>
                          <TableCell className="py-1">
                            {right.transactionName}
                          </TableCell>
                          <TableCell className="py-1">
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
                          <TableCell className="py-1">
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
                          <TableCell className="py-1">
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
                          <TableCell className="py-1">
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
                          <TableCell className="py-1">
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
                          <TableCell className="py-1">
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
                          <TableCell className="py-1">
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
            </Table>
          </div>
        </form>
      </Form>
    </div>
  )
}
