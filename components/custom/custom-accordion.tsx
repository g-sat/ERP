"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

export default function CustomAccordion({
  type = "single",
  collapsible = true,
  className,
  children,
  ...props
}: {
  type?: "single" | "multiple"
  collapsible?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Root
      type={type}
      collapsible={collapsible}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  )
}

export function CustomAccordionItem({
  value,
  className,
  children,
  ...props
}: {
  value: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className={cn("border-b", className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  )
}

export function CustomAccordionTrigger({
  className,
  children,
  icon,
  iconClassName,
  ...props
}: {
  className?: string
  children: React.ReactNode
  icon?: React.ReactNode
  iconClassName?: string
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {icon || (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              iconClassName
            )}
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function CustomAccordionContent({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all",
        className
      )}
      {...props}
    >
      <div className="pt-0 pb-4">{children}</div>
    </AccordionPrimitive.Content>
  )
}
