"use client"

import { useState } from "react"
import { IDesignation } from "@/interfaces/designation"
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DesignationTableProps {
  data: IDesignation[]
  onEdit: (designation: IDesignation) => void
  onDelete?: (designation: IDesignation) => void
  onCreate: () => void
  onView: (designation: IDesignation) => void
  onRefresh?: () => void
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function DesignationTable({
  data,
  onEdit,
  onDelete,
  onCreate,
  onView,
  onRefresh,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: DesignationTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (designation) =>
      designation.designationName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      designation.designationCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search designations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
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
          {canCreate && (
            <Button size="sm" onClick={onCreate} className="h-8 px-2 lg:px-3">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Designation Code</TableHead>
              <TableHead>Designation Name</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No designations found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((designation) => (
                <TableRow key={designation.designationId}>
                  <TableCell className="py-1 text-xs font-medium">
                    {designation.designationCode}
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {designation.designationName}
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {designation.remarks || "-"}
                  </TableCell>
                  <TableCell className="py-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        designation.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {designation.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(designation)}>
                          <Eye className="mr-2" /> View
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(designation)}>
                            <Edit className="mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete?.(designation)}
                          >
                            <Trash2 className="mr-2" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
