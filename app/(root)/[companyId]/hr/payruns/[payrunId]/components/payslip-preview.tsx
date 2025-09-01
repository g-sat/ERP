"use client"

import { IPayrollEmployeeHd } from "@/interfaces/payrun"
import { format } from "date-fns"
import { Download, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayslipPreviewProps {
  employee: IPayrollEmployeeHd
  payrunId: string
  payPeriod: string
  payDate: string
  companyName: string
  onGeneratePDF: () => Promise<void>
  onDownloadPDF: () => Promise<void>
}

export const PayslipPreview = ({
  employee,
  payrunId,
  payPeriod,
  payDate,
  companyName,
  onGeneratePDF,
  onDownloadPDF,
}: PayslipPreviewProps) => {
  const currentDate = format(new Date(), "dd/MM/yyyy")

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {companyName}
            </CardTitle>
            <p className="mt-1 text-gray-600">Employee Payslip Preview</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Generated on: {currentDate}</p>
            <p className="text-sm text-gray-600">Payrun ID: {payrunId}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Employee Information */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Employee Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Employee Name:
                </span>
                <span className="text-gray-900">{employee.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">
                  Employee Code:
                </span>
                <span className="text-gray-900">{employee.employeeCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Department:</span>
                <span className="text-gray-900">{employee.departmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Company:</span>
                <span className="text-gray-900">{employee.companyName}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Pay Period
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Pay Period:</span>
                <span className="text-gray-900">{payPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Pay Date:</span>
                <span className="text-gray-900">{payDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Present Days:</span>
                <span className="text-gray-900">{employee.presentDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Past Days:</span>
                <span className="text-gray-900">{employee.pastDays}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings and Deductions */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Earnings */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800 text-green-700">
              Earnings
            </h3>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">
                    Basic Salary:
                  </span>
                  <span className="font-semibold text-gray-900">
                    <CurrencyFormatter amount={employee.basicSalary} />
                  </span>
                </div>
                {employee.data_details?.map((detail, index) => {
                  if (detail.componentType === "EARNING" && detail.amount > 0) {
                    return (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-700">
                          {detail.componentName}:
                        </span>
                        <span className="font-semibold text-gray-900">
                          <CurrencyFormatter amount={detail.amount} />
                        </span>
                      </div>
                    )
                  }
                  return null
                })}
                <div className="mt-3 border-t border-green-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">
                      Total Earnings:
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      <CurrencyFormatter amount={employee.totalEarnings} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800 text-red-700">
              Deductions
            </h3>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="space-y-3">
                {employee.data_details?.map((detail, index) => {
                  if (
                    detail.componentType === "DEDUCTION" &&
                    detail.amount > 0
                  ) {
                    return (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-700">
                          {detail.componentName}:
                        </span>
                        <span className="font-semibold text-gray-900">
                          <CurrencyFormatter amount={detail.amount} />
                        </span>
                      </div>
                    )
                  }
                  return null
                })}
                {employee.totalDeductions === 0 && (
                  <div className="text-gray-500 italic">No deductions</div>
                )}
                <div className="mt-3 border-t border-red-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">
                      Total Deductions:
                    </span>
                    <span className="text-lg font-bold text-red-700">
                      <CurrencyFormatter amount={employee.totalDeductions} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="mb-6">
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-blue-800">Net Pay</h3>
              <span className="text-3xl font-bold text-blue-900">
                <CurrencyFormatter amount={employee.netSalary} />
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={onGeneratePDF}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Send to WhatsApp
          </Button>
          <Button
            onClick={onDownloadPDF}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-gray-300 pt-4">
          <div className="text-center text-sm text-gray-600">
            <p>
              This is a computer generated payslip and does not require a
              signature.
            </p>
            <p className="mt-1">
              For any queries, please contact your HR department.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
