"use client"

import { useCallback, useState } from "react"
import { PDFDocument } from "pdf-lib"

import { Button } from "@/components/ui/button"

import { PDFCard } from "./shared/PDFCard"
import { PDFDropZone } from "./shared/PDFDropZone"

export function PDFEditor() {
  const [mainFile, setMainFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDropMain = useCallback((acceptedFiles: File[]) => {
    if (
      acceptedFiles.length > 0 &&
      acceptedFiles[0].type === "application/pdf"
    ) {
      setMainFile(acceptedFiles[0])
    }
  }, [])

  const onDropAdditional = useCallback((acceptedFiles: File[]) => {
    setAdditionalFiles((prev) => [
      ...prev,
      ...acceptedFiles.filter((file) => file.type === "application/pdf"),
    ])
  }, [])

  const handleEdit = async () => {
    if (!mainFile) return

    setIsProcessing(true)
    try {
      const mainArrayBuffer = await mainFile.arrayBuffer()
      const mainPdf = await PDFDocument.load(mainArrayBuffer)

      // Add pages from additional PDFs
      for (const file of additionalFiles) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pages = await mainPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => mainPdf.addPage(page))
      }

      const pdfBytes = await mainPdf.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `edited_${mainFile.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Reset state
      setMainFile(null)
      setAdditionalFiles([])
    } catch (error) {
      console.error("Error editing PDF:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Main PDF File</h3>
        <PDFDropZone onDrop={onDropMain} />

        {mainFile && (
          <div className="flex justify-center">
            <PDFCard file={mainFile} onRemove={() => setMainFile(null)} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Additional PDF Files</h3>
        <PDFDropZone onDrop={onDropAdditional} multiple />

        {additionalFiles.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {additionalFiles.map((file, index) => (
                <PDFCard
                  key={index}
                  file={file}
                  onRemove={() => removeAdditionalFile(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleEdit}
        disabled={!mainFile || additionalFiles.length === 0 || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Add Pages to PDF"}
      </Button>
    </div>
  )
}
