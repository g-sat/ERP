"use client"

import { useState } from "react"
import { IJobOrderHd, ITaskDetails } from "@/interfaces/checklist"
import { useAuthStore } from "@/stores/auth-store"
import { useQueryClient } from "@tanstack/react-query"

import { JobOrder } from "@/lib/api-routes"
import { ModuleId, ProjectTransactionId } from "@/lib/utils"
import { useGetById } from "@/hooks/use-common-v1"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { JobDetailsGrid } from "./checklist-details-job-grid"
import { AgencyRemunerationTab } from "./services-tabs/agency-remuneration-tab"
import { ConsignmentExportTab } from "./services-tabs/consignment-export-tab"
import { ConsignmentImportTab } from "./services-tabs/consignment-import-tab"
import { CrewMiscellaneousTab } from "./services-tabs/crew-miscellaneous-tab"
import { CrewSignOffTab } from "./services-tabs/crew-sign-off-tab"
import { CrewSignOnTab } from "./services-tabs/crew-sign-on-tab"
import { EquipmentUsedTab } from "./services-tabs/equipment-used-tab"
import { FreshWaterTab } from "./services-tabs/fresh-water-tab"
import { LandingItemsTab } from "./services-tabs/landing-items-tab"
import { LaunchServicesTab } from "./services-tabs/launch-services-tab"
import { MedicalAssistanceTab } from "./services-tabs/medical-assistance-tab"
import { OtherServiceTab } from "./services-tabs/other-service-tab"
import { PortExpensesTab } from "./services-tabs/port-expenses-tab"
import { TechniciansSurveyorsTab } from "./services-tabs/technicians-surveyors-tab"
import { ThirdPartyTab } from "./services-tabs/third-party-tab"

interface ChecklistDetailsFormProps {
  jobData: IJobOrderHd
  isConfirmed: boolean
  companyId: string
}

export function ChecklistDetailsForm({
  jobData,
  isConfirmed,
  companyId,
}: ChecklistDetailsFormProps) {
  const { decimals } = useAuthStore()
  const [activeTab, setActiveTab] = useState("port-expenses")
  const queryClient = useQueryClient()

  const moduleId = ModuleId.project
  const transactionId = ProjectTransactionId.job_order

  // Data fetching
  const {
    data: response,
    isLoading,
    refetch,
  } = useGetById<ITaskDetails>(
    `${JobOrder.getTaskCount}`,
    "taskCount",
    companyId,
    `${jobData.jobOrderId || ""}`
  )

  // Handle both array and single object responses
  const rawData = response?.data
  const data = rawData
    ? Array.isArray(rawData)
      ? rawData[0]
      : (rawData as ITaskDetails)
    : undefined

  // Function to refetch task counts
  const refreshTaskCounts = () => {
    queryClient.invalidateQueries({ queryKey: ["taskCount"] })
    refetch()
  }

  // Pass refresh function to all tab components
  const tabProps = {
    jobData,
    moduleId,
    transactionId,
    onTaskAdded: refreshTaskCounts,
    isConfirmed,
    companyId,
  }

  console.log("Task count data:", data)
  return (
    <div className="@container w-full">
      <JobDetailsGrid jobData={jobData} decimals={decimals} />
      <div className="my-2" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="flex h-14 w-max">
            <TabsTrigger
              value="port-expenses"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Port Expenses
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.portExpense && data?.portExpense > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.portExpense || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="launch-services"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Launch Services
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.launchService && data?.launchService > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.launchService || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="equipment-used"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Equipment Used
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.equipmentUsed && data?.equipmentUsed > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.equipmentUsed || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="crew-sign-on"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Crew Sign On
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.crewSignOn && data?.crewSignOn > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.crewSignOn || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="crew-sign-off"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Crew Sign Off
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.crewSignOff && data?.crewSignOff > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.crewSignOff || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="crew-miscellaneous"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Crew Miscellaneous
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.crewMiscellaneous && data?.crewMiscellaneous > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.crewMiscellaneous || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="medical-assistance"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Medical Assistance
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.medicalAssistance && data?.medicalAssistance > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.medicalAssistance || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="consignment-import"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Consignment Import
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.consignmentImport && data?.consignmentImport > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.consignmentImport || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="consignment-export"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Consignment Export
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.consignmentExport && data?.consignmentExport > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.consignmentExport || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="third-party"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Third Party
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.thirdParty && data?.thirdParty > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.thirdParty || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="fresh-water"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Fresh Water
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.freshWater && data?.freshWater > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.freshWater || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="technician-surveyor"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Technician Surveyor
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.technicianSurveyor && data?.technicianSurveyor > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.technicianSurveyor || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="landing-items"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Landing Items
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.landingItems && data?.landingItems > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.landingItems || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="other-service"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Other Service
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.otherService && data?.otherService > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.otherService || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="agency-remuneration"
              className="relative flex items-center space-x-2 px-4 py-2"
            >
              Agency Remuneration
              <Badge
                variant={
                  isLoading
                    ? "secondary"
                    : data?.agencyRemuneration && data?.agencyRemuneration > 0
                      ? "destructive"
                      : "outline"
                }
                className="text-xs font-medium"
              >
                {isLoading ? "..." : data?.agencyRemuneration || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="port-expenses">
          <PortExpensesTab {...tabProps} />
        </TabsContent>

        <TabsContent value="launch-services">
          <LaunchServicesTab {...tabProps} />
        </TabsContent>

        <TabsContent value="equipment-used">
          <EquipmentUsedTab {...tabProps} />
        </TabsContent>

        <TabsContent value="crew-sign-on">
          <CrewSignOnTab {...tabProps} />
        </TabsContent>

        <TabsContent value="crew-sign-off">
          <CrewSignOffTab {...tabProps} />
        </TabsContent>

        <TabsContent value="crew-miscellaneous">
          <CrewMiscellaneousTab {...tabProps} />
        </TabsContent>

        <TabsContent value="medical-assistance">
          <MedicalAssistanceTab {...tabProps} />
        </TabsContent>

        <TabsContent value="consignment-import">
          <ConsignmentImportTab {...tabProps} />
        </TabsContent>

        <TabsContent value="consignment-export">
          <ConsignmentExportTab {...tabProps} />
        </TabsContent>

        <TabsContent value="third-party">
          <ThirdPartyTab {...tabProps} />
        </TabsContent>

        <TabsContent value="fresh-water">
          <FreshWaterTab {...tabProps} />
        </TabsContent>

        <TabsContent value="technician-surveyor">
          <TechniciansSurveyorsTab {...tabProps} />
        </TabsContent>

        <TabsContent value="landing-items">
          <LandingItemsTab {...tabProps} />
        </TabsContent>

        <TabsContent value="other-service">
          <OtherServiceTab {...tabProps} />
        </TabsContent>

        <TabsContent value="agency-remuneration">
          <AgencyRemunerationTab {...tabProps} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
