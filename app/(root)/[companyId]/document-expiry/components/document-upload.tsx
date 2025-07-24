"use client"

import { useRef, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { Download, Eye, File as FileIcon, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

import DocumentViewer from "./document-viewer"

interface DocumentUploadProps {
  onFileUploaded: (filePath: string, fileName?: string) => void
  currentFilePath?: string
  documentId?: number
  moduleId?: string
}

export default function DocumentUpload({
  onFileUploaded,
  currentFilePath,
  documentId,
  moduleId = "document-expiry",
}: DocumentUploadProps) {
  const { currentCompany } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const modulesWithCompanyId = ["ar", "ap", "cb", "gl", "common"]
  const requiresCompanyId = modulesWithCompanyId.includes(moduleId)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid file type (PDF, Image, Word, Excel)")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    if (requiresCompanyId && !currentCompany?.companyId) {
      toast.error("No company selected")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("moduleId", moduleId)
      formData.append("transactionId", documentId?.toString() || "0")
      formData.append("itemNo", "1")

      if (requiresCompanyId && currentCompany?.companyId) {
        formData.append("companyId", currentCompany.companyId.toString())
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      if (result.success) {
        toast.success("File uploaded successfully")
        onFileUploaded(result.filePath, selectedFile.name)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownload = () => {
    if (currentFilePath) {
      window.open(currentFilePath, "_blank")
    }
  }

  const handlePreview = () => {
    if (currentFilePath) {
      window.open(currentFilePath, "_blank")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="mr-2 h-5 w-5" />
          Document Upload
          {requiresCompanyId && (
            <span className="text-muted-foreground ml-2 text-xs">
              (Company-specific)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentFilePath && (
          <div className="bg-muted/50 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Current Document</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <Eye className="mr-1 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
            disabled={isUploading}
          />
          <p className="text-muted-foreground text-xs">
            Supported formats: PDF, Images, Word, Excel (Max 10MB)
          </p>
        </div>

        {selectedFile && (
          <div className="bg-muted/30 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileIcon className="h-4 w-4" />
                <span className="text-sm">{selectedFile.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <div className="flex space-x-2">
                <DocumentViewer
                  file={selectedFile}
                  documentName={selectedFile.name}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </CardContent>
    </Card>
  )
}
