"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"

import ReportView from "@/components/reports/reportview"

export default function ReportWindowViewerPage() {
  const params = useParams()
  const companyId = Number(params.companyId)
  const viewerRef = useRef<TelerikReportViewer>(null)
  const [reportData, setReportData] = useState<{
    reportFile: string
    parameters: Record<string, unknown>
  } | null>(null)

  useEffect(() => {
    // Get data from sessionStorage (clean URL approach)
    try {
      const storedData = sessionStorage.getItem(`report_window_${companyId}`)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setReportData({
          reportFile: parsed.reportFile,
          parameters: parsed.parameters,
        })
        // Clean up sessionStorage after reading
        sessionStorage.removeItem(`report_window_${companyId}`)
        return
      }
    } catch (error) {
      console.error("Error reading from sessionStorage:", error)
    }

    // If no data found, show error
    setReportData({
      reportFile: "RPT_ARInvoice.trdp",
      parameters: {},
    })
  }, [companyId])

  if (!reportData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground">Loading report...</div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      <div className="relative w-full flex-1 overflow-hidden">
        <ReportView
          viewerRef={viewerRef}
          reportSource={{
            report: reportData.reportFile,
            parameters: reportData.parameters,
          }}
        />
      </div>
    </div>
  )
}
