"use client"

import { useState } from "react"
import { Download, Eye, File as FileIcon, FileText, Image } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DocumentViewerProps {
  filePath?: string
  file?: File
  documentName: string
  size?: "sm" | "default"
}

export default function DocumentViewer({
  filePath,
  file,
  documentName,
  size = "default",
}: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getFileType = (path: string | File): string => {
    let extension: string | undefined

    if (path instanceof File) {
      extension = path.name.split(".").pop()?.toLowerCase()
    } else if (typeof path === "string") {
      extension = path.split(".").pop()?.toLowerCase()
    }

    switch (extension) {
      case "pdf":
        return "pdf"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image"
      case "doc":
      case "docx":
        return "word"
      case "xls":
      case "xlsx":
        return "excel"
      default:
        return "unknown"
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "image":
        return <Image className="h-4 w-4 text-green-500" />
      case "word":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "excel":
        return <FileText className="h-4 w-4 text-green-600" />
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const handleDownload = () => {
    if (filePath) {
      try {
        const link = document.createElement("a")
        link.href = filePath
        link.download = documentName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Download started")
      } catch {
        toast.error("Download failed")
      }
    } else if (file) {
      const url = URL.createObjectURL(file)
      const link = document.createElement("a")
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Download started")
    }
  }

  const handleView = () => {
    setIsOpen(true)
  }

  const fileType = file ? getFileType(file) : getFileType(filePath || "")

  const renderDocumentContent = () => {
    const src = file ? URL.createObjectURL(file) : filePath

    if (!src) {
              return (
          <div className="bg-muted flex h-[400px] items-center justify-center rounded-lg border">
            <div className="text-center">
              <FileIcon className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground">No file source available</p>
            </div>
          </div>
        )
    }

    switch (fileType) {
      case "pdf":
        return (
          <iframe
            src={src}
            className="h-[600px] w-full rounded-lg border"
            title={documentName}
            onLoad={() => file && URL.revokeObjectURL(src)}
          />
        )
      case "image":
        return (
          <div className="flex justify-center">
            <img
              src={src}
              alt={documentName}
              className="max-h-[600px] max-w-full rounded-lg border object-contain"
              onLoad={() => file && URL.revokeObjectURL(src)}
            />
          </div>
        )
      default:
        return (
          <div className="bg-muted flex h-[400px] items-center justify-center rounded-lg border">
            <div className="text-center">
              <FileIcon className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground">
                Preview not available for this file type
              </p>
              <Button onClick={handleDownload} className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download to View
              </Button>
            </div>
          </div>
        )
    }
  }

  if (size === "sm") {
    return (
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          title="View Document"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          title="Download Document"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getFileIcon(fileType)}
            <span>{documentName}</span>
            <Badge variant="outline">{fileType.toUpperCase()}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">{renderDocumentContent()}</div>
        <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
