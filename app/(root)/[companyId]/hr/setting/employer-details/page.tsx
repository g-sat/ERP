"use client"

import { useState } from "react"
import { IEmployerDetails } from "@/interfaces/employer-details"
import { EmployerDetailsFormValues } from "@/schemas/employer-details"

import { EmployerDetails } from "@/lib/api-routes"
import { useDelete, useGet, usePersist } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { EmployerDetailsForm } from "./components/employer-details-form"
import { EmployerDetailsTable } from "./components/employer-details-table"

export default function EmployerDetailsPage() {
  // Permissions
  const canCreateEmployerDetails = true
  const canEditEmployerDetails = true
  const canDeleteEmployerDetails = true

  // Form states
  const [employerDetailsFormOpen, setEmployerDetailsFormOpen] = useState(false)
  const [selectedEmployerDetails, setSelectedEmployerDetails] =
    useState<IEmployerDetails | null>(null)

  const [deleteDialog, setDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    name: string
    type: string
  } | null>(null)

  // Data fetching
  const {
    data: employerDetailsData,
    isLoading: employerDetailsLoading,
    refetch: refetchEmployerDetails,
  } = useGet<IEmployerDetails>(EmployerDetails.get, "employerDetails")

  // Mutations
  const { mutate: deleteItem, isPending: isDeleting } = useDelete("/api")
  const createMutation = usePersist(EmployerDetails.add)
  const updateMutation = usePersist(EmployerDetails.add)

  // Event handlers
  const handleCreateEmployerDetails = () => {
    setSelectedEmployerDetails(null)
    setEmployerDetailsFormOpen(true)
  }

  const handleEditEmployerDetails = (employerDetails: IEmployerDetails) => {
    setSelectedEmployerDetails(employerDetails)
    setEmployerDetailsFormOpen(true)
  }

  const handleDeleteEmployerDetails = (employerDetails: IEmployerDetails) => {
    setItemToDelete({
      id: employerDetails.employerDetailsId.toString(),
      name: "EmployerDetails",
      type: "employerDetails",
    })
    setDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(`${itemToDelete.type}/${itemToDelete.id}`, {
        onSuccess: () => {
          refetchEmployerDetails()
          setDeleteDialog(false)
          setItemToDelete(null)
        },
      })
    }
  }

  const handleSave = (values: EmployerDetailsFormValues) => {
    const mutation = selectedEmployerDetails ? updateMutation : createMutation
    mutation.mutate(values, {
      onSuccess: () => {
        setEmployerDetailsFormOpen(false)
        setSelectedEmployerDetails(null)
        refetchEmployerDetails()
      },
    })
  }

  return (
    <div>
      {employerDetailsLoading ? (
        <DataTableSkeleton columnCount={4} />
      ) : (
        <EmployerDetailsTable
          data={employerDetailsData?.data || []}
          onEdit={handleEditEmployerDetails}
          onDelete={handleDeleteEmployerDetails}
          onCreate={handleCreateEmployerDetails}
          onRefresh={refetchEmployerDetails}
          canCreate={canCreateEmployerDetails}
          canEdit={canEditEmployerDetails}
          canDelete={canDeleteEmployerDetails}
        />
      )}

      {/* Form Dialog */}
      <Dialog
        open={employerDetailsFormOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEmployerDetailsFormOpen(false)
            setSelectedEmployerDetails(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto sm:w-[80vw] lg:w-[40vw]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedEmployerDetails
                ? "Edit EmployerDetails"
                : "Add New EmployerDetails"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedEmployerDetails
                ? "Update employerDetails information"
                : "Create a new employerDetails"}
            </DialogDescription>
          </DialogHeader>

          <EmployerDetailsForm
            employerDetails={selectedEmployerDetails || undefined}
            onSave={handleSave}
          />

          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEmployerDetailsFormOpen(false)
                setSelectedEmployerDetails(null)
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="employerDetails-form"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : selectedEmployerDetails
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmation
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={`Delete ${itemToDelete?.name}`}
        description={`Are you sure you want to delete this ${itemToDelete?.name.toLowerCase()}? This action cannot be undone.`}
      />
    </div>
  )
}
