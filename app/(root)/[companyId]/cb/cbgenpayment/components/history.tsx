"use client"

import { CbGenPaymentHdSchemaType } from "@/schemas/cb-genpayment"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<CbGenPaymentHdSchemaType>
  isEdit: boolean
}

export default function History({ form, isEdit: _isEdit }: HistoryProps) {
  const { decimals } = useAuthStore()
  const _dateFormat = decimals[0]?.dateFormat || "yyyy-MM-dd"

  const formValues = form.getValues()
  const accountDetails = {
    createBy: formValues.createBy || "",
    createDate: (formValues.createDate || "").toString(),
    editBy: formValues.editBy || "",
    editDate: formValues.editDate ? formValues.editDate?.toString() : "",
    cancelBy: formValues.cancelBy || "",
    cancelDate: formValues.cancelDate ? formValues.cancelDate?.toString() : "",
    balanceAmt: 0,
    balanceBaseAmt: 0,
    paymentAmt: Number(formValues.totAmt || 0),
    paymentBaseAmt: Number(formValues.totLocalAmt || 0),
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <PaymentDetails invoiceId={form.getValues().paymentId || ""} />
      <GLPostDetails invoiceId={form.getValues().paymentId || ""} />
      <EditVersionDetails invoiceId={form.getValues().paymentId || ""} />
    </div>
  )
}
