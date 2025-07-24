"use client"

import { IDocumentExpiry } from "@/interfaces/docexpiry"
import { differenceInDays, isBefore, parseISO } from "date-fns"
import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"

import { DocumentExpiry } from "@/lib/api-routes"
import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExpiryReminder() {
  const {
    data: response,
    isLoading,
    error,
  } = useGet<IDocumentExpiry>(`${DocumentExpiry.get}`, "expDocuments")

  const documents = response?.data || []

  // Filter documents that are expiring soon (within 30 days) or already expired
  const getExpiringDocuments = () => {
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return documents.filter((doc: IDocumentExpiry) => {
      if (!doc.expiryDate) return false

      const expiryDate =
        typeof doc.expiryDate === "string"
          ? parseISO(doc.expiryDate)
          : new Date(doc.expiryDate)

      // Already expired
      if (isBefore(expiryDate, today)) return true

      // Expiring within 30 days
      if (isBefore(expiryDate, thirtyDaysFromNow)) return true

      return false
    })
  }

  const getExpiryStatus = (expiryDate: string | Date) => {
    const today = new Date()
    const expiry =
      typeof expiryDate === "string"
        ? parseISO(expiryDate)
        : new Date(expiryDate)

    const daysUntilExpiry = differenceInDays(expiry, today)

    if (daysUntilExpiry < 0) {
      return {
        status: "expired",
        days: Math.abs(daysUntilExpiry),
        color: "destructive" as const,
      }
    } else if (daysUntilExpiry <= 7) {
      return {
        status: "critical",
        days: daysUntilExpiry,
        color: "destructive" as const,
      }
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "warning",
        days: daysUntilExpiry,
        color: "secondary" as const,
      }
    } else {
      return {
        status: "safe",
        days: daysUntilExpiry,
        color: "default" as const,
      }
    }
  }

  const expiringDocuments = getExpiringDocuments()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <span className="ml-2">Loading expiry reminders...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive flex items-center justify-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span>Error loading expiry reminders.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (expiringDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Expiry Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center justify-center py-8">
            <FileText className="mr-2 h-5 w-5" />
            <span>No documents expiring soon. All good!</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
          Expiry Reminders ({expiringDocuments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringDocuments.map((doc: IDocumentExpiry) => {
            const expiryStatus = getExpiryStatus(doc.expiryDate)

            return (
              <div
                key={doc.documentId}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{doc.documentName}</h4>
                    <Badge variant={expiryStatus.color}>
                      {expiryStatus.status === "expired" && "Expired"}
                      {expiryStatus.status === "critical" && "Critical"}
                      {expiryStatus.status === "warning" && "Warning"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Type ID: {doc.docTypeId}
                    {doc.remarks && ` • ${doc.remarks}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">
                    {expiryStatus.status === "expired" &&
                      `${expiryStatus.days} days ago`}
                    {expiryStatus.status === "critical" &&
                      `${expiryStatus.days} days left`}
                    {expiryStatus.status === "warning" &&
                      `${expiryStatus.days} days left`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
