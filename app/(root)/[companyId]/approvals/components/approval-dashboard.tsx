"use client"

import { APPROVAL_STATUS, IApprovalRequest } from "@/interfaces/approval"
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApprovalDashboardProps {
  requests: IApprovalRequest[]
}

export function ApprovalDashboard({ requests }: ApprovalDashboardProps) {
  const pendingCount = requests.filter(
    (r) => r.statusTypeId === APPROVAL_STATUS.PENDING
  ).length
  const approvedCount = requests.filter(
    (r) => r.statusTypeId === APPROVAL_STATUS.APPROVED
  ).length
  const rejectedCount = requests.filter(
    (r) => r.statusTypeId === APPROVAL_STATUS.REJECTED
  ).length
  const totalCount = requests.length

  const stats = [
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Approved",
      value: approvedCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total",
      value: totalCount,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-muted-foreground text-xs">
              {stat.title === "Total"
                ? "Total requests"
                : `${stat.title} requests`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
