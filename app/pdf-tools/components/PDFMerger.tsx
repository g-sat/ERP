"use client"

import { useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
import PDFMergerJS from "pdf-merger-js"

import { Button } from "@/components/ui/button"

import { PDFCard } from "./shared/PDFCard"
import { PDFDropZone } from "./shared/PDFDropZone"

export function PDFMerger() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(
      (file) => file.type === "application/pdf"
    )
    setFiles((prev) => [...prev, ...pdfFiles])
  }, [])

  const handleMerge = async () => {
    if (files.length < 2) return
    setIsProcessing(true)
    try {
      const merger = new (PDFMergerJS as unknown)()
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        await merger.add(arrayBuffer)
      }
      const mergedPdf = await merger.saveAsBlob()
      const url = window.URL.createObjectURL(mergedPdf)
      const link = document.createElement("a")
      link.href = url
      link.download = "merged.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setFiles([])
    } catch (error) {
      console.error("Error merging PDFs:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Drag-and-drop reordering handlers
  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return
    const newFiles = [...files]
    const [removedFile] = newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, removedFile)
    setFiles(newFiles)
    setDraggedIndex(index)
  }
  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <div className="space-y-6">
      <PDFDropZone onDrop={onDrop} multiple />

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Selected Files (drag to reorder):</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file, index) => (
              <PDFCard
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => {
                  e.preventDefault()
                  handleDragOver(index)
                }}
                onDragEnd={handleDragEnd}
                isDragged={draggedIndex === index}
              />
            ))}
          </div>

          <Button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Merging...
              </span>
            ) : (
              "Merge PDFs"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
