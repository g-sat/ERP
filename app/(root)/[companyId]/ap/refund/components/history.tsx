"use client"

import { ApRefundHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<ApRefundHdSchemaType>
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
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <PaymentDetails refundId={form.getValues().refundId || ""} />
      <GLPostDetails refundId={form.getValues().refundId || ""} />
      <EditVersionDetails refundId={form.getValues().refundId || ""} />
    </div>
  )
}
