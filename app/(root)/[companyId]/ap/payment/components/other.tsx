"use client"

import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { UseFormReturn } from "react-hook-form"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface OtherProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  return (
    <div className="space-y-6 p-6">
      <h3 className="text-lg font-semibold">Other Information</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Bank Charges */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Bank Charges</h4>

          <FormField
            control={form.control}
            name="bankChargeGLId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Charge GL ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Bank Charge GL ID"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankChargesAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Charges Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Bank Charges Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankChargesLocalAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Charges Local Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Bank Charges Local Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Payment Currency */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Payment Currency</h4>

          <FormField
            control={form.control}
            name="payCurrencyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Currency ID</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Payment Currency ID"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payExhRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Exchange Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Payment Exchange Rate"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payTotAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Payment Total Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payTotLocalAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Total Local Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Payment Total Local Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Allocation Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Allocation Information</h4>

          <FormField
            control={form.control}
            name="unAllocTotAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unallocated Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unallocated Total Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unAllocTotLocalAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unallocated Total Local Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unallocated Total Local Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allocTotAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allocated Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Allocated Total Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allocTotLocalAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allocated Total Local Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Allocated Total Local Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Document Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Document Information</h4>

          <FormField
            control={form.control}
            name="docExhRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Exchange Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Document Exchange Rate"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="docTotAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Total Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Document Total Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="docTotLocalAmt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Total Local Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Document Total Local Amount"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exhGainLoss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Gain/Loss</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Exchange Gain/Loss"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Module Information */}
        <div className="space-y-4 md:col-span-2">
          <h4 className="text-md font-medium">Module Information</h4>

          <FormField
            control={form.control}
            name="moduleFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Module From</FormLabel>
                <FormControl>
                  <Input placeholder="Module From" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter remarks..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
