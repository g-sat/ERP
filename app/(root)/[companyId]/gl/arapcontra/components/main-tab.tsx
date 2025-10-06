"use client"

import { IVisibleFields } from "@/interfaces/setting"
import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import ContraDetailsForm from "./contra-details-form"
import ContraDetailsTable from "./contra-details-table"

interface MainTabProps {
  form: UseFormReturn<GLContraHdSchemaType>
  onSuccessAction: (action: string) => void
  isEdit: boolean
  visible: IVisibleFields | null
}

export default function MainTab({
  form,
  onSuccessAction,
  isEdit,
  visible,
}: MainTabProps) {
  const { control, watch, setValue, getValues } = form

  // Watch form values for calculations
  const watchedValues = watch()

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Contra Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Contra Number */}
            <FormField
              control={control}
              name="contraNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contra Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Auto-generated"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Reference Number */}
            <FormField
              control={control}
              name="referenceNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter reference number" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Transaction Date */}
            <FormField
              control={control}
              name="trnDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date *</FormLabel>
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
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Account Date */}
            <FormField
              control={control}
              name="accountDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Date *</FormLabel>
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
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Supplier ID */}
            <FormField
              control={control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Enter supplier ID"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Customer ID */}
            <FormField
              control={control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Enter customer ID"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Currency and Exchange Rate */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="currencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency ID *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Enter currency ID"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="exhRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Rate *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.0001"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Enter exchange rate"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Remarks */}
          <FormField
            control={control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter remarks" rows={3} />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Amount Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Amount Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={control}
              name="totAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="totLocalAmt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Local Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="exhGainLoss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Gain/Loss</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Contra Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contra Details</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSuccessAction("add-detail")}
          >
            Add Detail
          </Button>
        </div>

        {/* Details Form */}
        <ContraDetailsForm form={form} />

        {/* Details Table */}
        <ContraDetailsTable form={form} />
      </div>
    </div>
  )
}
