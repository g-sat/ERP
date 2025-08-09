"use client"

import { Badge } from "@/components/ui/badge"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayRunHistory {
  id: number
  paymentDate: string
  payrollType: string
  payrollPeriod: string
  status: string
  totalAmount: number
  employeeCount: number
}

interface PayRunHistoryTableProps {
  data: PayRunHistory[]
}

export function PayRunHistoryTable({ data }: PayRunHistoryTableProps) {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 text-left font-medium">PAYMENT DATE</th>
              <th className="p-4 text-left font-medium">PAYROLL TYPE</th>
              <th className="p-4 text-left font-medium">DETAILS</th>
              <th className="p-4 text-left font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((payRun) => (
              <tr key={payRun.id} className="border-b">
                <td className="p-4">
                  {new Date(payRun.paymentDate).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-4">{payRun.payrollType}</td>
                <td className="p-4">
                  <div>
                    <p className="font-medium">{payRun.payrollPeriod}</p>
                    <p className="text-muted-foreground text-sm">
                      {payRun.employeeCount} employees •{" "}
                      <CurrencyFormatter amount={payRun.totalAmount} />
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant="default"
                    className={
                      payRun.status === "PAID"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                    }
                  >
                    {payRun.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
