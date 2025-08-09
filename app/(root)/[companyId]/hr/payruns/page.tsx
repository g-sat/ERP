"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ProcessPayRunCard } from "./components/process-pay-run-card"

// Dummy data for demonstration
const dummyPayRunHistory = [
  {
    id: 1,
    paymentDate: "2025-07-31",
    payrollType: "Regular Payroll",
    payrollPeriod: "01 Jul 2025 - 31 Jul 2025",
    status: "PAID",
    totalAmount: 45000,
    employeeCount: 2,
  },
  {
    id: 2,
    paymentDate: "2025-06-30",
    payrollType: "Regular Payroll",
    payrollPeriod: "01 Jun 2025 - 30 Jun 2025",
    status: "PAID",
    totalAmount: 42000,
    employeeCount: 2,
  },
  {
    id: 3,
    paymentDate: "2025-05-31",
    payrollType: "Regular Payroll",
    payrollPeriod: "01 May 2025 - 31 May 2025",
    status: "PAID",
    totalAmount: 41000,
    employeeCount: 2,
  },
  {
    id: 4,
    paymentDate: "2025-04-30",
    payrollType: "Regular Payroll",
    payrollPeriod: "01 Apr 2025 - 30 Apr 2025",
    status: "PAID",
    totalAmount: 40000,
    employeeCount: 2,
  },
  {
    id: 5,
    paymentDate: "2025-03-31",
    payrollType: "Regular Payroll",
    payrollPeriod: "01 Mar 2025 - 31 Mar 2025",
    status: "PAID",
    totalAmount: 39000,
    employeeCount: 2,
  },
]

const currentPayRun = {
  month: "August 2025",
  paymentDate: "2025-08-31",
  employeeCount: 2,
  status: "READY",
  netPayStatus: "YET TO PROCESS",
}

export default function PayRunsPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string
  const [activeTab, setActiveTab] = useState("run-payroll")

  const handleCreatePayRun = () => {
    // Generate a new payrun ID (you can replace this with actual ID generation logic)
    const newPayrunId = Date.now().toString()
    router.push(`/${companyId}/hr/payruns/${newPayrunId}`)
  }

  const handleProcessPayRun = async () => {
    // Generate a new payrun ID (you can replace this with actual ID generation logic)
    const newPayrunId = Date.now().toString()
    router.push(`/${companyId}/hr/payruns/${newPayrunId}`)
  }

  return (
    <div className="@container flex-1 space-y-4 p-4 pt-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pay Runs</h1>
          <p className="text-muted-foreground">
            Manage payroll processing and payment history
          </p>
        </div>
        <Button
          onClick={handleCreatePayRun}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Pay Run
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="run-payroll">Run Payroll</TabsTrigger>
          <TabsTrigger value="payroll-history">Payroll History</TabsTrigger>
        </TabsList>

        <TabsContent value="run-payroll" className="space-y-4">
          <ProcessPayRunCard
            payRun={currentPayRun}
            onProcess={handleProcessPayRun}
            onCreatePayRun={handleCreatePayRun}
          />
        </TabsContent>

        <TabsContent value="payroll-history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Payroll Type:</span>
              <Badge variant="outline">All</Badge>
            </div>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-muted-foreground">
              Payroll history will be displayed here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
