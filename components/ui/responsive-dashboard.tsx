"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <Card className={`${className || ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-fluid-sm text-sm font-medium">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground h-4 w-4">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-fluid-xl text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground text-fluid-xs text-xs">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center text-xs">
            <span
              className={`${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ResponsiveDashboardProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function ResponsiveDashboard({
  children,
  title,
  description,
  className,
}: ResponsiveDashboardProps) {
  return (
    <div className={`space-y-6 ${className || ""}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h1 className="text-fluid-2xl text-3xl font-bold tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground text-fluid-base">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid-responsive">{children}</div>
    </div>
  )
}

interface DashboardSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function DashboardSection({
  children,
  title,
  description,
  className,
}: DashboardSectionProps) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h2 className="text-fluid-lg text-xl font-semibold">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground text-fluid-sm">{description}</p>
          )}
        </div>
      )}

      <div className="grid-responsive">{children}</div>
    </div>
  )
}

interface DashboardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function DashboardGrid({
  children,
  columns = 4,
  className,
}: DashboardGridProps) {
  const isMobile = useIsMobile()

  const gridCols = isMobile
    ? "grid-cols-1"
    : columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className={`grid gap-4 ${gridCols} ${className || ""}`}>
      {children}
    </div>
  )
}
