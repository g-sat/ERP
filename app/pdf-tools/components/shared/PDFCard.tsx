import { useState } from "react"
import { X } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PDFCardProps {
  file: File
  onRemove: () => void
  draggable?: boolean
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  isDragged?: boolean
  className?: string
}

export function PDFCard({
  file,
  onRemove,
  draggable = false,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragged = false,
  className = "",
}: PDFCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)

  return (
    <>
      <div
        className={`relative flex flex-col gap-2 rounded-lg border bg-white p-3 shadow-sm transition-all ${
          isDragged ? "ring-primary ring-2" : ""
        } ${className}`}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={(e) => {
          e.preventDefault()
          onDragOver?.(e)
        }}
        onDragEnd={onDragEnd}
      >
        <div className="flex items-center justify-between">
          <span className="max-w-[200px] truncate text-sm font-medium">
            {file.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div
          className="group relative cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        >
          <Document
            file={file}
            onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
            className="mx-auto"
          >
            <Page pageNumber={1} width={180} />
          </Document>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-sm font-medium text-white">
              Click to preview
            </span>
          </div>
        </div>
        <div className="text-muted-foreground text-center text-xs">
          {numPages} page{numPages !== 1 ? "s" : ""}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Document file={file}>
              {Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={600}
                  className="mb-4"
                />
              ))}
            </Document>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
