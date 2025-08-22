# Document Expiry Management System

This module provides a comprehensive document expiry management system with modern UI components and full CRUD operations.

## Features

### 🎯 Core Functionality

- **Document Management**: Create, read, update, and delete documents
- **Expiry Tracking**: Monitor document expiry dates with visual indicators
- **Status Management**: Track document status (Draft, Submitted, Approved, Rejected, etc.)
- **File Upload**: Support for PDF, JPEG, PNG, and DOCX files
- **Entity Integration**: Link documents to various entity types (Employee, Company, Vehicle, etc.)
- **Separated Forms**: Header and details forms with dialog-based detail management

### 📊 Dashboard

- **Statistics Overview**: Total documents, expiring soon, expired, verified counts
- **Visual Indicators**: Progress bars and status badges
- **Recent Activity**: Latest document updates
- **Quick Actions**: Common operations at your fingertips
- **Enhanced Metrics**: Pending review, rejected, and file upload statistics

### 🔍 Advanced Features

- **Search & Filter**: Find documents by status, entity type, and keywords
- **Bulk Operations**: Handle multiple documents efficiently
- **Export Functionality**: Generate reports and export data
- **Responsive Design**: Works seamlessly on all devices
- **Dialog-based Details**: Add/edit document details in modal dialogs

## File Structure

```
document/
├── components/
│   ├── document-expiry-dashboard.tsx    # Main dashboard with statistics
│   ├── document-table.tsx               # Data table with filtering
│   ├── document-form.tsx                # Header form only
│   ├── document-details-form.tsx        # Dialog-based details form
│   ├── document-details-table.tsx       # Details table component
│   └── index.ts                         # Component exports
├── page.tsx                             # Main page with navigation and DocumentView
└── README.md                            # This file
```

## Components

### DocumentExpiryDashboard

Modern dashboard with:

- Statistics cards showing key metrics (Total, Expiring Soon, Expired, Verified)
- Additional stats (Pending Review, Rejected, With Files)
- Progress indicators for expiring/expired/verified documents
- Status overview with visual badges
- Recent activity feed with proper status calculation
- Quick action buttons

### DocumentTable

Comprehensive data table featuring:

- Search functionality
- Status and entity type filtering
- Sortable columns
- Action dropdown for each row
- Expiry status indicators
- Responsive design
- Proper null checks and error handling

### DocumentForm

Header-only form for creating/editing documents:

- Entity type selection with dynamic entity input
- Reference number and document Name
- Status management (Draft, Submitted, Approved, Rejected)
- Complete/Active checkboxes
- Conditional details section (only shows after header is saved)
- Integration with details table and dialog

### DocumentDetailsForm

Dialog-based form for managing document details:

- Document type selection
- Document number and version
- Issue and expiry dates
- File upload functionality
- Status and renewal requirements
- Remarks and attestation status
- API integration with `document/saveuniversaldocumentdetails`

### DocumentDetailsTable

Table component for displaying document details:

- Document type, number, version information
- Issue and expiry dates with formatting
- Status badges with color coding
- Expiry status indicators
- File upload status
- Action dropdown (View, Edit, Download, Delete)

### DocumentView

Read-only view component for displaying document information:

- Header information display
- Document details in card format
- Formatted dates and status information
- File type and renewal requirement display
- Remarks section

## API Integration

### Response Format

All API endpoints return responses in the following format:

```typescript
{
  result: number // 1 for success, 0 for failure
  message: string // Success/error message
  data: object | array // Response data
}
```

### Endpoints Used

- `GET /document/getuniversaldocuments` - Fetch all documents
- `GET /document/getuniversaldocumentbyid/{id}` - Get document by ID
- `POST /document/saveuniversaldocument` - Create/update document header
- `POST /document/saveuniversaldocumentdetails` - Save document details
- `DELETE /document/deleteuniversaldocument/{id}` - Delete document
- `GET /document/getuniversaldocumentsbyentity/{entityTypeId}/{entity}` - Get documents by entity
- `GET /document/getexpiringdocuments/{daysThreshold}` - Get documents expiring within specified days
- `GET /document/getexpireddocuments` - Get expired documents
- `GET /master/getentitytypelookup` - Get entity types for autocomplete
- `GET /master/getdocumenttypelookup` - Get document types for autocomplete

