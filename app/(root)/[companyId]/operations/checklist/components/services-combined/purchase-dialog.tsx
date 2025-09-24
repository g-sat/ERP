"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageLoadingSpinner } from "@/components/loading-spinner"

const mockAllocated = [
  {
    id: 1,
    invoiceNo: "PIN-25-02940",
    supplierInvoice: "AI-2506-015",
    account: "17 Jun 2025",
    code: "VC013",
    name: "CRD Marine Services",
    remark: "Boat Hire Charges",
    amt: 1945.0,
    vat: 0.0,
    totalAmt: 1945.0,
    debitNote: false,
  },
  {
    id: 2,
    invoiceNo: "PIN-25-02941",
    supplierInvoice: "AI-2506-016",
    account: "18 Jun 2025",
    code: "VC014",
    name: "Port Authority Dubai",
    remark: "Port Dues and Charges",
    amt: 3200.0,
    vat: 160.0,
    totalAmt: 3360.0,
    debitNote: true,
  },
  {
    id: 3,
    invoiceNo: "PIN-25-02942",
    supplierInvoice: "AI-2506-017",
    account: "19 Jun 2025",
    code: "VC015",
    name: "Marine Equipment Co",
    remark: "Crane Services",
    amt: 1500.0,
    vat: 75.0,
    totalAmt: 1575.0,
    debitNote: false,
  },
  {
    id: 4,
    invoiceNo: "PIN-25-02943",
    supplierInvoice: "AI-2506-018",
    account: "20 Jun 2025",
    code: "VC016",
    name: "Gulf Shipping Ltd",
    remark: "Pilotage Services",
    amt: 850.0,
    vat: 42.5,
    totalAmt: 892.5,
    debitNote: true,
  },
  {
    id: 5,
    invoiceNo: "PIN-25-02944",
    supplierInvoice: "AI-2506-019",
    account: "21 Jun 2025",
    code: "VC017",
    name: "Dubai Customs",
    remark: "Customs Clearance",
    amt: 1200.0,
    vat: 60.0,
    totalAmt: 1260.0,
    debitNote: false,
  },
]

type RowType = (typeof mockAllocated)[number]

const mockUnallocated: RowType[] = [
  {
    id: 6,
    invoiceNo: "PIN-25-02945",
    supplierInvoice: "AI-2506-020",
    account: "22 Jun 2025",
    code: "VC018",
    name: "Marine Fuel Services",
    remark: "Bunker Fuel Supply",
    amt: 4500.0,
    vat: 225.0,
    totalAmt: 4725.0,
    debitNote: false,
  },
  {
    id: 7,
    invoiceNo: "PIN-25-02946",
    supplierInvoice: "AI-2506-021",
    account: "23 Jun 2025",
    code: "VC019",
    name: "Harbor Master Office",
    remark: "Berth Allocation",
    amt: 1800.0,
    vat: 90.0,
    totalAmt: 1890.0,
    debitNote: true,
  },
  {
    id: 8,
    invoiceNo: "PIN-25-02947",
    supplierInvoice: "AI-2506-022",
    account: "24 Jun 2025",
    code: "VC020",
    name: "Marine Safety Co",
    remark: "Safety Equipment",
    amt: 950.0,
    vat: 47.5,
    totalAmt: 997.5,
    debitNote: false,
  },
  {
    id: 9,
    invoiceNo: "PIN-25-02948",
    supplierInvoice: "AI-2506-023",
    account: "25 Jun 2025",
    code: "VC021",
    name: "Port Security Services",
    remark: "Security Clearance",
    amt: 650.0,
    vat: 32.5,
    totalAmt: 682.5,
    debitNote: true,
  },
  {
    id: 10,
    invoiceNo: "PIN-25-02949",
    supplierInvoice: "AI-2506-024",
    account: "26 Jun 2025",
    code: "VC022",
    name: "Marine Communications",
    remark: "Radio Services",
    amt: 750.0,
    vat: 37.5,
    totalAmt: 787.5,
    debitNote: false,
  },
]

const columns = [
  { key: "select", label: "All" },
  { key: "invoiceNo", label: "Invoice No" },
  { key: "supplierInvoice", label: "Supplier Inv" },
  { key: "account", label: "Account" },
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "remark", label: "Remark" },
  { key: "amt", label: "Amt" },
  { key: "vat", label: "VAT" },
  { key: "totalAmt", label: "Total Amt" },
  { key: "debitNote", label: "Debit Note" },
]

interface PurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function PurchaseDialog({
  open,
  onOpenChange,
  title = "Purchase",
  description = "Manage purchase details for this service.",
}: PurchaseDialogProps) {
  // Show loading state when dialog is opening
  if (open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
        >
          <div className="flex items-center justify-center py-8">
            <PageLoadingSpinner text="Loading purchase details..." />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const allocatedCount = mockAllocated.length
  const unallocatedCount = mockUnallocated.length

  const allocatedData = mockAllocated
  const unallocatedData = mockUnallocated

  // Calculate totals for allocated data
  const allocatedTotals = allocatedData.reduce(
    (acc, row) => ({
      amt: acc.amt + row.amt,
      vat: acc.vat + row.vat,
      totalAmt: acc.totalAmt + row.totalAmt,
    }),
    { amt: 0, vat: 0, totalAmt: 0 }
  )

  // Calculate totals for unallocated data
  const unallocatedTotals = unallocatedData.reduce(
    (acc, row) => ({
      amt: acc.amt + row.amt,
      vat: acc.vat + row.vat,
      totalAmt: acc.totalAmt + row.totalAmt,
    }),
    { amt: 0, vat: 0, totalAmt: 0 }
  )

  const renderTable = (data: RowType[], totals: typeof allocatedTotals) => (
    <>
      {/* Table */}
      <div>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>No data</td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Checkbox defaultChecked={true} />
                  </td>
                  <td>
                    <span>{row.invoiceNo}</span>
                  </td>
                  <td>{row.supplierInvoice}</td>
                  <td>{row.account}</td>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.remark}</td>
                  <td>
                    {row.amt.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {row.vat.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {row.totalAmt.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <Badge variant={row.debitNote ? "default" : "secondary"}>
                      {row.debitNote ? "Yes" : "No"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div>
        <span>
          {totals.amt.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </span>
        <span>
          {totals.vat.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </span>
        <span>
          {totals.totalAmt.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] w-[95vw] !max-w-none overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>
          <Tabs defaultValue="allocated">
            <TabsList>
              <TabsTrigger value="allocated">
                Allocated ({allocatedCount})
              </TabsTrigger>
              <TabsTrigger value="unallocated">
                Un-Allocated ({unallocatedCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allocated">
              {renderTable(allocatedData, allocatedTotals)}
            </TabsContent>

            <TabsContent value="unallocated">
              {renderTable(unallocatedData, unallocatedTotals)}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PurchaseDialog
