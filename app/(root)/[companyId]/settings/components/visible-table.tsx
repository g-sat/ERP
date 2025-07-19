"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  useVisibleFieldSave,
  useVisibleFieldbyidGet,
} from "@/hooks/use-settings"
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
import ModuleAutocomplete from "@/components/ui-custom/autocomplete-module"

interface IVisibleField {
  moduleId: number
  moduleName: string
  transactionId: number
  transactionName: string
  m_ProductId: boolean
  m_QTY: boolean
  m_BillQTY: boolean
  m_UomId: boolean
  m_UnitPrice: boolean
  m_Remarks: boolean
  m_GstId: boolean
  m_DeliveryDate: boolean
  m_DepartmentId: boolean
  m_EmployeeId: boolean
  m_PortId: boolean
  m_VesselId: boolean
  m_BargeId: boolean
  m_VoyageId: boolean
  m_SupplyDate: boolean
  m_BankId: boolean
  m_CtyCurr: boolean
}

export function VisibleTable() {
  const form = useForm()
  const [selectedModule, setSelectedModule] = useState<{
    moduleId: number
    moduleName: string
  } | null>(null)
  const [visibleFields, setVisibleFields] = useState<IVisibleField[]>([])
  const [saving, setSaving] = useState(false)

  // Fetch visible fields for selected module
  const {
    data: visibleFieldsResponse,
    refetch: refetchVisibleFields,
    isFetching: isFieldsLoading,
  } = useVisibleFieldbyidGet(selectedModule?.moduleId || 0)

  // Save visible fields mutation
  const visibleFieldSave = useVisibleFieldSave()

  // Update visibleFields when response changes
  useEffect(() => {
    if (visibleFieldsResponse?.data) {
      setVisibleFields(visibleFieldsResponse.data)
    } else {
      setVisibleFields([])
    }
  }, [visibleFieldsResponse])

  // When module changes, refetch fields
  useEffect(() => {
    if (selectedModule?.moduleId) {
      refetchVisibleFields()
    } else {
      setVisibleFields([])
    }
  }, [selectedModule?.moduleId, refetchVisibleFields])

  const handleFieldChange = (
    field: IVisibleField,
    key: string,
    checked: boolean
  ) => {
    setVisibleFields((prev) =>
      prev.map((f) =>
        f.moduleId === field.moduleId && f.transactionId === field.transactionId
          ? { ...f, [key]: checked }
          : f
      )
    )
  }

  const handleSave = async () => {
    if (!selectedModule) {
      toast.error("Please select a module first")
      return
    }

    try {
      setSaving(true)
      const response = await visibleFieldSave.mutateAsync({
        data: visibleFields.map((field) => ({
          ...field,
          moduleId: selectedModule.moduleId,
        })),
      })

      if (response.result === 1) {
        toast.success("Visible fields saved successfully")
        refetchVisibleFields()
      } else {
        toast.error(response.message || "Failed to save visible fields")
      }
    } catch (error) {
      console.error("Error saving visible fields:", error)
      toast.error("Failed to save visible fields")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => refetchVisibleFields())}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-end gap-4">
              <div className="w-64">
                <ModuleAutocomplete
                  form={form}
                  name="moduleId"
                  onChangeEvent={(module) =>
                    setSelectedModule(
                      module
                        ? {
                            moduleId: module.moduleId,
                            moduleName: module.moduleName,
                          }
                        : null
                    )
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                type="submit"
                disabled={isFieldsLoading}
              >
                {isFieldsLoading ? "Loading..." : "Search"}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !selectedModule}
              size="sm"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Module Name</TableHead>
              <TableHead className="w-[150px]">Transaction Name</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>QTY</TableHead>
              <TableHead>Bill QTY</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Port</TableHead>
              <TableHead>Vessel</TableHead>
              <TableHead>Barge</TableHead>
              <TableHead>Voyage</TableHead>
              <TableHead>Supply Date</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>City Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFieldsLoading ? (
              <TableRow>
                <TableCell colSpan={19} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : visibleFields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={19} className="text-center">
                  No visible fields found. Please select a module.
                </TableCell>
              </TableRow>
            ) : (
              visibleFields.map((field, index) => (
                <TableRow key={index}>
                  <TableCell>{field.moduleName}</TableCell>
                  <TableCell>{field.transactionName}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_ProductId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_ProductId",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_QTY}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field, "m_QTY", checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_BillQTY}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_BillQTY",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_UomId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field, "m_UomId", checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_UnitPrice}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_UnitPrice",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_Remarks}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_Remarks",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_GstId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field, "m_GstId", checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_DeliveryDate}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_DeliveryDate",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_DepartmentId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_DepartmentId",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_EmployeeId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_EmployeeId",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_PortId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field, "m_PortId", checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_VesselId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_VesselId",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_BargeId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_BargeId",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_VoyageId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_VoyageId",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_SupplyDate}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_SupplyDate",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_BankId}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field, "m_BankId", checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={field.m_CtyCurr}
                      onCheckedChange={(checked) =>
                        handleFieldChange(
                          field,
                          "m_CtyCurr",
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
