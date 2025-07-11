"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

import { PDFCard } from "./shared/PDFCard"
import { PDFDropZone } from "./shared/PDFDropZone"

const conversionTypes = [
  { label: "Word (.docx)", value: "word" },
  { label: "Excel (.xlsx)", value: "excel" },
  { label: "PowerPoint (.pptx)", value: "pptx" },
  { label: "Image (.jpg/.png)", value: "image" },
]

export function PDFConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")

  const handleFileChange = (acceptedFiles: File[]) => {
    if (
      acceptedFiles.length > 0 &&
      acceptedFiles[0].type === "application/pdf"
    ) {
      setFile(acceptedFiles[0])
    }
  }

  const handleConvert = (type: string) => {
    setSelectedType(type)
    setIsConverting(true)
    // Placeholder: Implement conversion logic here
    setTimeout(() => {
      setIsConverting(false)
      alert(`Converted to ${type.toUpperCase()} (mock)`)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PDFDropZone onDrop={handleFileChange} />

      {file && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <PDFCard file={file} onRemove={() => setFile(null)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {conversionTypes.map((type) => (
              <Button
                key={type.value}
                onClick={() => handleConvert(type.value)}
                disabled={isConverting}
                variant={selectedType === type.value ? "default" : "outline"}
                className="h-auto py-4"
              >
                {isConverting && selectedType === type.value ? (
                  "Converting..."
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span>Convert to</span>
                    <span className="font-medium">{type.label}</span>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFConverter
