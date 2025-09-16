"use client"

import { FinanceForm } from "../components/finance-form"

export default function SettingsFinancePage() {
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      {<FinanceForm />}
    </div>
  )
}
