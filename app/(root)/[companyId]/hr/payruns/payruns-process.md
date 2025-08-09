# Pay Runs Module

This module provides a comprehensive payroll management system similar to Zoho Payroll, with features for creating, processing, and managing pay runs.

## Features

### 1. Run Payroll Tab

- **Process Pay Run Card**: Shows current month's pay run status
- **Employee Net Pay**: Displays "YET TO PROCESS" status
- **Payment Date**: Shows the payment date for the current period
- **Employee Count**: Number of employees in the pay run
- **Create Pay Run Button**: Initiates new pay run creation

### 2. Payroll History Tab

- **Payment Date**: Date when payroll was processed
- **Payroll Type**: Type of payroll (Regular, Bonus, Overtime, Commission)
- **Details**: Payroll period and employee count with total amount
- **Status**: Current status (PAID, PROCESSING, etc.)

### 3. Pay Run Form

- **Payroll Type Selection**: Regular, Bonus, Overtime, Commission
- **Date Range**: Start date, end date, and payment date
- **Employee Count**: Number of employees included
- **Total Amount**: Total payroll amount
- **Validation**: Comprehensive form validation with Zod

## Components

### `ProcessPayRunCard`

- Displays current pay run information
- Shows status badges (READY, PROCESSING, etc.)
- Includes action buttons for processing

### `PayRunHistoryTable`

- Tabular display of payroll history
- Shows payment dates, types, periods, and status
- Includes employee count and total amounts

### `PayRunForm`

- Modal dialog for creating new pay runs
- Form validation with Zod schemas
- Date picker components for date selection

## API Integration

### Hook: `usePayRun`

Provides the following functions:

- `createPayRun()`: Create new pay run
- `processPayRun()`: Process existing pay run
- `fetchPayRuns()`: Get all pay runs
- `updatePayRun()`: Update pay run details
- `deletePayRun()`: Delete pay run
- `approvePayRun()`: Approve pay run

### API Endpoints

- `GET /api/payrun/payruns` - Fetch pay runs
- `POST /api/payrun/payruns` - Create pay run
- `PUT /api/payrun/payruns/{id}` - Update pay run
- `DELETE /api/payrun/payruns/{id}` - Delete pay run
- `PUT /api/payrun/payruns/{id}/process` - Process pay run
- `PUT /api/payrun/payruns/{id}/approve` - Approve pay run
- `GET /api/payrun/dashboard` - Get dashboard data

## Data Models

### `IPayRun`

```typescript
{
  id: number
  payrollType: string
  startDate: Date
  endDate: Date
  paymentDate: Date
  employeeCount: number
  totalAmount: number
  status: string // 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'PAID' | 'CANCELLED'
  processedBy?: number
  processedDate?: Date
  approvedBy?: number
  approvedDate?: Date
  remarks?: string
}
```

### `IPayRunHistory`

```typescript
{
  id: number
  paymentDate: string
  payrollType: string
  payrollPeriod: string
  status: string
  totalAmount: number
  employeeCount: number
}
```

## Validation Schemas

### `payRunFormSchema`

- Validates payroll type, dates, employee count, and amounts
- Ensures start date ≤ end date ≤ payment date
- Validates amount ranges and employee count limits

## Usage

1. **Navigate to Pay Runs**: Access via HR module
2. **View Current Pay Run**: Check the "Run Payroll" tab for current month
3. **Create New Pay Run**: Click "Create Pay Run" button
4. **Process Pay Run**: Use the process button to execute payroll
5. **View History**: Check "Payroll History" tab for past runs

## Status Flow

1. **DRAFT** → Initial state when created
2. **PROCESSING** → When pay run is being processed
3. **APPROVED** → When pay run is approved
4. **PAID** → When payment is completed
5. **CANCELLED** → If pay run is cancelled

## Payroll Types

- **Regular Payroll**: Standard monthly payroll
- **Bonus Payroll**: Bonus payments
- **Overtime Payroll**: Overtime payments
- **Commission Payroll**: Commission-based payments

## Responsive Design

The module is fully responsive and works on:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Future Enhancements

- Multi-level approval workflow
- Email notifications
- Payment scheduling
- Advanced reporting
- Integration with banking systems
- Mobile app support
- Document upload for pay stubs
- Tax calculation integration
