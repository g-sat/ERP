"use client"

import { FileX, Plus } from "lucide-react"

import { DataNotFound } from "./data-not-found"

interface JobOrderNotFoundProps {
  jobOrderId: string
  companyId: string
  onGoToChecklist?: () => void
}

export function JobOrderNotFound({
  jobOrderId,
  companyId,
  onGoToChecklist: _onGoToChecklist,
}: JobOrderNotFoundProps) {
  return (
    <DataNotFound
      title="Job Order Not Found"
      description={`This job order is not available in the current company. It may have been created in a different company or doesn't exist.`}
      itemId={jobOrderId}
      itemType="job order"
      companyId={companyId}
      primaryAction={{
        label: "Go to Checklist",
        href: `/${companyId}/operations/checklist`,
        icon: FileX,
      }}
      secondaryAction={{
        label: "Create Checklist",
        href: `/${companyId}/operations/checklist/new`,
        icon: Plus,
      }}
      customIcon={FileX}
    />
  )
}
