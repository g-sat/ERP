"use client"

import { GLContraHdSchemaType } from "@/schemas/gl-arapcontra"
import { UseFormReturn } from "react-hook-form"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface OtherProps {
  form: UseFormReturn<GLContraHdSchemaType>
}

export default function Other({ form }: OtherProps) {
  const { control } = form

  return (
    <div className="space-y-6">
      {/* Module Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Module Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="moduleFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module From</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter module source"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="createById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Created By ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Created by user ID"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="createDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Created Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="datetime-local"
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value.split("T")[0]
                          : field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Edit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Edit Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="editVer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edit Version</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Edit version number"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="editVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edit Version Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                      placeholder="Edit version number"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="editById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edited By ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || null)
                      }
                      placeholder="Edited by user ID"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="editDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Edit Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={
                        field.value
                          ? typeof field.value === "string"
                            ? field.value.split("T")[0]
                            : field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(e.target.value)}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Cancellation Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="isCancel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Cancelled</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="cancelById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancelled By ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || null)
                      }
                      placeholder="Cancelled by user ID"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="cancelDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancel Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      value={
                        field.value
                          ? typeof field.value === "string"
                            ? field.value.split("T")[0]
                            : field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(e.target.value)}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="cancelRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancel Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Cancellation remarks"
                      rows={3}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Posting Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Posting Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="isPost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Posted</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="postById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posted By ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || null)
                      }
                      placeholder="Posted by user ID"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="postDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Post Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="datetime-local"
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value.split("T")[0]
                          : field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Approval Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Approval Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="appStatusId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval Status ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || null)
                      }
                      placeholder="Approval status ID"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="appById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approved By ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || null)
                      }
                      placeholder="Approved by user ID"
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="appDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approval Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="datetime-local"
                    value={
                      field.value
                        ? typeof field.value === "string"
                          ? field.value.split("T")[0]
                          : field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
