// components/table/Table.tsx
"use client";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  RowSelectionState,
  Row,
  CellContext,
  Header
} from "@tanstack/react-table";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useMemo, useCallback, ReactNode } from "react";
import {
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

/* -------------------------------------------------------------------------- */
/*  Types – Fully Type-Safe                                                   */
/* -------------------------------------------------------------------------- */
interface TableMeta<T extends object> {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

export interface Column<T extends object> {
  accessorKey: keyof T;
  header: string;
  cell?: (info: CellContext<T, unknown>) => ReactNode; // Use TanStack's type
  sortable?: boolean;
  size?: number;
  enableHiding?: boolean;
  align?: "left" | "center" | "right";
  editable?: boolean;
}

export interface Action<T extends object> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  isVisible?: (row: T) => boolean;
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary" | "link";
}

export interface TableSettings {
  pageSize?: number;
  showPagination?: boolean;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
  enableColumnResizing?: boolean;
  enableColumnVisibility?: boolean;
  enableRowReorder?: boolean;
  enableColumnReorder?: boolean;
  globalFilterPlaceholder?: string;
}

interface TableContainerProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  settings?: TableSettings;
  className?: string;
  style?: React.CSSProperties;
  onRowReorder?: (newData: T[]) => void;
  onRowSelectionChange?: (selectedRows: RowSelectionState) => void;
  onResetLayout?: () => void;
  initialVisibility?: VisibilityState;
  onDataUpdate?: (updatedData: T[]) => void;
}

