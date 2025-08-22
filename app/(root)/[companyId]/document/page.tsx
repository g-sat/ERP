"use client"

import { useState } from "react"
import { IUniversalDocumentHd } from "@/interfaces/universal-documents"
import { ArrowLeft, BarChart3, FileText, Plus } from "lucide-react"

import { useGetUniversalDocumentById } from "@/hooks/use-universal-documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DocumentExpiryDashboard } from "./components/document-expiry-dashboard"
import { DocumentForm } from "./components/document-form"
import { DocumentTable } from "./components/document-table"

type ViewMode = "dashboard" | "list" | "create" | "edit" | "view"

export default function DocumentExpiryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [documentIdToFetch, setDocumentIdToFetch] = useState<
    string | undefined
  >(undefined)

  // Hook to fetch complete document data by ID
  const { data: fetchedDocument, isLoading: isFetchingDocument } =
    useGetUniversalDocumentById(documentIdToFetch)

  const handleCreate = () => {
    setDocumentIdToFetch(undefined)
    setViewMode("create")
  }

  const handleEdit = (document: IUniversalDocumentHd) => {
    // Set the document ID to fetch complete data
    setDocumentIdToFetch(document.documentId.toString())
    setViewMode("edit")
  }

  const handleSuccess = () => {
    setViewMode("list")
    setDocumentIdToFetch(undefined)
  }

  const handleCancel = () => {
    setViewMode("list")
    setDocumentIdToFetch(undefined)
  }

  // Extract the actual document data from the API response
  const completeDocument =
    (fetchedDocument as { data: IUniversalDocumentHd } | undefined)?.data ||
    null

  const renderContent = () => {
    switch (viewMode) {
      case "dashboard":
        return <DocumentExpiryDashboard />

      case "list":
        return (
          <div className="space-y-4">
            <DocumentTable onEdit={handleEdit} />
          </div>
        )

      case "create":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </div>
            <DocumentForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        )

      case "edit":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </div>
            {isFetchingDocument ? (
              <Card>
                <CardHeader>
                  <CardTitle>Loading document...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                </CardContent>
              </Card>
            ) : completeDocument ? (
              <DocumentForm
                document={completeDocument}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Document not found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">
                      The requested document could not be found.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case "view":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
              {completeDocument && (
                <Button onClick={() => handleEdit(completeDocument)}>
                  Edit Document
                </Button>
              )}
            </div>
            {isFetchingDocument ? (
              <Card>
                <CardHeader>
                  <CardTitle>Loading document...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                </CardContent>
              </Card>
            ) : completeDocument ? (
              <DocumentView document={completeDocument} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Document not found</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">
                      The requested document could not be found.
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return <DocumentExpiryDashboard />
    }
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header with Name and Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Document Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage and track document expiry dates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as ViewMode)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">{renderContent()}</div>
    </div>
  )
}

// Document View Component
function DocumentView({ document }: { document: IUniversalDocumentHd }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Details Name
              </label>
              <p className="text-sm">{document?.detailsName || "N/A"}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Details Count
              </label>
              <p className="text-sm">{document?.detailsCount || "N/A"}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Document Name
              </label>
              <p className="text-sm">{document?.documentName || "N/A"}</p>
            </div>
          </div>

          {/* Document Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Document Details</h3>
            {document.data_details?.map((detail, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Document Type
                    </label>
                    <p className="text-sm">Type #{detail.docTypeId}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Document Number
                    </label>
                    <p className="text-sm">{detail.documentNo || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Version
                    </label>
                    <p className="text-sm">{detail.versionNo}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Issue Date
                    </label>
                    <p className="text-sm">
                      {detail.issueOn
                        ? new Date(detail.issueOn).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Expiry Date
                    </label>
                    <p className="text-sm">
                      {detail.expiryOn
                        ? new Date(detail.expiryOn).toLocaleDateString()
                        : "No Expiry"}
                    </p>
                  </div>

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      File Type
                    </label>
                    <p className="text-sm">{detail.fileType || "N/A"}</p>
                  </div>

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Renewal Required
                    </label>
                    <p className="text-sm">
                      {detail.renewalRequired ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
                {detail.remarks && (
                  <div className="mt-4">
                    <label className="text-muted-foreground text-sm font-medium">
                      Remarks
                    </label>
                    <p className="text-sm">{detail.remarks}</p>
                  </div>
                )}
              </Card>
            )) || (
              <p className="text-muted-foreground text-sm">
                No document details available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
