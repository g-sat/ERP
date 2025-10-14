"use client"

import { useEffect, useState } from "react"
import {
  ICBBatchPaymentDt,
  ICBBatchPaymentHd,
} from "@/interfaces/cb-batchpayment"
import { cbbatchpaymentHdSchema } from "@/schemas/cb-batchpayment"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  useGetCBBatchPaymentById,
  usePersistCBBatchPayment,
} from "@/hooks/use-cb-batchpayment"
import { useGet } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CBBatchPaymentFormProps {
  companyId: number
  paymentId?: string | null
  onClose: () => void
}

export default function CBBatchPaymentForm({
  companyId,
  paymentId,
  onClose,
}: CBBatchPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [details, setDetails] = useState<ICBBatchPaymentDt[]>([])

  const isEdit = !!paymentId

  // Get existing payment data for editing
  const { data: paymentData, isLoading: isLoadingPayment } =
    useGetCBBatchPaymentById(companyId, paymentId || "", { enabled: isEdit })

  // Get lookup data
  const { data: suppliersData } = useGet("/supplier", "suppliers")
  const { data: currenciesData } = useGet("/currency", "currencies")
  const { data: banksData } = useGet("/bank", "banks")
  const { data: glAccountsData } = useGet("/chartofaccount", "gl-accounts")

  const persistMutation = usePersistCBBatchPayment(companyId)

  const form = useForm<ICBBatchPaymentHd>({
    resolver: zodResolver(cbbatchpaymentHdSchema({}, {})),
    defaultValues: {
      companyId,
      paymentId: "",
      paymentNo: "",
      trnDate: new Date(),
      accountDate: new Date(),
      supplierId: 0,
      supplierCode: "",
      supplierName: "",
      currencyId: 0,
      currencyCode: "",
      currencyName: "",
      exhRate: 1,
      ctyExhRate: 1,
      bankId: 0,
      bankCode: "",
      bankName: "",
      totAmt: 0,
      totLocalAmt: 0,
      totCtyAmt: 0,
      remarks: "",
      isCancel: false,
      editVersion: 0,
      data_details: [],
    },
  })

  // Load existing data for editing
  useEffect(() => {
    if (paymentData?.data && isEdit) {
      const payment = paymentData.data
      form.reset({
        ...payment,
        trnDate: new Date(payment.trnDate),
        accountDate: new Date(payment.accountDate),
      })
      setDetails(payment.data_details || [])
    }
  }, [paymentData, isEdit, form])

  const onSubmit = async (data: ICBBatchPaymentHd) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        ...data,
        data_details: details,
        trnDate: data.trnDate.toISOString(),
        accountDate: data.accountDate.toISOString(),
      }

      await persistMutation.mutateAsync(submitData)
      onClose()
    } catch (error) {
      console.error("Error saving payment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addDetail = () => {
    const newDetail: ICBBatchPaymentDt = {
      paymentId: 0,
      paymentNo: "",
      itemNo: details.length + 1,
      seqNo: details.length + 1,
      invoiceDate: new Date(),
      supplierName: "",
      invoiceNo: "",
      gstNo: "",
      glId: 0,
      remarks: "",
      jobOrderId: 0,
      taskId: 0,
      serviceId: 0,
      totAmt: 0,
      totLocalAmt: 0,
      totCtyAmt: 0,
      gstId: 0,
      gstPercentage: 0,
      gstAmt: 0,
      gstLocalAmt: 0,
      gstCtyAmt: 0,
      editVersion: 0,
    }
    setDetails([...details, newDetail])
  }

  const removeDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index))
  }

  const updateDetail = (
    index: number,
    field: keyof ICBBatchPaymentDt,
    value: unknown
  ) => {
    const updatedDetails = [...details]
    updatedDetails[index] = { ...updatedDetails[index], [field]: value }
    setDetails(updatedDetails)
  }

  const calculateTotals = () => {
    const totalAmt = details.reduce(
      (sum, detail) => sum + (detail.totAmt || 0),
      0
    )
    const totalLocalAmt = details.reduce(
      (sum, detail) => sum + (detail.totLocalAmt || 0),
      0
    )
    const totalCtyAmt = details.reduce(
      (sum, detail) => sum + (detail.totCtyAmt || 0),
      0
    )

    form.setValue("totAmt", totalAmt)
    form.setValue("totLocalAmt", totalLocalAmt)
    form.setValue("totCtyAmt", totalCtyAmt)
  }

  useEffect(() => {
    calculateTotals()
  }, [details])

  if (isLoadingPayment) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit CB Batch Payment" : "New CB Batch Payment"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment No</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter payment number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Transaction Date */}
                  {visible?.m_TrnDate && (
                    <CustomDateNew
                      form={form}
                      name="trnDate"
                      label="Transaction Date"
                      isRequired={true}
                      onChangeEvent={handleTrnDateChange}
                    />
                  )}

                  {/* Account Date */}
                  {visible?.m_AccountDate && (
                    <CustomDateNew
                      form={form}
                      name="accountDate"
                      label="Account Date"
                      isRequired={true}
                      onChangeEvent={handleAccountDateChange}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const supplier = suppliersData?.data?.find(
                              (s: Record<string, unknown>) =>
                                s.id === Number(value)
                            )
                            field.onChange(Number(value))
                            form.setValue("supplierCode", supplier?.code || "")
                            form.setValue("supplierName", supplier?.name || "")
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliersData?.data?.map(
                              (supplier: Record<string, unknown>) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id.toString()}
                                >
                                  {supplier.name} ({supplier.code})
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currencyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const currency = currenciesData?.data?.find(
                              (c: Record<string, unknown>) =>
                                c.id === Number(value)
                            )
                            field.onChange(Number(value))
                            form.setValue("currencyCode", currency?.code || "")
                            form.setValue("currencyName", currency?.name || "")
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currenciesData?.data?.map(
                              (currency: Record<string, unknown>) => (
                                <SelectItem
                                  key={currency.id}
                                  value={currency.id.toString()}
                                >
                                  {currency.name} ({currency.code})
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const bank = banksData?.data?.find(
                              (b: Record<string, unknown>) =>
                                b.id === Number(value)
                            )
                            field.onChange(Number(value))
                            form.setValue("bankCode", bank?.code || "")
                            form.setValue("bankName", bank?.name || "")
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {banksData?.data?.map(
                              (bank: Record<string, unknown>) => (
                                <SelectItem
                                  key={bank.id}
                                  value={bank.id.toString()}
                                >
                                  {bank.name} ({bank.code})
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter remarks" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Details</CardTitle>
                  <Button type="button" onClick={addDetail} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Detail
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {details.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">
                    No payment details added yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {details.map((detail, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-medium">Detail #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDetail(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                              <Label>Invoice No</Label>
                              <Input
                                value={detail.invoiceNo || ""}
                                onChange={(e) =>
                                  updateDetail(
                                    index,
                                    "invoiceNo",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter invoice number"
                              />
                            </div>

                            <div>
                              <Label>Invoice Date</Label>
                              <Input
                                type="date"
                                value={
                                  detail.invoiceDate
                                    ? new Date(detail.invoiceDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  updateDetail(
                                    index,
                                    "invoiceDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div>
                              <Label>GL Account</Label>
                              <Select
                                value={detail.glId?.toString() || ""}
                                onValueChange={(value) =>
                                  updateDetail(index, "glId", Number(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select GL account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {glAccountsData?.data?.map(
                                    (account: Record<string, unknown>) => (
                                      <SelectItem
                                        key={account.id}
                                        value={account.id.toString()}
                                      >
                                        {account.accountName} (
                                        {account.accountCode})
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={detail.totAmt || ""}
                                onChange={(e) =>
                                  updateDetail(
                                    index,
                                    "totAmt",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="Enter amount"
                              />
                            </div>

                            <div>
                              <Label>Local Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={detail.totLocalAmt || ""}
                                onChange={(e) =>
                                  updateDetail(
                                    index,
                                    "totLocalAmt",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="Enter local amount"
                              />
                            </div>

                            <div>
                              <Label>GST Amount</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={detail.gstAmt || ""}
                                onChange={(e) =>
                                  updateDetail(
                                    index,
                                    "gstAmt",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="Enter GST amount"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <Label>Remarks</Label>
                              <Textarea
                                value={detail.remarks || ""}
                                onChange={(e) =>
                                  updateDetail(index, "remarks", e.target.value)
                                }
                                placeholder="Enter remarks"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
