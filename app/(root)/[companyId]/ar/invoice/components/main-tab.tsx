// main-tab.tsx
"use client"

import { IVisibleFields } from "@/interfaces/setting"
import { ArInvoiceHdFormValues } from "@/schemas/invoice"
import { UseFormReturn } from "react-hook-form"

import InvoiceDetailsTable from "./invoice-details-table"
import InvoiceForm from "./invoice-form"

interface MainProps {
  form: UseFormReturn<ArInvoiceHdFormValues>
  onSave: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
  companyId: string
}

export default function Main({
  form,
  onSave,
  isEdit,
  visible,
  companyId,
}: MainProps) {
  return (
    <div className="divide-y">
      <InvoiceForm
        form={form}
        onSave={onSave}
        isEdit={isEdit}
        visible={visible}
      />
      <InvoiceDetailsTable
        form={form}
        visible={visible}
        companyId={companyId}
      />
    </div>
  )
}
