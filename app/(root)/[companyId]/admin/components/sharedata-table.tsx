"use client"

import { useEffect, useState } from "react"
import { IShareData } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { useShareDataGet, useShareDataSave } from "@/hooks/use-admin"
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

type PermissionType = "shareToAll"

export function ShareDataTable() {
  const form = useForm()
  const [shareData, setShareData] = useState<IShareData[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch user group rights for selected group
  const {
    data: shareDataResponse,
    refetch: refetchShareData,
    isFetching: isRightsLoading,
  } = useShareDataGet()

  // Save user group rights mutation
  const shareDataSave = useShareDataSave()

  // Update shareData when shareDataResponse changes
  useEffect(() => {
    if (shareDataResponse) {
      const response = shareDataResponse as ApiResponse<IShareData>
      if (response.data && Array.isArray(response.data)) {
        setShareData(response.data)
      } else {
        setShareData([])
      }
    } else {
      setShareData([])
    }
  }, [shareDataResponse])

  // When group changes, refetch rights
  useEffect(() => {
    refetchShareData()
  }, [refetchShareData])

  // Handle permission change for a specific right
  const handlePermissionChange = (
    moduleId: number,
    transactionId: number,
    permission: PermissionType,
    checked: boolean
  ) => {
    setShareData((prev) =>
      prev.map((right) =>
        right.moduleId === moduleId && right.transactionId === transactionId
          ? { ...right, [permission]: checked }
          : right
      )
    )
  }

  // Check if all permissions in a column are selected
  const isColumnAllSelected = (permission: PermissionType) => {
    return shareData.length > 0 && shareData.every((right) => right[permission])
  }

  // Handle save button click
  const handleSave = async () => {
    if (shareData.length === 0) {
      toast.error("No data to save")
      return
    }

    try {
      setSaving(true)
      const rightsToSave = shareData.map((right) => ({
        ...right,
        shareToAll: right.shareToAll,
      }))

      const response = await shareDataSave.mutateAsync({
        data: rightsToSave,
      })

      if (response.result === 1) {
        toast.success("Share data saved successfully")
        refetchShareData()
      } else {
        toast.error(response.message || "Failed to save share data")
      }
    } catch (error) {
      console.error("Error saving share data:", error)
      toast.error("Failed to save share data")
    } finally {
      setSaving(false)
    }
  }

  // Handle search
  const handleSearch = async () => {
    refetchShareData()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold">Share Data</h2>
        <p className="text-muted-foreground">
          Manage data sharing permissions across different modules and
          transactions. Use the checkboxes to control sharing access.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="mb-4 flex items-center justify-end">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              {/* Fixed header table with column sizing */}
              <Table className="w-full table-fixed border-collapse">
                {/* Column group for consistent sizing */}
                <colgroup>
                  <col style={{ width: "200px" }} />
                  <col style={{ width: "200px" }} />
                  <col style={{ width: "150px" }} />
                </colgroup>

                {/* Sticky table header */}
                <TableHeader className="bg-background sticky top-0 z-20">
                  <TableRow className="bg-muted/50">
                    <TableHead>Module</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <span>Share To All</span>
                        <Checkbox
                          checked={isColumnAllSelected("shareToAll")}
                          onCheckedChange={(checked) => {
                            const isChecked = Boolean(checked)
                            setShareData((prev) =>
                              prev.map((right) => ({
                                ...right,
                                shareToAll: isChecked,
                              }))
                            )
                          }}
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
                    <col style={{ width: "200px" }} />
                    <col style={{ width: "200px" }} />
                    <col style={{ width: "150px" }} />
                  </colgroup>

                  <TableBody>
                    {isRightsLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-muted-foreground text-center"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : shareData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-muted-foreground text-center"
                        >
                          No data. Please select a user group.
                        </TableCell>
                      </TableRow>
                    ) : (
                      shareData.map((right) => (
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
                              checked={right.shareToAll}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(
                                  right.moduleId,
                                  right.transactionId,
                                  "shareToAll",
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
