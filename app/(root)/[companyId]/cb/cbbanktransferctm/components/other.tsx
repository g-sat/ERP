"use client"

import { useParams } from "next/navigation"
import { IVisibleFields } from "@/interfaces/setting"
import { CbBankTransferCtmHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<CbBankTransferCtmHdSchemaType>
  visible?: IVisibleFields
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const transferId = form.getValues("transferId") || "0"
  const transferNo = form.getValues("transferNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section - Only show after journal is saved */}
      {transferId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.cb}
          transactionId={CBTransactionId.cbbanktransferctm}
          recordId={transferId}
          recordNo={transferNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
