"use client"

import { useRef, useState } from "react"
import { Camera, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PhotoUploadProps {
  currentPhoto?: string
  onPhotoChange: (base64Photo: string) => void
  isDisabled?: boolean
  label?: string
  className?: string
}

export default function PhotoUpload({
  currentPhoto,
  onPhotoChange,
  isDisabled = false,
  label = "Employee Photo",
  className = "",
}: PhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Convert file to Base64 with optional resizing
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string

        // Create an image element to check dimensions
        const img = new Image()
        img.onload = () => {
          // Optional: Resize image if it's too large
          const maxWidth = 400
          const maxHeight = 400

          if (img.width > maxWidth || img.height > maxHeight) {
            // Create canvas to resize image
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }

            canvas.width = width
            canvas.height = height

            // Draw resized image
            ctx?.drawImage(img, 0, 0, width, height)

            // Convert to Base64 with compression
            const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8)
            const base64 = resizedBase64.split(",")[1]
            resolve(base64)
          } else {
            // Use original image with compression
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8)
            const base64 = compressedBase64.split(",")[1]
            resolve(base64)
          }
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = result
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select an image smaller than 5MB.")
        return
      }

      try {
        // Create preview URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // Convert to Base64
        const base64Photo = await convertFileToBase64(file)
        onPhotoChange(base64Photo)
      } catch (error) {
        console.error("Error processing image:", error)
        toast.error("Failed to process image. Please try again.")
      }
    }
  }

  const handleRemovePhoto = () => {
    setPreviewUrl(null)
    onPhotoChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getPhotoUrl = () => {
    if (previewUrl) {
      return previewUrl
    }
    if (currentPhoto) {
      return `data:image/jpeg;base64,${currentPhoto}`
    }
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
            {getPhotoUrl() ? (
              <img
                src={getPhotoUrl()!}
                alt="Employee photo"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No photo</p>
              </div>
            )}
          </div>

          {getPhotoUrl() && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemovePhoto}
              disabled={isDisabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isDisabled}
          />
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Supported formats: JPG, PNG, GIF (Max 5MB)
        </p>
      </div>
    </div>
  )
}
