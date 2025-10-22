"use client"

import { useParams } from "next/navigation"
import { CbGenReceiptHdSchemaType } from "@/schemas/cb-genreceipt"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<CbGenReceiptHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const receiptId = form.getValues("receiptId") || "0"
  const receiptNo = form.getValues("receiptNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section - Only show after receipt is saved */}
      {receiptId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.cb}
          transactionId={CBTransactionId.cbgenreceipt}
          recordId={receiptId}
          recordNo={receiptNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
