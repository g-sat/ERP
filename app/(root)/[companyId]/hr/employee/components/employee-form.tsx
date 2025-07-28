"use client"

import { IEmployee } from "@/interfaces/employee"
import { EmployeeFormValues, employeeSchema } from "@/schemas/employee"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { clientDateFormat, parseDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CompanyAutocomplete from "@/components/ui-custom/autocomplete-company"
import DepartmentAutocomplete from "@/components/ui-custom/autocomplete-department"
import EmployeeCategoryAutocomplete from "@/components/ui-custom/autocomplete-empcategory"
import GenderAutocomplete from "@/components/ui-custom/autocomplete-gender"
import CustomAccordion, {
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui-custom/custom-accordion"
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

  return (
    <div className="max-w flex flex-col gap-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {initialData ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <div className="grid grid-cols-5 gap-2">
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
                    name="offEmailAdd"
                    label="Office Email"
                    type="email"
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
                    name="bankName"
                    label="Bank Name"
                    isDisabled={isReadOnly}
                  />
                  <CustomInput
                    form={form}
                    name="accountNo"
                    label="Account No"
                    isDisabled={isReadOnly}
                  />
                  <CustomInput
                    form={form}
                    name="swiftCode"
                    label="Swift Code"
                    isDisabled={isReadOnly}
                  />
                  <CustomInput
                    form={form}
                    name="iban"
                    label="IBAN"
                    isDisabled={isReadOnly}
                  />
                  <CustomInput
                    form={form}
                    name="otherEmailAdd"
                    label="Other Email"
                    type="email"
                    isDisabled={isReadOnly}
                  />
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
                    name="nationality"
                    label="Nationality"
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
                </div>
                <div className="grid grid-cols-1 gap-2">
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

                {initialData &&
                  (initialData.createBy ||
                    initialData.createDate ||
                    initialData.editBy ||
                    initialData.editDate) && (
                    <CustomAccordion
                      type="single"
                      collapsible
                      className="rounded-md border"
                    >
                      <CustomAccordionItem value="audit-info">
                        <CustomAccordionTrigger className="px-4">
                          Audit Information
                        </CustomAccordionTrigger>
                        <CustomAccordionContent className="px-2">
                          <div className="grid grid-cols-2 gap-4">
                            {initialData.createDate && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">
                                  Created By
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="font-normal"
                                  >
                                    {initialData.createBy}
                                  </Badge>
                                  <span className="text-muted-foreground text-sm">
                                    {format(
                                      new Date(initialData.createDate),
                                      datetimeFormat
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}
                            {initialData.editBy && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm">
                                  Last Edited By
                                </span>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="font-normal"
                                  >
                                    {initialData.editBy}
                                  </Badge>
                                  <span className="text-muted-foreground text-sm">
                                    {initialData.editDate
                                      ? format(
                                          new Date(initialData.editDate),
                                          datetimeFormat
                                        )
                                      : "—"}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </CustomAccordionContent>
                      </CustomAccordionItem>
                    </CustomAccordion>
                  )}
              </div>
            </div>
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
