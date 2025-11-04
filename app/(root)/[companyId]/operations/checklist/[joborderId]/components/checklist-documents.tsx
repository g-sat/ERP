"use client"

import { useParams } from "next/navigation"
import { IJobOrderHd } from "@/interfaces/checklist"

import { ModuleId, OperationsTransactionId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface ChecklistDocumentsFormProps {
  jobData?: IJobOrderHd | null
  isConfirmed?: boolean
}

export function ChecklistDocuments({
  jobData,
  isConfirmed: _isConfirmed = false,
}: ChecklistDocumentsFormProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const jobOrderId = jobData?.jobOrderId?.toString() || "0"
  const jobOrderNo = jobData?.jobOrderNo || ""

  return (
    <DocumentManager
      moduleId={ModuleId.operations}
      transactionId={OperationsTransactionId.checklist}
      recordId={jobOrderId}
      recordNo={jobOrderNo}
      companyId={Number(companyId)}
      maxFileSize={10}
      maxFiles={10}
    />
  )
}
