"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  IApCreditNoteDt,
  IApCreditNoteFilter,
  IApCreditNoteHd,
} from "@/interfaces"
import { IMandatoryFields, IVisibleFields } from "@/interfaces/setting"
import {
  ApCreditNoteDtSchemaType,
  ApCreditNoteHdSchemaType,
  apCreditNoteHdSchema,
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
import { ApCreditNote } from "@/lib/api-routes"
import { clientDateFormat, parseDate } from "@/lib/date-utils"
import { APTransactionId, ModuleId } from "@/lib/utils"
import { useDelete, usePersist } from "@/hooks/use-common"
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

import { defaultCreditNote } from "./components/creditNote-defaultvalues"
import CreditNoteTable from "./components/creditNote-table"
import History from "./components/history"
import Main from "./components/main-tab"
import Other from "./components/other"

export default function CreditNotePage() {
  const params = useParams()
  const companyId = params.companyId as string

  const moduleId = ModuleId.ap
  const transactionId = APTransactionId.creditNote

  const [showListDialog, setShowListDialog] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLoadConfirm, setShowLoadConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showCloneConfirm, setShowCloneConfirm] = useState(false)
  const [isLoadingCreditNote, setIsLoadingCreditNote] = useState(false)
  const [_isSelectingCreditNote, setIsSelectingCreditNote] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [creditNote, setCreditNote] = useState<ApCreditNoteHdSchemaType | null>(
    null
  )
  const [searchNo, setSearchNo] = useState("")
  const [activeTab, setActiveTab] = useState("main")

  const [filters, setFilters] = useState<IApCreditNoteFilter>({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    search: "",
    sortBy: "creditNoteNo",
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
  const form = useForm<ApCreditNoteHdSchemaType>({
    resolver: zodResolver(apCreditNoteHdSchema(required, visible)),
    defaultValues: creditNote
      ? {
          creditNoteId: creditNote.creditNoteId?.toString() ?? "0",
          creditNoteNo: creditNote.creditNoteNo ?? "",
          referenceNo: creditNote.referenceNo ?? "",
          trnDate: creditNote.trnDate ?? new Date(),
          accountDate: creditNote.accountDate ?? new Date(),
          dueDate: creditNote.dueDate ?? new Date(),
          deliveryDate: creditNote.deliveryDate ?? new Date(),
          gstClaimDate: creditNote.gstClaimDate ?? new Date(),
          supplierId: creditNote.supplierId ?? 0,
          currencyId: creditNote.currencyId ?? 0,
          exhRate: creditNote.exhRate ?? 0,
          ctyExhRate: creditNote.ctyExhRate ?? 0,
          creditTermId: creditNote.creditTermId ?? 0,
          bankId: creditNote.bankId ?? 0,
          invoiceId: creditNote.invoiceId ?? "0",
          invoiceNo: creditNote.invoiceNo ?? "",
          totAmt: creditNote.totAmt ?? 0,
          totLocalAmt: creditNote.totLocalAmt ?? 0,
          totCtyAmt: creditNote.totCtyAmt ?? 0,
          gstAmt: creditNote.gstAmt ?? 0,
          gstLocalAmt: creditNote.gstLocalAmt ?? 0,
          gstCtyAmt: creditNote.gstCtyAmt ?? 0,
          totAmtAftGst: creditNote.totAmtAftGst ?? 0,
          totLocalAmtAftGst: creditNote.totLocalAmtAftGst ?? 0,
          totCtyAmtAftGst: creditNote.totCtyAmtAftGst ?? 0,
          balAmt: creditNote.balAmt ?? 0,
          balLocalAmt: creditNote.balLocalAmt ?? 0,
          payAmt: creditNote.payAmt ?? 0,
          payLocalAmt: creditNote.payLocalAmt ?? 0,
          exGainLoss: creditNote.exGainLoss ?? 0,
          operationId: creditNote.operationId ?? 0,
          operationNo: creditNote.operationNo ?? "",
          remarks: creditNote.remarks ?? "",
          address1: creditNote.address1 ?? "",
          address2: creditNote.address2 ?? "",
          address3: creditNote.address3 ?? "",
          address4: creditNote.address4 ?? "",
          pinCode: creditNote.pinCode ?? "",
          countryId: creditNote.countryId ?? 0,
          phoneNo: creditNote.phoneNo ?? "",
          faxNo: creditNote.faxNo ?? "",
          contactName: creditNote.contactName ?? "",
          mobileNo: creditNote.mobileNo ?? "",
          emailAdd: creditNote.emailAdd ?? "",
          moduleFrom: creditNote.moduleFrom ?? "",
          suppCreditNoteNo: creditNote.suppCreditNoteNo ?? "",
          customerName: creditNote.customerName ?? "",
          addressId: creditNote.addressId ?? 0,
          contactId: creditNote.contactId ?? 0,
          arCreditNoteId: creditNote.arCreditNoteId ?? "",
          arCreditNoteNo: creditNote.arCreditNoteNo ?? "",
          editVersion: creditNote.editVersion ?? 0,
          purchaseOrderId: creditNote.purchaseOrderId ?? 0,
          purchaseOrderNo: creditNote.purchaseOrderNo ?? "",
          serviceTypeId: creditNote.serviceTypeId ?? 0,
          data_details:
            creditNote.data_details?.map((detail) => ({
              ...detail,
              creditNoteId: detail.creditNoteId?.toString() ?? "0",
              creditNoteNo: detail.creditNoteNo?.toString() ?? "",
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
              custCreditNoteNo: detail.custCreditNoteNo ?? "",
              arCreditNoteId: detail.arCreditNoteId ?? "",
              arCreditNoteNo: detail.arCreditNoteNo ?? "",
            })) || [],
        }
      : {
          ...defaultCreditNote,
        },
  })

  // Data fetching moved to CreditNoteTable component for better performance

  // Mutations
  const saveMutation = usePersist<ApCreditNoteHdSchemaType>(
    `${ApCreditNote.add}`
  )
  const updateMutation = usePersist<ApCreditNoteHdSchemaType>(
    `${ApCreditNote.add}`
  )
  const deleteMutation = useDelete(`${ApCreditNote.delete}`)

  // Remove the useGetCreditNoteById hook for selection
  // const { data: creditNoteByIdData, refetch: refetchCreditNoteById } = ...

  // Handle Save
  const handleSaveCreditNote = async () => {
    // Prevent double-submit
    if (isSaving || saveMutation.isPending || updateMutation.isPending) {
      return
    }

    setIsSaving(true)

    try {
      // Get form values and validate them
      const formValues = transformToSchemaType(
        form.getValues() as unknown as IApCreditNoteHd
      )

      // Validate the form data using the schema
      const validationResult = apCreditNoteHdSchema(
        required,
        visible
      ).safeParse(formValues)

      if (!validationResult.success) {
        console.error("Form validation failed:", validationResult.error)

        // Set field-level errors on the form so FormMessage components can display them
        validationResult.error.issues.forEach((error) => {
          const fieldPath = error.path.join(
            "."
          ) as keyof ApCreditNoteHdSchemaType
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
        Number(formValues.creditNoteId) === 0
          ? await saveMutation.mutateAsync(formValues)
          : await updateMutation.mutateAsync(formValues)

      if (response.result === 1) {
        const creditNoteData = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        // Transform API response back to form values
        if (creditNoteData) {
          const updatedSchemaType = transformToSchemaType(
            creditNoteData as unknown as IApCreditNoteHd
          )
          setIsSelectingCreditNote(true)
          setCreditNote(updatedSchemaType)
          form.reset(updatedSchemaType)
          form.trigger()
        }

        // Close the save confirmation dialog
        setShowSaveConfirm(false)

        // Check if this was a new creditNote or update
        const wasNewCreditNote = Number(formValues.creditNoteId) === 0

        if (wasNewCreditNote) {
          //toast.success(
          // `CreditNote ${creditNoteData?.creditNoteNo || ""} saved successfully`
          //)
        } else {
          //toast.success("CreditNote updated successfully")
        }

        // Data refresh handled by CreditNoteTable component
      } else {
        toast.error(response.message || "Failed to save creditNote")
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Network error while saving creditNote")
    } finally {
      setIsSaving(false)
      setIsSelectingCreditNote(false)
    }
  }

  // Handle Clone
  const handleCloneCreditNote = () => {
    if (creditNote) {
      // Create a proper clone with form values
      const clonedCreditNote: ApCreditNoteHdSchemaType = {
        ...creditNote,
        creditNoteId: "0",
        creditNoteNo: "",
        // Reset amounts for new creditNote
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
      setCreditNote(clonedCreditNote)
      form.reset(clonedCreditNote)
      toast.success("CreditNote cloned successfully")
    }
  }

  // Handle Delete
  const handleCreditNoteDelete = async () => {
    if (!creditNote) return

    try {
      const response = await deleteMutation.mutateAsync(
        creditNote.creditNoteId?.toString() ?? ""
      )
      if (response.result === 1) {
        setCreditNote(null)
        setSearchNo("") // Clear search input
        form.reset({
          ...defaultCreditNote,
          data_details: [],
        })
        //toast.success("CreditNote deleted successfully")
        // Data refresh handled by CreditNoteTable component
      } else {
        toast.error(response.message || "Failed to delete creditNote")
      }
    } catch {
      toast.error("Network error while deleting creditNote")
    }
  }

  // Handle Reset
  const handleCreditNoteReset = () => {
    setCreditNote(null)
    setSearchNo("") // Clear search input
    form.reset({
      ...defaultCreditNote,
      data_details: [],
    })
    toast.success("CreditNote reset successfully")
  }

  // Helper function to transform IApCreditNoteHd to ApCreditNoteHdSchemaType
  const transformToSchemaType = (
    apiCreditNote: IApCreditNoteHd
  ): ApCreditNoteHdSchemaType => {
    return {
      creditNoteId: apiCreditNote.creditNoteId?.toString() ?? "0",
      creditNoteNo: apiCreditNote.creditNoteNo ?? "",
      referenceNo: apiCreditNote.referenceNo ?? "",
      suppCreditNoteNo: apiCreditNote.suppCreditNoteNo ?? "",
      trnDate: apiCreditNote.trnDate
        ? format(
            parseDate(apiCreditNote.trnDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      accountDate: apiCreditNote.accountDate
        ? format(
            parseDate(apiCreditNote.accountDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      dueDate: apiCreditNote.dueDate
        ? format(
            parseDate(apiCreditNote.dueDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      deliveryDate: apiCreditNote.deliveryDate
        ? format(
            parseDate(apiCreditNote.deliveryDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      gstClaimDate: apiCreditNote.gstClaimDate
        ? format(
            parseDate(apiCreditNote.gstClaimDate as string) || new Date(),
            clientDateFormat
          )
        : clientDateFormat,
      supplierId: apiCreditNote.supplierId ?? 0,
      currencyId: apiCreditNote.currencyId ?? 0,
      exhRate: apiCreditNote.exhRate ?? 0,
      ctyExhRate: apiCreditNote.ctyExhRate ?? 0,
      creditTermId: apiCreditNote.creditTermId ?? 0,
      bankId: apiCreditNote.bankId ?? 0,
      invoiceId: apiCreditNote.invoiceId ?? "0",
      invoiceNo: apiCreditNote.invoiceNo ?? "",
      totAmt: apiCreditNote.totAmt ?? 0,
      totLocalAmt: apiCreditNote.totLocalAmt ?? 0,
      totCtyAmt: apiCreditNote.totCtyAmt ?? 0,
      gstAmt: apiCreditNote.gstAmt ?? 0,
      gstLocalAmt: apiCreditNote.gstLocalAmt ?? 0,
      gstCtyAmt: apiCreditNote.gstCtyAmt ?? 0,
      totAmtAftGst: apiCreditNote.totAmtAftGst ?? 0,
      totLocalAmtAftGst: apiCreditNote.totLocalAmtAftGst ?? 0,
      totCtyAmtAftGst: apiCreditNote.totCtyAmtAftGst ?? 0,
      balAmt: apiCreditNote.balAmt ?? 0,
      balLocalAmt: apiCreditNote.balLocalAmt ?? 0,
      payAmt: apiCreditNote.payAmt ?? 0,
      payLocalAmt: apiCreditNote.payLocalAmt ?? 0,
      exGainLoss: apiCreditNote.exGainLoss ?? 0,
      operationId: apiCreditNote.operationId ?? 0,
      operationNo: apiCreditNote.operationNo ?? "",
      remarks: apiCreditNote.remarks ?? "",
      addressId: apiCreditNote.addressId ?? 0, // Not available in IApCreditNoteHd
      contactId: apiCreditNote.contactId ?? 0, // Not available in IApCreditNoteHd
      address1: apiCreditNote.address1 ?? "",
      address2: apiCreditNote.address2 ?? "",
      address3: apiCreditNote.address3 ?? "",
      address4: apiCreditNote.address4 ?? "",
      pinCode: apiCreditNote.pinCode ?? "",
      countryId: apiCreditNote.countryId ?? 0,
      phoneNo: apiCreditNote.phoneNo ?? "",
      faxNo: apiCreditNote.faxNo ?? "",
      contactName: apiCreditNote.contactName ?? "",
      mobileNo: apiCreditNote.mobileNo ?? "",
      emailAdd: apiCreditNote.emailAdd ?? "",
      moduleFrom: apiCreditNote.moduleFrom ?? "",
      customerName: apiCreditNote.customerName ?? "",
      arCreditNoteId: apiCreditNote.arCreditNoteId ?? "",
      arCreditNoteNo: apiCreditNote.arCreditNoteNo ?? "",
      editVersion: apiCreditNote.editVersion ?? 0,
      purchaseOrderId: apiCreditNote.purchaseOrderId ?? 0,
      purchaseOrderNo: apiCreditNote.purchaseOrderNo ?? "",
      createBy: apiCreditNote.createBy ?? "",
      editBy: apiCreditNote.editBy ?? "",
      cancelBy: apiCreditNote.cancelBy ?? "",
      createDate: apiCreditNote.createDate
        ? format(
            parseDate(apiCreditNote.createDate as string) || new Date(),
            clientDateFormat
          )
        : "",

      editDate: apiCreditNote.editDate
        ? format(
            parseDate(apiCreditNote.editDate as unknown as string) ||
              new Date(),
            clientDateFormat
          )
        : "",
      cancelDate: apiCreditNote.cancelDate
        ? format(
            parseDate(apiCreditNote.cancelDate as unknown as string) ||
              new Date(),
            clientDateFormat
          )
        : "",
      cancelRemarks: apiCreditNote.cancelRemarks ?? "",
      serviceTypeId: apiCreditNote.serviceTypeId ?? 0,
      data_details:
        apiCreditNote.data_details?.map(
          (detail) =>
            ({
              ...detail,
              creditNoteId: detail.creditNoteId?.toString() ?? "0",
              creditNoteNo: detail.creditNoteNo ?? "",
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
              custCreditNoteNo: detail.custCreditNoteNo ?? "",
              arCreditNoteId: detail.arCreditNoteId ?? "",
              arCreditNoteNo: detail.arCreditNoteNo ?? "",
              editVersion: detail.editVersion ?? 0,
            }) as unknown as ApCreditNoteDtSchemaType
        ) || [],
    }
  }

  const handleCreditNoteSelect = async (
    selectedCreditNote: IApCreditNoteHd | undefined
  ) => {
    if (!selectedCreditNote) return

    setIsSelectingCreditNote(true)

    try {
      // Fetch creditNote details directly using selected creditNote's values
      const response = await getById(
        `${ApCreditNote.getByIdNo}/${selectedCreditNote.creditNoteId}/${selectedCreditNote.creditNoteNo}`
      )

      if (response?.result === 1) {
        const detailedCreditNote = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedCreditNote) {
          // Parse dates properly
          const updatedCreditNote = {
            ...detailedCreditNote,
            creditNoteId: detailedCreditNote.creditNoteId?.toString() ?? "0",
            creditNoteNo: detailedCreditNote.creditNoteNo ?? "",
            referenceNo: detailedCreditNote.referenceNo ?? "",
            suppCreditNoteNo: detailedCreditNote.suppCreditNoteNo ?? "",
            trnDate: detailedCreditNote.trnDate
              ? format(
                  parseDate(detailedCreditNote.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedCreditNote.accountDate
              ? format(
                  parseDate(detailedCreditNote.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedCreditNote.dueDate
              ? format(
                  parseDate(detailedCreditNote.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedCreditNote.deliveryDate
              ? format(
                  parseDate(detailedCreditNote.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedCreditNote.gstClaimDate
              ? format(
                  parseDate(detailedCreditNote.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedCreditNote.supplierId ?? 0,
            currencyId: detailedCreditNote.currencyId ?? 0,
            exhRate: detailedCreditNote.exhRate ?? 0,
            ctyExhRate: detailedCreditNote.ctyExhRate ?? 0,
            creditTermId: detailedCreditNote.creditTermId ?? 0,
            bankId: detailedCreditNote.bankId ?? 0,
            totAmt: detailedCreditNote.totAmt ?? 0,
            totLocalAmt: detailedCreditNote.totLocalAmt ?? 0,
            totCtyAmt: detailedCreditNote.totCtyAmt ?? 0,
            gstAmt: detailedCreditNote.gstAmt ?? 0,
            gstLocalAmt: detailedCreditNote.gstLocalAmt ?? 0,
            gstCtyAmt: detailedCreditNote.gstCtyAmt ?? 0,
            totAmtAftGst: detailedCreditNote.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedCreditNote.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedCreditNote.totCtyAmtAftGst ?? 0,
            balAmt: detailedCreditNote.balAmt ?? 0,
            balLocalAmt: detailedCreditNote.balLocalAmt ?? 0,
            payAmt: detailedCreditNote.payAmt ?? 0,
            payLocalAmt: detailedCreditNote.payLocalAmt ?? 0,
            exGainLoss: detailedCreditNote.exGainLoss ?? 0,
            operationId: detailedCreditNote.operationId ?? 0,
            operationNo: detailedCreditNote.operationNo ?? "",
            remarks: detailedCreditNote.remarks ?? "",
            addressId: detailedCreditNote.addressId ?? 0, // Not available in IApCreditNoteHd
            contactId: detailedCreditNote.contactId ?? 0, // Not available in IApCreditNoteHd
            address1: detailedCreditNote.address1 ?? "",
            address2: detailedCreditNote.address2 ?? "",
            address3: detailedCreditNote.address3 ?? "",
            address4: detailedCreditNote.address4 ?? "",
            pinCode: detailedCreditNote.pinCode ?? "",
            countryId: detailedCreditNote.countryId ?? 0,
            phoneNo: detailedCreditNote.phoneNo ?? "",
            faxNo: detailedCreditNote.faxNo ?? "",
            contactName: detailedCreditNote.contactName ?? "",
            mobileNo: detailedCreditNote.mobileNo ?? "",
            emailAdd: detailedCreditNote.emailAdd ?? "",
            moduleFrom: detailedCreditNote.moduleFrom ?? "",
            customerName: detailedCreditNote.customerName ?? "",
            arCreditNoteId: detailedCreditNote.arCreditNoteId ?? "",
            arCreditNoteNo: detailedCreditNote.arCreditNoteNo ?? "",
            editVersion: detailedCreditNote.editVersion ?? 0,
            purchaseOrderId: detailedCreditNote.purchaseOrderId ?? 0,
            purchaseOrderNo: detailedCreditNote.purchaseOrderNo ?? "",
            createBy: detailedCreditNote.createBy ?? "",
            createDate: detailedCreditNote.createDate ?? "",
            editBy: detailedCreditNote.editBy ?? "",
            editDate: detailedCreditNote.editDate ?? "",
            cancelBy: detailedCreditNote.cancelBy ?? "",
            cancelDate: detailedCreditNote.cancelDate ?? "",
            cancelRemarks: detailedCreditNote.cancelRemarks ?? "",
            serviceTypeId: detailedCreditNote.serviceTypeId ?? 0,
            data_details:
              detailedCreditNote.data_details?.map(
                (detail: IApCreditNoteDt) => ({
                  creditNoteId: detail.creditNoteId?.toString() ?? "0",
                  creditNoteNo: detail.creditNoteNo ?? "",
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
                  custCreditNoteNo: detail.custCreditNoteNo ?? "",
                  arCreditNoteId: detail.arCreditNoteId ?? "",
                  arCreditNoteNo: detail.arCreditNoteNo ?? "",
                  editVersion: detail.editVersion ?? 0,
                })
              ) || [],
          }

          //setCreditNote(updatedCreditNote as ApCreditNoteHdSchemaType)
          setCreditNote(transformToSchemaType(updatedCreditNote))
          form.reset(updatedCreditNote)
          form.trigger()

          // Close dialog only on success
          setShowListDialog(false)
          toast.success(
            `CreditNote ${selectedCreditNote.creditNoteNo} loaded successfully`
          )
        }
      } else {
        toast.error(response?.message || "Failed to fetch creditNote details")
        // Keep dialog open on failure so user can try again
      }
    } catch (error) {
      console.error("Error fetching creditNote details:", error)
      toast.error("Error loading creditNote. Please try again.")
      // Keep dialog open on error
    } finally {
      setIsSelectingCreditNote(false)
    }
  }

  // Remove direct refetchCreditNotes from handleFilterChange
  const handleFilterChange = (newFilters: IApCreditNoteFilter) => {
    setFilters(newFilters)
    // Data refresh handled by CreditNoteTable component
  }

  // Data refresh handled by CreditNoteTable component

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

  const handleCreditNoteSearch = async (value: string) => {
    if (!value) return

    setIsLoadingCreditNote(true)

    try {
      const response = await getById(`${ApCreditNote.getByIdNo}/0/${value}`)

      if (response?.result === 1) {
        const detailedCreditNote = Array.isArray(response.data)
          ? response.data[0]
          : response.data

        if (detailedCreditNote) {
          // Parse dates properly
          const updatedCreditNote = {
            ...detailedCreditNote,
            creditNoteId: detailedCreditNote.creditNoteId?.toString() ?? "0",
            creditNoteNo: detailedCreditNote.creditNoteNo ?? "",
            referenceNo: detailedCreditNote.referenceNo ?? "",
            suppCreditNoteNo: detailedCreditNote.suppCreditNoteNo ?? "",
            trnDate: detailedCreditNote.trnDate
              ? format(
                  parseDate(detailedCreditNote.trnDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            accountDate: detailedCreditNote.accountDate
              ? format(
                  parseDate(detailedCreditNote.accountDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            dueDate: detailedCreditNote.dueDate
              ? format(
                  parseDate(detailedCreditNote.dueDate as string) || new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            deliveryDate: detailedCreditNote.deliveryDate
              ? format(
                  parseDate(detailedCreditNote.deliveryDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,
            gstClaimDate: detailedCreditNote.gstClaimDate
              ? format(
                  parseDate(detailedCreditNote.gstClaimDate as string) ||
                    new Date(),
                  clientDateFormat
                )
              : clientDateFormat,

            supplierId: detailedCreditNote.supplierId ?? 0,
            currencyId: detailedCreditNote.currencyId ?? 0,
            exhRate: detailedCreditNote.exhRate ?? 0,
            ctyExhRate: detailedCreditNote.ctyExhRate ?? 0,
            creditTermId: detailedCreditNote.creditTermId ?? 0,
            bankId: detailedCreditNote.bankId ?? 0,
            totAmt: detailedCreditNote.totAmt ?? 0,
            totLocalAmt: detailedCreditNote.totLocalAmt ?? 0,
            totCtyAmt: detailedCreditNote.totCtyAmt ?? 0,
            gstAmt: detailedCreditNote.gstAmt ?? 0,
            gstLocalAmt: detailedCreditNote.gstLocalAmt ?? 0,
            gstCtyAmt: detailedCreditNote.gstCtyAmt ?? 0,
            totAmtAftGst: detailedCreditNote.totAmtAftGst ?? 0,
            totLocalAmtAftGst: detailedCreditNote.totLocalAmtAftGst ?? 0,
            totCtyAmtAftGst: detailedCreditNote.totCtyAmtAftGst ?? 0,
            balAmt: detailedCreditNote.balAmt ?? 0,
            balLocalAmt: detailedCreditNote.balLocalAmt ?? 0,
            payAmt: detailedCreditNote.payAmt ?? 0,
            payLocalAmt: detailedCreditNote.payLocalAmt ?? 0,
            exGainLoss: detailedCreditNote.exGainLoss ?? 0,
            operationId: detailedCreditNote.operationId ?? 0,
            operationNo: detailedCreditNote.operationNo ?? "",
            remarks: detailedCreditNote.remarks ?? "",
            addressId: detailedCreditNote.addressId ?? 0, // Not available in IApCreditNoteHd
            contactId: detailedCreditNote.contactId ?? 0, // Not available in IApCreditNoteHd
            address1: detailedCreditNote.address1 ?? "",
            address2: detailedCreditNote.address2 ?? "",
            address3: detailedCreditNote.address3 ?? "",
            address4: detailedCreditNote.address4 ?? "",
            pinCode: detailedCreditNote.pinCode ?? "",
            countryId: detailedCreditNote.countryId ?? 0,
            phoneNo: detailedCreditNote.phoneNo ?? "",
            faxNo: detailedCreditNote.faxNo ?? "",
            contactName: detailedCreditNote.contactName ?? "",
            mobileNo: detailedCreditNote.mobileNo ?? "",
            emailAdd: detailedCreditNote.emailAdd ?? "",
            moduleFrom: detailedCreditNote.moduleFrom ?? "",
            customerName: detailedCreditNote.customerName ?? "",
            arCreditNoteId: detailedCreditNote.arCreditNoteId ?? "",
            arCreditNoteNo: detailedCreditNote.arCreditNoteNo ?? "",
            editVersion: detailedCreditNote.editVersion ?? 0,
            purchaseOrderId: detailedCreditNote.purchaseOrderId ?? 0,
            purchaseOrderNo: detailedCreditNote.purchaseOrderNo ?? "",
            serviceTypeId: detailedCreditNote.serviceTypeId ?? 0,
            data_details:
              detailedCreditNote.data_details?.map(
                (detail: IApCreditNoteDt) => ({
                  creditNoteId: detail.creditNoteId?.toString() ?? "0",
                  creditNoteNo: detail.creditNoteNo ?? "",
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
                  custCreditNoteNo: detail.custCreditNoteNo ?? "",
                  arCreditNoteId: detail.arCreditNoteId ?? "",
                  arCreditNoteNo: detail.arCreditNoteNo ?? "",
                  editVersion: detail.editVersion ?? 0,
                })
              ) || [],
          }

          //setCreditNote(updatedCreditNote as ApCreditNoteHdSchemaType)
          setCreditNote(transformToSchemaType(updatedCreditNote))
          form.reset(updatedCreditNote)
          form.trigger()

          // Show success message
          toast.success(`CreditNote ${value} loaded successfully`)

          // Close the load confirmation dialog on success
          setShowLoadConfirm(false)
        }
      } else {
        toast.error(
          response?.message || "Failed to fetch creditNote details (direct)"
        )
      }
    } catch {
      toast.error("Error searching for creditNote")
    } finally {
      setIsLoadingCreditNote(false)
    }
  }

  // Determine mode and creditNote ID from URL
  const creditNoteNo = form.getValues("creditNoteNo")
  const isEdit = Boolean(creditNoteNo)

  // Compose title text
  const titleText = isEdit
    ? `CreditNote (Edit) - ${creditNoteNo}`
    : "CreditNote (New)"

  // Show loading spinner while essential data is loading
  if (!visible || !required) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600">
            Loading creditNote form...
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
              placeholder="Search CreditNote No"
              className="h-8 text-sm"
              readOnly={
                !!creditNote?.creditNoteId && creditNote.creditNoteId !== "0"
              }
              disabled={
                !!creditNote?.creditNoteId && creditNote.creditNoteId !== "0"
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowListDialog(true)}
              disabled={false}
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
              disabled={!creditNote || creditNote.creditNoteId === "0"}
            >
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              //disabled={!creditNote}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCloneConfirm(true)}
              disabled={!creditNote || creditNote.creditNoteId === "0"}
            >
              <Copy className="mr-1 h-4 w-4" />
              Clone
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={
                !creditNote ||
                creditNote.creditNoteId === "0" ||
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
              handleSaveCreditNote()
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
            // Data refresh handled by CreditNoteTable component
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
                  CreditNote List
                </DialogTitle>
                <p className="text-muted-foreground text-sm">
                  Manage and select existing creditNotes from the list below.
                  Use search to filter records or create new creditNotes.
                </p>
              </div>
            </div>
          </DialogHeader>

          <CreditNoteTable
            onCreditNoteSelect={handleCreditNoteSelect}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </DialogContent>
      </Dialog>

      {/* Save Confirmation */}
      <SaveConfirmation
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={handleSaveCreditNote}
        itemName={creditNote?.creditNoteNo || "New CreditNote"}
        operationType={
          creditNote?.creditNoteId && creditNote.creditNoteId !== "0"
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
        onConfirm={handleCreditNoteDelete}
        itemName={creditNote?.creditNoteNo}
        title="Delete CreditNote"
        description="This action cannot be undone. All creditNote details will be permanently deleted."
        isDeleting={deleteMutation.isPending}
      />

      {/* Load Confirmation */}
      <LoadConfirmation
        open={showLoadConfirm}
        onOpenChange={setShowLoadConfirm}
        onLoad={() => handleCreditNoteSearch(searchNo)}
        code={searchNo}
        typeLabel="CreditNote"
        showDetails={false}
        description={`Do you want to load CreditNote ${searchNo}?`}
        isLoading={isLoadingCreditNote}
      />

      {/* Reset Confirmation */}
      <ResetConfirmation
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        onConfirm={handleCreditNoteReset}
        itemName={creditNote?.creditNoteNo}
        title="Reset CreditNote"
        description="This will clear all unsaved changes."
      />

      {/* Clone Confirmation */}
      <CloneConfirmation
        open={showCloneConfirm}
        onOpenChange={setShowCloneConfirm}
        onConfirm={handleCloneCreditNote}
        itemName={creditNote?.creditNoteNo}
        title="Clone CreditNote"
        description="This will create a copy as a new creditNote."
      />
    </div>
  )
}
