"use client"

import { useState } from "react"
import { IDepartment } from "@/interfaces/department"
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

interface DepartmentTableProps {
  data: IDepartment[]
  onEdit: (department: IDepartment) => void
  onDelete: (department: IDepartment) => void
  onCreate: () => void
  onView: (department: IDepartment) => void
  onRefresh?: () => void
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function DepartmentTable({
  data,
  onEdit,
  onDelete,
  onCreate,
  onView,
  onRefresh,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: DepartmentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (department) =>
      department.departmentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      department.departmentCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search departments..."
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
              <TableHead>Department Code</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((department) => (
                <TableRow key={department.departmentId}>
                  <TableCell className="py-1 text-xs font-medium">
                    {department.departmentCode}
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {department.departmentName}
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {department.remarks || "-"}
                  </TableCell>
                  <TableCell className="py-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        department.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {department.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => onView(department)}>
                          <Eye className="mr-2" /> View
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(department)}>
                            <Edit className="mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(department)}
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
