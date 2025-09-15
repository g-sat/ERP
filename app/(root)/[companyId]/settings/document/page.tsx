"use client"

import { useState } from "react"

import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { DocumentNoForm } from "../components/documentno-form"

export default function SettingsDocumentPage() {
  const [isLoading] = useState(false)
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Document No
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure document numbering
          </p>
        </div>
      </div>
      {isLoading ? (
        <DataTableSkeleton
          columnCount={8}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      ) : (
        <DocumentNoForm />
      )}
    </div>
  )
}
