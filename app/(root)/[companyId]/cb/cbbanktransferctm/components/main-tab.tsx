// main-tab.tsx - IMPROVED VERSION
"use client"

import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { CbBankTransferCtmHdSchemaType } from "@/schemas"
import { UseFormReturn } from "react-hook-form"

import BankTransferCtmForm from "./cbbanktransferctm-form"

interface MainProps {
  form: UseFormReturn<CbBankTransferCtmHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  required,
  companyId,
}: MainProps) {
  return (
    <div className="w-full">
      <BankTransferCtmForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        required={required}
        companyId={companyId}
      />
    </div>
  )
}
