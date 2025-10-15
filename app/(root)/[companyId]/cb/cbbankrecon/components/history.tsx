"use client"

import { CbBankReconHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<CbBankReconHdSchemaType>
  isEdit: boolean
}

export default function History({ form, isEdit: _isEdit }: HistoryProps) {
  const { decimals } = useAuthStore()
  const _dateFormat = decimals[0]?.dateFormat || "yyyy-MM-dd"

  const formValues = form.getValues()
  const accountDetails = {
    createBy: formValues.createById?.toString() || "",
    createDate: (formValues.createDate || "").toString(),
    editBy: formValues.editById?.toString() || "",
    editDate: formValues.editDate ? formValues.editDate?.toString() : "",
    cancelBy: formValues.cancelById?.toString() || "",
    cancelDate: formValues.cancelDate ? formValues.cancelDate?.toString() : "",
    balanceAmt: Number(formValues.opBalAmt || 0),
    balanceBaseAmt: Number(formValues.clBalAmt || 0),
    paymentAmt: Number(formValues.totAmt || 0),
    paymentBaseAmt: Number(formValues.totAmt || 0),
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <PaymentDetails invoiceId={form.getValues().reconId || ""} />
      <GLPostDetails invoiceId={form.getValues().reconId || ""} />
      <EditVersionDetails invoiceId={form.getValues().reconId || ""} />
    </div>
  )
}
