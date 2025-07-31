"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import {
  BarChart3,
  Download,
  FileText,
  PieChart,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface ComplianceReportingProps {
  employees: IPayrollEmployee[]
}

export function ComplianceReporting({ employees }: ComplianceReportingProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [selectedReportType, setSelectedReportType] = useState("wps")
  const [generatedReports, setGeneratedReports] = useState<string[]>([])

  const periods = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
  ]

  const reportTypes = [
    { value: "wps", label: "WPS Report", icon: FileText },
    { value: "tax", label: "Tax Report", icon: BarChart3 },
    { value: "social_insurance", label: "Social Insurance", icon: PieChart },
    { value: "labor_card", label: "Labor Card", icon: TrendingUp },
  ]

  const handleGenerateReport = () => {
    const reportKey = `${selectedReportType}_${selectedPeriod}`
    setGeneratedReports([...generatedReports, reportKey])
    toast.success(
      `${reportTypes.find((r) => r.value === selectedReportType)?.label} generated successfully!`
    )
  }

  const handleDownloadReport = (reportKey: string) => {
    toast.success(`Report downloaded successfully!`)
  }

  const handleViewReport = (reportKey: string) => {
    toast.success(`Viewing report details`)
  }

  const getStatusBadge = (reportKey: string) => {
    if (generatedReports.includes(reportKey)) {
      return <Badge variant="default">Generated</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  const getReportTypeIcon = (type: string) => {
    const reportData = reportTypes.find((r) => r.value === type)
    return reportData ? <reportData.icon className="h-4 w-4" /> : null
  }

  // Calculate compliance metrics
  const totalSalary = employees.reduce((sum, emp) => sum + emp.netSalary, 0)
  const totalSocialInsurance = employees.reduce(
    (sum, emp) => sum + emp.socialInsurance,
    0
  )
  const averageSalary = totalSalary / employees.length
  const complianceRate = 95.5 // Dummy compliance rate

  return (
    <div className="space-y-6">
      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compliance Report Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Payroll Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select
                value={selectedReportType}
                onValueChange={setSelectedReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.value} value={report.value}>
                      <div className="flex items-center gap-2">
                        <report.icon className="h-4 w-4" />
                        {report.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {employees.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Total Employees
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <CurrencyFormatter amount={totalSalary} size="lg" />
              </div>
              <div className="text-muted-foreground text-sm">Total Salary</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                <CurrencyFormatter amount={totalSocialInsurance} size="lg" />
              </div>
              <div className="text-muted-foreground text-sm">
                Social Insurance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {complianceRate}%
              </div>
              <div className="text-muted-foreground text-sm">
                Compliance Rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Employee Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportTypes.map((reportType) =>
                  periods.map((period) => {
                    const reportKey = `${reportType.value}_${period.value}`
                    const isGenerated = generatedReports.includes(reportKey)

                    return (
                      <TableRow key={reportKey}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getReportTypeIcon(reportType.value)}
                            <span>{reportType.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {period.label}
                        </TableCell>
                        <TableCell>
                          {isGenerated ? employees.length : 0}
                        </TableCell>
                        <TableCell>
                          {isGenerated ? (
                            <CurrencyFormatter amount={totalSalary} size="sm" />
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {isGenerated
                            ? new Date().toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(reportKey)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {isGenerated && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleDownloadReport(reportKey)
                                  }
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewReport(reportKey)}
                                >
                                  <FileText className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">WPS Compliance</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Monthly submission: 100%</li>
                  <li>• Data accuracy: 98.5%</li>
                  <li>• Processing time: 2-3 days</li>
                  <li>• Approval rate: 95%</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Tax Compliance</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Tax calculations: 100% accurate</li>
                  <li>• Filing deadlines: 100% met</li>
                  <li>• Audit readiness: 100%</li>
                  <li>• Documentation: Complete</li>
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Social Insurance</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Coverage: 100% of employees</li>
                  <li>• Contribution rate: 5%</li>
                  <li>• Monthly payments: On time</li>
                  <li>• Compliance score: 98%</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Labor Card</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Valid cards: 100%</li>
                  <li>• Renewal tracking: Active</li>
                  <li>• Expiry notifications: Enabled</li>
                  <li>• Compliance status: Green</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="h-2 w-2 rounded-full bg-green-600"></div>
              <span className="text-sm text-green-800">
                All WPS submissions are up to date
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              <span className="text-sm text-blue-800">
                Tax calculations completed for current period
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
              <span className="text-sm text-yellow-800">
                3 employee labor cards expiring in next 30 days
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
