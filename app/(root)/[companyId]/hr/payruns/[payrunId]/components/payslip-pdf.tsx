"use client"

import { IPayrollEmployeeHd } from "@/interfaces/payrun"
import { format } from "date-fns"

import { CurrencyFormatter } from "@/components/currencyicons/currency-formatter"

interface PayslipPDFProps {
  employee: IPayrollEmployeeHd
  payrunId: string
  payPeriod: string
  payDate: string
  companyName: string
}

export const PayslipPDF = ({
  employee,
  payrunId,
  payPeriod,
  payDate,
  companyName,
}: PayslipPDFProps) => {
  const currentDate = format(new Date(), "dd/MM/yyyy")

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{companyName}</h1>
            <p className="mt-1 text-gray-600">Employee Payslip</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Generated on: {currentDate}</p>
            <p className="text-sm text-gray-600">Payrun ID: {payrunId}</p>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="mt-6 grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Employee Details
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Employee Name:</span>
              <span className="text-gray-900">{employee.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Employee Code:</span>
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
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Pay Period
          </h2>
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
      <div className="mt-8 grid grid-cols-2 gap-8">
        {/* Earnings */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-800 text-green-700">
            Earnings
          </h2>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Basic Salary:</span>
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
          <h2 className="mb-4 text-xl font-semibold text-gray-800 text-red-700">
            Deductions
          </h2>
          <div className="rounded-lg bg-red-50 p-4">
            <div className="space-y-3">
              {employee.data_details?.map((detail, index) => {
                if (detail.componentType === "DEDUCTION" && detail.amount > 0) {
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
      <div className="mt-8">
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-blue-800">Net Pay</h2>
            <span className="text-3xl font-bold text-blue-900">
              <CurrencyFormatter amount={employee.netSalary} />
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-gray-300 pt-4">
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
    </div>
  )
}
