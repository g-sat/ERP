"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import {
  downloadPayslipPDF,
  generatePayslipPDF,
  handleSendPayslip,
} from "@/lib/payslip-utils"
import { Button } from "@/components/ui/button"
import { PayslipPreview } from "@/app/(root)/[companyId]/hr/payruns/[payrunId]/components/payslip-preview"

// Mock employee data for testing
const mockEmployee = {
  payrollEmployeeId: 1,
  companyId: 1,
  companyName: "Test Company Ltd",
  departmentId: 1,
  departmentName: "IT Department",
  employeeId: 1,
  employeeCode: "EMP001",
  employeeName: "John Doe",
  presentDays: 22,
  pastDays: 0,
  basicSalary: 50000,
  totalEarnings: 65000,
  totalDeductions: 5000,
  netSalary: 60000,
  remarks: "",
  isDraft: false,
  isSubmitted: true,
  isPaid: true,
  isRejected: false,
  isPreviousPaid: false,
  status: "APPROVED",
  data_details: [
    {
      payrollEmployeeId: 1,
      componentId: 1,
      componentCode: "BASIC",
      componentName: "Basic Salary",
      componentType: "EARNING",
      amount: 50000,
      basicAmount: 50000,
      remarks: "",
    },
    {
      payrollEmployeeId: 1,
      componentId: 2,
      componentCode: "HRA",
      componentName: "House Rent Allowance",
      componentType: "EARNING",
      amount: 10000,
      basicAmount: 10000,
      remarks: "",
    },
    {
      payrollEmployeeId: 1,
      componentId: 3,
      componentCode: "DA",
      componentName: "Dearness Allowance",
      componentType: "EARNING",
      amount: 5000,
      basicAmount: 5000,
      remarks: "",
    },
    {
      payrollEmployeeId: 1,
      componentId: 4,
      componentCode: "PF",
      componentName: "Provident Fund",
      componentType: "DEDUCTION",
      amount: 3000,
      basicAmount: 3000,
      remarks: "",
    },
    {
      payrollEmployeeId: 1,
      componentId: 5,
      componentCode: "TAX",
      componentName: "Income Tax",
      componentType: "DEDUCTION",
      amount: 2000,
      basicAmount: 2000,
      remarks: "",
    },
  ],
}

export default function TestPayslipPage() {
  const params = useParams()
  const payrunId = params.payrunId as string
  const companyId = params.companyId as string

  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const payPeriod = "August 2025"
  const payDate = "03 SEP, 2025"
  const companyName = mockEmployee.companyName

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      const result = await handleSendPayslip(
        mockEmployee,
        payrunId,
        payPeriod,
        payDate,
        companyName,
        "+91 9421185860"
      )

      if (result.success) {
        toast.success("Payslip sent successfully!", {
          description: result.message,
        })
      } else {
        toast.error("Failed to send payslip", {
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to generate PDF", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const pdfBlob = await generatePayslipPDF(
        mockEmployee,
        payrunId,
        payPeriod,
        payDate,
        companyName
      )

      downloadPayslipPDF(pdfBlob, mockEmployee.employeeName)

      toast.success("PDF downloaded successfully!", {
        description: "The payslip PDF has been downloaded to your device.",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error("Failed to download PDF", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="@container flex-1 space-y-3 p-3 pt-4 md:p-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 rounded-lg bg-white/80 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payslip Test Page
            </h1>
            <p className="text-sm text-gray-600">
              Test the payslip generation and WhatsApp sending functionality
            </p>
          </div>
        </div>
      </div>

      {/* Test Information */}
      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold text-yellow-800">Test Information</h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>• This page uses mock data to test the payslip functionality</li>
          <li>• WhatsApp will open with number: +91 9421185860</li>
          <li>• PDF files will be downloaded to your device</li>
          <li>• You&apos;ll need to manually attach files to WhatsApp</li>
        </ul>
      </div>

      {/* Payslip Preview */}
      <PayslipPreview
        employee={mockEmployee}
        payrunId={payrunId}
        payPeriod={payPeriod}
        payDate={payDate}
        companyName={companyName}
        onGeneratePDF={handleGeneratePDF}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Status Information */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-800">How it works:</h3>
        <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
          <li>
            Click &quot;Send to WhatsApp&quot; to generate PDF and open WhatsApp
          </li>
          <li>
            Click &quot;Download PDF&quot; to save the file to your device
          </li>
          <li>Manually attach the PDF file to the WhatsApp conversation</li>
          <li>The system will automatically download backup copies</li>
        </ol>
      </div>
    </div>
  )
}
