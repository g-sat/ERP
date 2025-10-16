"use client"

import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
import { useAuthStore } from "@/stores/auth-store"
import { UseFormReturn } from "react-hook-form"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"

interface HistoryProps {
  form: UseFormReturn<GLContraHdSchemaType>
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
    appBy: formValues.appById?.toString() || "",
    appDate: formValues.appDate ? formValues.appDate?.toString() : "",
  }

  return (
    <div className="space-y-4">
      <AccountDetails {...accountDetails} />

      <GLPostDetails invoiceId={form.getValues().contraId || ""} />
      <EditVersionDetails contraId={form.getValues().contraId || ""} />
    </div>
  )
}
