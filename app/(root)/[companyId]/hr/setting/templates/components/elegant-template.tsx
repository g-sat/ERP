"use client"

import { CommonTemplateDialog } from "./common-template-dialog"

interface PayslipPreferences {
  showOrganisationAddress: boolean
  showMOLID: boolean
  showEmailID: boolean
  showMobileNumber: boolean
  showYTDValues: boolean
  showIBANNumber: boolean
  showWorkLocation: boolean
  showDepartment: boolean
  showDesignation: boolean
  showBenefitsSummary: boolean
}

interface ElegantTemplateProps {
  preferences: PayslipPreferences
  onPreferencesChange: (preferences: PayslipPreferences) => void
  onSave: () => void
  onPreview: () => void
  isOpen: boolean
  onClose: () => void
}

export function ElegantTemplate({
  preferences,
  onPreferencesChange,
  onSave,
  onPreview,
  isOpen,
  onClose,
}: ElegantTemplateProps) {
  return (
    <CommonTemplateDialog
      templateName="Elegant Template"
      preferences={preferences}
      onPreferencesChange={onPreferencesChange}
      onSave={onSave}
      onPreview={onPreview}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ElegantPayslipPreview preferences={preferences} />
    </CommonTemplateDialog>
  )
}

function ElegantPayslipPreview({
  preferences,
}: {
  preferences: PayslipPreferences
}) {
  return (
    <div className="space-y-4 p-6">
      {/* Elegant Header with Gradient */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Archipelago Middle East Shipping LLC
            </h1>
            {preferences.showOrganisationAddress && (
              <p className="mt-2 text-blue-100">
                Fujairah Fujairah United Arab Emirates
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-blue-100">Payslip For the Month</p>
            <p className="text-2xl font-bold">March 2025</p>
          </div>
        </div>
      </div>

      {/* Total Net Pay - Elegant Design */}
      <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white shadow-lg">
        <p className="text-lg font-medium">Total Net Pay</p>
        <p className="text-4xl font-bold">AED 56,400.00</p>
        <div className="mt-3 flex justify-center space-x-6 text-sm">
          <span className="rounded bg-white/20 px-3 py-1">Paid Days: 28</span>
          <span className="rounded bg-white/20 px-3 py-1">LOP Days: 3</span>
        </div>
      </div>

      {/* Employee Summary - Elegant Cards */}
      <div className="rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-gray-800">
          EMPLOYEE SUMMARY
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <span className="text-gray-600">Employee Name:</span>
            <span className="ml-2 font-semibold text-gray-800">
              Preet Setty
            </span>
          </div>
          {preferences.showDesignation && (
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <span className="text-gray-600">Designation:</span>
              <span className="ml-2 font-semibold text-gray-800">
                Software Engineer
              </span>
            </div>
          )}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <span className="text-gray-600">Employee ID:</span>
            <span className="ml-2 font-semibold text-gray-800">emp012</span>
          </div>
          {preferences.showMOLID && (
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <span className="text-gray-600">MOL ID:</span>
              <span className="ml-2 font-semibold text-gray-800">
                10101010101010
              </span>
            </div>
          )}
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <span className="text-gray-600">Date of Joining:</span>
            <span className="ml-2 font-semibold text-gray-800">21-09-2014</span>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <span className="text-gray-600">Pay Period:</span>
            <span className="ml-2 font-semibold text-gray-800">March 2025</span>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <span className="text-gray-600">Pay Date:</span>
            <span className="ml-2 font-semibold text-gray-800">
              31 Mar 2025
            </span>
          </div>
          {preferences.showIBANNumber && (
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <span className="text-gray-600">Account No:</span>
              <span className="ml-2 font-semibold text-gray-800">
                AE001112223334445556666
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Earnings - Elegant Design */}
      <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-green-800">EARNINGS</h3>
        <div className="space-y-3">
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Basic</span>
            <span className="font-bold text-green-600">60,000.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Housing Allowance</span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">
              Cost of Living Allowance
            </span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Bonus</span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Commission</span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Leave Encashment</span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">
              Public Holiday/Night OT Allowance 150% (Hours: 00:00)
            </span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Other Allowance</span>
            <span className="font-bold text-green-600">0.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white shadow-lg">
            <span className="text-lg font-bold">Gross Earnings</span>
            <span className="text-2xl font-bold">AED 60,000.00</span>
          </div>
        </div>
      </div>

      {/* Deductions - Elegant Design */}
      <div className="rounded-lg bg-gradient-to-r from-red-50 to-pink-50 p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-red-800">DEDUCTIONS</h3>
        <div className="space-y-3">
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Salary Advance</span>
            <span className="font-bold text-red-600">1,200.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">Fines and Damages</span>
            <span className="font-bold text-red-600">1,200.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium text-gray-700">EPF</span>
            <span className="font-bold text-red-600">1,200.00</span>
          </div>
          <div className="flex justify-between rounded-lg bg-gradient-to-r from-red-500 to-pink-600 p-4 text-white shadow-lg">
            <span className="text-lg font-bold">Total Deductions</span>
            <span className="text-2xl font-bold">AED 3,600.00</span>
          </div>
        </div>
      </div>

      {/* Total Net Payable - Elegant Final Design */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            Gross Earnings - Total Deductions
          </span>
          <span className="text-3xl font-bold">AED 56,400.00</span>
        </div>
        <p className="mt-3 text-blue-100">
          Amount In Words: UAE Dirham Fifty-Six Thousand Four Hundred
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        -- This is a system-generated document. --
      </div>
    </div>
  )
}
