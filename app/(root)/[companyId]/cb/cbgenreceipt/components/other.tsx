"use client"

import { useParams } from "next/navigation"
import { IVisibleFields } from "@/interfaces/setting"
import { CbGenReceiptHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<CbGenReceiptHdSchemaType>
  visible?: IVisibleFields
}

export default function Other({ form, visible }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const receiptId = form.getValues("receiptId") || "0"
  const receiptNo = form.getValues("receiptNo") || ""

  return (
    <div className="space-y-1">
      {/* Document Upload Section - Only show after cbGenReceipt is saved */}
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
