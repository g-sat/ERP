"use client"

import { useEffect, useMemo, useState } from "react"
import { ApiResponse } from "@/interfaces/auth"
import { IModuleTransactionLookup } from "@/interfaces/lookup"
import { INumberFormatDetails, INumberFormatGrid } from "@/interfaces/setting"
import { DocumentNoFormValues, documentNoFormSchema } from "@/schemas/setting"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  useModuleTransactionListGet,
  useNumberFormatDataById,
  useNumberFormatDetailsDataGet,
  useNumberFormatSave,
} from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CustomCheckbox from "@/components/ui-custom/custom-checkbox"
import CustomInput from "@/components/ui-custom/custom-input"
import SelectCommon from "@/components/ui-custom/select-common"

interface ModuleGroup {
  id: number
  name: string
  transactions: Array<{ id: number; name: string }>
}

export function DocumentNoForm() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  )
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )

  const form = useForm<DocumentNoFormValues>({
    resolver: zodResolver(documentNoFormSchema),
    defaultValues: {
      numberId: 0,
      moduleId: 0,
      transactionId: 0,
      prefix: "",
      prefixDelimiter: "-",
      prefixSeq: 1,
      includeYear: true,
      yearDelimiter: "-",
      yearSeq: 2,
      yearFormat: "YYYY",
      includeMonth: true,
      monthDelimiter: "",
      monthSeq: 3,
      monthFormat: "MM",
      noDIgits: 4,
      dIgitSeq: 4,
      resetYearly: false,
    },
  })

  // Get module transaction list
  const {
    data: moduleTrnsListResponse,
    isLoading: isModuleListLoading,
    isError: isModuleListError,
  } = useModuleTransactionListGet()

  const { data: moduleTrnsData } =
    (moduleTrnsListResponse as ApiResponse<IModuleTransactionLookup>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  console.log("moduleTrnsData :", moduleTrnsData)

  // Get number format data when module and transaction are selected
  const {
    data: numberFormatDataResponse,
    isLoading: isNumberFormatLoading,
    isError: isNumberFormatError,
    refetch: refetchNumberFormat,
  } = useNumberFormatDataById({
    moduleId: selectedModule ?? 0,
    transactionId: selectedTransaction ?? 0,
  })

  const { data: numberFormatData } =
    (numberFormatDataResponse as ApiResponse<INumberFormatDetails>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  console.log("numberFormatData :", numberFormatData)

  // Get number format details when numberId and year are selected
  const {
    data: numberFormatDetailsDataResponse,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
  } = useNumberFormatDetailsDataGet({
    id: numberFormatDataResponse?.data?.numberId ?? 0,
    year: selectedYear,
  })

  const { data: numberFormatDetailsData } =
    (numberFormatDetailsDataResponse as ApiResponse<INumberFormatGrid>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  console.log("numberFormatDetailsData :", numberFormatDetailsData)

  const numberFormatGridData = useMemo(() => {
    // Fallback to 0 for all values
    const fallbackData = {
      month1: 0,
      month2: 0,
      month3: 0,
      month4: 0,
      month5: 0,
      month6: 0,
      month7: 0,
      month8: 0,
      month9: 0,
      month10: 0,
      month11: 0,
      month12: 0,
      LastNumber: 0,
      ...numberFormatDetailsData,
    }

    return [
      { month: "1", count: fallbackData.month1 },
      { month: "2", count: fallbackData.month2 },
      { month: "3", count: fallbackData.month3 },
      { month: "4", count: fallbackData.month4 },
      { month: "5", count: fallbackData.month5 },
      { month: "6", count: fallbackData.month6 },
      { month: "7", count: fallbackData.month7 },
      { month: "8", count: fallbackData.month8 },
      { month: "9", count: fallbackData.month9 },
      { month: "10", count: fallbackData.month10 },
      { month: "11", count: fallbackData.month11 },
      { month: "12", count: fallbackData.month12 },
      { month: "Last Number", count: fallbackData.LastNumber },
    ]
  }, [numberFormatDetailsData])

  // Save number format
  const { mutate: saveNumberFormat, isPending } = useNumberFormatSave()

  // Update form when number format data is loaded
  useEffect(() => {
    if (
      numberFormatDataResponse?.result === 1 &&
      numberFormatDataResponse.data
    ) {
      form.reset({
        numberId: numberFormatDataResponse.data.numberId ?? 0,
        moduleId: numberFormatDataResponse.data.moduleId ?? 0,
        transactionId: numberFormatDataResponse.data.transactionId ?? 0,
        prefix: numberFormatDataResponse.data.prefix ?? "",
        prefixDelimiter: numberFormatDataResponse.data.prefixDelimiter ?? "-",
        prefixSeq: numberFormatDataResponse.data.prefixSeq ?? 1,
        includeYear: numberFormatDataResponse.data.includeYear ?? true,
        yearDelimiter: numberFormatDataResponse.data.yearDelimiter ?? "-",
        yearSeq: numberFormatDataResponse.data.yearSeq ?? 2,
        yearFormat: numberFormatDataResponse.data.yearFormat ?? "YYYY",
        includeMonth: numberFormatDataResponse.data.includeMonth ?? true,
        monthDelimiter: numberFormatDataResponse.data.monthDelimiter ?? "",
        monthSeq: numberFormatDataResponse.data.monthSeq ?? 3,
        monthFormat: numberFormatDataResponse.data.monthFormat ?? "MM",
        noDIgits: numberFormatDataResponse.data.noDIgits ?? 4,
        dIgitSeq: numberFormatDataResponse.data.dIgitSeq ?? 4,
        resetYearly: numberFormatDataResponse.data.resetYearly ?? false,
      })
    } else if (
      numberFormatDataResponse?.result !== undefined &&
      (numberFormatDataResponse.result < 0 || !numberFormatDataResponse.data)
    ) {
      // Clear form when result is negative or data is null
      form.reset({
        numberId: 0,
        moduleId: 0,
        transactionId: 0,
        prefix: "",
        prefixDelimiter: "-",
        prefixSeq: 1,
        includeYear: true,
        yearDelimiter: "-",
        yearSeq: 2,
        yearFormat: "YYYY",
        includeMonth: true,
        monthDelimiter: "",
        monthSeq: 3,
        monthFormat: "MM",
        noDIgits: 4,
        dIgitSeq: 4,
        resetYearly: false,
      })
    }
  }, [numberFormatDataResponse, form])

  // --- Fix: Auto-select first module when loaded ---
  useEffect(() => {
    if (moduleTrnsData && moduleTrnsData.length > 0 && !selectedModule) {
      setSelectedModule(moduleTrnsData[0].moduleId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleTrnsData])

  // Helper to get selected module/transaction names
  const selectedModuleName = useMemo(() => {
    return (
      moduleTrnsData?.find((m) => m.moduleId === selectedModule)?.moduleName ||
      ""
    )
  }, [moduleTrnsData, selectedModule])

  const selectedTransactionName = useMemo(() => {
    return (
      moduleTrnsData?.find(
        (m) =>
          m.moduleId === selectedModule &&
          m.transactionId === selectedTransaction
      )?.transactionName || ""
    )
  }, [moduleTrnsData, selectedModule, selectedTransaction])

  function onSubmit(data: DocumentNoFormValues) {
    if (!selectedModule || !selectedTransaction) {
      toast.error("Please select a module and transaction")
      return
    }

    saveNumberFormat(
      {
        data: {
          ...data,
          moduleId: selectedModule,
          transactionId: selectedTransaction,
        },
      },
      {
        onSuccess: (response) => {
          if (response.result === 1) {
            toast.success("Document number format saved successfully")
            refetchNumberFormat()
          } else {
            toast.error(
              response.message || "Failed to save document number format"
            )
          }
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to save document number format"
          )
        },
      }
    )
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Watch form values to make preview reactive
  const watchedValues = form.watch()

  const previewDocumentNo = () => {
    const values = watchedValues
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1 // 1-12

    interface Part {
      seq: number
      value: string
      delimiter: string
    }

    const parts: Part[] = []

    if (values.prefix) {
      parts.push({
        seq: values.prefixSeq ?? 1,
        value: values.prefix,
        delimiter: values.prefixDelimiter || "",
      })
    }

    if (values.includeYear) {
      let yearStr = ""
      if (values.yearFormat === "YYYY") {
        yearStr = String(year)
      } else if (values.yearFormat === "YY") {
        yearStr = String(year).slice(-2)
      }
      parts.push({
        seq: values.yearSeq ?? 2,
        value: yearStr,
        delimiter: values.yearDelimiter || "",
      })
    }

    if (values.includeMonth) {
      let monthStr = ""
      if (values.monthFormat === "MM") {
        monthStr = String(month).padStart(2, "0")
      } else if (values.monthFormat === "MMMM") {
        monthStr = monthNames[month - 1]
      }
      parts.push({
        seq: values.monthSeq ?? 3,
        value: monthStr,
        delimiter: values.monthDelimiter || "",
      })
    }

    const sequence = "0".repeat(Number(values.noDIgits) || 4)
    parts.push({
      seq: values.dIgitSeq ?? 4,
      value: sequence,
      delimiter: "",
    })

    parts.sort((a, b) => a.seq - b.seq)

    return parts
      .map((part, index) => {
        if (index < parts.length - 1) {
          return part.value + part.delimiter
        }
        return part.value
      })
      .join("")
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col gap-4 lg:flex-row">
      {/* Left Panel - Module List */}
      <Card className="lg:w-[20%]">
        <CardContent className="p-4">
          <div className="mb-4 text-lg font-semibold">List</div>
          {isModuleListLoading ? (
            <div>Loading...</div>
          ) : isModuleListError ? (
            <div className="text-destructive">Failed to load modules</div>
          ) : moduleTrnsData && moduleTrnsData.length > 0 ? (
            <div className="space-y-1">
              {moduleTrnsData
                .reduce<ModuleGroup[]>((acc, curr) => {
                  const existingModule = acc.find((m) => m.id === curr.moduleId)
                  if (existingModule) {
                    existingModule.transactions.push({
                      id: curr.transactionId,
                      name: curr.transactionName,
                    })
                  } else {
                    acc.push({
                      id: curr.moduleId,
                      name: curr.moduleName,
                      transactions: [
                        {
                          id: curr.transactionId,
                          name: curr.transactionName,
                        },
                      ],
                    })
                  }
                  return acc
                }, [])
                .map((module) => (
                  <div key={module.id}>
                    <div
                      className={`flex cursor-pointer items-center gap-2 rounded-md p-2 ${
                        selectedModule === module.id
                          ? "bg-primary/10"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() =>
                        setSelectedModule((prev) =>
                          prev === module.id ? null : module.id
                        )
                      }
                    >
                      <span className="font-medium">{module.name}</span>
                    </div>
                    {selectedModule === module.id && (
                      <div className="text-muted-foreground space-y-1 pl-4 text-sm">
                        {module.transactions.map(
                          (transaction: { id: number; name: string }) => (
                            <div
                              key={transaction.id}
                              className={`hover:bg-accent cursor-pointer rounded p-1.5 ${
                                selectedTransaction === transaction.id
                                  ? "bg-accent"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedTransaction(transaction.id)
                              }}
                            >
                              - {transaction.name}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No modules available</div>
          )}
        </CardContent>
      </Card>

      {/* Middle Panel - Form */}
      <Card className="lg:w-[55%]">
        <CardContent className="p-6">
          {isNumberFormatLoading ? (
            <div>Loading...</div>
          ) : isNumberFormatError ? (
            <div className="text-destructive">Failed to load number format</div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="mb-4">
                  {!selectedModule ? (
                    <div className="text-destructive">Select a Module</div>
                  ) : !selectedTransaction ? (
                    <div className="text-destructive">Select a Transaction</div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-6">
                    {/* Length and Document Number section */}
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👁️</span>
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                              Live Preview
                            </h3>
                          </div>
                          {selectedModule && selectedTransaction && (
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold">
                                {selectedModuleName} - {selectedTransactionName}{" "}
                                :
                              </span>
                              {numberFormatData ? (
                                <span className="inline-block rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                                  Set
                                </span>
                              ) : (
                                <span className="inline-block rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                                  Not set
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4 text-sm">
                          See how your document number will look with current
                          settings
                        </p>
                        <div className="rounded-md border-2 border-dashed border-gray-300 bg-white p-4 text-center dark:border-gray-600 dark:bg-gray-900">
                          <div className="text-primary font-mono text-2xl font-bold">
                            {previewDocumentNo()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Main Configuration Grid */}
                    <div className="space-y-6">
                      <div className="border-b pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-foreground text-lg font-semibold">
                              Document Number Configuration
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                              Configure how your document numbers will be
                              formatted
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => {
                                form.reset()
                                setSelectedModule(null)
                                setSelectedTransaction(null)
                              }}
                            >
                              Clear
                            </Button>
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                          {/* Column 1: Prefix */}
                          <div className="flex h-full w-full min-w-0 flex-col space-y-4">
                            <div className="bg-primary/10 flex h-full w-full flex-col rounded-md p-3">
                              <h4 className="text-primary mb-3 flex items-center gap-2 text-sm font-semibold">
                                📝 Prefix Settings
                              </h4>
                              <CustomInput
                                form={form}
                                name="prefix"
                                placeholder="Enter prefix (e.g., INV)"
                              />

                              <div className="space-y-3">
                                <CustomCheckbox
                                  form={form}
                                  name="includeYear"
                                  label="Year"
                                />
                                <CustomCheckbox
                                  form={form}
                                  name="includeMonth"
                                  label="Month"
                                />
                              </div>

                              <CustomInput
                                form={form}
                                name="noDIgits"
                                type="number"
                                placeholder="Number of digits (e.g., 4)"
                              />
                            </div>
                          </div>
                          {/* Column 2: Delimiter */}
                          <div className="flex h-full w-full min-w-0 flex-col space-y-4">
                            <div className="flex h-full w-full flex-col rounded-md bg-blue-500/10 p-3">
                              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                                🔗 Delimiter Settings
                              </h4>
                              <div className="space-y-3">
                                <CustomInput
                                  form={form}
                                  name="prefixDelimiter"
                                  placeholder="Prefix delimiter (e.g., -)"
                                />
                                <CustomInput
                                  form={form}
                                  name="yearDelimiter"
                                  placeholder="Year delimiter (e.g., -)"
                                />
                                <CustomInput
                                  form={form}
                                  name="monthDelimiter"
                                  placeholder="Month delimiter (e.g., -)"
                                />
                              </div>
                            </div>
                          </div>
                          {/* Column 3: Sequence Number */}
                          <div className="flex h-full w-full min-w-0 flex-col space-y-4">
                            <div className="flex h-full w-full flex-col rounded-md bg-green-500/10 p-3">
                              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-600">
                                🔢 Sequence Order
                              </h4>
                              <div className="w-full space-y-3">
                                <SelectCommon
                                  form={form}
                                  name="prefixSeq"
                                  options={[
                                    { value: "1", label: "Position 1" },
                                    { value: "2", label: "Position 2" },
                                    { value: "3", label: "Position 3" },
                                    { value: "4", label: "Position 4" },
                                  ]}
                                  placeholder="Prefix position"
                                  onValueChange={(value) =>
                                    form.setValue("prefixSeq", Number(value))
                                  }
                                />
                                <SelectCommon
                                  form={form}
                                  name="yearSeq"
                                  options={[
                                    { value: "1", label: "Position 1" },
                                    { value: "2", label: "Position 2" },
                                    { value: "3", label: "Position 3" },
                                    { value: "4", label: "Position 4" },
                                  ]}
                                  placeholder="Year position"
                                  onValueChange={(value) =>
                                    form.setValue("yearSeq", Number(value))
                                  }
                                />
                                <SelectCommon
                                  form={form}
                                  name="monthSeq"
                                  options={[
                                    { value: "1", label: "Position 1" },
                                    { value: "2", label: "Position 2" },
                                    { value: "3", label: "Position 3" },
                                    { value: "4", label: "Position 4" },
                                  ]}
                                  placeholder="Month position"
                                  onValueChange={(value) =>
                                    form.setValue("monthSeq", Number(value))
                                  }
                                />
                                <SelectCommon
                                  form={form}
                                  name="dIgitSeq"
                                  options={[
                                    { value: "1", label: "Position 1" },
                                    { value: "2", label: "Position 2" },
                                    { value: "3", label: "Position 3" },
                                    { value: "4", label: "Position 4" },
                                  ]}
                                  placeholder="Digits position"
                                  onValueChange={(value) =>
                                    form.setValue("dIgitSeq", Number(value))
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          {/* Column 4: Format */}
                          <div className="flex h-full w-full min-w-0 flex-col space-y-4">
                            <div className="flex h-full w-full flex-col rounded-md bg-purple-500/10 p-3">
                              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-purple-600">
                                🎨 Format Settings
                              </h4>
                              <div className="w-full space-y-3">
                                <SelectCommon
                                  form={form}
                                  name="yearFormat"
                                  options={[
                                    { value: "YY", label: "YY (25)" },
                                    { value: "YYYY", label: "YYYY (2025)" },
                                  ]}
                                  placeholder="Year format"
                                />
                                <SelectCommon
                                  form={form}
                                  name="monthFormat"
                                  options={[
                                    { value: "MM", label: "MM (01-12)" },
                                    { value: "MMMM", label: "MMMM (January)" },
                                  ]}
                                  placeholder="Month format"
                                />
                                <CustomCheckbox
                                  form={form}
                                  name="resetYearly"
                                  label="Sequence yearly"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Document Content */}
      <Card className="lg:w-[25%]">
        <CardContent className="p-4">
          <div className="mb-4 font-semibold">Document Content</div>
          <div className="mb-4">
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() + i
                  return (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[440px]">
            <div className="space-y-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-2 py-1 text-left text-xs font-medium">
                      Month
                    </th>
                    <th className="px-2 py-1 text-left text-xs font-medium">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isDetailsLoading ? (
                    <tr>
                      <td colSpan={2} className="px-2 py-1 text-center text-xs">
                        Loading...
                      </td>
                    </tr>
                  ) : isDetailsError ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-destructive px-2 py-1 text-center text-xs"
                      >
                        Failed to load details
                      </td>
                    </tr>
                  ) : numberFormatGridData &&
                    numberFormatGridData.length > 0 ? (
                    numberFormatGridData.map((row, i) => (
                      <tr
                        key={`month-row-${i}`}
                        className={i % 2 === 1 ? "bg-muted/20" : ""}
                      >
                        <td className="px-2 py-1 text-xs">{row.month}</td>
                        <td className="text-muted-foreground px-2 py-1 text-xs">
                          {row.count.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-muted-foreground px-2 py-1 text-center text-xs"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
