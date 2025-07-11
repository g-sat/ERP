"use client"

import { DocumentExpiry } from "@/interfaces/docexpiry"
import { format } from "date-fns"
import {
  AlertTriangle,
  CheckCircle,
  Edit,
  FileText,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DocumentExpiryListProps {
  documents: DocumentExpiry[]
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function DocumentExpiryList({
  documents,
  isLoading,
  onEdit,
  onDelete,
}: DocumentExpiryListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        )
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expiring Soon
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getEntityTypeBadge = (entityType: string) => {
    const colors: Record<string, string> = {
      customer: "bg-blue-100 text-blue-800",
      supplier: "bg-purple-100 text-purple-800",
      employee: "bg-teal-100 text-teal-800",
      company: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={colors[entityType] || colors.other}>
        {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
      </Badge>
    )
  }

  const calculateDaysRemaining = (expiryDate: Date) => {
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Type</TableHead>
              <TableHead>Document No.</TableHead>
              <TableHead>Entity Name</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Remaining</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(8)].map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Type</TableHead>
            <TableHead>Document No.</TableHead>
            <TableHead>Entity Name</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Days Remaining</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                No documents found
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => {
              const daysRemaining = calculateDaysRemaining(doc.expiryDate)

              return (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>{doc.documentNumber}</TableCell>
                  <TableCell>{doc.entityName}</TableCell>
                  <TableCell>{getEntityTypeBadge(doc.entityType)}</TableCell>
                  <TableCell>{format(doc.expiryDate, "PPP")}</TableCell>
                  <TableCell>
                    <span
                      className={
                        daysRemaining < 0
                          ? "font-medium text-red-600"
                          : daysRemaining <= 30
                            ? "font-medium text-yellow-600"
                            : "font-medium text-green-600"
                      }
                    >
                      {daysRemaining < 0
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : `${daysRemaining} days`}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(doc.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(doc.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600"
                        onClick={() => onDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {doc.attachmentPath && (
                        <Button variant="outline" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
