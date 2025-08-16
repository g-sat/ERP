"use client"

import { useCallback, useState } from "react"
import { IPaySchedule } from "@/interfaces/payschedule"
import { PayScheduleFormData } from "@/schemas/payschedule"
import { Edit, Lightbulb } from "lucide-react"

import { PaySchedule } from "@/lib/api-routes"
import { useGet, usePersist } from "@/hooks/use-common"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { PayScheduleForm } from "./components/pay-schedule-form"

export default function PaySchedulePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<IPaySchedule | null>(null)

  const {
    data: payScheduleData,
    isLoading,
    refetch,
  } = useGet(PaySchedule.get, "payschedule")

  console.log("payScheduleData", payScheduleData)
  const paySchedule = payScheduleData?.data as unknown as IPaySchedule
  console.log("paySchedule", paySchedule)

  const createMutation = usePersist(PaySchedule.add)

  const openEdit = useCallback((item: IPaySchedule) => {
    setEditingItem(item)
    setDialogOpen(true)
  }, [])

  const handleSave = useCallback(
    (values: PayScheduleFormData) => {
      createMutation.mutate(values, {
        onSuccess: () => {
          setDialogOpen(false)
          setEditingItem(null)
          refetch()
        },
      })
    },
    [editingItem, createMutation, refetch]
  )

  return (
    <>
      {isLoading ? (
        <DataTableSkeleton columnCount={5} />
      ) : (
        <div className="space-y-6">
          {/* Warning Banner */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Note: Pay Schedule cannot be edited once you process the first pay
              run.
            </AlertDescription>
          </Alert>

          {/* Current Schedule */}
          <div className="bg-card rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                This Organization&apos;s payroll runs on this schedule.
              </h3>
              {paySchedule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(paySchedule)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>

            {paySchedule ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Pay Frequency
                  </p>
                  <p className="text-base">
                    {paySchedule.isMonthly ? "Every month" : "Custom frequency"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Working Days
                  </p>
                  <p className="text-base">
                    {paySchedule.workWeek
                      ? paySchedule.workWeek.split(",").join(", ")
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Pay Day
                  </p>
                  <p className="text-base">
                    {paySchedule.isPayOn
                      ? "Last working day of every month"
                      : `${paySchedule.payDayOfMonth}${getDaySuffix(paySchedule.payDayOfMonth || 0)} of every month`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    First Pay Period
                  </p>
                  <p className="text-base">
                    {typeof paySchedule.firstPayPeriod === "string"
                      ? paySchedule.firstPayPeriod
                      : paySchedule.firstPayPeriod}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    First Pay Date
                  </p>
                  <p className="text-base">
                    {typeof paySchedule.firstPayDate === "string"
                      ? paySchedule.firstPayDate
                      : paySchedule.firstPayDate}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Working Days Per Month
                  </p>
                  <p className="text-base">
                    {paySchedule.workingDaysPerMonth || "Not specified"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No pay schedule configured yet.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  Configure Pay Schedule
                </Button>
              </div>
            )}
          </div>

          {/* Upcoming Payrolls */}
          {paySchedule && (
            <div className="bg-card rounded-lg border p-6">
              <h3 className="mb-4 text-lg font-semibold">Upcoming Payrolls</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b py-2">
                  <span className="font-medium">May-2025</span>
                  <span className="text-muted-foreground">
                    Pay Date: 03 Jun 2025
                  </span>
                </div>
                <div className="flex items-center justify-between border-b py-2">
                  <span className="font-medium">June-2025</span>
                  <span className="text-muted-foreground">
                    Pay Date: 03 Jul 2025
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDialogOpen(false)
            setEditingItem(null)
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-4xl overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Pay Schedule" : "Configure Pay Schedule"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update pay schedule configuration"
                : "Set up your organization's pay schedule"}
            </DialogDescription>
          </DialogHeader>

          <PayScheduleForm
            initialData={editingItem as PayScheduleFormData}
            onSave={handleSave}
          />

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-red-600">All fields are mandatory</p>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingItem(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="pay-schedule-form"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? "Saving..."
                  : editingItem
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}
