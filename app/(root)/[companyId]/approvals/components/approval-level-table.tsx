"use client"

import { useState } from "react"
import { ApprovalLevel, ApprovalLevelFilter } from "@/interfaces/approval"
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

interface ApprovalLevelTableProps {
  data: ApprovalLevel[]
  isLoading?: boolean
  onLevelSelect?: (level: ApprovalLevel | undefined) => void
  onDeleteLevel?: (levelId: string) => void
  onEditLevel?: (level: ApprovalLevel) => void
  onCreateLevel?: () => void
  onRefresh?: () => void
  onFilterChange?: (filters: ApprovalLevelFilter) => void
}

export function ApprovalLevelTable({
  data,
  isLoading = false,
  onLevelSelect,
  onDeleteLevel,
  onEditLevel,
  onCreateLevel,
  onRefresh,
  onFilterChange,
}: ApprovalLevelTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onFilterChange?.({ search: query })
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
              placeholder="Search levels..."
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
          {onCreateLevel && (
            <Button size="sm" onClick={onCreateLevel}>
              <Plus className="mr-2 h-4 w-4" />
              Create Level
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level ID</TableHead>
              <TableHead>Process ID</TableHead>
              <TableHead>Level Number</TableHead>
              <TableHead>User Role ID</TableHead>
              <TableHead>Level Name</TableHead>
              <TableHead>Is Final</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground text-center"
                >
                  No approval levels found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((level) => (
                <TableRow key={level.levelId}>
                  <TableCell>{level.levelId}</TableCell>
                  <TableCell>{level.processId}</TableCell>
                  <TableCell>{level.levelNumber}</TableCell>
                  <TableCell>{level.userRoleId}</TableCell>
                  <TableCell className="font-medium">
                    {level.levelName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={level.isFinal ? "default" : "secondary"}>
                      {level.isFinal ? "Final" : "Not Final"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onLevelSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLevelSelect(level)}
                        >
                          View
                        </Button>
                      )}
                      {onEditLevel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLevel(level)}
                        >
                          Edit
                        </Button>
                      )}
                      {onDeleteLevel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDeleteLevel(level.levelId.toString())
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
