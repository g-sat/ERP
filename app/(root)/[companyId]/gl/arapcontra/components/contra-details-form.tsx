"use client"

import { useState } from "react"
import {
  GLContraDtSchemaType,
  GLContraHdSchemaType,
} from "@/schemas/gl-arapcontra"
import { Plus, X } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface ContraDetailsFormProps {
  form: UseFormReturn<GLContraHdSchemaType>
}

export default function ContraDetailsForm({ form }: ContraDetailsFormProps) {
  const { control, watch, setValue, getValues } = form
  const [isAddingDetail, setIsAddingDetail] = useState(false)

  const details = watch("data_details") || []

  const addDetail = () => {
    const newDetail: GLContraDtSchemaType = {
      companyId: 0,
      contraId: 0,
      contraNo: "",
      itemNo: details.length + 1,
      moduleId: 0,
      transactionId: 0,
      documentId: 0,
      documentNo: "",
      docCurrencyId: 0,
      docExhRate: 0,
      referenceNo: "",
      docAccountDate: new Date(),
      docDueDate: new Date(),
      docTotAmt: 0,
      docTotLocalAmt: 0,
      docBalAmt: 0,
      docBalLocalAmt: 0,
      allocAmt: 0,
      allocLocalAmt: 0,
      docAllocAmt: 0,
      docAllocLocalAmt: 0,
      centDiff: 0,
      exhGainLoss: 0,
      editVersion: 0,
    }

    setValue("data_details", [...details, newDetail])
    setIsAddingDetail(true)
  }

  const removeDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index)
    setValue("data_details", updatedDetails)
  }

  const updateDetail = (
    index: number,
    field: keyof GLContraDtSchemaType,
    value: any
  ) => {
    const updatedDetails = [...details]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    setValue("data_details", updatedDetails)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Add Contra Detail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Document Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={control}
              name="data_details.0.documentNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter document number"
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        if (details.length > 0) {
                          updateDetail(0, "documentNo", e.target.value)
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="data_details.0.referenceNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter reference number"
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        if (details.length > 0) {
                          updateDetail(0, "referenceNo", e.target.value)
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="data_details.0.moduleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0
                        field.onChange(value)
                        if (details.length > 0) {
                          updateDetail(0, "moduleId", value)
                        }
                      }}
                      placeholder="Enter module ID"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Document Dates */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="data_details.0.docAccountDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={
                        field.value
                          ? typeof field.value === "string"
                            ? field.value.split("T")[0]
                            : field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        if (details.length > 0) {
                          updateDetail(0, "docAccountDate", e.target.value)
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="data_details.0.docDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={
                        field.value
                          ? typeof field.value === "string"
                            ? field.value.split("T")[0]
                            : field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        if (details.length > 0) {
                          updateDetail(0, "docDueDate", e.target.value)
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Document Amounts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={control}
              name="data_details.0.docTotAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0
                        field.onChange(value)
                        if (details.length > 0) {
                          updateDetail(0, "docTotAmt", value)
                        }
                      }}
                      placeholder="0.00"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="data_details.0.docTotLocalAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Total Local Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0
                        field.onChange(value)
                        if (details.length > 0) {
                          updateDetail(0, "docTotLocalAmt", value)
                        }
                      }}
                      placeholder="0.00"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="data_details.0.allocAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0
                        field.onChange(value)
                        if (details.length > 0) {
                          updateDetail(0, "allocAmt", value)
                        }
                      }}
                      placeholder="0.00"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="data_details.0.allocLocalAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Local Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value) || 0
                        field.onChange(value)
                        if (details.length > 0) {
                          updateDetail(0, "allocLocalAmt", value)
                        }
                      }}
                      placeholder="0.00"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDetail}
              disabled={isAddingDetail}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Detail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
