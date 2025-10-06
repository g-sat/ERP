"use client"

import { ApPaymentHdSchemaType } from "@/schemas/ap-payment"
import { UseFormReturn } from "react-hook-form"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import AccountDetails from "./history/account-details"
import EditVersionDetails from "./history/edit-version-details"
import GLPostDetails from "./history/gl-post-details"
import PaymentDetails from "./history/payment-details"

interface HistoryProps {
  form: UseFormReturn<ApPaymentHdSchemaType>
  isEdit: boolean
  moduleId: number
  transactionId: number
}

export default function History({
  form,
  isEdit,
  moduleId,
  transactionId,
}: HistoryProps) {
  return (
    <div className="space-y-6 p-6">
      <h3 className="text-lg font-semibold">Payment History</h3>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="edit">Edit Version</TabsTrigger>
          <TabsTrigger value="gl-post">GL Post Details</TabsTrigger>
          <TabsTrigger value="payment">Payment Details</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountDetails
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>

        <TabsContent value="edit">
          <EditVersionDetails
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>

        <TabsContent value="gl-post">
          <GLPostDetails
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentDetails
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
