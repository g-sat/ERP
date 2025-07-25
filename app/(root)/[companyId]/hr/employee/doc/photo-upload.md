# Employee Photo Upload Feature

## Overview

The employee photo upload feature allows users to upload and manage employee profile pictures directly in the employee form. Photos are stored as files in the server's file system and displayed in both the form and the employee table.

## Features

### Photo Upload Component (`PhotoUpload`)

- **Location**: `components/ui-custom/photo-upload.tsx`
- **Purpose**: Handles image selection, upload to server, and display
- **Features**:
  - Image file validation (JPG, PNG, GIF)
  - File size limit (5MB max)
  - Automatic server-side storage
  - Preview functionality
  - Remove photo option
  - Support for both employee and profile photo types

### Integration Points

#### 1. Employee Form (`employee-form.tsx`)

- **Photo Upload Section**: Added to both create and edit forms
- **Form Integration**: Uses `form.watch("employeePhoto")` and `form.setValue("employeePhoto", filePath)`
- **Display**: Shows current photo or default placeholder when no photo exists

#### 2. Employee Table (`employee-table.tsx`)

- **Photo Column**: New column displays employee photos as circular thumbnails
- **Fallback**: Shows default employee photo when no photo exists
- **Responsive**: 40x40px circular images with proper styling

#### 3. Database Schema

- **Field**: `employeePhoto` (string) - stores file path to uploaded image
- **Format**: `/uploads/employee/{timestamp}-{filename}.{extension}`
- **Validation**: Optional field in employee schema

## Technical Implementation

### File Storage Structure

```
public/
└── uploads/
    ├── employee/           # Employee photos
    │   ├── default.png     # Default employee photo
    │   └── {timestamp}-{filename}.{extension}
    └── avatars/           # Profile photos
        ├── default.png     # Default profile photo
        └── {timestamp}-{filename}.{extension}
```

### API Endpoint

- **Upload**: `POST /api/photos/upload`
- **Parameters**:
  - `file`: Image file
  - `photoType`: "employee" or "profile"
  - `userId`: User ID for reference

### Form Integration

```typescript
<PhotoUpload
  currentPhoto={form.watch("employeePhoto")}
  onPhotoChange={(filePath) => form.setValue("employeePhoto", filePath)}
  isDisabled={isReadOnly}
  label="Employee Photo"
  photoType="employee"
  userId={employeeId}
/>
```

### Table Display

```typescript
{
  accessorKey: "employeePhoto",
  header: "Photo",
  cell: ({ row }) => {
    const photo = row.getValue("employeePhoto") as string
    return (
      <div className="flex items-center justify-center">
        {photo ? (
          <img
            src={
              photo.startsWith("data:") || photo.length > 100
                ? `data:image/jpeg;base64,${photo}`
                : photo
            }
            alt="Employee photo"
            className="h-10 w-10 rounded-full object-cover border"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/uploads/employee/default.png"
            }}
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
            <img
              src="/uploads/employee/default.png"
              alt="Default employee photo"
              className="h-10 w-10 rounded-full object-cover"
            />
          </div>
        )}
      </div>
    )
  }
}
```

## Usage

### For Users

1. **Upload Photo**: Click "Choose Photo" button in employee form
2. **Select Image**: Choose JPG, PNG, or GIF file (max 5MB)
3. **Preview**: Image will be automatically uploaded and displayed
4. **Save**: Photo path is automatically included when saving employee
5. **Remove**: Click the X button to remove current photo

### For Developers

1. **Import Component**: `import PhotoUpload from "@/components/ui-custom/photo-upload"`
2. **Add to Form**: Include PhotoUpload component in form layout
3. **Handle Changes**: Use `onPhotoChange` callback to update form state
4. **Display in Table**: Add photo column to table definition

## File Structure

```
components/ui-custom/
├── photo-upload.tsx          # Main photo upload component

app/api/photos/
├── upload/
│   └── route.ts              # Photo upload API endpoint

app/(root)/[companyId]/hr/employee/
├── components/
│   ├── employee-form.tsx     # Form with photo upload
│   └── employee-table.tsx    # Table with photo display

public/uploads/
├── employee/
│   └── default.png           # Default employee photo
└── avatars/
    └── default.png           # Default profile photo
```

## Migration from Base64

The system now supports both legacy base64 storage and new file path storage:

- **Legacy Support**: Existing base64 photos continue to work
- **New Uploads**: All new photos are stored as files
- **Automatic Detection**: System detects format and displays appropriately
- **Fallback**: Default images shown when photos fail to load

## Benefits

1. **Better Performance**: File storage is more efficient than base64
2. **Reduced Database Size**: File paths instead of large base64 strings
3. **Easier Management**: Files can be managed separately from database
4. **CDN Ready**: Files can be served from CDN for better performance
5. **Backup Friendly**: Files can be backed up independently
