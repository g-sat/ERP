"use client"

import { useEffect, useState } from "react"
import { IUserLookup } from "@/interfaces/lookup"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { useUserRightSave, useUserRightbyidGet } from "@/hooks/use-admin"
import { useUserGroupLookup } from "@/hooks/use-lookup"
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

type CompanyRight = {
  companyId: string
  companyCode: string
  companyName: string
  isAccess: boolean
  userGroupId: string
}

export function UserRightsTable({ companyId }: { companyId: string }) {
  const form = useForm()
  const [selectedUser, setSelectedUser] = useState<IUserLookup | null>(null)
  const [companyRights, setCompanyRights] = useState<CompanyRight[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch user groups for dropdown
  const { data: userGroups = [] } = useUserGroupLookup()
  // Fetch user rights for selected user
  const {
    data: userRightsData,
    refetch: refetchUserRights,
    isFetching: isRightsLoading,
  } = useUserRightbyidGet(Number(selectedUser?.userId) || 0)
  // Save user rights mutation
  const userRightSave = useUserRightSave()

  // Update companyRights when userRightsData changes
  useEffect(() => {
    if (userRightsData && Array.isArray(userRightsData)) {
      const rightsWithState = userRightsData.map((right) => ({
        ...right,
        isAccess: Boolean(right.isAccess),
        userGroupId: right.userGroupId || "",
      }))
      setCompanyRights(rightsWithState)
    } else {
      setCompanyRights([])
    }
  }, [userRightsData])

  // When user changes, refetch rights
  useEffect(() => {
    if (selectedUser) {
      refetchUserRights()
    } else {
      setCompanyRights([])
    }
  }, [selectedUser, refetchUserRights])

  // Handle checkbox change for a specific row
  const handleAccessChange = (companyId: string, checked: boolean) => {
    setCompanyRights((prev) =>
      prev.map((row) =>
        row.companyId === companyId
          ? {
              ...row,
              isAccess: checked,
              // Clear userGroupId if access is turned off
              userGroupId: checked ? row.userGroupId : "",
            }
          : row
      )
    )
  }

  // Handle user group change for a specific row
  const handleGroupChange = (companyId: string, group: string) => {
    setCompanyRights((prev) =>
      prev.map((row) =>
        row.companyId === companyId ? { ...row, userGroupId: group } : row
      )
    )
  }

  // Validate company rights before saving
  const validateCompanyRights = (): boolean => {
    const invalidRows = companyRights.filter(
      (row) => row.isAccess && !row.userGroupId
    )

    if (invalidRows.length > 0) {
      const companyNames = invalidRows.map((row) => row.companyName).join(", ")
      toast.error(
        `Please select a user group for the following companies with access enabled: ${companyNames}`
      )
      return false
    }
    return true
  }

  // Handle save button click
  const handleSave = async () => {
    if (!selectedUser) {
      toast.error("Please select a user first")
      return
    }

    // Validate before saving
    if (!validateCompanyRights()) {
      return
    }

    try {
      setSaving(true)
      const rightsToSave = companyRights.map((row) => ({
        companyId: Number(row.companyId),
        companyCode: row.companyCode,
        companyName: row.companyName,
        isAccess: row.isAccess,
        userId: Number(selectedUser.userId),
        userGroupId: Number(row.userGroupId),
      }))

      await userRightSave.mutateAsync({ data: rightsToSave })
      toast.success("User rights saved successfully")
      refetchUserRights()
    } catch (error) {
      console.error("Error saving user rights:", error)
      toast.error("Failed to save user rights")
    } finally {
      setSaving(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!selectedUser) {
      setCompanyRights([])
      toast.warning("Please select a user first")
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Code</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Is Access</TableHead>
                <TableHead>User Group</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyRights.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground text-center"
                  >
                    No data. Please select a user.
                  </TableCell>
                </TableRow>
              ) : (
                companyRights.map((row) => (
                  <TableRow key={row.companyId}>
                    <TableCell>{row.companyCode}</TableCell>
                    <TableCell>{row.companyName}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={row.isAccess}
                        onCheckedChange={(checked) =>
                          handleAccessChange(row.companyId, Boolean(checked))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className={cn(
                          "rounded border border-[#232733] bg-[#232733] px-2 py-1 text-white",
                          row.isAccess && !row.userGroupId && "border-red-500"
                        )}
                        value={row.userGroupId}
                        onChange={(e) =>
                          handleGroupChange(row.companyId, e.target.value)
                        }
                        disabled={!row.isAccess}
                      >
                        <option value="">Select Group</option>
                        {userGroups.map((g) => (
                          <option key={g.userGroupId} value={g.userGroupId}>
                            {g.userGroupName}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </form>
      </Form>
    </div>
  )
}
