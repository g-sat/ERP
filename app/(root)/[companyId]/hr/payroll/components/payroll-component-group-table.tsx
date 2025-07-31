"use client"

import { IPayrollComponentGroup } from "@/interfaces/payroll"
import {
  Calendar,
  Edit,
  FileText,
  RefreshCcw,
  Trash2,
  Users,
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

interface PayrollComponentGroupTableProps {
  data: IPayrollComponentGroup[]
  onEdit?: (group: IPayrollComponentGroup) => void
  onDelete?: (group: IPayrollComponentGroup) => void
  onRefresh?: () => void // <-- add this
}

export function PayrollComponentGroupTable({
  data,
  onEdit,
  onDelete,
  onRefresh,
}: PayrollComponentGroupTableProps) {
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
              <Users className="h-5 w-5" />
              Component Groups
            </CardTitle>
            <CardDescription>
              Manage payroll component groups and their configurations
            </CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              console.log("Refresh button clicked for component groups")
              onRefresh?.()
            }}
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {data.length === 0 ? (
            <div className="col-span-full py-8 text-center">
              <FileText className="text-muted-foreground mx-auto h-12 w-12" />
              <p className="text-muted-foreground mt-2">
                No component groups found
              </p>
            </div>
          ) : (
            data.map((group) => (
              <Card
                key={group.componentGroupId}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {group.groupName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Code: {group.groupCode}
                      </CardDescription>
                    </div>
                    {getStatusBadge(group.isActive)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {group.remarks && (
                    <p className="text-muted-foreground mb-4 text-sm">
                      {group.remarks}
                    </p>
                  )}

                  <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Created:{" "}
                      {group.createDate
                        ? new Date(group.createDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}

                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(group)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
          <div>Showing {data.length} groups</div>
          <div>
            <span>
              {data.filter((group) => group.isActive).length} active groups
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
