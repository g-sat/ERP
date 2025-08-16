"use client"

import { IPayrollDashboard } from "@/interfaces/payrun"
import { AlertCircle, Calendar, Users } from "lucide-react"
import { toast } from "sonner"

import { usePersist } from "@/hooks/use-common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface ProcessPayRunCardProps {
  payRun: IPayrollDashboard
  onProcess?: (payrollRunId?: number) => void
  onDraft?: (payrollRunId?: number) => void
  onApprove?: (payrollRunId?: number) => void
}

export function ProcessPayRunCard({
  payRun,
  onProcess,
  onDraft,
  onApprove,
}: ProcessPayRunCardProps) {
  // Default values when payRun is undefined
  const defaultPayRun = {
    payrollRunId: 0,
    month: "Current Month",
    paymentDate: new Date().toISOString(),
    employeeCount: 0,
    status: "LOADING",
    isPaid: false,
    isSubmitted: false,
    isPayruns: false,
    totalNetPay: 0,
    payPeriodStart: new Date(),
    payPeriodEnd: new Date(),
    warningMessage: "",
    showCreatePayRunButton: true,
    showViewDetailsButton: false,
    showViewDetailsAndPayButton: false,
  }

  const currentPayRun = payRun || defaultPayRun

  // Generate pay run API call
  const { mutate: generatePayRun, isPending: isGenerating } = usePersist(
    `/hr/payrollruns/generate/${currentPayRun.payrollRunId}`
  )

  // Function to get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return "bg-blue-600"
      case "approved":
        return "bg-green-600"
      case "rejected":
        return "bg-red-600"
      case "draft":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Function to get button text and action based on status
  const getButtonConfig = () => {
    if (currentPayRun.showViewDetailsAndPayButton) {
      return {
        text: "View Details & Pay",
        action: () => onApprove?.(currentPayRun.payrollRunId),
        color: "bg-green-600 hover:bg-green-700",
        loading: false,
      }
    }
    if (currentPayRun.showViewDetailsButton) {
      return {
        text: "View Details",
        action: () => onDraft?.(currentPayRun.payrollRunId),
        color: "bg-blue-600 hover:bg-blue-700",
        loading: false,
      }
    }
    return {
      text: isGenerating ? "Creating..." : "Create Pay Run",
      action: async () => {
        try {
          await generatePayRun({})
          toast.success("Pay run created successfully")
          onProcess?.(currentPayRun.payrollRunId)
        } catch (error) {
          toast.error("Failed to create pay run")
          console.error("Error creating pay run:", error)
        }
      },
      color: "bg-blue-600 hover:bg-blue-700",
      loading: isGenerating,
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <Card className="border-2 border-blue-100 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <CardTitle className="text-lg">
            Process Pay Run for {currentPayRun.month}
          </CardTitle>
          <Badge
            variant="default"
            className={getStatusBadgeColor(currentPayRun.status)}
          >
            {currentPayRun.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                EMPLOYEES&apos; NET PAY
              </p>
              <div className="text-base font-semibold text-orange-600">
                {Number(currentPayRun.totalNetPay) > 0 ? (
                  <CurrencyFormatter
                    amount={Number(currentPayRun.totalNetPay)}
                    size="md"
                  />
                ) : (
                  <span className="text-lg font-semibold text-red-600">
                    {currentPayRun.totalNetPay}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                PAYMENT DATE
              </p>
              <p className="text-base font-semibold">
                {new Date(currentPayRun.paymentDate).toLocaleDateString(
                  "en-US",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  NO. OF EMPLOYEES
                </p>
                <p className="text-base font-semibold">
                  {currentPayRun.employeeCount}
                </p>
              </div>
            </div>
            <Button
              onClick={buttonConfig.action}
              className={buttonConfig.color}
              disabled={buttonConfig.loading}
            >
              {buttonConfig.text}
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>
            Please process and approve this pay run before{" "}
            {new Date(currentPayRun.paymentDate).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
