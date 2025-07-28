"use client"

import { IEmployee } from "@/interfaces/employee"
import { EmployeeFormValues, employeeSchema } from "@/schemas/employee"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import EmployeeCategoryAutocomplete from "@/components/ui-custom/autocomplete-empcategory"
import GenderAutocomplete from "@/components/ui-custom/autocomplete-gender"
import { CustomDateNew } from "@/components/ui-custom/custom-date-new"
import CustomInput from "@/components/ui-custom/custom-input"
import CustomSwitch from "@/components/ui-custom/custom-switch"
import CustomTextarea from "@/components/ui-custom/custom-textarea"
import PhotoUpload from "@/components/ui-custom/photo-upload"

interface EmployeeFormProps {
  initialData?: IEmployee
  submitAction: (data: EmployeeFormValues) => void
  onCancel?: () => void
  isSubmitting?: boolean
  isReadOnly?: boolean
  departments?: { value: string; label: string }[]
  designations?: { value: string; label: string }[]
}

export function EmployeeForm({
  initialData,
  submitAction,
  onCancel,
  isSubmitting = false,
  isReadOnly = false,
}: EmployeeFormProps) {
  const { decimals } = useAuthStore()
  const datetimeFormat = decimals[0]?.longDateFormat || "dd/MM/yyyy HH:mm:ss"
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employeeId: initialData?.employeeId ?? 0,
      companyId: initialData?.companyId ?? 0,
      code: initialData?.code ?? "",
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      otherName: initialData?.otherName ?? "",
      photo: initialData?.photo ?? "",
      signature: initialData?.signature ?? "",
      empCategoryId: initialData?.empCategoryId ?? 0,
      departmentId: initialData?.departmentId ?? 0,
      genderId: initialData?.genderId ?? 0,
      martialStatus: initialData?.martialStatus ?? "",
      dob: initialData?.dob
        ? format(
            parseDate(initialData.dob as string) || new Date(),
            clientDateFormat
          )
        : "",
      joinDate: initialData?.joinDate
        ? format(
            parseDate(initialData.joinDate as string) || new Date(),
            clientDateFormat
          )
        : undefined,
      lastDate: initialData?.lastDate
        ? format(
            parseDate(initialData.lastDate as string) || new Date(),
            clientDateFormat
          )
        : "",
      phoneNo: initialData?.phoneNo ?? "",
      offPhoneNo: initialData?.offPhoneNo ?? "",
      bankName: initialData?.bankName ?? "",
      accountNo: initialData?.accountNo ?? "",
      swiftCode: initialData?.swiftCode ?? "",
      iban: initialData?.iban ?? "",
      offEmailAdd: initialData?.offEmailAdd ?? "",
      otherEmailAdd: initialData?.otherEmailAdd ?? "",
      passportNo: initialData?.passportNo ?? "",
      passportExpiry: initialData?.passportExpiry
        ? format(
            parseDate(initialData.passportExpiry as string) || new Date(),
            clientDateFormat
          )
        : "",
      visaNo: initialData?.visaNo ?? "",
      visaExpiry: initialData?.visaExpiry
        ? format(
            parseDate(initialData.visaExpiry as string) || new Date(),
            clientDateFormat
          )
        : "",
      nationality: initialData?.nationality ?? "",
      emiratesIDNo: initialData?.emiratesIDNo ?? "",
      emiratesIDExpiry: initialData?.emiratesIDExpiry
        ? format(
            parseDate(initialData.emiratesIDExpiry as string) || new Date(),
            clientDateFormat
          )
        : "",
      mohreContractIDNo: initialData?.mohreContractIDNo ?? "",
      mohreContractExpiry: initialData?.mohreContractExpiry
        ? format(
            parseDate(initialData.mohreContractExpiry as string) || new Date(),
            clientDateFormat
          )
        : "",
      isActive:
        typeof initialData?.isActive === "boolean"
          ? initialData.isActive
          : true,
      remarks: initialData?.remarks ?? "",
    },
  })

  const onSubmit = (data: EmployeeFormValues) => {
    console.log(data)
    submitAction(data)
  }

  const onError = (errors: Record<string, unknown>) => {
    //console.error("Form validation errors:", errors)
    //console.error("Error keys:", Object.keys(errors))
    //console.error("Error values:", Object.values(errors))

    // Extract error messages from react-hook-form error structure
    const errorMessages: string[] = []

    Object.keys(errors).forEach((fieldName) => {
      const fieldError = errors[fieldName] as { message?: string }
      if (fieldError && fieldError.message) {
        errorMessages.push(fieldError.message)
      }
    })

    if (errorMessages.length > 0) {
      // Show first error message
      toast.error(errorMessages[0])

      // If there are multiple errors, show them in a list
      if (errorMessages.length > 1) {
        setTimeout(() => {
          toast.error(`Additional errors: ${errorMessages.slice(1).join(", ")}`)
        }, 1000)
      }
    } else {
      // Fallback for when error structure is different
      toast.error("Please check all required fields and try again.")
    }
  }

  return (
    <div className="max-w flex flex-1 flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          {initialData ? (
            <Tabs defaultValue="main" className="flex h-[600px] flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="main">Main</TabsTrigger>
                <TabsTrigger value="bank">Bank Details</TabsTrigger>
                <TabsTrigger value="others">Others</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Main Tab */}
              <TabsContent
                value="main"
                className="flex-1 space-y-4 overflow-y-auto"
              >
                <div className="grid grid-cols-4 gap-6">
                  {/* Left Section - Company Main Information */}
                  <div className="col-span-3 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <CompanyAutocomplete
                        form={form}
                        name="companyId"
                        label="Company"
                        isDisabled={isReadOnly}
                        isRequired={true}
                      />
                      <CustomInput
                        form={form}
                        name="code"
                        label="Employee Code"
                        isDisabled={true}
                      />
                      <CustomInput
                        form={form}
                        name="firstName"
                        label="First Name"
                        isRequired={true}
                        isDisabled={isReadOnly}
                      />
                      <CustomInput
                        form={form}
                        name="lastName"
                        label="Last Name"
                        isRequired={true}
                        isDisabled={isReadOnly}
                      />
                      <CustomInput
                        form={form}
                        name="otherName"
                        label="Other Name"
                        isDisabled={isReadOnly}
                      />
                      <DepartmentAutocomplete
                        form={form}
                        name="departmentId"
                        label="Department"
                        isDisabled={isReadOnly}
                        isRequired={true}
                      />
                      <EmployeeCategoryAutocomplete
                        form={form}
                        name="empCategoryId"
                        label="Employee Category"
                        isDisabled={isReadOnly}
                        isRequired={true}
                      />
                      <GenderAutocomplete
                        form={form}
                        name="genderId"
                        label="Gender"
                        isDisabled={isReadOnly}
                        isRequired={true}
                      />
                      <CustomInput
                        form={form}
                        name="martialStatus"
                        label="Marital Status"
                        isDisabled={isReadOnly}
                      />
                      <CustomDateNew
                        form={form}
                        name="dob"
                        label="Date of Birth"
                        isDisabled={isReadOnly}
                        isRequired={true}
                      />
                      <CustomDateNew
                        form={form}
                        name="joinDate"
                        label="Join Date"
                        isRequired={true}
                        isDisabled={isReadOnly}
                      />
                      <CustomDateNew
                        form={form}
                        name="lastDate"
                        label="Last Date"
                        isDisabled={isReadOnly}
                      />
                      <CustomInput
                        form={form}
                        name="offPhoneNo"
                        label="Office Phone Number"
                        isDisabled={isReadOnly}
                      />
                      <CustomInput
                        form={form}
                        name="phoneNo"
                        label="Phone Number"
                        isDisabled={isReadOnly}
                      />
                      <CustomInput
                        form={form}
                        name="offEmailAdd"
                        label="Office Email"
                        type="email"
                        isDisabled={isReadOnly}
                      />
                      <CustomInput
                        form={form}
                        name="otherEmailAdd"
                        label="Other Email"
                        type="email"
                        isDisabled={isReadOnly}
                      />
                    </div>
                  </div>

                  {/* Right Section - Photo */}
                  <div className="col-span-1">
                    <div className="sticky top-0">
                      <PhotoUpload
                        currentPhoto={form.watch("photo")}
                        onPhotoChange={(filePath) =>
                          form.setValue("photo", filePath)
                        }
                        isDisabled={isReadOnly}
                        label="Employee Photo"
                        photoType="employee"
                        userId={initialData?.employeeId?.toString() || ""}
                      />
                    </div>
                  </div>
                </div>
                <CustomTextarea
                  form={form}
                  name="remarks"
                  label="Remarks"
                  isDisabled={isReadOnly}
                />
                <CustomSwitch
                  form={form}
                  name="isActive"
                  label="Active Status"
                  activeColor="success"
                  isDisabled={isReadOnly}
                />
              </TabsContent>

              {/* Bank Details Tab */}
              <TabsContent
                value="bank"
                className="flex-1 space-y-4 overflow-y-auto"
              >
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <CustomInput
                      form={form}
                      name="bankName"
                      label="Bank Name"
                      isDisabled={isReadOnly}
                      isRequired={true}
                    />
                    <CustomInput
                      form={form}
                      name="accountNo"
                      label="Account No"
                      isDisabled={isReadOnly}
                      isRequired={true}
                    />
                    <CustomInput
                      form={form}
                      name="swiftCode"
                      label="Swift Code"
                      isDisabled={isReadOnly}
                      isRequired={true}
                    />
                    <CustomInput
                      form={form}
                      name="iban"
                      label="IBAN"
                      isDisabled={isReadOnly}
                      isRequired={true}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Others Tab */}
              <TabsContent
                value="others"
                className="flex-1 space-y-4 overflow-y-auto"
              >
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <CustomInput
                      form={form}
                      name="passportNo"
                      label="Passport No"
                      isDisabled={isReadOnly}
                    />
                    <CustomDateNew
                      form={form}
                      name="passportExpiry"
                      label="Passport Expiry"
                      isDisabled={isReadOnly}
                    />
                    <CustomInput
                      form={form}
                      name="visaNo"
                      label="Visa No"
                      isDisabled={isReadOnly}
                    />
                    <CustomDateNew
                      form={form}
                      name="visaExpiry"
                      label="Visa Expiry"
                      isDisabled={isReadOnly}
                    />

                    <CustomInput
                      form={form}
                      name="emiratesIDNo"
                      label="Emirates ID No"
                      isDisabled={isReadOnly}
                    />
                    <CustomDateNew
                      form={form}
                      name="emiratesIDExpiry"
                      label="Emirates ID Expiry"
                      isDisabled={isReadOnly}
                    />
                    <CustomInput
                      form={form}
                      name="mohreContractIDNo"
                      label="MOHRE Contract No"
                      isDisabled={isReadOnly}
                    />
                    <CustomDateNew
                      form={form}
                      name="mohreContractExpiry"
                      label="MOHRE Contract Expiry"
                      isDisabled={isReadOnly}
                    />
                    <CustomInput
                      form={form}
                      name="nationality"
                      label="Nationality"
                      isDisabled={isReadOnly}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent
                value="history"
                className="flex-1 space-y-6 overflow-y-auto"
              >
                {initialData &&
                (initialData.createBy ||
                  initialData.createDate ||
                  initialData.editBy ||
                  initialData.editDate) ? (
                  <div className="space-y-6">
                    {/* Audit Information Section */}
                    <div className="bg-card rounded-lg border p-6">
                      <div className="mb-4">
                        <h3 className="text-foreground text-lg font-semibold">
                          Audit Information
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Track the creation and modification history of this
                          employee record
                        </p>
                      </div>

                      <div className="grid gap-6">
                        {/* Creation Information */}
                        {initialData.createDate && (
                          <div className="bg-muted/30 rounded-md border p-4">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-foreground font-medium">
                                  Created
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  Record creation details
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-muted-foreground text-sm font-medium">
                                  Created By
                                </label>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="font-medium"
                                  >
                                    {initialData.createBy}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-muted-foreground text-sm font-medium">
                                  Created Date
                                </label>
                                <div className="text-foreground text-sm">
                                  {format(
                                    new Date(initialData.createDate),
                                    datetimeFormat
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Modification Information */}
                        {initialData.editBy && (
                          <div className="bg-muted/30 rounded-md border p-4">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-foreground font-medium">
                                  Last Modified
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  Most recent changes
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-muted-foreground text-sm font-medium">
                                  Modified By
                                </label>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="font-medium"
                                  >
                                    {initialData.editBy}
                                  </Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-muted-foreground text-sm font-medium">
                                  Modified Date
                                </label>
                                <div className="text-foreground text-sm">
                                  {initialData.editDate
                                    ? format(
                                        new Date(initialData.editDate),
                                        datetimeFormat
                                      )
                                    : "—"}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="bg-muted mb-4 rounded-full p-3">
                      <svg
                        className="text-muted-foreground h-8 w-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-foreground mb-2 text-lg font-semibold">
                      No History Available
                    </h3>
                    <p className="text-muted-foreground max-w-sm text-sm">
                      This is a new employee record. History information will
                      appear here once the record is created and modified.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid gap-2">
              <div className="grid grid-cols-3 gap-2">
                <CustomInput
                  form={form}
                  name="code"
                  label="Employee Code"
                  isRequired
                  isDisabled={isReadOnly}
                />
                <CustomInput
                  form={form}
                  name="firstName"
                  label="First Name"
                  isRequired
                  isDisabled={isReadOnly}
                />
                <CustomInput
                  form={form}
                  name="lastName"
                  label="Last Name"
                  isRequired
                  isDisabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <PhotoUpload
                  currentPhoto={form.watch("photo")}
                  onPhotoChange={(filePath) => form.setValue("photo", filePath)}
                  isDisabled={isReadOnly}
                  label="Employee Photo"
                  photoType="employee"
                  userId=""
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <DepartmentAutocomplete
                  form={form}
                  name="departmentId"
                  label="Department"
                  isDisabled={isReadOnly}
                  isRequired
                />
                <GenderAutocomplete
                  form={form}
                  name="genderId"
                  label="Gender"
                  isDisabled={isReadOnly}
                  isRequired={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <CustomInput
                  form={form}
                  name="martialStatus"
                  label="Marital Status"
                  isRequired
                  isDisabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <CustomInput
                  form={form}
                  name="offEmailAdd"
                  label="Office Email"
                  type="email"
                  isDisabled={isReadOnly}
                />
                <CustomInput
                  form={form}
                  name="otherEmailAdd"
                  label="Other Email"
                  type="email"
                  isDisabled={isReadOnly}
                />
              </div>

              <CustomTextarea
                form={form}
                name="remarks"
                label="Remarks"
                isDisabled={isReadOnly}
              />
              <div className="grid grid-cols-1 gap-2">
                <CustomSwitch
                  form={form}
                  name="isActive"
                  label="Active Status"
                  activeColor="success"
                  isDisabled={isReadOnly}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Employee"
                    : "Create Employee"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
