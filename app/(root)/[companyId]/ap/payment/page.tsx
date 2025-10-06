"use client"

import { useEffect, useState } from "react"
import {
  IApPaymentDt,
  IApPaymentFilter,
  IApPaymentHd,
} from "@/interfaces/ap-payment"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import { ApPaymentHdSchemaType, appaymentHdSchema } from "@/schemas/ap-payment"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, subMonths } from "date-fns"
import {
  Copy,
  ListFilter,
  Printer,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getById } from "@/lib/api-client"
import { ApPayment } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { useDelete, useGetWithDates, usePersist } from "@/hooks/use-common"
import { useGetRequiredFields, useGetVisibleFields } from "@/hooks/use-lookup"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"
import { defaultPayment } from "./components/payment-defaultvalues"
import PaymentTable from "./components/payment-table"

export default function PaymentPage() {
  const [showListDialog, setShowListDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState({
    save: false,
    reset: false,
    clone: false,
    delete: false,
    load: false,
  })
  const [payment, setPayment] = useState<ApPaymentHdSchemaType | null>(null)
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IApPaymentFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "paymentNo",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: 10,
  })

  const moduleId = 26 // AP Payment module
  const transactionId = 2 // Payment transaction

  const { data: visibleFieldsData } = useGetVisibleFields(
    moduleId,
    transactionId
  )
  const { data: visibleFields } = visibleFieldsData ?? {}

  const { data: requiredFieldsData } = useGetRequiredFields(
    moduleId,
    transactionId
  )
  const { data: requiredFields } = requiredFieldsData ?? {}

  // Use nullish coalescing to handle fallback values
  const visible: IVisibleFields = visibleFields ?? null
  const required: IMandatoryFields = requiredFields ?? null

  // Add form state management
  const form = useForm<ApPaymentHdSchemaType>({
    resolver: zodResolver(appaymentHdSchema(required, visible)),
    defaultValues: payment
      ? {
          paymentId: payment.paymentId?.toString() ?? "0",
          paymentNo: payment.paymentNo ?? "",
          referenceNo: payment.referenceNo ?? "",
          trnDate: payment.trnDate ?? new Date(),
          accountDate: payment.accountDate ?? new Date(),
          bankId: payment.bankId ?? 0,
          paymentTypeId: payment.paymentTypeId ?? 0,
          chequeNo: payment.chequeNo ?? null,
          chequeDate: payment.chequeDate ?? new Date(),
          bankChargeGLId: payment.bankChargeGLId ?? 0,
          bankChargesAmt: payment.bankChargesAmt ?? 0,
          bankChargesLocalAmt: payment.bankChargesLocalAmt ?? 0,
          supplierId: payment.supplierId ?? 0,
          currencyId: payment.currencyId ?? 0,
          exhRate: payment.exhRate ?? 0,
          totAmt: payment.totAmt ?? 0,
          totLocalAmt: payment.totLocalAmt ?? 0,
          payCurrencyId: payment.payCurrencyId ?? 0,
          payExhRate: payment.payExhRate ?? 0,
          payTotAmt: payment.payTotAmt ?? 0,
          payTotLocalAmt: payment.payTotLocalAmt ?? 0,
          unAllocTotAmt: payment.unAllocTotAmt ?? 0,
          unAllocTotLocalAmt: payment.unAllocTotLocalAmt ?? 0,
          exhGainLoss: payment.exhGainLoss ?? 0,
          remarks: payment.remarks ?? null,
          docExhRate: payment.docExhRate ?? 0,
          docTotAmt: payment.docTotAmt ?? 0,
          docTotLocalAmt: payment.docTotLocalAmt ?? 0,
          allocTotAmt: payment.allocTotAmt ?? null,
          allocTotLocalAmt: payment.allocTotLocalAmt ?? null,
          moduleFrom: payment.moduleFrom ?? "",
          createById: payment.createById ?? 0,
          createDate: payment.createDate ?? new Date(),
          editById: payment.editById ?? null,
          editDate: payment.editDate ?? null,
          editVersion: payment.editVersion ?? 0,
          isCancel: payment.isCancel ?? false,
          cancelById: payment.cancelById ?? null,
          cancelDate: payment.cancelDate ?? null,
          cancelRemarks: payment.cancelRemarks ?? null,
          isPost: payment.isPost ?? null,
          postById: payment.postById ?? null,
          postDate: payment.postDate ?? null,
          appStatusId: payment.appStatusId ?? null,
          appById: payment.appById ?? null,
          appDate: payment.appDate ?? null,
          data_details:
            payment.data_details?.map((detail) => ({
              ...detail,
              paymentId: detail.paymentId?.toString() ?? "0",
              docAccountDate: detail.docAccountDate ?? new Date(),
              docDueDate: detail.docDueDate ?? new Date(),
              docTotAmt: detail.docTotAmt ?? 0,
              docTotLocalAmt: detail.docTotLocalAmt ?? 0,
              docBalAmt: detail.docBalAmt ?? 0,
              docBalLocalAmt: detail.docBalLocalAmt ?? 0,
              allocAmt: detail.allocAmt ?? 0,
              allocLocalAmt: detail.allocLocalAmt ?? 0,
              docAllocAmt: detail.docAllocAmt ?? 0,
              docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
              centDiff: detail.centDiff ?? 0,
              exhGainLoss: detail.exhGainLoss ?? 0,
              editVersion: detail.editVersion ?? 0,
            })) || [],
        }
      : {
          ...defaultPayment,
        },
  })

  // API hooks for payments
  const {
    data: paymentsResponse,
    refetch: refetchPayments,
    isLoading: isLoadingPayments,
    isRefetching: isRefetchingPayments,
  } = useGetWithDates<IApPaymentHd>(
    `${ApPayment.get}`,
    "apPaymentHd",
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString()
  )

  const { data: paymentsData } =
    (paymentsResponse as ApiResponse<IApPaymentHd>) ?? {
      result: 0,
      message: "",
      data: [],
    }

  // Mutations
  const saveMutation = usePersist<ApPaymentHdSchemaType>(`${ApPayment.add}`)
  const updateMutation = usePersist<ApPaymentHdSchemaType>(`${ApPayment.add}`)
  const deleteMutation = useDelete(`${ApPayment.delete}`)

  const handleConfirmation = async (action: string) => {
    setShowConfirmDialog((prev) => ({ ...prev, [action]: false }))

    switch (action) {
      case "save":
        try {
          // Get form values and validate them
          const formValues = transformToSchemaType(
            form.getValues() as unknown as IApPaymentHd
          )

          // Validate the form data using the schema
          const validationResult = appaymentHdSchema(
            required,
            visible
          ).safeParse(formValues)

          if (!validationResult.success) {
            console.error("Form validation failed:", validationResult.error)
            toast.error("Please check form data and try again")
            return
          }

          console.log("formValues to save", formValues)

          const response =
            Number(formValues.paymentId) === 0
              ? await saveMutation.mutateAsync(formValues)
              : await updateMutation.mutateAsync(formValues)

          if (response.result === 1) {
            const paymentData = Array.isArray(response.data)
              ? response.data[0]
              : response.data

            // Transform API response back to form values if needed
            if (paymentData) {
              const updatedSchemaType = transformToSchemaType(
                paymentData as unknown as IApPaymentHd
              )
              setPayment(updatedSchemaType)
            }

            toast.success("Payment saved successfully")
            refetchPayments()
          } else {
            toast.error(response.message || "Failed to save payment")
          }
        } catch (error) {
          console.error("Save error:", error)
          toast.error("Network error while saving payment")
        }
        break
      case "reset":
        handlePaymentReset()
        break
      case "clone":
        if (payment) {
          // Create a proper clone with form values
          const clonedPayment: ApPaymentHdSchemaType = {
            ...payment,
            paymentId: 0,
            paymentNo: "",
            // Reset amounts for new payment
            totAmt: 0,
            totLocalAmt: 0,
            payTotAmt: 0,
            payTotLocalAmt: 0,
            unAllocTotAmt: 0,
            unAllocTotLocalAmt: 0,
            docTotAmt: 0,
            docTotLocalAmt: 0,
            allocTotAmt: 0,
            allocTotLocalAmt: 0,
            exhGainLoss: 0,
            // Reset data details
            data_details: [],
          }
          setPayment(clonedPayment)
          form.reset(clonedPayment)
          toast.success("Payment cloned successfully")
        }
        break
      case "delete":
        handlePaymentDelete()
        break
    }
  }

  const handlePaymentDelete = async () => {
    if (!payment) return

    try {
      const response = await deleteMutation.mutateAsync(
        payment.paymentId?.toString() ?? ""
      )
      if (response.result === 1) {
        setPayment(null)
        toast.success("Payment deleted successfully")
        refetchPayments()
      } else {
        toast.error(response.message || "Failed to delete payment")
      }
    } catch {
      toast.error("Network error while deleting payment")
    }

    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  const handlePaymentReset = () => {
    setPayment(null)
    form.reset({
      ...defaultPayment,
      data_details: [],
    })
    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  // Helper function to transform IApPaymentHd to ApPaymentHdSchemaType
  const transformToSchemaType = (
    apiPayment: IApPaymentHd
  ): ApPaymentHdSchemaType => {
    return {
      paymentId: apiPayment.paymentId?.toString() ?? "0",
      paymentNo: apiPayment.paymentNo ?? "",
      referenceNo: apiPayment.referenceNo ?? "",
      trnDate: apiPayment.trnDate
        ? format(
            parseDate(apiPayment.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiPayment.accountDate
        ? format(
            parseDate(apiPayment.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankId: apiPayment.bankId ?? 0,
      paymentTypeId: apiPayment.paymentTypeId ?? 0,
      chequeNo: apiPayment.chequeNo ?? null,
      chequeDate: apiPayment.chequeDate
        ? format(
            parseDate(apiPayment.chequeDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      bankChargeGLId: apiPayment.bankChargeGLId ?? 0,
      bankChargesAmt: apiPayment.bankChargesAmt ?? 0,
      bankChargesLocalAmt: apiPayment.bankChargesLocalAmt ?? 0,
      supplierId: apiPayment.supplierId ?? 0,
      currencyId: apiPayment.currencyId ?? 0,
      exhRate: apiPayment.exhRate ?? 0,
      totAmt: apiPayment.totAmt ?? 0,
      totLocalAmt: apiPayment.totLocalAmt ?? 0,
      payCurrencyId: apiPayment.payCurrencyId ?? 0,
      payExhRate: apiPayment.payExhRate ?? 0,
      payTotAmt: apiPayment.payTotAmt ?? 0,
      payTotLocalAmt: apiPayment.payTotLocalAmt ?? 0,
      unAllocTotAmt: apiPayment.unAllocTotAmt ?? 0,
      unAllocTotLocalAmt: apiPayment.unAllocTotLocalAmt ?? 0,
      exhGainLoss: apiPayment.exhGainLoss ?? 0,
      remarks: apiPayment.remarks ?? null,
      docExhRate: apiPayment.docExhRate ?? 0,
      docTotAmt: apiPayment.docTotAmt ?? 0,
      docTotLocalAmt: apiPayment.docTotLocalAmt ?? 0,
      allocTotAmt: apiPayment.allocTotAmt ?? null,
      allocTotLocalAmt: apiPayment.allocTotLocalAmt ?? null,
      moduleFrom: apiPayment.moduleFrom ?? "",
      createById: apiPayment.createById ?? 0,
      createDate: apiPayment.createDate
        ? format(
            parseDate(apiPayment.createDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      editById: apiPayment.editById ?? null,
      editDate: apiPayment.editDate
        ? format(
            parseDate(apiPayment.editDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      editVersion: apiPayment.editVersion ?? 0,
      isCancel: apiPayment.isCancel ?? false,
      cancelById: apiPayment.cancelById ?? null,
      cancelDate: apiPayment.cancelDate
        ? format(
            parseDate(apiPayment.cancelDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      cancelRemarks: apiPayment.cancelRemarks ?? null,
      isPost: apiPayment.isPost ?? null,
      postById: apiPayment.postById ?? null,
      postDate: apiPayment.postDate
        ? format(
            parseDate(apiPayment.postDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      appStatusId: apiPayment.appStatusId ?? null,
      appById: apiPayment.appById ?? null,
      appDate: apiPayment.appDate
        ? format(
            parseDate(apiPayment.appDate as string) || new Date(),
            clientDateFormat
          )
        : null,
      data_details:
        apiPayment.data_details?.map((detail) => ({
          ...detail,
          paymentId: detail.paymentId?.toString() ?? "0",
          docAccountDate: detail.docAccountDate
            ? format(
                parseDate(detail.docAccountDate as string) || new Date(),
                clientDateFormat
              )
            : clientDateFormat,
          docDueDate: detail.docDueDate
            ? format(
                parseDate(detail.docDueDate as string) || new Date(),
                clientDateFormat
              )
            : clientDateFormat,
          docTotAmt: detail.docTotAmt ?? 0,
          docTotLocalAmt: detail.docTotLocalAmt ?? 0,
          docBalAmt: detail.docBalAmt ?? 0,
          docBalLocalAmt: detail.docBalLocalAmt ?? 0,
          allocAmt: detail.allocAmt ?? 0,
          allocLocalAmt: detail.allocLocalAmt ?? 0,
          docAllocAmt: detail.docAllocAmt ?? 0,
          docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
          centDiff: detail.centDiff ?? 0,
          exhGainLoss: detail.exhGainLoss ?? 0,
          editVersion: detail.editVersion ?? 0,
        })) || [],
    }
  }

  const handlePaymentSelect = async (
    selectedPayment: IApPaymentHd | undefined
  ) => {
    if (selectedPayment) {
      // Transform API data to form values
      const formValues = transformToSchemaType(selectedPayment)
      setPayment(formValues)

      try {
        // Fetch payment details directly using selected payment's values
        const response = await getById(
          `${ApPayment.getByIdNo}/${selectedPayment.paymentId}/${selectedPayment.paymentNo}`
        )
        console.log("API Response (direct):", response)

        if (response?.result === 1) {
          const detailedPayment = Array.isArray(response.data)
            ? response.data[0]
            : response.data

          if (detailedPayment) {
            // Parse dates properly
            const updatedPayment = {
              ...detailedPayment,
              trnDate: format(
                parseDate(detailedPayment.trnDate as string) || new Date(),
                clientDateFormat
              ),
              accountDate: format(
                parseDate(detailedPayment.accountDate as string) || new Date(),
                clientDateFormat
              ),
              chequeDate: format(
                parseDate(detailedPayment.chequeDate as string) || new Date(),
                clientDateFormat
              ),
              createDate: format(
                parseDate(detailedPayment.createDate as string) || new Date(),
                clientDateFormat
              ),
              data_details:
                detailedPayment.data_details?.map((detail: IApPaymentDt) => ({
                  ...detail,
                  paymentId: detail.paymentId?.toString() ?? "0",
                  docAccountDate: detail.docAccountDate
                    ? format(
                        parseDate(detail.docAccountDate as string) ||
                          new Date(),
                        clientDateFormat
                      )
                    : clientDateFormat,
                  docDueDate: detail.docDueDate
                    ? format(
                        parseDate(detail.docDueDate as string) || new Date(),
                        clientDateFormat
                      )
                    : clientDateFormat,
                  docTotAmt: detail.docTotAmt ?? 0,
                  docTotLocalAmt: detail.docTotLocalAmt ?? 0,
                  docBalAmt: detail.docBalAmt ?? 0,
                  docBalLocalAmt: detail.docBalLocalAmt ?? 0,
                  allocAmt: detail.allocAmt ?? 0,
                  allocLocalAmt: detail.allocLocalAmt ?? 0,
                  docAllocAmt: detail.docAllocAmt ?? 0,
                  docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
                  centDiff: detail.centDiff ?? 0,
                  exhGainLoss: detail.exhGainLoss ?? 0,
                  editVersion: detail.editVersion ?? 0,
                })) || [],
            }

            setPayment(transformToSchemaType(updatedPayment))
            form.reset(updatedPayment)
            form.trigger()
            console.log("Form values after reset:", form.getValues())
          }
        } else {
          toast.error(
            response?.message || "Failed to fetch payment details (direct)"
          )
        }
      } catch (error) {
        console.error("Error fetching payment details (direct):", error)
        toast.error("Error fetching payment details (direct)")
      }

      setShowListDialog(false)
    }
  }

  // Remove direct refetchPayments from handleFilterChange
  const handleFilterChange = (newFilters: IApPaymentFilter) => {
    setFilters(newFilters)
  }

  // Add useEffect to refetch payments when filters change
  useEffect(() => {
    refetchPayments()
  }, [filters, refetchPayments])

  const handlePaymentSearch = async (value: string) => {
    if (!value) return

    try {
      const response = await getById(`${ApPayment.getByIdNo}/0/${value}`)
      console.log("API Response (direct):", response)

      if (response?.result === 1) {
        const detailedPayment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedPayment) {
          // Parse dates properly
          const updatedPayment = {
            ...detailedPayment,
            trnDate: format(
              parseDate(detailedPayment.trnDate as string) || new Date(),
              clientDateFormat
            ),
            accountDate: format(
              parseDate(detailedPayment.accountDate as string) || new Date(),
              clientDateFormat
            ),
            chequeDate: format(
              parseDate(detailedPayment.chequeDate as string) || new Date(),
              clientDateFormat
            ),
            createDate: format(
              parseDate(detailedPayment.createDate as string) || new Date(),
              clientDateFormat
            ),
            data_details:
              detailedPayment.data_details?.map((detail: IApPaymentDt) => ({
                ...detail,
                paymentId: detail.paymentId?.toString() ?? "0",
                docAccountDate: detail.docAccountDate
                  ? format(
                      parseDate(detail.docAccountDate as string) || new Date(),
                      clientDateFormat
                    )
                  : clientDateFormat,
                docDueDate: detail.docDueDate
                  ? format(
                      parseDate(detail.docDueDate as string) || new Date(),
                      clientDateFormat
                    )
                  : clientDateFormat,
                docTotAmt: detail.docTotAmt ?? 0,
                docTotLocalAmt: detail.docTotLocalAmt ?? 0,
                docBalAmt: detail.docBalAmt ?? 0,
                docBalLocalAmt: detail.docBalLocalAmt ?? 0,
                allocAmt: detail.allocAmt ?? 0,
                allocLocalAmt: detail.allocLocalAmt ?? 0,
                docAllocAmt: detail.docAllocAmt ?? 0,
                docAllocLocalAmt: detail.docAllocLocalAmt ?? 0,
                centDiff: detail.centDiff ?? 0,
                exhGainLoss: detail.exhGainLoss ?? 0,
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          setPayment(transformToSchemaType(updatedPayment))
          form.reset(updatedPayment)
          form.trigger()
          console.log("Form values after reset:", form.getValues())

          // Show success message
          toast.success(`Payment ${value} loaded successfully`)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch payment details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for payment")
    }

    setShowConfirmDialog({
      save: false,
      reset: false,
      clone: false,
      delete: false,
      load: false,
    })
  }

  // Determine mode and payment ID from URL
  const paymentNo = form.getValues("paymentNo")
  const isEdit = Boolean(paymentNo)

  // Compose title text
  const titleText = isEdit ? `Payment (Edit) - ${paymentNo}` : "Payment (New)"

  return (
    <div className="@container flex flex-1 flex-col p-4">
      <Tabs
        defaultValue="main"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <div className="mb-2 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="main">Main</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <h1>
            {/* Outer wrapper: gradient border or yellow pulsing border */}
            <span
              className={`relative inline-flex rounded-full p-[2px] transition-all ${
                isEdit
                  ? "bg-gradient-to-r from-purple-500 to-blue-500" // pulsing yellow border on edit
                  : "animate-pulse bg-gradient-to-r from-purple-500 to-blue-500" // default gradient border
              } `}
            >
              {/* Inner pill: solid dark background + white text */}
              <span
                className={`text-l block rounded-full px-6 font-semibold ${isEdit ? "text-white" : "text-white"}`}
              >
                {titleText}
              </span>
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <Input
              value={searchNo}
              onChange={(e) => setSearchNo(e.target.value)}
              onBlur={() => {
                if (searchNo.trim()) {
                  setShowConfirmDialog({ ...showConfirmDialog, load: true })
                }
              }}
              placeholder="Search Payment No"
              className="h-8 text-sm"
              readOnly={!!payment?.paymentId && payment.paymentId !== "0"}
              disabled={!!payment?.paymentId && payment.paymentId !== "0"}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
            >
              <ListFilter className="mr-1 h-4 w-4" />
              List
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, save: true })
              }
              //disabled={!form.getValues("data_details")?.length}
            >
              <Save className="mr-1 h-4 w-4" />
              Save
            </Button>

            <Button variant="outline" size="sm" disabled={!payment}>
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, reset: true })
              }
              disabled={!form.getValues("data_details")?.length}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, clone: true })
              }
              disabled={!payment}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                setShowConfirmDialog({ ...showConfirmDialog, delete: true })
              }
              disabled={!payment}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <TabsContent value="main">
          <Main
            form={form}
            onSuccessAction={handleConfirmation}
            isEdit={isEdit}
            visible={visible}
          />
        </TabsContent>

        <TabsContent value="other">
          <Other form={form} />
        </TabsContent>

        <TabsContent value="history">
          <History
            form={form}
            isEdit={isEdit}
            moduleId={moduleId}
            transactionId={transactionId}
          />
        </TabsContent>
      </Tabs>

      {/* List Dialog */}
      <Dialog
        open={showListDialog}
        onOpenChange={(open) => {
          setShowListDialog(open)
          if (open) {
            refetchPayments()
          }
        }}
      >
        <DialogContent
          className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Payment List
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Manage and select existing payments from the list below. Use
              search to filter records or create new payments.
            </p>
          </DialogHeader>
          <PaymentTable
            data={paymentsData || []}
            isLoading={isLoadingPayments || isRefetchingPayments}
            onPaymentSelect={handlePaymentSelect}
            onRefresh={() => refetchPayments()}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={Object.values(showConfirmDialog).some(Boolean)}
        onOpenChange={() =>
          setShowConfirmDialog({
            save: false,
            reset: false,
            clone: false,
            delete: false,
            load: false,
          })
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {showConfirmDialog.save && "Save Payment"}
              {showConfirmDialog.reset && "Reset Payment"}
              {showConfirmDialog.clone && "Clone Payment"}
              {showConfirmDialog.delete && "Delete Payment"}
              {showConfirmDialog.load && "Load Payment"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <h3 className="mb-4 text-lg font-medium">
              {showConfirmDialog.save && "Do you want to save changes?"}
              {showConfirmDialog.reset && "Do you want to reset all fields?"}
              {showConfirmDialog.clone && "Do you want to clone this payment?"}
              {showConfirmDialog.delete &&
                "Do you want to delete this payment?"}
              {showConfirmDialog.load && "Do you want to load this payment?"}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  setShowConfirmDialog({
                    save: false,
                    reset: false,
                    clone: false,
                    delete: false,
                    load: false,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (showConfirmDialog.save) handleConfirmation("save")
                  if (showConfirmDialog.reset) handleConfirmation("reset")
                  if (showConfirmDialog.clone) handleConfirmation("clone")
                  if (showConfirmDialog.delete) handleConfirmation("delete")
                  if (showConfirmDialog.load) handlePaymentSearch(searchNo)
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
