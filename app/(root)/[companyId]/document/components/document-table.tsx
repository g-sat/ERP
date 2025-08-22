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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DocumentTableProps {
  onEdit?: (document: IUniversalDocumentHd) => void
}

export function DocumentTable({ onEdit }: DocumentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all")

  const { data: documentsResponse, isLoading } =
    useGetUniversalDocuments(searchTerm)

  console.log("documentsResponse", documentsResponse)
  console.log("documentsResponse type:", typeof documentsResponse)
  console.log("documentsResponse isArray:", Array.isArray(documentsResponse))
  console.log("documentsResponse.data:", documentsResponse?.data)

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

  console.log("documents", documents)
  console.log("documents length:", documents.length)

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <Search className="text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={entityTypeFilter}
              onValueChange={setEntityTypeFilter}
            >
              <SelectTrigger className="h-8 w-[130px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="1">Employee</SelectItem>
                <SelectItem value="2">Company</SelectItem>
                <SelectItem value="4">Vessel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Details Count</TableHead>
                <TableHead>Details Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc: IUniversalDocumentHd) => {
                  return (
                    <TableRow key={doc?.documentId || Math.random()}>
                      <TableCell className="font-medium">
                        {doc?.entityTypeName || "N/A"}
                      </TableCell>
                      <TableCell>{doc?.documentName || "N/A"}</TableCell>
                      <TableCell>{doc?.detailsCount || 0} detail(s)</TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800">
                          {doc?.detailsName || "N/A"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => onEdit?.(doc)}
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
      </CardContent>
    </Card>
  )
}
