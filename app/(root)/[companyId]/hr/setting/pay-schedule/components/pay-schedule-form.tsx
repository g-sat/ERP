"use client"

import { useEffect } from "react"
import { PayScheduleFormData, payScheduleSchema } from "@/schemas/payschedule"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PayScheduleFormProps {
  initialData?: PayScheduleFormData
  onSave: (data: PayScheduleFormData) => void
}

const DAYS_OF_WEEK = [
  { code: "MON", label: "Mon" },
  { code: "TUE", label: "Tue" },
  { code: "WED", label: "Wed" },
  { code: "THU", label: "Thu" },
  { code: "FRI", label: "Fri" },
  { code: "SAT", label: "Sat" },
  { code: "SUN", label: "Sun" },
]

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

export function PayScheduleForm({ initialData, onSave }: PayScheduleFormProps) {
  const form = useForm<PayScheduleFormData>({
    resolver: zodResolver(payScheduleSchema),
    defaultValues: {
      payscheduleId: initialData?.payscheduleId || 0,
      companyId: initialData?.companyId || 1,
      workWeek: initialData?.workWeek || "MON,TUE,WED,THU,FRI",
      isMonthly: initialData?.isMonthly ?? true,
      workingDaysPerMonth: initialData?.workingDaysPerMonth || 25,
      isPayOn: initialData?.isPayOn ?? true,
      payDayOfMonth: initialData?.payDayOfMonth || 3,
      firstPayPeriod: initialData?.firstPayPeriod || "",
      firstPayDate: initialData?.firstPayDate || "",
      isLocked: initialData?.isLocked || false,
    },
  })

  const watchIsPayOn = form.watch("isPayOn")
  const watchPayDayOfMonth = form.watch("payDayOfMonth")
  const watchIsLocked = form.watch("isLocked")

  // Clear first pay period when switching to "last working day"
  useEffect(() => {
    if (watchIsPayOn) {
      form.setValue("firstPayPeriod", "")
      form.setValue("firstPayDate", "")
    }
  }, [watchIsPayOn])

  // Refresh first pay period and pay date when day selection changes
  useEffect(() => {
    if (!watchIsPayOn) {
      // Clear both fields when day changes
      form.setValue("firstPayPeriod", "")
      form.setValue("firstPayDate", "")
    }
  }, [watchPayDayOfMonth, watchIsPayOn])

  const generateMonthOptions = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() // 0-based index
    const options = []

    // From current month to December of current year (future months only)
    for (let month = currentMonth; month < 12; month++) {
      const monthName = MONTHS[month]
      const monthNumber = (month + 1).toString().padStart(2, "0")
      const value = `${currentYear}-${monthNumber}-01`
      options.push({
        value,
        label: `${monthName} ${currentYear}`,
      })
    }

    return options
  }

  const generateDayOptions = () => {
    return Array.from({ length: 28 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }))
  }

  const generateWorkingDaysOptions = () => {
    return Array.from({ length: 11 }, (_, i) => ({
      value: (i + 20).toString(),
      label: (i + 20).toString(),
    }))
  }

  const generatePayDateOptions = (firstPayPeriod: string) => {
    if (!firstPayPeriod) return []

    const date = new Date(firstPayPeriod)
    if (isNaN(date.getTime())) return []

    const year = date.getFullYear()
    const month = date.getMonth()
    const isPayOn = form.getValues("isPayOn")
    const payDayOfMonth = form.getValues("payDayOfMonth")
    const options = []

    // Current month last day
    const currentMonthLastDay = new Date(year, month + 1, 0)
    const currentMonthName = MONTHS[month]
    options.push({
      value: format(currentMonthLastDay, "yyyy-MM-dd"),
      label: `Last day of ${currentMonthName} ${year} (${format(currentMonthLastDay, "dd MMM yyyy")})`,
    })

    // Next month last day
    const nextMonth = month + 1
    const nextMonthYear = nextMonth >= 12 ? year + 1 : year
    const actualNextMonth = nextMonth >= 12 ? 0 : nextMonth
    const nextMonthLastDay = new Date(nextMonthYear, actualNextMonth + 1, 0)
    const nextMonthName = MONTHS[actualNextMonth]

    options.push({
      value: format(nextMonthLastDay, "yyyy-MM-dd"),
      label: `Last day of ${nextMonthName} ${nextMonthYear} (${format(nextMonthLastDay, "dd MMM yyyy")})`,
    })

    // If specific day is selected, add that option
    if (!isPayOn && payDayOfMonth) {
      const specificDayDate = new Date(
        nextMonthYear,
        actualNextMonth,
        payDayOfMonth
      )
      options.push({
        value: format(specificDayDate, "yyyy-MM-dd"),
        label: `Day ${payDayOfMonth} of ${nextMonthName} ${nextMonthYear} (${format(specificDayDate, "dd MMM yyyy")})`,
      })
    }

    return options
  }

  const onSubmit = (data: PayScheduleFormData) => {
    onSave(data)
  }

  const toggleWorkingDay = (dayCode: string) => {
    const currentWorkWeek = form.getValues("workWeek") || ""
    const currentDays = currentWorkWeek.split(",").filter((day) => day.trim())

    const newDays = currentDays.includes(dayCode)
      ? currentDays.filter((day) => day.trim() !== dayCode)
      : [...currentDays, dayCode]

    form.setValue("workWeek", newDays.join(","))
  }

  const getSelectedDays = () => {
    const workWeek = form.getValues("workWeek") || ""
    return workWeek.split(",").filter((day) => day.trim())
  }

  return (
    <Form {...form}>
      <form
        id="pay-schedule-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Working Days Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Select your work week*</h3>
            <p className="text-muted-foreground text-sm">
              The days worked in a calendar week
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = getSelectedDays().includes(day.code)
              return (
                <Button
                  key={day.code}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => !watchIsLocked && toggleWorkingDay(day.code)}
                  disabled={watchIsLocked}
                  className="min-w-[60px]"
                >
                  {day.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Working Days Per Month Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Working days per month*</h3>
          </div>

          <FormField
            control={form.control}
            name="isMonthly"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) =>
                      !watchIsLocked && field.onChange(value === "true")
                    }
                    defaultValue={field.value ? "true" : "false"}
                    disabled={watchIsLocked}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="monthly" />
                      <FormLabel
                        htmlFor="monthly"
                        className="text-sm font-normal"
                      >
                        Actual days in a month
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="custom" />
                      <FormLabel
                        htmlFor="custom"
                        className="text-sm font-normal"
                      >
                        Organisation working days -
                      </FormLabel>
                      {!form.watch("isMonthly") && (
                        <Select
                          value={
                            form.getValues("workingDaysPerMonth")?.toString() ||
                            "25"
                          }
                          onValueChange={(value) =>
                            !watchIsLocked &&
                            form.setValue(
                              "workingDaysPerMonth",
                              parseInt(value)
                            )
                          }
                          disabled={watchIsLocked}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {generateWorkingDaysOptions().map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <span className="text-muted-foreground text-sm">
                        days per month
                      </span>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pay Day Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Pay on*</h3>
          </div>

          <FormField
            control={form.control}
            name="isPayOn"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={field.value ? "true" : "false"}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="lastWorkingDay" />
                      <FormLabel
                        htmlFor="lastWorkingDay"
                        className="text-sm font-normal"
                      >
                        the last working day of every month
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="specificDay" />
                      <FormLabel
                        htmlFor="specificDay"
                        className="text-sm font-normal"
                      >
                        day
                      </FormLabel>
                      {!watchIsPayOn && (
                        <Select
                          value={
                            form.getValues("payDayOfMonth")?.toString() || "3"
                          }
                          onValueChange={(value) =>
                            form.setValue("payDayOfMonth", parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {generateDayOptions().map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <span className="text-muted-foreground text-sm">
                        of every month
                      </span>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-muted-foreground text-sm">
            Note: When payday falls on a non-working day or a holiday, employees
            will get paid on the previous working day.
          </p>
        </div>

        {/* First Payroll Period Section - Only show when "day of every month" is selected */}
        {!watchIsPayOn && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">
                Start your first payroll from*
              </h3>
            </div>

            <FormField
              control={form.control}
              name="firstPayPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Clear the pay date when period changes
                        form.setValue("firstPayDate", "")
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select month and year" />
                      </SelectTrigger>
                      <SelectContent>
                        {generateMonthOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* First Pay Date Section - Only show when "day of every month" is selected and payroll period is selected */}
        {!watchIsPayOn && form.watch("firstPayPeriod") && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">
                Pay date for your first payroll*
              </h3>
              <p className="text-muted-foreground text-sm">
                Pay Period:{" "}
                {form.watch("firstPayPeriod")
                  ? format(
                      new Date(form.watch("firstPayPeriod") || ""),
                      "MMM yyyy"
                    )
                  : ""}
              </p>
            </div>

            <FormField
              control={form.control}
              name="firstPayDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                      }}
                    >
                      <SelectTrigger className="w-80">
                        <SelectValue placeholder="Select pay date" />
                      </SelectTrigger>
                      <SelectContent>
                        {(() => {
                          const firstPayPeriod =
                            form.getValues("firstPayPeriod")
                          return generatePayDateOptions(
                            firstPayPeriod || ""
                          ).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        })()}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  )
}
