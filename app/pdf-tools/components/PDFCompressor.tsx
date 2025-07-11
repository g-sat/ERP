"use client"

import { useCallback, useState } from "react"
import { PDFDict, PDFDocument, PDFName, PDFNumber, PDFStream } from "pdf-lib"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

import { PDFCard } from "./shared/PDFCard"
import { PDFDropZone } from "./shared/PDFDropZone"

export function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [quality, setQuality] = useState(80)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (
      acceptedFiles.length > 0 &&
      acceptedFiles[0].type === "application/pdf"
    ) {
      setFile(acceptedFiles[0])
    }
  }, [])

  const handleCompress = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Compress images in the PDF
      const pages = pdfDoc.getPages()
      for (const page of pages) {
        const resources = page.node?.Resources()
        if (!resources) continue

        const images = await resources.lookup(PDFName.of("XObject"), PDFDict)
        if (!images) continue

        // Get entries from the PDFDict
        const entries = images.entries()
        for (const [, image] of entries) {
          if (image instanceof PDFStream) {
            // Apply compression to image streams
            image.dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"))
            image.dict.set(PDFName.of("Quality"), PDFNumber.of(quality))
          }
        }
      }

      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      })

      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `compressed_${file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error compressing PDF:", error)
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
            <Label>Compression Quality: {quality}%</Label>
            <Slider
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <Button
            onClick={handleCompress}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Compressing..." : "Compress PDF"}
          </Button>
        </div>
      )}
    </div>
  )
}
