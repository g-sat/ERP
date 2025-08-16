"use client"

import { useEffect, useState } from "react"
import { IEmployeeSalaryComponent } from "@/interfaces/payroll"
import {
  EmployeeSalaryComponentFormData,
  employeeSalaryComponentSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { parseDate } from "@/lib/format"
import { useSaveEmployeeSalaryDetails } from "@/hooks/use-employee"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  employee?: IEmployeeSalaryComponent
  onCancel?: () => void
  onSaveSuccess?: () => void
  employeeSalaryDetails: IEmployeeSalaryComponent[]
}

export function EmployeeSalaryComponentsForm({
  employee,
  onCancel,
  onSaveSuccess,
  employeeSalaryDetails,
}: Props) {
  const saveMutation = useSaveEmployeeSalaryDetails()

  // Create state for salary components to make them editable
  const [salaryComponents, setSalaryComponents] = useState<
    IEmployeeSalaryComponent[]
  >(employeeSalaryDetails)

  // Debug: Log initial state
  useEffect(() => {
    console.log("Initial employeeSalaryDetails:", employeeSalaryDetails)
    console.log("Initial salaryComponents state:", salaryComponents)
  }, [employeeSalaryDetails])

  const form = useForm<EmployeeSalaryComponentFormData>({
    resolver: zodResolver(employeeSalaryComponentSchema),
    defaultValues: {
      employeeId: employee?.employeeId || 0,
      componentId: employee?.componentId || 0,
      amount: employee?.amount || 0,
      effectiveFromDate: employee?.effectiveFromDate
        ? parseDate(employee?.effectiveFromDate as string) || new Date()
        : new Date(),
    },
  })

  // Handle monthly amount change
  const handleMonthlyAmountChange = (id: string, value: string) => {
    const newAmount = parseFloat(value) || 0
    console.log(
      "Changing amount for ID:",
      id,
      "New value:",
      value,
      "Parsed amount:",
      newAmount
    )

    setSalaryComponents((prevComponents) => {
      const updatedComponents = prevComponents.map((component) =>
        component.componentId.toString() === id
          ? { ...component, amount: newAmount }
          : component
      )
      console.log("Updated components:", updatedComponents)
      return updatedComponents
    })
  }

  // Calculate total gross pay from the state
  const totalMonthly = salaryComponents.reduce(
    (sum, component) => sum + (component.amount || 0),
    0
  )
  const totalAnnual = totalMonthly * 12

  const onSubmit = (data: EmployeeSalaryComponentFormData) => {
    console.log("✅ onSubmit function called!")
    console.log("Form data:", data)
    console.log("Updated salary components from table:", salaryComponents)
  }

  const handleSaveClick = () => {
    console.log("🔘 Save button clicked!")
    console.log("Current salary components:", salaryComponents)

    // Send the updated salary components array directly
    saveMutation.mutate(salaryComponents)
  }

  // Watch for successful save and close dialog
  useEffect(() => {
    if (saveMutation.isSuccess && !saveMutation.isPending) {
      console.log("✅ Save successful! Closing dialog...")
      onSaveSuccess?.()
    }
  }, [saveMutation.isSuccess, saveMutation.isPending, onSaveSuccess])

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Salary Components Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">SALARY COMPONENTS</TableHead>
                  <TableHead className="w-[200px]">CALCULATION TYPE</TableHead>
                  <TableHead className="w-[200px]">MONTHLY AMOUNT</TableHead>
                  <TableHead className="w-[200px]">ANNUAL AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryComponents.map((component) => (
                  <TableRow key={component.componentId}>
                    <TableCell className="font-medium">
                      {component.componentName}
                    </TableCell>
                    <TableCell>{component.componentType}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={
                          component.amount !== undefined
                            ? component.amount.toFixed(2)
                            : "0.00"
                        }
                        onChange={(e) => {
                          console.log("Input changed:", e.target.value)
                          handleMonthlyAmountChange(
                            component.componentId.toString(),
                            e.target.value
                          )
                        }}
                        className="w-48 text-right"
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      {component.amount
                        ? (component.amount * 12).toLocaleString()
                        : "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Gross Pay */}
                <TableRow className="font-semibold">
                  <TableCell colSpan={2} className="font-semibold">
                    Total Gross Pay
                  </TableCell>
                  <TableCell className="font-semibold">
                    AED {totalMonthly.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    AED {totalAnnual.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Note Section */}
        <div className="text-sm text-gray-600">
          Note: Any changes made to the salary components will take effect in
          the current pay run, provided it is not Approved.
        </div>

        {/* Action Buttons */}
        <div className="flex justify-start space-x-2">
          <Button type="button" onClick={handleSaveClick}>
            Save
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
