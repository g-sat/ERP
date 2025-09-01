"use client"

import { useState } from "react"
import {
  IEmployee,
  IEmployeeBank,
  IEmployeeBasic,
  IEmployeePersonalDetails,
} from "@/interfaces/employee"
import {
  Briefcase,
  Building,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Flag,
  Globe,
  Hash,
  Home,
  IdCard,
  Landmark,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  Wallet,
} from "lucide-react"

import { getDayName } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { EmployeeBasicForm } from "./forms/employee-basic"
import { EmployeePaymentForm } from "./forms/employee-payment"
import { EmployeePersonalForm } from "./forms/employee-personal"

interface Props {
  employee: IEmployee
  employeeBasic: IEmployeeBasic
  employeePersonal: IEmployeePersonalDetails
  employeeBank: IEmployeeBank
}

export function EmployeeOverview({
  employee,
  employeeBasic,
  employeePersonal,
  employeeBank,
}: Props) {
  const [showIban, setShowIban] = useState(false)
  const [basicDialogOpen, setBasicDialogOpen] = useState(false)
  const [personalDialogOpen, setPersonalDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  // Debug logging
  console.log("Employee data in overview:", employee)

  // Debug logging for mapped data
  console.log("Employee Basic for dialog:", employeeBasic)
  console.log("Employee Personal for dialog:", employeePersonal)
  console.log("Employee Bank for dialog:", employeeBank)

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="border-border bg-card h-full border shadow-sm">
            <CardHeader className="relative flex-shrink-0 pb-4">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBasicDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">
                  BASIC EMPLOYEE DETAILS
                </Badge>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gray-200 text-lg text-gray-600">
                    {employeeBasic?.employeeName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "EM"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {employeeBasic?.employeeName || ""} (
                    {employeeBasic?.employeeCode || ""})
                  </h3>
                  <p className="text-sm text-gray-500">
                    {employeeBasic?.designationName}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.companyName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.offEmailAdd || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.offPhoneNo || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.genderName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.joinDate
                        ? new Date(employeeBasic?.joinDate).toLocaleDateString()
                        : "01 Jul 2025"}{" "}
                      (Date of Joining)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.confirmationDate
                        ? new Date(
                            employeeBasic?.confirmationDate
                          ).toLocaleDateString()
                        : "01 Aug 2025"}{" "}
                      (Date of Confirmation)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.departmentName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.workLocationName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Flag className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.nationalityName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {employeeBasic?.employmentType || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {getDayName(employeeBasic?.dayOfWeek)} (WeekOff)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Personal Information */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card h-full border shadow-sm">
            <CardHeader className="relative flex-shrink-0 pb-4">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPersonalDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">
                  PERSONAL EMPLOYEE DETAILS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-4">
                {/* Personal Information */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.dob
                        ? new Date(employeePersonal?.dob).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Father&apos;s Name
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.fatherName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Personal Email
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.emailAdd || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Emergency Contact No
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.emergencyContactNo || "-"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Personal Contact No
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.personalContactNo || "-"}
                    </span>
                  </div>
                </div>

                {/* Document Information */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Work Permit No
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.workPermitNo || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Personal No
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.personalNo || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Passport No
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.passportNo || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Passport Expiry
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.passportExpiryDate
                        ? new Date(
                            employeePersonal?.passportExpiryDate as string
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Emirates ID No
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.emiratesIdNo || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Emirates ID Expiry
                    </label>
                    <span className="text-sm">
                      {employeePersonal?.emiratesIdExpiryDate
                        ? new Date(
                            employeePersonal?.emiratesIdExpiryDate as string
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Present Residential Address
                    </label>
                  </div>
                  <p className="ml-7 text-sm">
                    {employeePersonal?.currentAddress || ""}
                  </p>
                  <div className="flex items-center space-x-3">
                    <Home className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Permanent Address
                    </label>
                  </div>
                  <p className="ml-7 text-sm">
                    {employeePersonal?.permanentAddress || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Payment Information */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card h-full border shadow-sm">
            <CardHeader className="relative flex-shrink-0 pb-4">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-2 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">
                  PAYMENT / ACCOUNT INTEGRATION EMPLOYEE DETAILS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-4">
                {/* Payment Mode */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Wallet className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Payment Mode
                    </label>
                    <span className="text-sm">Bank Transfer</span>
                  </div>
                </div>

                {/* Bank Account Information */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Account Holder Name
                    </label>
                    <span className="text-sm">
                      {employeeBasic?.employeeName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Bank Name
                    </label>
                    <span className="text-sm">
                      {employeeBank?.bankName || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      Account No
                    </label>
                    <span className="text-sm">
                      {employeeBank?.accountNo || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      SWIFT Code
                    </label>
                    <span className="text-sm">
                      {employeeBank?.swiftCode || ""}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      IBAN No
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {showIban ? employeeBank?.iban || "" : "AEXXXXXXXX"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-blue-600 hover:text-blue-700"
                        onClick={() => setShowIban(!showIban)}
                      >
                        {showIban ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Landmark className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-500">
                      GL Code
                    </label>
                    <span className="text-sm">
                      {employeeBank?.glCode || ""} {"-"}
                      {employeeBank?.glName || ""}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={basicDialogOpen} onOpenChange={setBasicDialogOpen}>
        <DialogContent
          className="max-h-[80vh] w-[70vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Basic Information</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <EmployeeBasicForm
              employee={employeeBasic}
              onCancel={() => setBasicDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={personalDialogOpen} onOpenChange={setPersonalDialogOpen}>
        <DialogContent
          className="max-h-[90vh] w-[70vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Personal Information</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <EmployeePersonalForm
              employee={employeePersonal}
              onCancel={() => setPersonalDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent
          className="max-h-[90vh] w-[50vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Payment Information</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <EmployeePaymentForm
              employee={employeeBank}
              companyId={employee?.companyId || 0}
              onCancel={() => setPaymentDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
