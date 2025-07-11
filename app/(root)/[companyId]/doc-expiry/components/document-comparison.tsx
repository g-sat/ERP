"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Document } from "../types"
import { DocumentCard } from "./document-card"

interface DocumentComparisonProps {
  documents: Document[]
  selectedDocuments: number[]
  onToggleDocument: (id: number) => void
  onClose: () => void
  daysRemaining: (doc: Document) => number
}

export function DocumentComparison({
  documents,
  selectedDocuments,
  onToggleDocument,
  onClose,
  daysRemaining,
}: DocumentComparisonProps) {
  const selectedDocs = documents.filter((doc) =>
    selectedDocuments.includes(doc.id)
  )

  return (
    <Card className="fixed right-4 bottom-4 w-96">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compare Documents</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {selectedDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              daysRemaining={daysRemaining(doc)}
              onRenew={() => {}}
              onAddNote={() => {}}
              onToggleReminder={() => {}}
              onToggleEmailNotification={() => {}}
              isComparison
              isSelected={selectedDocuments.includes(doc.id)}
              onToggleComparison={onToggleDocument}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onToggleDocument(selectedDocuments[0])}
          >
            Remove
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </CardContent>
    </Card>
  )
}
