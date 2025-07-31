"use client"

import {
  IPayrollComponent,
  IPayrollComponentFilter,
} from "@/interfaces/payroll"
import { Edit, Eye, MoreHorizontal, RefreshCcw, Trash2 } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PayrollComponentTableProps {
  data: IPayrollComponent[]
  onEdit?: (component: IPayrollComponent) => void
  onDelete?: (componentId: string) => void
  onView: (component: IPayrollComponent | undefined) => void
  onFilterChange: (filters: IPayrollComponentFilter) => void
  onRefresh?: () => void
}

export function PayrollComponentTable({
  data,
  onEdit,
  onDelete,
  onView,
  onFilterChange,
  onRefresh,
}: PayrollComponentTableProps) {
  const getTypeBadge = (component: IPayrollComponent) => {
    if (component.componentType === "EARNING") {
      return <Badge variant="default">Earning</Badge>
    }
    return <Badge variant="secondary">Deduction</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="mb-2 flex justify-end">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            console.log("Refresh button clicked for components")
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
              <TableHead>Component Code</TableHead>
              <TableHead>Component Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Calculation Type</TableHead>
              <TableHead>Sort Order</TableHead>
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
                  No payroll components found
                </TableCell>
              </TableRow>
            ) : (
              data.map((component) => (
                <TableRow key={component.payrollComponentId}>
                  <TableCell className="font-medium">
                    {component.componentCode}
                  </TableCell>
                  <TableCell>{component.componentName}</TableCell>
                  <TableCell>{getTypeBadge(component)}</TableCell>
                  <TableCell>{component.calculationType}</TableCell>
                  <TableCell>{component.sortOrder}</TableCell>
                  <TableCell>
                    {component.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
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
                        <DropdownMenuItem onClick={() => onView(component)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(component)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                onDelete(
                                  component.payrollComponentId.toString()
                                )
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
