import { useCallback, useState } from "react"
import {
  DocumentExpiry,
  DocumentExpiryFilterValues,
  DocumentExpiryFormValues,
} from "@/interfaces/docexpiry"

export function useDocExpiry() {
  const [documents, setDocuments] = useState<DocumentExpiry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all documents
  const fetchDocuments = useCallback(
    async (filters: DocumentExpiryFilterValues = {}) => {
      setIsLoading(true)
      setError(null)
      try {
        // This is where you would make an API call to fetch documents
        // For now, we'll use mock data
        const mockData: DocumentExpiry[] = [
          {
            id: "1",
            documentType: "Passport",
            documentNumber: "A12345678",
            issuedDate: new Date("2022-01-01"),
            expiryDate: new Date("2027-01-01"),
            entityName: "John Doe",
            entityType: "employee",
            reminderDays: 90,
            status: "valid",
            createdDate: new Date(),
            updatedDate: new Date(),
          },
          {
            id: "2",
            documentType: "Business License",
            documentNumber: "BL9876543",
            issuedDate: new Date("2021-06-15"),
            expiryDate: new Date(
              new Date().getTime() + 15 * 24 * 60 * 60 * 1000
            ), // 15 days from now
            entityName: "Acme Corp",
            entityType: "company",
            reminderDays: 30,
            status: "expiring",
            notes: "Renewal process started",
            createdDate: new Date(),
            updatedDate: new Date(),
          },
          {
            id: "3",
            documentType: "Insurance Policy",
            documentNumber: "INS5432178",
            issuedDate: new Date("2022-03-10"),
            expiryDate: new Date(
              new Date().getTime() - 5 * 24 * 60 * 60 * 1000
            ), // 5 days ago
            entityName: "Global Shipping Ltd",
            entityType: "customer",
            reminderDays: 60,
            status: "expired",
            createdDate: new Date(),
            updatedDate: new Date(),
          },
        ]

        // Filter the documents based on the provided filters
        const filteredDocuments = filterDocuments(mockData, filters)
        setDocuments(filteredDocuments)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError("Failed to fetch documents")
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Create a new document
  const createDocument = useCallback(async (data: DocumentExpiryFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      // This is where you would make an API call to create a document
      const newDocument: DocumentExpiry = {
        id: Date.now().toString(),
        ...data,
        status: getDocumentStatus(data.expiryDate, data.reminderDays),
        createdDate: new Date(),
        updatedDate: new Date(),
      }
      setDocuments((prev) => [...prev, newDocument])
      return newDocument
    } catch (err) {
      console.error("Error creating document:", err)
      setError("Failed to create document")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update an existing document
  const updateDocument = useCallback(
    async (id: string, data: DocumentExpiryFormValues) => {
      setIsLoading(true)
      setError(null)
      try {
        // This is where you would make an API call to update a document
        const updatedDocument: DocumentExpiry = {
          id,
          ...data,
          status: getDocumentStatus(data.expiryDate, data.reminderDays),
          createdDate:
            documents.find((doc) => doc.id === id)?.createdDate || new Date(),
          updatedDate: new Date(),
        }
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? updatedDocument : doc))
        )
        return updatedDocument
      } catch (err) {
        console.error("Error updating document:", err)
        setError("Failed to update document")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [documents]
  )

  // Delete a document
  const deleteDocument = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // This is where you would make an API call to delete a document
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      return true
    } catch (err) {
      console.error("Error deleting document:", err)
      setError("Failed to delete document")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Helper function to determine document status
  const getDocumentStatus = (
    expiryDate: Date,
    reminderDays: number
  ): "valid" | "expiring" | "expired" => {
    const today = new Date()
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return "expired"
    } else if (diffDays <= reminderDays) {
      return "expiring"
    } else {
      return "valid"
    }
  }

  // Helper function to filter documents
  const filterDocuments = (
    docs: DocumentExpiry[],
    filters: DocumentExpiryFilterValues
  ): DocumentExpiry[] => {
    return docs.filter((doc) => {
      // Filter by document type
      if (
        filters.documentType &&
        doc.documentType.toLowerCase() !== filters.documentType.toLowerCase()
      ) {
        return false
      }

      // Filter by entity type
      if (filters.entityType && doc.entityType !== filters.entityType) {
        return false
      }

      // Filter by status
      if (filters.status && doc.status !== filters.status) {
        return false
      }

      // Filter by entity name
      if (
        filters.entityName &&
        !doc.entityName.toLowerCase().includes(filters.entityName.toLowerCase())
      ) {
        return false
      }

      // Filter by expiry date range
      if (filters.expiryDateFrom && doc.expiryDate < filters.expiryDateFrom) {
        return false
      }

      if (filters.expiryDateTo && doc.expiryDate > filters.expiryDateTo) {
        return false
      }

      return true
    })
  }

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  }
}
