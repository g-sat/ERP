import { Skeleton } from "@/components/ui/skeleton"

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex h-10 items-center px-4">
            {Array.from({ length: columnCount }).map((_, i) => (
              <Skeleton key={i} className="mx-2 h-4 w-[100px]" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="flex h-12 items-center px-4">
              {Array.from({ length: columnCount }).map((_, j) => (
                <Skeleton key={j} className="mx-2 h-4 w-[100px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
