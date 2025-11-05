// main-tab.tsx
"use client"

import { IVisibleFields } from "@/interfaces/setting"
import { ArInvoiceHdSchemaType } from "@/schemas/invoice"
import { UseFormReturn } from "react-hook-form"

import InvoiceDetailsTable from "./invoice-details-table"
import InvoiceForm from "./invoice-form"

interface MainProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  companyId: number
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
  companyId,
}: MainProps) {
  return (
    <div className="divide-y">
      <InvoiceForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        companyId={companyId}
      />
      <InvoiceDetailsTable form={form} visible={visible} />
    </div>
  )
}
