"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface Employee {
  id: number
  name: string
  employeeId: string
  paidDays: number
  grossPay: number
  benefits: number
  netPay: number
  earnings: {
    basic: number
    housingAllowance: number
    costOfLivingAllowance: number
    otherAllowance: number
  }
  deductions: {
    personalLoans: number
    actualLoanAmount: number
  }
}

interface EmployeeSidebarProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onSave: (employee: Employee) => void
}

export function EmployeeSidebar({
  employee,
  isOpen,
  onClose,
  onSave,
}: EmployeeSidebarProps) {
  const [formData, setFormData] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Update form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData(employee)
    }
  }, [employee])

  if (!employee || !formData) return null

  const handleEarningChange = (type: string, value: number) => {
    if (!formData) return

    const updatedEarnings = { ...formData.earnings, [type]: value }
    const totalEarnings = Object.values(updatedEarnings).reduce(
      (sum, val) => sum + val,
      0
    )
    const totalDeductions = formData.deductions.personalLoans
    const newNetPay = totalEarnings - totalDeductions

    setFormData({
      ...formData,
      earnings: updatedEarnings,
      grossPay: totalEarnings,
      netPay: newNetPay,
    })
  }

  const handleDeductionChange = (type: string, value: number) => {
    if (!formData) return

    const updatedDeductions = { ...formData.deductions, [type]: value }
    const totalEarnings = Object.values(formData.earnings).reduce(
      (sum, val) => sum + val,
      0
    )
    const totalDeductions = updatedDeductions.personalLoans
    const newNetPay = totalEarnings - totalDeductions

    setFormData({
      ...formData,
      deductions: updatedDeductions,
      netPay: newNetPay,
    })
  }

  const handleSave = async () => {
    if (!formData) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSave(formData)
      toast.success("Employee payroll updated successfully")
      onClose()
    } catch {
      toast.error("Failed to update employee payroll")
    } finally {
      setIsLoading(false)
    }
  }

  const totalEarnings = Object.values(formData.earnings).reduce(
    (sum, val) => sum + val,
    0
  )
  const totalDeductions = formData.deductions.personalLoans

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 transform border-l bg-white shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-semibold">{employee.name}</h2>
            <p className="text-muted-foreground text-sm">
              Emp. ID: {employee.employeeId}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                Net Pay <CurrencyFormatter amount={formData.netPay} />
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Payable Days */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Payable Days</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={formData.paidDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paidDays: parseInt(e.target.value),
                  })
                }
                className="w-20"
              />
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add LOP
              </Button>
            </div>
          </div>

          {/* Earnings Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">
                (+) EARNINGS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Basic</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={formData.earnings.basic}
                    onChange={(e) =>
                      handleEarningChange(
                        "basic",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-32 text-right"
                  />
                  <CurrencyFormatter amount={formData.earnings.basic} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Housing Allowance</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={formData.earnings.housingAllowance}
                    onChange={(e) =>
                      handleEarningChange(
                        "housingAllowance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-32 text-right"
                  />
                  <CurrencyFormatter
                    amount={formData.earnings.housingAllowance}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Cost of Living Allowance</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={formData.earnings.costOfLivingAllowance}
                    onChange={(e) =>
                      handleEarningChange(
                        "costOfLivingAllowance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-32 text-right"
                  />
                  <CurrencyFormatter
                    amount={formData.earnings.costOfLivingAllowance}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Other Allowance</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={formData.earnings.otherAllowance}
                    onChange={(e) =>
                      handleEarningChange(
                        "otherAllowance",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-32 text-right"
                  />
                  <CurrencyFormatter
                    amount={formData.earnings.otherAllowance}
                  />
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Total Earnings</Label>
                  <span className="font-medium">
                    <CurrencyFormatter amount={totalEarnings} />
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-1 h-4 w-4" />
                Add Earning
              </Button>
            </CardContent>
          </Card>

          {/* Deductions Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">
                (-) DEDUCTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Deductions (General)
                </Label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Personal Loans</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={formData.deductions.personalLoans}
                        onChange={(e) =>
                          handleDeductionChange(
                            "personalLoans",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-32 text-right"
                      />
                      <CurrencyFormatter
                        amount={formData.deductions.personalLoans}
                      />
                    </div>
                  </div>

                  {formData.deductions.actualLoanAmount > 0 && (
                    <div className="text-muted-foreground flex items-center space-x-2 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        (Actual Amount:{" "}
                        <CurrencyFormatter
                          amount={formData.deductions.actualLoanAmount}
                        />
                        )
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Total Deductions
                  </Label>
                  <span className="font-medium">
                    <CurrencyFormatter amount={totalDeductions} />
                  </span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Plus className="mr-1 h-4 w-4" />
                Add Deduction
              </Button>
            </CardContent>
          </Card>

          {/* Net Pay Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-green-800">
                  NET PAY
                </Label>
                <span className="text-xl font-bold text-green-800">
                  <CurrencyFormatter amount={formData.netPay} />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="space-x-2 border-t p-6">
          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
