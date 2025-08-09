"use client"

import { AlertCircle, Calendar, DollarSign, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PayRun {
  month: string
  paymentDate: string
  employeeCount: number
  status: string
  netPayStatus: string
}

interface ProcessPayRunCardProps {
  payRun: PayRun
  onProcess: () => void
  onCreatePayRun: () => void
}

export function ProcessPayRunCard({
  payRun,
  onProcess,
  onCreatePayRun,
}: ProcessPayRunCardProps) {
  return (
    <Card className="border-2 border-blue-100 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Process Pay Run for {payRun.month}
          </CardTitle>
          <Badge variant="default" className="bg-green-600">
            {payRun.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-3">
            <DollarSign className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                EMPLOYEES' NET PAY
              </p>
              <p className="text-lg font-semibold text-orange-600">
                {payRun.netPayStatus}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                PAYMENT DATE
              </p>
              <p className="text-lg font-semibold">
                {new Date(payRun.paymentDate).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Users className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                NO. OF EMPLOYEES
              </p>
              <p className="text-lg font-semibold">{payRun.employeeCount}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center space-x-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              Please process and approve this pay run before{" "}
              {new Date(payRun.paymentDate).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <Button onClick={onProcess} className="bg-blue-600 hover:bg-blue-700">
            Create Pay Run
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
