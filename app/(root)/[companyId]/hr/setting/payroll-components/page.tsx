"use client"

import { useCallback, useState } from "react"
import { IPayrollComponent } from "@/interfaces/payroll"
import { PayrollComponentFormData } from "@/schemas/payroll"

import { PayrollComponent } from "@/lib/api-routes"
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

import { PayrollComponentForm } from "./components/payroll-component-form"
import { PayrollComponentTable } from "./components/payroll-component-table"
import { PayrollComponentView } from "./components/payroll-component-view"

export default function PayrollComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<IPayrollComponent | null>(null)
  const [viewingItem, setViewingItem] = useState<IPayrollComponent | null>(null)

  const { data, isLoading, refetch } = useGet(
    PayrollComponent.get,
    "payrollcomponent"
  )
  const createMutation = usePersist(PayrollComponent.add)
  const updateMutation = usePersist(PayrollComponent.add)
  const deleteMutation = useDelete(PayrollComponent.delete)

  const openCreate = useCallback(() => {
    setEditingItem(null)
    setDialogOpen(true)
  }, [])

  const openEdit = useCallback((item: IPayrollComponent) => {
    setEditingItem(item)
    setDialogOpen(true)
  }, [])

  const openView = useCallback((item: IPayrollComponent) => {
    setViewingItem(item)
    setViewDialogOpen(true)
  }, [])

  const confirmDelete = useCallback((item: IPayrollComponent) => {
    setEditingItem(item)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (editingItem) {
      deleteMutation.mutate(editingItem.payrollComponentId.toString())
      setDeleteConfirmOpen(false)
    }
  }, [deleteMutation, editingItem])

  const handleSave = useCallback(
    (values: PayrollComponentFormData) => {
      const mutation = editingItem ? updateMutation : createMutation
      mutation.mutate(values, {
        onSuccess: () => {
          setDialogOpen(false)
          setEditingItem(null)
          refetch()
        },
      })
    },
    [editingItem, createMutation, updateMutation, refetch]
  )

  return (
    <>
      {isLoading ? (
        <DataTableSkeleton columnCount={6} />
      ) : (
        <PayrollComponentTable
          data={data?.data as IPayrollComponent[]}
          onCreate={openCreate}
          onEdit={openEdit}
          onDelete={confirmDelete}
          onView={openView}
          onRefresh={refetch}
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDialogOpen(false)
            setEditingItem(null)
          }
        }}
      >
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Payroll Component" : "Add Payroll Component"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update payroll component details"
                : "Create a new payroll component"}
            </DialogDescription>
          </DialogHeader>

          <PayrollComponentForm
            initialData={editingItem as PayrollComponentFormData}
            onSave={handleSave}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setEditingItem(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="payroll-component-form"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingItem
                  ? "Update"
                  : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <PayrollComponentView
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        payrollComponent={viewingItem}
      />

      <DeleteConfirmation
        open={deleteConfirmOpen}
        onOpenChange={(isOpen) => setDeleteConfirmOpen(isOpen)}
        title="Delete Payroll Component"
        description="This action cannot be undone. This will permanently delete the payroll component from our servers."
        itemName={editingItem?.componentName || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        isDeleting={deleteMutation.isPending}
      />
    </>
  )
}
