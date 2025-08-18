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

interface StandardTemplateProps {
  preferences: PayslipPreferences
  onPreferencesChange: (preferences: PayslipPreferences) => void
  onSave: () => void
  onPreview: () => void
  isOpen: boolean
  onClose: () => void
}

export function StandardTemplate({
  preferences,
  onPreferencesChange,
  onSave,
  onPreview,
  isOpen,
  onClose,
}: StandardTemplateProps) {
  return (
    <CommonTemplateDialog
      templateName="Standard Template"
      preferences={preferences}
      onPreferencesChange={onPreferencesChange}
      onSave={onSave}
      onPreview={onPreview}
      isOpen={isOpen}
      onClose={onClose}
    >
      <StandardPayslipPreview preferences={preferences} />
    </CommonTemplateDialog>
  )
}

function StandardPayslipPreview({
  preferences,
}: {
  preferences: PayslipPreferences
}) {
  return (
    <div className="space-y-6 p-6">
      {/* Standard Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Archipelago Middle East Shipping LLC
            </h1>
            {preferences.showOrganisationAddress && (
              <p className="text-gray-600">
                Fujairah Fujairah United Arab Emirates
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-600">Payslip for the month of March 2025</p>
          </div>
        </div>
      </div>

      {/* Pay Summary Section */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Pay Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Employee Name:</span>
              <span className="font-medium">Preet Setty, emp012</span>
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
              <span className="text-gray-600">Date of Joining:</span>
              <span className="font-medium">21-09-2014</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Period:</span>
              <span className="font-medium">March 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Date:</span>
              <span className="font-medium">31 Mar 2025</span>
            </div>
            {preferences.showIBANNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Account No:</span>
                <span className="font-medium">AE001112223334445556666</span>
              </div>
            )}
          </div>
        </div>

        {/* Total Net Pay Box */}
        <div className="rounded-lg bg-gray-100 p-4 text-center">
          <p className="text-sm text-gray-600">Total Net Pay</p>
          <p className="text-2xl font-bold text-green-600">AED 56,400.00</p>
          <div className="mt-2 text-xs text-gray-600">
            <div>Paid Days : 28</div>
            <div>LOP Days : 3</div>
          </div>
        </div>
      </div>

      {/* Earnings and Deductions Table */}
      <div className="grid grid-cols-2 gap-6">
        {/* Earnings */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">EARNINGS</h3>
          <div className="space-y-2 text-sm">
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
              <span>Public Holiday/Night OT Allowance 150% Hours: 00:00</span>
              <span className="font-medium">0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Other Allowance</span>
              <span className="font-medium">0.00</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <span>Gross Earnings</span>
              <span>AED 60,000.00</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            DEDUCTIONS
          </h3>
          <div className="space-y-2 text-sm">
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
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <span>Total Deductions</span>
              <span className="text-red-600">AED 3,600.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay Calculation Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Gross Earnings</span>
            <span>AED 60,000.00</span>
          </div>
          <div className="flex justify-between">
            <span>Total Deductions</span>
            <span className="text-red-600">(-) AED 3,600.00</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
            <span>Total Net Payable</span>
            <span>AED 56,400.00</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-bold">Total Net Payable AED 56,400.00</p>
          <p className="text-sm text-gray-600">
            (UAE Dirham Fifty-Six Thousand Four Hundred)
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          **Total Net Payable = Gross Earnings - Total Deductions**
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        -- This is a system-generated document. --
      </div>
    </div>
  )
}
