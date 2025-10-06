"use client"

import { useMemo, useState } from "react"
import { IGLPeriodClose } from "@/interfaces/gl-periodclose"
import { FileSpreadsheet, FileText, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PeriodCloseTableProps {
  periods: IGLPeriodClose[]
  onCloseModule?: (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    includeVat?: boolean
  ) => void
  onReopenModule?: (periodId: string, module: "AR" | "AP" | "CB" | "GL") => void
  onExportExcel?: () => void
  onExportPDF?: () => void
  showActions?: boolean
}

export function PeriodCloseTable({
  periods,
  onCloseModule,
  onReopenModule,
  onExportExcel,
  onExportPDF,
  showActions = true,
}: PeriodCloseTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  )

  // Filter periods based on search and year
  const filteredPeriods = useMemo(() => {
    return periods.filter((period) => {
      const matchesSearch =
        period.year.toString().includes(searchTerm) ||
        period.month.toString().includes(searchTerm) ||
        period.startDate.includes(searchTerm) ||
        period.closeDate.includes(searchTerm)

      const matchesYear = period.year.toString() === selectedYear

      return matchesSearch && matchesYear
    })
  }, [periods, searchTerm, selectedYear])

  // Get unique years from periods
  const years = useMemo(() => {
    const uniqueYears = [...new Set(periods.map((p) => p.year))]
    return uniqueYears.sort((a, b) => b - a) // Sort descending
  }, [periods])

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Get month name
  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[month - 1] || month.toString()
  }

  // Handle module close
  const handleModuleClose = (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL",
    includeVat: boolean = false
  ) => {
    onCloseModule?.(periodId, module, includeVat)
  }

  // Handle module reopen
  const handleModuleReopen = (
    periodId: string,
    module: "AR" | "AP" | "CB" | "GL"
  ) => {
    onReopenModule?.(periodId, module)
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Period Close Management</span>
            <div className="flex items-center space-x-2">
              {onExportExcel && (
                <Button variant="outline" size="sm" onClick={onExportExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              )}
              {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export to PDF
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Year:</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouping Area */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-muted/50 border-muted-foreground/25 rounded-lg border-2 border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">
              Drag a column header and drop it here to group by that column
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Period Close Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">
                    <div className="flex items-center space-x-1">
                      <span>Year</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-16">
                    <div className="flex items-center space-x-1">
                      <span>Month</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-32">
                    <div className="flex items-center space-x-1">
                      <span>Start Date</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-32">
                    <div className="flex items-center space-x-1">
                      <span>Close Date</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>

                  {/* AR Section */}
                  <TableHead className="w-16 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>AR</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>AR Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close All AR</DropdownMenuItem>
                          <DropdownMenuItem>Reopen All AR</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-20 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>AR VAT</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>AR VAT Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close All AR VAT</DropdownMenuItem>
                          <DropdownMenuItem>Reopen All AR VAT</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-24">
                    <div className="flex items-center space-x-1">
                      <span>Close By</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-32">
                    <div className="flex items-center space-x-1">
                      <span>AR Date</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>

                  {/* AP Section */}
                  <TableHead className="w-16 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>AP</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>AP Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close All AP</DropdownMenuItem>
                          <DropdownMenuItem>Reopen All AP</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-20 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>AP VAT</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>AP VAT Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close All AP VAT</DropdownMenuItem>
                          <DropdownMenuItem>Reopen All AP VAT</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-24">
                    <div className="flex items-center space-x-1">
                      <span>Close By</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-32">
                    <div className="flex items-center space-x-1">
                      <span>AP Date</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>

                  {/* CB Section */}
                  <TableHead className="w-16 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>CB</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>CB Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close All CB</DropdownMenuItem>
                          <DropdownMenuItem>Reopen All CB</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-24">
                    <div className="flex items-center space-x-1">
                      <span>Close By</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                  <TableHead className="w-32">
                    <div className="flex items-center space-x-1">
                      <span>CB Date</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Sort Ascending</DropdownMenuItem>
                          <DropdownMenuItem>Sort Descending</DropdownMenuItem>
                          <DropdownMenuItem>Filter</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>

                  {/* GL Section */}
                  <TableHead className="w-16 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <span>GL</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>GL Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Close All GL</DropdownMenuItem>
                          <DropdownMenuItem>Reopen All GL</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeriods.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.year}</TableCell>
                    <TableCell>{getMonthName(period.month)}</TableCell>
                    <TableCell>{formatDate(period.startDate)}</TableCell>
                    <TableCell>{formatDate(period.closeDate)}</TableCell>

                    {/* AR Section */}
                    <TableCell className="text-center">
                      <Checkbox
                        checked={period.arClosed}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleModuleClose(period.id, "AR")
                          } else {
                            handleModuleReopen(period.id, "AR")
                          }
                        }}
                        disabled={!showActions}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={period.arVatClosed}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleModuleClose(period.id, "AR", true)
                          } else {
                            handleModuleReopen(period.id, "AR")
                          }
                        }}
                        disabled={!showActions}
                      />
                    </TableCell>
                    <TableCell>{period.arCloseBy || "-"}</TableCell>
                    <TableCell>
                      {period.arCloseDate
                        ? formatDate(period.arCloseDate)
                        : "-"}
                    </TableCell>

                    {/* AP Section */}
                    <TableCell className="text-center">
                      <Checkbox
                        checked={period.apClosed}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleModuleClose(period.id, "AP")
                          } else {
                            handleModuleReopen(period.id, "AP")
                          }
                        }}
                        disabled={!showActions}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={period.apVatClosed}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleModuleClose(period.id, "AP", true)
                          } else {
                            handleModuleReopen(period.id, "AP")
                          }
                        }}
                        disabled={!showActions}
                      />
                    </TableCell>
                    <TableCell>{period.apCloseBy || "-"}</TableCell>
                    <TableCell>
                      {period.apCloseDate
                        ? formatDate(period.apCloseDate)
                        : "-"}
                    </TableCell>

                    {/* CB Section */}
                    <TableCell className="text-center">
                      <Checkbox
                        checked={period.cbClosed}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleModuleClose(period.id, "CB")
                          } else {
                            handleModuleReopen(period.id, "CB")
                          }
                        }}
                        disabled={!showActions}
                      />
                    </TableCell>
                    <TableCell>{period.cbCloseBy || "-"}</TableCell>
                    <TableCell>
                      {period.cbCloseDate
                        ? formatDate(period.cbCloseDate)
                        : "-"}
                    </TableCell>

                    {/* GL Section */}
                    <TableCell className="text-center">
                      <Checkbox
                        checked={period.glClosed}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleModuleClose(period.id, "GL")
                          } else {
                            handleModuleReopen(period.id, "GL")
                          }
                        }}
                        disabled={!showActions}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
