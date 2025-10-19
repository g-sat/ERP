"use client"

import { useParams } from "next/navigation"
import { CbBankTransferCtmHdSchemaType } from "@/schemas/cb-banktransferctm"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import EnhancedDocumentUpload from "@/components/custom/enhanced-document-upload"

interface OtherProps {
  form: UseFormReturn<CbBankTransferCtmHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const transferId = form.getValues("transferId") || "0"
  const transferNo = form.getValues("transferNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section */}
      <EnhancedDocumentUpload
        moduleId={ModuleId.cb}
        transactionId={CBTransactionId.cbbanktransferctm}
        recordId={transferId}
        recordNo={transferNo}
        companyId={Number(companyId)}
        maxFileSize={10}
        maxFiles={10}
      />
    </div>
  )
}
