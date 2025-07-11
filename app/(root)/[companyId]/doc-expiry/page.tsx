"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  DocumentExpiry,
  DocumentExpiryFilterValues,
  DocumentExpiryFormValues,
} from "@/interfaces/docexpiry"
import { differenceInDays, format } from "date-fns"
import { BarChart2, Download, Plus } from "lucide-react"
import { toast } from "sonner"

import { useDocExpiry } from "@/hooks/use-docexpiry"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DeleteConfirmation } from "@/components/delete-confirmation"

import { DocumentCard } from "./components/document-card"
import { DocumentComparison } from "./components/document-comparison"
import DocumentExpiryFilter from "./components/document-expiry-filter"
import DocumentExpiryFormDialog from "./components/document-expiry-form-dialog"
import DocumentExpiryList from "./components/document-expiry-list"
import { DocumentStatusSummary } from "./components/document-status-summary"
import ExpirationForecast from "./components/expiration-forecast"
import { Document } from "./types"

export default function DocExpiryPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const [sortBy, setSortBy] = useState("expiry_date_asc")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedDocs, setSelectedDocs] = useState<number[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editDocument, setEditDocument] =
    useState<DocumentExpiryFormValues | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  )
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentFilters, setCurrentFilters] =
    useState<DocumentExpiryFilterValues>({})

  const {
    documents: apiDocuments,
    isLoading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  } = useDocExpiry(companyId)

  const fetchData = useCallback(() => {
    fetchDocuments(currentFilters)
  }, [fetchDocuments, currentFilters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sortedDocuments = [...apiDocuments].sort((a, b) => {
    switch (sortBy) {
      case "expiry_date_asc":
        return a.expiryDate.getTime() - b.expiryDate.getTime()
      case "expiry_date_desc":
        return b.expiryDate.getTime() - a.expiryDate.getTime()
      case "name_asc":
        return a.entityName.localeCompare(b.entityName)
      case "name_desc":
        return b.entityName.localeCompare(a.entityName)
      default:
        return 0
    }
  })

  const getStatusCount = (status: string) => {
    return apiDocuments.filter((doc) => doc.status === status).length
  }

  const getDaysRemaining = (doc: Document | DocumentExpiry) => {
    const today = new Date()
    return differenceInDays(doc.expiryDate, today)
  }

  const handleRenew = (docId: number) => {
    const doc = apiDocuments.find((d) => d.id === docId.toString())
    if (doc) {
      const newExpiryDate = new Date()
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1)
      updateDocument(docId.toString(), {
        documentType: doc.documentType,
        documentNumber: doc.documentNumber,
        issuedDate: doc.issuedDate,
        expiryDate: newExpiryDate,
        entityName: doc.entityName,
        entityType: doc.entityType,
        reminderDays: doc.reminderDays,
        notes: doc.notes,
        attachmentPath: doc.attachmentPath,
      })
      toast.success("Document renewed for another year.")
    }
  }

  const handleAddNote = (docId: number, note: string) => {
    const doc = apiDocuments.find((d) => d.id === docId.toString())
    if (doc) {
      updateDocument(docId.toString(), {
        ...doc,
        notes: doc.notes ? `${doc.notes}\n${note}` : note,
      })
      toast.success("Note added to document.")
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Type", "Number", "Expiry Date", "Status"],
      ...sortedDocuments.map((doc) => [
        doc.id,
        doc.entityName,
        doc.documentType,
        doc.documentNumber,
        format(doc.expiryDate, "yyyy-MM-dd"),
        doc.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `document_expiry_${format(new Date(), "yyyy-MM-dd")}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Document report downloaded.")
  }

  const handleToggleReminder = (id: number) => {
    const doc = apiDocuments.find((d) => d.id === id.toString())
    if (doc) {
      updateDocument(id.toString(), {
        ...doc,
        reminderDays: doc.reminderDays ? 0 : 30,
      })
    }
  }

  const handleToggleEmailNotification = () => {
    toast("Email notification toggle not implemented in this version.")
  }

  const handleToggleDocument = (id: number) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    )
  }

  const handleAddDocument = () => {
    setEditDocument(null)
    setIsDialogOpen(true)
  }

  const handleEditDocument = (id: string) => {
    const docToEdit = apiDocuments.find((doc) => doc.id === id)
    if (docToEdit) {
      setEditDocument({
        documentType: docToEdit.documentType,
        documentNumber: docToEdit.documentNumber,
        issuedDate: docToEdit.issuedDate,
        expiryDate: docToEdit.expiryDate,
        entityName: docToEdit.entityName,
        entityType: docToEdit.entityType,
        reminderDays: docToEdit.reminderDays,
        notes: docToEdit.notes,
        attachmentPath: docToEdit.attachmentPath,
      })
      setSelectedDocumentId(id)
      setIsDialogOpen(true)
    }
  }

  const handleDeleteDocument = (id: string) => {
    setSelectedDocumentId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveDocument = async (data: DocumentExpiryFormValues) => {
    try {
      if (selectedDocumentId) {
        await updateDocument(selectedDocumentId, data)
        toast.success("Document updated successfully")
      } else {
        await createDocument(data)
        toast.success("New document added successfully")
      }
      setIsDialogOpen(false)
      setSelectedDocumentId(null)
      setEditDocument(null)
      fetchData()
    } catch {
      toast.error("Failed to save document")
    }
  }

  const confirmDelete = async () => {
    if (selectedDocumentId) {
      try {
        await deleteDocument(selectedDocumentId)
        toast.success("Document deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedDocumentId(null)
      } catch {
        toast.error("Failed to delete document")
      }
    }
  }

  const applyFilters = (filters: DocumentExpiryFilterValues) => {
    setCurrentFilters(filters)
    fetchDocuments(filters)
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Expiry Reminder</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Compare
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddDocument}>
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </header>

      <DocumentStatusSummary
        validCount={getStatusCount("valid")}
        expiringSoonCount={getStatusCount("expiring")}
        expiredCount={getStatusCount("expired")}
      />

      <DocumentExpiryFilter onFilterChange={applyFilters} />

      <div className="flex items-center justify-between">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expiry_date_asc">Expiry Date (Asc)</SelectItem>
            <SelectItem value="expiry_date_desc">Expiry Date (Desc)</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={{
                id: parseInt(doc.id),
                name: doc.entityName,
                expiryDate: doc.expiryDate,
                status: doc.status,
                category: doc.entityType,
                priority: "medium",
                tags: [],
                notes: [doc.notes || ""],
                description: "",
                renewalProcess: "",
                lastRenewed: doc.issuedDate,
                reminderSettings: {
                  enabled: doc.reminderDays > 0,
                  daysBeforeExpiry: doc.reminderDays,
                  notifyByEmail: false,
                },
                history: [],
              }}
              daysRemaining={getDaysRemaining(doc)}
              onRenew={handleRenew}
              onAddNote={handleAddNote}
              onToggleReminder={handleToggleReminder}
              onToggleEmailNotification={handleToggleEmailNotification}
              isComparison={showComparison}
              isSelected={selectedDocs.includes(parseInt(doc.id))}
              onToggleComparison={handleToggleDocument}
            />
          ))}
        </div>
      ) : (
        <DocumentExpiryList
          documents={sortedDocuments}
          isLoading={isLoading}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
        />
      )}

      {showComparison && (
        <DocumentComparison
          documents={apiDocuments.map((doc) => ({
            id: parseInt(doc.id),
            name: doc.entityName,
            expiryDate: doc.expiryDate,
            status: doc.status,
            category: doc.entityType,
            priority: "medium",
            tags: [],
            notes: [doc.notes || ""],
            description: "",
            renewalProcess: "",
            lastRenewed: doc.issuedDate,
            reminderSettings: {
              enabled: doc.reminderDays > 0,
              daysBeforeExpiry: doc.reminderDays,
              notifyByEmail: false,
            },
            history: [],
          }))}
          selectedDocuments={selectedDocs}
          onToggleDocument={handleToggleDocument}
          onClose={() => setShowComparison(false)}
          daysRemaining={getDaysRemaining}
        />
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <DocumentExpiryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={editDocument || undefined}
        onSave={handleSaveDocument}
      />

      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
      />

      <ExpirationForecast />
    </div>
  )
}