### Custom Hooks

- `useGetUniversalDocuments(filters?)` - Fetch all documents with optional filters
- `useGetUniversalDocumentById(documentId)` - Fetch document by ID
- `useGetDocumentsByEntity(entityTypeId, entity)` - Fetch documents by entity
- `usePersistUniversalDocument()` - Create/update document header
- `usePersistDocumentDetails()` - Save document details
- `useDeleteUniversalDocument()` - Delete document
- `useGetExpiringDocuments(daysThreshold?)` - Get documents expiring within specified days (default: 30)
- `useGetExpiredDocuments()` - Get expired documents
- `useEntityTypeLookup()` - Get entity types for autocomplete
- `useDocumentTypeLookup()` - Get document types for autocomplete

### Response Handling

The hooks automatically handle the API response format and extract the data. For example:

```typescript
const { data: response } = useGetUniversalDocuments()
const documents = response?.data || [] // Access the documents array
```

## Data Models

### UniversalDocumentsHd (Header)

```typescript
{
  documentId: number
  entityTypeId: number
  entity: string
  companyId: number
  documentName: string | null
  isComplete: boolean
  status: "Draft" | "Submitted" | "Approved" | "Rejected"
  isActive: boolean
  referenceNumber: string | null
  data_details: IUniversalDocumentDt[]
}
```

### UniversalDocumentDt (Detail)

```typescript
{
  documentId: number
  docTypeId: number
  companyId: number
  versionNo: number
  documentNo: string | null
  issueDate: string | null
  expiryDate: string | null
  filePath: string | null
  fileType: "PDF" | "JPEG" | "PNG" | "DOCX" | null
  remarks: string | null
  renewalRequired: boolean
}
```

## File Storage

Documents are stored in the `public/documents/document-expiry/` directory as specified in the requirements. The system automatically:

- Detects file types from uploaded files
- Generates appropriate file paths
- Handles file upload validation

## Usage

### Basic Navigation

1. **Dashboard**: View statistics and recent activity
2. **Documents**: Browse all documents with filtering
3. **Create**: Add new documents with header and details

### Creating a Document

1. Navigate to the Create tab
2. Fill in header information (Entity Type, Entity ID, etc.)
3. Save the header to enable details section
4. Click "Add Detail" to open dialog
5. Fill in detail information and upload files
6. Save details (calls `document/saveuniversaldocumentdetails`)

### Managing Documents

- **View**: Click the eye icon to see full details
- **Edit**: Click the edit icon to modify documents
- **Delete**: Use the dropdown menu to remove documents
- **Filter**: Use search and filter options to find specific documents
- **Details**: Manage document details through dialog interface

## Validation

The system uses Zod schemas for comprehensive validation:

- Required fields validation
- Date format validation
- File type restrictions
- Status constraints
- Data type validation

## Responsive Design

All components are fully responsive and work on:

- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes

## Dependencies

All required dependencies are already installed:

- React Hook Form for form management
- Zod for validation
- TanStack Query for API calls
- Lucide React for icons
- Shadcn/ui components
- Date-fns for date handling

## Key Features

### Separated Header and Details

- Header form handles basic document information
- Details are managed separately through dialog interface
- Better user experience with focused forms

### Enhanced Dashboard

- Comprehensive statistics with proper calculations
- Color-coded metrics for quick scanning
- Real-time status based on actual document properties

### Dialog-based Details Management

- Modal dialogs for adding/editing details
- File upload integration
- API calls to dedicated details endpoint

### Improved Navigation

- Unified header with name and tabs
- Consistent navigation across all views
- Better visual hierarchy

## Future Enhancements

Potential improvements:

- Bulk document operations
- Advanced reporting
- Email notifications for expiring documents
- Document versioning
- Approval workflows
- Integration with external systems
- Enhanced file management
- Document templates
