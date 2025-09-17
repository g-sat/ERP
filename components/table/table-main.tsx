"use client"

// ============================================================================
// IMPORTS SECTION
// ============================================================================

// React hooks for component state and lifecycle management
import { useEffect, useRef, useState } from "react"
// Drag and Drop functionality for column reordering
import {
  DndContext,
  // Main drag and drop context provider
  DragEndEvent,
  // Event type for when drag operation ends
  KeyboardSensor,
  // Sensor for keyboard-based drag operations
  MouseSensor,
  // Sensor for mouse-based drag operations
  TouchSensor,
  // Sensor for touch-based drag operations
  closestCenter,
  // Collision detection algorithm
  useSensor,
  // Hook to create sensors
  useSensors, // Hook to combine multiple sensors
} from "@dnd-kit/core"
// Sortable functionality for drag and drop
import {
  SortableContext,
  // Context for sortable items
  arrayMove,
  // Utility to move items in array
  horizontalListSortingStrategy, // Strategy for horizontal sorting
} from "@dnd-kit/sortable"
// TanStack Table for advanced table functionality
import {
  ColumnDef,
  // Type definition for table columns
  ColumnFiltersState,
  // State type for column filters
  SortingState,
  // State type for sorting
  VisibilityState,
  // State type for column visibility
  flexRender,
  // Function to render cell content
  getCoreRowModel,
  // Core row model for basic table functionality
  getFilteredRowModel,
  // Row model with filtering capabilities
  getPaginationRowModel,
  // Row model with pagination
  getSortedRowModel,
  // Row model with sorting capabilities
  useReactTable, // Main hook to create table instance
} from "@tanstack/react-table"
// Virtual scrolling for performance with large datasets
import { useVirtualizer } from "@tanstack/react-virtual"

// Utility types and custom hooks
import { TableName } from "@/lib/utils"
// Type for table names
import { useGetGridLayout } from "@/hooks/use-settings"
// Hook to get grid layout settings

// UI components for table structure
import {
  Table,
  // Main table component
  TableBody,
  // Table body component
  TableCell,
  // Table row component
  TableHeader,
  // Table header component (renamed to avoid conflicts)
  // Table cell component
  TableRow,
} from "@/components/ui/table"

// Custom table components
import { SortableTableHeader } from "./sortable-table-header"
// Header with drag and drop
import { DataTableActions } from "./table-actions"
// Action buttons (view/edit/delete)
import { DataTableFooter } from "./table-footer"
// Pagination and page size controls
import { DataTableHeader } from "./table-header"

// Search, refresh, and create buttons

// ============================================================================
// INTERFACE DEFINITION
// ============================================================================

/**
 * Props interface for the MainDataTable component
 * @template T - The type of data items in the table
 */
interface MainDataTableProps<T> {
  // ============================================================================
  // CORE DATA PROPS
  // ============================================================================
  data: T[] // Array of data items to display in the table
  columns: ColumnDef<T>[] // Column definitions for the table structure
  isLoading?: boolean // Loading state indicator
  moduleId?: number // Module ID for grid layout settings
  transactionId?: number // Transaction ID for grid layout settings
  tableName: TableName // Name of the table for grid layout persistence
  emptyMessage?: string // Message to show when no data is available
  accessorId: keyof T // Key to access unique identifier from data items

  // ============================================================================
  // HEADER FUNCTIONALITY PROPS
  // ============================================================================
  onRefresh?: () => void // Callback function for refresh button
  onFilterChange?: (filters: { search?: string; sortOrder?: string }) => void // Callback for filter changes

  // ============================================================================
  // ACTION HANDLER PROPS
  // ============================================================================
  onItemSelect?: (item: T | null) => void // Callback when item is selected/viewed
  onCreateItem?: () => void // Callback for creating new item
  onEditItem?: (item: T) => void // Callback for editing existing item
  onDeleteItem?: (itemId: string) => void // Callback for deleting item

  // ============================================================================
  // VISIBILITY CONTROL PROPS
  // ============================================================================
  showHeader?: boolean // Whether to show the table header (search, refresh, create)
  showFooter?: boolean // Whether to show the table footer (pagination)
  showActions?: boolean // Whether to show action buttons column

