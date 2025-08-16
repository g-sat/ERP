"use client"

import { useParams, useRouter } from "next/navigation"
import { IPayRunHistory } from "@/interfaces/payrun"

import { useGet } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"

export function PayRunHistoryTable() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.companyId as string

  const { data: payRunData } = useGet<IPayRunHistory[]>(
    `/hr/payrollruns/history`,
    "pay-history"
  )
  const payRun = payRunData?.data as unknown as IPayRunHistory[]

  const handleRowClick = (payrollRunId: number) => {
    // Navigate to the payrun details page
    router.push(`/${companyId}/hr/payruns/${payrollRunId}/summary`)
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 text-left font-medium">PAYMENT DATE</th>
              <th className="p-4 text-left font-medium">PAYROLL NAME</th>
              <th className="p-4 text-left font-medium">PAY PERIOD</th>
              <th className="p-4 text-left font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {payRun && Array.isArray(payRun) ? (
              payRun.map((payRun) => (
                <tr
                  key={payRun.payrollRunId}
                  className="hover:bg-muted/50 cursor-pointer border-b"
                  onClick={() => handleRowClick(payRun.payrollRunId)}
                >
                  <td className="p-4">
                    {new Date(payRun.payDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">{payRun.payName}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{payRun.payPeriodStart}</p>
                      <p className="text-muted-foreground text-sm">
                        to {payRun.payPeriodEnd}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="default"
                      className={
                        payRun.status === "Paid"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }
                    >
                      {payRun.status}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-muted-foreground p-4 text-center"
                >
                  {payRun ? "No payroll history found" : "Loading..."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
