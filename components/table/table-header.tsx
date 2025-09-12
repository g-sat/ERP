import { useState } from "react"
import { IGridSetting } from "@/interfaces/setting"
import { Column } from "@tanstack/react-table"
// Import jsPDF properly
import jsPDF from "jspdf"
// Import autoTable separately - the ordering matters!
import {
  FileSpreadsheet,
  FileText,
  Layout,
  Plus,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { usePersist } from "@/hooks/use-common"
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
  hideCreateButton?: boolean // Add hideCreateButton prop
  moduleId: number
  transactionId: number
}

export function DataTableHeader<TData>({
  onRefresh,
  onCreate,
  searchQuery,
  onSearchChange,
  columns,
  data = [], // Default to empty array
  tableName = "Table",
  hideCreateButton = false, // Default to false
  moduleId,
  transactionId,
}: TableHeaderProps<TData>) {
  const [columnSearch, setColumnSearch] = useState("")
  const [activeButton, setActiveButton] = useState<"show" | "hide" | null>(null)

  // Filter columns based on search
  const filteredColumns = columns.filter((column) => {
    const headerText =
      typeof column.columnDef.header === "string"
        ? column.columnDef.header
        : column.id
    return headerText.toLowerCase().includes(columnSearch.toLowerCase())
  })

  const handleShowAll = () => {
    columns.forEach((column) => column.toggleVisibility(true))
    setActiveButton("show")
  }

  const handleHideAll = () => {
    columns.forEach((column) => column.toggleVisibility(false))
    setActiveButton("hide")
  }

  // Add the save mutation for grid settings
  const saveGridSettings = usePersist<IGridSetting>("/setting/saveUserGrid")

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
        {onCreate && !hideCreateButton && (
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        )}
        {onRefresh && (
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

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
              console.log(moduleId, transactionId, "moduleId, transactionId")
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
            <div className="p-2">
              <Input
                placeholder="Search columns..."
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                className="mb-2"
              />
            </div>
            <div className="flex gap-2 p-2">
              <Button
                variant={activeButton === "show" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={handleShowAll}
              >
                Show All
              </Button>
              <Button
                variant={activeButton === "hide" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={handleHideAll}
              >
                Hide All
              </Button>
            </div>
            <DropdownMenuItem className="my-1 h-px p-0" disabled />
            {filteredColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(e) => {
                  e.preventDefault()
                }}
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
