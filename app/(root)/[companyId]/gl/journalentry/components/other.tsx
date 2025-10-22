"use client"

import { useParams } from "next/navigation"
import { GLJournalHdSchemaType } from "@/schemas/gl-journalentry"
import { UseFormReturn } from "react-hook-form"

import { GLTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<GLJournalHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const journalId = form.getValues("journalId") || "0"
  const journalNo = form.getValues("journalNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section - Only show after journal entry is saved */}
      {journalId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.gl}
          transactionId={GLTransactionId.journalentry}
          recordId={journalId}
          recordNo={journalNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
