"use client"

import { type RefObject } from "react"
import dynamic from "next/dynamic"
import type { TelerikReportViewer } from "@progress/telerik-react-report-viewer"

const ReactReportViewer = dynamic(
  () =>
    import("@progress/telerik-react-report-viewer").then(
      (types) => types.TelerikReportViewer
    ),
  { ssr: false }
) as typeof TelerikReportViewer

interface IReportViewProps {
  viewerRef: RefObject<TelerikReportViewer | null>
  reportSource: { report: string; parameters: Record<string, unknown> }
}

export default function ReportView({
  viewerRef,
  reportSource,
}: IReportViewProps) {
  return (
    <ReactReportViewer
      ref={viewerRef}
      serviceUrl={process.env.NEXT_PUBLIC_TELERIK_REPORT_API}
      reportSource={{
        report: reportSource.report,
        parameters: reportSource.parameters,
      }}
      viewerContainerStyle={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
      viewMode="INTERACTIVE"
      scaleMode="SPECIFIC"
      scale={1.0}
      enableAccessibility={false}
    />
  )
}
