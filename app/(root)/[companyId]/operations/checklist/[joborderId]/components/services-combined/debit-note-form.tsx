"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { calculateDebitNoteDetailAmounts } from "@/helpers/debit-note-calculations"
import { IDebitNoteDt, IDebitNoteHd } from "@/interfaces/checklist"
import { IChargeLookup, IGstLookup } from "@/interfaces/lookup"
import { DebitNoteDtSchemaType, debitNoteDtSchema } from "@/schemas/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"

import { getData } from "@/lib/api-client"
import { BasicSetting } from "@/lib/api-routes"
import { parseDate } from "@/lib/date-utils"
import { useChartOfAccountLookup } from "@/hooks/use-lookup"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  ChargeAutocomplete,
  ChartOfAccountAutocomplete,
  GSTAutocomplete,
} from "@/components/autocomplete"
import CustomNumberInput from "@/components/custom/custom-number-input"
import CustomSwitch from "@/components/custom/custom-switch"
import CustomTextArea from "@/components/custom/custom-textarea"

interface DebitNoteFormProps {
  debitNoteHd?: IDebitNoteHd
  initialData?: IDebitNoteDt
  submitAction: (data: DebitNoteDtSchemaType) => void
  onCancelAction?: () => void
  isSubmitting?: boolean
  isConfirmed?: boolean
  taskId: number
  exchangeRate?: number // Add exchange rate prop
  companyId?: number
  onChargeChange?: (chargeName: string) => void // Add callback for charge name changes
  shouldReset?: boolean // Add prop to trigger form reset
  summaryTotals?: {
    totalAmount: number
    vatAmount: number
    totalAfterVat: number
  } // Summary totals from table
  currencyCode?: string // Currency code for remarks update
}

