"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import {
  CheckCircle,
  Clock,
  Download,
  Eye,
  Send,
  Upload,
  XCircle,
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

interface SIFSubmissionProps {
  employees: IPayrollEmployee[]
}

export function SIFSubmission({ employees }: SIFSubmissionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedFiles, setSubmittedFiles] = useState<string[]>([])
  const [approvedFiles, setApprovedFiles] = useState<string[]>([])
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])

  const periods = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
  ]

  const handleSubmitSIF = () => {
    setIsSubmitting(true)

    // Simulate submission process
    setTimeout(() => {
      setSubmittedFiles([...submittedFiles, selectedPeriod])
      setIsSubmitting(false)
      toast.success("SIF file submitted to authorities successfully!")
    }, 3000)
  }

  const handleDownloadSIF = (period: string) => {
    toast.success(`SIF file for ${period} downloaded successfully!`)
  }

  const handleViewSubmission = (period: string) => {
    toast.success(`Viewing submission details for ${period}`)
  }

  const handleResubmitSIF = (period: string) => {
    setRejectedFiles(rejectedFiles.filter((f) => f !== period))
    setSubmittedFiles([...submittedFiles, period])
    toast.success(`SIF file for ${period} resubmitted successfully!`)
  }

  const formatCurrency = (amount: number) => {
    return <CurrencyFormatter amount={amount} size="md" />
  }

  const getStatusBadge = (period: string) => {
    if (approvedFiles.includes(period)) {
      return (
        <Badge variant="default" className="bg-green-600">
          Approved
        </Badge>
      )
    } else if (rejectedFiles.includes(period)) {
      return <Badge variant="destructive">Rejected</Badge>
    } else if (submittedFiles.includes(period)) {
      return <Badge variant="secondary">Submitted</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  const getStatusIcon = (period: string) => {
    if (approvedFiles.includes(period)) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (rejectedFiles.includes(period)) {
      return <XCircle className="h-4 w-4 text-red-600" />
    } else if (submittedFiles.includes(period)) {
      return <Clock className="h-4 w-4 text-orange-600" />
    }
    return <Clock className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Submission Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            SIF Submission Controls
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
                onClick={handleSubmitSIF}
                disabled={
                  isSubmitting || submittedFiles.includes(selectedPeriod)
                }
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Send className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit to Authorities
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload SIF File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {submittedFiles.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Submitted Files
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {approvedFiles.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Approved Files
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {rejectedFiles.length}
              </div>
              <div className="text-muted-foreground text-sm">
                Rejected Files
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

      {/* Submission History */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Employee Count</TableHead>
                  <TableHead>Total Salary</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Response Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => {
                  const isSubmitted = submittedFiles.includes(period.value)
                  const isApproved = approvedFiles.includes(period.value)
                  const isRejected = rejectedFiles.includes(period.value)

                  return (
                    <TableRow key={period.value}>
                      <TableCell>{getStatusIcon(period.value)}</TableCell>
                      <TableCell className="font-medium">
                        {period.label}
                      </TableCell>
                      <TableCell>
                        {isSubmitted
                          ? `SIF_${period.value}.xml`
                          : "Not submitted"}
                      </TableCell>
                      <TableCell>
                        {isSubmitted ? employees.length : 0}
                      </TableCell>
                      <TableCell>
                        {isSubmitted
                          ? formatCurrency(
                              employees.reduce(
                                (sum, emp) => sum + emp.netSalary,
                                0
                              )
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isSubmitted ? new Date().toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {isApproved || isRejected
                          ? new Date().toLocaleDateString()
                          : "Pending"}
                      </TableCell>
                      <TableCell>{getStatusBadge(period.value)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isSubmitted && (
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
                                onClick={() =>
                                  handleViewSubmission(period.value)
                                }
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {isRejected && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResubmitSIF(period.value)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
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

      {/* Authority Information */}
      <Card>
        <CardHeader>
          <CardTitle>Authority Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Submission Requirements</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Files must be submitted by 15th of each month</li>
                  <li>• XML format with proper schema validation</li>
                  <li>• All employee data must be complete</li>
                  <li>• Salary calculations must be accurate</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Processing Timeline</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Initial review: 2-3 business days</li>
                  <li>• Approval process: 5-7 business days</li>
                  <li>• Rejection notifications: Within 24 hours</li>
                  <li>• Resubmission allowed: Within 7 days</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
