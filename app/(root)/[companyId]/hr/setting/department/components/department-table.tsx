"use client"

import { useState } from "react"
import { IDepartment } from "@/interfaces/department"
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
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="outline">{filteredData.length} departments</Badge>
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

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          {/* Header table */}
          <Table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[120px] min-w-[100px]" />
              <col className="w-[200px] min-w-[180px]" />
              <col className="w-[150px] min-w-[120px]" />
              <col className="w-[100px] min-w-[80px]" />
              <col className="w-[80px] min-w-[60px]" />
            </colgroup>
            <TableHeader className="bg-background sticky top-0 z-20">
              <TableRow className="bg-muted/50">
                <TableHead className="bg-muted/50 sticky left-0 z-30">
                  Code
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Scrollable body table */}
          <div className="max-h-[500px] overflow-y-auto">
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[120px] min-w-[100px]" />
                <col className="w-[200px] min-w-[180px]" />
                <col className="w-[150px] min-w-[120px]" />
                <col className="w-[100px] min-w-[80px]" />
                <col className="w-[80px] min-w-[60px]" />
              </colgroup>
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
                      <TableCell className="bg-background sticky left-0 z-10 py-2">
                        <div className="text-xs font-medium">
                          {department.departmentCode}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {department.departmentName}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {department.remarks || "—"}
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusBadge(department.isActive || false)}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(department)}
                            className="h-5 w-5 p-0"
                          >
                            <Eye className="h-2.5 w-2.5" />
                            <span className="sr-only">View</span>
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(department)}
                              className="h-5 w-5 p-0"
                            >
                              <Edit className="h-2.5 w-2.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(department)}
                              className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Table>
      </div>
    </div>
  )
}
