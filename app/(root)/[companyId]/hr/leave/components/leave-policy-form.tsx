"use client"

import { useState } from "react"
import { ILeavePolicy, LeavePolicyFormData } from "@/interfaces/leave"
import { leavePolicyFormDataSchema } from "@/schemas/leave"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Plus, Settings } from "lucide-react"
import { useForm } from "react-hook-form"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface LeavePolicyFormProps {
  policies: ILeavePolicy[]
  onSubmit: (data: LeavePolicyFormData) => Promise<void>
  onEdit?: (policy: ILeavePolicy) => void
}

export function LeavePolicyForm({
  policies,
  onSubmit,
  onEdit,
}: LeavePolicyFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<ILeavePolicy | null>(
    null
  )

  const form = useForm<LeavePolicyFormData>({
    resolver: zodResolver(leavePolicyFormDataSchema),
    defaultValues: {
      companyId: "1",
      leaveTypeId: 1,
      name: "",
      description: "",
      defaultDays: 0,
      maxDays: 30,
      minDays: 0,
      advanceNoticeDays: 0,
      maxConsecutiveDays: 30,
      requiresApproval: true,
      requiresDocument: false,
      isActive: true,
    },
  })

  const handleSubmit = async (data: LeavePolicyFormData) => {
    try {
      setLoading(true)
      await onSubmit(data)
      setOpen(false)
      form.reset()
      setSelectedPolicy(null)
    } catch (error) {
      console.error("Failed to submit leave policy:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (policy: ILeavePolicy) => {
    setSelectedPolicy(policy)
    form.reset({
      companyId: policy.companyId.toString(),
      leaveTypeId: policy.leaveTypeId,
      name: policy.name,
      description: policy.description || "",
      defaultDays: policy.defaultDays,
      maxDays: policy.maxDays,
      minDays: policy.minDays,
      advanceNoticeDays: policy.advanceNoticeDays,
      maxConsecutiveDays: policy.maxConsecutiveDays,
      requiresApproval: policy.requiresApproval,
      requiresDocument: policy.requiresDocument,
      isActive: policy.isActive,
    })
    setOpen(true)
  }

  const getLeaveTypeColor = (typeId: number) => {
    const policy = policies.find((p) => p.leaveTypeId === typeId)
    const typeName = policy?.name || `Type ${typeId}`

    switch (typeName.toLowerCase()) {
      case "annual leave":
        return "bg-green-100 text-green-800 border-green-200"
      case "sick leave":
        return "bg-red-100 text-red-800 border-red-200"
      case "casual leave":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "maternity leave":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "bereavement leave":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Policy List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => (
          <Card key={policy.leavePolicyId} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{policy.name}</CardTitle>
                <Badge variant={policy.isActive ? "default" : "secondary"}>
                  {policy.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Badge
                  variant="outline"
                  className={getLeaveTypeColor(policy.leaveTypeId)}
                >
                  Type ID: {policy.leaveTypeId}
                </Badge>
                {policy.description && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    {policy.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Default:</span>
                  <div className="font-medium">{policy.defaultDays} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Max:</span>
                  <div className="font-medium">{policy.maxDays} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Min:</span>
                  <div className="font-medium">{policy.minDays} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Notice:</span>
                  <div className="font-medium">
                    {policy.advanceNoticeDays} days
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Consecutive:</span>
                  <div className="font-medium">
                    {policy.maxConsecutiveDays} days
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Approval:</span>
                  <div className="font-medium">
                    {policy.requiresApproval ? "Required" : "Not Required"}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(policy)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(policy)}
                  >
                    <Settings className="mr-1 h-4 w-4" />
                    Settings
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Policy Button */}
      <div className="flex justify-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leaveTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter leave type ID"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter policy name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter policy description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="defaultDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="advanceNoticeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Advance Notice Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
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
                  name="maxConsecutiveDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Consecutive Days</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requiresApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Requires Approval
                          </FormLabel>
                          <div className="text-muted-foreground text-sm">
                            Whether this leave type requires approval
                          </div>
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
                    name="requiresDocument"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Requires Document
                          </FormLabel>
                          <div className="text-muted-foreground text-sm">
                            Whether this leave type requires documentation
                          </div>
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

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-muted-foreground text-sm">
                          Whether this policy is currently active
                        </div>
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

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false)
                      setSelectedPolicy(null)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? "Saving..."
                      : selectedPolicy
                        ? "Update Policy"
                        : "Create Policy"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
