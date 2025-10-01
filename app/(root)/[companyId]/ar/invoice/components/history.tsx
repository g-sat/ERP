"use client"

import { ArInvoiceHdSchemaType } from "@/schemas/invoice"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<ArInvoiceHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function History({
  form,
  isEdit: _isEdit,
  moduleId,
  transactionId,
}: HistoryProps) {
  const { decimals } = useAuthStore()
  const _dateFormat = decimals[0]?.dateFormat || "yyyy-MM-dd"

  const accountDetails = {
    createdBy: "", // Default value since createBy doesn't exist in form schema
    createdDate: "", // Default value since createDate doesn't exist in form schema
    editBy: null, // Default value since editBy doesn't exist in form schema
    editDate: "", // Default value since editDate doesn't exist in form schema
    cancelBy: "", // Default value since cancelBy doesn't exist in form schema
    cancelDate: "", // Default value since cancelDate doesn't exist in form schema
    balanceAmt: Number(form.getValues().balAmt || 0),
    balanceBaseAmt: Number(form.getValues().balLocalAmt || 0),
    paymentAmt: Number(form.getValues().payAmt || 0),
    paymentBaseAmt: Number(form.getValues().payLocalAmt || 0),
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <PaymentDetails
        invoiceId={form.getValues().invoiceId}
        moduleId={moduleId}
        transactionId={transactionId}
      />
      <GLPostDetails
        invoiceId={form.getValues().invoiceId}
        moduleId={moduleId}
        transactionId={transactionId}
      />
      <EditVersionDetails invoiceId={form.getValues().invoiceId} />
    </div>
  )
}
