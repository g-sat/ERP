# Document Storage Structure & Organization

## 📁 **Document Storage Overview**

After upload, documents are stored in a mixed directory structure within the Next.js application's `public` folder. This structure uses company isolation for business modules (ar, ap, cb, gl, common) but keeps document-expiry simple without company isolation.

## 🗂️ **Storage Directory Structure**

### **Mixed Structure:**

```
public/
└── documents/
    ├── {companyId}/              # Company-specific folders
    │   ├── ar/                   # Accounts Receivable
    │   ├── ap/                   # Accounts Payable
    │   ├── cb/                   # Cash Book
    │   ├── gl/                   # General Ledger
    │   └── common/               # Common documents
    └── document-expiry/          # Document expiry (no company isolation)
```

### **Example Structure:**

```
public/
└── documents/
    ├── 1/                        # Company ID 1
    │   ├── ar/                   # Accounts Receivable
    │   │   ├── 0/
    │   │   │   └── 1/
    │   │   │       └── 1703123456789-invoice.pdf
    │   │   └── 123/
    │   │       └── 1/
    │   │           └── 1703123567890-receipt.pdf
    │   ├── ap/                   # Accounts Payable
    │   │   └── 456/
    │   │       └── 1/
    │   │           └── 1703123678901-bill.pdf
    │   ├── cb/                   # Cash Book
    │   │   └── 789/
    │   │       └── 1/
    │   │           └── 1703123789012-payment.pdf
    │   ├── gl/                   # General Ledger
    │   │   └── 101/
    │   │       └── 1/
    │   │           └── 1703123890123-journal.pdf
    │   └── common/               # Common documents
    │       └── 202/
    │           └── 1/
    │               └── 1703123901234-policy.pdf
    ├── 2/                        # Company ID 2
    │   ├── ar/
    │   │   └── 0/
    │   │       └── 1/
    │   │           └── 1703124012345-invoice.pdf
    │   └── ap/
    │       └── 456/
    │           └── 1/
    │               └── 1703124123456-bill.pdf
    └── document-expiry/          # No company isolation
        ├── 0/
        │   └── 1/
        │       ├── 1703124234567-contract.pdf
        │       └── 1703124345678-agreement.pdf
        └── 123/
            └── 1/
                └── 1703124456789-policy.pdf
```

## 🔧 **File Naming Convention**

### **File Name Format:**

```
{timestamp}-{originalName}
```

### **Example:**

- **Original File:** `Contract_2024.pdf`
- **Stored As:** `1703123456789-Contract_2024.pdf`

### **Benefits:**

- **Unique Names:** Timestamp ensures no filename conflicts
- **Original Name Preserved:** Easy to identify original file
- **Sortable:** Files can be sorted by upload time
- **SEO Friendly:** No special characters in URLs

## 🏢 **Module Classification**

### **Modules WITH Company Isolation:**

- **`ar`**: Accounts Receivable documents
- **`ap`**: Accounts Payable documents
- **`cb`**: Cash Book documents
- **`gl`**: General Ledger documents
- **`common`**: Common/shared documents

### **Modules WITHOUT Company Isolation:**

- **`document-expiry`**: Document expiry management

### **Why Mixed Structure?**

- **Business Modules**: Require company isolation for data privacy and security
- **Document Expiry**: Global document management across all companies
- **Flexibility**: Different modules can have different storage requirements

## 🔄 **Transaction ID Usage**

### **Transaction ID Values:**

- **`0`**: New documents (not yet saved to database)
- **`{documentId}`**: Existing documents with database ID
- **`{invoiceId}`**: Documents linked to specific transactions

### **Benefits:**

- **Linking:** Documents can be linked to specific business transactions
- **Organization:** Related documents grouped together
- **Cleanup:** Easy to identify orphaned files

## 📊 **Storage Statistics**

### **File Organization:**

```
📁 documents/
├── 📊 Multiple company folders (for business modules)
├── 📊 5 business modules per company (ar, ap, cb, gl, common)
├── 📊 1 global module (document-expiry)
├── 📊 Multiple transaction folders
├── 📊 Multiple item folders
└── 📊 Individual files with timestamps
```

### **Example File Paths:**

#### **Business Modules (with companyId):**

```
/documents/1/ar/123/1/1703123456789-invoice.pdf
/documents/1/ap/456/1/1703123567890-bill.pdf
/documents/2/cb/789/1/1703123678901-payment.pdf
```

#### **Document Expiry (without companyId):**

```
/documents/document-expiry/123/1/1703123789012-contract.pdf
```

## 🔒 **Security Considerations**

### **Current Security:**

- **Public Access:** Files in `public` directory are directly accessible
- **URL Structure:** Predictable file paths
- **No Authentication:** No built-in access control

### **Recommended Security Improvements:**

#### **1. Access Control Middleware**

```typescript
// Add authentication check for document access
export function GET(request: NextRequest) {
  const user = getCurrentUser(request)
  const filePath = request.nextUrl.searchParams.get("path")

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // For business modules, check company access
  if (
    filePath.includes("/ar/") ||
    filePath.includes("/ap/") ||
    filePath.includes("/cb/") ||
    filePath.includes("/gl/") ||
    filePath.includes("/common/")
  ) {
    const companyId = extractCompanyIdFromPath(filePath)
    if (user.companyId !== companyId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }
  }

  // Serve file with proper headers
}
```

