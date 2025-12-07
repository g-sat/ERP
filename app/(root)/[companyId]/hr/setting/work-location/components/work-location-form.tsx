"use client"

import {
  WorkLocationFormData,
  workLocationSchema,
} from "@/schemas/worklocation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form } from "@/components/ui/form"
import { CountryAutocomplete } from "@/components/autocomplete"
import CustomInput from "@/components/custom/custom-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextarea from "@/components/custom/custom-textarea"

interface Props {
  initialData?: WorkLocationFormData
  onSaveAction(data: WorkLocationFormData): void
}

export function WorkLocationForm({ initialData, onSaveAction }: Props) {
  const form = useForm<WorkLocationFormData>({
    resolver: zodResolver(workLocationSchema),
    defaultValues: {
      workLocationId: initialData?.workLocationId ?? 0,
      workLocationCode: initialData?.workLocationCode ?? "",
      workLocationName: initialData?.workLocationName ?? "",
      address1: initialData?.address1 ?? "",
      address2: initialData?.address2 ?? "",
      city: initialData?.city ?? "",
      countryId: initialData?.countryId ?? 0,
      postalCode: initialData?.postalCode ?? "",
      isActive: initialData?.isActive ?? true,
    },
    mode: "onChange",
  })

  return (
    <Form {...form}>
      <form
        id="work-location-form"
        onSubmit={form.handleSubmit(onSaveAction)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <CustomInput
            form={form}
            name="workLocationCode"
            label="Code"
            isRequired
          />
          <CustomInput
            form={form}
            name="workLocationName"
            label="Name"
            isRequired
          />
        </div>

        <CustomTextarea
          form={form}
          name="address1"
          label="Address 1"
          isRequired
        />
        <CustomTextarea form={form} name="address2" label="Address 2" />
        <div className="grid grid-cols-2 gap-4">
          <CustomInput form={form} name="city" label="City" isRequired />
          <CountryAutocomplete
            form={form}
            name="countryId"
            label="Country"
            isRequired
          />
        </div>
        <CustomInput form={form} name="postalCode" label="Postal Code" />
        <CustomSwitch form={form} name="isActive" label="Active" />
      </form>
    </Form>
  )
}
