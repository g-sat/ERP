"use client"

import { format } from "date-fns"
import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Document } from "../types"
import { DocumentDetails } from "./document-details"

interface DocumentCardProps {
  doc: Document
  daysRemaining: number
  onRenew: (id: number) => void
  onAddNote: (id: number, note: string) => void
  onToggleReminder: (id: number) => void
  onToggleEmailNotification: (id: number) => void
  isComparison?: boolean
  isSelected?: boolean
  onToggleComparison?: (id: number) => void
}

export function DocumentCard({
  doc,
  daysRemaining,
  onRenew,
  onAddNote,
  onToggleReminder,
  onToggleEmailNotification,
  isComparison = false,
  isSelected = false,
  onToggleComparison,
}: DocumentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "expired":
        return "bg-destructive hover:bg-destructive/90"
      case "expiring_soon":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "valid":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  if (isComparison) {
    return (
      <Card
        className={`cursor-pointer transition-colors ${
          isSelected ? "border-primary" : ""
        }`}
        onClick={() => onToggleComparison?.(doc.id)}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{doc.name}</CardTitle>
            <Star className={`h-4 w-4 ${getPriorityColor(doc.priority)}`} />
          </div>
          <Badge className={getStatusColor(doc.status)}>
            {doc.status.replace("_", " ")}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p>{doc.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p>{format(doc.expiryDate, "PPP")}</p>
              {doc.status !== "expired" && (
                <p className="mt-1 text-sm text-gray-500">
                  {daysRemaining} days remaining
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {doc.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{doc.name}</CardTitle>
          <Star className={`h-4 w-4 ${getPriorityColor(doc.priority)}`} />
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(doc.status)}>
            {doc.status.replace("_", " ")}
          </Badge>
          <DocumentDetails
            doc={doc}
            onRenew={onRenew}
            onAddNote={onAddNote}
            onToggleReminder={onToggleReminder}
            onToggleEmailNotification={onToggleEmailNotification}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p>{doc.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expiry Date</p>
            <p>{format(doc.expiryDate, "PPP")}</p>
            {doc.status !== "expired" && (
              <p className="mt-1 text-sm text-gray-500">
                {daysRemaining} days remaining
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
