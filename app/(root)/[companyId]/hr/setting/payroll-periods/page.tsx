"use client"

import { useState } from "react"
import { IPayrollPeriod } from "@/interfaces/payroll"

import { PayrollPeriod } from "@/lib/api-routes"
import { useDelete, useGet } from "@/hooks/use-common"
import { DeleteConfirmation } from "@/components/delete-confirmation"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { PayrollPeriodForm } from "./components/payroll-period-form"
import { PayrollPeriodTable } from "./components/payroll-period-table"

export default function PayrollPeriodsPage() {
  const [payrollPeriodFormOpen, setPayrollPeriodFormOpen] = useState(false)
  const [selectedPayrollPeriod, setSelectedPayrollPeriod] =
    useState<IPayrollPeriod | null>(null)

  const [deleteDialog, setDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    id: string
    name: string
    type: string
  } | null>(null)

  // Data fetching
  const {
    data: periodData,
    isLoading: periodLoading,
    refetch: refetchPeriod,
  } = useGet<IPayrollPeriod>(PayrollPeriod.get, "payrollperiod")

  // Delete mutation
  const { mutate: deleteItem, isPending: isDeleting } = useDelete("/api")

  // Event handlers
  const handleCreatePayrollPeriod = () => {
    setSelectedPayrollPeriod(null)
    setPayrollPeriodFormOpen(true)
  }

  const handleEditPayrollPeriod = (period: IPayrollPeriod) => {
    setSelectedPayrollPeriod(period)
    setPayrollPeriodFormOpen(true)
  }

  const handleDeletePayrollPeriod = (periodId: string) => {
    setItemToDelete({
      id: periodId,
      name: "Payroll Period",
      type: "payrollperiod",
    })
    setDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(`${itemToDelete.type}/${itemToDelete.id}`)
    }
  }

  return (
    <div>
      {periodLoading ? (
        <DataTableSkeleton columnCount={6} />
      ) : (
        <PayrollPeriodTable
          data={periodData?.data || []}
          onEdit={handleEditPayrollPeriod}
          onDelete={handleDeletePayrollPeriod}
          onView={() => {}}
          onFilterChange={() => {}}
          onRefresh={refetchPeriod}
        />
      )}

      {/* Form Dialog */}
      {payrollPeriodFormOpen && (
        <PayrollPeriodForm
          initialData={selectedPayrollPeriod || undefined}
          onSubmit={(data) => {
            console.log("Payroll period data:", data)
            setPayrollPeriodFormOpen(false)
            refetchPeriod()
          }}
          onCancel={() => setPayrollPeriodFormOpen(false)}
        />
      )}

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
