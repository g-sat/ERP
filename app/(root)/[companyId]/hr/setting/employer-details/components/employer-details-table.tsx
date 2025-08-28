"use client"

import { useState } from "react"
import { IEmployerDetails } from "@/interfaces/employer-details"
import { Edit, Plus, RefreshCw, Search, Trash2 } from "lucide-react"

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

  return (
    <div className="space-y-4">
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
              <TableHead>Company</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Establishment ID</TableHead>
              <TableHead>Bank Account</TableHead>
              <TableHead>Bank Name</TableHead>

              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No employer details found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((employerDetails) => (
                <TableRow key={employerDetails.employerDetailsId}>
                  <TableCell className="py-1 text-xs">
                    {employerDetails.companyName || "-"}
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {employerDetails.branch || "-"}
                  </TableCell>
                  <TableCell className="py-1 text-xs font-medium">
                    {employerDetails.establishmentId}
                  </TableCell>

                  <TableCell className="py-1">
                    <div className="max-w-[150px] truncate text-xs">
                      {employerDetails.bankAccountNumber || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 text-xs">
                    {employerDetails.bankName || "-"}
                  </TableCell>

                  <TableCell className="py-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        employerDetails.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employerDetails.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(employerDetails)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      {canDelete && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(employerDetails)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  )
}
