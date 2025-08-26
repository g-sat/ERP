"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResponsiveFormProps {
  children: React.ReactNode
  title?: string
  description?: string
  onSubmit?: () => void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  className?: string
  showStickyActions?: boolean
}

export function ResponsiveForm({
  children,
  title,
  description,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  className,
  showStickyActions = true,
}: ResponsiveFormProps) {
  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Form Header */}
      {(title || description) && (
        <Card>
          <CardHeader>
            {title && <CardTitle className="text-fluid-lg">{title}</CardTitle>}
            {description && (
              <p className="text-muted-foreground text-fluid-sm">
                {description}
              </p>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">{children}</div>
        </CardContent>
      </Card>

      {/* Sticky Action Bar */}
      {showStickyActions && (onSubmit || onCancel) && (
        <div className="sticky-footer">
          <Card className="rounded-t-none border-t-0">
            <CardContent className="pt-4">
              <div className="flex flex-col justify-end gap-3 sm:flex-row">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="touch-target"
                  >
                    {cancelLabel}
                  </Button>
                )}
                {onSubmit && (
                  <Button
                    type="submit"
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="touch-target"
                  >
                    {isLoading ? "Saving..." : submitLabel}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Non-sticky actions for shorter forms */}
      {!showStickyActions && (onSubmit || onCancel) && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="touch-target"
                >
                  {cancelLabel}
                </Button>
              )}
              {onSubmit && (
                <Button
                  type="submit"
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="touch-target"
                >
                  {isLoading ? "Saving..." : submitLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface FormSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function FormSection({
  children,
  title,
  description,
  className,
}: FormSectionProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-fluid-base text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-muted-foreground text-fluid-sm">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface FormRowProps {
  children: React.ReactNode
  className?: string
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className || ""}`}>
      {children}
    </div>
  )
}
