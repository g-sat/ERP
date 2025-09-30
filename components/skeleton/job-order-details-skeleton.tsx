"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JobOrderDetailsSkeletonProps {
  rowCount?: number
}

export function JobOrderDetailsSkeleton({
  rowCount = 6,
}: JobOrderDetailsSkeletonProps) {
  return (
    <div className="container mx-auto space-y-2 px-4 pt-2 pb-4 sm:space-y-3 sm:px-6 sm:pt-3 sm:pb-6">
      {/* Header Section Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
                Job Order Details
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-4">
        {/* Navigation Tabs Skeleton */}
        <Tabs defaultValue="main" className="space-y-2">
          <TabsList>
            <TabsTrigger
              value="main"
              className="relative flex flex-col items-center space-y-1 px-3 py-2 text-xs sm:flex-row sm:space-y-0 sm:space-x-2 sm:px-4 sm:text-sm"
            >
              <div className="flex items-center gap-1">
                <span className="text-xs">📋</span>
                <span className="text-xs sm:text-sm">Main</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="relative flex flex-col items-center space-y-1 px-3 py-2 text-xs sm:flex-row sm:space-y-0 sm:space-x-2 sm:px-4 sm:text-sm"
            >
              <div className="flex items-center gap-1">
                <span className="text-xs">📊</span>
                <span className="text-xs sm:text-sm">Details</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="relative flex flex-col items-center space-y-1 px-3 py-2 text-xs sm:flex-row sm:space-y-0 sm:space-x-2 sm:px-4 sm:text-sm"
            >
              <div className="flex items-center gap-1">
                <span className="text-xs">🕒</span>
                <span className="text-xs sm:text-sm">History</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Skeleton */}
          <TabsContent value="main" className="space-y-4">
            <div className="space-y-4">
              {/* Main Content - Side by Side Layout */}
              <div className="flex gap-4">
                {/* Operation Card - 75% */}
                <div className="w-[75%] rounded-lg border p-4">
                  <div className="mb-2 flex">
                    <div className="rounded-md border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm transition-colors duration-200 hover:bg-blue-200">
                      🔧 Operation
                    </div>
                  </div>
                  <div className="mb-4 border-b border-gray-200"></div>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 24 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accounts Card - 25% */}
                <div className="w-[25%] rounded-lg border p-4">
                  <div className="mb-2 flex">
                    <div className="rounded-md border-green-300 bg-green-100 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm transition-colors duration-200 hover:bg-green-200">
                      💰 Accounts
                    </div>
                  </div>
                  <div className="mb-4 border-b border-gray-200"></div>
                  <div className="grid grid-cols-1 gap-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Details Tab Content Skeleton */}
          <TabsContent value="details" className="space-y-4">
            <div className="space-y-4">
              {/* Service Categories Skeleton */}
              <div className="bg-card rounded-lg border p-3 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="overflow-hidden">
                  <TabsList className="flex h-auto w-full flex-wrap gap-1 p-1">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <TabsTrigger
                        key={index}
                        value={`service-tab-${index}`}
                        className="relative flex flex-col items-center space-y-1 px-3 py-2 text-xs sm:flex-row sm:space-y-0 sm:space-x-2 sm:px-4 sm:text-sm"
                      >
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-16 sm:w-20" />
                        </div>
                        <Skeleton className="h-5 w-6 rounded-full" />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              {/* Data Table Skeleton */}
              <div className="rounded-md border">
                <div className="overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 w-16 px-2">
                          <Skeleton className="h-4 w-4" />
                        </th>
                        <th className="h-12 w-24 px-2">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="h-12 w-32 px-2">
                          <Skeleton className="h-4 w-24" />
                        </th>
                        <th className="h-12 w-40 px-2">
                          <Skeleton className="h-4 w-32" />
                        </th>
                        <th className="h-12 w-16 px-2">
                          <Skeleton className="h-4 w-8" />
                        </th>
                        <th className="h-12 w-16 px-2">
                          <Skeleton className="h-4 w-8" />
                        </th>
                        <th className="h-12 w-20 px-2">
                          <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="h-12 w-24 px-2">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="h-12 w-20 px-2">
                          <Skeleton className="h-4 w-12" />
                        </th>
                        <th className="h-12 w-12 px-2">
                          <Skeleton className="h-4 w-6" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: rowCount }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          <td className="px-2 py-3">
                            <div className="flex items-center gap-1">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-4" />
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-8" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-8" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-5 w-12 rounded-full" />
                          </td>
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-6" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* History Tab Content Skeleton */}
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-card rounded-lg border p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 border-b pb-3"
                    >
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
