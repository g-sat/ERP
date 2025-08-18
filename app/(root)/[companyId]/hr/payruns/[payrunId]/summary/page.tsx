"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ApiResponse } from "@/interfaces/auth"
import { IPayrollEmployeeHd, ISIFEmployee } from "@/interfaces/payrun"
import { ArrowLeft, CheckCircle, CreditCard, Download } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { useGetById, usePersist } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

import { PayRunSummaryForm } from "../components/payrun-summary-form"
import { PayRunSummaryTable } from "../components/payrun-summary-table"

export default function PayRunSummaryPage() {
  const params = useParams()
  const payrunId = params.payrunId as string
  const companyId = params.companyId as string
  const router = useRouter()

  const [selectedEmployee, setSelectedEmployee] =
    useState<IPayrollEmployeeHd | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showApproveConfirmation, setShowApproveConfirmation] = useState(false)
  const [showEditConfirmation, setShowEditConfirmation] = useState(false)
  const [showSendPayslipConfirmation, setShowSendPayslipConfirmation] =
    useState(false)
  const [showDeletePaymentConfirmation, setShowDeletePaymentConfirmation] =
    useState(false)
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false)
  const [showRecordPaymentConfirmation, setShowRecordPaymentConfirmation] =
    useState(false)

  // API call to get pay run summary data
  const {
    data: payRunData,
    isLoading,
    refetch,
  } = useGetById<IPayrollEmployeeHd[]>(
    `/hr/payrollruns/payrunlist`,
    "pay-run-summary",
    payrunId
  )

  // SIF API call
  const {
    data: sifData,
    refetch: refetchSIF,
    isLoading: isSIFLoading,
  } = useGetById<ISIFEmployee[]>(`/hr/payrollruns/SIF`, "sif-data", payrunId)

  // Record payment API call
  const { mutate: recordPayment, isPending: isRecordingPayment } = usePersist(
    `/hr/payrollruns/record-payment/${payrunId}`
  )

  // Reject payment API call
  const { mutate: rejectPayment, isPending: isRejectingPayment } = usePersist(
    `/hr/payrollruns/reject/${payrunId}`
  )

  // Delete payment API call
  const { mutate: deletePayment, isPending: isDeletingPayment } = usePersist(
    `/hr/payrollruns/delete-record-payment/${payrunId}`
  )

  // Approve payroll API call
  const { mutate: approvePayroll, isPending: isApprovingPayroll } = usePersist(
    `/hr/payrollruns/submit/${payrunId}`
  )

  // Edit payroll API call
  const { mutate: editPayroll, isPending: isEditingPayroll } = usePersist(
    `/hr/payrollruns/edit/${payrunId}`
  )

  // Cast the data to the correct type
  const employees = (payRunData?.data as unknown as IPayrollEmployeeHd[]) || []

  // Calculate totals from actual data
  const totalEarnings = employees.reduce(
    (sum, emp) => sum + (emp.totalEarnings || 0),
    0
  )
  const totalDeductions = employees.reduce(
    (sum, emp) => sum + (emp.totalDeductions || 0),
    0
  )
  const totalNetPay = employees.reduce(
    (sum, emp) => sum + (emp.netSalary || 0),
    0
  )

  const handleEmployeeClick = (employee: IPayrollEmployeeHd) => {
    setSelectedEmployee(employee)
    setShowPaymentForm(true)
  }

  const handleSIF = async () => {
    toast.info("Generating SIF Excel file...", {
      description: "Please wait while we prepare the SIF data for download.",
    })

    try {
      // Fetch SIF data
      await refetchSIF()

      // Check if we have SIF data
      if (sifData?.data && Array.isArray(sifData.data)) {
        // Create worksheet from SIF data
        const worksheet = XLSX.utils.json_to_sheet(sifData.data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "SIF Data")

        // Generate filename with current date
        const currentDate = new Date().toISOString().split("T")[0]
        const filename = `SIF_${payrunId}_${currentDate}.xlsx`

        // Download the file
        XLSX.writeFile(workbook, filename)
        toast.success("SIF Excel file downloaded successfully")
      } else {
        toast.error("No SIF data available to download")
      }
    } catch (error) {
      console.error("Error generating SIF Excel:", error)
      toast.error("Failed to generate SIF Excel file")
    }
  }

  const handleRecordPayment = () => {
    recordPayment(
      {},
      {
        onSuccess: (response: ApiResponse<unknown>) => {
          if (response.result === 1) {
            toast.success("Payment recorded successfully")
            refetch() // Refetch the table data
          } else {
            toast.error(response.message || "Failed to record payment")
          }
        },
        onError: (error: unknown) => {
          toast.error("Failed to record payment")
          console.error("Error recording payment:", error)
        },
      }
    )
  }

  const handleSendPayslip = () => {
    // TODO: Implement payslip sending functionality
    toast.success("Payslips sent successfully")
    refetch() // Refetch the table data
    router.push(`/${companyId}/hr/payruns/${payrunId}/summary`)
  }

  const handleRejectPayment = () => {
    rejectPayment(
      {},
      {
        onSuccess: (response: ApiResponse<unknown>) => {
          if (response.result === 1) {
            toast.success("Payment rejected successfully")
            refetch() // Refetch the table data
            router.push(`/${companyId}/hr/payruns/${payrunId}/summary`)
          } else {
            toast.error(response.message || "Failed to reject payment")
          }
        },
        onError: (error: unknown) => {
          toast.error("Failed to reject payment")
          console.error("Error rejecting payment:", error)
        },
      }
    )
  }

  const handleDeleteRecordPayment = () => {
    deletePayment(
      {},
      {
        onSuccess: (response: ApiResponse<unknown>) => {
          if (response.result === 1) {
            toast.success("Payment deleted successfully")
            refetch() // Refetch the table data
            router.push(`/${companyId}/hr/payruns/${payrunId}/summary`)
          } else {
            toast.error(response.message || "Failed to delete payment")
          }
        },
        onError: (error: unknown) => {
          toast.error("Failed to delete payment")
          console.error("Error deleting payment:", error)
        },
      }
    )
  }

  const handleApprovePayroll = () => {
    approvePayroll(
      {},
      {
        onSuccess: (response: ApiResponse<unknown>) => {
          if (response.result === 1) {
            toast.success("Payroll approved successfully")
            refetch() // Refetch the table data
          } else {
            toast.error(response.message || "Failed to approve payroll")
          }
        },
        onError: (error: unknown) => {
          toast.error("Failed to approve payroll")
          console.error("Error approving payroll:", error)
        },
      }
    )
  }

  const handleEditPayrun = () => {
    editPayroll(
      {},
      {
        onSuccess: (response: ApiResponse<unknown>) => {
          if (response.result === 1) {
            toast.success("Payroll edited successfully")
            // Navigate to preview page for editing
            router.push(`/${companyId}/hr/payruns/${payrunId}/preview`)
          } else {
            toast.error(response.message || "Failed to edit payroll")
          }
        },
        onError: (error: unknown) => {
          toast.error("Failed to edit payroll")
          console.error("Error editing payroll:", error)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="@container flex-1 space-y-3 p-3 pt-4 md:p-4">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading pay run data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="@container flex-1 space-y-3 p-3 pt-4 md:p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        {/* Main Payroll Overview Card */}
        <Card className="overflow-hidden border-0 bg-white/50 shadow-lg">
          <CardContent className="p-4">
            {/* Header Section */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/${companyId}/hr/payruns?refetch=true`)
                  }
                  className="flex items-center space-x-2 rounded-lg bg-white/80 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 shadow-lg">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Payroll Summary
                  </h3>
                  <p className="text-sm text-gray-600">
                    August 2025 • 30 Base Days
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">
                    Pay Day
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    03 SEP, 2025
                  </div>
                </div>
                {/* Check if status is rejected */}
                {employees[0]?.isRejected ? (
                  // If rejected, show Approve Payroll and Edit Payrun buttons
                  <>
                    <Button
                      onClick={() => setShowApproveConfirmation(true)}
                      disabled={isApprovingPayroll}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:from-emerald-600 hover:to-teal-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isApprovingPayroll ? "Approving..." : "Approve Payroll"}
                    </Button>
                    <Button
                      onClick={() => setShowEditConfirmation(true)}
                      variant="outline"
                      disabled={isEditingPayroll}
                      className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      {isEditingPayroll ? "Editing..." : "Edit Payrun"}
                    </Button>
                  </>
                ) : employees[0]?.isPaid ? (
                  // If payment is recorded, show SIF, Send Payslip and Delete Record Payment buttons
                  <>
                    <Button
                      onClick={handleSIF}
                      disabled={isSIFLoading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:from-blue-600 hover:to-indigo-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isSIFLoading ? "Generating..." : "SIF"}
                    </Button>
                    <Button
                      onClick={() => setShowSendPayslipConfirmation(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg hover:from-emerald-600 hover:to-teal-700"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Send Payslip
                    </Button>
                    {!employees[0]?.isPreviousPaid && (
                      <Button
                        onClick={() => setShowDeletePaymentConfirmation(true)}
                        disabled={isDeletingPayment}
                        variant="destructive"
                      >
                        {isDeletingPayment
                          ? "Deleting..."
                          : "Delete Record Payment"}
                      </Button>
                    )}
                  </>
                ) : (
                  // If payment is not recorded, show Record Payment and Reject Approval buttons
                  <>
                    <Button
                      onClick={() => setShowRecordPaymentConfirmation(true)}
                      disabled={isRecordingPayment}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:from-blue-600 hover:to-indigo-700"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isRecordingPayment ? "Recording..." : "Ready to Pay"}
                    </Button>
                    <Button
                      onClick={() => setShowRejectConfirmation(true)}
                      disabled={isRejectingPayment}
                      variant="destructive"
                    >
                      Reject Approval
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Total Employees Card */}
              <div className="rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">
                      Total Employees
                    </p>
                    <p className="text-2xl font-bold">
                      {employees.length} Staff
                    </p>
                  </div>
                  <div className="rounded-full bg-white/30 p-2.5 shadow-inner">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Payroll Cost Card */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">
                      Payroll Cost
                    </p>
                    <p className="text-2xl font-bold">
                      <CurrencyFormatter amount={totalEarnings} />
                    </p>
                  </div>
                  <div className="rounded-full bg-white/30 p-2.5 shadow-inner">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Deductions Card */}
              <div className="rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Deductions</p>
                    <p className="text-2xl font-bold">
                      <CurrencyFormatter amount={totalDeductions} />
                    </p>
                  </div>
                  <div className="rounded-full bg-white/30 p-2.5 shadow-inner">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Net Pay Card */}
              <div className="rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">Net Pay</p>
                    <p className="text-2xl font-bold">
                      <CurrencyFormatter amount={totalNetPay} />
                    </p>
                  </div>
                  <div className="rounded-full bg-white/30 p-2.5 shadow-inner">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <PayRunSummaryTable
        employees={employees}
        onEmployeeClick={handleEmployeeClick}
      />

      <Dialog
        open={showPaymentForm}
        onOpenChange={(open) => {
          setShowPaymentForm(open)
          if (!open) {
            setSelectedEmployee(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[40vw] !max-w-none overflow-y-auto">
          {isLoading ? (
            <DialogHeader>
              <DialogTitle>Loading Employee Details...</DialogTitle>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-blue-600">
                      {selectedEmployee?.employeeName || "Employee Name"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      [{selectedEmployee?.employeeCode}] |{" "}
                      {selectedEmployee?.departmentName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedEmployee?.companyName}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        selectedEmployee?.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : selectedEmployee?.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : selectedEmployee?.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedEmployee?.status || "N/A"}
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <PayRunSummaryForm
                employee={selectedEmployee}
                payrunId={payrunId}
                onClose={() => {
                  setShowPaymentForm(false)
                  setSelectedEmployee(null)
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Payroll Confirmation Dialog */}
      <Dialog
        open={showApproveConfirmation}
        onOpenChange={setShowApproveConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Approve Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to approve this payroll? This will mark the
              payroll as approved.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowApproveConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowApproveConfirmation(false)
                  handleApprovePayroll()
                }}
                disabled={isApprovingPayroll}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isApprovingPayroll ? "Approving..." : "Yes, Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Payrun Confirmation Dialog */}
      <Dialog
        open={showEditConfirmation}
        onOpenChange={setShowEditConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Edit Payrun</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to edit this payrun? You will be redirected
              to the preview page.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowEditConfirmation(false)
                  handleEditPayrun()
                }}
                disabled={isEditingPayroll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditingPayroll ? "Editing..." : "Yes, Edit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Payslip Confirmation Dialog */}
      <Dialog
        open={showSendPayslipConfirmation}
        onOpenChange={setShowSendPayslipConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Send Payslip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to send payslips to all employees? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSendPayslipConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowSendPayslipConfirmation(false)
                  handleSendPayslip()
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Yes, Send Payslips
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Record Payment Confirmation Dialog */}
      <Dialog
        open={showDeletePaymentConfirmation}
        onOpenChange={setShowDeletePaymentConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete the recorded payment? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeletePaymentConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowDeletePaymentConfirmation(false)
                  handleDeleteRecordPayment()
                }}
                disabled={isDeletingPayment}
                variant="destructive"
              >
                {isDeletingPayment ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Approval Confirmation Dialog */}
      <Dialog
        open={showRejectConfirmation}
        onOpenChange={setShowRejectConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Reject Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to reject this payroll approval? This will
              send the payroll back for review.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRejectConfirmation(false)
                  handleRejectPayment()
                }}
                disabled={isRejectingPayment}
                variant="destructive"
              >
                {isRejectingPayment ? "Rejecting..." : "Yes, Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment Confirmation Dialog */}
      <Dialog
        open={showRecordPaymentConfirmation}
        onOpenChange={setShowRecordPaymentConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to record the payment for this payroll? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRecordPaymentConfirmation(false)}
              >
                No, Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowRecordPaymentConfirmation(false)
                  handleRecordPayment()
                }}
                disabled={isRecordingPayment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRecordingPayment ? "Recording..." : "Yes, Record Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
