"use client"

import { useState } from "react"
import { IPayrollComponent } from "@/interfaces/payroll"
import {
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ComponentType = "Earning" | "Deduction" | "Salary"

interface Props {
  data: IPayrollComponent[]
  onCreate?(): void
  onRefresh?(): void
  onEdit(item: IPayrollComponent): void
  onDelete(item: IPayrollComponent): void
  onView(item: IPayrollComponent): void
}

export function PayrollComponentTable({
  data,
  onCreate,
  onRefresh,
  onEdit,
  onDelete,
  onView,
}: Props) {
  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<ComponentType>("Earning")

  // Filter data based on search and selected type
  const filtered = data.filter((component) => {
    const matchesSearch = [
      component.componentCode,
      component.componentName,
      component.componentType,
    ].some((str) => str?.toLowerCase().includes(search.toLowerCase()))

    let matchesType = false

    if (selectedType === "Salary") {
      matchesType = component.isSalaryComponent === true
    } else {
      matchesType = component.componentType === selectedType
    }

    return matchesSearch && matchesType
  })

  const getTypeBadge = (component: IPayrollComponent) => {
    if (component.componentType === "Earning") {
      return <Badge variant="default">Earning</Badge>
    }
    return <Badge variant="secondary">Deduction</Badge>
  }

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {[
            "Code",
            "Name",
            "Type",
            "Sort Order",
            "Status",
            "Salary Component",
            "",
          ].map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No items
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((component) => (
            <TableRow key={component.payrollComponentId}>
              <TableCell className="font-medium">
                {component.componentCode}
              </TableCell>
              <TableCell>{component.componentName}</TableCell>
              <TableCell>{getTypeBadge(component)}</TableCell>
              <TableCell>{component.sortOrder}</TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 text-xs ${
                    component.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {component.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`rounded-full px-2 text-xs ${
                    component.isSalaryComponent
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {component.isSalaryComponent ? "Yes" : "No"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(component)}>
                      <Eye className="mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(component)}>
                      <Edit className="mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(component)}
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
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search payroll components..."
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
            Add Component
          </Button>
        </div>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(value) => setSelectedType(value as ComponentType)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="Earning">Earnings</TabsTrigger>
          <TabsTrigger value="Deduction">Deductions</TabsTrigger>
          <TabsTrigger
            value="Salary"
            className="bg-blue-500 text-sm text-white"
          >
            Salary Components
          </TabsTrigger>
        </TabsList>
        <TabsContent value={selectedType} className="mt-4">
          {renderTable()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
