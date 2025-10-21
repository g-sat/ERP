"use client"

import { useParams } from "next/navigation"
import { ApDocsetoffHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { APTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<ApDocsetoffHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const setoffId = form.getValues("setoffId") || "0"
  const setoffNo = form.getValues("setoffNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section - Only show after docsetoff is saved */}
      {setoffId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.ap}
          transactionId={APTransactionId.docsetoff}
          recordId={setoffId}
          recordNo={setoffNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