export default function DebitNoteForm({
  debitNoteHd,
  initialData,
  submitAction,
  onCancelAction,
  isSubmitting = false,
  isConfirmed,
  taskId,
  exchangeRate = 1, // Default to 1 if not provided
  companyId,
  onChargeChange,
  shouldReset = false,
  summaryTotals,
  currencyCode,
}: DebitNoteFormProps) {
  const { decimals } = useAuthStore()
  const amtDec = decimals[0]?.amtDec || 2
  const locAmtDec = decimals[0]?.locAmtDec || 2
  const { isLoading: isChartOfAccountLoading } = useChartOfAccountLookup(
    Number(companyId)
  )

  // Refs to store original values on focus for comparison on change
  const originalQtyRef = useRef<number>(0)
  const originalUnitPriceRef = useRef<number>(0)
  const originalTotLocalAmtRef = useRef<number>(0)

  // State for confirmation dialog when unitPrice > 0 and user enters totLocalAmt
  // or when totLocalAmt > 0 and user enters unitPrice
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingTotLocalAmt, setPendingTotLocalAmt] = useState<number>(0)
  const [pendingUnitPrice, setPendingUnitPrice] = useState<number>(0)
  const [dialogType, setDialogType] = useState<
    "replaceUnitPrice" | "replaceLocalAmt"
  >("replaceUnitPrice")

  const defaultValues = useMemo(
    () => ({
      debitNoteId: initialData?.debitNoteId ?? debitNoteHd?.debitNoteId,
      debitNoteNo: debitNoteHd?.debitNoteNo,
      itemNo: 0,
      taskId: taskId,
      chargeId: 0,
      glId: debitNoteHd?.glId ?? 0,
      qty: 0,
      unitPrice: 0,
      totAmt: 0,
      gstId: 0,
      gstPercentage: 0,
      gstAmt: 0,
      totAftGstAmt: 0,
      remarks: "",
      editVersion: 0,
      totLocalAmt: 0,
      isServiceCharge: false,
      serviceCharge: 0,
    }),
    [
      initialData?.debitNoteId,
      debitNoteHd?.debitNoteId,
      debitNoteHd?.debitNoteNo,
      taskId,
      debitNoteHd?.glId,
    ]
  )

  const form = useForm<DebitNoteDtSchemaType>({
    resolver: zodResolver(debitNoteDtSchema),
    mode: "onChange", // Validate on blur to show errors after user interaction
    defaultValues: initialData
      ? {
          debitNoteId:
            initialData?.debitNoteId ?? debitNoteHd?.debitNoteId ?? 0,
          debitNoteNo:
            initialData?.debitNoteNo ?? debitNoteHd?.debitNoteNo ?? "",
          itemNo: initialData?.itemNo ?? 0,
          taskId: taskId,
          chargeId: initialData?.chargeId ?? 0,
          glId: initialData?.glId ?? 0,
          qty: initialData?.qty ?? 0,
          unitPrice: initialData?.unitPrice ?? 0,
          totAmt: initialData?.totAmt ?? 0,
          gstId: initialData?.gstId ?? 0,
          gstPercentage: initialData?.gstPercentage ?? 0,
          gstAmt: initialData?.gstAmt ?? 0,
          totAftGstAmt: initialData?.totAftGstAmt ?? 0,
          remarks: initialData?.remarks ?? "",
          editVersion: initialData?.editVersion ?? 0,
          totLocalAmt: initialData?.totLocalAmt ?? 0,
          isServiceCharge: initialData?.isServiceCharge ?? false,
          serviceCharge: initialData?.serviceCharge ?? 0,
        }
      : {
          ...defaultValues,
        },
  })

  // Watch form values
  const watchedValues = form.watch()

  // Calculation functions using helper functions
  const calculateTotalAmount = (qty: number, unitPrice: number): number => {
    return calculateDebitNoteDetailAmounts(qty, unitPrice, 0, { amtDec })
      .totalAmount
  }

  const calculateGSTAmount = (
    totalAmount: number,
    gstPercentage: number
  ): number => {
    return calculateDebitNoteDetailAmounts(1, totalAmount, gstPercentage, {
      amtDec,
    }).vatAmount
  }

  const calculateTotalAfterGST = (
    totalAmount: number,
    gstAmount: number
  ): number => {
    return totalAmount + gstAmount
  }

  // Helper function to recalculate VAT and total after VAT
  const recalculateVATAndTotal = (totalAmount: number) => {
    const gstPercentage = form.getValues("gstPercentage")
    if (gstPercentage > 0) {
      const gstAmount = calculateGSTAmount(totalAmount, gstPercentage)
      form.setValue("gstAmt", gstAmount)
      form.setValue(
        "totAftGstAmt",
        calculateTotalAfterGST(totalAmount, gstAmount)
      )
    } else {
      form.setValue("gstAmt", 0)
      form.setValue("totAftGstAmt", totalAmount)
    }
  }

  // Handle quantity focus - capture original value
  const handleQtyFocus = () => {
    originalQtyRef.current = form.getValues("qty") || 0
  }

  // Handle quantity change
  const handleQtyChange = (value: number) => {
    const qty = value || 0
    const originalQty = originalQtyRef.current

    // Only recalculate if value is different from original
    if (qty === originalQty) {
      return
    }

    const unitPrice = form.getValues("unitPrice") || 0
    const totLocalAmt = form.getValues("totLocalAmt") || 0

    // 1. If unitPrice=0 & amtLocal=0, skip calculation
    if (unitPrice === 0 && totLocalAmt === 0) {
      return
    }

    // 2. If unitPrice=0 & amtLocal>0, calculation needed
    if (unitPrice === 0 && totLocalAmt > 0 && exchangeRate > 0) {
      const qtyValue = qty > 0 ? qty : 1
      const calculatedTotal = (qtyValue * totLocalAmt) / exchangeRate
      form.setValue("totAmt", calculatedTotal)
      recalculateVATAndTotal(calculatedTotal)
      return
    }

    // 3. If unitPrice>0 & amtLocal=0, calculation needed
    if (unitPrice > 0 && totLocalAmt === 0 && qty > 0) {
      const calculatedTotal = calculateTotalAmount(qty, unitPrice)
      form.setValue("totAmt", calculatedTotal)
      recalculateVATAndTotal(calculatedTotal)
    }
  }

  // Handle unit price focus - capture original value
  const handleUnitPriceFocus = () => {
    originalUnitPriceRef.current = form.getValues("unitPrice") || 0
  }

  // Handle unit price change
  const handleUnitPriceChange = (value: number) => {
    const unitPrice = value || 0
    const originalUnitPrice = originalUnitPriceRef.current

    // Only recalculate if value is different from original
    if (unitPrice === originalUnitPrice) {
      return
    }

    const qty = form.getValues("qty") || 0
    const totLocalAmt = form.getValues("totLocalAmt") || 0

    // If totLocalAmt>0 and user typing the unitPrice, show confirmation dialog
    if (unitPrice > 0 && totLocalAmt > 0) {
      setPendingUnitPrice(unitPrice)
      setDialogType("replaceLocalAmt")
      setShowConfirmDialog(true)
      return
    }

    // Only calculate if totLocalAmt is 0 or not set (use qty * unitPrice method)
    if (qty > 0 && unitPrice > 0 && (!totLocalAmt || totLocalAmt === 0)) {
      const calculatedTotal = calculateTotalAmount(qty, unitPrice)
      form.setValue("totAmt", calculatedTotal)
      recalculateVATAndTotal(calculatedTotal)
    }
  }

  // Handle unit price blur - same logic as onChange
  const handleUnitPriceBlur = () => {
    const unitPrice = form.getValues("unitPrice") || 0
    const originalUnitPrice = originalUnitPriceRef.current

    // Only recalculate if value is different from original
    if (unitPrice === originalUnitPrice) {
      return
    }

    const qty = form.getValues("qty") || 0
    const totLocalAmt = form.getValues("totLocalAmt") || 0

    // If totLocalAmt>0 and user typing the unitPrice, show confirmation dialog
    if (unitPrice > 0 && totLocalAmt > 0) {
      setPendingUnitPrice(unitPrice)
      setDialogType("replaceLocalAmt")
      setShowConfirmDialog(true)
      return
    }

    // Only calculate if totLocalAmt is 0 or not set (use qty * unitPrice method)
    if (qty > 0 && unitPrice > 0 && (!totLocalAmt || totLocalAmt === 0)) {
      const calculatedTotal = calculateTotalAmount(qty, unitPrice)
      form.setValue("totAmt", calculatedTotal)
      recalculateVATAndTotal(calculatedTotal)
    }
  }

  // Handle local amount focus - capture original value
  const handleTotLocalAmtFocus = () => {
    originalTotLocalAmtRef.current = form.getValues("totLocalAmt") || 0
  }

  // Handle local amount change
  const handleTotLocalAmtChange = (value: number) => {
    const totLocalAmt = value || 0
    const originalTotLocalAmt = originalTotLocalAmtRef.current

    // Only recalculate if value is different from original
    if (totLocalAmt === originalTotLocalAmt) {
      return
    }

    const unitPrice = form.getValues("unitPrice") || 0

    // 4. If unitPrice>0 and user typing the amtLocalAmount, show confirmation dialog
    if (totLocalAmt > 0 && unitPrice > 0) {
      setPendingTotLocalAmt(totLocalAmt)
      setDialogType("replaceUnitPrice")
      setShowConfirmDialog(true)
      return
    }

    // Proceed with calculation if no conflict
    if (totLocalAmt > 0 && exchangeRate > 0) {
      // Calculate: (qty * totLocalAmt) / exhRate = totAmt
      const qty = form.getValues("qty") || 0
      const qtyValue = qty > 0 ? qty : 1 // Default to 1 if qty is 0
      const calculatedTotal = (qtyValue * totLocalAmt) / exchangeRate
      form.setValue("totAmt", calculatedTotal)

      // Set unitPrice to 0 when using totLocalAmt calculation
      form.setValue("unitPrice", 0)

      recalculateVATAndTotal(calculatedTotal)

      // Update remarks with currency code and amount
      if (currencyCode) {
        const currentRemarks = form.getValues("remarks") || ""
        // Format the amount with 2 decimal places
        const formattedAmount = totLocalAmt.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        const currencyRemark = `${currencyCode} ( ${formattedAmount} )`

        // Remove any existing currency remark pattern
        const currencyPattern = new RegExp(
          `${currencyCode}\\s*\\([^)]+\\)`,
          "g"
        )
        const cleanedRemarks = currentRemarks
          .replace(currencyPattern, "")
          .trim()

        // Add the new currency remark at the end
        form.setValue(
          "remarks",
          cleanedRemarks
            ? `${cleanedRemarks}\n${currencyRemark}`
            : currencyRemark
        )
      }
    } else if (totLocalAmt === 0 && currencyCode) {
      // Remove currency remark when totLocalAmt is cleared
      const currentRemarks = form.getValues("remarks") || ""
      const currencyPattern = new RegExp(`${currencyCode}\\s*\\([^)]+\\)`, "g")
      const cleanedRemarks = currentRemarks.replace(currencyPattern, "").trim()
      form.setValue("remarks", cleanedRemarks)
    }
  }

  // Handle local amount blur - same logic as onChange
  const handleTotLocalAmtBlur = () => {
    const totLocalAmt = form.getValues("totLocalAmt") || 0
    const originalTotLocalAmt = originalTotLocalAmtRef.current

    // Only recalculate if value is different from original
    if (totLocalAmt === originalTotLocalAmt) {
      return
    }

    const unitPrice = form.getValues("unitPrice") || 0

    // 4. If unitPrice>0 and user typing the amtLocalAmount, show confirmation dialog
    if (totLocalAmt > 0 && unitPrice > 0) {
      setPendingTotLocalAmt(totLocalAmt)
      setDialogType("replaceUnitPrice")
      setShowConfirmDialog(true)
      return
    }

    // Proceed with calculation if no conflict
    if (totLocalAmt > 0 && exchangeRate > 0) {
      // Calculate: (qty * totLocalAmt) / exhRate = totAmt
      const qty = form.getValues("qty") || 0
      const qtyValue = qty > 0 ? qty : 1
      const calculatedTotal = (qtyValue * totLocalAmt) / exchangeRate
      form.setValue("totAmt", calculatedTotal)
      form.setValue("unitPrice", 0)
      recalculateVATAndTotal(calculatedTotal)

      // Update remarks with currency code and amount
      if (currencyCode) {
        const currentRemarks = form.getValues("remarks") || ""
        const formattedAmount = totLocalAmt.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        const currencyRemark = `${currencyCode} ( ${formattedAmount} )`
        const currencyPattern = new RegExp(
          `${currencyCode}\\s*\\([^)]+\\)`,
          "g"
        )
        const cleanedRemarks = currentRemarks
          .replace(currencyPattern, "")
          .trim()
        form.setValue(
          "remarks",
          cleanedRemarks
            ? `${cleanedRemarks}\n${currencyRemark}`
            : currencyRemark
        )
      }
    }
  }

  // Handle confirmation dialog - Yes
  const handleConfirmReplace = () => {
    setShowConfirmDialog(false)

    if (dialogType === "replaceUnitPrice") {
      // Replace Unit Price with Local Amount
      const totLocalAmt = pendingTotLocalAmt

      if (totLocalAmt > 0 && exchangeRate > 0) {
        // Set unitPrice to 0
        form.setValue("unitPrice", 0)

        // Calculate: (qty * totLocalAmt) / exhRate = totAmt
        const qty = form.getValues("qty") || 0
        const qtyValue = qty > 0 ? qty : 1
        const calculatedTotal = (qtyValue * totLocalAmt) / exchangeRate
        form.setValue("totAmt", calculatedTotal)

        recalculateVATAndTotal(calculatedTotal)

        // Update remarks with currency code and amount
        if (currencyCode) {
          const currentRemarks = form.getValues("remarks") || ""
          const formattedAmount = totLocalAmt.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          const currencyRemark = `${currencyCode} ( ${formattedAmount} )`
          const currencyPattern = new RegExp(
            `${currencyCode}\\s*\\([^)]+\\)`,
            "g"
          )
          const cleanedRemarks = currentRemarks
            .replace(currencyPattern, "")
            .trim()
          form.setValue(
            "remarks",
            cleanedRemarks
              ? `${cleanedRemarks}\n${currencyRemark}`
              : currencyRemark
          )
        }
      }

      setPendingTotLocalAmt(0)
    } else if (dialogType === "replaceLocalAmt") {
      // Replace Local Amount with Unit Price
      const unitPrice = pendingUnitPrice
      const qty = form.getValues("qty") || 0

      if (qty > 0 && unitPrice > 0) {
        // Set totLocalAmt to 0
        form.setValue("totLocalAmt", 0)

        // Calculate: qty * unitPrice = totAmt
        const calculatedTotal = calculateTotalAmount(qty, unitPrice)
        form.setValue("totAmt", calculatedTotal)
        recalculateVATAndTotal(calculatedTotal)

        // Remove currency remark if exists
        if (currencyCode) {
          const currentRemarks = form.getValues("remarks") || ""
          const currencyPattern = new RegExp(
            `${currencyCode}\\s*\\([^)]+\\)`,
            "g"
          )
          const cleanedRemarks = currentRemarks
            .replace(currencyPattern, "")
            .trim()
          form.setValue("remarks", cleanedRemarks)
        }
      }

      setPendingUnitPrice(0)
    }
  }

  // Handle confirmation dialog - No
  const handleCancelReplace = () => {
    setShowConfirmDialog(false)

    if (dialogType === "replaceUnitPrice") {
      // Revert totLocalAmt to original value
      form.setValue("totLocalAmt", originalTotLocalAmtRef.current)
      setPendingTotLocalAmt(0)
    } else if (dialogType === "replaceLocalAmt") {
      // Revert unitPrice to original value
      form.setValue("unitPrice", originalUnitPriceRef.current)
      setPendingUnitPrice(0)
    }
  }

  // Effect for service charge switch changes
  useEffect(() => {
    if (!watchedValues.isServiceCharge) {
      form.setValue("serviceCharge", 0)
    }
  }, [form, watchedValues.isServiceCharge])

  // Effect for charge autocomplete changes (to update GL ID)
  const handleChargeChange = (selectedCharge: IChargeLookup | null) => {
    if (selectedCharge) {
      form.setValue("chargeId", selectedCharge.chargeId)
      // Automatically set the GL ID from the selected charge
      form.setValue("glId", selectedCharge.glId)

      // Add charge name to remarks when charge changes
      const currentRemarks = form.getValues("remarks") || ""
      const newRemarks = currentRemarks
        ? `${currentRemarks}\n${selectedCharge.chargeName}`
        : selectedCharge.chargeName
      form.setValue("remarks", newRemarks)

      // Notify parent component of charge name change
      onChargeChange?.(selectedCharge.chargeName)
    } else {
      // Clear related data when charge is cleared
      form.setValue("chargeId", 0)
      form.setValue("glId", 0)

      // Notify parent component that charge is cleared
      onChargeChange?.("")
    }
  }

  // Effect for VAT autocomplete changes (to update VAT percentage)
  const handleGSTChange = async (selectedGst: IGstLookup | null) => {
    if (selectedGst) {
      form.setValue("gstId", selectedGst.gstId)

      // Get GST percentage from API if debit note header date is available
      const accountDate = debitNoteHd?.debitNoteDate
      if (accountDate && selectedGst.gstId) {
        try {
          // Validate and parse the date
          const parsedDate = parseDate(accountDate.toString()) || new Date()
          const dt = format(parsedDate, "yyyy-MM-dd")

          const res = await getData(
            `${BasicSetting.getGstPercentage}/${selectedGst.gstId}/${dt}`
          )
          // Update the GST percentage for this specific row
          const gstPercentage = res?.data || 0
          form.setValue("gstPercentage", gstPercentage)

          // Recalculate VAT amount and total after VAT
          const totAmt = form.getValues("totAmt")
          if (totAmt > 0) {
            recalculateVATAndTotal(totAmt)
          }
        } catch (error) {
          console.error("Error fetching GST percentage:", error)
          // Fallback to the GST percentage from the lookup
          form.setValue("gstPercentage", selectedGst.gstPercentage || 0)
        }
      } else {
        // Use the GST percentage from the lookup if no date available
        form.setValue("gstPercentage", selectedGst.gstPercentage || 0)

        // Recalculate VAT amount and total after VAT
        const totAmt = form.getValues("totAmt")
        if (totAmt > 0) {
          recalculateVATAndTotal(totAmt)
        }
      }
    }
  }

  useEffect(() => {
    form.reset(
      initialData
        ? {
            debitNoteId:
              initialData?.debitNoteId ?? debitNoteHd?.debitNoteId ?? 0,
            debitNoteNo:
              initialData?.debitNoteNo ?? debitNoteHd?.debitNoteNo ?? "",
            itemNo: initialData?.itemNo ?? 0,
            taskId: taskId,
            chargeId: initialData?.chargeId ?? 0,
            glId: initialData?.glId ?? 0,
            qty: initialData?.qty ?? 0,
            unitPrice: initialData?.unitPrice ?? 0,
            totAmt: initialData?.totAmt ?? 0,
            gstId: initialData?.gstId ?? 0,
            gstPercentage: initialData?.gstPercentage ?? 0,
            gstAmt: initialData?.gstAmt ?? 0,
            totAftGstAmt: initialData?.totAftGstAmt ?? 0,
            remarks: initialData?.remarks ?? "",
            editVersion: initialData?.editVersion ?? 0,
            totLocalAmt: initialData?.totLocalAmt ?? 0,
            isServiceCharge: initialData?.isServiceCharge ?? false,
            serviceCharge: initialData?.serviceCharge ?? 0,
          }
        : {
            ...defaultValues,
          }
    )
  }, [
    initialData,
    form,
    taskId,
    isChartOfAccountLoading,
    debitNoteHd?.debitNoteId,
    debitNoteHd?.debitNoteNo,
    shouldReset,
    defaultValues,
    onChargeChange,
  ])

  // Effect to reset form when shouldReset changes
  useEffect(() => {
    if (shouldReset) {
      form.reset({
        ...defaultValues,
      })
      // Reset refs
      originalQtyRef.current = 0
      originalUnitPriceRef.current = 0
      originalTotLocalAmtRef.current = 0
      // Reset dialog state
      setShowConfirmDialog(false)
      setPendingTotLocalAmt(0)
      setPendingUnitPrice(0)
      setDialogType("replaceUnitPrice")
      // Notify parent that charge is cleared
      onChargeChange?.("")
    }
  }, [shouldReset, form, defaultValues, onChargeChange])

  const onSubmit = (data: DebitNoteDtSchemaType) => {
    submitAction(data)
  }

  const handleCancel = () => {
    // Reset form to default values
    form.reset({
      ...defaultValues,
    })
    // Reset refs
    originalQtyRef.current = 0
    originalUnitPriceRef.current = 0
    originalTotLocalAmtRef.current = 0
    // Reset dialog state
    setShowConfirmDialog(false)
    setPendingTotLocalAmt(0)
    setPendingUnitPrice(0)
    setDialogType("replaceUnitPrice")
    // Notify parent that charge is cleared
    onChargeChange?.("")
    // Call the onCancelAction callback if provided
    onCancelAction?.()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-12 rounded-md p-1"
      >
        {/* Left Section: Form Fields */}
        <div className="col-span-10 grid grid-cols-10 gap-1 gap-y-1">
          <div className="col-span-2">
            <ChargeAutocomplete
              form={form}
              name="chargeId"
              label="Charge Name"
              taskId={taskId}
              isRequired={true}
              isDisabled={isConfirmed}
              onChangeEvent={handleChargeChange}
            />
          </div>

          <div className="col-span-1">
            <ChartOfAccountAutocomplete
              form={form}
              name="glId"
              label="Account"
              isDisabled={isConfirmed}
              isRequired={true}
              companyId={companyId}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="qty"
              label="Qty"
              round={0}
              isDisabled={isConfirmed}
              onFocusEvent={handleQtyFocus}
              onChangeEvent={handleQtyChange}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="unitPrice"
              label="Unit Price"
              round={amtDec}
              isDisabled={isConfirmed}
              onFocusEvent={handleUnitPriceFocus}
              onChangeEvent={handleUnitPriceChange}
              onBlurEvent={handleUnitPriceBlur}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="totLocalAmt"
              label="Amt Local"
              round={locAmtDec}
              isDisabled={isConfirmed}
              onFocusEvent={handleTotLocalAmtFocus}
              onChangeEvent={handleTotLocalAmtChange}
              onBlurEvent={handleTotLocalAmtBlur}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="totAmt"
              label="Total Amt"
              round={amtDec}
              isDisabled={isConfirmed}
            />
          </div>

          {/* Second Row: Vat, Vat %, Vat Amt, Tot Aft Vat, Is Sr Chg?, Service Chg, Remarks */}
          <div className="col-span-1">
            <GSTAutocomplete
              form={form}
              name="gstId"
              label="Vat"
              isDisabled={isConfirmed}
              onChangeEvent={handleGSTChange}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="gstPercentage"
              label="Vat %"
              round={amtDec}
              isDisabled={true}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="gstAmt"
              label="Vat Amt"
              round={amtDec}
              isDisabled={isConfirmed}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="totAftGstAmt"
              label="Tot Aft Vat"
              round={amtDec}
              isDisabled={true}
            />
          </div>

          <div className="col-span-1">
            <CustomSwitch
              form={form}
              name="isServiceCharge"
              label="Is Sr Chg?"
              isDisabled={isConfirmed}
            />
          </div>

          <div className="col-span-1">
            <CustomNumberInput
              form={form}
              name="serviceCharge"
              label="Service Chg"
              round={amtDec}
              isDisabled={isConfirmed || !watchedValues.isServiceCharge}
            />
          </div>

          <div className="col-span-5">
            <CustomTextArea
              form={form}
              name="remarks"
              label="Remarks"
              isDisabled={isConfirmed}
              isRequired={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={isConfirmed}
            >
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Add"}
              </Button>
            )}
          </div>
        </div>

        {/* Right Section: Summary Box */}
        <div className="col-span-2 ml-2 flex flex-col justify-start">
          <div className="w-full rounded-md border border-blue-200 bg-blue-50 p-3 shadow-sm">
            {/* Header */}
            <div className="mb-2 border-b border-blue-300 pb-2 text-center text-sm font-bold text-blue-800">
              Summary
            </div>

            {/* Summary Values */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-600">Amt</span>
                <span className="font-medium text-gray-700">
                  {(summaryTotals?.totalAmount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-600">Gst</span>
                <span className="font-medium text-gray-700">
                  {(summaryTotals?.vatAmount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <hr className="my-1 border-blue-300" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-800">Total</span>
                <span className="font-bold text-blue-900">
                  {(summaryTotals?.totalAfterVat || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog for replacing Unit Price with Local Amount or vice versa */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!open) {
            // If dialog is closed (clicked outside or ESC), cancel the action
            handleCancelReplace()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogType === "replaceUnitPrice"
                ? "Replace Unit Price?"
                : "Replace Local Amount?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogType === "replaceUnitPrice" ? (
                <>
                  Unit Price is already set. Do you want to remove Unit Price
                  and use Local Amount instead? This will set Unit Price to 0.
                </>
              ) : (
                <>
                  Local Amount is already set. Do you want to remove Local
                  Amount and use Unit Price instead? This will set Local Amount
                  to 0.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReplace}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  )
}
