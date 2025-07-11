"use client"

import { useEffect } from "react"
import { ITariff } from "@/interfaces/tariff"
import { TariffFormValues, tariffSchema } from "@/schemas/tariff"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomNumberInput from "@/components/ui-custom/custom-number-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"

interface TariffFormProps {
  tariff?: ITariff
  onSave: (data: ITariff) => void
  mode: "create" | "edit" | "view"
}

export function TariffForm({ tariff, onSave, mode }: TariffFormProps) {
  const form = useForm<TariffFormValues>({
    resolver: zodResolver(tariffSchema),
    defaultValues: {
      task: tariff?.task || "",
      charge: tariff?.charge || "",
      uom: tariff?.uom || "",
      type: tariff?.type || "",
      fromPlace: tariff?.fromPlace || "",
      toPlace: tariff?.toPlace || "",
      displayRate: tariff?.displayRate || 0,
      basicRate: tariff?.basicRate || 0,
      minUnit: tariff?.minUnit || 0,
      maxUnit: tariff?.maxUnit,
      isAdditional: tariff?.isAdditional || false,
      additionalUnit: tariff?.additionalUnit,
      additionalRate: tariff?.additionalRate,
      isPrepayment: tariff?.isPrepayment || false,
      prepaymentRate: tariff?.prepaymentRate,
      isActive: tariff?.isActive || true,
      remarks: tariff?.remarks || "",
    },
  })

  useEffect(() => {
    if (tariff) {
      form.reset({
        task: tariff.task,
        charge: tariff.charge,
        uom: tariff.uom,
        type: tariff.type,
        fromPlace: tariff.fromPlace,
        toPlace: tariff.toPlace,
        displayRate: tariff.displayRate,
        basicRate: tariff.basicRate,
        minUnit: tariff.minUnit,
        maxUnit: tariff.maxUnit,
        isAdditional: tariff.isAdditional,
        additionalUnit: tariff.additionalUnit,
        additionalRate: tariff.additionalRate,
        isPrepayment: tariff.isPrepayment,
        prepaymentRate: tariff.prepaymentRate,
        isActive: tariff.isActive,
        remarks: tariff.remarks,
      })
    }
  }, [tariff, form])

  function onSubmit(data: TariffFormValues) {
    const tariffData: ITariff = {
      tariffId: tariff?.tariffId || "",
      ...data,
    }
    onSave(tariffData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CustomInput
            form={form}
            name="task"
            label="Task"
            placeholder="Enter task"
            isDisabled={mode === "view"}
          />
          <CustomInput
            form={form}
            name="charge"
            label="Charge"
            placeholder="Enter charge"
            isDisabled={mode === "view"}
          />
          <CustomInput
            form={form}
            name="uom"
            label="Unit of Measure"
            placeholder="Enter UOM"
            isDisabled={mode === "view"}
          />
          <CustomInput
            form={form}
            name="type"
            label="Type"
            placeholder="Enter type"
            isDisabled={mode === "view"}
          />
          <CustomInput
            form={form}
            name="fromPlace"
            label="From Place"
            placeholder="Enter from place"
            isDisabled={mode === "view"}
          />
          <CustomInput
            form={form}
            name="toPlace"
            label="To Place"
            placeholder="Enter to place"
            isDisabled={mode === "view"}
          />
          <CustomNumberInput
            form={form}
            name="displayRate"
            label="Display Rate"
            isRequired
            isDisabled={mode === "view"}
            round={2}
          />
          <CustomNumberInput
            form={form}
            name="basicRate"
            label="Basic Rate"
            isRequired
            isDisabled={mode === "view"}
            round={2}
          />
          <CustomNumberInput
            form={form}
            name="minUnit"
            label="Min Unit"
            isRequired
            isDisabled={false}
            round={2}
          />
          <CustomNumberInput
            form={form}
            name="maxUnit"
            label="Max Unit"
            isRequired
            isDisabled={false}
            round={2}
          />
          <CustomSwitch
            form={form}
            name="isAdditional"
            label="Additional"
            isDisabled={mode === "view"}
          />
          <CustomNumberInput
            form={form}
            name="additionalUnit"
            label="Additional Unit"
            isRequired
            isDisabled={false}
            round={2}
          />
          <CustomNumberInput
            form={form}
            name="additionalRate"
            label="Additional Rate"
            isRequired
            isDisabled={false}
            round={2}
          />
          <CustomNumberInput
            form={form}
            name="prepaymentRate"
            label="Prepayment Rate"
            isRequired
            isDisabled={false}
            round={2}
          />
          <CustomSwitch
            form={form}
            name="isPrepayment"
            label="Prepayment"
            isDisabled={mode === "view"}
          />
          <CustomSwitch
            form={form}
            name="isActive"
            label="Active"
            isDisabled={mode === "view"}
          />
          <CustomInput
            form={form}
            name="remarks"
            label="Remarks"
            placeholder="Enter remarks"
            isDisabled={mode === "view"}
          />
        </div>

        {mode !== "view" && (
          <div className="flex justify-end space-x-2">
            <Button type="submit">
              {mode === "create" ? "Create Tariff" : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
