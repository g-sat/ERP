"use client"

import { useParams } from "next/navigation"
import { CbPettyCashHdSchemaType } from "@/schemas/cb-pettycash"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<CbPettyCashHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const paymentId = form.getValues("paymentId") || "0"
  const paymentNo = form.getValues("paymentNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section */}
      <DocumentManager
        moduleId={ModuleId.cb}
        transactionId={CBTransactionId.cbpettycash}
        recordId={paymentId}
        recordNo={paymentNo}
        companyId={Number(companyId)}
        maxFileSize={10}
        maxFiles={10}
      />
    </div>
  )
}
