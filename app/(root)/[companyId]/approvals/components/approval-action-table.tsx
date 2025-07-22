"use client"

import { useState } from "react"
import { ApprovalAction, ApprovalActionFilter } from "@/interfaces/approval"
import { format, isValid } from "date-fns"
import { Plus, RefreshCw, Search } from "lucide-react"

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

interface ApprovalActionTableProps {
  data: ApprovalAction[]
  isLoading?: boolean
  onActionSelect?: (action: ApprovalAction | undefined) => void
  onDeleteAction?: (actionId: string) => void
  onEditAction?: (action: ApprovalAction) => void
  onCreateAction?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: ApprovalActionFilter) => void
}

export function ApprovalActionTable({
  data,
  isLoading = false,
  onActionSelect,
  onDeleteAction,
  onEditAction,
  onCreateAction,
  onRefresh,
  onFilterChange,
}: ApprovalActionTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange?.({ search: query })
  }

  const getActionTypeBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(event) => handleSearch(event.target.value)}
              className="pl-8 sm:w-[300px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
          {onCreateAction && (
            <Button size="sm" onClick={onCreateAction}>
              <Plus className="mr-2 h-4 w-4" />
              Create Action
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action ID</TableHead>
              <TableHead>Request ID</TableHead>
              <TableHead>Level ID</TableHead>
              <TableHead>Action By</TableHead>
              <TableHead>Action Date</TableHead>
              <TableHead>Action Type</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground text-center"
                >
                  No approval actions found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((action) => (
                <TableRow key={action.actionId}>
                  <TableCell>{action.actionId}</TableCell>
                  <TableCell>{action.requestId}</TableCell>
                  <TableCell>{action.levelId}</TableCell>
                  <TableCell>{action.actionById}</TableCell>
                  <TableCell>
                    {action.actionDate && isValid(new Date(action.actionDate))
                      ? format(new Date(action.actionDate), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getActionTypeBadgeVariant(action.actionType)}
                    >
                      {action.actionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {action.comments || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onActionSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActionSelect(action)}
                        >
                          View
                        </Button>
                      )}
                      {onEditAction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditAction(action)}
                        >
                          Edit
                        </Button>
                      )}
                      {onDeleteAction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDeleteAction(action.actionId.toString())
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
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
