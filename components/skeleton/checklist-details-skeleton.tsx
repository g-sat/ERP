"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChecklistDetailsSkeletonProps {
  tabCount?: number
  rowCount?: number
}

export function ChecklistDetailsSkeleton({
  tabCount = 12,
  rowCount = 6,
}: ChecklistDetailsSkeletonProps) {
  return (
    <div className="@container w-full space-y-2">
      <Tabs defaultValue="port-expenses" className="space-y-2">
        <div className="bg-card rounded-lg border p-3 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="overflow-hidden">
            <TabsList className="flex h-auto w-full flex-wrap gap-1 p-1">
              {Array.from({ length: tabCount }).map((_, index) => (
                <TabsTrigger
                  key={index}
                  value={`tab-${index}`}
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

        <TabsContent value="port-expenses" className="space-y-4">
          <div className="space-y-4">
            {/* Control Bar Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
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
      </Tabs>
    </div>
  )
}
