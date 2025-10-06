// main-tab.tsx
"use client"

import React, { useRef } from "react"
import { IVisibleFields } from "@/interfaces/setting"
import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { UseFormReturn } from "react-hook-form"

import PaymentDetailsForm from "./payment-details-form"
import PaymentDetailsTable from "./payment-details-table"
import PaymentForm from "./payment-form"

interface MainProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
}

export default function Main({
  form,
  onSuccessAction,
  isEdit,
  visible,
}: MainProps) {
  const addRowRef = useRef<((rowData: any) => void) | null>(null)

  const handleAddRow = (rowData: any) => {
    if (addRowRef.current) {
      addRowRef.current(rowData)
    }
  }

  return (
    <div className="divide-y">
      <PaymentForm
        form={form}
        onSuccessAction={onSuccessAction}
        isEdit={isEdit}
        visible={visible}
      />
      <PaymentDetailsForm onAddRow={handleAddRow} />
      <PaymentDetailsTable
        form={form}
        visible={visible}
        onAddRowRef={addRowRef}
      />
    </div>
  )
}
