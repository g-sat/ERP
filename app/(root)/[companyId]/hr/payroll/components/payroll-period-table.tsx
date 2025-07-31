"use client"

import { useState } from "react"
import { IPayrollPeriod, IPayrollPeriodFilter } from "@/interfaces/payroll"
import { format } from "date-fns"
import {
  Edit,
  Eye,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

interface PayrollPeriodTableProps {
  data: IPayrollPeriod[]
  onEdit?: (period: IPayrollPeriod) => void
  onDelete?: (periodId: string) => void
  onView: (period: IPayrollPeriod | undefined) => void
  onFilterChange: (filters: IPayrollPeriodFilter) => void
  onRefresh?: () => void
}

export function PayrollPeriodTable({
  data,
  onEdit,
  onDelete,
  onView,
  onFilterChange,
  onRefresh,
}: PayrollPeriodTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onFilterChange({ search: value })
  }

  const getStatusBadge = (period: IPayrollPeriod) => {
    if (period.isClosed) {
      return <Badge variant="destructive">Closed</Badge>
    }
    if (period.isActive) {
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="secondary">Inactive</Badge>
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-"
    return format(new Date(date), "MMM dd, yyyy")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search periods..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            console.log("Refresh button clicked for periods")
            onRefresh?.()
          }}
          title="Refresh"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Closed Date</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground text-center"
                >
                  No payroll periods found
                </TableCell>
              </TableRow>
            ) : (
              data.map((period) => (
                <TableRow key={period.payrollPeriodId}>
                  <TableCell className="font-medium">
                    {period.periodName}
                  </TableCell>
                  <TableCell>{formatDate(period.startDate)}</TableCell>
                  <TableCell>{formatDate(period.endDate)}</TableCell>
                  <TableCell>{getStatusBadge(period)}</TableCell>
                  <TableCell>{formatDate(period.closedDate)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {period.remarks || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(period)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(period)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onDelete(period.payrollPeriodId.toString())
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
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
