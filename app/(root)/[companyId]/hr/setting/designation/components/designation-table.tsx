"use client"

import { useState } from "react"
import { IDesignation } from "@/interfaces/designation"
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

interface DesignationTableProps {
  data: IDesignation[]
  onEditAction: (designation: IDesignation) => void
  onDeleteAction?: (designation: IDesignation) => void
  onCreateAction: () => void
  onView: (designation: IDesignation) => void
  onRefreshAction?: () => void
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function DesignationTable({
  data,
  onEditAction,
  onDeleteAction,
  onCreateAction,
  onView,
  onRefreshAction,
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
              placeholder="Search designations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="outline">{filteredData.length} designations</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshAction}
            className="h-8 px-2 lg:px-3"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {canCreate && (
            <Button
              size="sm"
              onClick={onCreateAction}
              className="h-8 px-2 lg:px-3"
            >
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
              <col className="w-[80px] min-w-[60px]" />
              <col className="w-[120px] min-w-[100px]" />
              <col className="w-[200px] min-w-[180px]" />
              <col className="w-[150px] min-w-[120px]" />
              <col className="w-[100px] min-w-[80px]" />
            </colgroup>
            <TableHeader className="bg-background sticky top-0 z-20">
              <TableRow className="bg-muted/50">
                <TableHead className="bg-muted/50 sticky left-0 z-30 text-left">
                  Actions
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Scrollable body table */}
          <div className="max-h-[500px] overflow-y-auto">
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[80px] min-w-[60px]" />
                <col className="w-[120px] min-w-[100px]" />
                <col className="w-[200px] min-w-[180px]" />
                <col className="w-[150px] min-w-[120px]" />
                <col className="w-[100px] min-w-[80px]" />
              </colgroup>
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
                      <TableCell className="bg-background sticky left-0 z-10 py-2 text-left">
                        <div className="flex items-center justify-start gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(designation)}
                            className="h-5 w-5 p-0"
                          >
                            <Eye className="h-2.5 w-2.5" />
                            <span className="sr-only">View</span>
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditAction(designation)}
                              className="h-5 w-5 p-0"
                            >
                              <Edit className="h-2.5 w-2.5" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          {canDelete && onDeleteAction && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteAction(designation)}
                              className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-xs font-medium">
                          {designation.designationCode}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {designation.designationName}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {designation.remarks || "-"}
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusBadge(designation.isActive || false)}
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
