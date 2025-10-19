"use client"

import { useParams } from "next/navigation"
import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
import { UseFormReturn } from "react-hook-form"

import { GLTransactionId, ModuleId } from "@/lib/utils"
import EnhancedDocumentUpload from "@/components/custom/enhanced-document-upload"

interface OtherProps {
  form: UseFormReturn<GLContraHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const contraId = form.getValues("contraId") || "0"
  const contraNo = form.getValues("contraNo") || ""

  return (
    <div className="space-y-4">
      {/* Document Upload Section */}
      <EnhancedDocumentUpload
        moduleId={ModuleId.gl}
        transactionId={GLTransactionId.arapcontra}
        recordId={contraId}
        recordNo={contraNo}
        companyId={Number(companyId)}
        maxFileSize={10}
        maxFiles={10}
      />
    </div>
  )
}
