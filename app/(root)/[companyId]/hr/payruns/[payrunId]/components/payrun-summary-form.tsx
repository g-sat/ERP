"use client"

import { useState } from "react"
import { IPayrollEmployeeDt, IPayrollEmployeeHd } from "@/interfaces/payrun"
import { Download, Mail, MessageSquare } from "lucide-react"
import { toast } from "sonner"

import { payslipPDFGenerator } from "@/lib/payslip-pdf-generator"
import { useGetById } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayRunSummaryFormProps {
  employee: IPayrollEmployeeHd | null
  payrunId: string
}

export function PayRunSummaryForm({
  employee,
  payrunId,
}: PayRunSummaryFormProps) {
  const [formData] = useState<Partial<IPayrollEmployeeHd>>(employee || {})
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)

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

  // Generate PDF payslip
  const generatePayslipPDF = () => {
    const earnings = employeeData
      .filter((item) => item.componentType.toLowerCase() === "earning")
      .map((item) => ({
        componentName: item.componentName,
        basicAmount: item.basicAmount || 0,
        currentAmount: item.amount || 0,
      }))

    const deductions = employeeData
      .filter((item) => item.componentType.toLowerCase() === "deduction")
      .map((item) => ({
        componentName: item.componentName,
        basicAmount: item.basicAmount || 0,
        currentAmount: item.amount || 0,
      }))

    const payslipData = {
      employeeName: employee?.employeeName || "Unknown",
      employeeId: employee?.payrollEmployeeId?.toString() || "N/A",
      payPeriod: "Current Month",
      presentDays:
        formData.presentDays !== undefined
          ? formData.presentDays
          : employee?.presentDays || 0,
      pastDays: employee?.pastDays || 0,
      earnings,
      deductions,
      netPay: currentNetPay,
      basicNetPay: currentBasicNetPay,
    }

    return payslipPDFGenerator.generatePayslip(payslipData)
  }

  // WhatsApp API function - Send PDF payslip
  const sendWhatsAppPayslip = async (phoneNumber: string) => {
    try {
      setIsSendingWhatsApp(true)

      // Generate PDF
      const pdfBlob = generatePayslipPDF()

      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          resolve(base64String.split(",")[1]) // Remove data:application/pdf;base64, prefix
        }
        reader.readAsDataURL(pdfBlob)
      })

      const sanitizedName =
        employee?.employeeName?.replace(/\s+/g, "_") ?? "unknown"
      const filename = `payslip_${sanitizedName}_${new Date().toISOString().split("T")[0]}.pdf`

      // Step 1: Upload PDF to server
      const uploadResponse = await fetch("/api/upload-payslip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentBase64: base64,
          filename: filename,
        }),
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload payslip")
      }

      // Step 2: Send via WhatsApp using the uploaded file path
      const whatsappResponse = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          filePath: uploadResult.data.url, // This is the relative path like /uploads/payslips/123_file.pdf
          caption: `Payslip for ${employee?.employeeName} - ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          filename: filename,
        }),
      })

      const whatsappResult = await whatsappResponse.json()

      console.log("sendWhatsAppPayslip result", whatsappResult)

      if (whatsappResult.success) {
        // Clean up the uploaded file
        try {
          await fetch("/api/cleanup-payslip", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: uploadResult.data.filename,
            }),
          })
        } catch (cleanupError) {
          console.warn("Failed to cleanup payslip file:", cleanupError)
          // Don't fail the whole operation if cleanup fails
        }

        toast.success("Payslip sent successfully!", {
          description: "The PDF payslip has been sent via WhatsApp.",
        })
      } else {
        throw new Error(whatsappResult.error || "Failed to send payslip")
      }
    } catch (error) {
      console.error("WhatsApp API error:", error)

      // Show more detailed error message
      let errorMessage = "Failed to send payslip"
      let errorDescription = "Please try again later."

      if (error instanceof Error) {
        errorMessage = error.message
        if (error.message.includes("not configured")) {
          errorDescription =
            "WhatsApp API is not properly configured. Please check environment variables."
        } else if (
          error.message.includes("Access Token") ||
          error.message.includes("expired")
        ) {
          errorDescription =
            "WhatsApp access token has expired. Please refresh your token in Meta for Developers."
        } else if (error.message.includes("Phone Number")) {
          errorDescription =
            "Invalid phone number format. Please check the number."
        } else if (error.message.includes("upload")) {
          errorDescription =
            "Failed to upload payslip to server. Please try again."
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
      })
    } finally {
      setIsSendingWhatsApp(false)
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

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {/* Download Payslip Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              try {
                const pdfBlob = generatePayslipPDF()
                const url = URL.createObjectURL(pdfBlob)
                const link = document.createElement("a")
                link.href = url
                link.download = `payslip_${employee?.employeeName}_${new Date().toISOString().split("T")[0]}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                toast.success("Payslip downloaded successfully!", {
                  description: "The PDF payslip has been downloaded.",
                })
              } catch (error) {
                console.error("PDF generation error:", error)
                toast.error("Failed to download payslip", {
                  description: "Please try again later.",
                })
              }
            }}
            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Download className="mr-2 h-3 w-3" />
            Download
          </Button>

          {/* Send via WhatsApp Button */}
          <Button
            size="sm"
            onClick={() => {
              const phoneNumber = employee?.whatsUpPhoneNo
              if (!phoneNumber || phoneNumber.trim() === "") {
                toast.error(
                  `${employee?.employeeName || "Employee"} have no whats up contact number`,
                  {
                    description: "Please add a phone number for this employee",
                  }
                )
                return
              }
              sendWhatsAppPayslip(phoneNumber)
            }}
            disabled={
              isSendingWhatsApp ||
              !employee?.whatsUpPhoneNo ||
              employee?.whatsUpPhoneNo?.trim() === ""
            }
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <MessageSquare className="mr-2 h-3 w-3" />
            {isSendingWhatsApp ? "Sending..." : "WhatsApp"}
          </Button>

          {/* Send via Email Button */}
          <Button
            size="sm"
            onClick={() => {
              toast.info("Email Sharing", {
                description: "Opening email client to share payslip...",
              })
              // Open default email client
              const subject = `Payslip for ${employee?.employeeName}`
              const body = `Dear ${employee?.employeeName},\n\nPlease find attached your payslip.\n\nBest regards,\nHR Department`
              window.open(
                `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
                "_blank"
              )
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="mr-2 h-3 w-3" />
            Email
          </Button>
        </div>
      </div>
    </>
  )
}
