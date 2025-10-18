"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  IApAdjustmentDt,
  IApAdjustmentFilter,
  IApAdjustmentHd,
} from "@/interfaces/ap-adjustment"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApAdjustmentDtSchemaType,
  ApAdjustmentHdSchemaType,
  apadjustmentHdSchema,
} from "@/schemas/ap-adjustment"
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
import { ApAdjustment } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { APTransactionId, ModuleId, TableName } from "@/lib/utils"
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
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CloneConfirmation,
  DeleteConfirmation,
  LoadConfirmation,
  ResetConfirmation,
  SaveConfirmation,
} from "@/components/confirmation"

import { defaultAdjustment } from "./components/adjustment-defaultvalues"
import AdjustmentTable from "./components/adjustment-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function AdjustmentPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.adjustment

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingAdjustment, setIsLoadingAdjustment] = useState(false)
  const [isSelectingAdjustment, setIsSelectingAdjustment] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [adjustment, setAdjustment] = useState<ApAdjustmentHdSchemaType | null>(
    null
  )
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IApAdjustmentFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "adjustmentNo",
    sortOrder: "asc",
    pageNumber: 1,
    pageSize: 15,
  })

  const { data: visibleFieldsData } = useGetVisibleFields(
    moduleId,
    transactionId
  )

  const { data: requiredFieldsData } = useGetRequiredFields(
    moduleId,
    transactionId
  )

  // Use nullish coalescing to handle fallback values
  const visible: IVisibleFields = visibleFieldsData ?? null
  const required: IMandatoryFields = requiredFieldsData ?? null

  // Add form state management
  const form = useForm<ApAdjustmentHdSchemaType>({
    resolver: zodResolver(apadjustmentHdSchema(required, visible)),
    defaultValues: adjustment
      ? {
          adjustmentId: adjustment.adjustmentId?.toString() ?? "0",
          adjustmentNo: adjustment.adjustmentNo ?? "",
          referenceNo: adjustment.referenceNo ?? "",
          trnDate: adjustment.trnDate ?? new Date(),
          accountDate: adjustment.accountDate ?? new Date(),
          dueDate: adjustment.dueDate ?? new Date(),
          deliveryDate: adjustment.deliveryDate ?? new Date(),
          gstClaimDate: adjustment.gstClaimDate ?? new Date(),
          supplierId: adjustment.supplierId ?? 0,
          currencyId: adjustment.currencyId ?? 0,
          exhRate: adjustment.exhRate ?? 0,
          ctyExhRate: adjustment.ctyExhRate ?? 0,
          creditTermId: adjustment.creditTermId ?? 0,
          bankId: adjustment.bankId ?? 0,
          totAmt: adjustment.totAmt ?? 0,
          totLocalAmt: adjustment.totLocalAmt ?? 0,
          totCtyAmt: adjustment.totCtyAmt ?? 0,
          gstAmt: adjustment.gstAmt ?? 0,
          gstLocalAmt: adjustment.gstLocalAmt ?? 0,
          gstCtyAmt: adjustment.gstCtyAmt ?? 0,
          totAmtAftGst: adjustment.totAmtAftGst ?? 0,
          totLocalAmtAftGst: adjustment.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: adjustment.totCtyAmtAftGst ?? 0,
          balAmt: adjustment.balAmt ?? 0,
          balLocalAmt: adjustment.balLocalAmt ?? 0,
          payAmt: adjustment.payAmt ?? 0,
          payLocalAmt: adjustment.payLocalAmt ?? 0,
          exGainLoss: adjustment.exGainLoss ?? 0,
          operationId: adjustment.operationId ?? 0,
          operationNo: adjustment.operationNo ?? "",
          remarks: adjustment.remarks ?? "",
          address1: adjustment.address1 ?? "",
          address2: adjustment.address2 ?? "",
          address3: adjustment.address3 ?? "",
          address4: adjustment.address4 ?? "",
          pinCode: adjustment.pinCode ?? "",
          countryId: adjustment.countryId ?? 0,
          phoneNo: adjustment.phoneNo ?? "",
          faxNo: adjustment.faxNo ?? "",
          contactName: adjustment.contactName ?? "",
          mobileNo: adjustment.mobileNo ?? "",
          emailAdd: adjustment.emailAdd ?? "",
          moduleFrom: adjustment.moduleFrom ?? "",
          suppAdjustmentNo: adjustment.suppAdjustmentNo ?? "",
          customerName: adjustment.customerName ?? "",
          addressId: adjustment.addressId ?? 0,
          contactId: adjustment.contactId ?? 0,
          arAdjustmentId: adjustment.arAdjustmentId ?? "",
          arAdjustmentNo: adjustment.arAdjustmentNo ?? "",
          editVersion: adjustment.editVersion ?? 0,
          purchaseOrderId: adjustment.purchaseOrderId ?? 0,
          purchaseOrderNo: adjustment.purchaseOrderNo ?? "",
          data_details:
            adjustment.data_details?.map((detail) => ({
              ...detail,
              adjustmentId: detail.adjustmentId?.toString() ?? "0",
              adjustmentNo: detail.adjustmentNo?.toString() ?? "",
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              deliveryDate: detail.deliveryDate ?? "",
              supplyDate: detail.supplyDate ?? "",
              remarks: detail.remarks ?? "",
              customerName: detail.customerName ?? "",
              custAdjustmentNo: detail.custAdjustmentNo ?? "",
              suppAdjustmentNo: detail.suppAdjustmentNo ?? "",
            })) || [],
        }
      : {
          ...defaultAdjustment,
        },
  })

  // API hooks for adjustments - Only fetch when List dialog is opened (optimized)
  const {
    data: adjustmentsResponse,
    refetch: refetchAdjustments,
    isLoading: isLoadingAdjustments,
    isRefetching: isRefetchingAdjustments,
  } = useGetWithDates<IApAdjustmentHd>(
    `${ApAdjustment.get}`,
    TableName.apAdjustment,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize adjustment data to prevent unnecessary re-renders
  const adjustmentsData = useMemo(
    () => (adjustmentsResponse as ApiResponse<IApAdjustmentHd>)?.data ?? [],
    [adjustmentsResponse]
  )

  // Mutations
  const saveMutation = usePersist<ApAdjustmentHdSchemaType>(
    `${ApAdjustment.add}`
  )
  const updateMutation = usePersist<ApAdjustmentHdSchemaType>(
    `${ApAdjustment.add}`
  )
  const deleteMutation = useDelete(`${ApAdjustment.delete}`)

  // Remove the useGetAdjustmentById hook for selection
  // const { data: adjustmentByIdData, refetch: refetchAdjustmentById } = ...

  // Handle Save
  const handleSaveAdjustment = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IApAdjustmentHd
      )

      // Validate the form data using the schema
      const validationResult = apadjustmentHdSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)
        toast.error("Please check form data and try again")
        return
      }

      //check totamt and totlocalamt should be zero
      if (formValues.totAmt === 0 || formValues.totLocalAmt === 0) {
        toast.error("Total Amount and Total Local Amount should not be zero")
        return
      }

      const response =
        Number(formValues.adjustmentId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const adjustmentData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (adjustmentData) {
          const updatedSchemaType = transformToSchemaType(
            adjustmentData as unknown as IApAdjustmentHd
          )
          setIsSelectingAdjustment(true)
          setAdjustment(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Check if this was a new adjustment or update
        const wasNewAdjustment = Number(formValues.adjustmentId) === 0

        if (wasNewAdjustment) {
          //toast.success(
          // `Adjustment ${adjustmentData?.adjustmentNo || ""} saved successfully`
          //)
        } else {
          //toast.success("Adjustment updated successfully")
        }

        refetchAdjustments()
      } else {
        toast.error(response.message || "Failed to save adjustment")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving adjustment")
    } finally {
      setIsSaving(false)
      setIsSelectingAdjustment(false)
    }
  }

  // Handle Clone
  const handleCloneAdjustment = () => {
    if (adjustment) {
      // Create a proper clone with form values
      const clonedAdjustment: ApAdjustmentHdSchemaType = {
        ...adjustment,
        adjustmentId: "0",
        adjustmentNo: "",
        // Reset amounts for new adjustment
        totAmt: 0,
        totLocalAmt: 0,
        totCtyAmt: 0,
        gstAmt: 0,
        gstLocalAmt: 0,
        gstCtyAmt: 0,
        totAmtAftGst: 0,
        totLocalAmtAftGst: 0,
        totCtyAmtAftGst: 0,
        balAmt: 0,
        balLocalAmt: 0,
        payAmt: 0,
        payLocalAmt: 0,
        exGainLoss: 0,
        // Reset data details
        data_details: [],
      }
      setAdjustment(clonedAdjustment)
      form.reset(clonedAdjustment)
      toast.success("Adjustment cloned successfully")
    }
  }

  // Handle Delete
  const handleAdjustmentDelete = async () => {
    if (!adjustment) return

    try {
      const response = await deleteMutation.mutateAsync(
        adjustment.adjustmentId?.toString() ?? ""
      )
      if (response.result === 1) {
        setAdjustment(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultAdjustment,
          data_details: [],
        })
        //toast.success("Adjustment deleted successfully")
        refetchAdjustments()
      } else {
        toast.error(response.message || "Failed to delete adjustment")
      }
    } catch {
      toast.error("Network error while deleting adjustment")
    }
  }

  // Handle Reset
  const handleAdjustmentReset = () => {
    setAdjustment(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultAdjustment,
      data_details: [],
    })
    toast.success("Adjustment reset successfully")
  }

  // Helper function to transform IApAdjustmentHd to ApAdjustmentHdSchemaType
  const transformToSchemaType = (
    apiAdjustment: IApAdjustmentHd
  ): ApAdjustmentHdSchemaType => {
    return {
      adjustmentId: apiAdjustment.adjustmentId?.toString() ?? "0",
      adjustmentNo: apiAdjustment.adjustmentNo ?? "",
      referenceNo: apiAdjustment.referenceNo ?? "",
      suppAdjustmentNo: apiAdjustment.suppAdjustmentNo ?? "",
      trnDate: apiAdjustment.trnDate
        ? format(
            parseDate(apiAdjustment.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiAdjustment.accountDate
        ? format(
            parseDate(apiAdjustment.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      dueDate: apiAdjustment.dueDate
        ? format(
            parseDate(apiAdjustment.dueDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      deliveryDate: apiAdjustment.deliveryDate
        ? format(
            parseDate(apiAdjustment.deliveryDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstClaimDate: apiAdjustment.gstClaimDate
        ? format(
            parseDate(apiAdjustment.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      supplierId: apiAdjustment.supplierId ?? 0,
      currencyId: apiAdjustment.currencyId ?? 0,
      exhRate: apiAdjustment.exhRate ?? 0,
      ctyExhRate: apiAdjustment.ctyExhRate ?? 0,
      creditTermId: apiAdjustment.creditTermId ?? 0,
      bankId: apiAdjustment.bankId ?? 0,
      totAmt: apiAdjustment.totAmt ?? 0,
      totLocalAmt: apiAdjustment.totLocalAmt ?? 0,
      totCtyAmt: apiAdjustment.totCtyAmt ?? 0,
      gstAmt: apiAdjustment.gstAmt ?? 0,
      gstLocalAmt: apiAdjustment.gstLocalAmt ?? 0,
      gstCtyAmt: apiAdjustment.gstCtyAmt ?? 0,
      totAmtAftGst: apiAdjustment.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiAdjustment.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiAdjustment.totCtyAmtAftGst ?? 0,
      balAmt: apiAdjustment.balAmt ?? 0,
      balLocalAmt: apiAdjustment.balLocalAmt ?? 0,
      payAmt: apiAdjustment.payAmt ?? 0,
      payLocalAmt: apiAdjustment.payLocalAmt ?? 0,
      exGainLoss: apiAdjustment.exGainLoss ?? 0,
      operationId: apiAdjustment.operationId ?? 0,
      operationNo: apiAdjustment.operationNo ?? "",
      remarks: apiAdjustment.remarks ?? "",
      addressId: apiAdjustment.addressId ?? 0, // Not available in IApAdjustmentHd
      contactId: apiAdjustment.contactId ?? 0, // Not available in IApAdjustmentHd
      address1: apiAdjustment.address1 ?? "",
      address2: apiAdjustment.address2 ?? "",
      address3: apiAdjustment.address3 ?? "",
      address4: apiAdjustment.address4 ?? "",
      pinCode: apiAdjustment.pinCode ?? "",
      countryId: apiAdjustment.countryId ?? 0,
      phoneNo: apiAdjustment.phoneNo ?? "",
      faxNo: apiAdjustment.faxNo ?? "",
      contactName: apiAdjustment.contactName ?? "",
      mobileNo: apiAdjustment.mobileNo ?? "",
      emailAdd: apiAdjustment.emailAdd ?? "",
      moduleFrom: apiAdjustment.moduleFrom ?? "",
      customerName: apiAdjustment.customerName ?? "",
      arAdjustmentId: apiAdjustment.arAdjustmentId ?? "",
      arAdjustmentNo: apiAdjustment.arAdjustmentNo ?? "",
      editVersion: apiAdjustment.editVersion ?? 0,
      purchaseOrderId: apiAdjustment.purchaseOrderId ?? 0,
      purchaseOrderNo: apiAdjustment.purchaseOrderNo ?? "",
      createBy: apiAdjustment.createBy ?? "",
      editBy: apiAdjustment.editBy ?? "",
      cancelBy: apiAdjustment.cancelBy ?? "",
      createDate: apiAdjustment.createDate
        ? format(
            parseDate(apiAdjustment.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",

      editDate: apiAdjustment.editDate
        ? format(
            parseDate(apiAdjustment.editDate as unknown as string) ||
              new Date(),
            clientDateFormat
          )
        : "",
      cancelDate: apiAdjustment.cancelDate
        ? format(
            parseDate(apiAdjustment.cancelDate as unknown as string) ||
              new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiAdjustment.cancelRemarks ?? "",
      data_details:
        apiAdjustment.data_details?.map(
          (detail) =>
            ({
              ...detail,
              adjustmentId: detail.adjustmentId?.toString() ?? "0",
              adjustmentNo: detail.adjustmentNo ?? "",
              itemNo: detail.itemNo ?? 0,
              seqNo: detail.seqNo ?? 0,
              docItemNo: detail.docItemNo ?? 0,
              productId: detail.productId ?? 0,
              productCode: detail.productCode ?? "",
              productName: detail.productName ?? "",
              glId: detail.glId ?? 0,
              glCode: detail.glCode ?? "",
              glName: detail.glName ?? "",
              qty: detail.qty ?? 0,
              billQTY: detail.billQTY ?? 0,
              uomId: detail.uomId ?? 0,
              uomCode: detail.uomCode ?? "",
              uomName: detail.uomName ?? "",
              unitPrice: detail.unitPrice ?? 0,
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              remarks: detail.remarks ?? "",
              gstId: detail.gstId ?? 0,
              gstName: detail.gstName ?? "",
              gstPercentage: detail.gstPercentage ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              deliveryDate: detail.deliveryDate
                ? format(
                    parseDate(detail.deliveryDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              departmentId: detail.departmentId ?? 0,
              departmentCode: detail.departmentCode ?? "",
              departmentName: detail.departmentName ?? "",
              jobOrderId: detail.jobOrderId ?? 0,
              jobOrderNo: detail.jobOrderNo ?? "",
              taskId: detail.taskId ?? 0,
              taskName: detail.taskName ?? "",
              serviceId: detail.serviceId ?? 0,
              serviceName: detail.serviceName ?? "",
              employeeId: detail.employeeId ?? 0,
              employeeCode: detail.employeeCode ?? "",
              employeeName: detail.employeeName ?? "",
              portId: detail.portId ?? 0,
              portCode: detail.portCode ?? "",
              portName: detail.portName ?? "",
              vesselId: detail.vesselId ?? 0,
              vesselCode: detail.vesselCode ?? "",
              vesselName: detail.vesselName ?? "",
              bargeId: detail.bargeId ?? 0,
              bargeCode: detail.bargeCode ?? "",
              bargeName: detail.bargeName ?? "",
              voyageId: detail.voyageId ?? 0,
              voyageNo: detail.voyageNo ?? "",
              operationId: detail.operationId ?? "",
              operationNo: detail.operationNo ?? "",
              opRefNo: detail.opRefNo ?? "",
              purchaseOrderId: detail.purchaseOrderId ?? "",
              purchaseOrderNo: detail.purchaseOrderNo ?? "",
              supplyDate: detail.supplyDate
                ? format(
                    parseDate(detail.supplyDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              customerName: detail.customerName ?? "",
              custAdjustmentNo: detail.custAdjustmentNo ?? "",
              arAdjustmentId: detail.arAdjustmentId ?? "",
              arAdjustmentNo: detail.arAdjustmentNo ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as ApAdjustmentDtSchemaType
        ) || [],
    }
  }

  const handleAdjustmentSelect = async (
    selectedAdjustment: IApAdjustmentHd | undefined
  ) => {
    if (!selectedAdjustment) return

    setIsSelectingAdjustment(true)

    try {
      // Fetch adjustment details directly using selected adjustment's values
      const response = await getById(
        `${ApAdjustment.getByIdNo}/${selectedAdjustment.adjustmentId}/${selectedAdjustment.adjustmentNo}`
      )

      if (response?.result === 1) {
        const detailedAdjustment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedAdjustment) {
          // Parse dates properly
          const updatedAdjustment = {
            ...detailedAdjustment,
            adjustmentId: detailedAdjustment.adjustmentId?.toString() ?? "0",
            adjustmentNo: detailedAdjustment.adjustmentNo ?? "",
            referenceNo: detailedAdjustment.referenceNo ?? "",
            suppAdjustmentNo: detailedAdjustment.suppAdjustmentNo ?? "",
            trnDate: detailedAdjustment.trnDate
              ? format(
                  parseDate(detailedAdjustment.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedAdjustment.accountDate
              ? format(
                  parseDate(detailedAdjustment.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedAdjustment.dueDate
              ? format(
                  parseDate(detailedAdjustment.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedAdjustment.deliveryDate
              ? format(
                  parseDate(detailedAdjustment.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedAdjustment.gstClaimDate
              ? format(
                  parseDate(detailedAdjustment.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedAdjustment.supplierId ?? 0,
            currencyId: detailedAdjustment.currencyId ?? 0,
            exhRate: detailedAdjustment.exhRate ?? 0,
            ctyExhRate: detailedAdjustment.ctyExhRate ?? 0,
            creditTermId: detailedAdjustment.creditTermId ?? 0,
            bankId: detailedAdjustment.bankId ?? 0,
            totAmt: detailedAdjustment.totAmt ?? 0,
            totLocalAmt: detailedAdjustment.totLocalAmt ?? 0,
            totCtyAmt: detailedAdjustment.totCtyAmt ?? 0,
            gstAmt: detailedAdjustment.gstAmt ?? 0,
            gstLocalAmt: detailedAdjustment.gstLocalAmt ?? 0,
            gstCtyAmt: detailedAdjustment.gstCtyAmt ?? 0,
            totAmtAftGst: detailedAdjustment.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedAdjustment.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedAdjustment.totCtyAmtAftGst ?? 0,
            balAmt: detailedAdjustment.balAmt ?? 0,
            balLocalAmt: detailedAdjustment.balLocalAmt ?? 0,
            payAmt: detailedAdjustment.payAmt ?? 0,
            payLocalAmt: detailedAdjustment.payLocalAmt ?? 0,
            exGainLoss: detailedAdjustment.exGainLoss ?? 0,
            operationId: detailedAdjustment.operationId ?? 0,
            operationNo: detailedAdjustment.operationNo ?? "",
            remarks: detailedAdjustment.remarks ?? "",
            addressId: detailedAdjustment.addressId ?? 0, // Not available in IApAdjustmentHd
            contactId: detailedAdjustment.contactId ?? 0, // Not available in IApAdjustmentHd
            address1: detailedAdjustment.address1 ?? "",
            address2: detailedAdjustment.address2 ?? "",
            address3: detailedAdjustment.address3 ?? "",
            address4: detailedAdjustment.address4 ?? "",
            pinCode: detailedAdjustment.pinCode ?? "",
            countryId: detailedAdjustment.countryId ?? 0,
            phoneNo: detailedAdjustment.phoneNo ?? "",
            faxNo: detailedAdjustment.faxNo ?? "",
            contactName: detailedAdjustment.contactName ?? "",
            mobileNo: detailedAdjustment.mobileNo ?? "",
            emailAdd: detailedAdjustment.emailAdd ?? "",
            moduleFrom: detailedAdjustment.moduleFrom ?? "",
            customerName: detailedAdjustment.customerName ?? "",
            arAdjustmentId: detailedAdjustment.arAdjustmentId ?? "",
            arAdjustmentNo: detailedAdjustment.arAdjustmentNo ?? "",
            editVersion: detailedAdjustment.editVersion ?? 0,
            purchaseOrderId: detailedAdjustment.purchaseOrderId ?? 0,
            purchaseOrderNo: detailedAdjustment.purchaseOrderNo ?? "",
            createBy: detailedAdjustment.createBy ?? "",
            createDate: detailedAdjustment.createDate ?? "",
            editBy: detailedAdjustment.editBy ?? "",
            editDate: detailedAdjustment.editDate ?? "",
            cancelBy: detailedAdjustment.cancelBy ?? "",
            cancelDate: detailedAdjustment.cancelDate ?? "",
            cancelRemarks: detailedAdjustment.cancelRemarks ?? "",
            data_details:
              detailedAdjustment.data_details?.map(
                (detail: IApAdjustmentDt) => ({
                  adjustmentId: detail.adjustmentId?.toString() ?? "0",
                  adjustmentNo: detail.adjustmentNo ?? "",
                  itemNo: detail.itemNo ?? 0,
                  seqNo: detail.seqNo ?? 0,
                  docItemNo: detail.docItemNo ?? 0,
                  productId: detail.productId ?? 0,
                  productCode: detail.productCode ?? "",
                  productName: detail.productName ?? "",
                  glId: detail.glId ?? 0,
                  glCode: detail.glCode ?? "",
                  glName: detail.glName ?? "",
                  qty: detail.qty ?? 0,
                  billQTY: detail.billQTY ?? 0,
                  uomId: detail.uomId ?? 0,
                  uomCode: detail.uomCode ?? "",
                  uomName: detail.uomName ?? "",
                  unitPrice: detail.unitPrice ?? 0,
                  totAmt: detail.totAmt ?? 0,
                  totLocalAmt: detail.totLocalAmt ?? 0,
                  totCtyAmt: detail.totCtyAmt ?? 0,
                  remarks: detail.remarks ?? "",
                  gstId: detail.gstId ?? 0,
                  gstName: detail.gstName ?? "",
                  gstPercentage: detail.gstPercentage ?? 0,
                  gstAmt: detail.gstAmt ?? 0,
                  gstLocalAmt: detail.gstLocalAmt ?? 0,
                  gstCtyAmt: detail.gstCtyAmt ?? 0,
                  deliveryDate: detail.deliveryDate
                    ? format(
                        parseDate(detail.deliveryDate as string) || new Date(),
                        clientDateFormat
                      )
                    : "",
                  departmentId: detail.departmentId ?? 0,
                  departmentCode: detail.departmentCode ?? "",
                  departmentName: detail.departmentName ?? "",
                  jobOrderId: detail.jobOrderId ?? 0,
                  jobOrderNo: detail.jobOrderNo ?? "",
                  taskId: detail.taskId ?? 0,
                  taskName: detail.taskName ?? "",
                  serviceId: detail.serviceId ?? 0,
                  serviceName: detail.serviceName ?? "",
                  employeeId: detail.employeeId ?? 0,
                  employeeCode: detail.employeeCode ?? "",
                  employeeName: detail.employeeName ?? "",
                  portId: detail.portId ?? 0,
                  portCode: detail.portCode ?? "",
                  portName: detail.portName ?? "",
                  vesselId: detail.vesselId ?? 0,
                  vesselCode: detail.vesselCode ?? "",
                  vesselName: detail.vesselName ?? "",
                  bargeId: detail.bargeId ?? 0,
                  bargeCode: detail.bargeCode ?? "",
                  bargeName: detail.bargeName ?? "",
                  voyageId: detail.voyageId ?? 0,
                  voyageNo: detail.voyageNo ?? "",
                  operationId: detail.operationId ?? "",
                  operationNo: detail.operationNo ?? "",
                  opRefNo: detail.opRefNo ?? "",
                  purchaseOrderId: detail.purchaseOrderId ?? "",
                  purchaseOrderNo: detail.purchaseOrderNo ?? "",
                  supplyDate: detail.supplyDate
                    ? format(
                        parseDate(detail.supplyDate as string) || new Date(),
                        clientDateFormat
                      )
                    : "",
                  customerName: detail.customerName ?? "",
                  custAdjustmentNo: detail.custAdjustmentNo ?? "",
                  arAdjustmentId: detail.arAdjustmentId ?? "",
                  arAdjustmentNo: detail.arAdjustmentNo ?? "",
                  editVersion: detail.editVersion ?? 0,
                })
              ) || [],
          }

          //setAdjustment(updatedAdjustment as ApAdjustmentHdSchemaType)
          setAdjustment(transformToSchemaType(updatedAdjustment))
          form.reset(updatedAdjustment)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `Adjustment ${selectedAdjustment.adjustmentNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch adjustment details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching adjustment details:", error)
      toast.error("Error loading adjustment. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingAdjustment(false)
    }
  }

  // Remove direct refetchAdjustments from handleFilterChange
  const handleFilterChange = (newFilters: IApAdjustmentFilter) => {
    setFilters(newFilters)
    // refetchAdjustments(); // Removed: will be handled by useEffect
  }

  // Refetch adjustments when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchAdjustments()
    }
  }, [filters, showListDialog, refetchAdjustments])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        setShowSaveConfirm(true)
      }
      // Ctrl+L or Cmd+L: Open List
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault()
        setShowListDialog(true)
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  // Add unsaved changes warning
  useEffect(() => {
    const isDirty = form.formState.isDirty
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [form.formState.isDirty])

  const handleAdjustmentSearch = async (value: string) => {
    if (!value) return

    setIsLoadingAdjustment(true)

    try {
      const response = await getById(`${ApAdjustment.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedAdjustment = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedAdjustment) {
          // Parse dates properly
          const updatedAdjustment = {
            ...detailedAdjustment,
            adjustmentId: detailedAdjustment.adjustmentId?.toString() ?? "0",
            adjustmentNo: detailedAdjustment.adjustmentNo ?? "",
            referenceNo: detailedAdjustment.referenceNo ?? "",
            suppAdjustmentNo: detailedAdjustment.suppAdjustmentNo ?? "",
            trnDate: detailedAdjustment.trnDate
              ? format(
                  parseDate(detailedAdjustment.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedAdjustment.accountDate
              ? format(
                  parseDate(detailedAdjustment.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedAdjustment.dueDate
              ? format(
                  parseDate(detailedAdjustment.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedAdjustment.deliveryDate
              ? format(
                  parseDate(detailedAdjustment.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedAdjustment.gstClaimDate
              ? format(
                  parseDate(detailedAdjustment.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedAdjustment.supplierId ?? 0,
            currencyId: detailedAdjustment.currencyId ?? 0,
            exhRate: detailedAdjustment.exhRate ?? 0,
            ctyExhRate: detailedAdjustment.ctyExhRate ?? 0,
            creditTermId: detailedAdjustment.creditTermId ?? 0,
            bankId: detailedAdjustment.bankId ?? 0,
            totAmt: detailedAdjustment.totAmt ?? 0,
            totLocalAmt: detailedAdjustment.totLocalAmt ?? 0,
            totCtyAmt: detailedAdjustment.totCtyAmt ?? 0,
            gstAmt: detailedAdjustment.gstAmt ?? 0,
            gstLocalAmt: detailedAdjustment.gstLocalAmt ?? 0,
            gstCtyAmt: detailedAdjustment.gstCtyAmt ?? 0,
            totAmtAftGst: detailedAdjustment.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedAdjustment.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedAdjustment.totCtyAmtAftGst ?? 0,
            balAmt: detailedAdjustment.balAmt ?? 0,
            balLocalAmt: detailedAdjustment.balLocalAmt ?? 0,
            payAmt: detailedAdjustment.payAmt ?? 0,
            payLocalAmt: detailedAdjustment.payLocalAmt ?? 0,
            exGainLoss: detailedAdjustment.exGainLoss ?? 0,
            operationId: detailedAdjustment.operationId ?? 0,
            operationNo: detailedAdjustment.operationNo ?? "",
            remarks: detailedAdjustment.remarks ?? "",
            addressId: detailedAdjustment.addressId ?? 0, // Not available in IApAdjustmentHd
            contactId: detailedAdjustment.contactId ?? 0, // Not available in IApAdjustmentHd
            address1: detailedAdjustment.address1 ?? "",
            address2: detailedAdjustment.address2 ?? "",
            address3: detailedAdjustment.address3 ?? "",
            address4: detailedAdjustment.address4 ?? "",
            pinCode: detailedAdjustment.pinCode ?? "",
            countryId: detailedAdjustment.countryId ?? 0,
            phoneNo: detailedAdjustment.phoneNo ?? "",
            faxNo: detailedAdjustment.faxNo ?? "",
            contactName: detailedAdjustment.contactName ?? "",
            mobileNo: detailedAdjustment.mobileNo ?? "",
            emailAdd: detailedAdjustment.emailAdd ?? "",
            moduleFrom: detailedAdjustment.moduleFrom ?? "",
            customerName: detailedAdjustment.customerName ?? "",
            arAdjustmentId: detailedAdjustment.arAdjustmentId ?? "",
            arAdjustmentNo: detailedAdjustment.arAdjustmentNo ?? "",
            editVersion: detailedAdjustment.editVersion ?? 0,
            purchaseOrderId: detailedAdjustment.purchaseOrderId ?? 0,
            purchaseOrderNo: detailedAdjustment.purchaseOrderNo ?? "",

            data_details:
              detailedAdjustment.data_details?.map(
                (detail: IApAdjustmentDt) => ({
                  adjustmentId: detail.adjustmentId?.toString() ?? "0",
                  adjustmentNo: detail.adjustmentNo ?? "",
                  itemNo: detail.itemNo ?? 0,
                  seqNo: detail.seqNo ?? 0,
                  docItemNo: detail.docItemNo ?? 0,
                  productId: detail.productId ?? 0,
                  productCode: detail.productCode ?? "",
                  productName: detail.productName ?? "",
                  glId: detail.glId ?? 0,
                  glCode: detail.glCode ?? "",
                  glName: detail.glName ?? "",
                  qty: detail.qty ?? 0,
                  billQTY: detail.billQTY ?? 0,
                  uomId: detail.uomId ?? 0,
                  uomCode: detail.uomCode ?? "",
                  uomName: detail.uomName ?? "",
                  unitPrice: detail.unitPrice ?? 0,
                  totAmt: detail.totAmt ?? 0,
                  totLocalAmt: detail.totLocalAmt ?? 0,
                  totCtyAmt: detail.totCtyAmt ?? 0,
                  remarks: detail.remarks ?? "",
                  gstId: detail.gstId ?? 0,
                  gstName: detail.gstName ?? "",
                  gstPercentage: detail.gstPercentage ?? 0,
                  gstAmt: detail.gstAmt ?? 0,
                  gstLocalAmt: detail.gstLocalAmt ?? 0,
                  gstCtyAmt: detail.gstCtyAmt ?? 0,
                  deliveryDate: detail.deliveryDate
                    ? format(
                        parseDate(detail.deliveryDate as string) || new Date(),
                        clientDateFormat
                      )
                    : "",
                  departmentId: detail.departmentId ?? 0,
                  departmentCode: detail.departmentCode ?? "",
                  departmentName: detail.departmentName ?? "",
                  jobOrderId: detail.jobOrderId ?? 0,
                  jobOrderNo: detail.jobOrderNo ?? "",
                  taskId: detail.taskId ?? 0,
                  taskName: detail.taskName ?? "",
                  serviceId: detail.serviceId ?? 0,
                  serviceName: detail.serviceName ?? "",
                  employeeId: detail.employeeId ?? 0,
                  employeeCode: detail.employeeCode ?? "",
                  employeeName: detail.employeeName ?? "",
                  portId: detail.portId ?? 0,
                  portCode: detail.portCode ?? "",
                  portName: detail.portName ?? "",
                  vesselId: detail.vesselId ?? 0,
                  vesselCode: detail.vesselCode ?? "",
                  vesselName: detail.vesselName ?? "",
                  bargeId: detail.bargeId ?? 0,
                  bargeCode: detail.bargeCode ?? "",
                  bargeName: detail.bargeName ?? "",
                  voyageId: detail.voyageId ?? 0,
                  voyageNo: detail.voyageNo ?? "",
                  operationId: detail.operationId ?? "",
                  operationNo: detail.operationNo ?? "",
                  opRefNo: detail.opRefNo ?? "",
                  purchaseOrderId: detail.purchaseOrderId ?? "",
                  purchaseOrderNo: detail.purchaseOrderNo ?? "",
                  supplyDate: detail.supplyDate
                    ? format(
                        parseDate(detail.supplyDate as string) || new Date(),
                        clientDateFormat
                      )
                    : "",
                  customerName: detail.customerName ?? "",
                  custAdjustmentNo: detail.custAdjustmentNo ?? "",
                  arAdjustmentId: detail.arAdjustmentId ?? "",
                  arAdjustmentNo: detail.arAdjustmentNo ?? "",
                  editVersion: detail.editVersion ?? 0,
                })
              ) || [],
          }

          //setAdjustment(updatedAdjustment as ApAdjustmentHdSchemaType)
          setAdjustment(transformToSchemaType(updatedAdjustment))
          form.reset(updatedAdjustment)
          form.trigger()

          // Show success message
          toast.success(`Adjustment ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch adjustment details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for adjustment")
    } finally {
      setIsLoadingAdjustment(false)
    }
  }

  // Determine mode and adjustment ID from URL
  const adjustmentNo = form.getValues("adjustmentNo")
  const isEdit = Boolean(adjustmentNo)

  // Compose title text
  const titleText = isEdit
    ? `Adjustment (Edit) - ${adjustmentNo}`
    : "Adjustment (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading adjustment form...
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Preparing field settings and validation rules
          </p>
        </div>
      </div>
    )
  }

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
                  setShowLoadConfirm(true)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchNo.trim()) {
                  e.preventDefault()
                  setShowLoadConfirm(true)
                }
              }}
              placeholder="Search Adjustment No"
              className="h-8 text-sm"
              readOnly={
                !!adjustment?.adjustmentId && adjustment.adjustmentId !== "0"
              }
              disabled={
                !!adjustment?.adjustmentId && adjustment.adjustmentId !== "0"
              }
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
              onClick={() => setShowSaveConfirm(true)}
              disabled={
                isSaving || saveMutation.isPending || updateMutation.isPending
              }
            >
              <Save className="mr-1 h-4 w-4" />
              {isSaving || saveMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!adjustment || adjustment.adjustmentId === "0"}
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              //disabled={!adjustment}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={!adjustment || adjustment.adjustmentId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={!adjustment || adjustment.adjustmentId === "0"}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <TabsContent value="main">
          <Main
            form={form}
            onSuccessAction={async () => {
              handleSaveAdjustment()
            }}
            isEdit={isEdit}
            visible={visible}
            required={required}
            companyId={Number(companyId)}
          />
        </TabsContent>

        <TabsContent value="other">
          <Other form={form} />
        </TabsContent>

        <TabsContent value="history">
          <History form={form} isEdit={isEdit} />
        </TabsContent>
      </Tabs>

      {/* List Dialog */}
      <Dialog
        open={showListDialog}
        onOpenChange={(open) => {
          setShowListDialog(open)
          if (open) {
            refetchAdjustments()
          }
        }}
      >
        <DialogContent
          className="@container h-[90vh] w-[90vw] !max-w-none overflow-y-auto rounded-lg p-4"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Adjustment List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing adjustments from the list below.
                  Use search to filter records or create new adjustments.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingAdjustments ||
          isRefetchingAdjustments ||
          isSelectingAdjustment ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingAdjustment
                    ? "Loading adjustment details..."
                    : "Loading adjustments..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingAdjustment
                    ? "Please wait while we fetch the complete adjustment data"
                    : "Please wait while we fetch the adjustment list"}
                </p>
              </div>
            </div>
          ) : (
            <AdjustmentTable
              data={adjustmentsData || []}
              isLoading={false}
              onAdjustmentSelect={handleAdjustmentSelect}
              onRefresh={() => refetchAdjustments()}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Save Confirmation */}
      <SaveConfirmation
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={handleSaveAdjustment}
        itemName={adjustment?.adjustmentNo || "New Adjustment"}
        operationType={
          adjustment?.adjustmentId && adjustment.adjustmentId !== "0"
            ? "update"
            : "create"
        }
        isSaving={
          isSaving || saveMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleAdjustmentDelete}
        itemName={adjustment?.adjustmentNo}
        title="Delete Adjustment"
        description="This action cannot be undone. All adjustment details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleAdjustmentSearch(searchNo)}
        code={searchNo}
        typeLabel="Adjustment"
        showDetails={false}
        description={`Do you want to load Adjustment ${searchNo}?`}
        isLoading={isLoadingAdjustment}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleAdjustmentReset}
        itemName={adjustment?.adjustmentNo}
        title="Reset Adjustment"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneAdjustment}
        itemName={adjustment?.adjustmentNo}
        title="Clone Adjustment"
        description="This will create a copy as a new adjustment."
      />
    </div>
  )
}
