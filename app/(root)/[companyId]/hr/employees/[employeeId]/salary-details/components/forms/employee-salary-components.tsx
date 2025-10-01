"use client"

import { useEffect, useState } from "react"
import { ISalaryComponent } from "@/interfaces/payroll"
import {
  SalaryComponentFormData,
  employeeSalaryComponentSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { NumericFormat } from "react-number-format"

import { parseDate } from "@/lib/date-utils"
import { useSaveEmployeeSalaryDetails } from "@/hooks/use-employee"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurrencyFormatter } from "@/components/currency-icons/currency-formatter"

interface Props {
  employee?: ISalaryComponent
  onCancel?: () => void
  onSaveSuccess?: () => void
  employeeSalaryDetails: ISalaryComponent[]
}

export function SalaryComponentsForm({
  employee,
  onCancel,
  onSaveSuccess,
  employeeSalaryDetails,
}: Props) {
  const saveMutation = useSaveEmployeeSalaryDetails()

  // Create state for salary components to make them editable
  const [salaryComponents, setSalaryComponents] = useState<ISalaryComponent[]>(
    employeeSalaryDetails
  )

  const form = useForm<SalaryComponentFormData>({
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

  // Set form values for each component
  useEffect(() => {
    salaryComponents.forEach((component) => {
      form.setValue("amount", component.amount || 0)
    })
  }, [salaryComponents, form])

  // Handle monthly amount change
  const handleMonthlyAmountChange = (id: string, value: string) => {
    const newAmount = parseFloat(value) || 0

    setSalaryComponents((prevComponents) => {
      const updatedComponents = prevComponents.map((component) =>
        component.componentId.toString() === id
          ? { ...component, amount: newAmount }
          : component
      )
      return updatedComponents
    })
  }

  // Calculate total gross pay from the state
  const totalMonthly = salaryComponents.reduce(
    (sum, component) => sum + (component.amount || 0),
    0
  )
  const totalAnnual = totalMonthly * 12

  const onSubmit = (_data: SalaryComponentFormData) => {
    // Form submission logic if needed
  }

  const handleSaveClick = () => {
    // Send the updated salary components array directly
    saveMutation.mutate(salaryComponents)
  }

  // Watch for successful save and close dialog
  useEffect(() => {
    if (saveMutation.isSuccess && !saveMutation.isPending) {
      onSaveSuccess?.()
    }
  }, [saveMutation.isSuccess, saveMutation.isPending, onSaveSuccess])

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Salary Components Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] py-2 text-xs font-medium">
                      COMPONENT
                    </TableHead>
                    <TableHead className="w-[150px] py-2 text-xs font-medium">
                      TYPE
                    </TableHead>
                    <TableHead className="w-[150px] py-2 text-xs font-medium">
                      MONTHLY
                    </TableHead>
                    <TableHead className="w-[150px] py-2 text-xs font-medium">
                      ANNUAL
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryComponents.map((component) => (
                    <TableRow key={component.componentId}>
                      <TableCell className="py-2 text-sm font-medium">
                        {component.componentName}
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        {component.componentType}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="w-32">
                          <NumericFormat
                            value={
                              component.amount !== undefined
                                ? component.amount
                                : 0
                            }
                            onValueChange={(values) => {
                              const { floatValue } = values
                              const newAmount = floatValue || 0
                              handleMonthlyAmountChange(
                                component.componentId.toString(),
                                newAmount.toString()
                              )
                            }}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            allowLeadingZeros={true}
                            thousandSeparator={true}
                            allowNegative={false}
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring hide-number-spinners flex h-8 w-full rounded-md border px-2 py-1 text-right text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        {component.amount ? (
                          <CurrencyFormatter
                            amount={component.amount * 12}
                            size="sm"
                          />
                        ) : (
                          <CurrencyFormatter amount={0} size="sm" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total Gross Pay */}
                  <TableRow className="border-t-2">
                    <TableCell colSpan={2} className="py-2 text-sm font-bold">
                      Total Gross Pay
                    </TableCell>
                    <TableCell className="py-2 text-sm font-bold">
                      <CurrencyFormatter amount={totalMonthly} size="sm" />
                    </TableCell>
                    <TableCell className="py-2 text-sm font-bold">
                      <CurrencyFormatter amount={totalAnnual} size="sm" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Note Section */}
        <div className="text-muted-foreground text-xs">
          Note: Any changes made to the salary components will take effect in
          the current pay run, provided it is not Approved.
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" onClick={handleSaveClick}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
