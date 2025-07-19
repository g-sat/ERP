"use client"

import React, { useEffect, useMemo, useState } from "react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CustomSwitch from "@/components/ui-custom/custom-switch"

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

  const previewDocumentNo = () => {
    const values = form.getValues()
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
      <Card className="bg-muted/10 lg:w-80">
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
      <Card className="flex-1">
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
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium">
                        {selectedModuleName} - {selectedTransactionName} :
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

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-6">
                    {/* Length and Document Number section */}
                    <div className="space-y-4">
                      <div className="bg-muted/5 rounded-lg border p-4">
                        <div className="mb-2 font-medium">Preview</div>
                        <div className="font-mono text-xl">
                          {previewDocumentNo()}
                        </div>
                      </div>
                    </div>

                    {/* Main Configuration Grid */}
                    <div className="space-y-4">
                      <div className="text-muted-foreground text-sm font-medium">
                        Configuration
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {/* Column 1: Prefix */}
                        <div className="space-y-4">
                          <div className="text-sm font-medium">Prefix</div>
                          <FormField
                            control={form.control}
                            name="prefix"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="bg-muted/5"
                                    placeholder="Enter prefix"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <CustomSwitch
                            form={form}
                            name="includeYear"
                            label="Year Status"
                          />
                          <CustomSwitch
                            form={form}
                            name="includeMonth"
                            label="Month Status"
                          />

                          <FormField
                            control={form.control}
                            name="noDIgits"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="bg-muted/5"
                                    placeholder="Number of digits"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Column 2: Delimiter */}
                        <div className="space-y-4">
                          <div className="text-sm font-medium">Delimiter</div>
                          <FormField
                            control={form.control}
                            name="prefixDelimiter"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="bg-muted/5"
                                    maxLength={1}
                                    placeholder="-"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="yearDelimiter"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="bg-muted/5"
                                    maxLength={1}
                                    placeholder="-"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="monthDelimiter"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="bg-muted/5"
                                    maxLength={1}
                                    placeholder="-"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Column 3: Sequence Number */}
                        <div className="space-y-4">
                          <div className="text-sm font-medium">Sq.No</div>
                          <FormField
                            control={form.control}
                            name="prefixSeq"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(Number(value))
                                  }
                                  defaultValue={String(field.value)}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/5">
                                      <SelectValue placeholder="1" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1, 2, 3, 4].map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="yearSeq"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(Number(value))
                                  }
                                  defaultValue={String(field.value)}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/5">
                                      <SelectValue placeholder="2" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1, 2, 3, 4].map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="monthSeq"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(Number(value))
                                  }
                                  defaultValue={String(field.value)}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/5">
                                      <SelectValue placeholder="3" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1, 2, 3, 4].map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dIgitSeq"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(Number(value))
                                  }
                                  defaultValue={String(field.value)}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/5">
                                      <SelectValue placeholder="3" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1, 2, 3, 4].map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Column 4: Format */}
                        <div className="space-y-4">
                          <div className="text-sm font-medium">Format</div>
                          <FormField
                            control={form.control}
                            name="yearFormat"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/5">
                                      <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="YY">YY</SelectItem>
                                    <SelectItem value="YYYY">YYYY</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="monthFormat"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="bg-muted/5">
                                      <SelectValue placeholder="Select format" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="MM">MM</SelectItem>
                                    <SelectItem value="MMMM">MMMM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
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
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Right Panel - Document Content */}
      <Card className="lg:w-90">
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
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="p-2 text-left font-medium">Month</th>
                    <th className="p-2 text-left font-medium">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {isDetailsLoading ? (
                    <tr>
                      <td colSpan={2} className="p-2 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : isDetailsError ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-destructive p-2 text-center"
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
                        <td className="p-2">{row.month}</td>
                        <td className="text-muted-foreground p-2">
                          {row.count.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-muted-foreground p-2 text-center"
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