/* -------------------------------------------------------------------------- */
/*  Editable Cell Component                                                   */
/* -------------------------------------------------------------------------- */
function EditableCell<T extends object>({
  getValue,
  row: { index },
  column: { id },
  table,
}: CellContext<T, unknown>) {
  const meta = table.options.meta as TableMeta<T>;
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);

  const onBlur = () => {
    meta.updateData(index, id, value); // index = row.index
  };

  return (
    <Input
      value={value as string}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="h-8 w-full border-0 bg-transparent p-0 text-sm focus:ring-1 focus:ring-ring"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Sortable Row Component                                                    */
/* -------------------------------------------------------------------------- */
function SortableRow<T extends object>({ row }: { row: Row<T> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border-b border-border hover:bg-muted/50 transition-colors"
    >
      {row.getVisibleCells().map((cell) => {
        const align = (cell.column.columnDef as Column<T>).align ?? "left";
        return (
          <td
            key={cell.id}
            style={{ textAlign: align }}
            className="p-3 text-sm"
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Draggable Header Component                                                */
/* -------------------------------------------------------------------------- */
function DraggableHeader<T extends object>({ header }: { header: Header<T, unknown> }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: header.column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    position: "relative" as const,
    width: header.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="border-r border-border p-3 text-left text-sm font-medium text-foreground bg-muted/30"
    >
      <div className="flex items-center gap-1">
        {flexRender(header.column.columnDef.header, header.getContext())}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          ≡
        </button>
      </div>
    </th>
  );
}

/* -------------------------------------------------------------------------- */
/*  TableContainer – Main Component                                           */
/* -------------------------------------------------------------------------- */
export function TableContainer<T extends object>({
  columns,
  data,
  actions = [],
  settings = {
    pageSize: 10,
    showPagination: true,
    enableRowSelection: false,
    enableSorting: true,
    enableColumnFilters: true,
    enableColumnResizing: true,
    enableColumnVisibility: true,
    enableRowReorder: false,
    enableColumnReorder: false,
    globalFilterPlaceholder: "Search...",
  },
  className,
  style,
  onRowReorder,
  onRowSelectionChange,
  onResetLayout,
  initialVisibility = {},
  onDataUpdate,
}: TableContainerProps<T>): React.JSX.Element {
  /* -------------------------- State -------------------------------------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: settings.pageSize ?? 10,
  });
  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((c) => c.accessorKey as string)
  );

  /* -------------------------- DndKit Sensors ----------------------------- */
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  /* -------------------------- Actions Column --------------------------- */
  const actionsColumn: ColumnDef<T> = useMemo(
    () => ({
      id: "actions",
      header: "Actions",
      size: 180,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {settings.enableRowSelection && (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              className="h-4 w-4"
            />
          )}
          {settings.enableRowReorder && (
            <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
          )}
          {actions.map((act, i) =>
            (!act.isVisible || act.isVisible(row.original)) ? (
              <Button
                key={i}
                variant={act.variant ?? "ghost"}
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  act.onClick(row.original);
                }}
                className="h-7 w-7"
              >
                {act.icon ?? act.label}
              </Button>
            ) : null
          )}
        </div>
      ),
    }),
    [actions, settings.enableRowSelection, settings.enableRowReorder]
  );

  /* -------------------------- Map Columns to TanStack ------------------- */
  const tanstackColumns: ColumnDef<T>[] = useMemo(
    () => [
      actionsColumn,
      ...columns.map((col) => ({
        accessorKey: col.accessorKey as string,
        header: col.header,
        cell: col.editable
            ? EditableCell
            : col.cell
            ? col.cell  // Direct pass — no wrapper
            : undefined,
        enableSorting: col.sortable ?? true,
        size: col.size,
        enableHiding: col.enableHiding ?? true,
        meta: { align: col.align },
      })),
    ],
    [columns, actionsColumn]
  );

  /* -------------------------- TanStack Table --------------------------- */
  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSel = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSel);
      onRowSelectionChange?.(newSel);
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: settings.enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: settings.enableColumnFilters ? getFilteredRowModel() : undefined,
    getPaginationRowModel: settings.showPagination ? getPaginationRowModel() : undefined,
    enableRowSelection: settings.enableRowSelection,
    enableMultiRowSelection: true,
    columnResizeMode: settings.enableColumnResizing ? "onChange" : undefined,
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        const newData = data.map((row, idx) =>
          idx === rowIndex ? { ...row, [columnId]: value } : row
        );
        onDataUpdate?.(newData);
      },
    },
  });

  /* -------------------------- Row Reorder ------------------------------- */
  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIdx = table.getRowModel().rows.findIndex((r) => r.id === active.id);
      const newIdx = table.getRowModel().rows.findIndex((r) => r.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;

      const newData = arrayMove(data, oldIdx, newIdx);
      onRowReorder?.(newData);
    },
    [data, table, onRowReorder]
  );

  /* -------------------------- Column Reorder --------------------------- */
  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    },
    [columnOrder]
  );

  /* -------------------------- Reset Layout ----------------------------- */
  const handleResetLayout = useCallback(() => {
    setColumnVisibility({});
    setSorting([]);
    setColumnFilters([]);
    setColumnOrder(columns.map((c) => c.accessorKey as string));
    onResetLayout?.();
  }, [columns, onResetLayout]);

  /* -------------------------- Render ------------------------------------ */
  return (
    <div
      className={`rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`}
      style={style}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {settings.enableColumnFilters && (
          <Input
            placeholder={settings.globalFilterPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm h-9 text-sm"
          />
        )}
        {settings.enableColumnVisibility && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((c) => c.getCanHide())
                  .map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => c.toggleVisibility(!c.getIsVisible())}
                    >
                      <Checkbox checked={c.getIsVisible()} className="mr-2 h-4 w-4" />
                      {c.id}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleResetLayout}>
              Reset Layout
            </Button>
          </div>
        )}
      </div>

      {/* Table Wrapper */}
      <div className="overflow-auto" style={{ maxHeight: "500px" }}>
        <table className="w-full border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {/* Sticky Actions Header */}
                <th
                  className="sticky left-0 bg-muted/50 z-20 border-r border-border p-3 text-left text-sm font-medium text-foreground"
                  style={{ width: actionsColumn.size }}
                >
                  Actions
                </th>
                {settings.enableColumnReorder ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleColumnDragEnd}
                  >
                    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                      {hg.headers.map((header) => (
                        <DraggableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  hg.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                      style={{
                        width: header.getSize(),
                        position: "relative",
                        cursor: header.column.getCanSort() ? "pointer" : "default",
                      }}
                      className="border-r border-border p-3 text-left text-sm font-medium text-foreground bg-muted/30"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {settings.enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize hover:bg-primary/20"
                        />
                      )}
                    </th>
                  ))
                )}
              </tr>
            ))}
          </thead>

          {/* Body with Drag & Drop */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRowDragEnd}>
            <SortableContext
              items={table.getRowModel().rows.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <SortableRow key={row.id} row={row} />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      {/* Pagination */}
      {settings.showPagination && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}









  // const { data: gridSettings } = useGetGridLayout(
  //   moduleId?.toString() || "", // Convert module ID to string
  //   transactionId?.toString() || "", // Convert transaction ID to string
  //   tableName // Table name for settings lookup
  // )
  // //const gridSettings = gridSettings?.data
  // // ============================================================================
  // // STATE MANAGEMENT WITH GRID SETTINGS
  // // ============================================================================
  // // Initialize table state with grid settings if available
  // const getInitialSorting = (): SortingState => {
  //   if (gridSettings?.grdSort) {
  //     try {
  //       return JSON.parse(gridSettings.grdSort) || []
  //     } catch {
  //       return []
  //     }
  //   }
  //   return []
  // }
  // const getInitialColumnVisibility = (): VisibilityState => {
  //   if (gridSettings?.grdColVisible) {
  //     try {
  //       return JSON.parse(gridSettings.grdColVisible) || {}
  //     } catch {
  //       return {}
  //     }
  //   }
  //   return {}
  // }
  // const getInitialColumnSizing = () => {
  //   if (gridSettings?.grdColSize) {
  //     try {
  //       return JSON.parse(gridSettings.grdColSize) || {}
  //     } catch {
  //       return {}
  //     }
  //   }
  //   return {}
  // }