#### **2. File Access API**

```typescript
// Create secure file access endpoint
// /api/documents/access/{filePath}
// Validates user permissions before serving files
```

#### **3. File Encryption**

```typescript
// Encrypt sensitive documents
// Store encryption keys securely
// Decrypt on-demand with proper authentication
```

## 🚀 **Performance Optimizations**

### **Current Optimizations:**

- **Directory Creation:** Automatic directory creation with `mkdir -p`
- **File Validation:** Pre-upload validation to prevent invalid files
- **Progress Tracking:** Real-time upload progress feedback

### **Future Optimizations:**

#### **1. File Compression**

```typescript
// Compress large files before storage
// For images
import { PDFDocument } from "pdf-lib"
import sharp from "sharp"

// For PDFs
```

#### **2. CDN Integration**

```typescript
// Use CDN for better performance
const cdnUrl = process.env.CDN_URL
const fileUrl = `${cdnUrl}/documents/${filePath}`
```

#### **3. File Caching**

```typescript
// Cache frequently accessed files
// Implement cache headers for static files
```

## 📈 **Storage Management**

### **File Cleanup Strategies:**

#### **1. Orphaned File Cleanup**

```typescript
// Remove files not linked to database records
// Run periodic cleanup jobs
```

#### **2. Expired Document Cleanup**

```typescript
// Remove documents past retention period
// Archive instead of delete for compliance
```

#### **3. Storage Quotas**

```typescript
// Implement per-company storage limits for business modules
// Global limits for document-expiry
```

## 🔍 **File Access Patterns**

### **Direct Access:**

#### **Business Modules:**

```
https://yourapp.com/documents/1/ar/123/1/file.pdf
https://yourapp.com/documents/1/ap/456/1/file.pdf
```

#### **Document Expiry:**

```
https://yourapp.com/documents/document-expiry/123/1/file.pdf
```

### **API Access:**

```
GET /api/documents/access?path=1/ar/123/1/file.pdf
GET /api/documents/access?path=document-expiry/123/1/file.pdf
```

### **Database Integration:**

```sql
-- File paths stored in database
SELECT filePath FROM Exp_Document WHERE documentId = 123
SELECT filePath FROM ArInvoice WHERE invoiceId = 456
```

## 📋 **Best Practices**

### **File Management:**

1. **Always validate** file types and sizes before upload
2. **Use descriptive names** for better organization
3. **Implement proper error handling** for upload failures
4. **Monitor storage usage** and implement quotas
5. **Regular backup** of document storage

### **Security:**

1. **Validate user permissions** before file access
2. **Implement file access logging** for audit trails
3. **Use HTTPS** for all file transfers
4. **Consider file encryption** for sensitive documents
5. **Regular security audits** of file access patterns

### **Performance:**

1. **Optimize file sizes** before storage
2. **Use appropriate file formats** for different content types
3. **Implement caching** for frequently accessed files
4. **Monitor upload/download speeds** and optimize as needed
5. **Consider CDN** for global file distribution

## 🔧 **Configuration**

### **Environment Variables:**

```env
# File upload settings
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,gif,doc,docx,xls,xlsx
UPLOAD_DIR=public/documents

# Security settings
ENABLE_FILE_ENCRYPTION=false
REQUIRE_AUTHENTICATION=true
```

### **Storage Limits:**

```typescript
// Per-company storage limits for business modules
const BUSINESS_MODULE_LIMITS = {
  FREE_TIER: 100 * 1024 * 1024, // 100MB
  BASIC_TIER: 1024 * 1024 * 1024, // 1GB
  PREMIUM_TIER: 10 * 1024 * 1024 * 1024, // 10GB
}

// Global limits for document-expiry
const DOCUMENT_EXPIRY_LIMITS = {
  TOTAL_STORAGE: 50 * 1024 * 1024 * 1024, // 50GB
}
```

## 📍 **File Storage Location**

### **Physical Directory Path:**

#### **Business Modules:**

```
D:\Proj\Ravi Sir\ERP\public\documents\{companyId}\{moduleId}\{transactionId}\{itemNo}\{timestamp}-{filename}
```

#### **Document Expiry:**

```
D:\Proj\Ravi Sir\ERP\public\documents\document-expiry\{transactionId}\{itemNo}\{timestamp}-{filename}
```

### **Example File Paths:**

#### **Business Module:**

```
D:\Proj\Ravi Sir\ERP\public\documents\1\ar\123\1\1703123456789-invoice.pdf
```

#### **Document Expiry:**

```
D:\Proj\Ravi Sir\ERP\public\documents\document-expiry\123\1\1703123456789-contract.pdf
```

### **Web Access URLs:**

#### **Business Module:**

```
https://yourapp.com/documents/1/ar/123/1/1703123456789-invoice.pdf
```

#### **Document Expiry:**

```
https://yourapp.com/documents/document-expiry/123/1/1703123456789-contract.pdf
```

This mixed storage structure provides the flexibility to handle different module requirements while maintaining security and organization! 🎯
