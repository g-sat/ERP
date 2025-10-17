"use client"

import { useMemo } from "react"
import { IGLPeriodClose } from "@/interfaces/gl-periodclose"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { Checkbox } from "@/components/ui/checkbox"
import { SettingTable } from "@/components/table/table-setting"

interface PeriodCloseTableProps {
  data: IGLPeriodClose[]
  isLoading: boolean
  dateFormat: string
  datetimeFormat: string
  onFieldChange: (field: IGLPeriodClose, key: string, checked: boolean) => void
}

export function PeriodCloseTable({
  data,
  isLoading,
  dateFormat,
  datetimeFormat,
  onFieldChange,
}: PeriodCloseTableProps) {
  const columns: ColumnDef<IGLPeriodClose>[] = useMemo(
    () => [
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
                onFieldChange(row.original, "isArClose", checked as boolean)
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
                onFieldChange(row.original, "isApClose", checked as boolean)
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
                onFieldChange(row.original, "isCbClose", checked as boolean)
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
                onFieldChange(row.original, "isGlClose", checked as boolean)
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
    ],
    [dateFormat, datetimeFormat, onFieldChange]
  )

  return (
    <SettingTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No period close data found."
      maxHeight="460px"
    />
  )
}
