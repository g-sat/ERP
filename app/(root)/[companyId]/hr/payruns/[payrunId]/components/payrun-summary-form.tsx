"use client"

import { useState } from "react"
import { IPayrollEmployeeDt, IPayrollEmployeeHd } from "@/interfaces/payrun"
import { toast } from "sonner"

import {
  downloadPayslipPDF,
  generatePayslipPDF,
  handleSendPayslip,
} from "@/lib/payslip-utils"
import { useGetById } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayRunSummaryFormProps {
  employee: IPayrollEmployeeHd | null
  payrunId: string
  onClose: () => void
}

export function PayRunSummaryForm({
  employee,
  payrunId,
}: PayRunSummaryFormProps) {
  const [formData] = useState<Partial<IPayrollEmployeeHd>>(employee || {})
  const [showDownloadConfirmation, setShowDownloadConfirmation] =
    useState(false)
  const [showSendConfirmation, setShowSendConfirmation] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  console.log("employee", employee)

  // API call to get detailed employee data - only when form is open and employee is selected
  const { data: employeeDetails, isLoading } = useGetById<IPayrollEmployeeDt[]>(
    `/hr/payrollruns/payrundetailslist/${payrunId}`,
    "employee-details",
    employee?.payrollEmployeeId?.toString() || ""
  )

  const employeeData =
    (employeeDetails?.data as unknown as IPayrollEmployeeDt[]) || []

  // Calculate Net Pay based on current data
  const calculateNetPay = () => {
    const totalEarnings = employeeData
      .filter((item) => item.componentType.toLowerCase() === "earning")
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    const totalDeductions = employeeData
      .filter((item) => item.componentType.toLowerCase() === "deduction")
      .reduce((sum, item) => sum + (item.amount || 0), 0)

    return totalEarnings - totalDeductions
  }

  const currentNetPay = calculateNetPay()

  // Calculate Basic Net Pay
  const calculateBasicNetPay = () => {
    const totalBasicEarnings = employeeData
      .filter((item) => item.componentType.toLowerCase() === "earning")
      .reduce((sum, item) => sum + (item.basicAmount || 0), 0)

    const totalBasicDeductions = employeeData
      .filter((item) => item.componentType.toLowerCase() === "deduction")
      .reduce((sum, item) => sum + (item.basicAmount || 0), 0)

    return totalBasicEarnings - totalBasicDeductions
  }

  const currentBasicNetPay = calculateBasicNetPay()

  // Handle download payslip
  const handleDownloadPayslip = async () => {
    if (!employee) return

    setIsDownloading(true)
    try {
      const payPeriod = "August 2025" // You might want to get this from props or context
      const payDate = "03 SEP, 2025"
      const companyName = employee.companyName || "Company Name"

      const pdfBlob = await generatePayslipPDF(
        employee,
        payrunId,
        payPeriod,
        payDate,
        companyName
      )

      downloadPayslipPDF(pdfBlob, employee.employeeName)

      toast.success("Payslip downloaded successfully!", {
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

  // Handle send payslip
  const handleSendPayslipAction = async () => {
    if (!employee) return

    setIsSending(true)
    try {
      const payPeriod = "August 2025" // You might want to get this from props or context
      const payDate = "03 SEP, 2025"
      const companyName = employee.companyName || "Company Name"

      const result = await handleSendPayslip(
        employee,
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
      console.error("Error sending payslip:", error)
      toast.error("Failed to send payslip", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading employee details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Payment Status Banner */}
      {employee?.isPaid && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="font-medium text-green-800">
              Paid on {""}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              through Bank Transfer
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6 pt-4">
        {/* Payable Days and Past Days Section */}
        <div>
          <div className="grid grid-cols-2 gap-4 border-b pb-2">
            {/* Payable Days */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payable Days</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">
                  {formData.presentDays !== undefined
                    ? formData.presentDays
                    : employee?.presentDays || 0}
                </span>
              </div>
            </div>

            {/* Past Days */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Arrears Days</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold">
                  {employee?.pastDays || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div>
          <div className="mb-2 grid grid-cols-3 gap-2 border-b pb-2">
            <h3 className="text-sm font-semibold text-green-600">
              (+) EARNINGS
            </h3>
            <span className="text-right text-sm font-medium">Basic</span>
            <span className="text-right text-sm font-medium">Current</span>
          </div>

          <div className="space-y-1">
            {employeeData
              .filter((item) => item.componentType.toLowerCase() === "earning")
              .map((item) => (
                <div key={item.componentId}>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">
                      {item.componentName}
                    </span>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium">
                        <CurrencyFormatter amount={item.basicAmount || 0} />
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium">
                        <CurrencyFormatter amount={item.amount || 0} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            {employeeData.filter(
              (item) => item.componentType.toLowerCase() === "earning"
            ).length === 0 && (
              <div className="text-sm text-gray-500 italic">
                No earnings found
              </div>
            )}
          </div>
        </div>

        {/* Deductions Section */}
        <div>
          <div className="mb-2 grid grid-cols-3 gap-2 border-b pb-2">
            <h3 className="text-sm font-semibold text-red-600">
              (-) DEDUCTIONS
            </h3>
          </div>

          <div className="space-y-1">
            {employeeData
              .filter(
                (item) => item.componentType.toLowerCase() === "deduction"
              )
              .map((item) => (
                <div key={item.componentId}>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="text-sm font-medium">
                      {item.componentName}
                    </span>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium">
                        <CurrencyFormatter amount={item.basicAmount || 0} />
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-medium">
                        <CurrencyFormatter amount={item.amount || 0} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            {employeeData.filter(
              (item) => item.componentType.toLowerCase() === "deduction"
            ).length === 0 && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">Loan Amount</span>
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm font-medium">
                    <CurrencyFormatter amount={0} />
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm font-medium">
                    <CurrencyFormatter amount={0} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Net Pay Summary */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-3 items-center gap-2">
            <span className="text-sm font-medium">NET PAY</span>
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm font-bold">
                <CurrencyFormatter amount={currentBasicNetPay} />
              </span>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm font-bold">
                <CurrencyFormatter amount={currentNetPay} />
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Only show when paid */}
        {employee?.isPaid && (
          <div className="flex justify-end space-x-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setShowDownloadConfirmation(true)}
              disabled={isDownloading}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {isDownloading ? "Downloading..." : "Download Payslip"}
            </Button>
            <Button
              onClick={() => setShowSendConfirmation(true)}
              disabled={isSending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSending ? "Sending..." : "Send Payslip"}
            </Button>
          </div>
        )}
      </div>

      {/* Download Payslip Confirmation Dialog */}
      <Dialog
        open={showDownloadConfirmation}
        onOpenChange={setShowDownloadConfirmation}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Download Payslip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-800">
                What will happen:
              </h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>
                  • PDF payslip will be generated for {employee?.employeeName}
                </li>
                <li>• File will be downloaded to your device</li>
                <li>
                  • Filename: Payslip_
                  {employee?.employeeName?.replace(/\s+/g, "_")}_today.pdf
                </li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Are you sure you want to download the payslip for{" "}
              {employee?.employeeName}?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDownloadConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowDownloadConfirmation(false)
                  handleDownloadPayslip()
                }}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isDownloading ? "Downloading..." : "Yes, Download"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Payslip Confirmation Dialog */}
      <Dialog
        open={showSendConfirmation}
        onOpenChange={setShowSendConfirmation}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Send Payslip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="mb-2 font-semibold text-green-800">
                What will happen:
              </h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>
                  • PDF payslip will be generated for {employee?.employeeName}
                </li>
                <li>• WhatsApp will open with number +91 9421185860</li>
                <li>• You&apos;ll need to manually attach the PDF file</li>
                <li>• File will also be downloaded to your device as backup</li>
              </ul>
            </div>
            <p className="text-muted-foreground">
              Are you sure you want to send the payslip to{" "}
              {employee?.employeeName}?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSendConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSendConfirmation(false)
                  handleSendPayslipAction()
                }}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSending ? "Sending..." : "Yes, Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
