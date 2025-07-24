"use client"

import { useState } from "react"
import { IDocumentExpiry } from "@/interfaces/docexpiry"
import { differenceInDays, format, isBefore, parseISO } from "date-fns"
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  File,
  FileText,
  User,
} from "lucide-react"

import { DocumentExpiry } from "@/lib/api-routes"
import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import DocumentViewer from "./document-viewer"

// Document Details Dialog Component
function DocumentDetailsDialog({ document }: { document: IDocumentExpiry }) {
  const [isOpen, setIsOpen] = useState(false)

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

  const expiryStatus = getExpiryStatus(document.expiryDate)

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Not specified"
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date)
    return format(dateObj, "PPP")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Document Details</span>
            <Badge variant={expiryStatus.color}>
              {expiryStatus.status === "expired" && "Expired"}
              {expiryStatus.status === "critical" && "Critical"}
              {expiryStatus.status === "warning" && "Warning"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{document.documentName}</h3>
              <p className="text-muted-foreground">{document.docTypeName}</p>
            </div>

            <Separator />

            {/* Status and Timing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Expiry Status</span>
                </div>
                <div className="pl-6">
                  <Badge variant={expiryStatus.color} className="mb-2">
                    {expiryStatus.status === "expired" && "Expired"}
                    {expiryStatus.status === "critical" && "Critical"}
                    {expiryStatus.status === "warning" && "Warning"}
                  </Badge>
                  <p className="text-muted-foreground text-sm">
                    {expiryStatus.status === "expired" &&
                      `${expiryStatus.days} days ago`}
                    {expiryStatus.status === "critical" &&
                      `${expiryStatus.days} days left`}
                    {expiryStatus.status === "warning" &&
                      `${expiryStatus.days} days left`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Notification</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm">
                    {document.notificationDaysBefore
                      ? `${document.notificationDaysBefore} days before expiry`
                      : "Not configured"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h4 className="font-medium">Important Dates</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Issue Date</span>
                </div>
                <p className="pl-6 text-sm">{formatDate(document.issueDate)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Expiry Date</span>
                </div>
                <p className="pl-6 text-sm">
                  {formatDate(document.expiryDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {document.remarks && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Remarks</h4>
                <p className="text-muted-foreground bg-muted rounded-md p-3 text-sm">
                  {document.remarks}
                </p>
              </div>
            </>
          )}

          {/* Document File */}
          {document.filePath && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Document File</h4>
                <DocumentViewer
                  filePath={document.filePath}
                  documentName={document.documentName}
                  size="default"
                />
              </div>
            </>
          )}

          {/* Audit Info */}
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium">Audit Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Created</span>
                </div>
                <p className="text-muted-foreground pl-6">
                  {document.createdDate
                    ? formatDate(document.createdDate)
                    : "Not available"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Last Modified</span>
                </div>
                <p className="text-muted-foreground pl-6">
                  {document.editDate
                    ? formatDate(document.editDate)
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
                    Name: {doc.docTypeName}
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
                  <DocumentDetailsDialog document={doc} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