  // ============================================================================
  // PERMISSION CONTROL PROPS
  // ============================================================================

  canView?: boolean // Permission to view items
  canCreate?: boolean // Permission to create new items
  canEdit?: boolean // Permission to edit items
  canDelete?: boolean // Permission to delete items
}

// ============================================================================
// MAIN COMPONENT FUNCTION
// ============================================================================

/**
 * MainDataTable - A comprehensive data table component with advanced features
 *
 * Features:
 * - Virtual scrolling for performance with large datasets
 * - Drag and drop column reordering
 * - Column resizing and visibility controls
 * - Sorting, filtering, and pagination
 * - Action buttons (view, edit, delete)
 * - Grid layout persistence
 * - Permission-based access control
 *
 * @template T - The type of data items in the table
 * @param props - Component props as defined in MainDataTableProps
 * @returns JSX element representing the data table
 */
export function MainDataTable<T>({
  // ============================================================================
  // DESTRUCTURE PROPS WITH DEFAULT VALUES
  // ============================================================================
  data, // Array of data items
  columns, // Column definitions
  isLoading, // Loading state
  moduleId, // Module ID for settings
  transactionId, // Transaction ID for settings
  tableName, // Table name for settings
  emptyMessage = "No data found.", // Default empty message
  accessorId, // Key for unique identifier

  // Header functionality props
  onRefresh, // Refresh callback
  onFilterChange, // Filter change callback

  // Action handler props
  onItemSelect, // Item selection callback
  onCreateItem, // Create item callback
  onEditItem, // Edit item callback
  onDeleteItem, // Delete item callback

  // Visibility control props with defaults
  showHeader = true, // Show header by default
  showFooter = true, // Show footer by default
  showActions = true, // Show actions by default

  // Permission props with defaults (all permissions enabled by default)
  canView = true, // View permission
  canCreate = true, // Create permission
  canEdit = true, // Edit permission
  canDelete = true, // Delete permission
}: MainDataTableProps<T>) {
  // ============================================================================
  // GRID LAYOUT SETTINGS
  // ============================================================================

  // Fetch saved grid layout settings from the database
  // This allows users to have personalized table layouts that persist across sessions
  const { data: gridSettings } = useGetGridLayout(
    moduleId?.toString() || "", // Convert module ID to string
    transactionId?.toString() || "", // Convert transaction ID to string
    tableName // Table name for settings lookup
  )

  //console.log(gridSettings, "gridSettings")

  const gridSettingsData = gridSettings?.data

  // ============================================================================
  // STATE MANAGEMENT WITH GRID SETTINGS
  // ============================================================================

  // Initialize table state with grid settings if available
  const getInitialSorting = (): SortingState => {
    if (gridSettingsData?.grdSort) {
      try {
        return JSON.parse(gridSettingsData.grdSort) || []
      } catch {
        return []
      }
    }
    return []
  }

  const getInitialColumnVisibility = (): VisibilityState => {
    if (gridSettingsData?.grdColVisible) {
      try {
        return JSON.parse(gridSettingsData.grdColVisible) || {}
      } catch {
        return {}
      }
    }
    return {}
  }

  const getInitialColumnSizing = () => {
    if (gridSettingsData?.grdColSize) {
      try {
        return JSON.parse(gridSettingsData.grdColSize) || {}
      } catch {
        return {}
      }
    }
    return {}
  }

  // Table state management using React hooks with grid settings initialization
  const [sorting, setSorting] = useState<SortingState>(getInitialSorting) // Current sorting configuration
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]) // Active column filters
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    getInitialColumnVisibility
  ) // Column visibility state
  const [columnSizing, setColumnSizing] = useState(getInitialColumnSizing) // Column width settings
  const [searchQuery, setSearchQuery] = useState("") // Global search query
  const [currentPage, setCurrentPage] = useState(1) // Current page number
  const [pageSize, setPageSize] = useState(10) // Number of items per page
  const [rowSelection, setRowSelection] = useState({}) // Selected rows state

  // Reference to table container for virtual scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // EFFECT: UPDATE STATE WHEN GRID SETTINGS CHANGE
  // ============================================================================

  /**
   * Update table state when grid settings change (for dynamic updates)
   * This handles cases where grid settings are loaded after component mount
   */
  useEffect(() => {
    if (gridSettingsData) {
      try {
        // Parse saved settings from JSON strings
        const colVisible = JSON.parse(gridSettingsData.grdColVisible || "{}") // Column visibility settings
        const colSize = JSON.parse(gridSettingsData.grdColSize || "{}") // Column width settings
        const sort = JSON.parse(gridSettingsData.grdSort || "[]") // Sorting configuration

        // Update state only if it's different from current state
        setColumnVisibility((prev) => {
          const newVisibility =
            JSON.stringify(prev) !== JSON.stringify(colVisible)
              ? colVisible
              : prev
          return newVisibility
        })

        setSorting((prev) => {
          const newSorting =
            JSON.stringify(prev) !== JSON.stringify(sort) ? sort : prev
          return newSorting
        })

        // Apply column sizing if available (only if there are saved sizes)
        if (Object.keys(colSize).length > 0) {
          setColumnSizing((prev: Record<string, number>) => {
            const newSizing =
              JSON.stringify(prev) !== JSON.stringify(colSize) ? colSize : prev
            return newSizing
          })
        }
      } catch (error) {
        // Handle JSON parsing errors gracefully
        console.error("Error parsing grid settings:", error)
      }
    }
  }, [gridSettingsData]) // Re-run when grid settings change

  // ============================================================================
  // COLUMN CONFIGURATION
  // ============================================================================

  /**
   * Build the complete column configuration for the table
   * This includes the actions column (if enabled) plus all user-defined columns
   */
  const tableColumns: ColumnDef<T>[] = [
    // Conditionally add actions column if:
    // 1. showActions is true AND
    // 2. At least one action handler is provided
    ...(showActions && (onItemSelect || onEditItem || onDeleteItem)
      ? [
          {
            id: "actions", // Unique identifier for the actions column
            header: "Actions", // Column header text
            enableHiding: false, // Actions column cannot be hidden
            size: 120, // Default column width
            minSize: 80, // Minimum allowed width
            maxSize: 150, // Maximum allowed width
            cell: (
              { row } // Cell renderer function
            ) => (
              //I'll add more actions here later
              <DataTableActions
                row={row.original} // Pass the row data
                idAccessor={accessorId} // Pass the ID accessor key
                onView={onItemSelect} // View/select handler
                onEdit={onEditItem} // Edit handler
                onDelete={onDeleteItem} // Delete handler
                hideView={!canView} // Hide view button if no permission
                hideEdit={!canEdit} // Hide edit button if no permission
                hideDelete={!canDelete} // Hide delete button if no permission
              />
            ),
          } as ColumnDef<T>,
        ]
      : []), // Empty array if actions column should not be shown
    ...columns, // Spread all user-defined columns after the actions column
  ]

  // ============================================================================
  // TABLE INSTANCE CREATION
  // ============================================================================

  /**
   * Create the TanStack Table instance with all configuration
   * This is the core of the table functionality
   */
  const table = useReactTable({
    // ============================================================================
    // BASIC CONFIGURATION
    // ============================================================================
    data, // Data array to display
    columns: tableColumns, // Column definitions (including actions)
    pageCount: Math.ceil(data.length / pageSize), // Total number of pages

    // ============================================================================
    // STATE CHANGE HANDLERS
    // ============================================================================
    onSortingChange: setSorting, // Handle sorting changes
    onColumnFiltersChange: setColumnFilters, // Handle filter changes
    onColumnVisibilityChange: setColumnVisibility, // Handle column show/hide
    onColumnSizingChange: setColumnSizing, // Handle column resize
    onRowSelectionChange: setRowSelection, // Handle row selection

    // ============================================================================
    // ROW MODELS (DATA PROCESSING)
    // ============================================================================
    getCoreRowModel: getCoreRowModel(), // Basic row processing
    getPaginationRowModel: getPaginationRowModel(), // Pagination functionality
    getSortedRowModel: getSortedRowModel(), // Sorting functionality
    getFilteredRowModel: getFilteredRowModel(), // Filtering functionality

    // ============================================================================
    // FEATURE ENABLEMENT
    // ============================================================================
    enableColumnResizing: true, // Allow column resizing
    enableRowSelection: true, // Allow row selection
    columnResizeMode: "onChange", // Resize columns as user drags

    // ============================================================================
    // CURRENT STATE
    // ============================================================================
    state: {
      sorting, // Current sorting state
      columnFilters, // Current filter state
      columnVisibility, // Current visibility state
      columnSizing, // Current column sizes
      rowSelection, // Current selected rows
      pagination: {
        // Current pagination state
        pageIndex: currentPage - 1, // Convert to 0-based index
        pageSize, // Items per page
      },
      globalFilter: searchQuery, // Current search query
    },
  })

  // ============================================================================
  // EFFECT: APPLY SAVED COLUMN ORDER
  // ============================================================================

  /**
   * Apply saved column order after table instance is created
   * This must be done after the table is initialized because setColumnOrder
   * requires the table instance to be available
   */
  useEffect(() => {
    if (gridSettingsData && table) {
      try {
        // Parse saved column order from JSON string
        const colOrder = JSON.parse(gridSettingsData.grdColOrder || "[]")

        // Apply column order if there are saved column positions
        if (colOrder.length > 0) {
          table.setColumnOrder(colOrder) // Reorder columns according to saved preferences
        }
      } catch (error) {
        // Handle JSON parsing errors gracefully
        console.error("Error parsing column order:", error)
      }
    }
  }, [gridSettingsData, table]) // Re-run when grid settings or table instance changes

  // ============================================================================
  // VIRTUAL SCROLLING SETUP
  // ============================================================================

  /**
   * Set up virtual scrolling for performance with large datasets
   * Only renders visible rows plus a small buffer, dramatically improving performance
   */
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length, // Total number of rows to virtualize
    getScrollElement: () => tableContainerRef.current, // Container element for scrolling
    estimateSize: () => 28, // Estimated height of each row in pixels
    overscan: 5, // Number of extra rows to render outside viewport
  })

  // ============================================================================
  // VIRTUAL SCROLLING CALCULATIONS
  // ============================================================================

  // Get the currently visible virtual rows
  const virtualRows = rowVirtualizer.getVirtualItems()

  // Calculate total height of all rows (visible + invisible)
  const totalSize = rowVirtualizer.getTotalSize()

  // Calculate padding for smooth scrolling
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0 // Top padding
  const paddingBottom = // Bottom padding
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0

  // ============================================================================
  // DRAG AND DROP SENSORS
  // ============================================================================

  /**
   * Configure drag and drop sensors for column reordering
   * Supports mouse, touch, and keyboard interactions
   */
  const sensors = useSensors(
    useSensor(MouseSensor, {}), // Mouse-based dragging
    useSensor(TouchSensor, {}), // Touch-based dragging (mobile)
    useSensor(KeyboardSensor, {}) // Keyboard-based dragging (accessibility)
  )

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle search query changes
   * @param query - The search query string
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query) // Update local search state

    // If data is available locally, use table's built-in filtering
    if (data && data.length > 0) {
      table.setGlobalFilter(query) // Apply filter to local data
    }
    // If no local data or using server-side filtering, call parent handler
    else if (onFilterChange) {
      const newFilters = {
        search: query, // Pass search query
        sortOrder: sorting[0]?.desc ? "desc" : "asc", // Pass current sort order
      }
      onFilterChange(newFilters) // Let parent handle server-side filtering
    }
  }

  /**
   * Handle page changes in pagination
   * @param page - The new page number (1-based)
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page) // Update local page state
    table.setPageIndex(page - 1) // Convert to 0-based index for table
  }

  /**
   * Handle page size changes in pagination
   * @param size - The new page size (items per page)
   */
  const handlePageSizeChange = (size: number) => {
    setPageSize(size) // Update local page size state
    table.setPageSize(size) // Update table page size
  }

  /**
   * Handle drag and drop end event for column reordering
   * @param event - The drag end event containing active and over elements
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event // Extract dragged and target elements

    // Only proceed if there's a valid drop target and it's different from the source
    if (active && over && active.id !== over.id) {
      // Find the index of the dragged column
      const oldIndex = table
        .getAllColumns()
        .findIndex((col) => col.id === active.id)

      // Find the index of the target column
      const newIndex = table
        .getAllColumns()
        .findIndex((col) => col.id === over.id)

      // Create new column order by moving the column
      const newColumnOrder = arrayMove(
        table.getAllColumns(), // Current column array
        oldIndex, // Source index
        newIndex // Target index
      )

      // Apply the new column order to the table
      table.setColumnOrder(newColumnOrder.map((col) => col.id))
    }
  }

  // ============================================================================
  // EFFECT: HANDLE SERVER-SIDE FILTERING
  // ============================================================================

  /**
   * Handle server-side filtering when no local data is available
   * This effect triggers when sorting, search, or data availability changes
   */
  useEffect(() => {
    // Only trigger server-side filtering if:
    // 1. No local data is available AND
    // 2. A filter change handler is provided
    if (!data?.length && onFilterChange) {
      const filters = {
        search: searchQuery, // Current search query
        sortOrder: sorting[0]?.desc ? "desc" : "asc", // Current sort order
      }
      onFilterChange(filters) // Call parent to fetch filtered data from server
    }
  }, [sorting, searchQuery, data?.length, onFilterChange]) // Re-run when these values change

  // ============================================================================
  // RENDER SECTION
  // ============================================================================

  return (
    <>
      {/* ============================================================================
          TABLE HEADER SECTION
          ============================================================================ */}

      {/* Conditionally render table header with search, refresh, and create functionality */}
      {showHeader && (
        <DataTableHeader
          searchQuery={searchQuery} // Current search query
          onSearchChange={handleSearch} // Search change handler
          onRefresh={onRefresh} // Refresh button handler
          onCreate={onCreateItem} // Create button handler
          columns={table.getAllLeafColumns()} // All available columns for visibility toggle
          data={data} // Current data for export functionality
          tableName={tableName} // Table name for settings
          hideCreateButton={!canCreate} // Hide create button if no permission
          moduleId={moduleId || 1} // Module ID for settings (default to 1)
          transactionId={transactionId || 1} // Transaction ID for settings (default to 1)
        />
      )}

      {/* ============================================================================
          DRAG AND DROP CONTEXT
          ============================================================================ */}

      {/* Wrap table in drag and drop context for column reordering */}
      <DndContext
        sensors={sensors} // Configured drag sensors
        collisionDetection={closestCenter} // Collision detection algorithm
        onDragEnd={handleDragEnd} // Handle drag end events
      >
        {/* ============================================================================
            TABLE CONTAINER
            ============================================================================ */}

        {/* Main table container with horizontal scrolling */}
        <div className="overflow-x-auto rounded-lg border">
          {/* Fixed header table with column sizing */}
          <Table className="w-full table-fixed border-collapse">
            {/* Column group for consistent sizing */}
            <colgroup>
              {table.getAllLeafColumns().map((col) => (
                <col
                  key={col.id}
                  style={{ width: `${col.getSize()}px` }} // Set column width from table state
                />
              ))}
            </colgroup>

            {/* Sticky table header */}
            <TableHeader className="bg-background sticky top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {/* Sortable context for drag and drop */}
                  <SortableContext
                    items={headerGroup.headers.map((header) => header.id)} // Column IDs for sorting
                    strategy={horizontalListSortingStrategy} // Horizontal sorting strategy
                  >
                    {/* Render each sortable header */}
                    {headerGroup.headers.map((header) => (
                      <SortableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
          </Table>

          {/* Scrollable body container with virtual scrolling */}
          <div
            ref={tableContainerRef} // Reference for virtual scrolling
            className="max-h-[500px] overflow-y-auto" // Fixed height with vertical scrolling
          >
            {/* Body table with same column sizing as header */}
            <Table className="w-full table-fixed border-collapse">
              {/* Column group matching header for alignment */}
              <colgroup>
                {table.getAllLeafColumns().map((col) => (
                  <col
                    key={col.id}
                    style={{ width: `${col.getSize()}px` }} // Match header column widths
                  />
                ))}
              </colgroup>

              <TableBody>
                {/* ============================================================================
                    EMPTY STATE OR LOADING
                    ============================================================================ */}

                {/* Show empty state or loading message when no virtual rows */}
                {virtualRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length} // Span all columns
                      className="text-center" // Center the message
                    >
                      {isLoading ? "Loading..." : emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  /* ============================================================================
                      VIRTUAL ROWS RENDERING
                      ============================================================================ */

                  <>
                    {/* Top padding for virtual scrolling */}
                    <tr style={{ height: `${paddingTop}px` }} />

                    {/* Render only visible virtual rows for performance */}
                    {virtualRows.map((virtualRow) => {
                      const row = table.getRowModel().rows[virtualRow.index] // Get actual row data
                      return (
                        <TableRow key={row.id}>
                          {/* Render each visible cell in the row */}
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell
                              key={cell.id}
                              className={`py-1 ${
                                cellIndex === 0
                                  ? "bg-background sticky left-0 z-10" // Make first column sticky
                                  : ""
                              }`}
                            >
                              {/* Render cell content using column definition */}
                              {flexRender(
                                cell.column.columnDef.cell, // Cell renderer from column definition
                                cell.getContext() // Cell context with row data
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })}

                    {/* Bottom padding for virtual scrolling */}
                    <tr style={{ height: `${paddingBottom}px` }} />
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DndContext>

      {/* ============================================================================
          TABLE FOOTER SECTION
          ============================================================================ */}

      {/* Conditionally render table footer with pagination controls */}
      {showFooter && (
        <DataTableFooter
          currentPage={currentPage} // Current page number
          totalPages={Math.ceil(data.length / pageSize)} // Total number of pages
          pageSize={pageSize} // Current page size
          totalRecords={data.length} // Total number of records
          onPageChange={handlePageChange} // Page change handler
          onPageSizeChange={handlePageSizeChange} // Page size change handler
          pageSizeOptions={[10, 50, 100, 500]} // Available page size options
        />
      )}
    </>
  )
}

// ============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// ============================================================================

/**
 * USAGE EXAMPLES:
 *
 * 1. BASIC USAGE:
 * ```tsx
 * <MainDataTable
 *   data={employees}
 *   columns={employeeColumns}
 *   tableName="employees"
 *   accessorId="id"
 *   onEditItem={(employee) => setEditingEmployee(employee)}
 *   onDeleteItem={(id) => deleteEmployee(id)}
 * />
 * ```
 *
 * 2. WITH PERMISSIONS:
 * ```tsx
 * <MainDataTable
 *   data={products}
 *   columns={productColumns}
 *   tableName="products"
 *   accessorId="productId"
 *   canEdit={userPermissions.canEditProducts}
 *   canDelete={userPermissions.canDeleteProducts}
 *   canCreate={userPermissions.canCreateProducts}
 *   onCreateItem={() => setShowCreateModal(true)}
 * />
 * ```
 *
 * 3. WITH SERVER-SIDE FILTERING:
 * ```tsx
 * <MainDataTable
 *   data={[]} // Empty array for server-side data
 *   columns={orderColumns}
 *   tableName="orders"
 *   accessorId="orderId"
 *   onFilterChange={(filters) => fetchOrders(filters)}
 *   onRefresh={() => fetchOrders()}
 * />
 * ```
 *
 * 4. CUSTOMIZED DISPLAY:
 * ```tsx
 * <MainDataTable
 *   data={customers}
 *   columns={customerColumns}
 *   tableName="customers"
 *   accessorId="customerId"
 *   showHeader={true}
 *   showFooter={true}
 *   showActions={false} // Hide action buttons
 *   emptyMessage="No customers found. Create your first customer!"
 * />
 * ```
 *
 * KEY FEATURES:
 * - Virtual scrolling for performance with large datasets
 * - Drag and drop column reordering
 * - Column resizing and visibility controls
 * - Sorting, filtering, and pagination
 * - Action buttons (view, edit, delete) with permission control
 * - Grid layout persistence across sessions
 * - Server-side and client-side filtering support
 * - Responsive design with horizontal scrolling
 * - Sticky header and first column
 * - Loading states and empty state handling
 *
 * PERFORMANCE NOTES:
 * - Virtual scrolling only renders visible rows + buffer
 * - Column sizing is optimized for large datasets
 * - Grid settings are cached and persisted
 * - Efficient re-rendering with React.memo patterns
 *
 * ACCESSIBILITY:
 * - Keyboard navigation support
 * - Screen reader friendly
 * - ARIA labels and roles
 * - Focus management
 * - High contrast support
 */
