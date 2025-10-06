"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentDetailsFormProps {
  onAddRow: (rowData: Record<string, unknown>) => void
}

export default function PaymentDetailsForm({
  onAddRow,
}: PaymentDetailsFormProps) {
  const [formData, setFormData] = useState({
    documentNo: "",
    referenceNo: "",
    docCurrencyId: 0,
    docExhRate: 0,
    docAccountDate: "",
    docDueDate: "",
    docTotAmt: 0,
    docTotLocalAmt: 0,
    docBalAmt: 0,
    docBalLocalAmt: 0,
    allocAmt: 0,
    allocLocalAmt: 0,
    docAllocAmt: 0,
    docAllocLocalAmt: 0,
    centDiff: 0,
    exhGainLoss: 0,
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddRow = () => {
    if (formData.documentNo && formData.referenceNo) {
      onAddRow({
        ...formData,
        itemNo: Date.now(), // Temporary item number
        transactionId: 1, // Default transaction ID
        documentId: 0, // Default document ID
        editVersion: 0,
      })

      // Reset form
      setFormData({
        documentNo: "",
        referenceNo: "",
        docCurrencyId: 0,
        docExhRate: 0,
        docAccountDate: "",
        docDueDate: "",
        docTotAmt: 0,
        docTotLocalAmt: 0,
        docBalAmt: 0,
        docBalLocalAmt: 0,
        allocAmt: 0,
        allocLocalAmt: 0,
        docAllocAmt: 0,
        docAllocLocalAmt: 0,
        centDiff: 0,
        exhGainLoss: 0,
      })
    }
  }

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-semibold">Add Payment Details</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="documentNo">Document No</Label>
          <Input
            id="documentNo"
            value={formData.documentNo}
            onChange={(e) => handleInputChange("documentNo", e.target.value)}
            placeholder="Document No"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceNo">Reference No</Label>
          <Input
            id="referenceNo"
            value={formData.referenceNo}
            onChange={(e) => handleInputChange("referenceNo", e.target.value)}
            placeholder="Reference No"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docCurrencyId">Document Currency</Label>
          <Input
            id="docCurrencyId"
            type="number"
            value={formData.docCurrencyId}
            onChange={(e) =>
              handleInputChange("docCurrencyId", Number(e.target.value))
            }
            placeholder="Currency ID"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docExhRate">Document Exchange Rate</Label>
          <Input
            id="docExhRate"
            type="number"
            step="0.0001"
            value={formData.docExhRate}
            onChange={(e) =>
              handleInputChange("docExhRate", Number(e.target.value))
            }
            placeholder="Exchange Rate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docAccountDate">Account Date</Label>
          <Input
            id="docAccountDate"
            type="date"
            value={formData.docAccountDate}
            onChange={(e) =>
              handleInputChange("docAccountDate", e.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docDueDate">Due Date</Label>
          <Input
            id="docDueDate"
            type="date"
            value={formData.docDueDate}
            onChange={(e) => handleInputChange("docDueDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docTotAmt">Document Total Amount</Label>
          <Input
            id="docTotAmt"
            type="number"
            step="0.01"
            value={formData.docTotAmt}
            onChange={(e) =>
              handleInputChange("docTotAmt", Number(e.target.value))
            }
            placeholder="Total Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docTotLocalAmt">Document Total Local Amount</Label>
          <Input
            id="docTotLocalAmt"
            type="number"
            step="0.01"
            value={formData.docTotLocalAmt}
            onChange={(e) =>
              handleInputChange("docTotLocalAmt", Number(e.target.value))
            }
            placeholder="Total Local Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docBalAmt">Document Balance Amount</Label>
          <Input
            id="docBalAmt"
            type="number"
            step="0.01"
            value={formData.docBalAmt}
            onChange={(e) =>
              handleInputChange("docBalAmt", Number(e.target.value))
            }
            placeholder="Balance Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docBalLocalAmt">Document Balance Local Amount</Label>
          <Input
            id="docBalLocalAmt"
            type="number"
            step="0.01"
            value={formData.docBalLocalAmt}
            onChange={(e) =>
              handleInputChange("docBalLocalAmt", Number(e.target.value))
            }
            placeholder="Balance Local Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allocAmt">Allocation Amount</Label>
          <Input
            id="allocAmt"
            type="number"
            step="0.01"
            value={formData.allocAmt}
            onChange={(e) =>
              handleInputChange("allocAmt", Number(e.target.value))
            }
            placeholder="Allocation Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allocLocalAmt">Allocation Local Amount</Label>
          <Input
            id="allocLocalAmt"
            type="number"
            step="0.01"
            value={formData.allocLocalAmt}
            onChange={(e) =>
              handleInputChange("allocLocalAmt", Number(e.target.value))
            }
            placeholder="Allocation Local Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docAllocAmt">Document Allocation Amount</Label>
          <Input
            id="docAllocAmt"
            type="number"
            step="0.01"
            value={formData.docAllocAmt}
            onChange={(e) =>
              handleInputChange("docAllocAmt", Number(e.target.value))
            }
            placeholder="Document Allocation Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="docAllocLocalAmt">
            Document Allocation Local Amount
          </Label>
          <Input
            id="docAllocLocalAmt"
            type="number"
            step="0.01"
            value={formData.docAllocLocalAmt}
            onChange={(e) =>
              handleInputChange("docAllocLocalAmt", Number(e.target.value))
            }
            placeholder="Document Allocation Local Amount"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="centDiff">Cent Difference</Label>
          <Input
            id="centDiff"
            type="number"
            step="0.0001"
            value={formData.centDiff}
            onChange={(e) =>
              handleInputChange("centDiff", Number(e.target.value))
            }
            placeholder="Cent Difference"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exhGainLoss">Exchange Gain/Loss</Label>
          <Input
            id="exhGainLoss"
            type="number"
            step="0.0001"
            value={formData.exhGainLoss}
            onChange={(e) =>
              handleInputChange("exhGainLoss", Number(e.target.value))
            }
            placeholder="Exchange Gain/Loss"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleAddRow}
          disabled={!formData.documentNo || !formData.referenceNo}
        >
          Add Row
        </Button>
      </div>
    </div>
  )
}
