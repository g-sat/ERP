"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { IEmployee } from "@/interfaces/employee"
import { ILeave, LeaveFormData, LeavePolicyFormData } from "@/interfaces/leave"
import { toast } from "sonner"

// Import the new leave hooks
import {
  useApproveLeave,
  useCancelLeaveApproval,
  useDeleteLeaveRequest,
  useGetLeaveBalances,
  useGetLeavePolicies,
  useGetLeaves,
  useRejectLeave,
  useSaveLeaveRequest,
  useSkipApproval,
} from "@/hooks/use-leave"
import { Button } from "@/components/ui/button"

import { EmployeeLeaveView } from "./components/employee-leave-view"
import { LeaveApprovalWorkflow } from "./components/leave-approval-workflow"
import { LeaveDashboard } from "./components/leave-dashboard"

export default function LeavePage() {
  // State for managing selected items
  const [selectedLeave, setSelectedLeave] = useState<ILeave | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null
  )
  const [viewMode, setViewMode] = useState<
    "dashboard" | "employee" | "approval"
  >("dashboard")

  // Use the new leave hooks to fetch data
  const { data: leavesData } = useGetLeaves()
  const { data: leaveBalancesData } = useGetLeaveBalances()
  const { data: policiesData } = useGetLeavePolicies()

  // Initialize mutation hooks
  const saveLeaveRequestMutation = useSaveLeaveRequest()
  const deleteLeaveRequestMutation = useDeleteLeaveRequest()
  const approveLeaveMutation = useApproveLeave()
  const rejectLeaveMutation = useRejectLeave()
  const skipApprovalMutation = useSkipApproval()
  const cancelLeaveApprovalMutation = useCancelLeaveApproval()

  // Extract data from API responses - ensure we get flat arrays
  const leaves = leavesData?.data || []
  const leaveBalances = leaveBalancesData?.data || []
  const policies = policiesData?.data || []

  // Dummy data for employees (since we don't have employee hooks yet)
  const dummyEmployees: IEmployee[] = [
    {
      employeeId: 101,
      companyId: 1,
      code: "EMP001",
      firstName: "John",
      lastName: "Doe",
      otherName: "",
      photo: "/uploads/avatars/john-doe.jpg",
      signature: "",
      empCategoryId: 1,
      departmentId: 1,
      departmentName: "IT Department",
      genderId: 1,
      martialStatus: "Married",
      dob: "1990-05-15",
      joinDate: "2020-03-01",
      lastDate: "",
      phoneNo: "+971501234567",
      offPhoneNo: "+971412345678",
      bankName: "Emirates NBD",
      accountNo: "1234567890",
      swiftCode: "EBILAEAD",
      iban: "AE070331234567890123456",
      offEmailAdd: "john.doe@company.com",
      otherEmailAdd: "johndoe@gmail.com",
      passportNo: "A12345678",
      passportExpiry: "2025-12-31",
      visaNo: "V123456789",
      visaExpiry: "2024-12-31",
      nationality: "American",
      emiratesIDNo: "784-1985-1234567-8",
      emiratesIDExpiry: "2025-05-15",
      mohreContractIDNo: "MC123456789",
      mohreContractExpiry: "2024-12-31",
      isActive: true,
      remarks: "Senior Developer",
      createBy: "admin",
      createDate: "2020-03-01T00:00:00Z",
      editBy: "admin",
      editDate: "2024-01-15T10:30:00Z",
    },
    {
      employeeId: 102,
      companyId: 1,
      code: "EMP002",
      firstName: "Jane",
      lastName: "Smith",
      otherName: "",
      photo: "/uploads/avatars/jane-smith.jpg",
      signature: "",
      empCategoryId: 2,
      departmentId: 2,
      departmentName: "HR Department",
      genderId: 2,
      martialStatus: "Single",
      dob: "1992-08-20",
      joinDate: "2021-06-15",
      lastDate: "",
      phoneNo: "+971502345678",
      offPhoneNo: "+971413456789",
      bankName: "Abu Dhabi Commercial Bank",
      accountNo: "0987654321",
      swiftCode: "ADCBAEAD",
      iban: "AE0203310987654321098765",
      offEmailAdd: "jane.smith@company.com",
      otherEmailAdd: "janesmith@gmail.com",
      passportNo: "B87654321",
      passportExpiry: "2026-06-30",
      visaNo: "V987654321",
      visaExpiry: "2025-06-30",
      nationality: "British",
      emiratesIDNo: "784-1992-8765432-1",
      emiratesIDExpiry: "2026-08-20",
      mohreContractIDNo: "MC987654321",
      mohreContractExpiry: "2025-06-30",
      isActive: true,
      remarks: "HR Specialist",
      createBy: "admin",
      createDate: "2021-06-15T00:00:00Z",
      editBy: "admin",
      editDate: "2024-01-17T14:20:00Z",
    },
    {
      employeeId: 103,
      companyId: 1,
      code: "EMP003",
      firstName: "Mike",
      lastName: "Johnson",
      otherName: "",
      photo: "/uploads/avatars/mike-johnson.jpg",
      signature: "",
      empCategoryId: 1,
      departmentId: 3,
      departmentName: "Finance Department",
      genderId: 1,
      martialStatus: "Married",
      dob: "1988-12-10",
      joinDate: "2019-09-01",
      lastDate: "",
      phoneNo: "+971503456789",
      offPhoneNo: "+971414567890",
      bankName: "Dubai Islamic Bank",
      accountNo: "1122334455",
      swiftCode: "DUIBAEAD",
      iban: "AE0303311122334455667788",
      offEmailAdd: "mike.johnson@company.com",
      otherEmailAdd: "mikejohnson@gmail.com",
      passportNo: "C11223344",
      passportExpiry: "2026-03-15",
      visaNo: "V112233445",
      visaExpiry: "2025-03-15",
      nationality: "Canadian",
      emiratesIDNo: "784-1988-1122334-4",
      emiratesIDExpiry: "2026-12-10",
      mohreContractIDNo: "MC112233445",
      mohreContractExpiry: "2025-03-15",
      isActive: true,
      remarks: "Finance Manager",
      createBy: "admin",
      createDate: "2019-09-01T00:00:00Z",
      editBy: "admin",
      editDate: "2024-01-15T09:00:00Z",
    },
    {
      employeeId: 104,
      companyId: 1,
      code: "EMP004",
      firstName: "Sarah",
      lastName: "Wilson",
      otherName: "",
      photo: "/uploads/avatars/sarah-wilson.jpg",
      signature: "",
      empCategoryId: 2,
      departmentId: 4,
      departmentName: "Marketing Department",
      genderId: 2,
      martialStatus: "Married",
      dob: "1991-03-25",
      joinDate: "2022-01-10",
      lastDate: "",
      phoneNo: "+971504567890",
      offPhoneNo: "+971415678901",
      bankName: "Mashreq Bank",
      accountNo: "5544332211",
      swiftCode: "MSHQAEAE",
      iban: "AE0403315544332211009988",
      offEmailAdd: "sarah.wilson@company.com",
      otherEmailAdd: "sarahwilson@gmail.com",
      passportNo: "D55443322",
      passportExpiry: "2027-01-20",
      visaNo: "V554433221",
      visaExpiry: "2026-01-20",
      nationality: "Australian",
      emiratesIDNo: "784-1991-5544332-2",
      emiratesIDExpiry: "2027-03-25",
      mohreContractIDNo: "MC554433221",
      mohreContractExpiry: "2026-01-20",
      isActive: true,
      remarks: "Marketing Specialist",
      createBy: "admin",
      createDate: "2022-01-10T00:00:00Z",
      editBy: "admin",
      editDate: "2024-01-25T13:20:00Z",
    },
    {
      employeeId: 105,
      companyId: 1,
      code: "EMP005",
      firstName: "David",
      lastName: "Brown",
      otherName: "",
      photo: "/uploads/avatars/david-brown.jpg",
      signature: "",
      empCategoryId: 1,
      departmentId: 5,
      departmentName: "Operations Department",
      genderId: 1,
      martialStatus: "Single",
      dob: "1989-07-08",
      joinDate: "2020-11-15",
      lastDate: "",
      phoneNo: "+971505678901",
      offPhoneNo: "+971416789012",
      bankName: "First Abu Dhabi Bank",
      accountNo: "9988776655",
      swiftCode: "FABAAEAD",
      iban: "AE0503319988776655443322",
      offEmailAdd: "david.brown@company.com",
      otherEmailAdd: "davidbrown@gmail.com",
      passportNo: "E99887766",
      passportExpiry: "2026-11-30",
      visaNo: "V998877665",
      visaExpiry: "2025-11-30",
      nationality: "South African",
      emiratesIDNo: "784-1989-9988776-6",
      emiratesIDExpiry: "2026-07-08",
      mohreContractIDNo: "MC998877665",
      mohreContractExpiry: "2025-11-30",
      isActive: true,
      remarks: "Operations Specialist",
      createBy: "admin",
      createDate: "2020-11-15T00:00:00Z",
      editBy: "admin",
      editDate: "2024-01-24T09:15:00Z",
    },
  ]

  const employees = dummyEmployees

  // Format employees for the dashboard
  const formattedEmployees = employees.map((emp) => ({
    id: emp.employeeId.toString(),
    name: `${emp.firstName} ${emp.lastName}`,
    employeeCode: emp.code,
    photo: emp.photo,
    department: emp.departmentName,
  }))

  // Handler functions using the new mutation hooks
  const handleLeaveSubmit = async (data: LeaveFormData) => {
    try {
      console.log("Submitting leave request:", data)
      // Convert LeaveFormData to ILeaveRequest format
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      const totalDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1

      const leaveRequestData = {
        employeeId: parseInt(data.employeeId),
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays,
        reason: data.reason,
        statusId: 1, // Default to pending
        remarks: data.notes,
        attachments: data.attachments?.join(",") || undefined, // Convert array to comma-separated string
        createById: 1, // This should come from user context
        createDate: new Date().toISOString(),
      }
      saveLeaveRequestMutation.mutate(leaveRequestData)
    } catch (error) {
      console.error("Error submitting leave request:", error)
      toast.error("Failed to submit leave request")
    }
  }

  const handlePolicySubmit = async (data: LeavePolicyFormData) => {
    // This will be implemented when we have policy hooks
    console.log("Policy submit:", data)
    toast.info("Policy submission not yet implemented")
  }

  const handleLeaveEdit = (leave: ILeave) => {
    setSelectedLeave(leave)
    // This will be implemented when we have edit functionality
    console.log("Edit leave:", leave)
    toast.info("Edit functionality not yet implemented")
  }

  const handleLeaveDelete = async (leaveId: string) => {
    try {
      console.log("Deleting leave:", leaveId)
      deleteLeaveRequestMutation.mutate(leaveId)
    } catch (error) {
      console.error("Error deleting leave:", error)
      toast.error("Failed to delete leave")
    }
  }

  const handleLeaveApprove = async (leaveId: string) => {
    try {
      console.log("Approving leave:", leaveId)
      approveLeaveMutation.mutate({
        leaveId,
        approverId: "1", // This should come from user context
        comments: "Approved by manager",
      })
    } catch (error) {
      console.error("Error approving leave:", error)
      toast.error("Failed to approve leave")
    }
  }

  const handleLeaveReject = async (leaveId: string) => {
    try {
      console.log("Rejecting leave:", leaveId)
      rejectLeaveMutation.mutate({
        leaveId,
        approverId: "1", // This should come from user context
        reason: "Rejected by manager",
      })
    } catch (error) {
      console.error("Error rejecting leave:", error)
      toast.error("Failed to reject leave")
    }
  }

  const handlePolicyEdit = () => {
    // This will be implemented when we have policy edit functionality
    console.log("Edit policy")
    toast.info("Policy edit functionality not yet implemented")
  }

  const handleBackToDashboard = () => {
    setViewMode("dashboard")
    setSelectedLeave(null)
    setSelectedEmployee(null)
  }

  const handleEmployeeView = (employee: {
    id: string
    name: string
    employeeCode: string
    photo?: string
    department?: string
  }) => {
    const foundEmployee = employees.find(
      (emp) => emp.employeeId.toString() === employee.id
    )
    if (foundEmployee) {
      setSelectedEmployee(foundEmployee)
      setViewMode("employee")
    }
  }

  const handleApprovalView = (leave: ILeave) => {
    setSelectedLeave(leave)
    setViewMode("approval")
  }

  const handleLeaveCancel = async (leaveId: string) => {
    try {
      console.log("Canceling leave:", leaveId)
      cancelLeaveApprovalMutation.mutate({
        leaveId,
        approverId: "1", // This should come from user context
      })
    } catch (error) {
      console.error("Error canceling leave:", error)
      toast.error("Failed to cancel leave")
    }
  }

  const handleApprove = async (
    leaveId: string,
    approverId: string,
    comments?: string
  ) => {
    try {
      console.log("Approving leave:", { leaveId, approverId, comments })
      approveLeaveMutation.mutate({
        leaveId,
        approverId,
        comments,
      })
    } catch (error) {
      console.error("Error approving leave:", error)
      toast.error("Failed to approve leave")
    }
  }

  const handleReject = async (
    leaveId: string,
    approverId: string,
    reason: string
  ) => {
    try {
      console.log("Rejecting leave:", { leaveId, approverId, reason })
      rejectLeaveMutation.mutate({
        leaveId,
        approverId,
        reason,
      })
    } catch (error) {
      console.error("Error rejecting leave:", error)
      toast.error("Failed to reject leave")
    }
  }

  const handleSkip = async (leaveId: string, approverId: string) => {
    try {
      console.log("Skipping approval level:", { leaveId, approverId })
      skipApprovalMutation.mutate({
        leaveId,
        approverId,
      })
    } catch (error) {
      console.error("Error skipping approval level:", error)
      toast.error("Failed to skip approval level")
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Quick Access Demo - For demonstration purposes */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-blue-900">
          🚀 Quick Access Demo
        </h3>
        <p className="mb-3 text-blue-700">
          This demonstrates how John Doe would access his leave page when he
          logs in:
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const johnDoe = employees.find((emp) => emp.employeeId === 101)
              if (johnDoe) {
                handleEmployeeView({
                  id: johnDoe.employeeId.toString(),
                  name: `${johnDoe.firstName} ${johnDoe.lastName}`,
                  employeeCode: johnDoe.code,
                  photo: johnDoe.photo,
                  department: johnDoe.departmentName,
                })
              }
            }}
            className="bg-white hover:bg-blue-50"
          >
            👤 View John Doe&apos;s Leave Page
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const pendingLeave = leaves.find(
                (leave) => leave.statusName === "PENDING"
              )
              if (pendingLeave) {
                handleApprovalView(pendingLeave)
              }
            }}
            className="bg-white hover:bg-blue-50"
          >
            ✅ Approve Leave Request (Manager View)
          </Button>
        </div>
      </div>

      {/* Back to Dashboard Button */}
      {viewMode !== "dashboard" && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
      )}

      {/* Main Content */}
      {viewMode === "dashboard" && (
        <LeaveDashboard
          leaves={leaves}
          leaveBalances={leaveBalances}
          policies={policies}
          employees={formattedEmployees}
          onLeaveSubmit={handleLeaveSubmit}
          onLeaveEdit={handleLeaveEdit}
          onLeaveDelete={handleLeaveDelete}
          onLeaveApprove={handleLeaveApprove}
          onLeaveReject={handleLeaveReject}
          onPolicySubmit={handlePolicySubmit}
          onPolicyEdit={handlePolicyEdit}
          onEmployeeView={handleEmployeeView}
          onApprovalView={handleApprovalView}
        />
      )}

      {viewMode === "employee" && selectedEmployee && (
        <EmployeeLeaveView
          employee={selectedEmployee}
          leaves={leaves.filter(
            (leave) => leave.employeeId === selectedEmployee.employeeId
          )}
          leaveBalances={leaveBalances.filter(
            (balance) => balance.employeeId === selectedEmployee.employeeId
          )}
          onLeaveSubmit={handleLeaveSubmit}
          onLeaveEdit={handleLeaveEdit}
          onLeaveCancel={handleLeaveCancel}
        />
      )}

      {viewMode === "approval" && selectedLeave && (
        <LeaveApprovalWorkflow
          leave={selectedLeave}
          onApprove={handleApprove}
          onReject={handleReject}
          onSkip={handleSkip}
        />
      )}
    </div>
  )
}
