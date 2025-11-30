"use client"

import { useRef } from "react"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"

import { Button } from "@/components/ui/button"
import ReportView from "@/components/reports/reportview"

export default function Home() {
  const viewerRef = useRef<TelerikReportViewer>(null)

  const handleRefresh = (): void => {
    if (viewerRef.current) {
      viewerRef.current.refreshReport()
    }
  }

  const handlePrint = (): void => {
    if (viewerRef.current?.commands?.print) {
      viewerRef.current.commands.print.exec()
    }
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      <div className="bg-background z-10 flex gap-2 border-b p-2">
        <Button onClick={handleRefresh}>Refresh</Button>
        <Button onClick={handlePrint}>Print</Button>
      </div>

      <div className="relative w-full flex-1 overflow-hidden">
        <ReportView
          viewerRef={viewerRef}
          reportSource={{
            report: "SampleReport.trdp",
            parameters: {},
          }}
        />
      </div>
    </div>
  )
}
