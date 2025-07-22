"use client"

import { useState } from "react"
import { ApprovalRequest, ApprovalRequestFilter } from "@/interfaces/approval"
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

interface ApprovalRequestTableProps {
  data: ApprovalRequest[]
  isLoading?: boolean
  onRequestSelect?: (request: ApprovalRequest | undefined) => void
  onDeleteRequest?: (requestId: string) => void
  onEditRequest?: (request: ApprovalRequest) => void
  onCreateRequest?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: ApprovalRequestFilter) => void
}

export function ApprovalRequestTable({
  data,
  isLoading = false,
  onRequestSelect,
  onDeleteRequest,
  onEditRequest,
  onCreateRequest,
  onRefresh,
  onFilterChange,
}: ApprovalRequestTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange?.({ search: query })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      case "Cancelled":
        return "outline"
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
              placeholder="Search requests..."
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
          {onCreateRequest && (
            <Button size="sm" onClick={onCreateRequest}>
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Process ID</TableHead>
              <TableHead>Company ID</TableHead>
              <TableHead>Reference ID</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead>Current Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-muted-foreground text-center"
                >
                  No approval requests found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((request) => (
                <TableRow key={request.requestId}>
                  <TableCell>{request.requestId}</TableCell>
                  <TableCell>{request.processId}</TableCell>
                  <TableCell>{request.companyId}</TableCell>
                  <TableCell className="font-medium">
                    {request.referenceId}
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    {request.requestedOn &&
                    isValid(new Date(request.requestedOn))
                      ? format(new Date(request.requestedOn), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>{request.currentLevelId}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onRequestSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRequestSelect(request)}
                        >
                          View
                        </Button>
                      )}
                      {onEditRequest && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditRequest(request)}
                        >
                          Edit
                        </Button>
                      )}
                      {onDeleteRequest && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDeleteRequest(request.requestId.toString())
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
