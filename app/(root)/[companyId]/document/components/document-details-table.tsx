"use client"

import { IUniversalDocumentDt } from "@/interfaces/universal-documents"
import { Download, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DocumentDetailsTableProps {
  details: IUniversalDocumentDt[]
  onEdit?: (detail: IUniversalDocumentDt, index: number) => void
  onView?: (detail: IUniversalDocumentDt, index: number) => void
  onDelete?: (index: number) => void
  isLoading?: boolean
}

export function DocumentDetailsTable({
  details,
  onEdit,
  onView,
  onDelete,
  isLoading = false,
}: DocumentDetailsTableProps) {
  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate)
      return { status: "No Expiry", color: "bg-gray-100 text-gray-800" }

    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilExpiry < 0) {
      return { status: "Expired", color: "bg-red-100 text-red-800" }
    } else if (daysUntilExpiry <= 30) {
      return { status: "Expiring Soon", color: "bg-yellow-100 text-yellow-800" }
    } else {
      return { status: "Valid", color: "bg-green-100 text-green-800" }
    }
  }

  if (details.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Loading document details...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  No document details added yet.
                </p>
                <p className="text-muted-foreground text-sm">
                  Click &quot;Add Detail&quot; to add document information.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Details ({details.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Status</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.map((detail, index) => {
                const expiryStatus = getExpiryStatus(detail.expiryOn)
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      Type #{detail.docTypeId}
                    </TableCell>
                    <TableCell>{detail.documentNo || "N/A"}</TableCell>
                    <TableCell>{detail.versionNo}</TableCell>
                    <TableCell>
                      {detail.issueOn
                        ? new Date(detail.issueOn).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {detail.expiryOn
                        ? new Date(detail.expiryOn).toLocaleDateString()
                        : "No Expiry"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-800">
                        {"N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={expiryStatus.color}>
                        {expiryStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {detail.filePath ? (
                        <Badge variant="secondary">File Uploaded</Badge>
                      ) : (
                        <span className="text-muted-foreground">No File</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onView?.(detail, index)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit?.(detail, index)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {detail.filePath && (
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onDelete?.(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
