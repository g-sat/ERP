"use client"

import { useEffect } from "react"
import { IConsignmentExport, IJobOrderHd } from "@/interfaces/checklist"
import {
  ConsignmentExportFormValues,
  ConsignmentExportSchema,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Task } from "@/lib/operations-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CarrierTypeAutocomplete from "@/components/ui-custom/autocomplete-carriertype"
import ChargeAutocomplete from "@/components/ui-custom/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/ui-custom/autocomplete-chartofaccount"
import ConsignmentTypeAutocomplete from "@/components/ui-custom/autocomplete-consignmenttype"
import LandingTypeAutocomplete from "@/components/ui-custom/autocomplete-landingtype"
import ModeTypeAutocomplete from "@/components/ui-custom/autocomplete-modetype"
import StatusTaskAutocomplete from "@/components/ui-custom/autocomplete-status-task"
import UomAutocomplete from "@/components/ui-custom/autocomplete-uom"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface ConsignmentExportFormProps {
  jobData: IJobOrderHd
  initialData?: IConsignmentExport
  submitAction: (data: ConsignmentExportFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function ConsignmentExportForm({
  jobData,
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: ConsignmentExportFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  console.log("initialData :", initialData)
  const form = useForm<ConsignmentExportFormValues>({
    resolver: zodResolver(ConsignmentExportSchema),
    defaultValues: {
      consignmentExportId: initialData?.consignmentExportId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.ConsignmentExport,
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      awbNo: initialData?.awbNo ?? "",
      carrierTypeId: initialData?.carrierTypeId ?? 0,
      uomId: initialData?.uomId ?? 0,
      modeTypeId: initialData?.modeTypeId ?? 0,
      consignmentTypeId: initialData?.consignmentTypeId ?? 0,
      landingTypeId: initialData?.landingTypeId ?? 0,
      noOfPcs: initialData?.noOfPcs ?? 1,
      weight: initialData?.weight ?? 0,
      pickupLocation: initialData?.pickupLocation ?? "",
      deliveryLocation: initialData?.deliveryLocation ?? "",
      clearedBy: initialData?.clearedBy ?? "",
      billEntryNo: initialData?.billEntryNo ?? "",
      declarationNo: initialData?.declarationNo ?? "",
      receiveDate: initialData?.receiveDate
        ? format(
            parseDate(initialData.receiveDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      deliverDate: initialData?.deliverDate
        ? format(
            parseDate(initialData.deliverDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      arrivalDate: initialData?.arrivalDate
        ? format(
            parseDate(initialData.arrivalDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      amountDeposited: initialData?.amountDeposited ?? 0,
      refundInstrumentNo: initialData?.refundInstrumentNo ?? "",
      statusId: initialData?.statusId ?? 802,
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
    },
  })

  useEffect(() => {
    form.reset({
      consignmentExportId: initialData?.consignmentExportId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.ConsignmentExport,
      chargeId: initialData?.chargeId ?? 0,
      glId: initialData?.glId ?? 0,
      awbNo: initialData?.awbNo ?? "",
      carrierTypeId: initialData?.carrierTypeId ?? 0,
      uomId: initialData?.uomId ?? 0,
      modeTypeId: initialData?.modeTypeId ?? 0,
      consignmentTypeId: initialData?.consignmentTypeId ?? 0,
      landingTypeId: initialData?.landingTypeId ?? 0,
      noOfPcs: initialData?.noOfPcs ?? 1,
      weight: initialData?.weight ?? 0,
      pickupLocation: initialData?.pickupLocation ?? "",
      deliveryLocation: initialData?.deliveryLocation ?? "",
      clearedBy: initialData?.clearedBy ?? "",
      billEntryNo: initialData?.billEntryNo ?? "",
      declarationNo: initialData?.declarationNo ?? "",
      receiveDate: initialData?.receiveDate
        ? format(
            parseDate(initialData.receiveDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      deliverDate: initialData?.deliverDate
        ? format(
            parseDate(initialData.deliverDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      arrivalDate: initialData?.arrivalDate
        ? format(
            parseDate(initialData.arrivalDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      amountDeposited: initialData?.amountDeposited ?? 0,
      refundInstrumentNo: initialData?.refundInstrumentNo ?? "",
      statusId: initialData?.statusId ?? 802,
      remarks: initialData?.remarks ?? "",
      debitNoteId: initialData?.debitNoteId ?? 0,
      debitNoteNo: initialData?.debitNoteNo ?? "",
    })
  }, [initialData, form, jobData.jobOrderId, jobData.jobOrderNo])

  const onSubmit = (data: ConsignmentExportFormValues) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-2">
            <div className="grid grid-cols-5 gap-2">
              <CustomInput
                form={form}
                name="awbNo"
                label="AWB Number"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <CarrierTypeAutocomplete
                form={form}
                name="carrierTypeId"
                label="Carrier Type"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="noOfPcs"
                label="Number of Pieces"
                type="number"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="weight"
                label="Weight"
                type="number"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <UomAutocomplete
                form={form}
                name="uomId"
                label="UOM"
                isRequired={true}
                isDisabled={isConfirmed}
              />

              <CustomDateNew
                form={form}
                name="receiveDate"
                label="Date Received"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <ConsignmentTypeAutocomplete
                form={form}
                name="consignmentTypeId"
                label="Consignment Type"
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <ModeTypeAutocomplete
                form={form}
                name="modeTypeId"
                label="Mode Type"
                isDisabled={isConfirmed}
              />

              <LandingTypeAutocomplete
                form={form}
                name="landingTypeId"
                label="Landing Type"
                isDisabled={isConfirmed}
              />
              <ChargeAutocomplete
                form={form}
                name="chargeId"
                label="Charge"
                taskId={Task.ConsignmentExport}
                isRequired={true}
                isDisabled={isConfirmed}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isConfirmed}
              />
              <CustomTextarea
                form={form}
                name="pickupLocation"
                label="Pickup Location"
                isDisabled={isConfirmed}
              />
              <CustomTextarea
                form={form}
                name="deliveryLocation"
                label="Delivery Location"
                isDisabled={isConfirmed}
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              <CustomDateNew
                form={form}
                name="deliverDate"
                label="Date Delivered"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="clearedBy"
                label="Cleared By"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="billEntryNo"
                label="Bill Entry No"
                isDisabled={isConfirmed}
              />
              <CustomInput
                form={form}
                name="declarationNo"
                label="Declaration No"
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="amountDeposited"
                label="Amount Deposited"
                type="number"
                isDisabled={isConfirmed}
              />

              <CustomInput
                form={form}
                name="refundInstrumentNo"
                label="Refund Instrument No"
                isDisabled={isConfirmed}
              />
              <CustomDateNew
                form={form}
                name="arrivalDate"
                label="Date Arrived"
                dateFormat={dateFormat}
                isDisabled={isConfirmed}
              />

              <StatusTaskAutocomplete
                form={form}
                name="statusId"
                label="Status"
                isRequired={true}
                isDisabled={isConfirmed}
              />
            </div>

            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <CustomAccordion
                  type="single"
                  collapsible
                  className="rounded-md border"
                >
                  <CustomAccordionItem value="audit-info">
                    <CustomAccordionTrigger className="px-4">
                      Audit Information
                    </CustomAccordionTrigger>
                    <CustomAccordionContent className="px-2">
                      <div className="grid grid-cols-2 gap-4">
                        {initialData.createDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Created By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.createBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {format(
                                  new Date(initialData.createDate),
                                  datetimeFormat
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {initialData.editBy && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">
                              Last Edited By
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-normal">
                                {initialData.editBy}
                              </Badge>
                              <span className="text-muted-foreground text-sm">
                                {initialData.editDate
                                  ? format(
                                      new Date(initialData.editDate),
                                      datetimeFormat
                                    )
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomAccordionContent>
                  </CustomAccordionItem>
                </CustomAccordion>
              )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Consignment Export"
                    : "Add Consignment Export"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
