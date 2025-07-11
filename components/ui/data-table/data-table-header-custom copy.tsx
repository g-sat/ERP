import { IGridSetting } from "@/interfaces/setting"
import { Column } from "@tanstack/react-table"
// Import jsPDF properly
import jsPDF from "jspdf"
// Import autoTable separately - the ordering matters!
import {
  FileSpreadsheet,
  FileText,
  Layout,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { useSave } from "@/hooks/use-common"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Extend jsPDF to include autoTable with a more specific type
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      head?: string[][]
      body: unknown[][]
      theme?: string
      margin?: { top?: number; right?: number; bottom?: number; left?: number }
      startY?: number
      styles?: Record<string, unknown>
      headStyles?: Record<string, unknown>
      bodyStyles?: Record<string, unknown>
      alternateRowStyles?: Record<string, unknown>
      columnStyles?: Record<string, unknown>
    }) => jsPDF
  }
}

// Define types for clarity
type TableHeaderProps<TData> = {
  onRefresh?: () => void
  onCreate?: () => void

  onFilterToggle?: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  columns: Column<TData, unknown>[]
  isFilterOpen?: boolean
  data?: TData[] // Add data prop
  tableName?: string // Optional table name prop
}

export function TableHeaderCustom<TData>({
  onRefresh,
  searchQuery,
  onSearchChange,
  columns,
  data = [], // Default to empty array
  tableName = "Table",
}: TableHeaderProps<TData>) {
  // Add the save mutation for grid settings
  const saveGridSettings = useSave<IGridSetting>(
    "/setting/saveUserGrid",
    "gridSettings"
  )

  const handleExportExcel = (data: TData[]) => {
    toast.info("Exporting to Excel...", {
      description: "Generating Excel file with country data.",
    })

    if (!data || data.length === 0) {
      toast.error("No data available to export")
      return
    }

    try {
      // Create filtered data without ID fields
      const filteredData = data.map((item) => {
        const cleanedItem: Record<string, unknown> = {}
        const itemRecord = item as Record<string, unknown>

        // Copy all properties except those containing "id" (case-insensitive)
        Object.keys(itemRecord).forEach((key) => {
          if (!key.toLowerCase().includes("id")) {
            cleanedItem[key] = itemRecord[key]
          }
        })

        return cleanedItem
      })

      const worksheet = XLSX.utils.json_to_sheet(filteredData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, `${tableName}.xlsx`)
      toast.success("Excel file downloaded successfully")
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast.error("Failed to export Excel")
    }
  }

  const handleExportPdf = (data: TData[]) => {
    toast.info("Exporting to PDF...", {
      description: "Generating PDF file with table data.",
    })
    if (!data || data.length === 0) {
      toast.error("No data available to export")
      return
    }
    try {
      const doc = new jsPDF()

      // Filter out ID columns
      const filteredData = data.map((item) => {
        const cleanedItem: Record<string, unknown> = {}
        const itemRecord = item as Record<string, unknown>

        // Copy all properties except those containing "id" (case-insensitive)
        Object.keys(itemRecord).forEach((key) => {
          if (!key.toLowerCase().includes("id")) {
            cleanedItem[key] = itemRecord[key]
          }
        })

        return cleanedItem
      })

      // Extract non-ID headers
      const headers =
        filteredData.length > 0 ? Object.keys(filteredData[0]) : []

      // Create the table body
      const body = filteredData.map((row) =>
        headers.map((header) => (row as Record<string, unknown>)[header])
      )

      // Use autoTable as a method on the jsPDF instance
      doc.autoTable({
        head: [headers],
        body: body,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      })

      doc.save(`table_data.pdf`)
      toast.success("PDF file downloaded successfully")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast.error("Failed to export PDF")
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        {/* Excel Export Button */}
        <Button
          variant="outline"
          title="Export to Excel"
          onClick={() => handleExportExcel(data)}
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Excel
        </Button>
        {/* PDF Export Button */}
        <Button
          variant="outline"
          title="Export to PDF"
          onClick={() => handleExportPdf(data)}
        >
          <FileText className="h-4 w-4 text-red-600" />
          Pdf
        </Button>

        {/* Layout Change */}
        <Button
          variant="outline"
          title="Save Layout"
          onClick={async () => {
            try {
              const moduleId = 1 // Replace with actual module ID
              const transactionId = 1 // Replace with actual transaction ID
              const grdName = tableName

              // Get column visibility and order
              const columnVisibility = Object.fromEntries(
                columns.map((col) => [col.id, col.getIsVisible()])
              )
              const columnSize = Object.fromEntries(
                columns.map((col) => [col.id, col.getSize()])
              )
              const columnOrder = columns.map((col) => col.id)
              const sorting: { id: string; desc: boolean }[] = [] // Add sorting if needed

              const gridSettings: IGridSetting = {
                moduleId,
                transactionId,
                grdName,
                grdKey: grdName,
                grdColVisible: JSON.stringify(columnVisibility),
                grdColOrder: JSON.stringify(columnOrder),
                grdColSize: JSON.stringify(columnSize),
                grdSort: JSON.stringify(sorting),
                grdString: "",
              }

              await saveGridSettings.mutateAsync(gridSettings)
            } catch (error) {
              console.error("Error saving layout:", error)
            }
          }}
        >
          <Layout className="h-4 w-4" />
          Save Layout
        </Button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-[300px]"
        />
        {/* Column Visibility Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                columns.forEach((column) => column.toggleVisibility(false))
              }
              className="justify-center font-medium"
            >
              Deselect All
            </DropdownMenuItem>
            <DropdownMenuItem className="my-1 h-px p-0" disabled />
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
