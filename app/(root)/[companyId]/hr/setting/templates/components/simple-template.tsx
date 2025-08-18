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

interface SimpleTemplateProps {
  preferences: PayslipPreferences
  onPreferencesChange: (preferences: PayslipPreferences) => void
  onSave: () => void
  onPreview: () => void
  isOpen: boolean
  onClose: () => void
}

export function SimpleTemplate({
  preferences,
  onPreferencesChange,
  onSave,
  onPreview,
  isOpen,
  onClose,
}: SimpleTemplateProps) {
  return (
    <CommonTemplateDialog
      templateName="Simple Template"
      preferences={preferences}
      onPreferencesChange={onPreferencesChange}
      onSave={onSave}
      onPreview={onPreview}
      isOpen={isOpen}
      onClose={onClose}
    >
      <SimplePayslipPreview preferences={preferences} />
    </CommonTemplateDialog>
  )
}

function SimplePayslipPreview({
  preferences,
}: {
  preferences: PayslipPreferences
}) {
  return (
    <div className="space-y-4 p-6">
      {/* Simple Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Archipelago Middle East Shipping LLC
        </h1>
        {preferences.showOrganisationAddress && (
          <p className="text-gray-600">
            Fujairah Fujairah United Arab Emirates
          </p>
        )}
        <p className="mt-2 text-gray-600">Payslip for March 2025</p>
      </div>

      {/* Employee Info - Simple Layout */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Employee:</span>
          <span className="font-medium">Preet Setty</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ID:</span>
          <span className="font-medium">emp012</span>
        </div>
        {preferences.showDesignation && (
          <div className="flex justify-between">
            <span className="text-gray-600">Designation:</span>
            <span className="font-medium">Software Engineer</span>
          </div>
        )}
        {preferences.showMOLID && (
          <div className="flex justify-between">
            <span className="text-gray-600">MOL ID:</span>
            <span className="font-medium">10101010101010</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Pay Date:</span>
          <span className="font-medium">31 Mar 2025</span>
        </div>
        {preferences.showIBANNumber && (
          <div className="flex justify-between">
            <span className="text-gray-600">Account:</span>
            <span className="font-medium">AE001112223334445556666</span>
          </div>
        )}
      </div>

      {/* Net Pay - Simple Design */}
      <div className="rounded-lg border-2 border-gray-300 p-4 text-center">
        <p className="text-sm text-gray-600">Net Pay</p>
        <p className="text-3xl font-bold text-gray-900">AED 56,400.00</p>
        <div className="mt-2 text-xs text-gray-500">
          Paid: 28 days | LOP: 3 days
        </div>
      </div>

      {/* Earnings - Simple List */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Earnings</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Basic</span>
            <span className="font-medium">60,000.00</span>
          </div>
          <div className="flex justify-between">
            <span>Housing Allowance</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Cost of Living Allowance</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Bonus</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Commission</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Leave Encashment</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Public Holiday/Night OT Allowance 150%</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Other Allowance</span>
            <span className="font-medium">0.00</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <span>Total Earnings</span>
            <span>AED 60,000.00</span>
          </div>
        </div>
      </div>

      {/* Deductions - Simple List */}
      <div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Deductions</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Salary Advance</span>
            <span className="font-medium text-red-600">1,200.00</span>
          </div>
          <div className="flex justify-between">
            <span>Fines and Damages</span>
            <span className="font-medium text-red-600">1,200.00</span>
          </div>
          <div className="flex justify-between">
            <span>EPF</span>
            <span className="font-medium text-red-600">1,200.00</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <span>Total Deductions</span>
            <span className="text-red-600">AED 3,600.00</span>
          </div>
        </div>
      </div>

      {/* Final Calculation - Simple */}
      <div className="rounded-lg border-2 border-gray-300 p-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Gross Earnings</span>
            <span>AED 60,000.00</span>
          </div>
          <div className="flex justify-between">
            <span>Less: Total Deductions</span>
            <span className="text-red-600">AED 3,600.00</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 text-lg font-bold">
            <span>Net Payable</span>
            <span>AED 56,400.00</span>
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Amount in words: UAE Dirham Fifty-Six Thousand Four Hundred
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        -- This is a system-generated document. --
      </div>
    </div>
  )
}
