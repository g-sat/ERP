"use client"

import { useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"

import { JobOrder } from "@/lib/api-routes"
import { useGetWithDates } from "@/hooks/use-common"

import { ChecklistDashboard } from "./checklist-dashboard"

export function ChecklistDataProvider() {
  // Set default date range (last 30 days)
  const today = new Date()
  const defaultStartDate = new Date(today)
  defaultStartDate.setMonth(today.getMonth() - 1)

  const formatDate = (date: Date) => date.toISOString().split("T")[0]
  const [startDate] = useState(formatDate(defaultStartDate))
  const [endDate] = useState(formatDate(today))
  const [searchQuery] = useState("")

  const { data: jobOrderResponse, isLoading: isLoadingJobOrder } =
    useGetWithDates<IJobOrderHd>(
      JobOrder.get,
      "jobOrderHd",
      searchQuery,
      startDate,
      endDate
    )

  const apiData = jobOrderResponse?.data || []

  return <ChecklistDashboard data={apiData} isLoading={isLoadingJobOrder} />
}
