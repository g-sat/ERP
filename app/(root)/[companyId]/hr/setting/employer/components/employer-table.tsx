"use client"

import { useState } from "react"
import { IEmployer } from "@/interfaces/employer"
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

interface EmployerTableProps {
  data: IEmployer[]
  onEdit?: (employer: IEmployer) => void
  onDelete?: (employer: IEmployer) => void
  onCreate?: () => void
  onRefresh?: () => void
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function EmployerTable({
  data,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: EmployerTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (employer) =>
      employer.establishmentId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employer.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <TableHeader className="bg-background sticky top-0 z-20">
              <TableRow className="bg-muted/50">
                <TableHead className="bg-muted/50 sticky left-0 z-30 w-[80px] text-left">
                  Actions
                </TableHead>
                <TableHead className="w-[200px]">Company</TableHead>
                <TableHead className="w-[80px]">Branch</TableHead>
                <TableHead className="w-[200px]">Address</TableHead>
                <TableHead className="w-[80px]">Phone</TableHead>
                <TableHead className="w-[150px]">Email</TableHead>
                <TableHead className="w-[120px]">Establishment ID</TableHead>
                <TableHead className="w-[150px]">Bank Account</TableHead>
                <TableHead className="w-[120px]">Bank Name</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Scrollable body table */}
          <div className="max-h-[500px] overflow-y-auto">
            <Table className="w-full table-fixed border-collapse">
              <colgroup>
                <col className="w-[80px]" />
                <col className="w-[200px]" />
                <col className="w-[80px]" />
                <col className="w-[200px]" />
                <col className="w-[80px]" />
                <col className="w-[150px]" />
                <col className="w-[120px]" />
                <col className="w-[150px]" />
                <col className="w-[120px]" />
                <col className="w-[80px]" />
              </colgroup>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No employer details found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((employer) => (
                    <TableRow key={employer.employerId}>
                      <TableCell className="bg-background sticky left-0 z-10 w-[80px] py-2 text-left">
                        <div className="flex items-center justify-start gap-1">
                          {canEdit && onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(employer)}
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
                              onClick={() => onDelete(employer)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[150px] py-2 text-xs">
                        <div className="text-xs font-medium break-words">
                          {employer.companyName || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px] py-2 text-xs">
                        <div className="break-words">
                          {employer.branch || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[200px] py-2 text-xs">
                        <div className="break-words">
                          {employer.address || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px] py-2 text-xs">
                        <div className="break-words">
                          {employer.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[150px] py-2 text-xs">
                        <div className="break-words">
                          {employer.email || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] py-2 text-xs">
                        <div className="break-words">
                          {employer.establishmentId || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[150px] py-2 text-xs">
                        <div className="break-words">
                          {employer.bankAccountNumber || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] py-2 text-xs">
                        <div className="break-words">
                          {employer.bankName || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="w-[80px] py-2">
                        {getStatusBadge(employer.isActive || false)}
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
