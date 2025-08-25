"use client"

import { IUniversalDocumentHd } from "@/interfaces/universal-documents"
import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"

import {
  useGetExpiredDocuments,
  useGetExpiringDocuments,
  useGetUniversalDocuments,
} from "@/hooks/use-universal-documents"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DashboardStats {
  totalDocuments: number
  expiringSoon: number
  expired: number
  verified: number
  totalDetails: number
}

export function DocumentExpiryDashboard() {
  const { data: allDocumentsResponse } = useGetUniversalDocuments()
  const { data: expiringDocumentsResponse } = useGetExpiringDocuments(30)
  const { data: expiredDocumentsResponse } = useGetExpiredDocuments()

  // Extract data from API responses - handle both array and ApiResponse formats
  const allDocuments = Array.isArray(allDocumentsResponse)
    ? allDocumentsResponse
    : allDocumentsResponse?.data || []
  const expiringDocuments = Array.isArray(expiringDocumentsResponse)
    ? expiringDocumentsResponse
    : expiringDocumentsResponse?.data || []
  const expiredDocuments = Array.isArray(expiredDocumentsResponse)
    ? expiredDocumentsResponse
    : expiredDocumentsResponse?.data || []

  // Calculate statistics with proper null checks and meaningful metrics
  const stats: DashboardStats = {
    totalDocuments: allDocuments.length,
    expiringSoon: expiringDocuments.length,
    expired: expiredDocuments.length,
    verified: allDocuments.filter((doc: IUniversalDocumentHd) =>
      doc.data_details?.some((detail) => detail.renewalRequired === false)
    ).length,
    totalDetails: allDocuments.reduce(
      (total, doc) => total + (doc.data_details?.length || 0),
      0
    ),
  }

  const expiringPercentage =
    stats.totalDocuments > 0
      ? (stats.expiringSoon / stats.totalDocuments) * 100
      : 0

  const expiredPercentage =
    stats.totalDocuments > 0 ? (stats.expired / stats.totalDocuments) * 100 : 0

  const verifiedPercentage =
    stats.totalDocuments > 0 ? (stats.verified / stats.totalDocuments) * 100 : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Incomplete":
        return "bg-red-100 text-red-800"
      case "Expired":
        return "bg-gray-100 text-gray-800"
      case "Expiring Soon":
        return "bg-yellow-100 text-yellow-800"
      case "Valid":
        return "bg-green-100 text-green-800"
      case "No Expiry":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate)
      return { status: "No Expiry", color: "bg-gray-100 text-gray-800" }

    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilExpiry < 0) {
      return { status: "Expired", color: "bg-red-100 text-red-800" }
    } else if (daysUntilExpiry <= 30) {
      return { status: "Expiring Soon", color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { status: "Valid", color: "bg-green-100 text-green-800" }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl">
              {stats.totalDocuments}
            </div>
            <p className="text-muted-foreground text-xs">
              {stats.totalDetails} total details
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600 sm:text-2xl">
              {stats.expiringSoon}
            </div>
            <p className="text-muted-foreground text-xs">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600 sm:text-2xl">
              {stats.expired}
            </div>
            <p className="text-muted-foreground text-xs">Past expiry date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600 sm:text-2xl">
              {stats.verified}
            </div>
            <p className="text-muted-foreground text-xs">
              Successfully verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicators */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Expiry Risk Assessment
            </CardTitle>
            <CardDescription>
              Percentage of documents by expiry status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Expiring Soon</span>
                <span>{expiringPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={expiringPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Expired</span>
                <span>{expiredPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={expiredPercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Verified</span>
                <span>{verifiedPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={verifiedPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <CardDescription>Documents that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {expiringDocuments
                .slice(0, 5)
                .map((doc: IUniversalDocumentHd) => {
                  const earliestExpiry = doc.data_details
                    ?.filter((detail) => detail.expiryOn)
                    .sort(
                      (a, b) =>
                        new Date(a.expiryOn!).getTime() -
                        new Date(b.expiryOn!).getTime()
                    )[0]

                  const expiryStatus = getExpiryStatus(
                    earliestExpiry?.expiryOn || null
                  )

                  return (
                    <div
                      key={doc?.documentId || Math.random()}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {doc?.documentName ||
                            `Doc #${doc?.documentId || "N/A"}`}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {doc?.data_details?.length || 0} detail(s)
                        </p>
                      </div>
                      <Badge className={`${expiryStatus.color} w-fit`}>
                        {expiryStatus.status}
                      </Badge>
                    </div>
                  )
                })}
              {expiringDocuments.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No documents expiring soon
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <CardDescription>Latest document updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {allDocuments.slice(0, 5).map((doc: IUniversalDocumentHd) => {
                const hasFiles =
                  doc.data_details?.some((detail) => detail.filePath) || false
                const hasRenewalRequired =
                  doc.data_details?.some((detail) => detail.renewalRequired) ||
                  false

                let primaryStatus = "Unknown"
                if (hasFiles && !hasRenewalRequired) {
                  primaryStatus = "Complete"
                } else if (hasFiles && hasRenewalRequired) {
                  primaryStatus = "Pending"
                } else if (!hasFiles) {
                  primaryStatus = "Incomplete"
                }

                return (
                  <div
                    key={doc?.documentId || Math.random()}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {doc?.documentName ||
                          `Doc #${doc?.documentId || "N/A"}`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {doc?.detailsCount || 0} detail(s)
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(primaryStatus)} w-fit`}>
                      {primaryStatus}
                    </Badge>
                  </div>
                )
              })}
              {allDocuments.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
