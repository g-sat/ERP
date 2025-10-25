"use client"

import { CbBankReconHdSchemaType } from "@/schemas"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"

interface HistoryProps {
  form: UseFormReturn<CbBankReconHdSchemaType>
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
      <EditVersionDetails invoiceId={form.getValues().reconId || ""} />
    </div>
  )
}
