"use client"

import { ArInvoiceHdFormValues } from "@/schemas/invoice"
import { useAuthStore } from "@/stores/auth-store"
import { format } from "date-fns"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<ArInvoiceHdFormValues>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function History({
  form,
  isEdit,
  moduleId,
  transactionId,
}: HistoryProps) {
  const { decimals } = useAuthStore()
  const dateFormat = decimals[0]?.dateFormat || "yyyy-MM-dd"

  const accountDetails = {
    createdBy: String(form.getValues().createBy || ""),
    createdDate: form.getValues().createDate
      ? format(form.getValues().createDate as Date, dateFormat)
      : "",
    editBy: form.getValues().editBy ? String(form.getValues().editBy) : null,
    editDate: form.getValues().editDate
      ? format(form.getValues().editDate as Date, dateFormat)
      : "",
    cancelBy: form.getValues().cancelBy
      ? String(form.getValues().cancelBy)
      : "",
    cancelDate: form.getValues().cancelDate
      ? format(form.getValues().cancelDate as Date, dateFormat)
      : "",
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
