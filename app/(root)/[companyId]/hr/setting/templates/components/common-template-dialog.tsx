"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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

interface CommonTemplateDialogProps {
  templateName: string
  preferences: PayslipPreferences
  onPreferencesChange: (preferences: PayslipPreferences) => void
  onSave: () => void
  onPreview: () => void
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function CommonTemplateDialog({
  templateName,
  preferences,
  onPreferencesChange,
  onSave,
  onPreview,
  isOpen,
  onClose,
  children,
}: CommonTemplateDialogProps) {
  const handlePreferenceChange = (
    key: keyof PayslipPreferences,
    value: boolean
  ) => {
    onPreferencesChange({
      ...preferences,
      [key]: value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[90vw] !max-w-none overflow-hidden">
        <DialogHeader>
          <DialogTitle>{templateName}</DialogTitle>
        </DialogHeader>

        <div className="flex h-full gap-6 overflow-hidden">
          {/* Left Sidebar - Common Template Settings */}
          <div className="w-80 overflow-y-auto rounded-lg bg-gray-50 p-4">
            <div className="space-y-6">
              {/* Payslip Preferences */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-900">
                  Payslip Preferences
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showOrganisationAddress"
                      checked={preferences.showOrganisationAddress}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showOrganisationAddress",
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor="showOrganisationAddress"
                      className="text-sm"
                    >
                      Show Organisation Address
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showMOLID"
                      checked={preferences.showMOLID}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange("showMOLID", checked as boolean)
                      }
                    />
                    <Label htmlFor="showMOLID" className="text-sm">
                      Show MOL ID
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showEmailID"
                      checked={preferences.showEmailID}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showEmailID",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showEmailID" className="text-sm">
                      Show Email ID
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showMobileNumber"
                      checked={preferences.showMobileNumber}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showMobileNumber",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showMobileNumber" className="text-sm">
                      Show Mobile Number
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showYTDValues"
                      checked={preferences.showYTDValues}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showYTDValues",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showYTDValues" className="text-sm">
                      Show YTD Values
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showIBANNumber"
                      checked={preferences.showIBANNumber}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showIBANNumber",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showIBANNumber" className="text-sm">
                      Show IBAN Number
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showWorkLocation"
                      checked={preferences.showWorkLocation}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showWorkLocation",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showWorkLocation" className="text-sm">
                      Show Work Location
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showDepartment"
                      checked={preferences.showDepartment}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showDepartment",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showDepartment" className="text-sm">
                      Show Department
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showDesignation"
                      checked={preferences.showDesignation}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showDesignation",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showDesignation" className="text-sm">
                      Show Designation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showBenefitsSummary"
                      checked={preferences.showBenefitsSummary}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "showBenefitsSummary",
                          checked as boolean
                        )
                      }
                    />
                    <Label htmlFor="showBenefitsSummary" className="text-sm">
                      Show Benefits Summary
                    </Label>
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Set as Default Template */}
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="setAsDefault"
                    checked={false}
                    onCheckedChange={(checked) => {
                      // This will be handled by the parent component
                      console.log("Set as default:", checked)
                    }}
                  />
                  <Label htmlFor="setAsDefault" className="text-sm">
                    Set as Default Template
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button onClick={onSave} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={onPreview}
                  variant="outline"
                  className="flex-1"
                >
                  Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Template Preview */}
          <div className="flex-1 overflow-y-auto rounded-lg bg-white">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
