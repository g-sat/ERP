"use client"

import { ApAdjustmentHdSchemaType } from "@/schemas/ap-adjustment"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<ApAdjustmentHdSchemaType>
  isEdit: boolean
}

export default function History({ form, isEdit: _isEdit }: HistoryProps) {
  const { decimals } = useAuthStore()
  const _dateFormat = decimals[0]?.dateFormat || "yyyy-MM-dd"

  const accountDetails = {
    createBy: form.getValues().createBy || "", // Default value since createBy doesn't exist in form schema
    createDate: form.getValues().createDate || "", // Default value since createDate doesn't exist in form schema
    editBy: form.getValues().editBy || "", // Default value since editBy doesn't exist in form schema
    editDate: form.getValues().editDate || "", // Default value since editDate doesn't exist in form schema
    cancelBy: form.getValues().cancelBy || "", // Default value since cancelBy doesn't exist in form schema
    cancelDate: form.getValues().cancelDate || "", // Default value since cancelDate doesn't exist in form schema
    balanceAmt: Number(form.getValues().balAmt || 0),
    balanceBaseAmt: Number(form.getValues().balLocalAmt || 0),
    paymentAmt: Number(form.getValues().payAmt || 0),
    paymentBaseAmt: Number(form.getValues().payLocalAmt || 0),
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <PaymentDetails adjustmentId={form.getValues().adjustmentId || ""} />
      <GLPostDetails adjustmentId={form.getValues().adjustmentId || ""} />
      <EditVersionDetails adjustmentId={form.getValues().adjustmentId || ""} />
    </div>
  )
}
