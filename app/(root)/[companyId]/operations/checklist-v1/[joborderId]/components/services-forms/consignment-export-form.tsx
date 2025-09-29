"use client"

import { useEffect } from "react"
import { IConsignmentExport, IJobOrderHd } from "@/interfaces/checklist"
import {
  ConsignmentExportSchema,
  ConsignmentExportSchemaType,
} from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Task } from "@/lib/operations-utils"
import { useChartofAccountLookup } from "@/hooks/use-lookup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CarrierTypeAutocomplete from "@/components/autocomplete/autocomplete-carriertype"
import ChargeAutocomplete from "@/components/autocomplete/autocomplete-charge"
import ChartOfAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import ConsignmentTypeAutocomplete from "@/components/autocomplete/autocomplete-consignmenttype"
import LandingTypeAutocomplete from "@/components/autocomplete/autocomplete-landingtype"
import ModeTypeAutocomplete from "@/components/autocomplete/autocomplete-modetype"
import StatusTaskAutocomplete from "@/components/autocomplete/autocomplete-status-task"
import UomAutocomplete from "@/components/autocomplete/autocomplete-uom"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/custom/custom-accordion"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import CustomInput from "@/components/custom/custom-input"
import CustomTextarea from "@/components/custom/custom-textarea"
import { FormLoadingSpinner } from "@/components/skeleton/loading-spinner"

interface ConsignmentExportFormProps {
  jobData: IJobOrderHd
  initialData?: IConsignmentExport
  taskDefaults?: Record<string, number> // Add taskDefaults prop
  submitAction: (data: ConsignmentExportSchemaType) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
}

export function ConsignmentExportForm({
  jobData,
  initialData,
  taskDefaults = {}, // Default to empty object
  submitAction,
  onCancel,
  isSubmitting = false,
  isConfirmed,
}: ConsignmentExportFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const dateFormat = decimals[0]?.dateFormat || "dd/MM/yyyy"

  // Get chart of account data to ensure it's loaded before setting form values
  const { isLoading: isChartOfAccountLoading } = useChartofAccountLookup(
    Number(jobData.companyId)
  )

  console.log("initialData :", initialData)
  const form = useForm<ConsignmentExportSchemaType>({
    resolver: zodResolver(ConsignmentExportSchema),
    defaultValues: {
      consignmentExportId: initialData?.consignmentExportId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.ConsignmentExport,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
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
      editVersion: initialData?.editVersion ?? 0,
    },
  })

  useEffect(() => {
    form.reset({
      consignmentExportId: initialData?.consignmentExportId ?? 0,
      jobOrderId: jobData.jobOrderId,
      jobOrderNo: jobData.jobOrderNo,
      taskId: Task.ConsignmentExport,
      chargeId: initialData?.chargeId ?? taskDefaults.chargeId ?? 0,
      glId: initialData?.glId ?? taskDefaults.glId ?? 0,
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
      editVersion: initialData?.editVersion ?? 0,
    })
  }, [
    initialData,
    taskDefaults,
    form,
    jobData.jobOrderId,
    jobData.jobOrderNo,
    isChartOfAccountLoading,
  ])

  // Show loading state while data is being fetched
  if (isChartOfAccountLoading) {
    return (
      <div className="max-w flex flex-col gap-2">
        <FormLoadingSpinner text="Loading form data..." />
      </div>
    )
  }

  const onSubmit = (data: ConsignmentExportSchemaType) => {
    submitAction(data)
  }

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
                companyId={jobData.companyId}
              />
              <ChartOfAccountAutocomplete
                form={form}
                name="glId"
                label="GL Account"
                isRequired={true}
                isDisabled={isConfirmed}
                companyId={jobData.companyId}
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

            {/* Audit Information Section */}
            {initialData &&
              (initialData.createBy ||
                initialData.createDate ||
                initialData.editBy ||
                initialData.editDate) && (
                <div className="space-y-3 pt-4">
                  <div className="border-t pt-4">
                    <CustomAccordion
                      type="single"
                      collapsible
                      className="bg-muted/30 rounded-lg border-0"
                    >
                      <CustomAccordionItem
                        value="audit-info"
                        className="border-none"
                      >
                        <CustomAccordionTrigger className="hover:bg-muted/50 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              Audit Trail
                            </span>
                            <div className="flex items-center gap-2">
                              {initialData.createDate && (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-1 text-xs"
                                >
                                  Created
                                </Badge>
                              )}
                              {initialData.editDate && (
                                <Badge
                                  variant="secondary"
                                  className="px-2 py-1 text-xs"
                                >
                                  Modified
                                </Badge>
                              )}
                              {initialData.editVersion > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="px-2 py-1 text-xs"
                                >
                                  Edit Version No. {initialData.editVersion}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CustomAccordionTrigger>
                        <CustomAccordionContent className="px-4 pb-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {initialData.createDate && (
                              <div className="bg-background rounded-md border p-2">
                                <div className="space-y-1">
                                  <p className="text-muted-foreground text-xs">
                                    Created By
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {initialData.createBy}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {format(
                                      new Date(initialData.createDate),
                                      datetimeFormat
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                            {initialData.editBy && (
                              <div className="bg-background rounded-md border p-2">
                                <div className="space-y-1">
                                  <p className="text-muted-foreground text-xs">
                                    Modified By
                                  </p>
                                  <p className="text-sm font-semibold">
                                    {initialData.editBy}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {initialData.editDate
                                      ? format(
                                          new Date(initialData.editDate),
                                          datetimeFormat
                                        )
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CustomAccordionContent>
                      </CustomAccordionItem>
                    </CustomAccordion>
                  </div>
                </div>
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
