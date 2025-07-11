"use client"

import { useEffect, useState } from "react"
import { IUserLookup } from "@/interfaces/lookup"
import { GridSettingFormValues } from "@/schemas/setting"
import { useAuthStore } from "@/stores/auth-store"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useForm } from "react-hook-form"

import {
  useCloneUserSettingSave,
  useUserGridSettingbyidGet,
} from "@/hooks/use-setting"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

type GridSetting = {
  id: string
  moduleName: string
  transactionName: string
  grdName: string
  grdKey: string
  grdColVisible: string
  grdColOrder: string
  grdColSize: string
  grdSort: string
  grdString: string
}

type FormValues = GridSettingFormValues & {
  targetUserId: string
}

export function GridFormatTable() {
  const form = useForm<FormValues>()
  const [selectedUser, setSelectedUser] = useState<IUserLookup | null>(null)
  const [targetUser, setTargetUser] = useState<IUserLookup | null>(null)
  const [gridSettings, setGridSettings] = useState<GridSetting[]>([])
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false)
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // Fetch grid settings for selected user
  const {
    data: gridSettingsData,
    refetch: refetchGridSettings,
    isFetching: isSettingsLoading,
  } = useUserGridSettingbyidGet(Number(selectedUser?.userId || 0), {
    enabled: Boolean(selectedUser?.userId),
  })

  // Clone user settings mutation
  const cloneUserSetting = useCloneUserSettingSave()

  // Update gridSettings when gridSettingsData changes
  useEffect(() => {
    if (gridSettingsData && Array.isArray(gridSettingsData)) {
      setGridSettings(gridSettingsData)
    } else {
      setGridSettings([])
    }
  }, [gridSettingsData])

  // When user changes, refetch settings
  useEffect(() => {
    if (selectedUser) {
      refetchGridSettings()
    } else {
      setGridSettings([])
    }
  }, [selectedUser, refetchGridSettings])
  const handleClone = async () => {
    if (!selectedUser || !targetUser) return

    try {
      // Call the mutation to clone user grid settings
      await cloneUserSetting.mutateAsync({
        fromUserId: Number(selectedUser.userId),
        toUserId: Number(targetUser.userId),
      })

      // Success - close dialog and reset form
      setIsCloneDialogOpen(false)
      setTargetUser(null)
      form.resetField("targetUserId")

      // Show a success message (you can implement a toast notification here)
      // For now, we'll just log it
      console.log(
        `Settings cloned from ${selectedUser.userName} to ${targetUser.userName}`
      )

      // If the target user is the currently selected user, refresh the data
      if (Number(selectedUser.userId) === Number(targetUser.userId)) {
        refetchGridSettings()
      }
    } catch (error) {
      console.error("Error cloning user settings:", error)
      // Show an error message (you can implement a toast notification here)
    }
  }

  const handleSearch = async () => {
    if (!selectedUser) {
      setGridSettings([])
      return
    }
    refetchGridSettings()
  }

  const columns: ColumnDef<GridSetting>[] = [
    {
      accessorKey: "moduleName",
      header: "Module",
      size: 100,
    },
    {
      accessorKey: "transactionName",
      header: "Transaction",
      size: 100,
    },
    {
      accessorKey: "grdName",
      header: "Grid Name",
      size: 200,
    },
    {
      accessorKey: "grdKey",
      header: "Grid Key",
      size: 200,
    },
    {
      accessorKey: "grdColVisible",
      header: "Column Visible",
      size: 150,
    },
    {
      accessorKey: "grdColOrder",
      header: "Column Order",
      size: 150,
    },
    {
      accessorKey: "grdColSize",
      header: "Column Size",
      size: 150,
    },
    {
      accessorKey: "grdSort",
      header: "Sort",
      size: 150,
    },
    {
      accessorKey: "grdString",
      header: "Grid String",
      size: 200,
    },
  ]

  const table = useReactTable({
    data: gridSettings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearch)}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-end gap-4">
              <div className="w-64">
                <UserAutocomplete
                  form={form}
                  name="userId"
                  onChangeEvent={(user: IUserLookup | null) =>
                    setSelectedUser(user)
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                disabled={isSettingsLoading}
              >
                {isSettingsLoading ? "Loading..." : "Search"}
              </Button>
            </div>
            <Button
              onClick={() => setIsCloneDialogOpen(true)}
              disabled={!selectedUser}
              size="sm"
            >
              Clone Setting
            </Button>
          </div>

          <div className="relative overflow-auto" style={{ height: "490px" }}>
            <Table className="w-full table-fixed">
              <TableHeader className="bg-muted top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width: `${header.getSize()}px`,
                          minWidth: `${header.getSize()}px`,
                        }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: `${cell.column.getSize()}px`,
                            minWidth: `${cell.column.getSize()}px`,
                          }}
                          className="truncate"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No data. Please select a user.
                      </TableCell>
                    </TableRow>

                    {/* Add empty rows to maintain consistent height */}
                    {Array.from({ length: 9 }).map((_, index) => (
                      <TableRow key={`empty-${index}`}>
                        <TableCell
                          colSpan={columns.length}
                          className="h-10"
                        ></TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </form>
      </Form>{" "}
      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => {
            // Prevent closing if clicking on react-select elements
            if (
              e.target &&
              (e.target as Element).closest(".react-select__menu")
            ) {
              e.preventDefault()
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Clone User Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="font-medium">Source User</div>
              <div className="text-muted-foreground text-sm">
                {selectedUser?.userName || "No user selected"}
              </div>
            </div>{" "}
            <div className="grid gap-2">
              <div className="font-medium">Target User</div>
              <div onClick={(e) => e.stopPropagation()}>
                <UserAutocomplete
                  form={form}
                  name="targetUserId"
                  onChangeEvent={(user: IUserLookup | null) =>
                    setTargetUser(user)
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCloneDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClone}
              disabled={!targetUser || cloneUserSetting.isPending}
            >
              {cloneUserSetting.isPending ? "Cloning..." : "Clone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
