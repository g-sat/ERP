"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
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
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayrollEmployeeTableProps {
  data: IPayrollEmployee[]
  onEdit?: (employee: IPayrollEmployee) => void
  onDelete?: (employeeId: string) => void
  onView: (employee: IPayrollEmployee | undefined) => void
  onFilterChange: (filters: Record<string, unknown>) => void
  onRefresh?: () => void
}

export function PayrollEmployeeTable({
  data,
  onEdit,
  onDelete,
  onView,
  onFilterChange,
  onRefresh,
}: PayrollEmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onFilterChange({ search: value })
  }

  const getStatusBadge = (employee: IPayrollEmployee) => {
    if (employee.isPaid) {
      return <Badge variant="default">Paid</Badge>
    } else if (employee.isProcessed) {
      return <Badge variant="secondary">Processed</Badge>
    } else {
      return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            console.log("Refresh button clicked for employees")
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
              <TableHead>Employee ID</TableHead>
              <TableHead>Payroll Period ID</TableHead>
              <TableHead>Total Earnings</TableHead>
              <TableHead>Total Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
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
                  No employee payroll data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee) => (
                <TableRow key={employee.payrollEmployeeId}>
                  <TableCell className="font-medium">
                    {employee.employeeId}
                  </TableCell>
                  <TableCell>{employee.payrollPeriodId}</TableCell>
                  <TableCell>
                    <CurrencyFormatter
                      amount={employee.totalEarnings}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <CurrencyFormatter
                      amount={employee.totalDeductions}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="font-semibold">
                    <CurrencyFormatter amount={employee.netSalary} size="sm" />
                  </TableCell>
                  <TableCell>{getStatusBadge(employee)}</TableCell>
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
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(employee)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onDelete(employee.payrollEmployeeId.toString())
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
