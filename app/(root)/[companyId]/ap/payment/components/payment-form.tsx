"use client"

import { useState } from "react"
import { IVisibleFields } from "@/interfaces/setting"
import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

interface PaymentFormProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  onSuccessAction: (action: string) => Promise<void>
  isEdit: boolean
  visible: IVisibleFields
}

export default function PaymentForm({
  form,
  onSuccessAction,
  isEdit,
  visible,
}: PaymentFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState({
    trnDate: false,
    accountDate: false,
    chequeDate: false,
  })

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Payment No */}
        <FormField
          control={form.control}
          name="paymentNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment No</FormLabel>
              <FormControl>
                <Input placeholder="Payment No" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reference No */}
        <FormField
          control={form.control}
          name="referenceNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference No</FormLabel>
              <FormControl>
                <Input placeholder="Reference No" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Date */}
        <FormField
          control={form.control}
          name="trnDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Transaction Date</FormLabel>
              <Popover
                open={isCalendarOpen.trnDate}
                onOpenChange={(open) =>
                  setIsCalendarOpen((prev) => ({ ...prev, trnDate: open }))
                }
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      setIsCalendarOpen((prev) => ({ ...prev, trnDate: false }))
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Date */}
        <FormField
          control={form.control}
          name="accountDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Account Date</FormLabel>
              <Popover
                open={isCalendarOpen.accountDate}
                onOpenChange={(open) =>
                  setIsCalendarOpen((prev) => ({ ...prev, accountDate: open }))
                }
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      setIsCalendarOpen((prev) => ({
                        ...prev,
                        accountDate: false,
                      }))
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Supplier */}
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Supplier ID"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bank */}
        <FormField
          control={form.control}
          name="bankId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Bank ID"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Type */}
        <FormField
          control={form.control}
          name="paymentTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Payment Type ID"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cheque No */}
        <FormField
          control={form.control}
          name="chequeNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cheque No</FormLabel>
              <FormControl>
                <Input placeholder="Cheque No" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cheque Date */}
        <FormField
          control={form.control}
          name="chequeDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cheque Date</FormLabel>
              <Popover
                open={isCalendarOpen.chequeDate}
                onOpenChange={(open) =>
                  setIsCalendarOpen((prev) => ({ ...prev, chequeDate: open }))
                }
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      setIsCalendarOpen((prev) => ({
                        ...prev,
                        chequeDate: false,
                      }))
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}
        <FormField
          control={form.control}
          name="currencyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Currency ID"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Exchange Rate */}
        <FormField
          control={form.control}
          name="exhRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exchange Rate</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Exchange Rate"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Amount */}
        <FormField
          control={form.control}
          name="totAmt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Total Amount"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Local Amount */}
        <FormField
          control={form.control}
          name="totLocalAmt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Local Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Total Local Amount"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem className="md:col-span-2 lg:col-span-3">
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
  )
}
