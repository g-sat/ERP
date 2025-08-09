"use client"

import { useState } from "react"
import { Paperclip, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DocumentUploadForm } from "./document-upload-form"

interface DocumentData {
  fileType: string
  documentNumber: string
  countryId?: number
  issuedOn: string
  validFrom?: string
  expiresOn: string
}

export function EmployeeDocuments() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const handleDocumentSubmit = (data: DocumentData) => {
    console.log("Document submitted:", data)
    // Handle document submission here
    setShowUploadDialog(false)
  }

  const handleCancel = () => {
    setShowUploadDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">DOCUMENT NAME</TableHead>
                <TableHead className="w-[150px]">DOCUMENT NUMBER</TableHead>
                <TableHead className="w-[200px]">COUNTRY</TableHead>
                <TableHead className="w-[150px]">ISSUED ON</TableHead>
                <TableHead className="w-[150px]">VALID FROM</TableHead>
                <TableHead className="w-[150px]">EXPIRES ON</TableHead>
                <TableHead className="w-[100px]">ATTACHMENTS</TableHead>
                <TableHead className="w-[100px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Visa</TableCell>
                <TableCell>244363</TableCell>
                <TableCell>United Arab Emirates</TableCell>
                <TableCell>07 Nov 2023</TableCell>
                <TableCell>21 Nov 2023</TableCell>
                <TableCell>28 Aug 2024</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">1</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Visa</TableCell>
                <TableCell>123456</TableCell>
                <TableCell>United Arab Emirates</TableCell>
                <TableCell>12 Oct 2022</TableCell>
                <TableCell>12 Oct 2022</TableCell>
                <TableCell>31 Jul 2030</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">1</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
          </DialogHeader>

          <DocumentUploadForm
            onCancel={handleCancel}
            onSubmit={handleDocumentSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
