"use client"

import { useState } from "react"
import { IPayrollComponent } from "@/interfaces/payroll"
import { Edit, Eye, Plus, RefreshCw, Search, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const getSalaryComponentBadge = (isSalaryComponent: boolean) => {
    return (
      <Badge variant={isSalaryComponent ? "default" : "outline"}>
        {isSalaryComponent ? "Yes" : "No"}
      </Badge>
    )
  }

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-background sticky top-0 z-20">
          <TableRow className="bg-muted/50">
            <TableHead className="bg-muted/50 sticky left-0 z-30 w-[80px] min-w-[60px] text-right">
              Actions
            </TableHead>
            <TableHead className="w-[120px] min-w-[100px]">Code</TableHead>
            <TableHead className="w-[200px] min-w-[180px]">Name</TableHead>
            <TableHead className="w-[100px] min-w-[80px]">Type</TableHead>
            <TableHead className="w-[100px] min-w-[80px]">Sort Order</TableHead>
            <TableHead className="w-[100px] min-w-[80px]">Status</TableHead>
            <TableHead className="w-[120px] min-w-[100px]">
              Salary Component
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-[500px] overflow-y-auto">
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No components found
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((component) => (
              <TableRow key={component.componentId}>
                <TableCell className="bg-background sticky left-0 z-10 w-[80px] min-w-[60px] py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(component)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(component)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(component)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="w-[120px] min-w-[100px] py-2">
                  <span className="text-xs font-medium">
                    {component.componentCode}
                  </span>
                </TableCell>
                <TableCell className="w-[200px] min-w-[180px] py-2 text-xs">
                  {component.componentName}
                </TableCell>
                <TableCell className="w-[100px] min-w-[80px] py-2">
                  {getTypeBadge(component)}
                </TableCell>
                <TableCell className="w-[100px] min-w-[80px] py-2 text-xs">
                  {component.sortOrder}
                </TableCell>
                <TableCell className="w-[100px] min-w-[80px] py-2">
                  {getStatusBadge(component.isActive || false)}
                </TableCell>
                <TableCell className="w-[120px] min-w-[100px] py-2">
                  {getSalaryComponentBadge(
                    component.isSalaryComponent || false
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="@container space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Badge variant="outline">{filtered.length} components</Badge>
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
            Add
          </Button>
        </div>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(value) => setSelectedType(value as ComponentType)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Earning">Earnings</TabsTrigger>
          <TabsTrigger value="Deduction">Deductions</TabsTrigger>
          <TabsTrigger value="Salary">Salary Components</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedType} className="mt-4">
          {renderTable()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
