"use client"

import { UserRightsTable } from "../components/userrights-table"

export default function AdminUserRightsPage() {
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          User Rights
        </h1>
        <p className="text-muted-foreground text-sm">Manage user rights</p>
      </div>
      <UserRightsTable />
    </div>
  )
}
