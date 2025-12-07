"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"

import ReportView from "@/components/reports/reportview"

export default function ReportViewerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const companyId = Number(params.companyId)
  const viewerRef = useRef<TelerikReportViewer>(null)
  const [reportData, setReportData] = useState<{
    reportFile: string
    parameters: Record<string, unknown>
  } | null>(null)

  useEffect(() => {
    // First, try to get data from sessionStorage (clean URL approach)
    try {
      const storedData = sessionStorage.getItem(`report_${companyId}`)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setReportData({
          reportFile: parsed.reportFile,
          parameters: parsed.parameters,
        })
        // Clean up sessionStorage after reading
        sessionStorage.removeItem(`report_${companyId}`)
        return
      }
    } catch (error) {
      console.error("Error reading from sessionStorage:", error)
    }

    // Fallback to URL parameters (for backward compatibility)
    const reportParam = searchParams.get("report")
    const paramsString = searchParams.get("params")

    if (reportParam && paramsString) {
      try {
        const parameters = JSON.parse(decodeURIComponent(paramsString))
        setReportData({
          reportFile: reportParam,
          parameters,
        })
      } catch (error) {
        console.error("Error parsing parameters:", error)
        setReportData({
          reportFile: reportParam || "SampleReport.trdp",
          parameters: {},
        })
      }
    } else if (reportParam) {
      // Only report file provided
      setReportData({
        reportFile: reportParam,
        parameters: {},
      })
    } else {
      // Default fallback
      setReportData({
        reportFile: "SampleReport.trdp",
        parameters: {},
      })
    }
  }, [companyId, searchParams])

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
