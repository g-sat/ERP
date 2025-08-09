"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IEmployeeBasic } from "@/interfaces/employee"
import {
  Edit,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  data: IEmployeeBasic[]
  onRefresh?(): void
  onEdit(item: IEmployeeBasic): void
  onDelete(item: IEmployeeBasic): void
  onView(item: IEmployeeBasic): void
}

export function EmployeeListTable({
  data,
  onRefresh,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get search term and highlighted employee from URL params
  const urlSearch = searchParams.get("search") || ""
  const highlightedEmployeeId = searchParams.get("highlight") || ""
  const [search, setSearch] = useState(urlSearch)

  // Update URL when search changes
  const updateSearchParams = (newSearch: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newSearch) {
      params.set("search", newSearch)
    } else {
      params.delete("search")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Sync local state with URL params
  useEffect(() => {
    setSearch(urlSearch)
  }, [urlSearch])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  // Debounced URL update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchParams(search)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, pathname, searchParams])

  // Scroll to highlighted row when page loads
  useEffect(() => {
    if (highlightedEmployeeId) {
      const highlightedRow = document.querySelector(
        `[data-employee-id="${highlightedEmployeeId}"]`
      )
      if (highlightedRow) {
        highlightedRow.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
        // Remove highlight after scrolling
        setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete("highlight")
          router.push(`${pathname}?${params.toString()}`)
        }, 2000)
      }
    }
  }, [highlightedEmployeeId, pathname, searchParams, router])

  // Filter data based on search
  const filtered = data.filter((employee) => {
    const searchTerm = search.toLowerCase()
    return (
      employee.employeeCode?.toLowerCase().includes(searchTerm) ||
      employee.employeeName?.toLowerCase().includes(searchTerm) ||
      employee.departmentName?.toLowerCase().includes(searchTerm) ||
      employee.designationName?.toLowerCase().includes(searchTerm) ||
      employee.phoneNo?.toLowerCase().includes(searchTerm) ||
      employee.offEmailAdd?.toLowerCase().includes(searchTerm)
    )
  })

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="@container space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
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
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`${pathname}/add`)}
            className="h-8 px-2 lg:px-3"
          >
            Add
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((employee) => (
                <TableRow
                  key={employee.employeeId}
                  data-employee-id={employee.employeeId}
                  className={
                    highlightedEmployeeId === employee.employeeId.toString()
                      ? "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : ""
                  }
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(employee.employeeName || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {employee.employeeName} ({employee.employeeCode})
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {employee.companyName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.departmentName || "N/A"}</TableCell>
                  <TableCell>{employee.designationName || "N/A"}</TableCell>
                  <TableCell>{employee.phoneNo || "N/A"}</TableCell>
                  <TableCell>{employee.offEmailAdd || "N/A"}</TableCell>
                  <TableCell>
                    {getStatusBadge(employee.isActive || false)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(employee)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
    </div>
  )
}
