"use client"

import { useRouter } from "next/navigation"
import { FileX, Home } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface DataNotFoundProps {
  title: string
  description: string
  itemId?: string
  itemType?: string
  companyId?: string
  primaryAction?: {
    label: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
  }
  secondaryAction?: {
    label: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
  }
  suggestions?: string[]
  customIcon?: React.ComponentType<{ className?: string }>
}

export function DataNotFound({
  title,
  description,
  itemId: _itemId,
  itemType = "item",
  companyId,
  primaryAction,
  secondaryAction,
  suggestions = [],
  customIcon: CustomIcon,
}: DataNotFoundProps) {
  const router = useRouter()

  const defaultPrimaryAction = {
    label: "Go to List",
    href: companyId ? `/${companyId}/operations/checklist` : "/",
    icon: Home,
  }

  const primary = primaryAction || defaultPrimaryAction

  const handlePrimaryClick = () => {
    if (primary.href) {
      router.push(primary.href)
    }
  }

  const handleSecondaryClick = () => {
    if (secondaryAction?.href) {
      router.push(secondaryAction.href)
    }
  }

  const defaultSuggestions = [
    `Go to the list to view available ${itemType}s`,
    "Switch to the correct company if this item exists there",
    `Create a new ${itemType} if needed`,
    "Contact your administrator if you believe this is an error",
  ]

  const finalSuggestions =
    suggestions.length > 0 ? suggestions : defaultSuggestions

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              {CustomIcon ? (
                <CustomIcon className="text-destructive h-5 w-5" />
              ) : (
                <FileX className="text-destructive h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      <Alert variant="destructive">
        {CustomIcon ? (
          <CustomIcon className="h-4 w-4" />
        ) : (
          <FileX className="h-4 w-4" />
        )}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          onClick={handlePrimaryClick}
          className="flex items-center gap-2"
        >
          {primary.icon && <primary.icon className="h-4 w-4" />}
          {primary.label}
        </Button>

        {secondaryAction && (
          <Button
            variant="outline"
            onClick={handleSecondaryClick}
            className="flex items-center gap-2"
          >
            {secondaryAction.icon && (
              <secondaryAction.icon className="h-4 w-4" />
            )}
            {secondaryAction.label}
          </Button>
        )}
      </div>

      {/* Additional Information */}
      {finalSuggestions.length > 0 && (
        <div className="bg-muted rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">What can you do?</h3>
          <ul className="text-muted-foreground space-y-1 text-sm">
            {finalSuggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
