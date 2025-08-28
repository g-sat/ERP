"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableSkeleton } from "@/components/skeleton/data-table-skeleton"

import { AccountForm } from "./components/account-form"
import { DecimalForm } from "./components/decimal-form"
import { DocumentNoForm } from "./components/documentno-form"
import { DynamicLookupForm } from "./components/dynamiclookup-form"
import { FinanceForm } from "./components/finance-form"
import { GridFormatTable } from "./components/gridformat-table"
import { MandatoryTable } from "./components/mandatory-table"
import { TaskServiceForm } from "./components/task-service-form"
import { VisibleTable } from "./components/visible-table"

export default function SettingsPage() {
  const [isLoadingGrid, setIsLoadingGrid] = useState(false)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [isLoadingDecimal, setIsLoadingDecimal] = useState(false)
  const [isLoadingFinance, setIsLoadingFinance] = useState(false)
  const [isLoadingTaskService, setIsLoadingTaskService] = useState(false)
  const [isLoadingLookup, setIsLoadingLookup] = useState(false)
  const [isLoadingAccount, setIsLoadingAccount] = useState(false)
  const [isLoadingMandatory, setIsLoadingMandatory] = useState(false)
  const [isLoadingVisible, setIsLoadingVisible] = useState(false)

  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage settings for the application
          </p>
        </div>
      </div>
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="grid" className="text-xs sm:text-sm">
            Grid Format
          </TabsTrigger>
          <TabsTrigger value="document" className="text-xs sm:text-sm">
            Document No
          </TabsTrigger>
          <TabsTrigger value="decimal" className="text-xs sm:text-sm">
            Decimal
          </TabsTrigger>
          <TabsTrigger value="finance" className="text-xs sm:text-sm">
            Finance
          </TabsTrigger>
          <TabsTrigger value="task" className="text-xs sm:text-sm">
            TaskService
          </TabsTrigger>
          <TabsTrigger value="lookup" className="text-xs sm:text-sm">
            Dynamic Lookup
          </TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm">
            Account
          </TabsTrigger>
          <TabsTrigger value="mandatory" className="text-xs sm:text-sm">
            Mandatory Fields
          </TabsTrigger>
          <TabsTrigger value="visible" className="text-xs sm:text-sm">
            Visible Fields
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-fluid-lg font-medium">Grid Settings</h3>
            <p className="text-muted-foreground text-fluid-sm">
              Configure grid display and behavior settings
            </p>
            <div className="mt-4">
              {isLoadingGrid ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <GridFormatTable />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="document" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Document No Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure document number settings
            </p>
            <div className="mt-4">
              {isLoadingDocument ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <DocumentNoForm />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decimal" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Decimal Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure decimal settings
            </p>
            <div className="mt-4">
              {isLoadingDecimal ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <DecimalForm />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Finance Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure finance settings
            </p>
            <div className="mt-4">
              {isLoadingFinance ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <FinanceForm />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="task" className="space-y-4">
          <div className="mt-4">
            {isLoadingTaskService ? (
              <DataTableSkeleton
                columnCount={8}
                filterCount={2}
                cellWidths={[
                  "10rem",
                  "30rem",
                  "10rem",
                  "10rem",
                  "10rem",
                  "10rem",
                  "6rem",
                  "6rem",
                ]}
                shrinkZero
              />
            ) : (
              <TaskServiceForm />
            )}
          </div>
        </TabsContent>

        <TabsContent value="lookup" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Dynamic Lookup Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure dynamic lookup settings
            </p>
            <div className="mt-4">
              {isLoadingLookup ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <DynamicLookupForm />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure account settings
            </p>
            <div className="mt-4">
              {isLoadingAccount ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <AccountForm />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mandatory" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Mandatory Fields Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure mandatory fields settings
            </p>
            <div className="mt-4">
              {isLoadingMandatory ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <MandatoryTable />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visible" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium">Visible Fields Settings</h3>
            <p className="text-muted-foreground text-sm">
              Configure visible fields settings
            </p>
            <div className="mt-4">
              {isLoadingVisible ? (
                <DataTableSkeleton
                  columnCount={8}
                  filterCount={2}
                  cellWidths={[
                    "10rem",
                    "30rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "10rem",
                    "6rem",
                    "6rem",
                  ]}
                  shrinkZero
                />
              ) : (
                <VisibleTable />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
