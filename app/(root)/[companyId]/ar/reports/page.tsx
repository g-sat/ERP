"use client"

import * as React from "react"
import { useState } from "react"

import { Card, CardContent } from "@/components/ui/card"

import ReportForm from "./components/form"
import LedgerTable from "./components/ledger-table"
import OutstandingTable from "./components/outstanding-table"
import { mockLedgerData, mockOutstandingData } from "./data"

interface ReportFormData {
  report: string
  customer: string
  fromDate: string
  toDate: string
  asDate: string
  currency: string
}

export default function ARReportsPage() {
  const [reportName, setReportName] = useState<string>("")
  const [selectedReport, setSelectedReport] = useState<string>("")
  const [outstandingData, setOutstandingData] = useState(mockOutstandingData)
  const [ledgerData, setLedgerData] = useState(mockLedgerData)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (formData: ReportFormData) => {
    setIsLoading(true)
    setSelectedReport(formData.report)

    // Simulate API call
    setTimeout(() => {
      const reportType = formData.report || "General Report"
      setReportName(
        `${reportType} - ${formData.customer || "All Customers"} (${formData.fromDate} to ${formData.toDate})`
      )
      setIsLoading(false)
    }, 1000)
  }

  const handleClear = () => {
    setReportName("")
    setSelectedReport("")
    setOutstandingData([])
    setLedgerData([])
  }

  const handleOutstandingView = (transaction: unknown) => {
    console.log("View outstanding transaction:", transaction)
  }

  const handleLedgerView = (transaction: unknown) => {
    console.log("View ledger transaction:", transaction)
  }

  return (
    <div className="@container flex flex-1 flex-col gap-4 p-4">
      {/* Form Section */}
      <ReportForm onSearchAction={handleSearch} onClearAction={handleClear} />

      {/* Tables Section */}
      <div className="space-y-6">
        {reportName && selectedReport === "outstanding" && (
          <OutstandingTable data={outstandingData} isLoading={isLoading} />
        )}

        {reportName && selectedReport === "ledger" && (
          <LedgerTable
            data={ledgerData}
            isLoading={isLoading}
            onView={handleLedgerView}
          />
        )}

        {reportName && selectedReport === "aging" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Aging Analysis Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Aging analysis data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "collection" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Collection Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Collection report data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "credit" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Credit Limit Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Credit limit data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "sales" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Sales Analysis Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Sales analysis data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "payment" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">
                Payment History Report
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Payment history data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "invoice" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">
                Invoice Summary Report
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Invoice summary data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "receipt" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Receipt Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Receipt data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "adjustment" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Adjustment Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Adjustment data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "refund" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Refund Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Refund data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "credit-note" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Credit Note Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Credit note data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {reportName && selectedReport === "debit-note" && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">Debit Note Report</div>
              <div className="mt-2 text-sm text-gray-400">
                Debit note data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {!reportName && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-500">
                Select a report type to view data
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Please use the form above to search for reports
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
