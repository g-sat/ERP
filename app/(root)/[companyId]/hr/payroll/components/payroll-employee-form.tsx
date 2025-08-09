"use client"

import { useState } from "react"
import { IPayrollEmployee } from "@/interfaces/payroll"
import {
  PayrollEmployeeFormData,
  payrollEmployeeSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator, Download, Plus, Trash2, Upload } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface PayrollEmployeeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PayrollEmployeeFormData) => void
  initialData?: IPayrollEmployee
  isSubmitting?: boolean
}

export function PayrollEmployeeForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: PayrollEmployeeFormProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState("employee")

  const form = useForm<PayrollEmployeeFormData>({
    resolver: zodResolver(payrollEmployeeSchema),
    defaultValues: {
      payrollEmployeeId: initialData?.payrollEmployeeId ?? 0,
      employeeId: initialData?.employeeId ?? 0,
      payrollPeriodId: initialData?.payrollPeriodId ?? 0,
      totalEarnings: initialData?.totalEarnings ?? 0,
      totalDeductions: initialData?.totalDeductions ?? 0,
      netSalary: initialData?.netSalary ?? 0,
      remarks: initialData?.remarks ?? "",
      data_details: initialData?.data_details ?? [
        {
          payrollEmployeeId: 0,
          payrollComponentId: 0,
          amount: 0,
          remarks: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "data_details",
  })

  const handleSubmit = (data: PayrollEmployeeFormData) => {
    // Ensure all components have the correct payrollEmployeeId
    const updatedData = {
      ...data,
      data_details: data.data_details.map((component) => ({
        ...component,
        payrollEmployeeId: data.payrollEmployeeId,
      })),
    }
    onSubmit(updatedData)
  }

  const handleCalculateNetSalary = () => {
    const totalEarnings = form.getValues("totalEarnings") || 0
    const totalDeductions = form.getValues("totalDeductions") || 0
    const netSalary = totalEarnings - totalDeductions

    form.setValue("netSalary", netSalary)
    toast.success("Net salary calculated successfully!")
  }

  const handleAutoCalculate = () => {
    setIsCalculating(true)

    // Simulate calculation process
    setTimeout(() => {
      const totalEarnings = Math.floor(Math.random() * 10000) + 5000 // Random between 5000-15000
      const totalDeductions = Math.floor(Math.random() * 2000) + 500 // Random between 500-2500
      const netSalary = totalEarnings - totalDeductions

      form.setValue("totalEarnings", totalEarnings)
      form.setValue("totalDeductions", totalDeductions)
      form.setValue("netSalary", netSalary)

      setIsCalculating(false)
      toast.success("Payroll calculated automatically!")
    }, 1500)
  }

  const handleAddComponent = () => {
    append({
      payrollEmployeeId: form.getValues("payrollEmployeeId") || 0,
      payrollComponentId: 0,
      amount: 0,
      remarks: "",
    })
  }

  const handleRemoveComponent = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    } else {
      toast.error("At least one component is required")
    }
  }

  const handleCalculateFromComponents = () => {
    const components = form.getValues("data_details") || []
    let totalEarnings = 0
    const totalDeductions = 0

    components.forEach((component) => {
      if (component.amount > 0) {
        // This is a simplified calculation - in real app, you'd check component type
        totalEarnings += component.amount
      }
    })

    const netSalary = totalEarnings - totalDeductions

    form.setValue("totalEarnings", totalEarnings)
    form.setValue("totalDeductions", totalDeductions)
    form.setValue("netSalary", netSalary)

    toast.success("Calculated from components!")
  }

  const calculateTotalAmount = () => {
    const components = form.getValues("data_details") || []
    return components.reduce(
      (total, component) => total + (component.amount || 0),
      0
    )
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
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Payroll Employee" : "Add Payroll Employee"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update payroll employee information and components"
              : "Add new payroll employee data with components"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Employee Data</TabsTrigger>
                <TabsTrigger value="components">
                  Components ({fields.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employee" className="space-y-4">
                {/* Employee Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employeeId"
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
                        name="payrollPeriodId"
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
                        name="totalEarnings"
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
                        name="totalDeductions"
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
                        name="netSalary"
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
                        onClick={handleCalculateNetSalary}
                        className="flex-1"
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculate Net Salary
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAutoCalculate}
                        disabled={isCalculating}
                        className="flex-1"
                      >
                        {isCalculating ? "Calculating..." : "Auto Calculate"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCalculateFromComponents}
                        className="flex-1"
                      >
                        Calculate from Components
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="remarks"
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
              </TabsContent>

              <TabsContent value="components" className="space-y-4">
                {/* Components Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Payroll Components</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Total Amount:
                        </span>
                        <Badge variant="secondary">
                          ${calculateTotalAmount().toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddComponent}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Component
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
                                Component {index + 1}
                                <Badge variant="secondary" className="ml-2">
                                  {form.watch(
                                    `data_details.${index}.payrollComponentId`
                                  ) || "No ID"}
                                </Badge>
                              </CardTitle>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveComponent(index)}
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
                                name={`data_details.${index}.payrollComponentId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Payroll Component ID</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Enter component ID"
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
                                name={`data_details.${index}.amount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
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

                            <FormField
                              control={form.control}
                              name={`data_details.${index}.remarks`}
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
