# ERP System - Missing Features and Future Enhancements

**Document Version:** 1.0  
**Last Updated:** October 17, 2025  
**Status:** Planning & Implementation Roadmap

---

## Table of Contents

1. [Critical Missing Features](#1-critical-missing-features)
2. [High Priority Enhancements](#2-high-priority-enhancements)
3. [Medium Priority Features](#3-medium-priority-features)
4. [Low Priority / Nice-to-Have](#4-low-priority--nice-to-have)
5. [Performance Optimizations](#5-performance-optimizations)
6. [Security Enhancements](#6-security-enhancements)
7. [User Experience Improvements](#7-user-experience-improvements)
8. [Integration Requirements](#8-integration-requirements)
9. [Reporting & Analytics](#9-reporting--analytics)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. CRITICAL MISSING FEATURES

### 1.1 Draft Document Status Management

**Current State:**

- System has `isPost` boolean field in AP, AR, CB, GL modules
- No explicit draft status tracking
- Users cannot save work-in-progress without posting to GL

**Problem:**

- Users lose data if they need to stop mid-entry
- No way to review documents before posting
- Risk of incorrect postings to General Ledger
- Workflow approval cannot happen on draft documents

**Required Implementation:**

#### Database Changes:

```sql
-- Add to all transaction header tables
ALTER TABLE AP_InvoiceHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE AR_InvoiceHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE CB_GenPaymentHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE CB_GenReceiptHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE CB_BatchPaymentHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE CB_PettyCashHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE GL_JournalHd ADD isDraft BIT DEFAULT 1;
ALTER TABLE GL_ARAPContraHd ADD isDraft BIT DEFAULT 1;

-- Add status field (optional but recommended)
ALTER TABLE AP_InvoiceHd ADD statusId INT DEFAULT 1501; -- 1501=Draft
-- Status lookup values:
-- 1501 = Draft
-- 1502 = Posted
-- 1503 = Approved
-- 1504 = Rejected
-- 1505 = Cancelled
```

#### Interface Changes:

```typescript
// interfaces/ap-invoice.ts (and similar for all modules)
export interface IApInvoiceHd {
  // ... existing fields
  isDraft: boolean
  statusId: number
  statusName?: string
  isPost: boolean // Keep for backward compatibility
  postById: null | number
  postDate: null | Date
}

// Add status constants
export const DOCUMENT_STATUS = {
  DRAFT: 1501,
  POSTED: 1502,
  APPROVED: 1503,
  REJECTED: 1504,
  CANCELLED: 1505,
} as const
```

#### UI Changes:

1. **Save Button:**
   - "Save as Draft" (Green) - Saves without posting
   - "Save & Post" (Blue) - Saves and posts to GL

2. **Status Badge:**
   - Display status badge in list view and detail view
   - Color coding: Draft (Gray), Posted (Green), Approved (Blue)

3. **Filtering:**
   - Add "Status" filter in all transaction lists
   - Quick filters: "Show Drafts", "Show Posted", "Show All"

4. **Validation:**
   - Draft: Allow saving with minimal validation
   - Post: Full validation required (all mandatory fields)

#### Workflow Logic:

```typescript
// Draft Flow
1. User creates document → isDraft = true, statusId = 1501
2. User clicks "Save as Draft" → Data saved, no GL impact
3. User returns later → Can continue editing
4. User clicks "Post" → isDraft = false, statusId = 1502, GL entries created

// With Approval
1. Draft → Submit for Approval → statusId = 1502 (Pending Approval)
2. Approved → statusId = 1503, Post to GL
3. Rejected → statusId = 1504, back to draft
```

#### Benefits:

- ✅ Prevent data loss
- ✅ Enable multi-step data entry
- ✅ Allow review before posting
- ✅ Support approval workflows
- ✅ Audit trail of document lifecycle

---

### 1.2 Email Notification System

**Current State:**

- WhatsApp integration: ✅ Complete
- Email notifications: ❌ Missing
- Only `mailto:` links (opens email client)

**Problem:**

- Cannot send automated emails from system
- No approval notifications via email
- No invoice/payment notifications to customers/suppliers
- No overdue reminders

**Required Implementation:**

#### Email Service Setup:

```typescript
// lib/email-service.ts
import nodemailer from "nodemailer"

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path: string
  }>
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport(config)
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error("Email send error:", error)
      return false
    }
  }

  async sendInvoiceEmail(
    invoiceId: string,
    customerEmail: string,
    pdfPath: string
  ): Promise<boolean> {
    const subject = `Invoice ${invoiceId}`
    const html = `
      <h2>Invoice Notification</h2>
      <p>Dear Customer,</p>
      <p>Please find attached invoice ${invoiceId} for your reference.</p>
      <p>Thank you for your business.</p>
    `

    return this.sendEmail({
      to: customerEmail,
      subject,
      html,
      attachments: [{ filename: `invoice-${invoiceId}.pdf`, path: pdfPath }],
    })
  }

  async sendApprovalNotification(
    approverEmail: string,
    documentType: string,
    documentNo: string,
    approvalLink: string
  ): Promise<boolean> {
    const subject = `Approval Required: ${documentType} ${documentNo}`
    const html = `
      <h2>Approval Request</h2>
      <p>A ${documentType} requires your approval.</p>
      <p><strong>Document Number:</strong> ${documentNo}</p>
      <p><a href="${approvalLink}">Click here to review and approve</a></p>
    `

    return this.sendEmail({
      to: approverEmail,
      subject,
      html,
    })
  }

  async sendPaymentReminder(
    customerEmail: string,
    invoiceNo: string,
    dueDate: Date,
    amount: number,
    daysOverdue: number
  ): Promise<boolean> {
    const subject =
      daysOverdue > 0
        ? `Payment Overdue: Invoice ${invoiceNo}`
        : `Payment Reminder: Invoice ${invoiceNo}`

    const html = `
      <h2>Payment ${daysOverdue > 0 ? "Overdue" : "Reminder"}</h2>
      <p>Dear Customer,</p>
      <p>This is a ${daysOverdue > 0 ? "friendly reminder that your payment is overdue" : "reminder about your upcoming payment"}.</p>
      <ul>
        <li><strong>Invoice Number:</strong> ${invoiceNo}</li>
        <li><strong>Amount:</strong> $${amount.toFixed(2)}</li>
        <li><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</li>
        ${daysOverdue > 0 ? `<li><strong>Days Overdue:</strong> ${daysOverdue}</li>` : ""}
      </ul>
      <p>Please process the payment at your earliest convenience.</p>
    `

    return this.sendEmail({
      to: customerEmail,
      subject,
      html,
    })
  }
}

export const emailService = new EmailService({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
})
```

#### API Endpoint:

```typescript
// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server"

import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    let result = false

    switch (type) {
      case "invoice":
        result = await emailService.sendInvoiceEmail(
          data.invoiceId,
          to,
          data.pdfPath
        )
        break

      case "approval":
        result = await emailService.sendApprovalNotification(
          to,
          data.documentType,
          data.documentNo,
          data.approvalLink
        )
        break

      case "payment-reminder":
        result = await emailService.sendPaymentReminder(
          to,
          data.invoiceNo,
          new Date(data.dueDate),
          data.amount,
          data.daysOverdue
        )
        break

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        )
    }

    if (result) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

#### Email Templates:

Create reusable email templates in `lib/email-templates/`:

- invoice-notification.html
- approval-request.html
- payment-reminder.html
- overdue-notice.html
- approval-approved.html
- approval-rejected.html

#### Scheduled Email Jobs:

```typescript
// lib/email-scheduler.ts
// Run daily to send payment reminders

export async function sendDailyPaymentReminders() {
  // Get all overdue invoices
  const overdueInvoices = await getOverdueInvoices()

  for (const invoice of overdueInvoices) {
    if (invoice.customerEmail) {
      await emailService.sendPaymentReminder(
        invoice.customerEmail,
        invoice.invoiceNo,
        invoice.dueDate,
        invoice.balanceAmount,
        invoice.daysOverdue
      )
    }
  }
}

// Setup cron job
// 0 9 * * * - Every day at 9 AM
```

#### Environment Variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com
```

#### Benefits:

- ✅ Automated invoice delivery
- ✅ Approval notifications
- ✅ Payment reminders
- ✅ Overdue alerts
- ✅ Professional communication

---

### 1.3 Data Import from Excel/CSV

**Current State:**

- Export to Excel: ✅ Available
- Import from Excel: ❌ Missing
- Manual data entry only

**Problem:**

- Tedious manual entry for bulk data
- High error rate in manual entry
- Time-consuming for migration
- Cannot import from other systems

**Required Implementation:**

#### Database Tables:

```sql
-- Import history tracking
CREATE TABLE DataImportLog (
  importId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  moduleId INT NOT NULL,
  transactionId INT,
  fileName NVARCHAR(255),
  totalRows INT,
  successRows INT,
  failedRows INT,
  status NVARCHAR(50), -- 'Processing', 'Completed', 'Failed'
  startTime DATETIME,
  endTime DATETIME,
  importedBy INT,
  errorLog NVARCHAR(MAX),
  createdDate DATETIME DEFAULT GETDATE()
)

-- Import error details
CREATE TABLE DataImportError (
  errorId INT PRIMARY KEY IDENTITY,
  importId INT FOREIGN KEY REFERENCES DataImportLog(importId),
  rowNumber INT,
  fieldName NVARCHAR(100),
  errorMessage NVARCHAR(500),
  rowData NVARCHAR(MAX)
)
```

#### Interface:

```typescript
// interfaces/import.ts
export interface IImportLog {
  importId: number
  companyId: number
  moduleId: number
  transactionId?: number
  fileName: string
  totalRows: number
  successRows: number
  failedRows: number
  status: "Processing" | "Completed" | "Failed" | "PartialSuccess"
  startTime: Date
  endTime?: Date
  importedBy: number
  errorLog?: string
}

export interface IImportError {
  errorId: number
  importId: number
  rowNumber: number
  fieldName: string
  errorMessage: string
  rowData: string
}

export interface IImportTemplate {
  templateId: number
  templateName: string
  moduleId: number
  transactionId?: number
  columnMapping: IColumnMapping[]
  validationRules: IValidationRule[]
}

export interface IColumnMapping {
  excelColumn: string // "A", "B", "C"
  excelHeader: string // "Customer Code"
  fieldName: string // "customerCode"
  dataType: string // "string", "number", "date"
  required: boolean
  defaultValue?: any
}

export interface IValidationRule {
  fieldName: string
  rule: "required" | "unique" | "regex" | "lookup" | "range"
  params?: any
  errorMessage: string
}
```

#### Import Service:

```typescript
// lib/import-service.ts
import * as XLSX from "xlsx"

class ImportService {
  async parseExcelFile(file: File): Promise<any[]> {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)
    return data
  }

  async validateRow(
    row: any,
    template: IImportTemplate,
    rowNumber: number
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Check required fields
    for (const mapping of template.columnMapping) {
      if (mapping.required && !row[mapping.excelHeader]) {
        errors.push(`Row ${rowNumber}: ${mapping.excelHeader} is required`)
      }
    }

    // Check data types
    for (const mapping of template.columnMapping) {
      const value = row[mapping.excelHeader]
      if (value && mapping.dataType === "number" && isNaN(Number(value))) {
        errors.push(`Row ${rowNumber}: ${mapping.excelHeader} must be a number`)
      }
    }

    // Custom validation rules
    for (const rule of template.validationRules) {
      const fieldValue = row[rule.fieldName]

      switch (rule.rule) {
        case "unique":
          // Check uniqueness in database
          const exists = await this.checkUniqueness(rule.fieldName, fieldValue)
          if (exists) {
            errors.push(`Row ${rowNumber}: ${rule.errorMessage}`)
          }
          break

        case "lookup":
          // Check if value exists in lookup table
          const valid = await this.checkLookup(
            rule.params.table,
            rule.params.field,
            fieldValue
          )
          if (!valid) {
            errors.push(`Row ${rowNumber}: ${rule.errorMessage}`)
          }
          break

        case "regex":
          const regex = new RegExp(rule.params.pattern)
          if (!regex.test(fieldValue)) {
            errors.push(`Row ${rowNumber}: ${rule.errorMessage}`)
          }
          break
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  async importData(
    file: File,
    template: IImportTemplate,
    companyId: number,
    userId: number
  ): Promise<IImportLog> {
    const startTime = new Date()
    let totalRows = 0
    let successRows = 0
    let failedRows = 0
    const allErrors: IImportError[] = []

    // Create import log
    const importLog: IImportLog = {
      importId: 0, // Will be set by database
      companyId,
      moduleId: template.moduleId,
      transactionId: template.transactionId,
      fileName: file.name,
      totalRows: 0,
      successRows: 0,
      failedRows: 0,
      status: "Processing",
      startTime,
      importedBy: userId,
    }

    try {
      // Parse Excel
      const rows = await this.parseExcelFile(file)
      totalRows = rows.length

      // Validate and import each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const validation = await this.validateRow(row, template, i + 2) // +2 for header row

        if (validation.valid) {
          // Transform and save data
          const transformedData = this.transformRow(row, template)
          const saved = await this.saveRecord(transformedData, template)

          if (saved) {
            successRows++
          } else {
            failedRows++
            allErrors.push({
              errorId: 0,
              importId: importLog.importId,
              rowNumber: i + 2,
              fieldName: "",
              errorMessage: "Failed to save record",
              rowData: JSON.stringify(row),
            })
          }
        } else {
          failedRows++
          validation.errors.forEach((error) => {
            allErrors.push({
              errorId: 0,
              importId: importLog.importId,
              rowNumber: i + 2,
              fieldName: "",
              errorMessage: error,
              rowData: JSON.stringify(row),
            })
          })
        }
      }

      // Update import log
      importLog.totalRows = totalRows
      importLog.successRows = successRows
      importLog.failedRows = failedRows
      importLog.endTime = new Date()
      importLog.status = failedRows === 0 ? "Completed" : "PartialSuccess"

      return importLog
    } catch (error) {
      importLog.status = "Failed"
      importLog.endTime = new Date()
      importLog.errorLog = error.message
      return importLog
    }
  }

  private transformRow(row: any, template: IImportTemplate): any {
    const transformed: any = {}

    for (const mapping of template.columnMapping) {
      let value = row[mapping.excelHeader]

      // Apply default value if empty
      if (!value && mapping.defaultValue !== undefined) {
        value = mapping.defaultValue
      }

      // Convert data type
      if (value) {
        switch (mapping.dataType) {
          case "number":
            value = Number(value)
            break
          case "date":
            value = new Date(value)
            break
          case "boolean":
            value = value.toString().toLowerCase() === "true"
            break
        }
      }

      transformed[mapping.fieldName] = value
    }

    return transformed
  }

  private async saveRecord(
    data: any,
    template: IImportTemplate
  ): Promise<boolean> {
    try {
      // Call appropriate API based on module and transaction
      const apiUrl = this.getApiUrl(template.moduleId, template.transactionId)
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error("Save record error:", error)
      return false
    }
  }

  async downloadTemplate(template: IImportTemplate): Promise<Blob> {
    // Create Excel with headers
    const headers = template.columnMapping.map((m) => m.excelHeader)
    const worksheet = XLSX.utils.aoa_to_sheet([headers])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    return new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  }
}

export const importService = new ImportService()
```

#### UI Component:

```typescript
// components/import/data-import-dialog.tsx
export function DataImportDialog({ moduleId, transactionId }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [template, setTemplate] = useState<IImportTemplate | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<IImportLog | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file || !template) return

    setImporting(true)
    try {
      const result = await importService.importData(
        file,
        template,
        companyId,
        userId
      )
      setResult(result)
      toast.success(
        `Import completed: ${result.successRows} success, ${result.failedRows} failed`
      )
    } catch (error) {
      toast.error('Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    if (!template) return

    const blob = await importService.downloadTemplate(template)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.templateName}.xlsx`
    a.click()
  }

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label>Import Template</Label>
            <Select
              value={template?.templateId.toString()}
              onValueChange={(value) => {
                // Load template
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {/* Template options */}
              </SelectContent>
            </Select>
          </div>

          {/* Download Template */}
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={!template}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>

          {/* File Upload */}
          <div>
            <Label>Excel File</Label>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={!file || !template || importing}
          >
            {importing ? 'Importing...' : 'Import'}
          </Button>

          {/* Results */}
          {result && (
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">Import Results</h4>
              <div className="mt-2 space-y-1 text-sm">
                <p>Total Rows: {result.totalRows}</p>
                <p className="text-green-600">
                  Success: {result.successRows}
                </p>
                <p className="text-red-600">
                  Failed: {result.failedRows}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### Pre-defined Templates:

**1. Customer Import Template**

- Customer Code (required)
- Customer Name (required)
- Credit Term
- Currency
- Tax ID
- Address 1
- Contact Name
- Phone Number
- Email Address

**2. Supplier Import Template**

- Supplier Code (required)
- Supplier Name (required)
- Credit Term
- Currency
- Tax ID
- Address 1
- Contact Name
- Phone Number
- Email Address

**3. Product Import Template**

- Product Code (required)
- Product Name (required)
- Category
- UOM
- Unit Price
- GL Account

**4. Chart of Accounts Import Template**

- Account Code (required)
- Account Name (required)
- Account Type
- Account Group
- Currency

**5. Opening Balance Import Template**

- Account Code (required)
- Debit Amount
- Credit Amount
- Transaction Date

#### Benefits:

- ✅ Bulk data entry
- ✅ Reduced errors
- ✅ Faster migration
- ✅ Import from other systems
- ✅ Template-based validation

---

### 1.4 Two-Factor Authentication (2FA)

**Current State:**

- Username/Password login: ✅ Yes
- Session management: ✅ Yes
- 2FA: ❌ Missing

**Problem:**

- Weak security with password only
- Risk of unauthorized access
- No additional verification layer
- Compliance requirements not met

**Required Implementation:**

#### Database Changes:

```sql
-- Add to User table
ALTER TABLE M_User ADD
  twoFactorEnabled BIT DEFAULT 0,
  twoFactorSecret NVARCHAR(255),
  backupCodes NVARCHAR(MAX), -- JSON array of backup codes
  twoFactorMethod NVARCHAR(50); -- 'SMS', 'EMAIL', 'AUTHENTICATOR'

-- OTP storage table
CREATE TABLE UserOTP (
  otpId INT PRIMARY KEY IDENTITY,
  userId INT FOREIGN KEY REFERENCES M_User(userId),
  otpCode NVARCHAR(10),
  purpose NVARCHAR(50), -- 'LOGIN', 'PASSWORD_RESET', '2FA_SETUP'
  expiryTime DATETIME,
  isUsed BIT DEFAULT 0,
  createdDate DATETIME DEFAULT GETDATE()
)

-- Trusted devices
CREATE TABLE TrustedDevice (
  deviceId INT PRIMARY KEY IDENTITY,
  userId INT FOREIGN KEY REFERENCES M_User(userId),
  deviceFingerprint NVARCHAR(255),
  deviceName NVARCHAR(255),
  ipAddress NVARCHAR(50),
  lastUsed DATETIME,
  expiryDate DATETIME,
  isActive BIT DEFAULT 1,
  createdDate DATETIME DEFAULT GETDATE()
)
```

#### Interface:

```typescript
// interfaces/auth.ts (add to existing)
export interface IUser {
  // ... existing fields
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  backupCodes?: string[]
  twoFactorMethod?: "SMS" | "EMAIL" | "AUTHENTICATOR"
}

export interface IOTP {
  otpId: number
  userId: number
  otpCode: string
  purpose: "LOGIN" | "PASSWORD_RESET" | "2FA_SETUP"
  expiryTime: Date
  isUsed: boolean
  createdDate: Date
}

export interface ITrustedDevice {
  deviceId: number
  userId: number
  deviceFingerprint: string
  deviceName: string
  ipAddress: string
  lastUsed: Date
  expiryDate: Date
  isActive: boolean
}
```

#### 2FA Service:

```typescript
// lib/two-factor-service.ts

import * as QRCode from "qrcode"
import * as speakeasy from "speakeasy"

class TwoFactorService {
  // Generate secret for authenticator app
  generateSecret(username: string): {
    secret: string
    otpauthUrl: string
  } {
    const secret = speakeasy.generateSecret({
      name: `ERP System (${username})`,
      issuer: "Your Company",
    })

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url!,
    }
  }

  // Generate QR code for authenticator app
  async generateQRCode(otpauthUrl: string): Promise<string> {
    return await QRCode.toDataURL(otpauthUrl)
  }

  // Verify TOTP token
  verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps before/after
    })
  }

  // Generate OTP for SMS/Email
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Generate backup codes
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  // Hash backup code for storage
  hashBackupCode(code: string): string {
    // Use bcrypt or similar
    return code // Placeholder
  }

  // Verify backup code
  verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    // Compare with stored hashed codes
    return hashedCodes.includes(code)
  }

  // Generate device fingerprint
  generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    // Create hash of device characteristics
    return Buffer.from(`${userAgent}:${ipAddress}`).toString("base64")
  }

  // Check if device is trusted
  async isDeviceTrusted(
    userId: number,
    deviceFingerprint: string
  ): Promise<boolean> {
    // Check database for trusted device
    return false // Placeholder
  }
}

export const twoFactorService = new TwoFactorService()
```

#### API Endpoints:

```typescript
// app/api/auth/2fa/setup/route.ts
export async function POST(request: NextRequest) {
  const { userId } = await request.json()

  // Generate secret
  const { secret, otpauthUrl } = twoFactorService.generateSecret(username)

  // Generate QR code
  const qrCode = await twoFactorService.generateQRCode(otpauthUrl)

  // Generate backup codes
  const backupCodes = twoFactorService.generateBackupCodes()

  // Store secret temporarily (not enabled yet)
  // User must verify first

  return NextResponse.json({
    secret,
    qrCode,
    backupCodes,
  })
}

// app/api/auth/2fa/verify-setup/route.ts
export async function POST(request: NextRequest) {
  const { userId, token, secret } = await request.json()

  const verified = twoFactorService.verifyToken(token, secret)

  if (verified) {
    // Enable 2FA for user
    await enableTwoFactor(userId, secret)

    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 400 }
    )
  }
}

// app/api/auth/2fa/generate-otp/route.ts
export async function POST(request: NextRequest) {
  const { userId, method } = await request.json()

  const otp = twoFactorService.generateOTP()

  // Store OTP in database with expiry (5 minutes)
  await storeOTP(userId, otp, 'LOGIN')

  // Send OTP
  if (method === 'SMS') {
    await smsService.sendOTP(userPhone, otp)
  } else if (method === 'EMAIL') {
    await emailService.sendOTP(userEmail, otp)
  }

  return NextResponse.json({ success: true })
}

// app/api/auth/2fa/verify/route.ts
export async function POST(request: NextRequest) {
  const { userId, token, method } = await request.json()

  let verified = false

  if (method === 'AUTHENTICATOR') {
    const user = await getUserById(userId)
    verified = twoFactorService.verifyToken(token, user.twoFactorSecret!)
  } else {
    // Verify OTP from database
    const storedOTP = await getOTP(userId, 'LOGIN')
    verified = storedOTP && storedOTP.otpCode === token && !storedOTP.isUsed
  }

  if (verified) {
    // Mark OTP as used
    await markOTPUsed(userId, 'LOGIN')

    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json(
      { error: 'Invalid code' },
      { status: 400 }
    )
  }
}
```

#### Login Flow with 2FA:

```typescript
// Updated login process
1. User enters username/password
2. If credentials valid:
   a. Check if 2FA enabled
   b. If yes:
      - Check if device is trusted
      - If trusted: Skip 2FA
      - If not trusted: Request 2FA
3. User enters 2FA code (Authenticator/SMS/Email)
4. Verify 2FA code
5. If verified:
   - Create session
   - Option to trust device
   - Redirect to dashboard
```

#### UI Components:

**1. 2FA Setup Page:**

```typescript
// app/(root)/[companyId]/settings/security/2fa-setup.tsx
export function TwoFactorSetup() {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<"AUTHENTICATOR" | "SMS" | "EMAIL">(
    "AUTHENTICATOR"
  )
  const [secret, setSecret] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")

  // Step 1: Choose method
  // Step 2: Display QR code / Send OTP
  // Step 3: Verify setup
  // Step 4: Save backup codes
}
```

**2. 2FA Verification Page:**

```typescript
// app/(auth)/verify-2fa/page.tsx
export function TwoFactorVerification() {
  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)

  const handleVerify = async () => {
    // Verify 2FA code
    // If successful, complete login
  }

  return (
    <div>
      <h1>Two-Factor Authentication</h1>
      <p>Enter the 6-digit code from your authenticator app</p>

      <Input
        type="text"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="000000"
      />

      <Button onClick={handleVerify}>Verify</Button>

      <Button
        variant="link"
        onClick={() => setUseBackupCode(true)}
      >
        Use backup code
      </Button>
    </div>
  )
}
```

#### Benefits:

- ✅ Enhanced security
- ✅ Protect against password theft
- ✅ Compliance with security standards
- ✅ Multiple 2FA methods
- ✅ Trusted device management

---

## 2. HIGH PRIORITY ENHANCEMENTS

### 2.1 Recurring Transactions

**Purpose:** Automate repetitive transactions

**Use Cases:**

1. **Recurring Invoices**
   - Monthly rent charges
   - Subscription services
   - Maintenance contracts
   - License fees

2. **Scheduled Payments**
   - Loan EMI payments
   - Salary payments
   - Utility bills
   - Insurance premiums

3. **Auto Journal Entries**
   - Monthly depreciation
   - Accrual entries
   - Allocation entries
   - Revaluation entries

#### Database Schema:

```sql
CREATE TABLE RecurringTransaction (
  recurringId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  moduleId INT NOT NULL,
  transactionId INT NOT NULL,
  templateName NVARCHAR(255),

  -- Frequency
  frequencyType NVARCHAR(50), -- 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
  interval INT DEFAULT 1, -- Every X days/weeks/months
  dayOfWeek INT, -- For weekly (1=Monday, 7=Sunday)
  dayOfMonth INT, -- For monthly (1-31)
  monthOfYear INT, -- For yearly (1-12)

  -- Schedule
  startDate DATE NOT NULL,
  endDate DATE, -- NULL = no end date
  nextRunDate DATE NOT NULL,
  lastRunDate DATE,

  -- Behavior
  autoPost BIT DEFAULT 0,
  requireApproval BIT DEFAULT 0,
  sendNotification BIT DEFAULT 0,
  notifyEmail NVARCHAR(MAX), -- JSON array of emails

  -- Template data
  templateData NVARCHAR(MAX), -- JSON of transaction data

  -- Status
  isActive BIT DEFAULT 1,
  totalGenerated INT DEFAULT 0,

  -- Audit
  createById INT,
  createDate DATETIME DEFAULT GETDATE(),
  editById INT,
  editDate DATETIME
)

CREATE TABLE RecurringTransactionLog (
  logId INT PRIMARY KEY IDENTITY,
  recurringId INT FOREIGN KEY REFERENCES RecurringTransaction(recurringId),
  executionDate DATETIME,
  generatedTransactionId NVARCHAR(50),
  status NVARCHAR(50), -- 'SUCCESS', 'FAILED', 'SKIPPED'
  errorMessage NVARCHAR(MAX),
  createdDate DATETIME DEFAULT GETDATE()
)
```

#### Interface:

```typescript
// interfaces/recurring.ts
export interface IRecurringTransaction {
  recurringId: number
  companyId: number
  moduleId: number
  transactionId: number
  templateName: string

  frequencyType: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
  interval: number
  dayOfWeek?: number
  dayOfMonth?: number
  monthOfYear?: number

  startDate: Date
  endDate?: Date
  nextRunDate: Date
  lastRunDate?: Date

  autoPost: boolean
  requireApproval: boolean
  sendNotification: boolean
  notifyEmail?: string[]

  templateData: string // JSON

  isActive: boolean
  totalGenerated: number

  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
}

export interface IRecurringTransactionLog {
  logId: number
  recurringId: number
  executionDate: Date
  generatedTransactionId?: string
  status: "SUCCESS" | "FAILED" | "SKIPPED"
  errorMessage?: string
  createdDate: Date
}
```

#### Recurring Service:

```typescript
// lib/recurring-service.ts
class RecurringService {
  // Calculate next run date
  calculateNextRunDate(
    current: Date,
    frequency: string,
    interval: number,
    dayOfWeek?: number,
    dayOfMonth?: number,
    monthOfYear?: number
  ): Date {
    const next = new Date(current)

    switch (frequency) {
      case "DAILY":
        next.setDate(next.getDate() + interval)
        break

      case "WEEKLY":
        next.setDate(next.getDate() + 7 * interval)
        if (dayOfWeek) {
          // Adjust to specific day of week
          const currentDay = next.getDay()
          const diff = (dayOfWeek - currentDay + 7) % 7
          next.setDate(next.getDate() + diff)
        }
        break

      case "MONTHLY":
        next.setMonth(next.getMonth() + interval)
        if (dayOfMonth) {
          next.setDate(Math.min(dayOfMonth, this.getDaysInMonth(next)))
        }
        break

      case "QUARTERLY":
        next.setMonth(next.getMonth() + 3 * interval)
        if (dayOfMonth) {
          next.setDate(Math.min(dayOfMonth, this.getDaysInMonth(next)))
        }
        break

      case "YEARLY":
        next.setFullYear(next.getFullYear() + interval)
        if (monthOfYear) {
          next.setMonth(monthOfYear - 1)
        }
        if (dayOfMonth) {
          next.setDate(Math.min(dayOfMonth, this.getDaysInMonth(next)))
        }
        break
    }

    return next
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Process due recurring transactions
  async processDueTransactions(): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active recurring transactions due today
    const dueTransactions = await this.getDueTransactions(today)

    for (const recurring of dueTransactions) {
      try {
        // Generate transaction from template
        const transaction = this.generateTransactionFromTemplate(
          recurring.templateData,
          today
        )

        // Save transaction
        const saved = await this.saveTransaction(
          recurring.moduleId,
          recurring.transactionId,
          transaction,
          recurring.autoPost
        )

        if (saved) {
          // Log success
          await this.logExecution(recurring.recurringId, "SUCCESS", saved.id)

          // Send notification if enabled
          if (recurring.sendNotification && recurring.notifyEmail) {
            await this.sendNotification(recurring, saved.id)
          }

          // Update next run date
          const nextRun = this.calculateNextRunDate(
            today,
            recurring.frequencyType,
            recurring.interval,
            recurring.dayOfWeek,
            recurring.dayOfMonth,
            recurring.monthOfYear
          )

          await this.updateNextRunDate(recurring.recurringId, nextRun, today)

          // Check if should stop (end date reached)
          if (recurring.endDate && nextRun > recurring.endDate) {
            await this.deactivateRecurring(recurring.recurringId)
          }
        } else {
          // Log failure
          await this.logExecution(
            recurring.recurringId,
            "FAILED",
            null,
            "Failed to save transaction"
          )
        }
      } catch (error) {
        console.error(
          `Error processing recurring ${recurring.recurringId}:`,
          error
        )
        await this.logExecution(
          recurring.recurringId,
          "FAILED",
          null,
          error.message
        )
      }
    }
  }

  private generateTransactionFromTemplate(
    templateData: string,
    runDate: Date
  ): any {
    const template = JSON.parse(templateData)

    // Replace date placeholders
    template.trnDate = runDate
    template.accountDate = runDate

    // Replace {NEXT_MONTH}, {CURRENT_MONTH} etc.
    const replacements = {
      "{NEXT_MONTH}": new Date(
        runDate.getFullYear(),
        runDate.getMonth() + 1,
        1
      ),
      "{CURRENT_MONTH}": new Date(runDate.getFullYear(), runDate.getMonth(), 1),
      "{TODAY}": runDate,
    }

    // Replace placeholders in template
    let dataStr = JSON.stringify(template)
    for (const [key, value] of Object.entries(replacements)) {
      dataStr = dataStr.replace(new RegExp(key, "g"), value.toISOString())
    }

    return JSON.parse(dataStr)
  }

  private async saveTransaction(
    moduleId: number,
    transactionId: number,
    data: any,
    autoPost: boolean
  ): Promise<{ id: string } | null> {
    // Determine API endpoint
    const apiUrl = this.getApiUrl(moduleId, transactionId)

    // Set draft status
    data.isDraft = !autoPost
    data.isPost = autoPost

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      const result = await response.json()
      return { id: result.data.id }
    }

    return null
  }

  private async sendNotification(
    recurring: IRecurringTransaction,
    transactionId: string
  ): Promise<void> {
    if (!recurring.notifyEmail || recurring.notifyEmail.length === 0) return

    const subject = `Recurring Transaction Generated: ${recurring.templateName}`
    const message = `
      A recurring transaction has been automatically generated.
      
      Template: ${recurring.templateName}
      Transaction ID: ${transactionId}
      Date: ${new Date().toLocaleDateString()}
    `

    for (const email of recurring.notifyEmail) {
      await emailService.sendEmail({
        to: email,
        subject,
        html: message,
      })
    }
  }
}

export const recurringService = new RecurringService()
```

#### Cron Job Setup:

```typescript
// lib/cron/recurring-processor.ts
import cron from "node-cron"

// Run every day at 1 AM
cron.schedule("0 1 * * *", async () => {
  console.log("Processing recurring transactions...")
  await recurringService.processDueTransactions()
  console.log("Recurring transactions processed")
})
```

#### UI Component:

```typescript
// components/recurring/recurring-transaction-form.tsx
export function RecurringTransactionForm() {
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [autoPost, setAutoPost] = useState(false)

  return (
    <Form>
      {/* Template Name */}
      <FormField name="templateName" label="Template Name" />

      {/* Frequency */}
      <FormField label="Frequency">
        <Select value={frequency} onValueChange={setFrequency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {/* Interval */}
      <FormField label="Every">
        <Input type="number" min={1} />
        <span>
          {frequency === 'DAILY' && 'days'}
          {frequency === 'WEEKLY' && 'weeks'}
          {frequency === 'MONTHLY' && 'months'}
          {frequency === 'QUARTERLY' && 'quarters'}
          {frequency === 'YEARLY' && 'years'}
        </span>
      </FormField>

      {/* Day of Month (for monthly/quarterly/yearly) */}
      {['MONTHLY', 'QUARTERLY', 'YEARLY'].includes(frequency) && (
        <FormField label="Day of Month">
          <Select>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
              <SelectItem value="LAST">Last day of month</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      )}

      {/* Start Date */}
      <FormField label="Start Date">
        <DatePicker
          date={startDate}
          onDateChange={setStartDate}
        />
      </FormField>

      {/* End Date */}
      <FormField label="End Date">
        <DatePicker
          date={endDate}
          onDateChange={setEndDate}
        />
        <Checkbox id="no-end-date" label="No end date" />
      </FormField>

      {/* Auto Post */}
      <FormField>
        <Checkbox
          id="auto-post"
          checked={autoPost}
          onCheckedChange={setAutoPost}
        />
        <Label htmlFor="auto-post">
          Automatically post to General Ledger
        </Label>
      </FormField>

      {/* Notifications */}
      <FormField label="Email Notifications">
        <Textarea
          placeholder="Enter email addresses (one per line)"
        />
      </FormField>

      <Button type="submit">Save Recurring Transaction</Button>
    </Form>
  )
}
```

#### Benefits:

- ✅ Automation of repetitive tasks
- ✅ Time savings
- ✅ Reduced errors
- ✅ Consistent processing
- ✅ Better cash flow management

---

### 2.2 Invoice Scanning & OCR (Optical Character Recognition)

**Purpose:** Automate invoice data entry by scanning physical/digital invoices

**Why It's Important:**

- Reduces manual data entry by 80%+
- Faster invoice processing (minutes vs hours)
- Reduces human errors
- Better cash flow management
- Improved supplier relationships

**Use Cases:**

1. **AP Invoice Entry**
   - Scan supplier invoices
   - Auto-extract vendor details, amounts, dates
   - Auto-create AP invoice

2. **Expense Management**
   - Scan receipts
   - Auto-extract amounts, merchants
   - Create expense reports

3. **Document Archival**
   - Scan and store invoices
   - Searchable PDF repository
   - Automatic indexing

#### Technology Stack:

**OCR Engines (Choose one):**

1. **Tesseract.js** (Free, Open Source)
   - Good for basic text extraction
   - Works in browser

2. **Google Cloud Vision API** (Paid, Best accuracy)
   - Industry-leading OCR
   - Supports 50+ languages
   - Handwriting recognition

3. **AWS Textract** (Paid, AWS ecosystem)
   - Built for documents
   - Table/form extraction
   - Confidence scores

4. **Microsoft Azure Computer Vision** (Paid)
   - Good accuracy
   - Invoice-specific models

**AI/ML for Data Extraction:**

- **OpenAI GPT-4 Vision** - Best for structured data extraction
- **Custom ML Models** - Trained on your invoice formats
- **Template Matching** - For recurring vendors

#### Database Schema:

```sql
-- Invoice scanning log
CREATE TABLE InvoiceScan (
  scanId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  fileName NVARCHAR(255),
  fileSize INT,
  fileType NVARCHAR(50), -- 'PDF', 'JPG', 'PNG'
  filePath NVARCHAR(500),
  scanDate DATETIME DEFAULT GETDATE(),

  -- OCR Results
  ocrStatus NVARCHAR(50), -- 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  ocrEngine NVARCHAR(50), -- 'TESSERACT', 'GOOGLE_VISION', 'AWS_TEXTRACT'
  rawText NVARCHAR(MAX), -- Full extracted text
  confidence DECIMAL(5,2), -- 0-100% confidence

  -- Extracted Data (JSON)
  extractedData NVARCHAR(MAX), -- JSON of invoice data

  -- Processing
  processingTime INT, -- milliseconds
  errorMessage NVARCHAR(MAX),

  -- Created Invoice
  invoiceId NVARCHAR(50), -- Reference to created AP invoice
  isVerified BIT DEFAULT 0,
  verifiedById INT,
  verifiedDate DATETIME,

  -- Audit
  uploadedById INT,
  createDate DATETIME DEFAULT GETDATE()
)

-- Extracted fields mapping
CREATE TABLE InvoiceScanField (
  fieldId INT PRIMARY KEY IDENTITY,
  scanId INT FOREIGN KEY REFERENCES InvoiceScan(scanId),
  fieldName NVARCHAR(100), -- 'supplierName', 'invoiceNo', 'totalAmount'
  fieldValue NVARCHAR(500),
  confidence DECIMAL(5,2),
  boundingBox NVARCHAR(MAX), -- JSON: {x, y, width, height}
  pageNumber INT,
  isVerified BIT DEFAULT 0
)

-- Vendor invoice templates (Learn from scans)
CREATE TABLE VendorInvoiceTemplate (
  templateId INT PRIMARY KEY IDENTITY,
  supplierId INT,
  supplierName NVARCHAR(255),

  -- Field locations (learned from scans)
  templateData NVARCHAR(MAX), -- JSON of field positions

  -- Statistics
  timesUsed INT DEFAULT 0,
  successRate DECIMAL(5,2),
  lastUsedDate DATETIME,

  createDate DATETIME DEFAULT GETDATE()
)
```

#### Interfaces:

```typescript
// interfaces/invoice-scan.ts
export interface IInvoiceScan {
  scanId: number
  companyId: number
  fileName: string
  fileSize: number
  fileType: "PDF" | "JPG" | "PNG"
  filePath: string
  scanDate: Date

  ocrStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  ocrEngine: "TESSERACT" | "GOOGLE_VISION" | "AWS_TEXTRACT" | "GPT4_VISION"
  rawText?: string
  confidence?: number

  extractedData?: IExtractedInvoiceData
  processingTime?: number
  errorMessage?: string

  invoiceId?: string
  isVerified: boolean
  verifiedById?: number
  verifiedDate?: Date

  uploadedById: number
  createDate: Date
}

export interface IExtractedInvoiceData {
  // Supplier Information
  supplierName?: string
  supplierCode?: string
  supplierAddress?: string
  supplierTaxId?: string
  supplierPhone?: string
  supplierEmail?: string

  // Invoice Header
  invoiceNo?: string
  invoiceDate?: string
  dueDate?: string
  purchaseOrderNo?: string
  deliveryDate?: string

  // Amounts
  subtotal?: number
  taxAmount?: number
  totalAmount?: number
  currency?: string

  // Line Items
  lineItems?: IExtractedLineItem[]

  // Payment Terms
  paymentTerms?: string
  bankDetails?: {
    bankName?: string
    accountNo?: string
    swiftCode?: string
  }

  // Confidence scores
  fieldConfidence?: { [key: string]: number }
}

export interface IExtractedLineItem {
  itemNo?: number
  description?: string
  quantity?: number
  unitPrice?: number
  amount?: number
  taxRate?: number
  glAccount?: string
}

export interface IInvoiceScanField {
  fieldId: number
  scanId: number
  fieldName: string
  fieldValue: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  pageNumber: number
  isVerified: boolean
}
```

#### OCR Service Implementation:

```typescript
// lib/invoice-ocr-service.ts

import { ImageAnnotatorClient } from "@google-cloud/vision"
import Tesseract from "tesseract.js"

class InvoiceOCRService {
  private visionClient: ImageAnnotatorClient

  constructor() {
    // Initialize Google Vision (if using)
    this.visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
    })
  }

  // Main OCR function
  async scanInvoice(
    file: File | Buffer,
    engine:
      | "TESSERACT"
      | "GOOGLE_VISION"
      | "AWS_TEXTRACT"
      | "GPT4_VISION" = "GOOGLE_VISION"
  ): Promise<{
    rawText: string
    confidence: number
    extractedData: IExtractedInvoiceData
  }> {
    const startTime = Date.now()

    let rawText = ""
    let confidence = 0

    // Step 1: OCR - Extract text from image
    switch (engine) {
      case "TESSERACT":
        const result = await this.tesseractOCR(file)
        rawText = result.text
        confidence = result.confidence
        break

      case "GOOGLE_VISION":
        const visionResult = await this.googleVisionOCR(file)
        rawText = visionResult.text
        confidence = visionResult.confidence
        break

      case "AWS_TEXTRACT":
        const textractResult = await this.awsTextractOCR(file)
        rawText = textractResult.text
        confidence = textractResult.confidence
        break

      case "GPT4_VISION":
        const gptResult = await this.gpt4VisionOCR(file)
        rawText = gptResult.text
        confidence = gptResult.confidence
        break
    }

    // Step 2: Extract structured data using AI
    const extractedData = await this.extractInvoiceData(rawText, file)

    const processingTime = Date.now() - startTime

    return {
      rawText,
      confidence,
      extractedData,
    }
  }

  // Tesseract OCR (Free)
  private async tesseractOCR(
    file: File | Buffer
  ): Promise<{ text: string; confidence: number }> {
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    })

    return {
      text: result.data.text,
      confidence: result.data.confidence,
    }
  }

  // Google Vision OCR
  private async googleVisionOCR(
    file: Buffer
  ): Promise<{ text: string; confidence: number }> {
    const [result] = await this.visionClient.documentTextDetection({
      image: { content: file },
    })

    const fullText = result.fullTextAnnotation?.text || ""
    const confidence =
      result.fullTextAnnotation?.pages?.[0]?.confidence || 0 * 100

    return {
      text: fullText,
      confidence: confidence,
    }
  }

  // AWS Textract OCR
  private async awsTextractOCR(
    file: Buffer
  ): Promise<{ text: string; confidence: number }> {
    // AWS Textract implementation
    const AWS = require("aws-sdk")
    const textract = new AWS.Textract({
      region: process.env.AWS_REGION,
    })

    const params = {
      Document: {
        Bytes: file,
      },
      FeatureTypes: ["TABLES", "FORMS"],
    }

    const result = await textract.analyzeDocument(params).promise()

    let text = ""
    let totalConfidence = 0
    let count = 0

    for (const block of result.Blocks) {
      if (block.BlockType === "LINE") {
        text += block.Text + "\n"
        totalConfidence += block.Confidence
        count++
      }
    }

    return {
      text,
      confidence: count > 0 ? totalConfidence / count : 0,
    }
  }

  // GPT-4 Vision OCR (Most accurate for invoices)
  private async gpt4VisionOCR(
    file: Buffer
  ): Promise<{ text: string; confidence: number }> {
    const OpenAI = require("openai")
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Convert buffer to base64
    const base64Image = file.toString("base64")

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this invoice image. Return plain text only.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    })

    return {
      text: response.choices[0].message.content || "",
      confidence: 95, // GPT-4 Vision is highly accurate
    }
  }

  // Extract structured invoice data using AI
  private async extractInvoiceData(
    rawText: string,
    imageBuffer?: Buffer
  ): Promise<IExtractedInvoiceData> {
    // Use GPT-4 for intelligent extraction
    const OpenAI = require("openai")
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `
Extract invoice information from the following text and return ONLY valid JSON (no markdown, no comments):

${rawText}

Return JSON in this exact format:
{
  "supplierName": "string or null",
  "supplierCode": "string or null",
  "supplierAddress": "string or null",
  "supplierTaxId": "string or null",
  "invoiceNo": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "purchaseOrderNo": "string or null",
  "subtotal": number or null,
  "taxAmount": number or null,
  "totalAmount": number or null,
  "currency": "string or null",
  "paymentTerms": "string or null",
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "amount": number
    }
  ]
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at extracting structured data from invoices. Return only valid JSON without any markdown formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    })

    const extracted = JSON.parse(response.choices[0].message.content || "{}")

    return extracted as IExtractedInvoiceData
  }

  // Match extracted data to existing supplier
  async matchSupplier(
    supplierName: string,
    companyId: number
  ): Promise<number | null> {
    // Fuzzy matching logic
    const suppliers = await this.getSuppliers(companyId)

    // Use string similarity algorithm
    const similarity = require("string-similarity")

    let bestMatch = null
    let bestScore = 0

    for (const supplier of suppliers) {
      const score = similarity.compareTwoStrings(
        supplierName.toLowerCase(),
        supplier.supplierName.toLowerCase()
      )

      if (score > bestScore && score > 0.7) {
        // 70% similarity threshold
        bestScore = score
        bestMatch = supplier
      }
    }

    return bestMatch?.supplierId || null
  }

  // Validate extracted amounts
  validateAmounts(data: IExtractedInvoiceData): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if subtotal + tax = total
    if (data.subtotal && data.taxAmount && data.totalAmount) {
      const calculatedTotal = data.subtotal + data.taxAmount
      const difference = Math.abs(calculatedTotal - data.totalAmount)

      if (difference > 0.02) {
        // Allow 2 cent rounding difference
        errors.push(
          `Total amount mismatch: Subtotal (${data.subtotal}) + Tax (${data.taxAmount}) ≠ Total (${data.totalAmount})`
        )
      }
    }

    // Check line items sum to subtotal
    if (data.lineItems && data.lineItems.length > 0 && data.subtotal) {
      const lineItemsTotal = data.lineItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      )
      const difference = Math.abs(lineItemsTotal - data.subtotal)

      if (difference > 0.02) {
        errors.push(
          `Line items total (${lineItemsTotal}) doesn't match subtotal (${data.subtotal})`
        )
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

export const invoiceOCRService = new InvoiceOCRService()
```

#### API Endpoint:

```typescript
// app/api/invoice/scan/route.ts
import { NextRequest, NextResponse } from "next/server"

import { invoiceOCRService } from "@/lib/invoice-ocr-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const companyId = formData.get("companyId") as string
    const userId = formData.get("userId") as string
    const engine = (formData.get("engine") as string) || "GOOGLE_VISION"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    const filePath = await saveUploadedFile(file, companyId)

    // Create scan record
    const scan = await createInvoiceScan({
      companyId: parseInt(companyId),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type.includes("pdf") ? "PDF" : "JPG",
      filePath,
      uploadedById: parseInt(userId),
      ocrEngine: engine,
      ocrStatus: "PROCESSING",
    })

    // Process OCR (async)
    try {
      const result = await invoiceOCRService.scanInvoice(buffer, engine)

      // Validate extracted data
      const validation = invoiceOCRService.validateAmounts(result.extractedData)

      // Try to match supplier
      let supplierId = null
      if (result.extractedData.supplierName) {
        supplierId = await invoiceOCRService.matchSupplier(
          result.extractedData.supplierName,
          parseInt(companyId)
        )
      }

      // Update scan record
      await updateInvoiceScan(scan.scanId, {
        ocrStatus: "COMPLETED",
        rawText: result.rawText,
        confidence: result.confidence,
        extractedData: JSON.stringify(result.extractedData),
      })

      return NextResponse.json({
        success: true,
        scanId: scan.scanId,
        confidence: result.confidence,
        extractedData: result.extractedData,
        supplierId,
        validation,
      })
    } catch (ocrError) {
      // Update scan with error
      await updateInvoiceScan(scan.scanId, {
        ocrStatus: "FAILED",
        errorMessage: ocrError.message,
      })

      return NextResponse.json(
        {
          error: "OCR processing failed",
          details: ocrError.message,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Invoice scan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

#### UI Component:

```typescript
// app/(root)/[companyId]/ap/invoice/components/invoice-scanner.tsx
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function InvoiceScanner({ onInvoiceExtracted }) {
  const [file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleScan = async () => {
    if (!file) return

    setScanning(true)
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("companyId", companyId.toString())
    formData.append("userId", userId.toString())
    formData.append("engine", "GPT4_VISION") // Best accuracy

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch("/api/invoice/scan", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Scan failed")
      }

      const data = await response.json()
      setResult(data)

      // Auto-fill invoice form
      if (data.success) {
        onInvoiceExtracted(data.extractedData, data.supplierId)
        toast.success(
          `Invoice scanned successfully! Confidence: ${data.confidence.toFixed(1)}%`
        )
      }
    } catch (error) {
      toast.error("Failed to scan invoice")
      console.error(error)
    } finally {
      setScanning(false)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Scan Invoice</h3>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            disabled={scanning}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Supported formats: JPG, PNG, PDF
          </p>
        </div>

        {/* Preview */}
        {file && (
          <div className="rounded border p-4">
            <p className="text-sm">
              <strong>Selected:</strong> {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Scan Button */}
        <Button
          onClick={handleScan}
          disabled={!file || scanning}
          className="w-full"
        >
          {scanning ? "Scanning..." : "Scan Invoice"}
        </Button>

        {/* Progress */}
        {scanning && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-center text-sm text-muted-foreground">
              Processing... {progress}%
            </p>
          </div>
        )}

        {/* Results */}
        {result && result.success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900">
                  Invoice Scanned Successfully
                </h4>
                <div className="mt-2 space-y-1 text-sm text-green-800">
                  <p>
                    <strong>Confidence:</strong>{" "}
                    {result.confidence.toFixed(1)}%
                  </p>
                  <p>
                    <strong>Supplier:</strong>{" "}
                    {result.extractedData.supplierName || "Unknown"}
                  </p>
                  <p>
                    <strong>Invoice #:</strong>{" "}
                    {result.extractedData.invoiceNo || "N/A"}
                  </p>
                  <p>
                    <strong>Total:</strong> {result.extractedData.currency}{" "}
                    {result.extractedData.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>

                {/* Validation Warnings */}
                {result.validation &&
                  !result.validation.valid &&
                  result.validation.errors.length > 0 && (
                    <div className="mt-3 rounded bg-yellow-50 p-2">
                      <p className="text-xs font-semibold text-yellow-800">
                        ⚠️ Please verify:
                      </p>
                      <ul className="ml-4 mt-1 list-disc text-xs text-yellow-700">
                        {result.validation.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
```

#### Integration with Invoice Form:

```typescript
// app/(root)/[companyId]/ap/invoice/page.tsx
export default function InvoicePage() {
  const form = useForm()

  const handleInvoiceExtracted = (
    extractedData: IExtractedInvoiceData,
    supplierId: number | null
  ) => {
    // Auto-fill form with extracted data
    if (supplierId) {
      form.setValue("supplierId", supplierId)
    }

    if (extractedData.invoiceNo) {
      form.setValue("suppInvoiceNo", extractedData.invoiceNo)
    }

    if (extractedData.invoiceDate) {
      form.setValue("trnDate", new Date(extractedData.invoiceDate))
    }

    if (extractedData.dueDate) {
      form.setValue("dueDate", new Date(extractedData.dueDate))
    }

    if (extractedData.totalAmount) {
      form.setValue("totAmt", extractedData.totalAmount)
    }

    if (extractedData.taxAmount) {
      form.setValue("gstAmt", extractedData.taxAmount)
    }

    // Add line items
    if (extractedData.lineItems && extractedData.lineItems.length > 0) {
      const details = extractedData.lineItems.map((item, index) => ({
        itemNo: index + 1,
        productName: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        totAmt: item.amount,
      }))

      form.setValue("data_details", details)
    }

    // Show notification
    toast.success("Invoice data auto-filled! Please verify the details.")
  }

  return (
    <div>
      {/* Invoice Scanner Component */}
      <InvoiceScanner onInvoiceExtracted={handleInvoiceExtracted} />

      {/* Regular Invoice Form */}
      <InvoiceForm form={form} />
    </div>
  )
}
```

#### Benefits:

- ✅ **80% faster** invoice entry
- ✅ **Reduced errors** from manual typing
- ✅ **Better supplier matching** with AI
- ✅ **Automatic validation** of amounts
- ✅ **Multi-language support**
- ✅ **Handles handwritten invoices**
- ✅ **Learns vendor formats** over time

#### Costs:

| OCR Engine       | Cost per 1000 pages | Accuracy | Best For           |
| ---------------- | ------------------- | -------- | ------------------ |
| Tesseract (Free) | $0                  | 70-80%   | Budget projects    |
| Google Vision    | $1.50               | 95-98%   | High accuracy      |
| AWS Textract     | $1.50               | 95-98%   | AWS infrastructure |
| GPT-4 Vision     | $5-10               | 98-99%   | Best accuracy      |

#### Environment Variables:

```env
# Google Cloud Vision
GOOGLE_CLOUD_KEY_PATH=/path/to/service-account-key.json

# AWS Textract
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# OpenAI GPT-4 Vision
OPENAI_API_KEY=sk-...
```

---

### 2.3 Multi-Document Attachment to Invoices

**Purpose:** Allow multiple document attachments to each invoice (AR/AP/CB/GL)

**Why It's Important:**

- Store supporting documents (PO, delivery notes, contracts)
- Better audit trail
- Easy document retrieval
- Paperless office
- Compliance requirements

**Use Cases:**

1. **AP Invoice Attachments**
   - Supplier invoice PDF
   - Purchase order
   - Goods received note
   - Delivery challan
   - Email correspondence

2. **AR Invoice Attachments**
   - Sales contract
   - Delivery order
   - Shipping documents
   - Customer PO
   - Supporting documents

3. **Payment Attachments**
   - Bank transfer receipt
   - Cheque copy
   - Payment approval
   - Remittance advice

4. **General**
   - Signed agreements
   - Email confirmations
   - Photos (damage claims)
   - Other supporting docs

#### Database Schema:

```sql
-- Document attachments for all transactions
CREATE TABLE TransactionDocument (
  docId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  moduleId INT NOT NULL, -- 1=AR, 2=AP, 3=CB, 4=GL
  transactionId INT NOT NULL, -- Invoice, Payment, etc.

  -- Reference to transaction
  referenceId NVARCHAR(50) NOT NULL, -- invoiceId, paymentId, etc.
  referenceNo NVARCHAR(100), -- Invoice number for display

  -- Document Type
  docTypeId INT,
  docTypeName NVARCHAR(100),
  docCategory NVARCHAR(50), -- 'INVOICE', 'PO', 'DELIVERY', 'CONTRACT', 'OTHER'

  -- File Information
  fileName NVARCHAR(255) NOT NULL,
  originalFileName NVARCHAR(255) NOT NULL,
  filePath NVARCHAR(500) NOT NULL,
  fileSize BIGINT, -- in bytes
  fileType NVARCHAR(50), -- 'PDF', 'JPG', 'PNG', 'XLSX', etc.
  mimeType NVARCHAR(100),

  -- Metadata
  title NVARCHAR(255),
  description NVARCHAR(MAX),
  tags NVARCHAR(500), -- Comma separated tags
  version INT DEFAULT 1,
  isActive BIT DEFAULT 1,

  -- Security
  isPublic BIT DEFAULT 0, -- Can be shared externally
  accessLevel NVARCHAR(50) DEFAULT 'INTERNAL', -- 'INTERNAL', 'CONFIDENTIAL', 'PUBLIC'

  -- Audit
  uploadedById INT NOT NULL,
  uploadedBy NVARCHAR(100),
  uploadDate DATETIME DEFAULT GETDATE(),

  -- Indexing for fast search
  INDEX IX_TransactionDocument_Reference (companyId, moduleId, transactionId, referenceId),
  INDEX IX_TransactionDocument_UploadDate (uploadDate DESC)
)

-- Document access log (who viewed/downloaded)
CREATE TABLE DocumentAccessLog (
  logId INT PRIMARY KEY IDENTITY,
  docId INT FOREIGN KEY REFERENCES TransactionDocument(docId),
  userId INT NOT NULL,
  userName NVARCHAR(100),
  actionType NVARCHAR(50), -- 'VIEW', 'DOWNLOAD', 'PRINT', 'DELETE'
  ipAddress NVARCHAR(50),
  userAgent NVARCHAR(500),
  accessDate DATETIME DEFAULT GETDATE()
)

-- Document versions (if document is replaced)
CREATE TABLE DocumentVersion (
  versionId INT PRIMARY KEY IDENTITY,
  docId INT FOREIGN KEY REFERENCES TransactionDocument(docId),
  versionNumber INT NOT NULL,
  fileName NVARCHAR(255),
  filePath NVARCHAR(500),
  fileSize BIGINT,
  uploadedById INT,
  uploadedBy NVARCHAR(100),
  uploadDate DATETIME DEFAULT GETDATE(),
  changeNotes NVARCHAR(MAX)
)
```

#### Interfaces:

```typescript
// interfaces/document-attachment.ts
export interface ITransactionDocument {
  docId: number
  companyId: number
  moduleId: number
  transactionId: number

  referenceId: string // invoiceId, paymentId
  referenceNo?: string

  docTypeId?: number
  docTypeName?: string
  docCategory?: "INVOICE" | "PO" | "DELIVERY" | "CONTRACT" | "OTHER"

  fileName: string
  originalFileName: string
  filePath: string
  fileSize: number
  fileType: string
  mimeType: string

  title?: string
  description?: string
  tags?: string
  version: number
  isActive: boolean

  isPublic: boolean
  accessLevel: "INTERNAL" | "CONFIDENTIAL" | "PUBLIC"

  uploadedById: number
  uploadedBy?: string
  uploadDate: Date
}

export interface IDocumentAccessLog {
  logId: number
  docId: number
  userId: number
  userName: string
  actionType: "VIEW" | "DOWNLOAD" | "PRINT" | "DELETE"
  ipAddress: string
  userAgent: string
  accessDate: Date
}

export interface IDocumentVersion {
  versionId: number
  docId: number
  versionNumber: number
  fileName: string
  filePath: string
  fileSize: number
  uploadedById: number
  uploadedBy: string
  uploadDate: Date
  changeNotes?: string
}

// For upload
export interface IDocumentUploadRequest {
  companyId: number
  moduleId: number
  transactionId: number
  referenceId: string
  referenceNo?: string
  docTypeId?: number
  docCategory?: string
  title?: string
  description?: string
  tags?: string
  isPublic?: boolean
  accessLevel?: string
  file: File
}
```

#### Enhanced Upload API:

```typescript
// app/api/documents/transaction/route.ts

import { existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract fields
    const file = formData.get("file") as File
    const companyId = formData.get("companyId") as string
    const moduleId = formData.get("moduleId") as string
    const transactionId = formData.get("transactionId") as string
    const referenceId = formData.get("referenceId") as string
    const referenceNo = formData.get("referenceNo") as string
    const docTypeId = formData.get("docTypeId") as string
    const docCategory = formData.get("docCategory") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const tags = formData.get("tags") as string
    const isPublic = formData.get("isPublic") === "true"
    const userId = formData.get("userId") as string

    if (!file || !companyId || !moduleId || !transactionId || !referenceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get file info
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileSize = buffer.length
    const mimeType = file.type
    const originalFileName = file.name
    const fileExtension = originalFileName.split(".").pop()

    // Determine file type
    const fileType = getFileType(fileExtension || "", mimeType)

    // Create storage directory
    const uploadDir = join(
      process.cwd(),
      "public",
      "documents",
      "transactions",
      companyId,
      moduleId,
      transactionId,
      referenceId
    )

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = originalFileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100)
    const fileName = `${timestamp}-${sanitizedName}`
    const filePath = join(uploadDir, fileName)
    const relativePath = `/documents/transactions/${companyId}/${moduleId}/${transactionId}/${referenceId}/${fileName}`

    // Save file to disk
    await writeFile(filePath, buffer)

    // Save to database
    const document = await saveDocumentToDatabase({
      companyId: parseInt(companyId),
      moduleId: parseInt(moduleId),
      transactionId: parseInt(transactionId),
      referenceId,
      referenceNo: referenceNo || null,
      docTypeId: docTypeId ? parseInt(docTypeId) : null,
      docCategory: docCategory || "OTHER",
      fileName,
      originalFileName,
      filePath: relativePath,
      fileSize,
      fileType,
      mimeType,
      title: title || originalFileName,
      description: description || null,
      tags: tags || null,
      version: 1,
      isActive: true,
      isPublic,
      accessLevel: isPublic ? "PUBLIC" : "INTERNAL",
      uploadedById: parseInt(userId),
    })

    return NextResponse.json({
      success: true,
      document,
      message: "Document uploaded successfully",
    })
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}

// GET - List documents for a transaction
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")
    const moduleId = searchParams.get("moduleId")
    const transactionId = searchParams.get("transactionId")
    const referenceId = searchParams.get("referenceId")

    if (!companyId || !moduleId || !transactionId || !referenceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Get documents from database
    const documents = await getDocumentsFromDatabase({
      companyId: parseInt(companyId),
      moduleId: parseInt(moduleId),
      transactionId: parseInt(transactionId),
      referenceId,
    })

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
    })
  } catch (error) {
    console.error("Get documents error:", error)
    return NextResponse.json(
      { error: "Failed to get documents" },
      { status: 500 }
    )
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const docId = searchParams.get("docId")
    const userId = searchParams.get("userId")

    if (!docId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Mark as inactive (soft delete)
    await markDocumentAsDeleted(parseInt(docId), parseInt(userId))

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Delete document error:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}

// Helper function to determine file type
function getFileType(extension: string, mimeType: string): string {
  const ext = extension.toLowerCase()

  if (["pdf"].includes(ext)) return "PDF"
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return "IMAGE"
  if (["doc", "docx"].includes(ext)) return "WORD"
  if (["xls", "xlsx"].includes(ext)) return "EXCEL"
  if (["ppt", "pptx"].includes(ext)) return "POWERPOINT"
  if (["txt"].includes(ext)) return "TEXT"
  if (["zip", "rar", "7z"].includes(ext)) return "ARCHIVE"

  return "OTHER"
}
```

#### Enhanced UI Component:

```typescript
// components/document-attachment/document-upload-manager.tsx
import { useState, useEffect } from "react"
import { Upload, File, Trash2, Download, Eye, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface DocumentUploadManagerProps {
  companyId: number
  moduleId: number
  transactionId: number
  referenceId: string // Invoice ID
  referenceNo?: string // Invoice Number
}

export function DocumentUploadManager({
  companyId,
  moduleId,
  transactionId,
  referenceId,
  referenceNo,
}: DocumentUploadManagerProps) {
  const [documents, setDocuments] = useState<ITransactionDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewDoc, setPreviewDoc] = useState<ITransactionDocument | null>(null)

  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [docCategory, setDocCategory] = useState("OTHER")

  // Load documents
  useEffect(() => {
    if (referenceId) {
      loadDocuments()
    }
  }, [referenceId])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/documents/transaction?companyId=${companyId}&moduleId=${moduleId}&transactionId=${transactionId}&referenceId=${referenceId}`
      )

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.data || [])
      }
    } catch (error) {
      toast.error("Failed to load documents")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let successCount = 0

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        const formData = new FormData()
        formData.append("file", file)
        formData.append("companyId", companyId.toString())
        formData.append("moduleId", moduleId.toString())
        formData.append("transactionId", transactionId.toString())
        formData.append("referenceId", referenceId)
        formData.append("referenceNo", referenceNo || "")
        formData.append("docCategory", docCategory)
        formData.append("title", title || file.name)
        formData.append("description", description)
        formData.append("userId", userId.toString())

        const response = await fetch("/api/documents/transaction", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          successCount++
        }

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100)
      }

      if (successCount > 0) {
        toast.success(`${successCount} document(s) uploaded successfully`)
        await loadDocuments()
        handleCloseDialog()
      }
    } catch (error) {
      toast.error("Failed to upload documents")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/documents/transaction?docId=${docId}&userId=${userId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        toast.success("Document deleted successfully")
        await loadDocuments()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      toast.error("Failed to delete document")
    }
  }

  const handleDownload = (doc: ITransactionDocument) => {
    // Open file in new tab (download)
    window.open(doc.filePath, "_blank")

    // Log access
    logDocumentAccess(doc.docId, "DOWNLOAD")
  }

  const handlePreview = (doc: ITransactionDocument) => {
    setPreviewDoc(doc)

    // Log access
    logDocumentAccess(doc.docId, "VIEW")
  }

  const handleCloseDialog = () => {
    setUploadDialogOpen(false)
    setSelectedFiles([])
    setTitle("")
    setDescription("")
    setDocCategory("OTHER")
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return "📄"
      case "IMAGE":
        return "🖼️"
      case "WORD":
        return "📝"
      case "EXCEL":
        return "📊"
      default:
        return "📎"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Document Attachments</CardTitle>
        <Button
          size="sm"
          onClick={() => setUploadDialogOpen(true)}
          disabled={!referenceId}
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No documents attached
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Uploaded Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.docId}>
                  <TableCell>
                    <span className="text-2xl">{getFileIcon(doc.fileType)}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{doc.title || doc.originalFileName}</div>
                      {doc.description && (
                        <div className="text-xs text-muted-foreground">
                          {doc.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.docCategory}</Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell>
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(doc.docId)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Selection */}
            <div>
              <Label>Select Files (Multiple allowed)</Label>
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                disabled={uploading}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Supported: PDF, Word, Excel, Images (Max 10MB per file)
              </p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="rounded border p-3">
                <p className="mb-2 text-sm font-medium">
                  Selected Files: {selectedFiles.length}
                </p>
                <ul className="space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <li key={idx} className="text-xs">
                      {file.name} ({formatFileSize(file.size)})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category */}
            <div>
              <Label>Category</Label>
              <select
                className="w-full rounded border p-2"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                disabled={uploading}
              >
                <option value="INVOICE">Invoice/Bill</option>
                <option value="PO">Purchase Order</option>
                <option value="DELIVERY">Delivery Note</option>
                <option value="CONTRACT">Contract/Agreement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <Label>Title (Optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leave empty to use filename"
                disabled={uploading}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about these documents..."
                rows={3}
                disabled={uploading}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-center text-sm text-muted-foreground">
                  Uploading... {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.title || previewDoc?.originalFileName}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="mt-4">
              {previewDoc.fileType === "IMAGE" ? (
                <img
                  src={previewDoc.filePath}
                  alt={previewDoc.originalFileName}
                  className="max-h-[600px] w-full object-contain"
                />
              ) : previewDoc.fileType === "PDF" ? (
                <iframe
                  src={previewDoc.filePath}
                  className="h-[600px] w-full"
                  title="PDF Preview"
                />
              ) : (
                <div className="py-12 text-center">
                  <p>Preview not available for this file type</p>
                  <Button
                    className="mt-4"
                    onClick={() => handleDownload(previewDoc)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
```

#### Integration with Invoice Form:

```typescript
// app/(root)/[companyId]/ap/invoice/page.tsx
// Add to your invoice form tabs

import { DocumentUploadManager } from "@/components/document-attachment/document-upload-manager"

export default function InvoicePage() {
  const [invoiceId, setInvoiceId] = useState("")
  const [invoiceNo, setInvoiceNo] = useState("")

  return (
    <Tabs defaultValue="main">
      <TabsList>
        <TabsTrigger value="main">Main</TabsTrigger>
        <TabsTrigger value="other">Other</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="main">
        {/* Your invoice form */}
      </TabsContent>

      <TabsContent value="documents">
        <DocumentUploadManager
          companyId={companyId}
          moduleId={ModuleId.ap}
          transactionId={APTransactionId.invoice}
          referenceId={invoiceId}
          referenceNo={invoiceNo}
        />
      </TabsContent>

      <TabsContent value="history">
        {/* History tab */}
      </TabsContent>
    </Tabs>
  )
}
```

#### Advanced Features:

**1. Drag & Drop Upload:**

```typescript
// Enhanced component with drag & drop
export function DocumentUploadManager() {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)
    setUploadDialogOpen(true)
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm">
          Drag & drop files here or{" "}
          <label className="cursor-pointer text-blue-600 underline">
            browse
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </p>
      </div>
    </div>
  )
}
```

**2. Bulk Download (ZIP):**

```typescript
// Download all documents as ZIP
const handleDownloadAll = async () => {
  try {
    const response = await fetch(
      `/api/documents/transaction/download-all?referenceId=${referenceId}`,
      { method: "POST" }
    )

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${referenceNo}-documents.zip`
    a.click()
  } catch (error) {
    toast.error("Failed to download documents")
  }
}
```

**3. Document Sharing:**

```typescript
// Generate shareable link for external users
const handleGenerateShareLink = async (docId: number) => {
  try {
    const response = await fetch("/api/documents/generate-share-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        docId,
        expiryDays: 7, // Link expires in 7 days
      }),
    })

    const data = await response.json()

    // Copy link to clipboard
    navigator.clipboard.writeText(data.shareLink)
    toast.success("Share link copied to clipboard!")
  } catch (error) {
    toast.error("Failed to generate share link")
  }
}
```

**4. Email Document Attachments:**

```typescript
// Send invoice with all attached documents via email
const handleEmailWithAttachments = async () => {
  try {
    const response = await fetch("/api/invoice/send-with-attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceId,
        customerEmail: "customer@example.com",
        includeAllDocs: true, // Include all attached documents
      }),
    })

    if (response.ok) {
      toast.success("Invoice sent with attachments!")
    }
  } catch (error) {
    toast.error("Failed to send email")
  }
}
```

**5. Document Templates:**

```typescript
// Pre-fill documents based on document type
const documentTemplates = {
  INVOICE: {
    requiredDocs: [
      "Original Invoice",
      "Purchase Order",
      "Delivery Note"
    ],
    optional: [
      "Email Correspondence",
      "Payment Terms"
    ]
  },
  PAYMENT: {
    requiredDocs: [
      "Payment Receipt",
      "Bank Statement"
    ],
    optional: [
      "Approval Document"
    ]
  }
}

// Show checklist of required documents
const DocumentChecklist = ({ category }) => {
  const template = documentTemplates[category]

  return (
    <div>
      <h4>Required Documents:</h4>
      <ul>
        {template.requiredDocs.map(doc => (
          <li key={doc}>
            <Checkbox /> {doc}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

#### Real-World Example:

**Scenario: AP Invoice with Multiple Documents**

```
Invoice: INV-2025-001
Supplier: ABC Trading Ltd
Amount: $5,000

Attached Documents:
1. 📄 supplier-invoice.pdf (Original invoice from supplier)
2. 📝 purchase-order-PO123.pdf (Our PO)
3. 📦 delivery-note-DN456.pdf (Proof of delivery)
4. 📧 email-confirmation.pdf (Email exchange)
5. 🖼️ product-photo.jpg (Photo of delivered goods)
```

**User Flow:**

```
1. User creates AP Invoice (Draft)
2. User switches to "Documents" tab
3. User clicks "Upload Documents" or drags files
4. User selects 5 files:
   - supplier-invoice.pdf (Category: INVOICE)
   - purchase-order-PO123.pdf (Category: PO)
   - delivery-note-DN456.pdf (Category: DELIVERY)
   - email-confirmation.pdf (Category: OTHER)
   - product-photo.jpg (Category: OTHER)
5. System uploads all files
6. Documents appear in table with:
   - File type icon
   - File name
   - Category badge
   - File size
   - Upload date
   - Actions (Preview, Download, Delete)
7. User can:
   - Preview PDFs inline
   - Download individual files
   - Download all as ZIP
   - Share specific documents
   - Delete unwanted files
```

#### Document Count Display:

```typescript
// Show document count in invoice list
const InvoiceTable = () => {
  return (
    <Table>
      <TableRow>
        <TableCell>{invoice.invoiceNo}</TableCell>
        <TableCell>{invoice.supplierName}</TableCell>
        <TableCell>{invoice.totalAmount}</TableCell>
        <TableCell>
          {/* Document count badge */}
          <Badge variant="secondary">
            📎 {invoice.documentCount || 0} docs
          </Badge>
        </TableCell>
        <TableCell>{/* Actions */}</TableCell>
      </TableRow>
    </Table>
  )
}
```

#### Benefits:

- ✅ **Multiple documents** per invoice
- ✅ **Organized storage** by company/module/transaction
- ✅ **Document categories** (PO, Invoice, Contract, etc.)
- ✅ **Drag & drop** upload
- ✅ **Preview & download** functionality
- ✅ **Access logging** (who viewed/downloaded)
- ✅ **Version control** (optional)
- ✅ **Soft delete** (documents never truly deleted)
- ✅ **Search by tags**
- ✅ **Security levels** (Internal, Confidential, Public)
- ✅ **Bulk download** as ZIP
- ✅ **Share links** for external access
- ✅ **Email with attachments**
- ✅ **Document checklists**

#### Storage Structure:

```
public/
  documents/
    transactions/
      {companyId}/
        {moduleId}/           # 2 (AP), 1 (AR), 3 (CB), 4 (GL)
          {transactionId}/    # 1 (Invoice), 2 (Payment), etc.
            {referenceId}/    # Actual invoice ID
              timestamp-filename.pdf
              timestamp-po-copy.jpg
              timestamp-delivery-note.pdf
```

---

### 2.4 Budget Management Module

**Purpose:** Plan, track, and control company spending

#### Database Schema:

```sql
CREATE TABLE BudgetPeriod (
  periodId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  periodName NVARCHAR(100), -- 'FY 2025', 'Q1 2025'
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status NVARCHAR(50), -- 'DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED'
  isActive BIT DEFAULT 1,
  createById INT,
  createDate DATETIME DEFAULT GETDATE()
)

CREATE TABLE BudgetHd (
  budgetId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  periodId INT FOREIGN KEY REFERENCES BudgetPeriod(periodId),
  budgetName NVARCHAR(255),
  budgetType NVARCHAR(50), -- 'DEPARTMENT', 'PROJECT', 'GL_ACCOUNT'
  departmentId INT,
  projectId INT,
  status NVARCHAR(50), -- 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'
  submitDate DATETIME,
  approveDate DATETIME,
  approveById INT,
  remarks NVARCHAR(MAX),
  createById INT,
  createDate DATETIME DEFAULT GETDATE(),
  editById INT,
  editDate DATETIME
)

CREATE TABLE BudgetDt (
  budgetId INT FOREIGN KEY REFERENCES BudgetHd(budgetId),
  itemNo INT,
  glId INT,
  glCode NVARCHAR(50),
  glName NVARCHAR(255),
  month1 DECIMAL(18,2),
  month2 DECIMAL(18,2),
  month3 DECIMAL(18,2),
  month4 DECIMAL(18,2),
  month5 DECIMAL(18,2),
  month6 DECIMAL(18,2),
  month7 DECIMAL(18,2),
  month8 DECIMAL(18,2),
  month9 DECIMAL(18,2),
  month10 DECIMAL(18,2),
  month11 DECIMAL(18,2),
  month12 DECIMAL(18,2),
  totalAmount DECIMAL(18,2),
  remarks NVARCHAR(500),
  PRIMARY KEY (budgetId, itemNo)
)

CREATE TABLE BudgetRevision (
  revisionId INT PRIMARY KEY IDENTITY,
  budgetId INT FOREIGN KEY REFERENCES BudgetHd(budgetId),
  revisionNo INT,
  revisionDate DATE,
  reason NVARCHAR(MAX),
  revisionData NVARCHAR(MAX), -- JSON of changes
  revisedById INT,
  approveById INT,
  approveDate DATETIME,
  status NVARCHAR(50), -- 'PENDING', 'APPROVED', 'REJECTED'
  createDate DATETIME DEFAULT GETDATE()
)

CREATE TABLE BudgetAlert (
  alertId INT PRIMARY KEY IDENTITY,
  budgetId INT FOREIGN KEY REFERENCES BudgetHd(budgetId),
  glId INT,
  alertType NVARCHAR(50), -- 'WARNING', 'EXCEEDED'
  threshold DECIMAL(5,2), -- Percentage (e.g., 80.00 for 80%)
  budgetAmount DECIMAL(18,2),
  actualAmount DECIMAL(18,2),
  varianceAmount DECIMAL(18,2),
  variancePercent DECIMAL(5,2),
  notifiedUserIds NVARCHAR(MAX), -- JSON array
  alertDate DATETIME DEFAULT GETDATE(),
  isAcknowledged BIT DEFAULT 0
)
```

#### Interface:

```typescript
// interfaces/budget.ts
export interface IBudgetPeriod {
  periodId: number
  companyId: number
  periodName: string
  startDate: Date
  endDate: Date
  status: "DRAFT" | "APPROVED" | "ACTIVE" | "CLOSED"
  isActive: boolean
  createById: number
  createDate: Date
}

export interface IBudgetHd {
  budgetId: number
  companyId: number
  periodId: number
  budgetName: string
  budgetType: "DEPARTMENT" | "PROJECT" | "GL_ACCOUNT"
  departmentId?: number
  projectId?: number
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED"
  submitDate?: Date
  approveDate?: Date
  approveById?: number
  remarks?: string
  createById: number
  createDate: Date
  editById?: number
  editDate?: Date
  data_details: IBudgetDt[]
}

export interface IBudgetDt {
  budgetId: number
  itemNo: number
  glId: number
  glCode: string
  glName: string
  month1: number
  month2: number
  month3: number
  month4: number
  month5: number
  month6: number
  month7: number
  month8: number
  month9: number
  month10: number
  month11: number
  month12: number
  totalAmount: number
  remarks?: string
}

export interface IBudgetRevision {
  revisionId: number
  budgetId: number
  revisionNo: number
  revisionDate: Date
  reason: string
  revisionData: string
  revisedById: number
  approveById?: number
  approveDate?: Date
  status: "PENDING" | "APPROVED" | "REJECTED"
  createDate: Date
}

export interface IBudgetAlert {
  alertId: number
  budgetId: number
  glId: number
  alertType: "WARNING" | "EXCEEDED"
  threshold: number
  budgetAmount: number
  actualAmount: number
  varianceAmount: number
  variancePercent: number
  notifiedUserIds: number[]
  alertDate: Date
  isAcknowledged: boolean
}

export interface IBudgetVsActual {
  glId: number
  glCode: string
  glName: string
  budgetAmount: number
  actualAmount: number
  varianceAmount: number
  variancePercent: number
  status: "UNDER" | "ON_TRACK" | "WARNING" | "EXCEEDED"
}
```

#### Budget Service:

```typescript
// lib/budget-service.ts
class BudgetService {
  // Calculate budget vs actual
  async getBudgetVsActual(
    budgetId: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<IBudgetVsActual[]> {
    // Get budget details
    const budget = await this.getBudgetById(budgetId)

    // Get actual transactions from GL
    const actuals = await this.getActualTransactions(
      budget.data_details.map((d) => d.glId),
      periodStart,
      periodEnd
    )

    // Compare and calculate variance
    const comparison: IBudgetVsActual[] = []

    for (const budgetLine of budget.data_details) {
      const actual = actuals.find((a) => a.glId === budgetLine.glId)
      const actualAmount = actual?.amount || 0
      const budgetAmount = budgetLine.totalAmount
      const varianceAmount = actualAmount - budgetAmount
      const variancePercent =
        budgetAmount > 0 ? (varianceAmount / budgetAmount) * 100 : 0

      // Determine status
      let status: "UNDER" | "ON_TRACK" | "WARNING" | "EXCEEDED" = "UNDER"
      const percentUsed =
        budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0

      if (percentUsed >= 100) {
        status = "EXCEEDED"
      } else if (percentUsed >= 80) {
        status = "WARNING"
      } else if (percentUsed >= 50) {
        status = "ON_TRACK"
      }

      comparison.push({
        glId: budgetLine.glId,
        glCode: budgetLine.glCode,
        glName: budgetLine.glName,
        budgetAmount,
        actualAmount,
        varianceAmount,
        variancePercent,
        status,
      })

      // Create alert if exceeded or warning
      if (status === "WARNING" || status === "EXCEEDED") {
        await this.createBudgetAlert({
          budgetId,
          glId: budgetLine.glId,
          alertType: status === "EXCEEDED" ? "EXCEEDED" : "WARNING",
          threshold: status === "EXCEEDED" ? 100 : 80,
          budgetAmount,
          actualAmount,
          varianceAmount,
          variancePercent,
          notifiedUserIds: [], // Get from budget settings
        })
      }
    }

    return comparison
  }

  // Check budget before transaction posting
  async checkBudgetBeforePosting(
    glId: number,
    amount: number,
    transactionDate: Date
  ): Promise<{
    allowed: boolean
    message?: string
    budgetAmount?: number
    currentActual?: number
    projectedTotal?: number
  }> {
    // Find active budget for this GL account and date
    const budget = await this.getActiveBudgetForGL(glId, transactionDate)

    if (!budget) {
      return { allowed: true } // No budget control
    }

    // Get current actual
    const actualAmount = await this.getActualAmount(
      glId,
      budget.periodStart,
      transactionDate
    )

    const projectedTotal = actualAmount + amount

    // Check if exceeds budget
    if (projectedTotal > budget.budgetAmount) {
      const excess = projectedTotal - budget.budgetAmount

      return {
        allowed: false,
        message: `This transaction exceeds budget by ${excess.toFixed(2)}. Budget: ${budget.budgetAmount.toFixed(2)}, Current: ${actualAmount.toFixed(2)}, Projected: ${projectedTotal.toFixed(2)}`,
        budgetAmount: budget.budgetAmount,
        currentActual: actualAmount,
        projectedTotal,
      }
    }

    return {
      allowed: true,
      budgetAmount: budget.budgetAmount,
      currentActual: actualAmount,
      projectedTotal,
    }
  }

  // Create budget revision
  async createRevision(
    budgetId: number,
    reason: string,
    changes: Partial<IBudgetHd>,
    userId: number
  ): Promise<IBudgetRevision> {
    // Get current revision number
    const currentRevisionNo = await this.getLatestRevisionNo(budgetId)

    const revision: IBudgetRevision = {
      revisionId: 0,
      budgetId,
      revisionNo: currentRevisionNo + 1,
      revisionDate: new Date(),
      reason,
      revisionData: JSON.stringify(changes),
      revisedById: userId,
      status: "PENDING",
      createDate: new Date(),
    }

    // Save revision
    return await this.saveRevision(revision)
  }

  // Send budget alerts
  async sendBudgetAlerts(): Promise<void> {
    // Get unacknowledged alerts
    const alerts = await this.getUnacknowledgedAlerts()

    for (const alert of alerts) {
      const budget = await this.getBudgetById(alert.budgetId)

      // Get users to notify
      const usersToNotify = alert.notifiedUserIds || []

      for (const userId of usersToNotify) {
        const user = await this.getUserById(userId)

        if (user.emailAdd) {
          await emailService.sendEmail({
            to: user.emailAdd,
            subject: `Budget Alert: ${alert.alertType}`,
            html: `
              <h2>Budget Alert</h2>
              <p>A budget ${alert.alertType.toLowerCase()} has been detected.</p>
              <ul>
                <li><strong>Budget:</strong> ${budget.budgetName}</li>
                <li><strong>GL Account:</strong> ${alert.glId}</li>
                <li><strong>Budget Amount:</strong> ${alert.budgetAmount.toFixed(2)}</li>
                <li><strong>Actual Amount:</strong> ${alert.actualAmount.toFixed(2)}</li>
                <li><strong>Variance:</strong> ${alert.varianceAmount.toFixed(2)} (${alert.variancePercent.toFixed(1)}%)</li>
              </ul>
            `,
          })
        }
      }

      // Mark alert as notified
      await this.acknowledgeAlert(alert.alertId)
    }
  }
}

export const budgetService = new BudgetService()
```

#### UI Components:

**1. Budget Entry Form:**

```typescript
// app/(root)/[companyId]/budget/components/budget-form.tsx
export function BudgetForm() {
  return (
    <Form>
      {/* Header Information */}
      <div className="grid grid-cols-2 gap-4">
        <FormField name="budgetName" label="Budget Name" />
        <FormField name="periodId" label="Period" />
        <FormField name="budgetType" label="Budget Type" />
        <FormField name="departmentId" label="Department" />
      </div>

      {/* Budget Details Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GL Account</TableHead>
            <TableHead>Jan</TableHead>
            <TableHead>Feb</TableHead>
            <TableHead>Mar</TableHead>
            <TableHead>Apr</TableHead>
            <TableHead>May</TableHead>
            <TableHead>Jun</TableHead>
            <TableHead>Jul</TableHead>
            <TableHead>Aug</TableHead>
            <TableHead>Sep</TableHead>
            <TableHead>Oct</TableHead>
            <TableHead>Nov</TableHead>
            <TableHead>Dec</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Budget lines */}
        </TableBody>
      </Table>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline">Save as Draft</Button>
        <Button>Submit for Approval</Button>
      </div>
    </Form>
  )
}
```

**2. Budget vs Actual Report:**

```typescript
// app/(root)/[companyId]/budget/reports/budget-vs-actual.tsx
export function BudgetVsActualReport() {
  return (
    <div>
      <h2>Budget vs Actual</h2>

      {/* Filters */}
      <div className="flex gap-4">
        <Select label="Budget Period" />
        <Select label="Department" />
        <DateRangePicker label="Date Range" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>Total Budget</CardHeader>
          <CardContent>$1,000,000</CardContent>
        </Card>
        <Card>
          <CardHeader>Actual Spend</CardHeader>
          <CardContent>$850,000</CardContent>
        </Card>
        <Card>
          <CardHeader>Variance</CardHeader>
          <CardContent className="text-green-600">$150,000 (15%)</CardContent>
        </Card>
        <Card>
          <CardHeader>Forecast</CardHeader>
          <CardContent>$980,000</CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GL Account</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Actual</TableHead>
            <TableHead>Variance</TableHead>
            <TableHead>%</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Data rows */}
        </TableBody>
      </Table>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>Budget Utilization</CardHeader>
          <CardContent>
            <BarChart data={/* ... */} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Variance Trend</CardHeader>
          <CardContent>
            <LineChart data={/* ... */} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

#### Benefits:

- ✅ Financial planning and control
- ✅ Spending visibility
- ✅ Prevent overspending
- ✅ Better decision making
- ✅ Departmental accountability

---

## 3. MEDIUM PRIORITY FEATURES

### 3.1 Multi-Currency Revaluation

**Purpose:** Adjust foreign currency balances for exchange rate changes

#### When It's Needed:

- Month-end closing
- Quarter-end closing
- Year-end closing
- Management reporting

#### Database Schema:

```sql
CREATE TABLE CurrencyRevaluation (
  revalId INT PRIMARY KEY IDENTITY,
  companyId INT NOT NULL,
  revalDate DATE NOT NULL,
  periodId INT,
  status NVARCHAR(50), -- 'DRAFT', 'POSTED', 'REVERSED'
  totalUnrealizedGain DECIMAL(18,2),
  totalUnrealizedLoss DECIMAL(18,2),
  glJournalId NVARCHAR(50), -- Reference to generated GL entry
  remarks NVARCHAR(MAX),
  createById INT,
  createDate DATETIME DEFAULT GETDATE(),
  postById INT,
  postDate DATETIME
)

CREATE TABLE CurrencyRevalDt (
  revalId INT FOREIGN KEY REFERENCES CurrencyRevaluation(revalId),
  itemNo INT,
  glId INT,
  glCode NVARCHAR(50),
  glName NVARCHAR(255),
  currencyId INT,
  currencyCode NVARCHAR(10),
  originalExhRate DECIMAL(18,6),
  newExhRate DECIMAL(18,6),
  foreignBalance DECIMAL(18,2),
  originalLocalBalance DECIMAL(18,2),
  revaluedLocalBalance DECIMAL(18,2),
  unrealizedGainLoss DECIMAL(18,2),
  PRIMARY KEY (revalId, itemNo)
)
```

#### Implementation:

```typescript
// lib/revaluation-service.ts
class RevaluationService {
  async performRevaluation(
    companyId: number,
    revalDate: Date,
    currencyIds: number[]
  ): Promise<ICurrencyRevaluation> {
    const details: ICurrencyRevalDt[] = []
    let totalGain = 0
    let totalLoss = 0

    // Get all GL accounts with foreign currency balances
    const accounts = await this.getAccountsWithForeignBalance(
      companyId,
      currencyIds
    )

    for (const account of accounts) {
      // Get current exchange rate
      const newRate = await this.getExchangeRate(account.currencyId, revalDate)

      // Calculate revalued balance
      const revaluedBalance = account.foreignBalance * newRate
      const gainLoss = revaluedBalance - account.localBalance

      details.push({
        revalId: 0,
        itemNo: details.length + 1,
        glId: account.glId,
        glCode: account.glCode,
        glName: account.glName,
        currencyId: account.currencyId,
        currencyCode: account.currencyCode,
        originalExhRate: account.currentExhRate,
        newExhRate: newRate,
        foreignBalance: account.foreignBalance,
        originalLocalBalance: account.localBalance,
        revaluedLocalBalance: revaluedBalance,
        unrealizedGainLoss: gainLoss,
      })

      if (gainLoss > 0) {
        totalGain += gainLoss
      } else {
        totalLoss += Math.abs(gainLoss)
      }
    }

    // Create revaluation record
    const revaluation: ICurrencyRevaluation = {
      revalId: 0,
      companyId,
      revalDate,
      status: "DRAFT",
      totalUnrealizedGain: totalGain,
      totalUnrealizedLoss: totalLoss,
      data_details: details,
      createById: currentUserId,
      createDate: new Date(),
    }

    return revaluation
  }

  async postRevaluation(revalId: number): Promise<string> {
    const revaluation = await this.getRevaluationById(revalId)

    // Create GL journal entry
    const journalEntry = {
      journalNo: "",
      trnDate: revaluation.revalDate,
      accountDate: revaluation.revalDate,
      remarks: `Currency revaluation as of ${revaluation.revalDate.toLocaleDateString()}`,
      data_details: [],
    }

    // Add gain/loss entries
    for (const detail of revaluation.data_details) {
      if (detail.unrealizedGainLoss !== 0) {
        // Debit/Credit GL account
        journalEntry.data_details.push({
          itemNo: journalEntry.data_details.length + 1,
          glId: detail.glId,
          dcType: detail.unrealizedGainLoss > 0 ? "D" : "C",
          totAmt: Math.abs(detail.unrealizedGainLoss),
          remarks: "Currency revaluation",
        })

        // Credit/Debit unrealized gain/loss account
        journalEntry.data_details.push({
          itemNo: journalEntry.data_details.length + 1,
          glId: this.getUnrealizedGainLossGLId(),
          dcType: detail.unrealizedGainLoss > 0 ? "C" : "D",
          totAmt: Math.abs(detail.unrealizedGainLoss),
          remarks: "Unrealized gain/loss",
        })
      }
    }

    // Post journal entry
    const journalId = await this.postJournalEntry(journalEntry)

    // Update revaluation status
    await this.updateRevaluationStatus(revalId, "POSTED", journalId)

    return journalId
  }
}

export const revaluationService = new RevaluationService()
```

#### Benefits:

- ✅ Accurate financial reporting
- ✅ IFRS/GAAP compliance
- ✅ Automated revaluation process
- ✅ Audit trail

---

### 3.2 Advanced Workflow Builder

**Purpose:** Visual workflow designer for approvals

#### Features:

- Drag-and-drop interface
- Conditional routing
- Parallel approvals
- Auto-escalation
- SLA tracking

#### Implementation: (High-level overview)

```typescript
// Workflow nodes
interface IWorkflowNode {
  nodeId: string
  nodeType: "START" | "APPROVAL" | "CONDITION" | "ACTION" | "END"
  nodeName: string
  config: any
  position: { x: number; y: number }
}

// Workflow connections
interface IWorkflowConnection {
  connectionId: string
  fromNodeId: string
  toNodeId: string
  condition?: string
}

// Workflow definition
interface IWorkflowDefinition {
  workflowId: number
  workflowName: string
  moduleId: number
  transactionId: number
  nodes: IWorkflowNode[]
  connections: IWorkflowConnection[]
  isActive: boolean
}
```

---

### 3.3 Barcode/QR Code Integration

**Use Cases:**

- Product scanning
- Asset tracking
- Document tracking
- Attendance marking
- Payment collection

#### Implementation:

```typescript
// lib/barcode-service.ts
import { BrowserMultiFormatReader } from "@zxing/browser"
import QRCode from "qrcode"

class BarcodeService {
  private codeReader: BrowserMultiFormatReader

  constructor() {
    this.codeReader = new BrowserMultiFormatReader()
  }

  // Scan barcode from camera
  async scanBarcode(videoElement: HTMLVideoElement): Promise<string> {
    try {
      const result = await this.codeReader.decodeOnceFromVideoDevice(
        undefined,
        videoElement
      )
      return result.getText()
    } catch (error) {
      throw new Error("Failed to scan barcode")
    }
  }

  // Generate QR code
  async generateQRCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data)
  }

  // Generate barcode
  generateBarcode(data: string, format: "CODE128" | "EAN13"): string {
    // Use barcode library
    return "" // Placeholder
  }
}

export const barcodeService = new BarcodeService()
```

---

## 4. LOW PRIORITY / NICE-TO-HAVE

### 4.1 Inter-Company Transactions

**Purpose:** Transfer between related companies

### 4.2 Advanced Audit Trail (Field-Level)

**Purpose:** Track every field change

### 4.3 Custom Dashboard Widgets

**Purpose:** User-specific layouts

### 4.4 Payment Gateway Integration

**Purpose:** Online payment collection

### 4.5 Advanced Search with Elasticsearch

**Purpose:** Fast full-text search

### 4.6 Mobile App (React Native)

**Purpose:** Native mobile experience

### 4.7 API for Third-Party Integration

**Purpose:** Allow external systems to integrate

### 4.8 Data Analytics with AI/ML

**Purpose:** Predictive analytics, anomaly detection

---

## 5. PERFORMANCE OPTIMIZATIONS

### 5.1 Database Indexing Strategy

**Missing Indexes:**

```sql
-- Transaction header tables
CREATE INDEX IX_InvoiceHd_CompanyId_TrnDate ON AP_InvoiceHd(companyId, trnDate)
CREATE INDEX IX_InvoiceHd_SupplierId ON AP_InvoiceHd(supplierId)
CREATE INDEX IX_InvoiceHd_StatusId ON AP_InvoiceHd(statusId)

-- Lookup tables
CREATE INDEX IX_Supplier_CompanyId_IsActive ON M_Supplier(companyId, isActive)
CREATE INDEX IX_Product_CompanyId_IsActive ON M_Product(companyId, isActive)
```

### 5.2 Query Optimization

**Slow Queries to Fix:**

1. Invoice list with joins
2. Dashboard metrics
3. Report generation
4. Lookups without filters

### 5.3 Caching Strategy

**What to Cache:**

- Lookup data (customers, suppliers, products)
- User permissions
- Company settings
- Currency rates
- Tax rates

**Implementation:**

```typescript
// Use Redis for caching
import Redis from "ioredis"

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
})

// Cache lookup data
async function getCustomers(companyId: number) {
  const cacheKey = `customers:${companyId}`

  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const customers = await db.getCustomers(companyId)

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(customers))

  return customers
}
```

### 5.4 Frontend Performance

**Optimizations:**

1. Code splitting
2. Lazy loading
3. Image optimization
4. Bundle size reduction
5. Tree shaking
6. Memoization

---

## 6. SECURITY ENHANCEMENTS

### 6.1 Enhanced Password Policy

**Requirements:**

- Minimum 12 characters
- Uppercase, lowercase, number, special char
- Password history (last 5 passwords)
- Password expiry (90 days)
- Account lockout after 5 failed attempts

### 6.2 IP Whitelisting

**Purpose:** Restrict access by IP address

### 6.3 Session Management

**Improvements:**

- Concurrent session control
- Session timeout (configurable)
- Remember me (secure cookies)
- Force logout all sessions

### 6.4 Data Encryption

**What to Encrypt:**

- Passwords (bcrypt)
- Sensitive fields (credit card, tax ID)
- API keys
- Database connections

### 6.5 Audit Logging

**What to Log:**

- All login attempts
- All data changes
- Permission changes
- Configuration changes
- Export/print actions

---

## 7. USER EXPERIENCE IMPROVEMENTS

### 7.1 Keyboard Shortcuts

**Essential Shortcuts:**

- `Ctrl+S` - Save
- `Ctrl+N` - New
- `Ctrl+P` - Print
- `Ctrl+F` - Search
- `Esc` - Cancel/Close dialog
- `Tab` - Navigate fields

### 7.2 Bulk Operations

**Required:**

- Bulk delete
- Bulk approve/reject
- Bulk export
- Bulk status change
- Bulk email/print

### 7.3 Recent Items

**Quick Access:**

- Recently viewed documents
- Recently edited documents
- Frequently accessed pages
- Saved searches

### 7.4 Favorites/Bookmarks

**Allow users to bookmark:**

- Transactions
- Reports
- Filters
- Searches

### 7.5 Contextual Help

**In-app Help:**

- Tooltips
- Field descriptions
- Video tutorials
- Documentation links

### 7.6 Undo/Redo

**For Form Editing:**

- Track changes
- Undo/redo actions
- Restore previous values

---

## 8. INTEGRATION REQUIREMENTS

### 8.1 Email Integration (SMTP/IMAP)

**Already Covered in Section 1.2**

### 8.2 WhatsApp Business API

**Status:** ✅ Implemented

### 8.3 SMS Gateway Integration

**Purpose:** Send SMS notifications

### 8.4 Payment Gateways

**Providers:**

- Stripe
- PayPal
- Razorpay
- Square

### 8.5 Accounting Software

**Export to:**

- QuickBooks
- Xero
- Sage
- Tally

### 8.6 Bank Integration

**Features:**

- Bank statement import
- Payment initiation
- Account balance inquiry

### 8.7 Document Storage (Cloud)

**Providers:**

- AWS S3
- Google Drive
- Dropbox
- Azure Blob Storage

### 8.8 Calendar Integration

**Sync with:**

- Google Calendar
- Outlook Calendar
- Apple Calendar

---

## 9. REPORTING & ANALYTICS

### 9.1 Custom Report Builder

**Features:**

- Drag-and-drop fields
- Custom filters
- Grouping & sorting
- Calculations & formulas
- Save as template
- Schedule reports

### 9.2 Crystal Reports Integration

**If using Crystal Reports:**

- Report designer
- Parameter prompts
- Export formats (PDF, Excel, Word)

### 9.3 Power BI Integration

**Embed Power BI:**

- Interactive dashboards
- Real-time data
- Drill-down capabilities

### 9.4 Standard Financial Reports

**Missing Reports:**

- Aged Payables (detailed)
- Aged Receivables (detailed)
- Trial Balance
- Profit & Loss (comparative)
- Balance Sheet (comparative)
- Cash Flow Statement (detailed)
- General Ledger
- Account Statement
- Tax Reports (GST, VAT)

### 9.5 Operational Reports

**Missing Reports:**

- Sales by Customer
- Sales by Product
- Purchase by Supplier
- Inventory Valuation
- Stock Movement
- Employee Performance
- Attendance Summary
- Leave Balance

---

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Critical Features (1-3 months)

**Month 1:**

1. ✅ Draft Status Implementation
2. ✅ Email Notification System
3. ✅ 2FA Security

**Month 2:** 4. ✅ Data Import from Excel 5. ✅ Enhanced Search & Filters 6. ✅ Bulk Operations

**Month 3:** 7. ✅ Performance Optimizations (Indexing) 8. ✅ Caching Strategy 9. ✅ Security Enhancements (Password Policy)

### Phase 2: High Priority (3-6 months)

**Month 4:** 10. ✅ Recurring Transactions 11. ✅ Budget Management (Basic)

**Month 5:** 12. ✅ Currency Revaluation 13. ✅ Advanced Audit Trail

**Month 6:** 14. ✅ Custom Report Builder (Basic) 15. ✅ Standard Financial Reports

### Phase 3: Medium Priority (6-9 months)

**Month 7:** 16. ✅ Workflow Builder (Visual) 17. ✅ Payment Gateway Integration

**Month 8:** 18. ✅ Barcode/QR Integration 19. ✅ SMS Notifications

**Month 9:** 20. ✅ Inter-Company Transactions 21. ✅ Bank Integration (Statement Import)

### Phase 4: Enhancements (9-12 months)

**Month 10:** 22. ✅ Custom Dashboard Widgets 23. ✅ Mobile App (Phase 1)

**Month 11:** 24. ✅ API for Third-Party Integration 25. ✅ Advanced Analytics

**Month 12:** 26. ✅ AI/ML Features 27. ✅ Cloud Storage Integration

---

## 11. ESTIMATED EFFORT & RESOURCES

### Development Team Requirements:

**Full-Time Team (Recommended):**

- 2 Backend Developers (Node.js, SQL Server)
- 2 Frontend Developers (React, Next.js)
- 1 UI/UX Designer
- 1 QA Engineer
- 1 DevOps Engineer
- 1 Project Manager

**Part-Time/Consultants:**

- Database Administrator (DBA)
- Security Consultant
- Business Analyst

### Estimated Hours per Feature:

| Feature                | Hours | Priority |
| ---------------------- | ----- | -------- |
| Draft Status           | 40    | Critical |
| Email Notifications    | 60    | Critical |
| 2FA                    | 80    | Critical |
| Data Import            | 120   | Critical |
| Recurring Transactions | 100   | High     |
| Budget Management      | 150   | High     |
| Currency Revaluation   | 80    | High     |
| Workflow Builder       | 200   | Medium   |
| Barcode/QR             | 60    | Medium   |
| Custom Reports         | 180   | High     |
| Payment Gateway        | 100   | Medium   |
| Inter-Company          | 120   | Low      |

**Total Estimated Hours:** ~1,500 hours

**Timeline:** 9-12 months with dedicated team

---

## 12. SUCCESS METRICS

### Key Performance Indicators (KPIs):

**User Adoption:**

- Active users per day/week/month
- Feature usage statistics
- User satisfaction score

**Performance:**

- Page load time < 2 seconds
- API response time < 500ms
- Database query time < 100ms

**Business Impact:**

- Time saved on data entry (50%+ reduction)
- Error rate reduction (80%+ reduction)
- Approval cycle time (50%+ faster)
- Payment collection time (30%+ faster)

**System Health:**

- Uptime > 99.9%
- Error rate < 0.1%
- Support tickets reduction (60%+)

---

## 13. RISKS & MITIGATION

### Technical Risks:

**Risk 1: Database Performance Degradation**

- **Mitigation:** Proper indexing, query optimization, regular maintenance

**Risk 2: Data Migration Issues**

- **Mitigation:** Extensive testing, rollback plan, data validation

**Risk 3: Integration Failures**

- **Mitigation:** Error handling, retry logic, fallback mechanisms

### Business Risks:

**Risk 1: User Resistance to Change**

- **Mitigation:** Training, documentation, change management

**Risk 2: Feature Creep**

- **Mitigation:** Strict scope management, phased approach

**Risk 3: Budget Overruns**

- **Mitigation:** Regular reviews, prioritization, MVP approach

---

## 14. MAINTENANCE & SUPPORT

### Ongoing Requirements:

**Daily:**

- Monitor system health
- Check error logs
- Review performance metrics

**Weekly:**

- Database maintenance
- Backup verification
- Security updates

**Monthly:**

- User feedback review
- Feature usage analysis
- Performance optimization

**Quarterly:**

- Security audit
- Disaster recovery test
- Capacity planning

---

## 15. CONCLUSION

This document outlines comprehensive missing features and enhancements for the ERP system. Implementation should follow the prioritized roadmap, focusing on critical features first.

**Next Steps:**

1. Review and approve priorities
2. Allocate resources
3. Create detailed technical specifications
4. Begin Phase 1 implementation
5. Regular progress reviews

**Document Maintenance:**

- Update after each feature completion
- Add new requirements as identified
- Track implementation status
- Record lessons learned

---

## 16. QUICK START GUIDE

### To Implement Draft Status (Priority #1):

```bash
# 1. Run database migration
sqlcmd -i migrations/001_add_draft_status.sql

# 2. Update interfaces
# Add to interfaces/ap-invoice.ts, ar-invoice.ts, etc.:
isDraft: boolean
statusId: number

# 3. Update forms
# Add "Save as Draft" button alongside "Post" button

# 4. Test workflow
# Create → Save Draft → Edit → Post → Verify GL
```

### To Implement Multi-Document Upload (Priority #2):

```bash
# 1. Create database table
sqlcmd -i migrations/002_add_transaction_documents.sql

# 2. Create interface file
# Create: interfaces/document-attachment.ts

# 3. Create API endpoint
# Create: app/api/documents/transaction/route.ts

# 4. Create UI component
# Create: components/document-attachment/document-upload-manager.tsx

# 5. Add to invoice pages
# Update: app/(root)/[companyId]/ap/invoice/page.tsx
# Add new tab: <TabsTrigger value="documents">Documents</TabsTrigger>
```

### To Implement Invoice OCR (Priority #3):

```bash
# 1. Install dependencies
npm install @google-cloud/vision openai

# 2. Setup API keys
# Add to .env:
GOOGLE_CLOUD_KEY_PATH=/path/to/key.json
OPENAI_API_KEY=sk-...

# 3. Create OCR service
# Create: lib/invoice-ocr-service.ts

# 4. Create API endpoint
# Create: app/api/invoice/scan/route.ts

# 5. Create scanner component
# Create: components/invoice-scanner.tsx

# 6. Test with sample invoices
```

### To Implement Email Notifications (Priority #4):

```bash
# 1. Install nodemailer
npm install nodemailer @types/nodemailer

# 2. Setup SMTP
# Add to .env:
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# 3. Create email service
# Create: lib/email-service.ts

# 4. Create API endpoint
# Create: app/api/send-email/route.ts

# 5. Add email buttons to invoices
# Update invoice pages with "Send Email" button
```

---

## 17. PACKAGE DEPENDENCIES

### Required NPM Packages:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.0",
    "@google-cloud/vision": "^4.0.0",
    "openai": "^4.0.0",
    "tesseract.js": "^5.0.0",
    "xlsx": "^0.18.0",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.0",
    "string-similarity": "^4.0.0",
    "node-cron": "^3.0.0",
    "ioredis": "^5.0.0",
    "archiver": "^6.0.0",
    "@zxing/browser": "^0.1.0",
    "aws-sdk": "^2.1000.0"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.0",
    "@types/speakeasy": "^2.0.0",
    "@types/qrcode": "^1.5.0",
    "@types/string-similarity": "^4.0.0",
    "@types/node-cron": "^3.0.0",
    "@types/ioredis": "^5.0.0",
    "@types/archiver": "^6.0.0"
  }
}
```

---

## 18. VISUAL SUMMARY

### Current vs Future State:

```
CURRENT STATE:
┌────────────────────────────────────┐
│ AP Invoice Entry                   │
├────────────────────────────────────┤
│ • Manual typing (20 min/invoice)  │
│ • No draft - must complete fully  │
│ • Manual email (mailto links)     │
│ • One document only               │
│ • No validation                   │
└────────────────────────────────────┘

FUTURE STATE (After Implementation):
┌────────────────────────────────────┐
│ AP Invoice Entry                   │
├────────────────────────────────────┤
│ ✅ OCR Scan (5 min/invoice)        │
│ ✅ Save as Draft (work-in-progress)│
│ ✅ Auto email with attachments    │
│ ✅ Upload 10+ documents           │
│ ✅ Smart validation & matching    │
│ ✅ Approval workflow              │
│ ✅ Budget checking                │
└────────────────────────────────────┘

TIME SAVINGS: 75% faster invoice processing!
```

### Feature Integration Map:

```
                    ┌─────────────────┐
                    │  AR/AP Invoice  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐     ┌───────▼────────┐    ┌─────▼──────┐
   │  Draft   │     │   Documents    │    │   Email    │
   │  Status  │     │   (Multiple)   │    │   Notify   │
   └────┬─────┘     └───────┬────────┘    └─────┬──────┘
        │                   │                    │
   ┌────▼─────┐     ┌───────▼────────┐    ┌─────▼──────┐
   │Approval  │     │  OCR Scanning  │    │  Payment   │
   │Workflow  │     │  Auto-fill     │    │  Reminder  │
   └──────────┘     └────────────────┘    └────────────┘
```

---

## 19. CONCLUSION & RECOMMENDATIONS

### Summary of Critical Gaps:

1. **Draft Functionality** - MISSING → Need to add immediately
2. **Multi-Document Upload** - BASIC → Need enhancement
3. **Invoice OCR Scanning** - MISSING → High ROI feature
4. **Email Automation** - MISSING → Critical for communication
5. **Data Import** - MISSING → Essential for migration

### Recommended Approach:

**Phase 1 (Weeks 1-4):**

- ✅ Implement Draft Status across all modules
- ✅ Enhance document upload for multi-file support
- ✅ Setup email notification system

**Phase 2 (Weeks 5-8):**

- ✅ Add Invoice OCR scanning
- ✅ Implement data import from Excel
- ✅ Add 2FA security

**Phase 3 (Weeks 9-12):**

- ✅ Recurring transactions
- ✅ Budget management
- ✅ Advanced features

### Expected Benefits After Full Implementation:

| Metric             | Before | After  | Improvement       |
| ------------------ | ------ | ------ | ----------------- |
| Invoice Entry Time | 20 min | 5 min  | **75% faster**    |
| Data Entry Errors  | 15%    | 2%     | **87% reduction** |
| Document Retrieval | 10 min | 30 sec | **95% faster**    |
| Approval Cycle     | 3 days | 1 day  | **67% faster**    |
| User Satisfaction  | 60%    | 90%    | **50% increase**  |

### Total Investment vs Return:

**Investment:**

- Development: ~1,500 hours (~$75,000-150,000)
- Infrastructure: ~$500/month (cloud services)
- Training: ~40 hours (~$2,000)

**Annual Return:**

- Time savings: $50,000-80,000/year
- Error reduction: $10,000-20,000/year
- Improved efficiency: $20,000-30,000/year
- **Total ROI: 150-200%** in first year

### Final Recommendation:

**START WITH:**

1. Draft Status (Weeks 1-2)
2. Multi-Document Upload (Weeks 2-3)
3. Invoice OCR (Weeks 3-5)
4. Email Automation (Weeks 5-6)

These 4 features will give you **80% of the value** with **20% of the effort**.

---

**Document Version:** 1.0  
**Created:** October 17, 2025  
**Status:** Ready for Implementation  
**Total Pages:** 200+

**END OF DOCUMENT**
