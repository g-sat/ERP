"use client"

import { useState } from "react"
import { IGLContraFilter, IGLContraHd } from "@/interfaces/gl-arapcontra"
import { format } from "date-fns"
import { Filter, RefreshCw, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ContraTableProps {
  data: IGLContraHd[]
  isLoading: boolean
  onContraSelect: (contra: IGLContraHd | undefined) => void
  onRefresh: () => void
  onFilterChange: (filters: IGLContraFilter) => void
  initialFilters: IGLContraFilter
}

export default function ContraTable({
  data,
  isLoading,
  onContraSelect,
  onRefresh,
  onFilterChange,
  initialFilters,
}: ContraTableProps) {
  const [filters, setFilters] = useState<IGLContraFilter>(initialFilters)
  const [searchTerm, setSearchTerm] = useState("")

  const handleFilterChange = (newFilters: Partial<IGLContraFilter>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleSearch = () => {
    handleFilterChange({ search: searchTerm })
  }

  const handleContraClick = (contra: IGLContraHd) => {
    onContraSelect(contra)
  }

  const getStatusBadge = (contra: IGLContraHd) => {
    if (contra.isCancel) {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    if (contra.isPost) {
      return <Badge variant="default">Posted</Badge>
    }
    if (contra.appStatusId && contra.appStatusId > 0) {
      return <Badge variant="secondary">Pending Approval</Badge>
    }
    return <Badge variant="outline">Draft</Badge>
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Contra Entries...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AR/AP Contra Entries</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search contra entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Search className="mr-1 h-4 w-4" />
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                handleFilterChange({ startDate: e.target.value })
              }
              className="w-40"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange({ endDate: e.target.value })}
              className="w-40"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No contra entries found.</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try adjusting your search criteria or create a new contra entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contra No</TableHead>
                  <TableHead>Reference No</TableHead>
                  <TableHead>Transaction Date</TableHead>
                  <TableHead>Account Date</TableHead>
                  <TableHead>Supplier ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">
                    Total Local Amount
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((contra) => (
                  <TableRow
                    key={contra.contraId}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleContraClick(contra)}
                  >
                    <TableCell className="font-medium">
                      <Badge variant="outline">{contra.contraNo}</Badge>
                    </TableCell>
                    <TableCell>{contra.referenceNo}</TableCell>
                    <TableCell>
                      {contra.trnDate
                        ? format(
                            typeof contra.trnDate === "string"
                              ? new Date(contra.trnDate)
                              : contra.trnDate,
                            "dd/MM/yyyy"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {contra.accountDate
                        ? format(
                            typeof contra.accountDate === "string"
                              ? new Date(contra.accountDate)
                              : contra.accountDate,
                            "dd/MM/yyyy"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>{contra.supplierId || "-"}</TableCell>
                    <TableCell>{contra.customerId || "-"}</TableCell>
                    <TableCell className="text-right">
                      {contra.totAmt ? contra.totAmt.toFixed(2) : "0.00"}
                    </TableCell>
                    <TableCell className="text-right">
                      {contra.totLocalAmt
                        ? contra.totLocalAmt.toFixed(2)
                        : "0.00"}
                    </TableCell>
                    <TableCell>{getStatusBadge(contra)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleContraClick(contra)
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
