"use client"

import { useState } from "react"
import { IEmployerDetails } from "@/interfaces/employer-details"
import { Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react"

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

interface EmployerDetailsTableProps {
  data: IEmployerDetails[]
  onEdit?: (employerDetails: IEmployerDetails) => void
  onDelete?: (employerDetails: IEmployerDetails) => void
  onCreate?: () => void
  onRefresh?: () => void
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function EmployerDetailsTable({
  data,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: EmployerDetailsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (employerDetails) =>
      employerDetails.establishmentId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employerDetails.branch
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employerDetails.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
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
              placeholder="Search employer details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="outline">{filteredData.length} records</Badge>
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
              <col className="w-[150px] min-w-[120px]" />
              <col className="w-[120px] min-w-[100px]" />
              <col className="w-[150px] min-w-[120px]" />
              <col className="w-[150px] min-w-[120px]" />
              <col className="w-[150px] min-w-[120px]" />
              <col className="w-[100px] min-w-[80px]" />
              <col className="w-[100px] min-w-[80px]" />
            </colgroup>
            <TableHeader className="bg-background sticky top-0 z-20">
              <TableRow className="bg-muted/50">
                <TableHead className="bg-muted/50 sticky left-0 z-30">
                  Company
                </TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Establishment ID</TableHead>
                <TableHead>Bank Account</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Scrollable body table */}
          <div className="max-h-[500px] overflow-y-auto">
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[150px] min-w-[120px]" />
                <col className="w-[120px] min-w-[100px]" />
                <col className="w-[150px] min-w-[120px]" />
                <col className="w-[150px] min-w-[120px]" />
                <col className="w-[150px] min-w-[120px]" />
                <col className="w-[100px] min-w-[80px]" />
                <col className="w-[100px] min-w-[80px]" />
              </colgroup>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No employer details found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((employerDetails) => (
                    <TableRow key={employerDetails.employerDetailsId}>
                      <TableCell className="bg-background sticky left-0 z-10 py-2">
                        <div className="text-xs font-medium">
                          {employerDetails.companyName || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {employerDetails.branch || "—"}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {employerDetails.establishmentId || "—"}
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        <div className="max-w-[150px] truncate">
                          {employerDetails.bankAccountNumber || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs">
                        {employerDetails.bankName || "—"}
                      </TableCell>
                      <TableCell className="py-2">
                        {getStatusBadge(employerDetails.isActive || false)}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(employerDetails)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          )}
                          {canDelete && onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(employerDetails)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
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
