"use client"

import { useState } from "react"
import { IWorkLocation } from "@/interfaces/worklocation"
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Props {
  data: IWorkLocation[]
  onCreate?(): void
  onRefresh?(): void
  onEdit(item: IWorkLocation): void
  onDelete(item: IWorkLocation): void
  onView(item: IWorkLocation): void
}

export function WorkLocationTable({
  data,
  onCreate,
  onRefresh,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const [search, setSearch] = useState("")

  const filtered = data.filter((loc) =>
    [loc.workLocationName, loc.workLocationCode, loc.city].some((str) =>
      str?.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search work locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 px-2 lg:px-3"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={onCreate} className="h-8 px-2 lg:px-3">
            <Plus className="mr-2 h-4 w-4" />
            Add Work Location
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {[
              "Code",
              "Name",
              "Address1",
              "Address2",
              "City",
              "Country",
              "Status",
              "",
            ].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No items
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((loc) => (
              <TableRow key={loc.workLocationId}>
                <TableCell className="py-1 text-xs">
                  {loc.workLocationCode}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {loc.workLocationName}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {loc.address1 || "—"}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {loc.address2 || "—"}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {loc.city || "—"}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {loc.countryName || "—"}
                </TableCell>
                <TableCell className="py-1">
                  <span
                    className={`rounded-full px-2 text-xs ${loc.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {loc.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="py-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(loc)}>
                        <Eye className="mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(loc)}>
                        <Edit className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete(loc)}
                      >
                        <Trash2 className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
