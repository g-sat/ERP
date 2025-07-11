"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Sample data - replace with your actual data fetching logic
const groupRights = [
  {
    id: "1",
    group: "Administrators",
    module: "Users",
    permissions: {
      view: true,
      create: true,
      edit: true,
      delete: true,
    },
  },
  {
    id: "2",
    group: "Users",
    module: "Reports",
    permissions: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
  },
]

export function UserGroupReportRightsTable({
  companyId,
}: {
  companyId: string
}) {
  return (
    <div className="rounded-md border">
      <div className="max-h-[460px] overflow-auto">
        <div className="relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Create</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupRights.map((right) => (
                <TableRow key={right.id}>
                  <TableCell>{right.group}</TableCell>
                  <TableCell>{right.module}</TableCell>
                  <TableCell>
                    <Checkbox checked={right.permissions.view} />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={right.permissions.create} />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={right.permissions.edit} />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={right.permissions.delete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
