"use client"

import { format } from "date-fns"
import { Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { Document } from "../types"

interface DocumentDetailsProps {
  doc: Document
  onRenew: (id: number) => void
  onAddNote: (id: number, note: string) => void
  onToggleReminder: (id: number) => void
  onToggleEmailNotification: (id: number) => void
}

export function DocumentDetails({
  doc,
  onRenew,
  onAddNote,
  onToggleReminder,
  onToggleEmailNotification,
}: DocumentDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{doc.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="space-y-4">
            <div>
              <h4 className="font-semibold">Description</h4>
              <p className="text-sm text-gray-500">{doc.description}</p>
            </div>
            <div>
              <h4 className="font-semibold">Renewal Process</h4>
              <p className="text-sm text-gray-500">{doc.renewalProcess}</p>
            </div>
            <div>
              <h4 className="font-semibold">Last Renewed</h4>
              <p className="text-sm text-gray-500">
                {format(doc.lastRenewed, "PPP")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Next Expiry</h4>
              <p className="text-sm text-gray-500">
                {format(doc.expiryDate, "PPP")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">Tags</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {doc.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold">Notes</h4>
              <div className="space-y-2">
                {doc.notes.map((note, index) => (
                  <p key={index} className="text-sm text-gray-500">
                    {note}
                  </p>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  onChange={(e) => onAddNote(doc.id, e.target.value)}
                />
                <Button onClick={() => onAddNote(doc.id, "")}>Add</Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold">History</h4>
              <div className="mt-2 space-y-2">
                {doc.history.map((entry, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Clock className="mt-1 h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">
                        {entry.action} - {format(entry.date, "PPP")}
                      </p>
                      <p className="text-sm text-gray-500">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {doc.status !== "valid" && (
              <Button onClick={() => onRenew(doc.id)} className="w-full">
                Mark as Renewed
              </Button>
            )}
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Reminders</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications before document expiry
                </p>
              </div>
              <Switch
                checked={doc.reminderSettings.enabled}
                onCheckedChange={() => onToggleReminder(doc.id)}
              />
            </div>
            <div>
              <Label>Reminder Days</Label>
              <p className="text-sm text-gray-500">
                Notify {doc.reminderSettings.daysBeforeExpiry} days before
                expiry
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Send notifications via email
                </p>
              </div>
              <Switch
                checked={doc.reminderSettings.notifyByEmail}
                onCheckedChange={() => onToggleEmailNotification(doc.id)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
