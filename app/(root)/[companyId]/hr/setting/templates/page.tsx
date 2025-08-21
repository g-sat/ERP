"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { ElegantTemplate } from "./components/elegant-template"
import { SimpleTemplate } from "./components/simple-template"
import { StandardTemplate } from "./components/standard-template"

interface Template {
  id: string
  name: string
  type: "payslip" | "letter"
  category: string
  isDefault?: boolean
  preview: {
    companyName: string
    netPay: string
    currency: string
  }
}

interface PayslipPreferences {
  showOrganisationAddress: boolean
  showMOLID: boolean
  showEmailID: boolean
  showMobileNumber: boolean
  showYTDValues: boolean
  showIBANNumber: boolean
  showWorkLocation: boolean
  showDepartment: boolean
  showDesignation: boolean
  showBenefitsSummary: boolean
}

const templates: Template[] = [
  {
    id: "elegant",
    name: "Elegant Template",
    type: "payslip",
    category: "Regular Payslips",
    isDefault: true,
    preview: {
      companyName: "Archipelago Middle East Shipping LLC",
      netPay: "56,400.00",
      currency: "AED",
    },
  },
  {
    id: "standard",
    name: "Standard Template",
    type: "payslip",
    category: "Regular Payslips",
    preview: {
      companyName: "Archipelago Middle East Shipping LLC",
      netPay: "56,400.00",
      currency: "AED",
    },
  },
  {
    id: "simple",
    name: "Simple Template",
    type: "payslip",
    category: "Regular Payslips",
    preview: {
      companyName: "Archipelago Middle East Shipping LLC",
      netPay: "56,400.00",
      currency: "AED",
    },
  },
]

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [preferences, setPreferences] = useState<PayslipPreferences>({
    showOrganisationAddress: true,
    showMOLID: true,
    showEmailID: false,
    showMobileNumber: false,
    showYTDValues: false,
    showIBANNumber: true,
    showWorkLocation: false,
    showDepartment: false,
    showDesignation: true,
    showBenefitsSummary: false,
  })

  const filteredTemplates = templates.filter(
    (template) => template.category === "Regular Payslips"
  )

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handleSetAsDefault = (templateId: string) => {
    // Update templates array to set the selected template as default
    const updatedTemplates = templates.map((template) => ({
      ...template,
      isDefault: template.id === templateId,
    }))

    // In a real application, you would save this to the database
    console.log("Setting template as default:", templateId)
    console.log("Updated templates:", updatedTemplates)

    toast.success(
      `${templates.find((t) => t.id === templateId)?.name} set as default template`
    )
  }

  const handleSave = () => {
    // TODO: Save template preferences to database
    console.log("Saving template preferences:", preferences)
    toast.success("Template preferences saved successfully")
    setIsEditDialogOpen(false)
  }

  const handlePreview = () => {
    // TODO: Preview payslip with current settings
    console.log("Previewing payslip with preferences:", preferences)
    toast.info("Preview functionality coming soon")
  }

  const handlePreferencesChange = (newPreferences: PayslipPreferences) => {
    setPreferences(newPreferences)
  }

  const renderTemplateComponent = () => {
    if (!selectedTemplate) return null

    const commonProps = {
      preferences,
      onPreferencesChange: handlePreferencesChange,
      onSave: handleSave,
      onPreview: handlePreview,
      isOpen: isEditDialogOpen,
      onClose: () => setIsEditDialogOpen(false),
    }

    switch (selectedTemplate.id) {
      case "elegant":
        return <ElegantTemplate {...commonProps} />
      case "standard":
        return <StandardTemplate {...commonProps} />
      case "simple":
        return <SimpleTemplate {...commonProps} />
      default:
        return <StandardTemplate {...commonProps} />
    }
  }

  return (
    <div className="h-full p-6">
      <h2 className="mb-6 text-2xl font-semibold">Regular Payslips</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={() => handleEditTemplate(template)}
            onSetAsDefault={() => handleSetAsDefault(template.id)}
          />
        ))}
      </div>

      {/* Render the appropriate template component */}
      {renderTemplateComponent()}
    </div>
  )
}

function TemplateCard({
  template,
  onEdit,
  onSetAsDefault,
}: {
  template: Template
  onEdit: () => void
  onSetAsDefault: () => void
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        {/* Template Preview */}
        <div className="relative border-b">
          <div className="p-4">
            {/* Company Logo/Icon */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <span className="text-sm font-bold">A</span>
              </div>
              {template.isDefault && (
                <Badge className="bg-orange-500 text-xs">DEFAULT</Badge>
              )}
            </div>

            {/* Company Name */}
            <h3 className="mb-2 font-semibold">
              {template.preview.companyName}
            </h3>

            {/* Net Pay */}
            <div className="text-right">
              <span className="text-2xl font-bold">
                {template.preview.currency} {template.preview.netPay}
              </span>
            </div>

            {/* Template Sections Preview */}
            <div className="mt-4 space-y-2">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Basic</span>
                <span>{template.preview.currency} 60,000.00</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Housing Allowance</span>
                <span>{template.preview.currency} 0.00</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Salary Advance</span>
                <span className="text-red-600">
                  -{template.preview.currency} 1,200.00
                </span>
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>EPF</span>
                <span className="text-red-600">
                  -{template.preview.currency} 1,200.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Template Name and Action Buttons */}
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium">{template.name}</h4>
            <Button onClick={onEdit} variant="outline" size="sm">
              Edit
            </Button>
          </div>

          {/* Set as Default Button */}
          {!template.isDefault && (
            <Button
              onClick={onSetAsDefault}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Set as Default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
