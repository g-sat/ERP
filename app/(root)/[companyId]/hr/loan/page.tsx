"use client"

import { useEffect, useState } from "react"
import {
  ILoan,
  ILoanApplication,
  ILoanApplicationFormData,
  ILoanApprovalFormData,
  ILoanDashboard,
  ILoanRepayment,
} from "@/interfaces/loan"
import { CreditCard, FileText, TrendingUp } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LoanApplicationForm } from "./components/loan-application-form"
import { LoanApplicationsTable } from "./components/loan-applications-table"
import { LoanApprovalForm } from "./components/loan-approval-form"
import { LoanDashboard } from "./components/loan-dashboard"
import {
  dummyLoanApplications,
  dummyLoanDashboard,
  dummyLoanRepayments,
  dummyLoans,
} from "./dummy-loan-data"

export default function LoanPage() {
  const [userRole, setUserRole] = useState<"employee" | "approver">("employee")
  const [activeTab, setActiveTab] = useState("dashboard")

  // Data state
  const [applications, setApplications] = useState<ILoanApplication[]>(
    dummyLoanApplications
  )
  const [loans, setLoans] = useState<ILoan[]>(dummyLoans)
  const [repayments, setRepayments] =
    useState<ILoanRepayment[]>(dummyLoanRepayments)
  const [dashboard, setDashboard] = useState<ILoanDashboard>(dummyLoanDashboard)

  // UI state
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [selectedApplication, setSelectedApplication] =
    useState<ILoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate user role - in real app, this would come from auth context
  useEffect(() => {
    // For demo purposes, allow switching between roles
    // In production, this would be determined by user permissions
    const urlParams = new URLSearchParams(window.location.search)
    const role = urlParams.get("role") as "employee" | "approver"
    if (role) {
      setUserRole(role)
    }
  }, [])

  // Handle loan application submission
  const handleApplicationSubmit = async (data: ILoanApplicationFormData) => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newApplication: ILoanApplication = {
        applicationId: applications.length + 1,
        employeeId: data.employeeId,
        employeeName: "Current User", // In real app, get from auth context
        employeeCode: "EMP001",
        departmentName: "IT Department",
        designationName: "Developer",
        loanType: data.loanType,
        requestedAmount: data.requestedAmount,
        purpose: data.purpose,
        repaymentPeriod: data.repaymentPeriod,
        monthlyIncome: data.monthlyIncome,
        existingLoans: data.existingLoans,
        applicationDate: new Date(),
        status: "Submitted",
        submittedDate: new Date(),
        remarks: data.remarks,
        createDate: new Date(),
        createBy: "Current User",
      }

      setApplications((prev) => [newApplication, ...prev])
      setShowApplicationForm(false)

      toast.success(
        "Your loan application has been submitted successfully and is under review."
      )
    } catch (error) {
      toast.error("Failed to submit application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle loan approval/rejection
  const handleApprovalSubmit = async (data: ILoanApprovalFormData) => {
    if (!selectedApplication) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedApplications = applications.map((app) => {
        if (app.applicationId === selectedApplication.applicationId) {
          return {
            ...app,
            status: data.approvalStatus,
            approvedBy: 1, // Current approver ID
            approvedByName: "Current Approver",
            approvedDate: new Date(),
            rejectionReason: data.rejectionReason,
            remarks: data.remarks,
          }
        }
        return app
      })

      setApplications(updatedApplications)

      // If approved, create a new loan
      if (data.approvalStatus === "Approved" && data.approvedAmount) {
        const newLoan: ILoan = {
          loanId: loans.length + 1,
          employeeId: selectedApplication.employeeId,
          employeeName: selectedApplication.employeeName,
          employeeCode: selectedApplication.employeeCode,
          departmentName: selectedApplication.departmentName,
          designationName: selectedApplication.designationName,
          loanType: selectedApplication.loanType,
          loanAmount: data.approvedAmount,
          loanDate: new Date(),
          interestRate: data.approvedInterestRate || 10,
          repaymentTerms: `${data.approvedRepaymentPeriod} months, monthly payments`,
          monthlyPayment: calculateMonthlyPayment(
            data.approvedAmount,
            data.approvedInterestRate || 10,
            data.approvedRepaymentPeriod || 12
          ),
          totalPayable: calculateTotalPayable(
            data.approvedAmount,
            data.approvedInterestRate || 10,
            data.approvedRepaymentPeriod || 12
          ),
          status: "Active",
          approvedBy: 1,
          approvedByName: "Current Approver",
          approvedDate: new Date(),
          remarks: data.remarks,
          createDate: new Date(),
          createBy: "Current Approver",
        }

        setLoans((prev) => [newLoan, ...prev])
      }

      setShowApprovalForm(false)
      setSelectedApplication(null)

      toast.success(
        `The loan application has been ${data.approvalStatus.toLowerCase()} successfully.`
      )
    } catch (error) {
      toast.error("Failed to process approval. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions
  const calculateMonthlyPayment = (
    amount: number,
    rate: number,
    period: number
  ): number => {
    const monthlyRate = rate / 12 / 100
    return (
      (amount * monthlyRate * Math.pow(1 + monthlyRate, period)) /
      (Math.pow(1 + monthlyRate, period) - 1)
    )
  }

  const calculateTotalPayable = (
    amount: number,
    rate: number,
    period: number
  ): number => {
    const monthlyPayment = calculateMonthlyPayment(amount, rate, period)
    return monthlyPayment * period
  }

  // Event handlers
  const handleViewApplication = (application: ILoanApplication) => {
    // View functionality is handled in the table component
  }

  const handleEditApplication = (application: ILoanApplication) => {
    setSelectedApplication(application)
    setShowApplicationForm(true)
  }

  const handleApproveApplication = (application: ILoanApplication) => {
    setSelectedApplication(application)
    setShowApprovalForm(true)
  }

  const handleRejectApplication = (application: ILoanApplication) => {
    setSelectedApplication(application)
    setShowApprovalForm(true)
  }

  const handleCreateApplication = () => {
    setSelectedApplication(null)
    setShowApplicationForm(true)
  }

  // Role switcher for demo purposes
  const RoleSwitcher = () => (
    <div className="bg-muted mb-4 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Demo Mode</h3>
          <p className="text-muted-foreground text-sm">
            Switch between employee and approver views
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={userRole === "employee" ? "default" : "outline"}
            size="sm"
            onClick={() => setUserRole("employee")}
          >
            Employee View
          </Button>
          <Button
            variant={userRole === "approver" ? "default" : "outline"}
            size="sm"
            onClick={() => setUserRole("approver")}
          >
            Approver View
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Management</h1>
          <p className="text-muted-foreground">
            {userRole === "employee"
              ? "Apply for loans and track your applications"
              : "Review and approve employee loan applications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Current Role:</span>
          <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-xs font-medium">
            {userRole === "employee" ? "Employee" : "Approver"}
          </span>
        </div>
      </div>

      {/* Role Switcher for Demo */}
      <RoleSwitcher />

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Active Loans
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <LoanDashboard dashboard={dashboard} userRole={userRole} />
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <LoanApplicationsTable
            applications={applications}
            userRole={userRole}
            onViewApplication={handleViewApplication}
            onEditApplication={handleEditApplication}
            onApproveApplication={handleApproveApplication}
            onRejectApplication={handleRejectApplication}
            onCreateApplication={handleCreateApplication}
          />
        </TabsContent>

        {/* Active Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => (
              <div key={loan.loanId} className="rounded-lg border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">{loan.employeeName}</h3>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {loan.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Type:</span>
                    <span className="font-medium">{loan.loanType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "AED",
                      }).format(loan.loanAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monthly Payment:
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "AED",
                      }).format(loan.monthlyPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Interest Rate:
                    </span>
                    <span className="font-medium">{loan.interestRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedApplication
                ? "Edit Loan Application"
                : "New Loan Application"}
            </DialogTitle>
          </DialogHeader>
          <LoanApplicationForm
            onSubmit={handleApplicationSubmit}
            onCancel={() => setShowApplicationForm(false)}
            isLoading={isLoading}
            initialData={
              selectedApplication
                ? {
                    employeeId: selectedApplication.employeeId,
                    loanType: selectedApplication.loanType as
                      | "Personal"
                      | "Housing"
                      | "Vehicle"
                      | "Education"
                      | "Emergency",
                    requestedAmount: selectedApplication.requestedAmount,
                    purpose: selectedApplication.purpose,
                    repaymentPeriod: selectedApplication.repaymentPeriod,
                    monthlyIncome: selectedApplication.monthlyIncome,
                    existingLoans: selectedApplication.existingLoans,
                    remarks: selectedApplication.remarks,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* Approval Form Dialog */}
      <Dialog open={showApprovalForm} onOpenChange={setShowApprovalForm}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Loan Application</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <LoanApprovalForm
              application={selectedApplication}
              onSubmit={handleApprovalSubmit}
              onCancel={() => setShowApprovalForm(false)}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
