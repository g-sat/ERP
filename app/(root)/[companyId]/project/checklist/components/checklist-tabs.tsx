"use client"

import { useState } from "react"
import { isStatusConfirmed } from "@/helpers/project"
import { IJobOrderHd } from "@/interfaces/checklist"
import { Printer, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ChecklistDetailsForm } from "./checklist-details-form"
import { ChecklistForm } from "./checklist-form"

interface ChecklistTabsProps {
  jobData: IJobOrderHd
  onSuccess?: () => void
  onCancel?: () => void
  isEdit?: boolean
  companyId: string
}

export function ChecklistTabs({
  jobData,
  onSuccess,
  onCancel,
  isEdit = false,
  companyId,
}: ChecklistTabsProps) {
  const [activeTab, setActiveTab] = useState("main")

  const isConfirmed = isStatusConfirmed(jobData.statusName) ? true : false

  console.log(isConfirmed, "isConfirmed checklist")
  const handlePrint = () => {
    /* ... */
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <TabsList className="flex gap-2">
              <TabsTrigger value="main">Main</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <div className="ml-4 flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCcw className="mr-1 h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-1 h-4 w-4" />
                    Print
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrint}>
                    Checklist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    Purchase List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    Account List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    Job Summary
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handlePrint}>
                    Invoice Print
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="main" className="mt-0">
            <ChecklistDetailsForm
              jobData={jobData}
              isConfirmed={isConfirmed}
              companyId={companyId}
            />
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <ChecklistForm
              jobData={jobData}
              onSuccess={onSuccess}
              onCancel={onCancel}
              isEdit={isEdit}
              isConfirmed={isConfirmed}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
