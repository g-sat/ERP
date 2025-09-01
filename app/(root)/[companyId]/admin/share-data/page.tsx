"use client"

import { IUser } from "@/interfaces/admin"
import { ApiResponse } from "@/interfaces/auth"

import { User } from "@/lib/api-routes"
import { useGet } from "@/hooks/use-common"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { ShareDataTable } from "../components/sharedata-table"

export default function AdminShareDataPage() {
  const {
    data: usersResponse,
    isLoading,
    isRefetching,
  } = useGet<IUser>(`${User.get}`, "users")

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          Company Share Data
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage company-wide share data
        </p>
      </div>
      {isLoading || isRefetching ? (
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
        <ShareDataTable />
      )}
    </div>
  )
}
