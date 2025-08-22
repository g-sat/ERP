"use client"

import { useEffect, useState } from "react"
import {
  IUniversalDocumentDt,
  IUniversalDocumentHd,
} from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtFormValues,
  UniversalDocumentHdFormValues,
  universalDocumentHdSchema,
} from "@/schemas/universal-documents"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Plus } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  usePersistDocumentDetails,
  usePersistUniversalDocument,
} from "@/hooks/use-universal-documents"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import EmployeeAutocomplete from "@/components/ui-custom/autocomplete-employee"
import EntityTypeAutocomplete from "@/components/ui-custom/autocomplete-entity-type"

import { DocumentDetailsForm } from "./document-details-form"
import { DocumentDetailsTable } from "./document-details-table"

interface DocumentFormProps {
  document?: IUniversalDocumentHd
  onSuccess?: () => void
  onCancel?: () => void
}

export function DocumentForm({
  document,
  onSuccess,
  onCancel,
}: DocumentFormProps) {
  const [details, setDetails] = useState<IUniversalDocumentDt[]>([])
  const [selectedEntityType, setSelectedEntityType] = useState<number>(0)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState<
    IUniversalDocumentDt | undefined
  >(undefined)

  const isEditing = !!document
  const persistMutation = usePersistUniversalDocument()
  const persistDetailsMutation = usePersistDocumentDetails()

  const form = useForm<UniversalDocumentHdFormValues>({
    resolver: zodResolver(universalDocumentHdSchema),
    defaultValues: {
      documentId: document?.documentId || 0,
      entityTypeId: document?.entityTypeId || 0,
      entity: document?.entity || "",
      documentName: document?.documentName || "",
      isActive: document?.isActive ?? true,
    },
    mode: "onChange", // Enable real-time validation
  })

  // Update selected entity type when form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "entityTypeId") {
        setSelectedEntityType(value.entityTypeId || 0)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Set initial entity type
  useEffect(() => {
    setSelectedEntityType(document?.entityTypeId || 0)
  }, [document])

  // Load details from document
  useEffect(() => {
    if (document?.data_details) {
      setDetails(document.data_details)
    }
  }, [document])

  // Debug form validation
  useEffect(() => {
    console.log("Form validation state:", {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      values: form.getValues(),
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
    })
  }, [
    form.formState.isValid,
    form.formState.errors,
    form.formState.isDirty,
    form.formState.isSubmitting,
  ])

  const handleAddDetail = () => {
    setEditingDetail(undefined)
    setDetailsDialogOpen(true)
  }

  const handleEditDetail = (detail: IUniversalDocumentDt) => {
    setEditingDetail(detail)
    setDetailsDialogOpen(true)
  }

  const handleViewDetail = (detail: IUniversalDocumentDt) => {
    // For now, just show in dialog as read-only
    setEditingDetail(detail)
    setDetailsDialogOpen(true)
  }

  const handleDeleteDetail = (index: number) => {
    if (confirm("Are you sure you want to delete this detail?")) {
      const updatedDetails = details.filter((_, i) => i !== index)
      setDetails(updatedDetails)
    }
  }

  const handleSubmitDetails = async (data: UniversalDocumentDtFormValues) => {
    try {
      const response = await persistDetailsMutation.mutateAsync(data)

      if (response.result === 1) {
        setDetailsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error saving document detail:", error)
    }
  }

  const onSubmit = async (data: UniversalDocumentHdFormValues) => {
    try {
      console.log("Form data being submitted:", data)
      console.log("Form is valid:", form.formState.isValid)
      console.log("Form errors:", form.formState.errors)

      if (!form.formState.isValid) {
        console.error("Form is not valid:", form.formState.errors)
        return
      }

      const response = await persistMutation.mutateAsync(data)

      // Only call onSuccess if result === 1 (success)
      if (response.result === 1) {
        onSuccess?.()
      }
      // If result !== 1, error message is shown via toast and form stays open
    } catch (error) {
      console.error("Error saving document:", error)
      // Don't call onSuccess on error
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? "Edit Document" : "Create New Document"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update document information"
              : "Add a new document to the system"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Hidden field for documentId */}
              <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => <input type="hidden" {...field} />}
              />

              {/* Header Information */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <div>
                  <EntityTypeAutocomplete
                    form={form}
                    name="entityTypeId"
                    label="Entity Type"
                    isRequired={true}
                    onChangeEvent={(selectedOption) => {
                      form.setValue(
                        "entityTypeId",
                        selectedOption?.entityTypeId || 0
                      )
                    }}
                  />
                </div>

                <div>
                  {selectedEntityType === 1 ? (
                    // Employee Entity Type
                    <EmployeeAutocomplete
                      form={form}
                      name="entity"
                      label="Select Employee"
                      isRequired={true}
                      onChangeEvent={(selectedOption) => {
                        form.setValue(
                          "entity",
                          selectedOption?.employeeId?.toString() || ""
                        )
                      }}
                    />
                  ) : selectedEntityType === 3 ? (
                    // Company Entity Type
                    <CompanyAutocomplete
                      form={form}
                      name="entity"
                      label="Select Company"
                      isRequired={true}
                      onChangeEvent={(selectedOption) => {
                        form.setValue(
                          "entity",
                          selectedOption?.companyId?.toString() || ""
                        )
                      }}
                    />
                  ) : (
                    <>
                      <FormLabel>Entity Name</FormLabel>
                      <Input
                        type="text"
                        placeholder={`Enter Entity Name`}
                        value={form.getValues("entity") || ""}
                        onChange={(e) =>
                          form.setValue("entity", e.target.value)
                        }
                      />
                    </>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="documentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter document Name"
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Is Active</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    persistMutation.isPending || !form.formState.isValid
                  }
                  onClick={() => {
                    console.log("Form state:", {
                      isValid: form.formState.isValid,
                      errors: form.formState.errors,
                      values: form.getValues(),
                    })
                  }}
                >
                  {persistMutation.isPending
                    ? "Saving..."
                    : isEditing
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
              {/* Debug form validation */}
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-red-800">
                    Form Validation Errors:
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {Object.entries(form.formState.errors).map(
                      ([field, error]) => (
                        <li key={field}>
                          <strong>{field}:</strong> {error?.message}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Document Details Section - Only show after header is saved */}
      {document?.documentId && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Document Details</h3>
              <Button onClick={handleAddDetail}>
                <Plus className="mr-2 h-4 w-4" />
                Add Detail
              </Button>
            </div>
            <DocumentDetailsTable
              details={details}
              onEdit={(detail) => handleEditDetail(detail)}
              onView={(detail) => handleViewDetail(detail)}
              onDelete={handleDeleteDetail}
            />
          </div>
        </>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent
          className="max-h-[90vh] w-[60vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking outside
            e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing on escape key
            e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditing ? "Edit Document Detail" : "Add Document Detail"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update document detail information"
                : "Add a new document detail to the system"}
            </DialogDescription>
          </DialogHeader>
          {/* Details Dialog */}
          <DocumentDetailsForm
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            detail={editingDetail}
            onSave={handleSubmitDetails}
            onCancel={() => setDetailsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
