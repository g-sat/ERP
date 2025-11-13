"use client"

import { useParams } from "next/navigation"
import { IVisibleFields } from "@/interfaces/setting"
import { GLJournalHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { GLTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<GLJournalHdSchemaType>
  visible?: IVisibleFields
}

export default function Other({ form, visible }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const journalId = form.getValues("journalId") || "0"
  const journalNo = form.getValues("journalNo") || ""

  return (
    <div className="space-y-1">
      {/* Document Upload Section - Only show after glJournal is saved */}
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
