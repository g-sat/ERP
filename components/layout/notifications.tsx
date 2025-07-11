"use client"

import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative size-8">
          <Bell className="h-5 w-5" />
          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <div className="font-medium">New message received</div>
          <div className="text-muted-foreground text-sm">
            You have received a new message from John Doe
          </div>
          <div className="text-muted-foreground text-xs">2 minutes ago</div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <div className="font-medium">Task completed</div>
          <div className="text-muted-foreground text-sm">
            Project X has been completed successfully
          </div>
          <div className="text-muted-foreground text-xs">1 hour ago</div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <div className="font-medium">System update</div>
          <div className="text-muted-foreground text-sm">
            System maintenance scheduled for tomorrow
          </div>
          <div className="text-muted-foreground text-xs">3 hours ago</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
