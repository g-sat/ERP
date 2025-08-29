"use client"

import { useState } from "react"
import { IWorkLocation } from "@/interfaces/worklocation"
import { Edit, Eye, Plus, RefreshCw, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  data: IWorkLocation[]
  onCreate?(): void
  onRefresh?(): void
  onEdit(item: IWorkLocation): void
  onDelete(item: IWorkLocation): void
  onView(item: IWorkLocation): void
}

export function WorkLocationTable({
  data,
  onCreate,
  onRefresh,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const [search, setSearch] = useState("")

  const filtered = data.filter((loc) =>
    [loc.workLocationName, loc.workLocationCode, loc.city].some((str) =>
      str?.toLowerCase().includes(search.toLowerCase())
    )
  )

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  return (
    <div className="@container space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search work locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="outline">{filtered.length} locations</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 px-2 lg:px-3"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={onCreate} className="h-8 px-2 lg:px-3">
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-20">
            <TableRow className="bg-muted/50">
              <TableHead className="bg-muted/50 sticky left-0 z-30 w-[120px] min-w-[100px]">
                Code
              </TableHead>
              <TableHead className="w-[200px] min-w-[180px]">Name</TableHead>
              <TableHead className="w-[150px] min-w-[120px]">
                Address 1
              </TableHead>
              <TableHead className="w-[150px] min-w-[120px]">
                Address 2
              </TableHead>
              <TableHead className="w-[120px] min-w-[100px]">City</TableHead>
              <TableHead className="w-[120px] min-w-[100px]">Country</TableHead>
              <TableHead className="w-[100px] min-w-[80px]">Status</TableHead>
              <TableHead className="w-[80px] min-w-[60px] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-h-[500px] overflow-y-auto">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No work locations found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((loc) => (
                <TableRow key={loc.workLocationId}>
                  <TableCell className="bg-background sticky left-0 z-10 w-[120px] min-w-[100px] py-2">
                    <span className="text-xs font-medium">
                      {loc.workLocationCode}
                    </span>
                  </TableCell>
                  <TableCell className="w-[200px] min-w-[180px] py-2 text-xs">
                    {loc.workLocationName}
                  </TableCell>
                  <TableCell className="w-[150px] min-w-[120px] py-2 text-xs">
                    {loc.address1 || "—"}
                  </TableCell>
                  <TableCell className="w-[150px] min-w-[120px] py-2 text-xs">
                    {loc.address2 || "—"}
                  </TableCell>
                  <TableCell className="w-[120px] min-w-[100px] py-2 text-xs">
                    {loc.city || "—"}
                  </TableCell>
                  <TableCell className="w-[120px] min-w-[100px] py-2 text-xs">
                    {loc.countryName || "—"}
                  </TableCell>
                  <TableCell className="w-[100px] min-w-[80px] py-2">
                    {getStatusBadge(loc.isActive || false)}
                  </TableCell>
                  <TableCell className="w-[80px] min-w-[60px] py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(loc)}
                        className="h-6 w-6 p-0"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(loc)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(loc)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
