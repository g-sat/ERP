"use client"

import { useState } from "react"
import { IUniversalDocumentHd } from "@/interfaces/universal-documents"
import { Eye, Search } from "lucide-react"

import { useGetUniversalDocuments } from "@/hooks/use-universal-documents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DocumentTableProps {
  onEditAction?: (document: IUniversalDocumentHd) => void
}

export function DocumentTable({ onEditAction }: DocumentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: documentsResponse, isLoading } =
    useGetUniversalDocuments(searchTerm)

  // Extract data from API response - handle various response formats
  let documents: IUniversalDocumentHd[] = []

  // Handle the API response structure
  if (Array.isArray(documentsResponse)) {
    // If response is already an array
    documents = documentsResponse as IUniversalDocumentHd[]
  } else if (
    documentsResponse &&
    typeof documentsResponse === "object" &&
    "data" in documentsResponse
  ) {
    // If response has a data property
    const responseData = (documentsResponse as { data: unknown }).data
    if (Array.isArray(responseData)) {
      documents = responseData as IUniversalDocumentHd[]
    } else if (responseData) {
      // If data is not an array, try to handle it
      documents = [responseData as IUniversalDocumentHd]
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading documents...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-full sm:w-[150px] lg:w-[250px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">Details Count</TableHead>
                  <TableHead className="min-w-[120px]">Details Name</TableHead>
                  <TableHead className="min-w-[80px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <div className="text-muted-foreground">
                        No documents found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc: IUniversalDocumentHd) => {
                    return (
                      <TableRow key={doc?.documentId || Math.random()}>
                        <TableCell className="font-medium">
                          <div
                            className="max-w-[100px] truncate"
                            title={doc?.entityTypeName || "N/A"}
                          >
                            {doc?.entityTypeName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-[150px] truncate"
                            title={doc?.documentName || "N/A"}
                          >
                            {doc?.documentName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc?.detailsCount || 0} detail(s)
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="truncate bg-gray-100 text-gray-800"
                            title={doc?.detailsName || "N/A"}
                          >
                            {doc?.detailsName || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onEditAction?.(doc)}
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
