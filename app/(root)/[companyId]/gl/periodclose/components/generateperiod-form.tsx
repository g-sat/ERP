"use client"

import { useEffect } from "react"
import { IGeneratePeriodRequest } from "@/interfaces"
import {
  GeneratePeriodFormValues,
  generatePeriodSchema,
} from "@/schemas/gl-periodclose"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useFutureYearLookup } from "@/hooks/use-lookup"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"
import {
  FutureYearAutocomplete,
  MonthAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"

interface GeneratePeriodFormProps {
  onGenerate: (data: IGeneratePeriodRequest) => Promise<void>
  isGenerating?: boolean
}

export function GeneratePeriodForm({
  onGenerate,
  isGenerating = false,
}: GeneratePeriodFormProps) {
  // Fetch future year options
  const { data: futureYears = [] } = useFutureYearLookup()

  const form = useForm<GeneratePeriodFormValues>({
    resolver: zodResolver(generatePeriodSchema),
    defaultValues: {
      yearId: new Date().getFullYear(),
      monthId: 1,
      totalPeriod: 12,
    },
  })

  // Set default values to first option when data is loaded
  useEffect(() => {
    if (futureYears.length > 0) {
      // Set yearId to first option from the lookup
      form.setValue("yearId", futureYears[0].yearId)
    }
    // Set monthId to first option (1 for January)
    form.setValue("monthId", 1)
  }, [futureYears, form])

  const onSubmit = async (data: IGeneratePeriodRequest) => {
    try {
      await onGenerate(data)
      form.reset()
    } catch (error) {
      console.error("Error generating periods:", error)
    }
  }

  const handleCancel = () => {
    form.reset()
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Year Selection */}
          <FutureYearAutocomplete
            form={form}
            name="yearId"
            label="Year"
            isRequired
            className="w-full"
          />

          {/* Start Month Selection */}
          <MonthAutocomplete
            form={form}
            name="monthId"
            label="Start Month"
            isRequired
            className="w-full"
          />

          {/* Total Period Selection */}
          <CustomNumberInput
            form={form}
            name="totalPeriod"
            label="Total Period (1-12)"
            isRequired
            round={0}
            className="w-full"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
