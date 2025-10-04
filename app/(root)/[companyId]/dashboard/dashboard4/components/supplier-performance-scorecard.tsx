"use client"

import { useState } from "react"
import {
  AlertTriangleIcon,
  StarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TruckIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { _Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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

interface SupplierPerformanceScorecardProps {
  period: string
  comparisonPeriod: string
  businessUnits: string[]
  productLines: string[]
  geography: string[]
}

interface SupplierData {
  id: string
  name: string
  spend: number
  spendPercentage: number
  onTimeDelivery: number
  qualityAcceptance: number
  invoiceAccuracy: number
  overallScore: number
  riskRating: "Low" | "Medium" | "High"
  category: string
  location: string
  contractStatus: "Active" | "Expiring" | "Renewed"
  trend: number
}

export function SupplierPerformanceScorecard({
  period: _period,
  comparisonPeriod: _comparisonPeriod,
  businessUnits: _businessUnits,
  productLines: _productLines,
  geography: _geography,
}: SupplierPerformanceScorecardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof SupplierData>("overallScore")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterRisk, setFilterRisk] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Mock data - in real implementation, this would come from API
  const supplierData: SupplierData[] = [
    {
      id: "1",
      name: "Premium Materials Ltd",
      spend: 1250000,
      spendPercentage: 15.2,
      onTimeDelivery: 98.5,
      qualityAcceptance: 99.2,
      invoiceAccuracy: 96.8,
      overallScore: 4.8,
      riskRating: "Low",
      category: "Raw Materials",
      location: "North America",
      contractStatus: "Active",
      trend: 5.2,
    },
    {
      id: "2",
      name: "Global Logistics Inc",
      spend: 980000,
      spendPercentage: 11.9,
      onTimeDelivery: 95.8,
      qualityAcceptance: 97.5,
      invoiceAccuracy: 99.1,
      overallScore: 4.6,
      riskRating: "Low",
      category: "Logistics",
      location: "Global",
      contractStatus: "Active",
      trend: 2.1,
    },
    {
      id: "3",
      name: "Tech Solutions Corp",
      spend: 750000,
      spendPercentage: 9.1,
      onTimeDelivery: 92.3,
      qualityAcceptance: 94.7,
      invoiceAccuracy: 88.4,
      overallScore: 4.1,
      riskRating: "Medium",
      category: "Technology",
      location: "Asia Pacific",
      contractStatus: "Expiring",
      trend: -1.5,
    },
    {
      id: "4",
      name: "Manufacturing Partners",
      spend: 2100000,
      spendPercentage: 25.5,
      onTimeDelivery: 89.7,
      qualityAcceptance: 91.2,
      invoiceAccuracy: 93.6,
      overallScore: 3.8,
      riskRating: "Medium",
      category: "Manufacturing",
      location: "Europe",
      contractStatus: "Active",
      trend: 0.8,
    },
    {
      id: "5",
      name: "Energy Systems LLC",
      spend: 650000,
      spendPercentage: 7.9,
      onTimeDelivery: 85.4,
      qualityAcceptance: 87.9,
      invoiceAccuracy: 82.1,
      overallScore: 3.2,
      riskRating: "High",
      category: "Energy",
      location: "North America",
      contractStatus: "Expiring",
      trend: -8.3,
    },
    {
      id: "6",
      name: "Professional Services Group",
      spend: 420000,
      spendPercentage: 5.1,
      onTimeDelivery: 97.1,
      qualityAcceptance: 98.8,
      invoiceAccuracy: 95.3,
      overallScore: 4.5,
      riskRating: "Low",
      category: "Services",
      location: "Global",
      contractStatus: "Renewed",
      trend: 3.7,
    },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600"
    if (score >= 3.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Expiring":
        return "bg-red-100 text-red-800"
      case "Renewed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (score: number) => {
    const stars = []
    const fullStars = Math.floor(score)
    const hasHalfStar = score % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon
          key="half"
          className="h-4 w-4 fill-yellow-400/50 text-yellow-400"
        />
      )
    }

    const emptyStars = 5 - Math.ceil(score)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      )
    }

    return <div className="flex gap-0.5">{stars}</div>
  }

  const filteredAndSortedData = supplierData
    .filter((supplier) => {
      const matchesSearch = supplier.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesRisk =
        filterRisk === "all" || supplier.riskRating === filterRisk
      const matchesCategory =
        filterCategory === "all" || supplier.category === filterCategory
      return matchesSearch && matchesRisk && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })

  const totalSpend = supplierData.reduce((sum, s) => sum + s.spend, 0)
  const averageScore =
    supplierData.reduce((sum, s) => sum + s.overallScore, 0) /
    supplierData.length

  const handleSort = (field: keyof SupplierData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5" />
          Supplier Performance Scorecard
          <Badge variant="outline" className="text-xs">
            Strategic Sourcing Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              ${(totalSpend / 1000000).toFixed(1)}M
            </div>
            <div className="text-muted-foreground text-xs">Total Spend</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{supplierData.length}</div>
            <div className="text-muted-foreground text-xs">
              Active Suppliers
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <div className="text-muted-foreground text-xs">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">94.2%</div>
            <div className="text-muted-foreground text-xs">
              On-Time Delivery
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Input
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Supplier Name
                </TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer text-right"
                  onClick={() => handleSort("spend")}
                >
                  Spend (YTD)
                </TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer text-right"
                  onClick={() => handleSort("onTimeDelivery")}
                >
                  On-Time %
                </TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer text-right"
                  onClick={() => handleSort("qualityAcceptance")}
                >
                  Quality %
                </TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer text-right"
                  onClick={() => handleSort("invoiceAccuracy")}
                >
                  Invoice Acc. %
                </TableHead>
                <TableHead
                  className="hover:bg-muted/50 cursor-pointer text-center"
                  onClick={() => handleSort("overallScore")}
                >
                  Overall Score
                </TableHead>
                <TableHead className="text-center">Risk</TableHead>
                <TableHead className="text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{supplier.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {supplier.category} • {supplier.location}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getContractStatusColor(supplier.contractStatus)}`}
                      >
                        {supplier.contractStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">
                        ${supplier.spend.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {supplier.spendPercentage.toFixed(1)}% of total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {supplier.onTimeDelivery.toFixed(1)}%
                      </div>
                      <Progress
                        value={supplier.onTimeDelivery}
                        className="ml-auto h-1 w-16"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {supplier.qualityAcceptance.toFixed(1)}%
                      </div>
                      <Progress
                        value={supplier.qualityAcceptance}
                        className="ml-auto h-1 w-16"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {supplier.invoiceAccuracy.toFixed(1)}%
                      </div>
                      <Progress
                        value={supplier.invoiceAccuracy}
                        className="ml-auto h-1 w-16"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`font-medium ${getScoreColor(supplier.overallScore)}`}
                      >
                        {supplier.overallScore.toFixed(1)}
                      </div>
                      {renderStars(supplier.overallScore)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRiskColor(supplier.riskRating)}`}
                    >
                      {supplier.riskRating}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {supplier.trend > 0 ? (
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          supplier.trend > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(supplier.trend).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Top Performers
                </span>
              </div>
              <div className="mt-1 text-xs text-green-600">
                Premium Materials Ltd and Global Logistics Inc maintain
                excellent scores
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Attention Needed
                </span>
              </div>
              <div className="mt-1 text-xs text-yellow-600">
                Energy Systems LLC shows declining performance trends
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Contract Alerts
                </span>
              </div>
              <div className="mt-1 text-xs text-red-600">
                2 contracts expiring within 90 days
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
