# Document Expiry Management - Upload & Access Guide

## Overview

The Document Expiry Management module provides comprehensive functionality for uploading, managing, and accessing documents with expiry tracking. This guide explains how to upload documents and access them.

## 📁 Document Upload

### How to Upload Documents

1. **Navigate to Document Expiry Module**

   - Go to the main navigation sidebar
   - Click on "Document Expiry" under the main menu

2. **Add Document Information**

   - Fill in the document form on the left side:
     - **Document Name**: Enter a descriptive name
     - **Document Type ID**: Specify the document type (numeric ID)
     - **Expiry Date**: Select the expiry date
     - **Remarks**: Add any additional notes (optional)

3. **Upload Document File**

   - In the "Document Upload" section below the form:
     - Click "Select File" to choose a document
     - Supported formats: PDF, Images (JPG, PNG, GIF), Word (DOC, DOCX), Excel (XLS, XLSX)
     - Maximum file size: 10MB
     - The file will be validated automatically

4. **Complete Upload**
   - Click "Upload Document" button
   - Progress bar will show upload status
   - Success message will appear when complete
   - The file path will be automatically saved with the document

### Upload Features

- **File Validation**: Automatic validation of file type and size
- **Progress Tracking**: Real-time upload progress indicator
- **Error Handling**: Clear error messages for failed uploads
- **File Management**: Remove selected files before upload
- **Current File Display**: Shows existing document if available

## 📖 Document Access

### How to Access Documents

1. **View Document List**

   - All documents are displayed in the "Document List" table
   - Each document shows: ID, Name, Type, Expiry Date, Status, and Document actions

2. **Document Actions Available**
   - **View Document**: Click the eye icon to preview the document
   - **Download Document**: Click the download icon to save the file locally
   - **Delete Document**: Click the trash icon to remove the document

### Document Viewer Features

- **Modal Preview**: Documents open in a modal dialog for easy viewing
- **File Type Support**:
  - **PDF**: Direct preview in embedded viewer
  - **Images**: Full-size image display
  - **Other Formats**: Download option with preview unavailable message
- **Download Integration**: Direct download from preview modal
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Technical Implementation

### File Storage Structure

Documents are stored in the following directory structure:

```
public/
└── company/
    └── document/
        └── document-expiry/
            └── {transactionId}/
                └── {itemNo}/
                    └── {timestamp}-{filename}
```

### API Endpoints

- **Upload**: `POST /api/documents/upload`
- **Get Documents**: `GET /api/document/GetExpDocument`
- **Save Document**: `POST /api/document/SaveExpDocument`
- **Delete Document**: `DELETE /api/document/DeleteExpDocument/{documentId}`

### File Path Handling

- File paths are stored in the `filePath` field of the `ExpDocument` interface
- Paths are relative to the public directory for easy access
- Automatic path generation based on module, transaction ID, and timestamp

## 🎯 Use Cases

### Scenario 1: Adding a New Contract

1. Fill in contract details (name, type, expiry date)
2. Upload the contract PDF file
3. Save the document
4. The contract will appear in the list with expiry tracking

### Scenario 2: Reviewing Expiring Documents

1. Check the "Expiry Reminders" section
2. Documents expiring within 30 days are highlighted
3. Click view/download to access the document
4. Take action based on expiry status

### Scenario 3: Document Management

1. Use the document list to view all documents
2. Filter by status (Active/Expired)
3. Access documents directly from the list
4. Delete outdated documents as needed

## 🛡️ Security & Validation

### File Security

- File type validation (whitelist approach)
- File size limits (10MB maximum)
- Secure file storage in public directory
- No direct database file storage

### Access Control

- Company-based document isolation
- User authentication required
- Proper error handling for unauthorized access

## 📱 User Interface Features

### Responsive Design

- Works on desktop, tablet, and mobile devices
- Adaptive layout for different screen sizes
- Touch-friendly interface for mobile users

### User Experience

- Loading states for all operations
- Success/error notifications
- Intuitive icon-based actions
- Clear visual feedback for all interactions

## 🔄 Integration with Existing System

### Common Hooks Usage

- Uses `useGet` for fetching documents
- Uses `usePersist` for creating/updating documents
- Uses `useDelete` for removing documents
- Consistent with other modules in the ERP system

### Navigation Integration

- Accessible from main sidebar navigation
- Proper routing with company ID context
- Consistent styling with other modules

## 🚀 Future Enhancements

### Planned Features

- Bulk document upload
- Document versioning
- Advanced search and filtering
- Email notifications for expiring documents
- Document approval workflows
- Integration with external storage services

### Performance Optimizations

- Lazy loading for large document lists
- Image compression for uploaded files
- Caching for frequently accessed documents
- Background processing for large uploads

## 📞 Support

For technical support or questions about document management:

- Check the console for error messages
- Verify file format and size requirements
- Ensure proper permissions for file uploads
- Contact system administrator for access issues
