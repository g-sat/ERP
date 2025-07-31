"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import { Download, FileText, Globe, RefreshCw, Upload } from "lucide-react"
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

interface WPSSIFGenerationProps {
  employees: IPayrollEmployee[]
}

export function WPSSIFGeneration({ employees }: WPSSIFGenerationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([])
  const [submittedFiles, setSubmittedFiles] = useState<string[]>([])

  const periods = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
  ]

  const handleGenerateSIF = () => {
    setIsGenerating(true)

    // Simulate SIF generation
    setTimeout(() => {
      setGeneratedFiles([selectedPeriod])
      setIsGenerating(false)
      toast.success("WPS SIF file generated successfully!")
    }, 2500)
  }

  const handleDownloadSIF = (period: string) => {
    toast.success(`WPS SIF file for ${period} downloaded successfully!`)
  }

  const handleSubmitSIF = (period: string) => {
    setSubmittedFiles([...submittedFiles, period])
    toast.success(`WPS SIF file for ${period} submitted to authorities!`)
  }

  const handleValidateSIF = (period: string) => {
    toast.success(`WPS SIF file for ${period} validated successfully!`)
  }

  const formatCurrency = (amount: number) => {
    return <CurrencyFormatter amount={amount} size="md" />
  }

  const getStatusBadge = (period: string) => {
    if (submittedFiles.includes(period)) {
      return <Badge variant="default">Submitted</Badge>
    } else if (generatedFiles.includes(period)) {
      return <Badge variant="secondary">Generated</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            WPS SIF Generation Controls
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
            <div className="flex items-end">
              <Button
                onClick={handleGenerateSIF}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate WPS SIF
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Import Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>WPS SIF Summary</CardTitle>
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
                {generatedFiles.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Generated Files
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {submittedFiles.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Submitted Files
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(
                  employees.reduce((sum, emp) => sum + emp.netSalary, 0)
                )}
              </div>
              <div className="text-muted-foreground text-sm">Total Salary</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WPS SIF Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>WPS SIF Files Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Employee Count</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[250px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => {
                  const isGenerated = generatedFiles.includes(period.value)
                  const isSubmitted = submittedFiles.includes(period.value)

                  return (
                    <TableRow key={period.value}>
                      <TableCell className="font-medium">
                        {period.label}
                      </TableCell>
                      <TableCell>
                        {isGenerated
                          ? `WPS_SIF_${period.value}.xml`
                          : "Not generated"}
                      </TableCell>
                      <TableCell>
                        {isGenerated ? employees.length : 0}
                      </TableCell>
                      <TableCell>
                        {isGenerated
                          ? formatCurrency(
                              employees.reduce(
                                (sum, emp) => sum + emp.netSalary,
                                0
                              )
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isGenerated ? new Date().toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(period.value)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isGenerated && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadSIF(period.value)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleValidateSIF(period.value)}
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                              {!isSubmitted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSubmitSIF(period.value)}
                                >
                                  <Upload className="h-3 w-3" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* WPS Compliance Info */}
      <Card>
        <CardHeader>
          <CardTitle>WPS Compliance Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">WPS Requirements</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• File must be submitted by 15th of each month</li>
                  <li>• XML format required</li>
                  <li>• All employee data must be included</li>
                  <li>• Salary information must be accurate</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">File Specifications</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Encoding: UTF-8</li>
                  <li>• Format: XML</li>
                  <li>• Schema: WPS 2.0</li>
                  <li>• Max file size: 10MB</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
