"use client"

import { IPayrollComponent } from "@/interfaces/payroll"
import { PayrollComponentFormValues } from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayrollComponentFormProps {
  onSubmit: (data: z.infer<typeof PayrollComponentFormValues>) => void
  initialData?: IPayrollComponent
  onCancel: () => void
}

export function PayrollComponentForm({
  onSubmit,
  initialData,
  onCancel,
}: PayrollComponentFormProps) {
  const form = useForm<z.infer<typeof PayrollComponentFormValues>>({
    resolver: zodResolver(PayrollComponentFormValues),
    defaultValues: {
      componentCode: initialData?.componentCode || "",
      componentName: initialData?.componentName || "",
      componentType: initialData?.componentType || "EARNING",
      isTaxable: initialData?.isTaxable ?? false,
      isOvertime: initialData?.isOvertime ?? false,
      isBonus: initialData?.isBonus ?? false,
      isCommission: initialData?.isCommission ?? false,
      isLeave: initialData?.isLeave ?? false,
      isLate: initialData?.isLate ?? false,
      isSocialInsurance: initialData?.isSocialInsurance ?? false,
      calculationType: initialData?.calculationType || "FIXED",
      calculationValue: initialData?.calculationValue || undefined,
      calculationFormula: initialData?.calculationFormula || "",
      sortOrder: initialData?.sortOrder || 1,
      remarks: initialData?.remarks || "",
      isActive: initialData?.isActive ?? true,
    },
  })

  const handleSubmit = (data: z.infer<typeof PayrollComponentFormValues>) => {
    onSubmit(data)
  }

  const componentType = form.watch("componentType")
  const calculationType = form.watch("calculationType")

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="componentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., BASIC, HOUSING, OVERTIME"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Unique code for the payroll component
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="componentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Basic Salary, Housing Allowance"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Display name for the component
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="componentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select component type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EARNING">Earning</SelectItem>
                      <SelectItem value="DEDUCTION">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Whether this component adds to or subtracts from salary
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Order in which this component appears in payroll
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="calculationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calculation Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calculation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FORMULA">Formula</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How the component amount is calculated
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {calculationType !== "FORMULA" && (
              <FormField
                control={form.control}
                name="calculationValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {calculationType === "FIXED"
                        ? "Fixed Amount"
                        : "Percentage"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={
                          calculationType === "FIXED" ? "0.00" : "0.00%"
                        }
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {calculationType === "FIXED"
                        ? "Fixed amount in AED"
                        : "Percentage of base salary"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isTaxable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Taxable</FormLabel>
                    <FormDescription>
                      Whether this component is subject to tax
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this component for use
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {calculationType === "FORMULA" && (
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="calculationFormula"
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Calculation Formula</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., BASIC_SALARY * 0.25 + 500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mathematical formula using other component codes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {componentType === "EARNING" && (
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="isOvertime"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Overtime</FormLabel>
                      <FormDescription>
                        Special handling for overtime calculations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isBonus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Bonus</FormLabel>
                      <FormDescription>
                        Special handling for bonus calculations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isCommission"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Commission</FormLabel>
                      <FormDescription>
                        Special handling for commission calculations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          {componentType === "DEDUCTION" && (
            <div className="grid grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="isLeave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Leave Deduction
                      </FormLabel>
                      <FormDescription>
                        Special handling for leave deductions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isLate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Late Deduction
                      </FormLabel>
                      <FormDescription>
                        Special handling for late arrival deductions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSocialInsurance"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Social Insurance
                      </FormLabel>
                      <FormDescription>
                        Special handling for social insurance deductions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem className="col-span-4">
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes or remarks..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about this component
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Component" : "Create Component"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
