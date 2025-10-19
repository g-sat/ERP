"use client"

import { useParams } from "next/navigation"
import { CbBankTransferSchemaType } from "@/schemas/cb-banktransfer"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<CbBankTransferSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const transferId = form.getValues("transferId") || "0"
  const transferNo = form.getValues("transferNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section */}
      <DocumentManager
        moduleId={ModuleId.cb}
        transactionId={CBTransactionId.cbbanktransfer}
        recordId={transferId}
        recordNo={transferNo}
        companyId={Number(companyId)}
        maxFileSize={10}
        maxFiles={10}
      />
    </div>
  )
}
