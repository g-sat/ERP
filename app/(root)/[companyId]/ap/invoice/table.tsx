// app/users/page.tsx   (or any route / component)
"use client";

import { TableContainer, Column, Action } from "@/components/table/Table";
import { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  FileText,
} from "lucide-react";

/* --------------------------------------------------------------- */
/* 1. Define your row type                                         */
/* --------------------------------------------------------------- */
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: "active" | "inactive";
  remarks?: string;
  debitNoteId?: number;
}

/* --------------------------------------------------------------- */
/* 2. Sample data (you can replace with API fetch)                */
/* --------------------------------------------------------------- */
const initialData: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 28,
    status: "active",
    remarks: "VIP customer",
    debitNoteId: 101,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    age: 34,
    status: "inactive",
    remarks: "",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 45,
    status: "active",
    remarks: "Needs follow-up",
    debitNoteId: 102,
  },
];

/* --------------------------------------------------------------- */
/* 3. Define columns (type-safe)                                   */
/* --------------------------------------------------------------- */
const columns: Column<User>[] = [
  { accessorKey: "id", header: "ID", size: 60, sortable: true },
  { accessorKey: "name", header: "Name", sortable: true },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "age",
    header: "Age",
    sortable: true,
    editable: true,               // inline edit
    align: "center",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as User["status"];
      const color = status === "active" ? "text-green-600" : "text-red-600";
      return <span className={`font-medium ${color}`}>{status}</span>;
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    editable: true,               // inline edit
  },
];

/* --------------------------------------------------------------- */
/* 4. Define row actions                                           */
/* --------------------------------------------------------------- */
const actions: Action<User>[] = [
  {
    label: "View",
    icon: <Eye className="h-4 w-4" />,
    onClick: (row) => alert(`View ${row.name}`),
  },
  {
    label: "Edit",
    icon: <Edit className="h-4 w-4" />,
    onClick: (row) => alert(`Edit ${row.id}`),
  },
  {
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive",
    onClick: (row) => confirm(`Delete ${row.name}?`) && console.log("deleted", row.id),
  },
  {
    label: "Purchase",
    icon: <ShoppingCart className="h-4 w-4" />,
    onClick: (row) => alert(`Purchase for ${row.name}`),
  },
  {
    label: "Debit Note",
    icon: <FileText className="h-4 w-4" />,
    isVisible: (row) => !!row.debitNoteId,
    onClick: (row) => alert(`Debit Note #${row.debitNoteId}`),
  },
];

/* --------------------------------------------------------------- */
/* 5. Page component                                               */
/* --------------------------------------------------------------- */
export default function UsersPage() {
  const [data, setData] = useState<User[]>(initialData);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Users Table</h1>

      <TableContainer<User>
        columns={columns}
        data={data}
        actions={actions}
        onDataUpdate={setData}          // receives edited rows
        onRowReorder={setData}          // receives reordered rows
        settings={{
          pageSize: 5,
          showPagination: true,
          enableRowSelection: true,
          enableSorting: true,
          enableColumnFilters: true,
          enableColumnResizing: true,
          enableColumnVisibility: true,
          enableRowReorder: true,
          enableColumnReorder: true,
          globalFilterPlaceholder: "Search users…",
        }}
        className="max-w-5xl mx-auto"
      />
    </div>
  );
}