import { FileUp } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface PDFDropZoneProps {
  onDrop: (files: File[]) => void
  multiple?: boolean
  className?: string
}

export function PDFDropZone({
  onDrop,
  multiple = false,
  className = "",
}: PDFDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple,
  })

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
      } ${className}`}
    >
      <input {...getInputProps()} />
      <FileUp className="mx-auto mb-4 h-8 w-8 text-gray-400" />
      {isDragActive ? (
        <p>Drop the PDF file{multiple ? "s" : ""} here...</p>
      ) : (
        <p>
          Drag and drop PDF file{multiple ? "s" : ""} here, or click to select
          file{multiple ? "s" : ""}
        </p>
      )}
    </div>
  )
}
