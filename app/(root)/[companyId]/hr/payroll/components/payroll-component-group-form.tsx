"use client"

import { useState } from "react"
import { IPayrollComponentGroup } from "@/interfaces/payroll"
import {
  PayrollComponentGroupFormData,
  payrollComponentGroupSchema,
} from "@/schemas/payroll"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"

interface PayrollComponentGroupFormProps {
  onSubmit: (data: PayrollComponentGroupFormData) => void
  onCancel: () => void
  initialData?: IPayrollComponentGroup
}

interface SelectedComponent {
  payrollComponentId: number
  payrollGroupId?: number
}

export function PayrollComponentGroupForm({
  onSubmit,
  onCancel,
  initialData,
}: PayrollComponentGroupFormProps) {
  const form = useForm<PayrollComponentGroupFormData>({
    resolver: zodResolver(payrollComponentGroupSchema),
    defaultValues: {
      groupId: initialData?.componentGroupId || 0,
      groupCode: initialData?.groupCode || "",
      groupName: initialData?.groupName || "",
      remarks: initialData?.remarks || "",
      isActive: initialData?.isActive ?? true,
      data_details: initialData?.data_details.map((detail, index) => ({
        payrollComponentId: detail.payrollComponentId,
        payrollGroupId: initialData?.componentGroupId || 0,
        sortOrder: index + 1,
      })),
    },
  })

  const [selectedComponents, setSelectedComponents] = useState<
    SelectedComponent[]
  >(
    initialData?.data_details?.map((component) => ({
      payrollComponentId: component.payrollComponentId,
      payrollGroupId: initialData?.componentGroupId,
    })) || []
  )

  const handleSubmit = (data: PayrollComponentGroupFormData) => {
    // Log the selected components with their details for debugging
    console.log("Selected components with details:", selectedComponents)

    onSubmit({
      ...data,
      data_details: selectedComponents.map((sc, index) => ({
        payrollComponentId: sc.payrollComponentId,
        payrollGroupId: sc.payrollGroupId || 0,
        sortOrder: index + 1,
      })),
    })
  }

  const handleComponentToggle = (componentId: number, checked: boolean) => {
    if (checked) {
      setSelectedComponents((prev) => [
        ...prev,
        {
          payrollComponentId: componentId,
          payrollGroupId: initialData?.componentGroupId,
        },
      ])
    } else {
      setSelectedComponents((prev) =>
        prev.filter((item) => item.payrollComponentId !== componentId)
      )
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComponents(
        initialData?.data_details?.map((comp) => ({
          payrollComponentId: comp.payrollComponentId,
          payrollGroupId: initialData?.componentGroupId,
        })) || []
      )
    } else {
      setSelectedComponents([])
    }
  }

  const isAllSelected =
    (initialData?.data_details?.length || 0) > 0 &&
    selectedComponents.length === (initialData?.data_details?.length || 0)
  const isIndeterminate =
    selectedComponents.length > 0 &&
    selectedComponents.length < (initialData?.data_details?.length || 0)

  const isComponentSelected = (componentId: number) => {
    return selectedComponents.some(
      (sc) => sc.payrollComponentId === componentId
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Top Section - Group Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <CustomInput
                form={form}
                label="Group Code"
                name="groupCode"
                isRequired={true}
                isDisabled={false}
              />

              <CustomInput
                form={form}
                label="Group Name"
                name="groupName"
                placeholder="e.g., BASIC_GROUP, ALLOWANCE_GROUP"
                isRequired={true}
                isDisabled={false}
              />

              <CustomInput
                form={form}
                label="Remarks"
                name="remarks"
                isRequired={true}
                isDisabled={false}
              />

              <CustomSwitch
                form={form}
                label="Active"
                name="isActive"
                isRequired={false}
                isDisabled={false}
              />
            </div>
          </div>

          {/* Bottom Section - Components Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Select Components</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {isIndeterminate
                    ? "Partially Selected"
                    : "Select All Components"}
                </label>
              </div>
            </div>
            <Badge variant="secondary">
              {selectedComponents.length} of {initialData?.data_details.length}{" "}
              selected
            </Badge>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Component Code</TableHead>
                    <TableHead>Component Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialData?.data_details.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-muted-foreground text-center"
                      >
                        No components available
                      </TableCell>
                    </TableRow>
                  ) : (
                    initialData?.data_details.map((component) => (
                      <TableRow key={component.payrollComponentId}>
                        <TableCell>
                          <Checkbox
                            checked={isComponentSelected(
                              component.payrollComponentId
                            )}
                            onCheckedChange={(checked) =>
                              handleComponentToggle(
                                component.payrollComponentId,
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {component.componentCode}
                        </TableCell>
                        <TableCell>{component.componentName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              component.componentType === "EARNING"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {component.componentType}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Group" : "Create Group"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
