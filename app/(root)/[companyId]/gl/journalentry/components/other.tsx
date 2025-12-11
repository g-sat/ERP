"use client"

import { useParams } from "next/navigation"
import { IVisibleFields } from "@/interfaces/setting"
import { GLJournalHdSchemaType } from "@/schemas"
import { UseFormReturn, useWatch } from "react-hook-form"

import { GLTransactionId, ModuleId } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import CustomCheckbox from "@/components/custom/custom-checkbox"
import { CustomDateNew } from "@/components/custom/custom-date-new"
import DocumentManager from "@/components/document-manager"

interface OtherProps {
  form: UseFormReturn<GLJournalHdSchemaType>
  visible?: IVisibleFields
}

export default function Other({ form }: OtherProps) {
  const params = useParams()
  const companyId = params.companyId as string

  const journalId = form.getValues("journalId") || "0"
  const journalNo = form.getValues("journalNo") || ""

  // Watch checkbox values to conditionally show date fields
  const isReverse = useWatch({
    control: form.control,
    name: "isReverse",
    defaultValue: false,
  })

  const isRecurrency = useWatch({
    control: form.control,
    name: "isRecurrency",
    defaultValue: false,
  })

  return (
    <div className="space-y-4">
      <Form {...form}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Reverse Entry Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Reverse Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <CustomCheckbox
                    form={form}
                    name="isReverse"
                    label="Is Reverse Entry"
                    isRequired={false}
                  />
                </div>

                {isReverse && (
                  <div className="animate-in fade-in slide-in-from-left-2 flex-1">
                    <CustomDateNew
                      form={form}
                      name="revDate"
                      label="Reverse Date"
                      isRequired={true}
                      isFutureShow={false}
                    />
                  </div>
                )}
              </div>

              {!isReverse && (
                <p className="text-muted-foreground text-xs">
                  Enable reverse entry to set a reverse date
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recurrency Entry Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Recurrency Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <CustomCheckbox
                    form={form}
                    name="isRecurrency"
                    label="Is Recurrency Entry"
                    isRequired={false}
                  />
                </div>

                {isRecurrency && (
                  <div className="animate-in fade-in slide-in-from-left-2 flex-1">
                    <CustomDateNew
                      form={form}
                      name="recurrenceUntilDate"
                      label="Recurrence Until Date"
                      isRequired={true}
                      isFutureShow={false}
                    />
                  </div>
                )}
              </div>

              {!isRecurrency && (
                <p className="text-muted-foreground text-xs">
                  Enable recurrency entry to set recurrence until date
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </Form>

      {/* Document Upload Section - Only show after journal is saved */}
      {journalId !== "0" && (
        <DocumentManager
          moduleId={ModuleId.gl}
          transactionId={GLTransactionId.journalentry}
          recordId={journalId}
          recordNo={journalNo}
          companyId={Number(companyId)}
          maxFileSize={10}
          maxFiles={10}
        />
      )}
    </div>
  )
}
