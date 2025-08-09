"use client"

import { Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function EmployeeLoans() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ongoing Loan(s)</h2>
      </div>

      {/* Active Loan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold">Salary Advance New</h3>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                OPEN
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={10} className="w-32" />
              <span className="text-sm font-medium text-green-600">
                10% Completed
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Loan Amount</p>
              <p className="text-lg font-semibold">AED 10,000.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Loan ID</p>
              <p className="text-lg font-semibold">LOAN-00002</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">INSTALMENT AMOUNT</p>
              <p className="text-lg font-semibold">AED 1,000.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">AMOUNT REPAID</p>
              <p className="text-lg font-semibold text-green-600">
                AED 1,000.00
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">REMAINING AMOUNT</p>
              <p className="text-lg font-semibold text-red-600">AED 9,000.00</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                9 Instalment(s) Remaining
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Next Instalment Date</p>
              <p className="text-sm font-medium">05 Apr 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Loan History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50/50 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium">First Instalment Payment</p>
                  <p className="text-sm text-gray-500">05 Mar 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">AED 1,000.00</p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50/50 p-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="font-medium">Loan Disbursement</p>
                  <p className="text-sm text-gray-500">01 Mar 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-600">AED 10,000.00</p>
                <p className="text-sm text-gray-500">Disbursed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
