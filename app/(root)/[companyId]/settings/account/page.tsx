"use client"

import { useState } from "react"

import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { AccountForm } from "../components/account-form"

export default function SettingsAccountPage() {
  const [isLoading] = useState(false)
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
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
        <AccountForm />
      )}
    </div>
  )
}
