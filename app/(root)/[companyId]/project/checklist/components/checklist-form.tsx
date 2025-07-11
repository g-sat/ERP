"use client"

import { useEffect, useState } from "react"
import { IJobOrderHd } from "@/interfaces/checklist"
import { JobOrderHdFormValues, JobOrderHdSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Edit3, RotateCcw, Save, X, XCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  useDeleteJobOrder,
  useSaveJobOrder,
  useUpdateJobOrder,
} from "@/hooks/use-checklist"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AddressAutocomplete from "@/components/ui-custom/autocomplete-address"
import ContactAutocomplete from "@/components/ui-custom/autocomplete-contact"
import CustomerAutocomplete from "@/components/ui-custom/autocomplete-customer"
import PortAutocomplete from "@/components/ui-custom/autocomplete-port"
import VesselAutocomplete from "@/components/ui-custom/autocomplete-vessel"
import VoyageAutocomplete from "@/components/ui-custom/autocomplete-voyage"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"

interface ChecklistFormProps {
  jobData?: IJobOrderHd | null
  onSuccess?: () => void
  onCancel?: () => void
  isEdit?: boolean
  isConfirmed?: boolean
}

export function ChecklistForm({
  jobData,
  onSuccess,
  onCancel,
  isEdit = false,
  isConfirmed = false,
}: ChecklistFormProps) {
  type JobOrderFormValues = z.infer<typeof JobOrderHdSchema>
  const { currentCompany } = useAuthStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [cancelRemarks, setCancelRemarks] = useState("")

  // Hooks for save, update, and delete operations
  const saveJobOrder = useSaveJobOrder()
  const updateJobOrder = useUpdateJobOrder()
  const deleteJobOrder = useDeleteJobOrder()

  const form = useForm<JobOrderHdFormValues>({
    resolver: zodResolver(JobOrderHdSchema),
    defaultValues: {
      companyId: Number(currentCompany?.companyId) || 0,
      currencyId: jobData?.currencyId ?? 0,
      currencyCode: jobData?.currencyCode ?? "",
      currencyName: jobData?.currencyName ?? "",
      exhRate: jobData?.exhRate ?? 0,
      jobOrderId: jobData?.jobOrderId ?? 0,
      jobOrderNo: jobData?.jobOrderNo ?? "",
      jobOrderDate: jobData?.jobOrderDate ?? new Date(),
      imoNo: jobData?.imoNo ?? "",
      vesselDistance: jobData?.vesselDistance ?? 0,
      portId: jobData?.portId ?? 0,
      customerId: jobData?.customerId ?? 0,
      vesselId: jobData?.vesselId ?? 0,
      voyageId: jobData?.voyageId ?? 0,
      lastPortId: jobData?.lastPortId ?? 0,
      nextPortId: jobData?.nextPortId ?? 0,
      etaDate: jobData?.etaDate ?? new Date(),
      etdDate: jobData?.etdDate ?? new Date(),
      ownerName: jobData?.ownerName ?? "",
      ownerAgent: jobData?.ownerAgent ?? "",
      masterName: jobData?.masterName ?? "",
      charters: jobData?.charters ?? "",
      chartersAgent: jobData?.chartersAgent ?? "",
      invoiceDate: jobData?.invoiceDate ?? new Date(),
      seriesDate: jobData?.seriesDate ?? new Date(),
      addressId: jobData?.addressId ?? 0,
      contactId: jobData?.contactId ?? 0,
      natureOfCall: jobData?.natureOfCall ?? "",
      isps: jobData?.isps ?? "",
      isTaxable: jobData?.isTaxable ?? false,
      isClose: jobData?.isClose ?? false,
      isPost: jobData?.isPost ?? false,
      isActive: jobData?.isActive ?? true,
      remark1: jobData?.remark1 ?? "",
      remark2: jobData?.remark2 ?? "",
      statusId: jobData?.statusId ?? 0,
      gstId: jobData?.gstId ?? 0,
      totalAmt: jobData?.totalAmt ?? 0,
      totalLocalAmt: jobData?.totalLocalAmt ?? 0,
      editVersion: jobData?.editVersion ?? "",
      editById: jobData?.editById ?? 0,
      editDate: jobData?.editDate ?? new Date(),
      editBy: jobData?.editBy ?? "",
      createBy: jobData?.createBy ?? "",
      createDate: jobData?.createDate ?? new Date(),
    },
  })

  useEffect(() => {
    form.reset({
      jobOrderId: jobData?.jobOrderId ?? 0,
      jobOrderNo: jobData?.jobOrderNo ?? "",
      jobOrderDate: jobData?.jobOrderDate ?? new Date(),
      portId: jobData?.portId ?? 0,
      customerId: jobData?.customerId ?? 0,
      vesselId: jobData?.vesselId ?? 0,
      voyageId: jobData?.voyageId ?? 0,
      lastPortId: jobData?.lastPortId ?? 0,
      nextPortId: jobData?.nextPortId ?? 0,
      etaDate: jobData?.etaDate ?? new Date(),
      etdDate: jobData?.etdDate ?? new Date(),
      ownerName: jobData?.ownerName ?? "",
      ownerAgent: jobData?.ownerAgent ?? "",
      masterName: jobData?.masterName ?? "",
      charters: jobData?.charters ?? "",
      chartersAgent: jobData?.chartersAgent ?? "",
      invoiceDate: jobData?.invoiceDate ?? new Date(),
      seriesDate: jobData?.seriesDate ?? new Date(),
      addressId: jobData?.addressId ?? 0,
      contactId: jobData?.contactId ?? 0,
      natureOfCall: jobData?.natureOfCall ?? "",
      isps: jobData?.isps ?? "",
      isTaxable: jobData?.isTaxable ?? false,
      isClose: jobData?.isClose ?? false,
      isPost: jobData?.isPost ?? false,
      isActive: jobData?.isActive ?? true,
      remark1: jobData?.remark1 ?? "",
      remark2: jobData?.remark2 ?? "",
      statusId: jobData?.statusId ?? 0,
      gstId: jobData?.gstId ?? 0,
      totalAmt: jobData?.totalAmt ?? 0,
      totalLocalAmt: jobData?.totalLocalAmt ?? 0,
      editVersion: jobData?.editVersion ?? "",
    })
  }, [jobData, form])

  const onSubmit = async (data: JobOrderFormValues) => {
    try {
      const formData: Partial<IJobOrderHd> = {
        ...data,
      }

      if (isEdit) {
        await updateJobOrder.mutateAsync(formData)
      } else {
        await saveJobOrder.mutateAsync(formData)
      }

      onSuccess?.()
    } catch (error) {
      console.error("Error saving job order:", error)
    }
  }

  const handleDelete = async () => {
    if (!jobData?.jobOrderId) return

    try {
      await deleteJobOrder.mutateAsync(jobData.jobOrderId.toString())
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting job order:", error)
    }
  }

  const handleReset = () => {
    form.reset()
  }

  const isPending =
    saveJobOrder.isPending ||
    updateJobOrder.isPending ||
    deleteJobOrder.isPending

  return (
    <div className="max-w flex flex-col gap-2">
      {/* Action Buttons - Top Right */}
      <div className="mb-4 flex justify-end gap-2">
        {/* Close button */}
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          disabled={isPending}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Close
        </Button>

        {/* Reset button - only show in create mode */}
        {!isEdit && (
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            disabled={isPending}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}

        {/* Cancel button - only show in edit mode */}
        {isEdit && jobData?.jobOrderId && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" type="button" disabled={isPending}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Job Order</DialogTitle>
                <DialogDescription>
                  Please provide a reason for cancelling this job order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="deleteRemarks">Cancel Remarks</Label>
                <Textarea
                  id="deleteRemarks"
                  placeholder="Enter cancellation reason..."
                  value={cancelRemarks}
                  onChange={(e) => setCancelRemarks(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!cancelRemarks.trim()}
                >
                  <X className="mr-2 h-4 w-4" />
                  Confirm Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : isEdit ? (
            <>
              <Edit3 className="mr-2 h-4 w-4" />
              Update
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Submit
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Operation Card */}
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-2 text-lg font-semibold">Operation</div>
            <div className="grid grid-cols-5 gap-2">
              <CustomerAutocomplete
                form={form}
                name="customerId"
                label="Customer"
                isRequired
              />
              <PortAutocomplete form={form} name="portId" label="Port" />
              <CustomDateNew
                form={form}
                name="jobOrderDate"
                label="Job Order Date"
                isRequired
                dateFormat="dd/MM/yyyy"
              />
              <CustomInput
                form={form}
                name="jobOrderNo"
                label="Job Order No"
                isRequired
              />
              <VesselAutocomplete
                form={form}
                name="vesselId"
                label="Vessel"
                isRequired
              />
              <CustomInput form={form} name="imoNo" label="IMO No" />
              <VoyageAutocomplete
                form={form}
                name="voyageId"
                label="Voyage"
                isRequired
              />
              <PortAutocomplete
                form={form}
                name="lastPortId"
                label="Last Port"
                isRequired
              />
              <PortAutocomplete
                form={form}
                name="nextPortId"
                label="Next Port"
                isRequired
              />
              <CustomInput
                form={form}
                name="vesselDistance"
                label="Vessel Distance (NM)"
                type="number"
              />

              <CustomDateNew
                form={form}
                name="etaDate"
                label="ETA Date"
                dateFormat="dd/MM/yyyy"
              />
              <CustomDateNew
                form={form}
                name="etdDate"
                label="ETD Date"
                dateFormat="dd/MM/yyyy"
              />
              <CustomInput form={form} name="ownerName" label="Owner Name" />
              <CustomInput form={form} name="ownerAgent" label="Owner Agent" />
              <CustomInput form={form} name="masterName" label="Master Name" />
              <CustomInput form={form} name="charters" label="Charters" />
              <CustomInput
                form={form}
                name="chartersAgent"
                label="Charters Agent"
              />
              <CustomInput
                form={form}
                name="natureOfCall"
                label="Nature of Call"
                isRequired
              />
              <CustomInput form={form} name="isps" label="ISPS" isRequired />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2"></div>
          </div>

          {/* Accounts Card */}
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-2 text-lg font-semibold">Accounts</div>
            <div className="grid grid-cols-5 gap-2">
              <CustomDateNew
                form={form}
                name="invoiceDate"
                label="Invoice Date"
                dateFormat="dd/MM/yyyy"
              />
              <CustomDateNew
                form={form}
                name="seriesDate"
                label="Series Date"
                dateFormat="dd/MM/yyyy"
              />
              <AddressAutocomplete
                form={form}
                name="addressId"
                label="Address"
                isRequired
                customerId={form.getValues("customerId") || 0}
              />
              <ContactAutocomplete
                form={form}
                name="contactId"
                label="Contact"
                isRequired
                customerId={form.getValues("customerId") || 0}
              />
              <CustomSwitch form={form} name="isTaxable" label="Taxable" />
            </div>
          </div>

          {/* Status Card */}
          <div className="mb-4 rounded-lg border p-4">
            <div className="mb-2 text-lg font-semibold">Status</div>
            <div className="grid grid-cols-4 gap-2">
              <CustomSwitch
                form={form}
                name="isClose"
                label="Close"
                isRequired
              />
              <CustomSwitch form={form} name="isPost" label="Post" isRequired />
              <CustomSwitch
                form={form}
                name="isActive"
                label="Active Status"
                activeColor="success"
              />
              <CustomTextarea form={form} name="remark1" label="Remarks" />
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
