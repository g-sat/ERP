"use client"

import { useRef, type ComponentRef } from "react"
import dynamic from "next/dynamic"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"

const ReactReportViewer = dynamic(
  () =>
    import("@progress/telerik-react-report-viewer").then(
      (types) => types.TelerikReportViewer
    ),
  { ssr: false }
) as typeof TelerikReportViewer

export default function Home() {
  const viewerRef = useRef<ComponentRef<typeof ReactReportViewer>>(null)

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
    <>
      <button onClick={handleRefresh}>Refresh</button>
      <button onClick={handlePrint}>Print</button>

      <ReactReportViewer
        ref={viewerRef}
        serviceUrl="http://localhost:59655/api/reports/"
        reportSource={{
          report: "SampleReport.trdp",
          parameters: {},
        }}
        viewerContainerStyle={{
          position: "absolute",
          inset: "35px 5px 5px",
        }}
        viewMode="INTERACTIVE"
        scaleMode="SPECIFIC"
        scale={1.0}
        enableAccessibility={false}
      />
    </>
  )
}
