# Employee Photo Upload Feature

## Overview

The employee photo upload feature allows users to upload and manage employee profile pictures directly in the employee form. Photos are stored as base64 encoded strings in the database and displayed in both the form and the employee table.

## Features

### Photo Upload Component (`PhotoUpload`)

- **Location**: `components/ui-custom/photo-upload.tsx`
- **Purpose**: Handles image selection, preview, and conversion to base64 format
- **Features**:
  - Image file validation (JPG, PNG, GIF)
  - File size limit (5MB max)
  - Automatic image resizing (max 400x400px)
  - Image compression (JPEG quality 0.8)
  - Preview functionality
  - Remove photo option

### Integration Points

#### 1. Employee Form (`employee-form.tsx`)

- **Photo Upload Section**: Added to both create and edit forms
- **Form Integration**: Uses `form.watch("employeePhoto")` and `form.setValue("employeePhoto", base64Photo)`
- **Display**: Shows current photo or placeholder when no photo exists

#### 2. Employee Table (`employee-table.tsx`)

- **Photo Column**: New column displays employee photos as circular thumbnails
- **Fallback**: Shows "No Photo" placeholder when no photo exists
- **Responsive**: 40x40px circular images with proper styling

#### 3. Database Schema

- **Field**: `employeePhoto` (string) - stores base64 encoded image data
- **Format**: `data:image/jpeg;base64,{base64String}`
- **Validation**: Optional field in employee schema

## Technical Implementation

### Image Processing

```typescript
// Convert file to Base64 with optional resizing
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // Create canvas for resizing and compression
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // Resize if needed (max 400x400px)
      // Compress to JPEG quality 0.8
      // Return base64 string
    }
  })
}
```

### Form Integration

```typescript
<PhotoUpload
  currentPhoto={form.watch("employeePhoto")}
  onPhotoChange={(base64Photo) => form.setValue("employeePhoto", base64Photo)}
  isDisabled={isReadOnly}
  label="Employee Photo"
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
            src={`data:image/jpeg;base64,${photo}`}
            alt="Employee photo"
            className="h-10 w-10 rounded-full object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No Photo</span>
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
3. **Preview**: Image will be automatically resized and displayed
4. **Save**: Photo is automatically included when saving employee
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

app/(root)/[companyId]/master/employee/
├── components/
│   ├── employee-form.tsx     # Form with photo upload
│   └── employee-table.tsx    # Table with photo display
├── doc/
│   └── photo-upload.md       # This documentation
└── page.tsx                  # Main employee page
```

## Benefits

- **User-Friendly**: Simple drag-and-drop or click-to-upload interface
- **Performance**: Automatic image optimization and compression
- **Responsive**: Works well on different screen sizes
- **Consistent**: Follows existing UI patterns and styling
- **Accessible**: Proper alt text and keyboard navigation support

## Future Enhancements

- **Crop Tool**: Allow users to crop images before upload
- **Multiple Formats**: Support for WebP and other modern formats
- **Bulk Upload**: Upload photos for multiple employees at once
- **Photo Gallery**: View all employee photos in a gallery format
- **Photo History**: Track changes to employee photos over time
