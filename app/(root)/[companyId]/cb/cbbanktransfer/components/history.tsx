"use client"

import { CbBankTransferSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"

interface HistoryProps {
  form: UseFormReturn<CbBankTransferSchemaType>
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
    paymentAmt: Number(formValues.toTotAmt || 0),
    paymentBaseAmt: Number(formValues.toTotLocalAmt || 0),
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <GLPostDetails invoiceId={form.getValues().transferId || ""} />
      <EditVersionDetails invoiceId={form.getValues().transferId || ""} />
    </div>
  )
}
