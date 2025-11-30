"use client"

import { useRef } from "react"
import { useSearchParams } from "next/navigation"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"

import ReportView from "@/components/reports/reportview"

export default function ReportViewerPage() {
  const searchParams = useSearchParams()
  const viewerRef = useRef<TelerikReportViewer>(null)
  console.log(viewerRef)
  console.log(searchParams)
  const reportFile = searchParams.get("report") || "SampleReport.trdp"
  const paramsString = searchParams.get("params")

  let parameters: Record<string, unknown> = {}
  if (paramsString) {
    try {
      parameters = JSON.parse(decodeURIComponent(paramsString))
    } catch (error) {
      console.error("Error parsing parameters:", error)
    }
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      <div className="relative w-full flex-1 overflow-hidden">
        <ReportView
          viewerRef={viewerRef}
          reportSource={{
            report: reportFile,
            parameters,
          }}
        />
      </div>
    </div>
  )
}
