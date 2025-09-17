"use client"

import { UserWiseSettingTable } from "../components/userwiserights-table"

export default function AdminUserWiseRightsPage() {
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          User Wise Rights
        </h1>
        <p className="text-muted-foreground text-sm">Manage user-wise rights</p>
      </div>
      <UserWiseSettingTable />
    </div>
  )
}
