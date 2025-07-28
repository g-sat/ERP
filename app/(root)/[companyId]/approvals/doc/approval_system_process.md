# Approval System Implementation

This document describes the approval system implementation for the ERP application.

## Overview

The approval system allows users to submit requests that require approval through a configurable workflow. The system supports multiple approval levels, different user roles, and provides a comprehensive UI for managing approvals.

## Database Schema

### Tables

1. **ApprovalProcess** - Defines approval processes for different modules
2. **ApprovalLevel** - Defines approval levels within each process
3. **ApprovalRequest** - Stores individual approval requests
4. **ApprovalAction** - Tracks actions taken on approval requests

### Key Relationships

- Each approval process can have multiple levels
- Each request follows a specific process
- Actions are recorded for each level of approval
- Users are assigned roles that determine their approval capabilities

## Frontend Implementation

### Components

1. **ApprovalsPage** (`app/(root)/[companyId]/approvals/page.tsx`)

   - Main page with tabs for pending approvals and user requests
   - Shows approval statistics and request lists

2. **ApprovalRequestTable** (`components/approval-request-table.tsx`)

   - Displays approval requests in a table format
   - Provides quick actions for approvers
   - Shows status badges and icons

3. **ApprovalDetailDialog** (`components/approval-detail-dialog.tsx`)

   - Detailed view of an approval request
   - Shows approval workflow and history
   - Allows approvers to take actions with remarks

4. **ApprovalDashboard** (`components/approval-dashboard.tsx`)
   - Shows approval statistics
   - Displays counts for pending, approved, and rejected requests

### Hooks

**useApproval** (`hooks/use-approval.ts`)

- Manages approval-related state and operations
- Provides functions for fetching requests and taking actions
- Handles API communication with proper headers

### Interfaces

**approval.ts** (`interfaces/approval.ts`)

- Defines TypeScript interfaces for all approval-related data
- Includes constants for status types and action types
- Provides type safety throughout the application

## User Roles and Permissions

### Role Hierarchy

- **Admin (Role ID: 1)** - Can approve at any level
- **Manager (Role ID: 2)** - Can approve at manager level
- **Clerk (Role ID: 3)** - Can view requests but cannot approve

### Status Types

- **1401** - Approved
- **1402** - Pending
- **1403** - Rejected

### Action Types

- **1401** - Approved
- **1403** - Rejected

## API Endpoints

The system expects the following backend API endpoints:

### GET /approval/my-requests

- Returns requests submitted by the current user
- Headers: X-User-Id, X-Company-Id

### GET /approval/pending-approvals

- Returns pending approvals for the current user
- Headers: X-User-Id, X-Company-Id

### GET /approval/request/{requestId}

- Returns detailed information about a specific request
- Headers: X-User-Id, X-Company-Id

### POST /approval/take-action

- Submits an approval action (approve/reject)
- Body: { requestId, levelId, statusId, remarks? }
- Headers: X-User-Id, X-Company-Id

## Usage Flow

### For Requesters

1. Requests are automatically created by the backend when needed
2. Users can view their requests in the "My Requests" tab
3. They can track the status and see approval history
4. No manual request creation is needed

### For Approvers

1. View pending approvals in the "Pending Approvals" tab
2. Click "View" to see request details
3. Take action (approve/reject) with optional remarks
4. View approval history and workflow status

## Features

### User-Friendly Interface

- Clean, modern design with intuitive navigation
- Status badges with color coding
- Icons for visual clarity
- Responsive design for different screen sizes

### Approval Workflow

- Multi-level approval support
- Visual workflow representation
- Action history tracking
- Remarks and comments support

### Security

- Role-based access control
- User authentication required
- Company-specific data isolation
- Proper authorization checks

### Real-time Updates

- Automatic refresh after actions
- Loading states and error handling
- Optimistic UI updates

## Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_DEFAULT_REGISTRATION_ID` - Default registration ID

### Authentication

- Uses JWT tokens stored in cookies
- User information stored in Zustand store
- Automatic token refresh handling

## Error Handling

- Network error handling with user-friendly messages
- Loading states for better UX
- Validation of user permissions
- Graceful fallbacks for missing data

## Future Enhancements

1. **Email Notifications** - Notify users of approval status changes
2. **Mobile App** - Native mobile application for approvals
3. **Advanced Filtering** - Date range, status, and process filters
4. **Bulk Actions** - Approve/reject multiple requests at once
5. **Approval Templates** - Predefined approval workflows
6. **Audit Trail** - Comprehensive logging of all actions
7. **Integration** - Connect with other ERP modules

## Troubleshooting

### Common Issues

1. **No pending approvals shown**

   - Check user role and permissions
   - Verify backend API is working
   - Check network connectivity

2. **Cannot take approval action**

   - Verify user has appropriate role
   - Check if request is still pending
   - Ensure proper authorization headers

3. **Data not loading**
   - Check authentication status
   - Verify company selection
   - Check browser console for errors

### Debug Information

- All API calls include user ID and company ID headers
- Error messages are displayed in the UI
- Network requests can be monitored in browser dev tools
- Zustand store state can be inspected in Redux dev tools

## Support

For technical support or questions about the approval system, please refer to the development team or create an issue in the project repository.
