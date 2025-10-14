"use client"

import { useState } from "react"
import {
  handleGstPercentageChange,
  handleTotalamountChange,
  setGSTPercentage,
} from "@/helpers/account"
import { ICbGenPaymentDt } from "@/interfaces/cb-genpayment"
import {
  IBargeLookup,
  IChartofAccountLookup,
  IDepartmentLookup,
  IEmployeeLookup,
  IGstLookup,
  IPortLookup,
  IVesselLookup,
  IVoyageLookup,
} from "@/interfaces/lookup"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  CbGenPaymentDtSchemaType,
  CbGenPaymentHdSchemaType,
  cbGenPaymentDtSchema,
} from "@/schemas/cb-genpayment"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, UseFormReturn, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import BargeAutocomplete from "@/components/autocomplete/autocomplete-barge"
import ChartOfAccountAutocomplete from "@/components/autocomplete/autocomplete-chartofaccount"
import DepartmentAutocomplete from "@/components/autocomplete/autocomplete-department"
import EmployeeAutocomplete from "@/components/autocomplete/autocomplete-employee"
import GSTAutocomplete from "@/components/autocomplete/autocomplete-gst"
import PortAutocomplete from "@/components/autocomplete/autocomplete-port"
import VesselAutocomplete from "@/components/autocomplete/autocomplete-vessel"
import VoyageAutocomplete from "@/components/autocomplete/autocomplete-voyage"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomTextarea from "@/components/custom/custom-textarea"

import { defaultPaymentDetails } from "./cbgenpayment-defaultvalues"

const createDefaultValues = (itemNo: number): CbGenPaymentDtSchemaType => ({
  ...defaultPaymentDetails,
  itemNo,
  seqNo: itemNo,
})

interface PaymentDetailsFormProps {
  Hdform: UseFormReturn<CbGenPaymentHdSchemaType>
  onAddRowAction?: (rowData: ICbGenPaymentDt) => void
  onCancelEdit?: () => void
  editingDetail?: CbGenPaymentDtSchemaType | null
  visible: IVisibleFields
  required: IMandatoryFields
  companyId: number
  existingDetails?: CbGenPaymentDtSchemaType[]
}

export default function PaymentDetailsForm({
  Hdform,
  onAddRowAction,
  onCancelEdit: _onCancelEdit,
  editingDetail,
  visible,
  required,
  companyId: _companyId,
  existingDetails = [],
}: PaymentDetailsFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2

  const getNextItemNo = () => {
    if (existingDetails.length === 0) return 1
    const maxItemNo = Math.max(...existingDetails.map((d) => d.itemNo || 0))
    return maxItemNo + 1
  }

  const form = useForm<CbGenPaymentDtSchemaType>({
    resolver: zodResolver(cbGenPaymentDtSchema(required, visible)),
    mode: "onBlur",
    defaultValues: editingDetail || createDefaultValues(getNextItemNo()),
  })

  const [isFormDisabled] = useState(false)

  const onSubmit = async (data: CbGenPaymentDtSchemaType) => {
    try {
      if (onAddRowAction) {
        await onAddRowAction(data as unknown as ICbGenPaymentDt)
        form.reset(createDefaultValues(getNextItemNo() + 1))
      }
    } catch (error) {
      toast.error("Failed to add payment detail")
      console.error(error)
    }
  }

  const handleGLChange = async (selectedGL: IChartofAccountLookup | null) => {
    if (selectedGL) {
      await setGSTPercentage(
        Hdform,
        Hdform.getValues("data_details"),
        decimals[0],
        visible
      )
    }
  }

  const handleGSTChange = async (selectedGST: IGstLookup | null) => {
    if (selectedGST) {
      handleGstPercentageChange(Hdform, form.getValues(), decimals[0], visible)
    }
  }

  const handleAmountBlur = () => {
    handleTotalamountChange(form, Hdform, decimals[0], visible)
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-7 gap-2 rounded-md border-2 border-green-200 p-2"
      >
        {/* GL Account */}
        <ChartOfAccountAutocomplete
          form={form}
          name="glId"
          label="Chart of Account"
          isRequired={required?.m_GLId}
          onChangeEvent={handleGLChange}
          isDisabled={isFormDisabled}
          className="col-span-2"
        />

        {/* Total Amount */}
        <CustomNumberInput
          form={form}
          name="totAmt"
          label="Amount"
          round={amtDec}
          className="text-right"
          onBlurEvent={handleAmountBlur}
          isDisabled={isFormDisabled}
        />

        {/* Total Local Amount */}
        <CustomNumberInput
          form={form}
          name="totLocalAmt"
          label="Local Amount"
          round={locAmtDec}
          className="text-right"
          isDisabled={true}
        />

        {visible?.m_CtyCurr && (
          <CustomNumberInput
            form={form}
            name="totCtyAmt"
            label="Country Amount"
            round={amtDec}
            className="text-right"
            isDisabled={true}
          />
        )}

        {/* GST */}
        {visible?.m_GstId && (
          <GSTAutocomplete
            form={form}
            name="gstId"
            label="GST"
            isRequired={required?.m_GstId}
            onChangeEvent={handleGSTChange}
            isDisabled={isFormDisabled}
          />
        )}

        {/* GST Amount */}
        {visible?.m_GstId && (
          <CustomNumberInput
            form={form}
            name="gstAmt"
            label="GST Amount"
            round={amtDec}
            className="text-right"
            isDisabled={true}
          />
        )}

        {/* GST Local Amount */}
        {visible?.m_GstId && (
          <CustomNumberInput
            form={form}
            name="gstLocalAmt"
            label="GST Local Amount"
            round={locAmtDec}
            className="text-right"
            isDisabled={true}
          />
        )}

        {/* Department */}
        {visible?.m_DepartmentId && (
          <DepartmentAutocomplete
            form={form}
            name="departmentId"
            label="Department"
            isRequired={required?.m_DepartmentId}
            isDisabled={isFormDisabled}
          />
        )}

        {/* Employee */}
        {visible?.m_EmployeeId && (
          <EmployeeAutocomplete
            form={form}
            name="employeeId"
            label="Employee"
            isRequired={required?.m_EmployeeId}
            isDisabled={isFormDisabled}
          />
        )}

        {/* Port */}
        {visible?.m_PortId && (
          <PortAutocomplete
            form={form}
            name="portId"
            label="Port"
            isRequired={required?.m_PortId}
            isDisabled={isFormDisabled}
          />
        )}

        {/* Vessel */}
        {visible?.m_VesselId && (
          <VesselAutocomplete
            form={form}
            name="vesselId"
            label="Vessel"
            isRequired={required?.m_VesselId}
            isDisabled={isFormDisabled}
          />
        )}

        {/* Barge */}
        {visible?.m_BargeId && (
          <BargeAutocomplete
            form={form}
            name="bargeId"
            label="Barge"
            isRequired={required?.m_BargeId}
            isDisabled={isFormDisabled}
          />
        )}

        {/* Voyage */}
        {visible?.m_VoyageId && (
          <VoyageAutocomplete
            form={form}
            name="voyageId"
            label="Voyage"
            isRequired={required?.m_VoyageId}
            isDisabled={isFormDisabled}
          />
        )}

        {/* Remarks */}
        {visible?.m_Remarks && (
          <CustomTextarea
            form={form}
            name="remarks"
            label="Remarks"
            isRequired={required?.m_Remarks}
            className="col-span-2"
            isDisabled={isFormDisabled}
          />
        )}

        {/* Submit Button */}
        <div className="col-span-7 flex justify-end gap-2">
          <Button type="submit" disabled={isFormDisabled}>
            {editingDetail ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
