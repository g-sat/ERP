"use client"

import { useCallback, useState } from "react"
import { PDFDocument } from "pdf-lib"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { PDFCard } from "./shared/PDFCard"
import { PDFDropZone } from "./shared/PDFDropZone"

export function PDFSeparator() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pageRange, setPageRange] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (
      acceptedFiles.length > 0 &&
      acceptedFiles[0].type === "application/pdf"
    ) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const handleSeparate = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      // Parse page range
      const ranges = pageRange.split(",").map((range) => {
        const [start, end] = range.split("-").map((num) => parseInt(num.trim()))
        return {
          start: start || 1,
          end: end || start || pageCount,
        }
      })

      // Create separate PDFs for each range
      for (const range of ranges) {
        const newPdf = await PDFDocument.create()
        const pages = await newPdf.copyPages(
          pdfDoc,
          Array.from(
            { length: range.end - range.start + 1 },
            (_, i) => range.start - 1 + i
          )
        )
        pages.forEach((page) => newPdf.addPage(page))

        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes], { type: "application/pdf" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `split_${range.start}-${range.end}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error separating PDF:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <PDFDropZone onDrop={onDrop} />

      {file && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <PDFCard file={file} onRemove={() => setFile(null)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageRange">Page Range (e.g., 1-3, 5, 7-9)</Label>
            <Input
              id="pageRange"
              value={pageRange}
              onChange={(e) => setPageRange(e.target.value)}
              placeholder="Enter page ranges"
            />
          </div>

          <Button
            onClick={handleSeparate}
            disabled={!file || !pageRange || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Separate PDF"}
          </Button>
        </div>
      )}
    </div>
  )
}
