"use client"

import React from "react"
import { IPayrollComponentGLMapping } from "@/interfaces/payroll"
import {
  Building,
  Edit,
  Eye,
  FileText,
  Landmark,
  Plus,
  RefreshCcw,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PayrollAccountIntegrationTableProps {
  mappings: IPayrollComponentGLMapping[]
  onView?: (mapping: IPayrollComponentGLMapping) => void
  onEdit?: (mapping: IPayrollComponentGLMapping) => void
  onDelete?: (mapping: IPayrollComponentGLMapping) => void
  onCreate?: () => void
  onRefresh?: () => void // <-- add this
}

export function PayrollAccountIntegrationTable({
  mappings,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
}: PayrollAccountIntegrationTableProps) {
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Account Integration
            </CardTitle>
            <CardDescription>
              Manage GL account mappings for payroll components
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                console.log("Refresh button clicked for account integration")
                onRefresh?.()
              }}
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button className="flex items-center gap-2" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Create Mapping
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mappings.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <p className="text-muted-foreground mt-2">
              No account mappings found
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Expense GL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.mappingId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="text-muted-foreground h-4 w-4" />
                        {mapping.companyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {mapping.componentName}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {mapping.componentCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{mapping.departmentName || "N/A"}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {mapping.expenseGLCode || mapping.expenseGLId}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {mapping.expenseGLName}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(mapping.isActive || false)}
                    </TableCell>
                    <TableCell>
                      {mapping.createDate
                        ? new Date(mapping.createDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onView?.(mapping)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Mapping Details</DialogTitle>
                              <DialogDescription>
                                Detailed view of the GL mapping
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-muted-foreground text-sm font-medium">
                                  Company
                                </label>
                                <p className="font-medium">
                                  {mapping.companyName}
                                </p>
                              </div>
                              <div>
                                <label className="text-muted-foreground text-sm font-medium">
                                  Component
                                </label>
                                <p className="font-medium">
                                  {mapping.componentName}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  Code: {mapping.componentCode}
                                </p>
                              </div>
                              <div>
                                <label className="text-muted-foreground text-sm font-medium">
                                  Department
                                </label>
                                <p className="font-medium">
                                  {mapping.departmentName || "N/A"}
                                </p>
                              </div>
                              {mapping.expenseGLId && (
                                <div>
                                  <label className="text-muted-foreground text-sm font-medium">
                                    Expense GL Account
                                  </label>
                                  <p className="font-medium">
                                    {mapping.expenseGLCode ||
                                      mapping.expenseGLId}
                                  </p>
                                </div>
                              )}

                              <div>
                                <label className="text-muted-foreground text-sm font-medium">
                                  Status
                                </label>
                                <div className="mt-1">
                                  {getStatusBadge(mapping.isActive || false)}
                                </div>
                              </div>
                              <div>
                                <label className="text-muted-foreground text-sm font-medium">
                                  Created Date
                                </label>
                                <p className="text-sm">
                                  {mapping.createDate
                                    ? new Date(
                                        mapping.createDate
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(mapping)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(mapping)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary */}
        <div className="text-muted-foreground mt-6 flex items-center justify-between text-sm">
          <div>Showing {mappings.length} mappings</div>
          <div>
            <span>
              {mappings.filter((mapping) => mapping.isActive).length} active
              mappings
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
