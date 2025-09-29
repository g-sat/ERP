// main-tab.tsx
"use client"

import { IVisibleFields } from "@/interfaces/setting"
import { ArInvoiceHdSchemaType } from "@/schemas/invoice"
import { UseFormReturn } from "react-hook-form"

import InvoiceDetailsTable from "./invoice-details-table"
import InvoiceForm from "./invoice-form"

interface MainProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>
  onSuccess: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
}

export default function Main({ form, onSuccess, isEdit, visible }: MainProps) {
  return (
    <div className="divide-y">
      <InvoiceForm
        form={form}
        onSuccess={onSuccess}
        isEdit={isEdit}
        visible={visible}
      />
      <InvoiceDetailsTable form={form} visible={visible} />
    </div>
  )
}
