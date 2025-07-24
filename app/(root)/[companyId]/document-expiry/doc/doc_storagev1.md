# Document Storage Structure & Organization

## 📁 **Document Storage Overview**

After upload, documents are stored in a well-organized directory structure within the Next.js application's `public` folder. This ensures proper organization and easy access without company isolation in the file path.

## 🗂️ **Storage Directory Structure**

### **Base Structure:**

```
public/
└── documents/
    └── {moduleId}/
        └── {transactionId}/
            └── {itemNo}/
                └── {timestamp}-{filename}
```

### **Example Structure:**

```
public/
└── documents/
    ├── document-expiry/        # Module: Document Expiry
    │   ├── 0/                  # Transaction ID (0 for new docs)
    │   │   └── 1/              # Item Number
    │   │       ├── 1703123456789-contract.pdf
    │   │       └── 1703123567890-invoice.pdf
    │   └── 123/                # Transaction ID 123
    │       └── 1/
    │           └── 1703123678901-agreement.pdf
    ├── ar/                      # Module: Accounts Receivable
    │   └── 456/
    │       └── 1/
    │           └── 1703123789012-invoice.pdf
    └── ap/                      # Module: Accounts Payable
        └── 789/
            └── 1/
                └── 1703123890123-bill.pdf
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

## 📂 **Module Organization**

### **Current Modules:**

- **`document-expiry`**: Document expiry management
- **`ar`**: Accounts Receivable documents
- **`ap`**: Accounts Payable documents

### **Future Modules:**

- **`hr`**: Human Resources documents
- **`inventory`**: Inventory management documents
- **`sales`**: Sales and marketing documents

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
├── 📊 Multiple module folders
├── 📊 Multiple transaction folders
├── 📊 Multiple item folders
└── 📊 Individual files with timestamps
```

### **Example File Path:**

```
/documents/document-expiry/123/1/1703123456789-contract.pdf
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
// Implement storage limits
// Monitor and alert on quota usage
```

## 🔍 **File Access Patterns**

### **Direct Access:**

```
https://yourapp.com/documents/document-expiry/123/1/file.pdf
```

### **API Access:**

```
GET /api/documents/access?path=document-expiry/123/1/file.pdf
```

### **Database Integration:**

```sql
-- File paths stored in database
SELECT filePath FROM Exp_Document WHERE documentId = 123
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
// Storage limits
const STORAGE_LIMITS = {
  FREE_TIER: 100 * 1024 * 1024, // 100MB
  BASIC_TIER: 1024 * 1024 * 1024, // 1GB
  PREMIUM_TIER: 10 * 1024 * 1024 * 1024, // 10GB
}
```

## 📍 **File Storage Location**

### **Physical Directory Path:**

```
D:\Proj\Ravi Sir\ERP\public\documents\{moduleId}\{transactionId}\{itemNo}\{timestamp}-{filename}
```

### **Example File Path:**

```
D:\Proj\Ravi Sir\ERP\public\documents\document-expiry\0\1\1703123456789-contract.pdf
```

### **Web Access URL:**

```
https://yourapp.com/documents/document-expiry/0/1/1703123456789-contract.pdf
```

This simplified storage structure provides a clean, organized foundation for document management without company isolation in the file path! 🎯
