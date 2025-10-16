"use client"

import { useEffect, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IGLPeriodClose } from "@/interfaces/gl-periodclose"
import { useAuthStore } from "@/stores/auth-store"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  useGLPeriodCloseSave,
  useGetGLPeriodCloseByCompanyYear,
} from "@/hooks/use-gl-periodclose"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SaveConfirmation } from "@/components/confirmation/save-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"
import { SettingTable } from "@/components/table/table-setting"

export default function GLPeriodClosePage() {
  const form = useForm()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [periodCloseData, setPeriodCloseData] = useState<IGLPeriodClose[]>([])
  const [saving, setSaving] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)

  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"

  // Generate year options (current year ± 5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  // Fetch period close data for selected year
  const {
    data: periodCloseResponse,
    refetch: refetchPeriodClose,
    isFetching: isDataLoading,
  } = useGetGLPeriodCloseByCompanyYear(selectedYear)

  // Save period close mutation
  const periodCloseSave = useGLPeriodCloseSave()

  // Update periodCloseData when periodCloseResponse changes
  useEffect(() => {
    if (periodCloseResponse) {
      const response = periodCloseResponse as ApiResponse<IGLPeriodClose>
      if (response.data && Array.isArray(response.data)) {
        setPeriodCloseData(response.data)
      } else {
        setPeriodCloseData([])
      }
    } else {
      setPeriodCloseData([])
    }
  }, [periodCloseResponse])

  // Update periodCloseData when response changes
  useEffect(() => {
    if (periodCloseResponse?.data) {
      setPeriodCloseData(periodCloseResponse.data)
    } else {
      setPeriodCloseData([])
    }
  }, [periodCloseResponse])

  // When year changes, refetch data
  useEffect(() => {
    if (selectedYear) {
      refetchPeriodClose()
    } else {
      setPeriodCloseData([])
    }
  }, [selectedYear, refetchPeriodClose])

  const handleFieldChange = (
    field: IGLPeriodClose,
    key: string,
    checked: boolean
  ) => {
    setPeriodCloseData((prev) =>
      prev.map((f) =>
        f.companyId === field.companyId &&
        f.finYear === field.finYear &&
        f.finMonth === field.finMonth
          ? { ...f, [key]: checked }
          : f
      )
    )
  }

  const columns: ColumnDef<IGLPeriodClose>[] = [
    {
      accessorKey: "finYear",
      header: "Year",
      size: 80,
      minSize: 70,
      maxSize: 100,
    },
    {
      accessorKey: "finMonth",
      header: "Month",
      size: 80,
      minSize: 70,
      maxSize: 100,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("startDate") as string
        return date ? format(new Date(date), dateFormat) : ""
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("endDate") as string
        return date ? format(new Date(date), dateFormat) : ""
      },
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "isArClose",
      header: "AR Close",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("isArClose")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "isArClose", checked as boolean)
            }
          />
        </div>
      ),
      size: 90,
      minSize: 80,
      maxSize: 100,
    },
    {
      accessorKey: "arCloseBy",
      header: "AR Close By",
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "arCloseDate",
      header: "AR Close Date",
      cell: ({ row }) => {
        const date = row.getValue("arCloseDate") as string
        return date ? format(new Date(date), datetimeFormat) : ""
      },
      size: 180,
      minSize: 160,
      maxSize: 220,
    },
    {
      accessorKey: "isApClose",
      header: "AP Close",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("isApClose")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "isApClose", checked as boolean)
            }
          />
        </div>
      ),
      size: 90,
      minSize: 80,
      maxSize: 100,
    },
    {
      accessorKey: "apCloseBy",
      header: "AP Close By",
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "apCloseDate",
      header: "AP Close Date",
      cell: ({ row }) => {
        const date = row.getValue("apCloseDate") as string
        return date ? format(new Date(date), datetimeFormat) : ""
      },
      size: 180,
      minSize: 160,
      maxSize: 220,
    },
    {
      accessorKey: "isCbClose",
      header: "CB Close",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("isCbClose")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "isCbClose", checked as boolean)
            }
          />
        </div>
      ),
      size: 90,
      minSize: 80,
      maxSize: 100,
    },
    {
      accessorKey: "cbCloseBy",
      header: "CB Close By",
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "cbCloseDate",
      header: "CB Close Date",
      cell: ({ row }) => {
        const date = row.getValue("cbCloseDate") as string
        return date ? format(new Date(date), datetimeFormat) : ""
      },
      size: 180,
      minSize: 160,
      maxSize: 220,
    },
    {
      accessorKey: "isGlClose",
      header: "GL Close",
      cell: ({ row }) => (
        <div className="text-center">
          <Checkbox
            checked={row.getValue("isGlClose")}
            onCheckedChange={(checked) =>
              handleFieldChange(row.original, "isGlClose", checked as boolean)
            }
          />
        </div>
      ),
      size: 90,
      minSize: 80,
      maxSize: 100,
    },
    {
      accessorKey: "glCloseBy",
      header: "GL Close By",
      size: 120,
      minSize: 100,
      maxSize: 150,
    },
    {
      accessorKey: "glCloseDate",
      header: "GL Close Date",
      cell: ({ row }) => {
        const date = row.getValue("glCloseDate") as string
        return date ? format(new Date(date), datetimeFormat) : ""
      },
      size: 180,
      minSize: 160,
      maxSize: 220,
    },
  ]

  const handleSave = async () => {
    if (!selectedYear) {
      toast.error("Please select a year first")
      return
    }
    setShowSaveConfirmation(true)
  }

  const handleConfirmSave = async () => {
    if (!selectedYear) {
      toast.error("Please select a year first")
      return
    }

    try {
      setSaving(true)
      const response = await periodCloseSave.mutateAsync({
        data: periodCloseData,
      })

      if (response.result === 1) {
        toast.success("Period close data saved successfully")
        refetchPeriodClose()
      } else {
        toast.error(response.message || "Failed to save period close data")
      }
    } catch (error) {
      console.error("Error saving period close data:", error)
      toast.error("Failed to save period close data")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            GL Period Close
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage AR, AP, CB, and GL period close settings
          </p>
        </div>
      </div>

      {isDataLoading ? (
        <DataTableSkeleton
          columnCount={16}
          filterCount={2}
          cellWidths={[
            "5rem",
            "5rem",
            "7.5rem",
            "7.5rem",
            "5.5rem",
            "7.5rem",
            "11rem",
            "5.5rem",
            "7.5rem",
            "11rem",
            "5.5rem",
            "7.5rem",
            "11rem",
            "5.5rem",
            "7.5rem",
            "11rem",
          ]}
          shrinkZero
        />
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => refetchPeriodClose())}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-end gap-4">
                  <div className="w-64">
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) =>
                        setSelectedYear(parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="submit"
                    disabled={isDataLoading}
                  >
                    {isDataLoading ? "Loading..." : "Search"}
                  </Button>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || !selectedYear}
                  size="sm"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>

          <SettingTable
            data={periodCloseData}
            columns={columns}
            isLoading={isDataLoading}
            emptyMessage="No period close data found."
            maxHeight="460px"
          />

          <SaveConfirmation
            title="Save Period Close Data"
            itemName={`period close data for year ${selectedYear}`}
            open={showSaveConfirmation}
            onOpenChange={setShowSaveConfirmation}
            onConfirm={handleConfirmSave}
            isSaving={saving}
            operationType="save"
          />
        </>
      )}
    </div>
  )
}
