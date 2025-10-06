// main-tab.tsx
"use client"

import React, { useRef } from "react"
import { IVisibleFields } from "@/interfaces/setting"
import {
  ApInvoiceDtSchemaType,
  ApInvoiceHdSchemaType,
} from "@/schemas/ap-invoice"
import { UseFormReturn } from "react-hook-form"

import InvoiceDetailsForm from "./invoice-details-form"
import InvoiceDetailsTable from "./invoice-details-table"
import InvoiceForm from "./invoice-form"

// Extend ApInvoiceDtSchemaType to include id field
interface InvoiceDetailRow extends ApInvoiceDtSchemaType {
  id: string
}

interface MainProps {
  form: UseFormReturn<ApInvoiceHdSchemaType>
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
  const addRowRef = useRef<((rowData: InvoiceDetailRow) => void) | null>(null)

  const handleAddRow = (rowData: InvoiceDetailRow) => {
    if (addRowRef.current) {
      addRowRef.current(rowData)
    }
  }

  return (
    <div className="w-full divide-y">
      <InvoiceForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
        companyId={companyId}
      />
      <InvoiceDetailsForm onAddRow={handleAddRow} companyId={companyId} />
      <InvoiceDetailsTable
        form={form}
        visible={visible}
        onAddRowRef={addRowRef}
      />
    </div>
  )
}
