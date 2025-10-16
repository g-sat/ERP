"use client"

import { CbPettyCashHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"

interface HistoryProps {
  form: UseFormReturn<CbPettyCashHdSchemaType>
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
    appBy: formValues.appBy || "",
    appDate: formValues.appDate ? formValues.appDate?.toString() : "",
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />
      <GLPostDetails invoiceId={form.getValues().paymentId || ""} />
      <EditVersionDetails invoiceId={form.getValues().paymentId || ""} />
    </div>
  )
}
