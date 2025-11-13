"use client"

import { useParams } from "next/navigation"
import { IVisibleFields } from "@/interfaces/setting"
import { CbGenPaymentHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import { CBTransactionId, ModuleId } from "@/lib/utils"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<CbGenPaymentHdSchemaType>
  visible?: IVisibleFields
}

export default function Other({ form, visible }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const paymentId = form.getValues("paymentId") || "0"
  const paymentNo = form.getValues("paymentNo") || ""

  return (
    <div className="space-y-1">
      {/* Document Upload Section - Only show after cbGenPayment is saved */}
      {paymentId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.cb}
          transactionId={CBTransactionId.cbgenpayment}
          recordId={paymentId}
          recordNo={paymentNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
