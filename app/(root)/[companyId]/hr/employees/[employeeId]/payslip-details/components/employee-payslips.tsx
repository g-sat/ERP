"use client"

import { ChevronDown, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function EmployeePayslips() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Payslips</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Financial Year: 2024
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>2024</DropdownMenuItem>
              <DropdownMenuItem>2023</DropdownMenuItem>
              <DropdownMenuItem>2022</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">PAYMENT DATE</TableHead>
              <TableHead className="w-[200px]">MONTH</TableHead>
              <TableHead>PAYSLIPS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">05 Mar 2024</TableCell>
              <TableCell>February 2024</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">05 Feb 2024</TableCell>
              <TableCell>January 2024</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">05 Jan 2024</TableCell>
              <TableCell>December 2023</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">05 Dec 2023</TableCell>
              <TableCell>November 2023</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">05 Nov 2023</TableCell>
              <TableCell>October 2023</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
