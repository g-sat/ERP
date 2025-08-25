"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { IEmployeeBasic } from "@/interfaces/employee"
import { EmployeeBasicValues } from "@/schemas/employee"

import { useSaveEmployeeBasic } from "@/hooks/use-employee"

import { EmployeeBasicForm } from "./components/forms/employee-basic"

export default function AddEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.companyId as string

  const saveMutation = useSaveEmployeeBasic()

  // Handle successful save and redirect
  useEffect(() => {
    if (saveMutation.isSuccess && saveMutation.data) {
      console.log("Save response:", saveMutation.data)
      debugger
      // Extract employeeId from the response
      const employeeData = saveMutation.data?.data
      const employeeId = Array.isArray(employeeData)
        ? (employeeData as IEmployeeBasic[])[0]?.employeeId
        : (employeeData as IEmployeeBasic)?.employeeId

      if (employeeId) {
        // Redirect to the overview-details page with the actual employeeId
        router.push(`/${companyId}/hr/employees/${employeeId}/overview-details`)
      } else {
        router.back()
      }
    }
  }, [saveMutation.isSuccess, saveMutation.data, companyId, router])

  // Handle save error
  useEffect(() => {
    if (saveMutation.isError) {
      console.error("Save error:", saveMutation.error)
    }
  }, [saveMutation.isError, saveMutation.error])

  const handleSave = (data: EmployeeBasicValues) => {
    console.log("Employee data to save:", data)

    // Use the mutation to save the data
    saveMutation.mutate(data)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
            Add New Employee
          </h2>
          <p className="text-muted-foreground text-sm">
            Create a new employee record
          </p>
        </div>
      </div>

      <EmployeeBasicForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  )
}
