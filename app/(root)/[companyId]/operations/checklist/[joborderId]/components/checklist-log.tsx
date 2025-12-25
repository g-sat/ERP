"use client"

import { useMemo } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { format, isValid } from "date-fns"
import {
  Calendar,
  Clock,
  Droplets,
  Fan,
  LogIn,
  Sun,
  User,
} from "lucide-react"

import { JobOrder } from "@/lib/api-routes"
import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface IActivityLog {
  activityId: number
  activityType: string
  timestamp: string | Date
  description: string
  activityDetails?: string
  performedBy?: string
  location?: string
  status?: string
  icon?: string
}

interface ChecklistLogProps {
  jobData?: IJobOrderHd | null
  isConfirmed?: boolean
}

export function ChecklistLog({
  jobData,
  isConfirmed: _isConfirmed = false,
}: ChecklistLogProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const timeFormat = "HH:mm"

  // Fetch activity logs data
  const { data: logsResponse, isLoading: isLogsLoading } = useGet<
    IActivityLog[]
  >(
    jobData?.jobOrderId
      ? `${JobOrder.getHistory}/${jobData.jobOrderId}`
      : "",
    "activityLogs",
    jobData?.jobOrderId ? jobData.jobOrderId.toString() : ""
  )

  const formatTime = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return "-"

    try {
      let date: Date | null = null

      if (dateValue instanceof Date) {
        date = dateValue
      } else if (typeof dateValue === "string") {
        date = new Date(dateValue)
      }

      if (date && isValid(date) && !isNaN(date.getTime())) {
        return format(date, timeFormat)
      }

      return "-"
    } catch {
      return "-"
    }
  }

  // Get icon component based on activity type
  const getActivityIcon = (activityType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      watering: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Droplets className="h-5 w-5 text-blue-600" />
        </div>
      ),
      ventilation: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-light-blue-100">
          <Fan className="h-5 w-5 text-light-blue-600" />
        </div>
      ),
      entry: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
          <LogIn className="h-5 w-5 text-purple-600" />
        </div>
      ),
      lighting: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <Sun className="h-5 w-5 text-orange-600" />
        </div>
      ),
      default: (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Calendar className="h-5 w-5 text-gray-600" />
        </div>
      ),
    }

    return (
      iconMap[activityType.toLowerCase()] ||
      iconMap[activityType] ||
      iconMap.default
    )
  }

  // Get activity type badge color
  const getActivityTypeColor = (activityType: string) => {
    const colorMap: Record<string, string> = {
      scheduled: "bg-gray-100 text-gray-800",
      manual: "bg-blue-100 text-blue-800",
      automatic: "bg-green-100 text-green-800",
    }

    return (
      colorMap[activityType.toLowerCase()] ||
      colorMap[activityType] ||
      "bg-gray-100 text-gray-800"
    )
  }

  // Extract logs data from response
  const logsData = logsResponse?.data || []

  // Mock data for demonstration (replace with actual API data)
  const mockLogs: IActivityLog[] = useMemo(
    () => [
      {
        activityId: 1,
        activityType: "watering",
        timestamp: new Date(),
        description: "Morning watering initiated.",
        activityDetails: "Scheduled Activity",
        status: "scheduled",
      },
      {
        activityId: 2,
        activityType: "ventilation",
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        description: "Ventilation system power set to 80%",
        activityDetails: "Scheduled Activity",
        status: "scheduled",
      },
      {
        activityId: 3,
        activityType: "entry",
        timestamp: new Date(Date.now() - 37 * 60 * 1000),
        description: "Authorized personnel entered facility.",
        activityDetails: "Nick R. @ Main Entrance",
        performedBy: "Nick R.",
        location: "Main Entrance",
        status: "manual",
      },
      {
        activityId: 4,
        activityType: "lighting",
        timestamp: new Date(Date.now() - 108 * 60 * 1000),
        description: "Main light source set to 1200 LUX",
        activityDetails: "Nancy T. Manually Set",
        performedBy: "Nancy T.",
        status: "manual",
      },
    ],
    []
  )

  // Use mock data if no real data available
  const displayLogs = logsData.length > 0 ? logsData : mockLogs

  if (isLogsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading activity logs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />

            {/* Timeline items */}
            {displayLogs.map((log, index) => (
              <div key={log.activityId || index} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  {getActivityIcon(log.activityType || "default")}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1 pb-6">
                  {/* Time and status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatTime(log.timestamp)}
                    </span>
                    {log.status && (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          log.status === "scheduled" || log.status === "automatic"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-base font-medium">{log.description}</div>

                  {/* Activity Details */}
                  {log.activityDetails && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {log.status === "scheduled" ? (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{log.activityDetails}</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3" />
                          <span>{log.activityDetails}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Show similar activities link (for entry type) */}
                  {log.activityType === "entry" && index === 2 && (
                    <button className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                      <span>Show 3 similar activities</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

