"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  IArDebitNoteDt,
  IArDebitNoteFilter,
  IArDebitNoteHd,
} from "@/interfaces"
import { ApiResponse } from "@/interfaces/auth"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ArDebitNoteDtSchemaType,
  ArDebitNoteHdSchema,
  ArDebitNoteHdSchemaType,
} from "@/schemas"
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
import { ArDebitNote } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { ARTransactionId, ModuleId, TableName } from "@/lib/utils"
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

import { defaultDebitNote } from "./components/debitNote-defaultvalues"
import DebitNoteTable from "./components/debitNote-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function DebitNotePage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ar
  const transactionId = ARTransactionId.debitNote

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingDebitNote, setIsLoadingDebitNote] = useState(false)
  const [isSelectingDebitNote, setIsSelectingDebitNote] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [debitNote, setDebitNote] = useState<ArDebitNoteHdSchemaType | null>(
    null
  )
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IArDebitNoteFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "debitNoteNo",
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
  const form = useForm<ArDebitNoteHdSchemaType>({
    resolver: zodResolver(ArDebitNoteHdSchema(required, visible)),
    defaultValues: debitNote
      ? {
          debitNoteId: debitNote.debitNoteId?.toString() ?? "0",
          debitNoteNo: debitNote.debitNoteNo ?? "",
          referenceNo: debitNote.referenceNo ?? "",
          suppDebitNoteNo: debitNote.suppDebitNoteNo ?? "",
          trnDate: debitNote.trnDate ?? new Date(),
          accountDate: debitNote.accountDate ?? new Date(),
          dueDate: debitNote.dueDate ?? new Date(),
          deliveryDate: debitNote.deliveryDate ?? new Date(),
          gstClaimDate: debitNote.gstClaimDate ?? new Date(),
          customerId: debitNote.customerId ?? 0,
          currencyId: debitNote.currencyId ?? 0,
          exhRate: debitNote.exhRate ?? 0,
          ctyExhRate: debitNote.ctyExhRate ?? 0,
          creditTermId: debitNote.creditTermId ?? 0,
          bankId: debitNote.bankId ?? 0,
          invoiceId: debitNote.invoiceId ?? "0",
          invoiceNo: debitNote.invoiceNo ?? "",
          jobOrderId: debitNote.jobOrderId ?? 0,
          jobOrderNo: debitNote.jobOrderNo ?? "",
          totAmt: debitNote.totAmt ?? 0,
          totLocalAmt: debitNote.totLocalAmt ?? 0,
          totCtyAmt: debitNote.totCtyAmt ?? 0,
          gstAmt: debitNote.gstAmt ?? 0,
          gstLocalAmt: debitNote.gstLocalAmt ?? 0,
          gstCtyAmt: debitNote.gstCtyAmt ?? 0,
          totAmtAftGst: debitNote.totAmtAftGst ?? 0,
          totLocalAmtAftGst: debitNote.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: debitNote.totCtyAmtAftGst ?? 0,
          balAmt: debitNote.balAmt ?? 0,
          balLocalAmt: debitNote.balLocalAmt ?? 0,
          payAmt: debitNote.payAmt ?? 0,
          payLocalAmt: debitNote.payLocalAmt ?? 0,
          exGainLoss: debitNote.exGainLoss ?? 0,
          operationId: debitNote.operationId ?? 0,
          operationNo: debitNote.operationNo ?? "",
          remarks: debitNote.remarks ?? "",
          address1: debitNote.address1 ?? "",
          address2: debitNote.address2 ?? "",
          address3: debitNote.address3 ?? "",
          address4: debitNote.address4 ?? "",
          pinCode: debitNote.pinCode ?? "",
          countryId: debitNote.countryId ?? 0,
          phoneNo: debitNote.phoneNo ?? "",
          faxNo: debitNote.faxNo ?? "",
          contactName: debitNote.contactName ?? "",
          mobileNo: debitNote.mobileNo ?? "",
          emailAdd: debitNote.emailAdd ?? "",
          moduleFrom: debitNote.moduleFrom ?? "",
          supplierName: debitNote.supplierName ?? "",
          addressId: debitNote.addressId ?? 0,
          contactId: debitNote.contactId ?? 0,
          apDebitNoteId: debitNote.apDebitNoteId ?? "",
          apDebitNoteNo: debitNote.apDebitNoteNo ?? "",
          editVersion: debitNote.editVersion ?? 0,
          salesOrderId: debitNote.salesOrderId ?? 0,
          salesOrderNo: debitNote.salesOrderNo ?? "",
          data_details:
            debitNote.data_details?.map((detail) => ({
              ...detail,
              debitNoteId: detail.debitNoteId?.toString() ?? "0",
              debitNoteNo: detail.debitNoteNo?.toString() ?? "",
              totAmt: detail.totAmt ?? 0,
              totLocalAmt: detail.totLocalAmt ?? 0,
              totCtyAmt: detail.totCtyAmt ?? 0,
              gstAmt: detail.gstAmt ?? 0,
              gstLocalAmt: detail.gstLocalAmt ?? 0,
              gstCtyAmt: detail.gstCtyAmt ?? 0,
              deliveryDate: detail.deliveryDate ?? "",
              supplyDate: detail.supplyDate ?? "",
              remarks: detail.remarks ?? "",
              supplierName: detail.supplierName ?? "",
              suppDebitNoteNo: detail.suppDebitNoteNo ?? "",
              apDebitNoteId: detail.apDebitNoteId ?? "0",
              apDebitNoteNo: detail.apDebitNoteNo ?? "",
              editVersion: detail.editVersion ?? 0,
            })) || [],
        }
      : {
          ...defaultDebitNote,
        },
  })

  // API hooks for debitNotes - Only fetch when List dialog is opened (optimized)
  const {
    data: debitNotesResponse,
    refetch: refetchDebitNotes,
    isLoading: isLoadingDebitNotes,
    isRefetching: isRefetchingDebitNotes,
  } = useGetWithDates<IArDebitNoteHd>(
    `${ArDebitNote.get}`,
    TableName.arDebitNote,
    filters.search,
    filters.startDate?.toString(),
    filters.endDate?.toString(),
    undefined, // options
    false // enabled: Don't auto-fetch - only when List button is clicked
  )

  // Memoize debitNote data to prevent unnecessary re-renders
  const debitNotesData = useMemo(
    () => (debitNotesResponse as ApiResponse<IArDebitNoteHd>)?.data ?? [],
    [debitNotesResponse]
  )

  // Mutations
  const saveMutation = usePersist<ArDebitNoteHdSchemaType>(`${ArDebitNote.add}`)
  const updateMutation = usePersist<ArDebitNoteHdSchemaType>(
    `${ArDebitNote.add}`
  )
  const deleteMutation = useDelete(`${ArDebitNote.delete}`)

  // Remove the useGetDebitNoteById hook for selection
  // const { data: debitNoteByIdData, refetch: refetchDebitNoteById } = ...

  // Handle Save
  const handleSaveDebitNote = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IArDebitNoteHd
      )

      // Validate the form data using the schema
      const validationResult = ArDebitNoteHdSchema(required, visible).safeParse(
        formValues
      )

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof ArDebitNoteHdSchemaType
          form.setError(fieldPath, {
            type: "validation",
            message: error.message,
          })
        })

        toast.error("Please check form data and try again")
        return
      }

      //check totamt and totlocalamt should be zero
      if (formValues.totAmt === 0 || formValues.totLocalAmt === 0) {
        toast.error("Total Amount and Total Local Amount should not be zero")
        return
      }

      const response =
        Number(formValues.debitNoteId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const debitNoteData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (debitNoteData) {
          const updatedSchemaType = transformToSchemaType(
            debitNoteData as unknown as IArDebitNoteHd
          )
          setIsSelectingDebitNote(true)
          setDebitNote(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Check if this was a new debitNote or update
        const wasNewDebitNote = Number(formValues.debitNoteId) === 0

        if (wasNewDebitNote) {
          //toast.success(
          // `DebitNote ${debitNoteData?.debitNoteNo || ""} saved successfully`
          //)
        } else {
          //toast.success("DebitNote updated successfully")
        }

        refetchDebitNotes()
      } else {
        toast.error(response.message || "Failed to save debitNote")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving debitNote")
    } finally {
      setIsSaving(false)
      setIsSelectingDebitNote(false)
    }
  }

  // Handle Clone
  const handleCloneDebitNote = () => {
    if (debitNote) {
      // Create a proper clone with form values
      const clonedDebitNote: ArDebitNoteHdSchemaType = {
        ...debitNote,
        debitNoteId: "0",
        debitNoteNo: "",
        // Reset amounts for new debitNote
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
      setDebitNote(clonedDebitNote)
      form.reset(clonedDebitNote)
      toast.success("DebitNote cloned successfully")
    }
  }

  // Handle Delete
  const handleDebitNoteDelete = async () => {
    if (!debitNote) return

    try {
      const response = await deleteMutation.mutateAsync(
        debitNote.debitNoteId?.toString() ?? ""
      )
      if (response.result === 1) {
        setDebitNote(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultDebitNote,
          data_details: [],
        })
        //toast.success("DebitNote deleted successfully")
        refetchDebitNotes()
      } else {
        toast.error(response.message || "Failed to delete debitNote")
      }
    } catch {
      toast.error("Network error while deleting debitNote")
    }
  }

  // Handle Reset
  const handleDebitNoteReset = () => {
    setDebitNote(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultDebitNote,
      data_details: [],
    })
    toast.success("DebitNote reset successfully")
  }

  // Helper function to transform IArDebitNoteHd to ArDebitNoteHdSchemaType
  const transformToSchemaType = (
    apiDebitNote: IArDebitNoteHd
  ): ArDebitNoteHdSchemaType => {
    return {
      debitNoteId: apiDebitNote.debitNoteId?.toString() ?? "0",
      debitNoteNo: apiDebitNote.debitNoteNo ?? "",
      referenceNo: apiDebitNote.referenceNo ?? "",
      suppDebitNoteNo: apiDebitNote.suppDebitNoteNo ?? "",
      trnDate: apiDebitNote.trnDate
        ? format(
            parseDate(apiDebitNote.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiDebitNote.accountDate
        ? format(
            parseDate(apiDebitNote.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      dueDate: apiDebitNote.dueDate
        ? format(
            parseDate(apiDebitNote.dueDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      deliveryDate: apiDebitNote.deliveryDate
        ? format(
            parseDate(apiDebitNote.deliveryDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstClaimDate: apiDebitNote.gstClaimDate
        ? format(
            parseDate(apiDebitNote.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      customerId: apiDebitNote.customerId ?? 0,
      currencyId: apiDebitNote.currencyId ?? 0,
      exhRate: apiDebitNote.exhRate ?? 0,
      ctyExhRate: apiDebitNote.ctyExhRate ?? 0,
      creditTermId: apiDebitNote.creditTermId ?? 0,
      bankId: apiDebitNote.bankId ?? 0,
      invoiceId: apiDebitNote.invoiceId ?? "0",
      invoiceNo: apiDebitNote.invoiceNo ?? "",
      jobOrderId: apiDebitNote.jobOrderId ?? 0,
      jobOrderNo: apiDebitNote.jobOrderNo ?? "",
      totAmt: apiDebitNote.totAmt ?? 0,
      totLocalAmt: apiDebitNote.totLocalAmt ?? 0,
      totCtyAmt: apiDebitNote.totCtyAmt ?? 0,
      gstAmt: apiDebitNote.gstAmt ?? 0,
      gstLocalAmt: apiDebitNote.gstLocalAmt ?? 0,
      gstCtyAmt: apiDebitNote.gstCtyAmt ?? 0,
      totAmtAftGst: apiDebitNote.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiDebitNote.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiDebitNote.totCtyAmtAftGst ?? 0,
      balAmt: apiDebitNote.balAmt ?? 0,
      balLocalAmt: apiDebitNote.balLocalAmt ?? 0,
      payAmt: apiDebitNote.payAmt ?? 0,
      payLocalAmt: apiDebitNote.payLocalAmt ?? 0,
      exGainLoss: apiDebitNote.exGainLoss ?? 0,
      operationId: apiDebitNote.operationId ?? 0,
      operationNo: apiDebitNote.operationNo ?? "",
      remarks: apiDebitNote.remarks ?? "",
      addressId: apiDebitNote.addressId ?? 0, // Not available in IArDebitNoteHd
      contactId: apiDebitNote.contactId ?? 0, // Not available in IArDebitNoteHd
      address1: apiDebitNote.address1 ?? "",
      address2: apiDebitNote.address2 ?? "",
      address3: apiDebitNote.address3 ?? "",
      address4: apiDebitNote.address4 ?? "",
      pinCode: apiDebitNote.pinCode ?? "",
      countryId: apiDebitNote.countryId ?? 0,
      phoneNo: apiDebitNote.phoneNo ?? "",
      faxNo: apiDebitNote.faxNo ?? "",
      contactName: apiDebitNote.contactName ?? "",
      mobileNo: apiDebitNote.mobileNo ?? "",
      emailAdd: apiDebitNote.emailAdd ?? "",
      moduleFrom: apiDebitNote.moduleFrom ?? "",
      supplierName: apiDebitNote.supplierName ?? "",
      apDebitNoteId: apiDebitNote.apDebitNoteId ?? "",
      apDebitNoteNo: apiDebitNote.apDebitNoteNo ?? "",
      editVersion: apiDebitNote.editVersion ?? 0,
      salesOrderId: apiDebitNote.salesOrderId ?? 0,
      salesOrderNo: apiDebitNote.salesOrderNo ?? "",
      createBy: apiDebitNote.createBy ?? "",
      editBy: apiDebitNote.editBy ?? "",
      cancelBy: apiDebitNote.cancelBy ?? "",
      createDate: apiDebitNote.createDate
        ? format(
            parseDate(apiDebitNote.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",

      editDate: apiDebitNote.editDate
        ? format(
            parseDate(apiDebitNote.editDate as unknown as string) || new Date(),
            clientDateFormat
          )
        : "",
      cancelDate: apiDebitNote.cancelDate
        ? format(
            parseDate(apiDebitNote.cancelDate as unknown as string) ||
              new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiDebitNote.cancelRemarks ?? "",
      data_details:
        apiDebitNote.data_details?.map(
          (detail) =>
            ({
              ...detail,
              debitNoteId: detail.debitNoteId?.toString() ?? "0",
              debitNoteNo: detail.debitNoteNo ?? "",
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
              salesOrderId: detail.salesOrderId ?? "",
              salesOrderNo: detail.salesOrderNo ?? "",
              supplyDate: detail.supplyDate
                ? format(
                    parseDate(detail.supplyDate as string) || new Date(),
                    clientDateFormat
                  )
                : "",
              supplierName: detail.supplierName ?? "",
              suppDebitNoteNo: detail.suppDebitNoteNo ?? "",
              apDebitNoteId: detail.apDebitNoteId ?? "",
              apDebitNoteNo: detail.apDebitNoteNo ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as ArDebitNoteDtSchemaType
        ) || [],
    }
  }

  const handleDebitNoteSelect = async (
    selectedDebitNote: IArDebitNoteHd | undefined
  ) => {
    if (!selectedDebitNote) return

    setIsSelectingDebitNote(true)

    try {
      // Fetch debitNote details directly using selected debitNote's values
      const response = await getById(
        `${ArDebitNote.getByIdNo}/${selectedDebitNote.debitNoteId}/${selectedDebitNote.debitNoteNo}`
      )

      if (response?.result === 1) {
        const detailedDebitNote = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedDebitNote) {
          // Parse dates properly
          const updatedDebitNote = {
            ...detailedDebitNote,
            debitNoteId: detailedDebitNote.debitNoteId?.toString() ?? "0",
            debitNoteNo: detailedDebitNote.debitNoteNo ?? "",
            referenceNo: detailedDebitNote.referenceNo ?? "",
            suppDebitNoteNo: detailedDebitNote.suppDebitNoteNo ?? "",
            trnDate: detailedDebitNote.trnDate
              ? format(
                  parseDate(detailedDebitNote.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedDebitNote.accountDate
              ? format(
                  parseDate(detailedDebitNote.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedDebitNote.dueDate
              ? format(
                  parseDate(detailedDebitNote.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedDebitNote.deliveryDate
              ? format(
                  parseDate(detailedDebitNote.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedDebitNote.gstClaimDate
              ? format(
                  parseDate(detailedDebitNote.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            customerId: detailedDebitNote.customerId ?? 0,
            currencyId: detailedDebitNote.currencyId ?? 0,
            exhRate: detailedDebitNote.exhRate ?? 0,
            ctyExhRate: detailedDebitNote.ctyExhRate ?? 0,
            creditTermId: detailedDebitNote.creditTermId ?? 0,
            bankId: detailedDebitNote.bankId ?? 0,
            invoiceId: detailedDebitNote.invoiceId ?? "0",
            invoiceNo: detailedDebitNote.invoiceNo ?? "",
            totAmt: detailedDebitNote.totAmt ?? 0,
            totLocalAmt: detailedDebitNote.totLocalAmt ?? 0,
            totCtyAmt: detailedDebitNote.totCtyAmt ?? 0,
            gstAmt: detailedDebitNote.gstAmt ?? 0,
            gstLocalAmt: detailedDebitNote.gstLocalAmt ?? 0,
            gstCtyAmt: detailedDebitNote.gstCtyAmt ?? 0,
            totAmtAftGst: detailedDebitNote.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedDebitNote.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedDebitNote.totCtyAmtAftGst ?? 0,
            balAmt: detailedDebitNote.balAmt ?? 0,
            balLocalAmt: detailedDebitNote.balLocalAmt ?? 0,
            payAmt: detailedDebitNote.payAmt ?? 0,
            payLocalAmt: detailedDebitNote.payLocalAmt ?? 0,
            exGainLoss: detailedDebitNote.exGainLoss ?? 0,
            operationId: detailedDebitNote.operationId ?? 0,
            operationNo: detailedDebitNote.operationNo ?? "",
            remarks: detailedDebitNote.remarks ?? "",
            addressId: detailedDebitNote.addressId ?? 0, // Not available in IArDebitNoteHd
            contactId: detailedDebitNote.contactId ?? 0, // Not available in IArDebitNoteHd
            address1: detailedDebitNote.address1 ?? "",
            address2: detailedDebitNote.address2 ?? "",
            address3: detailedDebitNote.address3 ?? "",
            address4: detailedDebitNote.address4 ?? "",
            pinCode: detailedDebitNote.pinCode ?? "",
            countryId: detailedDebitNote.countryId ?? 0,
            phoneNo: detailedDebitNote.phoneNo ?? "",
            faxNo: detailedDebitNote.faxNo ?? "",
            contactName: detailedDebitNote.contactName ?? "",
            mobileNo: detailedDebitNote.mobileNo ?? "",
            emailAdd: detailedDebitNote.emailAdd ?? "",
            moduleFrom: detailedDebitNote.moduleFrom ?? "",
            customerName: detailedDebitNote.customerName ?? "",
            apDebitNoteId: detailedDebitNote.apDebitNoteId ?? "",
            apDebitNoteNo: detailedDebitNote.apDebitNoteNo ?? "",
            editVersion: detailedDebitNote.editVersion ?? 0,
            salesOrderId: detailedDebitNote.salesOrderId ?? 0,
            salesOrderNo: detailedDebitNote.salesOrderNo ?? "",
            createBy: detailedDebitNote.createBy ?? "",
            createDate: detailedDebitNote.createDate ?? "",
            editBy: detailedDebitNote.editBy ?? "",
            editDate: detailedDebitNote.editDate ?? "",
            cancelBy: detailedDebitNote.cancelBy ?? "",
            cancelDate: detailedDebitNote.cancelDate ?? "",
            cancelRemarks: detailedDebitNote.cancelRemarks ?? "",
            data_details:
              detailedDebitNote.data_details?.map((detail: IArDebitNoteDt) => ({
                debitNoteId: detail.debitNoteId?.toString() ?? "0",
                debitNoteNo: detail.debitNoteNo ?? "",
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
                salesOrderId: detail.salesOrderId ?? "",
                salesOrderNo: detail.salesOrderNo ?? "",
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                supplierName: detail.supplierName ?? "",
                suppDebitNoteNo: detail.suppDebitNoteNo ?? "",
                apDebitNoteId: detail.apDebitNoteId ?? "",
                apDebitNoteNo: detail.apDebitNoteNo ?? "",
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setDebitNote(updatedDebitNote as ArDebitNoteHdSchemaType)
          setDebitNote(transformToSchemaType(updatedDebitNote))
          form.reset(updatedDebitNote)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `DebitNote ${selectedDebitNote.debitNoteNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch debitNote details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching debitNote details:", error)
      toast.error("Error loading debitNote. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingDebitNote(false)
    }
  }

  // Remove direct refetchDebitNotes from handleFilterChange
  const handleFilterChange = (newFilters: IArDebitNoteFilter) => {
    setFilters(newFilters)
    // refetchDebitNotes(); // Removed: will be handled by useEffect
  }

  // Refetch debitNotes when filters change (only if dialog is open)
  useEffect(() => {
    if (showListDialog) {
      refetchDebitNotes()
    }
  }, [filters, showListDialog, refetchDebitNotes])

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

  const handleDebitNoteSearch = async (value: string) => {
    if (!value) return

    setIsLoadingDebitNote(true)

    try {
      const response = await getById(`${ArDebitNote.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedDebitNote = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedDebitNote) {
          // Parse dates properly
          const updatedDebitNote = {
            ...detailedDebitNote,
            debitNoteId: detailedDebitNote.debitNoteId?.toString() ?? "0",
            debitNoteNo: detailedDebitNote.debitNoteNo ?? "",
            referenceNo: detailedDebitNote.referenceNo ?? "",
            suppDebitNoteNo: detailedDebitNote.suppDebitNoteNo ?? "",
            trnDate: detailedDebitNote.trnDate
              ? format(
                  parseDate(detailedDebitNote.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedDebitNote.accountDate
              ? format(
                  parseDate(detailedDebitNote.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedDebitNote.dueDate
              ? format(
                  parseDate(detailedDebitNote.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedDebitNote.deliveryDate
              ? format(
                  parseDate(detailedDebitNote.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedDebitNote.gstClaimDate
              ? format(
                  parseDate(detailedDebitNote.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            customerId: detailedDebitNote.customerId ?? 0,
            currencyId: detailedDebitNote.currencyId ?? 0,
            exhRate: detailedDebitNote.exhRate ?? 0,
            ctyExhRate: detailedDebitNote.ctyExhRate ?? 0,
            creditTermId: detailedDebitNote.creditTermId ?? 0,
            bankId: detailedDebitNote.bankId ?? 0,
            invoiceId: detailedDebitNote.invoiceId ?? "0",
            invoiceNo: detailedDebitNote.invoiceNo ?? "",
            totAmt: detailedDebitNote.totAmt ?? 0,
            totLocalAmt: detailedDebitNote.totLocalAmt ?? 0,
            totCtyAmt: detailedDebitNote.totCtyAmt ?? 0,
            gstAmt: detailedDebitNote.gstAmt ?? 0,
            gstLocalAmt: detailedDebitNote.gstLocalAmt ?? 0,
            gstCtyAmt: detailedDebitNote.gstCtyAmt ?? 0,
            totAmtAftGst: detailedDebitNote.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedDebitNote.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedDebitNote.totCtyAmtAftGst ?? 0,
            balAmt: detailedDebitNote.balAmt ?? 0,
            balLocalAmt: detailedDebitNote.balLocalAmt ?? 0,
            payAmt: detailedDebitNote.payAmt ?? 0,
            payLocalAmt: detailedDebitNote.payLocalAmt ?? 0,
            exGainLoss: detailedDebitNote.exGainLoss ?? 0,
            operationId: detailedDebitNote.operationId ?? 0,
            operationNo: detailedDebitNote.operationNo ?? "",
            remarks: detailedDebitNote.remarks ?? "",
            addressId: detailedDebitNote.addressId ?? 0, // Not available in IArDebitNoteHd
            contactId: detailedDebitNote.contactId ?? 0, // Not available in IArDebitNoteHd
            address1: detailedDebitNote.address1 ?? "",
            address2: detailedDebitNote.address2 ?? "",
            address3: detailedDebitNote.address3 ?? "",
            address4: detailedDebitNote.address4 ?? "",
            pinCode: detailedDebitNote.pinCode ?? "",
            countryId: detailedDebitNote.countryId ?? 0,
            phoneNo: detailedDebitNote.phoneNo ?? "",
            faxNo: detailedDebitNote.faxNo ?? "",
            contactName: detailedDebitNote.contactName ?? "",
            mobileNo: detailedDebitNote.mobileNo ?? "",
            emailAdd: detailedDebitNote.emailAdd ?? "",
            moduleFrom: detailedDebitNote.moduleFrom ?? "",
            customerName: detailedDebitNote.customerName ?? "",
            apDebitNoteId: detailedDebitNote.apDebitNoteId ?? "",
            apDebitNoteNo: detailedDebitNote.apDebitNoteNo ?? "",
            editVersion: detailedDebitNote.editVersion ?? 0,
            salesOrderId: detailedDebitNote.salesOrderId ?? 0,
            salesOrderNo: detailedDebitNote.salesOrderNo ?? "",

            data_details:
              detailedDebitNote.data_details?.map((detail: IArDebitNoteDt) => ({
                debitNoteId: detail.debitNoteId?.toString() ?? "0",
                debitNoteNo: detail.debitNoteNo ?? "",
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
                salesOrderId: detail.salesOrderId ?? "",
                salesOrderNo: detail.salesOrderNo ?? "",
                supplyDate: detail.supplyDate
                  ? format(
                      parseDate(detail.supplyDate as string) || new Date(),
                      clientDateFormat
                    )
                  : "",
                supplierName: detail.supplierName ?? "",
                suppDebitNoteNo: detail.suppDebitNoteNo ?? "",
                apDebitNoteId: detail.apDebitNoteId ?? "",
                apDebitNoteNo: detail.apDebitNoteNo ?? "",
                editVersion: detail.editVersion ?? 0,
              })) || [],
          }

          //setDebitNote(updatedDebitNote as ArDebitNoteHdSchemaType)
          setDebitNote(transformToSchemaType(updatedDebitNote))
          form.reset(updatedDebitNote)
          form.trigger()

          // Show success message
          toast.success(`DebitNote ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch debitNote details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for debitNote")
    } finally {
      setIsLoadingDebitNote(false)
    }
  }

  // Determine mode and debitNote ID from URL
  const debitNoteNo = form.getValues("debitNoteNo")
  const isEdit = Boolean(debitNoteNo)

  // Compose title text
  const titleText = isEdit
    ? `DebitNote (Edit) - ${debitNoteNo}`
    : "DebitNote (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading debitNote form...
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
              placeholder="Search DebitNote No"
              className="h-8 text-sm"
              readOnly={
                !!debitNote?.debitNoteId && debitNote.debitNoteId !== "0"
              }
              disabled={
                !!debitNote?.debitNoteId && debitNote.debitNoteId !== "0"
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={isLoadingDebitNotes || isRefetchingDebitNotes}
            >
              {isLoadingDebitNotes || isRefetchingDebitNotes ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <ListFilter className="mr-1 h-4 w-4" />
              )}
              {isLoadingDebitNotes || isRefetchingDebitNotes
                ? "Loading..."
                : "List"}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveConfirm(true)}
              disabled={
                isSaving || saveMutation.isPending || updateMutation.isPending
              }
              className={isEdit ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {isSaving ||
              saveMutation.isPending ||
              updateMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              {isSaving || saveMutation.isPending || updateMutation.isPending
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update"
                  : "Save"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={!debitNote || debitNote.debitNoteId === "0"}
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              //disabled={!debitNote}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={!debitNote || debitNote.debitNoteId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !debitNote ||
                debitNote.debitNoteId === "0" ||
                deleteMutation.isPending
              }
            >
              {deleteMutation.isPending ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Trash2 className="mr-1 h-4 w-4" />
              )}
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <TabsContent value="main">
          <Main
            form={form}
            onSuccessAction={async () => {
              handleSaveDebitNote()
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
            refetchDebitNotes()
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
                  DebitNote List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing debitNotes from the list below. Use
                  search to filter records or create new debitNotes.
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoadingDebitNotes ||
          isRefetchingDebitNotes ||
          isSelectingDebitNote ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-gray-600">
                  {isSelectingDebitNote
                    ? "Loading debitNote details..."
                    : "Loading debitNotes..."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {isSelectingDebitNote
                    ? "Please wait while we fetch the complete debitNote data"
                    : "Please wait while we fetch the debitNote list"}
                </p>
              </div>
            </div>
          ) : (
            <DebitNoteTable
              data={debitNotesData || []}
              isLoading={false}
              onDebitNoteSelect={handleDebitNoteSelect}
              onRefresh={() => refetchDebitNotes()}
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
        onConfirm={handleSaveDebitNote}
        itemName={debitNote?.debitNoteNo || "New DebitNote"}
        operationType={
          debitNote?.debitNoteId && debitNote.debitNoteId !== "0"
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
        onConfirm={handleDebitNoteDelete}
        itemName={debitNote?.debitNoteNo}
        title="Delete DebitNote"
        description="This action cannot be undone. All debitNote details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleDebitNoteSearch(searchNo)}
        code={searchNo}
        typeLabel="DebitNote"
        showDetails={false}
        description={`Do you want to load DebitNote ${searchNo}?`}
        isLoading={isLoadingDebitNote}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleDebitNoteReset}
        itemName={debitNote?.debitNoteNo}
        title="Reset DebitNote"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneDebitNote}
        itemName={debitNote?.debitNoteNo}
        title="Clone DebitNote"
        description="This will create a copy as a new debitNote."
      />
    </div>
  )
}
