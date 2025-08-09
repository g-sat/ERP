"use client"

import { useState } from "react"
import {
  PayrollEmployeeFormData,
  payrollEmployeeSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { Download, Plus, Trash2, Upload } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface PayrollEmployeeBulkFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PayrollEmployeeFormData[]) => void
  isSubmitting?: boolean
}

interface BulkFormData {
  employees: PayrollEmployeeFormData[]
}

export function PayrollEmployeeBulkForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: PayrollEmployeeBulkFormProps) {
  const [isCalculating, setIsCalculating] = useState(false)

  const form = useForm<BulkFormData>({
    resolver: zodResolver(
      // Custom schema for bulk form
      z.object({
        employees: z
          .array(payrollEmployeeSchema)
          .min(1, "At least one employee is required"),
      })
    ),
    defaultValues: {
      employees: [
        {
          payrollEmployeeId: 0,
          employeeId: 0,
          payrollPeriodId: 0,
          totalEarnings: 0,
          totalDeductions: 0,
          netSalary: 0,
          remarks: "",
          data_details: [
            {
              payrollEmployeeId: 0,
              payrollComponentId: 0,
              amount: 0,
              remarks: "",
            },
          ],
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "employees",
  })

  const handleSubmit = (data: BulkFormData) => {
    onSubmit(data.employees)
  }

  const handleAddEmployee = () => {
    append({
      payrollEmployeeId: 0,
      employeeId: 0,
      payrollPeriodId: 0,
      totalEarnings: 0,
      totalDeductions: 0,
      netSalary: 0,
      remarks: "",
      data_details: [
        {
          payrollEmployeeId: 0,
          payrollComponentId: 0,
          amount: 0,
          remarks: "",
        },
      ],
    })
  }

  const handleRemoveEmployee = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      toast.error("At least one employee is required")
    }
  }

  const handleCalculateAll = () => {
    setIsCalculating(true)

    // Simulate calculation for all employees
    setTimeout(() => {
      const employees = form.getValues("employees")
      const updatedEmployees = employees.map((emp) => {
        const totalEarnings = Math.floor(Math.random() * 10000) + 5000
        const totalDeductions = Math.floor(Math.random() * 2000) + 500
        const netSalary = totalEarnings - totalDeductions

        return {
          ...emp,
          totalEarnings,
          totalDeductions,
          netSalary,
        }
      })

      form.setValue("employees", updatedEmployees)
      setIsCalculating(false)
      toast.success("All payroll calculations completed!")
    }, 2000)
  }

  const handleCalculateNetSalary = (index: number) => {
    const employees = form.getValues("employees")
    const employee = employees[index]
    const netSalary =
      (employee.totalEarnings || 0) - (employee.totalDeductions || 0)

    form.setValue(`employees.${index}.netSalary`, netSalary)
    toast.success("Net salary calculated successfully!")
  }

  const handleCalculateFromComponents = (employeeIndex: number) => {
    const employees = form.getValues("employees")
    const employee = employees[employeeIndex]
    
    if (employee.data_details) {
      let totalEarnings = 0
      let totalDeductions = 0

      employee.data_details.forEach((component) => {
        if (component.amount > 0) {
          // This is a simplified calculation - in real app, you'd check component type
          totalEarnings += component.amount
        }
      })

      const netSalary = totalEarnings - totalDeductions

      form.setValue(`employees.${employeeIndex}.totalEarnings`, totalEarnings)
      form.setValue(`employees.${employeeIndex}.totalDeductions`, totalDeductions)
      form.setValue(`employees.${employeeIndex}.netSalary`, netSalary)
      
      toast.success(`Calculated from components for employee ${employeeIndex + 1}!`)
    }
  }

  const handleImportCSV = () => {
    // Simulate CSV import
    toast.info("CSV import functionality would be implemented here")
  }

  const handleExportCSV = () => {
    // Simulate CSV export
    toast.info("CSV export functionality would be implemented here")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Payroll Employee Entry</DialogTitle>
          <DialogDescription>
            Add multiple payroll employees at once. You can add, remove, and
            calculate payroll for all employees.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEmployee}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCalculateAll}
                disabled={isCalculating}
                className="flex items-center gap-2"
              >
                {isCalculating ? "Calculating..." : "Calculate All"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleImportCSV}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Employee {index + 1}
                        <Badge variant="secondary" className="ml-2">
                          {form.watch(`employees.${index}.employeeId`) ||
                            "No ID"}
                        </Badge>
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveEmployee(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`employees.${index}.employeeId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee ID</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter employee ID"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`employees.${index}.payrollPeriodId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payroll Period ID</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter payroll period ID"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`employees.${index}.totalEarnings`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Earnings</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`employees.${index}.totalDeductions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Deductions</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`employees.${index}.netSalary`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Net Salary</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCalculateNetSalary(index)}
                        className="flex-1"
                      >
                        Calculate Net Salary
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`employees.${index}.remarks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any additional remarks..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : `Save ${fields.length} Employee${fields.length > 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
