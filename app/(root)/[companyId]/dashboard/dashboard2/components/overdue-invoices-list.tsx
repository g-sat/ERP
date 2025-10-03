"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface OverdueInvoicesListProps {
  agingAsOfDate: Date
  salesperson: string
  customerSegments: string[]
  includeCreditHold: boolean
}

export function OverdueInvoicesList({
  agingAsOfDate,
  salesperson,
  customerSegments,
  includeCreditHold,
}: OverdueInvoicesListProps) {
  const overdueInvoices = [
    {
      id: "INV-001",
      customer: "ABC Corp",
      amount: 15000,
      dueDate: "2024-01-15",
      daysOverdue: 15,
      status: "Overdue",
    },
    {
      id: "INV-002",
      customer: "XYZ Ltd",
      amount: 8500,
      dueDate: "2024-01-20",
      daysOverdue: 10,
      status: "Overdue",
    },
    {
      id: "INV-003",
      customer: "DEF Inc",
      amount: 12000,
      dueDate: "2024-01-25",
      daysOverdue: 5,
      status: "Overdue",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Invoices</CardTitle>
        <CardDescription>
          Invoices past due date as of {agingAsOfDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdueInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.customer}</TableCell>
                <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.daysOverdue > 10 ? "destructive" : "outline"
                    }
                  >
                    {invoice.daysOverdue} days
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">{invoice.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
