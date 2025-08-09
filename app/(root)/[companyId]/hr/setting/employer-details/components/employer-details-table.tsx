"use client"

import { useState } from "react"
import { IEmployerDetails } from "@/interfaces/employer-details"
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

interface EmployerDetailsTableProps {
  data: IEmployerDetails[]
  onEdit?: (employerDetails: IEmployerDetails) => void
  onDelete?: (employerDetails: IEmployerDetails) => void
  onCreate?: () => void
  onView?: (employerDetails: IEmployerDetails) => void
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
  onView,
  onRefresh,
  canCreate = true,
  canEdit = true,
  canDelete = true,
}: EmployerDetailsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (employerDetails) =>
      employerDetails.establishmentId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employerDetails.employerRefno
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employerDetails.wpsBankCode
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
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
              <TableHead>Establishment ID</TableHead>
              <TableHead>Employer Ref No</TableHead>
              <TableHead>WPS Bank Code</TableHead>
              <TableHead>WPS File Reference</TableHead>
              <TableHead>Bank Account</TableHead>
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
                  <TableCell>{employerDetails.companyName || "-"}</TableCell>
                  <TableCell className="font-medium">
                    {employerDetails.establishmentId}
                  </TableCell>
                  <TableCell>{employerDetails.employerRefno || "-"}</TableCell>
                  <TableCell>{employerDetails.wpsBankCode || "-"}</TableCell>
                  <TableCell>
                    {employerDetails.wpsFileReference || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate">
                      {employerDetails.bankAccountNumber || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {onView && (
                          <DropdownMenuItem
                            onClick={() => onView(employerDetails)}
                          >
                            <Eye className="mr-2" /> View
                          </DropdownMenuItem>
                        )}
                        {canEdit && onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(employerDetails)}
                          >
                            <Edit className="mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && onDelete && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(employerDetails)}
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
