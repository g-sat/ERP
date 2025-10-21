"use client"

import { useParams } from "next/navigation"
import { ApRefundHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { APTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<ApRefundHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const refundId = form.getValues("refundId") || "0"
  const refundNo = form.getValues("refundNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section - Only show after refund is saved */}
      {refundId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.ap}
          transactionId={APTransactionId.refund}
          recordId={refundId}
          recordNo={refundNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
