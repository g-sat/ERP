"use client"

import { useParams } from "next/navigation"
import { ArAdjustmentHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { ARTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<ArAdjustmentHdSchemaType>
  visible?: unknown
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const adjustmentId = form.getValues("adjustmentId") || "0"
  const adjustmentNo = form.getValues("adjustmentNo") || ""

  return (
    <div className="space-y-1">
      {/* Document Upload Section - Only show after adjustment is saved */}
      {adjustmentId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.ar}
          transactionId={ARTransactionId.adjustment}
          recordId={adjustmentId}
          recordNo={adjustmentNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
