# Pay Schedule Feature

## Overview

The Pay Schedule feature allows HR administrators to configure the organization's payroll schedule, including working days, salary calculation methods, pay dates, and first payroll period settings.

## Features Implemented

- **Work Week Configuration**: Select which days of the week are considered working days
- **Pay Frequency**: Configure monthly payroll frequency
- **Working Days Per Month**: Set the number of working days per month for salary calculations
- **Pay Day Configuration**: Choose between last working day or specific day of the month
- **First Payroll Period**: Set the starting period for payroll processing
- **First Pay Date**: Configure the initial pay date for the organization
- **Edit Version Tracking**: Track changes to the pay schedule configuration

## File Structure

```
app/(root)/[companyId]/hr/setting/pay-schedule/
├── page.tsx                           # Main page component
├── components/
│   ├── pay-schedule-form.tsx         # Form component for creating/editing
│   └── pay-schedule-view.tsx         # Read-only view component
└── README.md                         # This documentation
```

## API Endpoints

The feature uses the following API endpoints defined in `lib/api-routes.ts`:

```typescript
export const PaySchedule = {
  get: "/hr/getpayschedule",
  getByCompany: "/hr/getpayschedulebycompany",
  add: "/hr/savepayschedule",
  update: "/hr/savepayschedule",
  delete: "/hr/deletepayschedule",
}
```

## Data Model

### IPaySchedule Interface

```typescript
export interface IPaySchedule {
  payscheduleId: number
  companyId: number
  workWeek?: string | null // Comma-separated working days (e.g., "MON,TUE,WED,THU,FRI")
  isMonthly: boolean // Whether payroll is monthly
  salaryCalculationBasis?: string | null // Method for salary calculation
  workingDaysPerMonth?: number | null // Number of working days per month
  isPayOn: boolean // Pay on last working day (true) or specific day (false)
  payDayOfMonth?: number | null // Specific day of month for payment
  firstPayPeriod: string | Date // First payroll period start date
  firstPayDate: string | Date // First pay date
  createDate: string | Date // Creation timestamp
  editDate?: string | Date // Last edit timestamp
  editVersion: number // Version number for tracking changes
}
```

### PayScheduleFormData Schema

```typescript
export const payScheduleSchema = z.object({
  payscheduleId: z.number().int().nonnegative(),
  companyId: z.number().int().min(0).max(255),
  workWeek: z
    .string()
    .max(200)
    .nullable()
    .optional()
    .default("MON,TUE,WED,THU,FRI,SAT,SUN"),
  isMonthly: z.boolean(),
  workingDaysPerMonth: z.number().int().min(0).max(31).nullable().optional(),
  isPayOn: z.boolean(),
  payDayOfMonth: z.number().int().min(1).max(31).nullable().optional(),
  firstPayPeriod: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  firstPayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
})
```

## Usage

### Main Page (`page.tsx`)

The main page displays:

- Current pay schedule configuration
- Warning about editing restrictions after first pay run
- Edit button for existing configurations
- "Configure Pay Schedule" button for new setups
- Upcoming payroll preview

### Form Component (`pay-schedule-form.tsx`)

The form includes:

- **Work Week Selection**: Toggle buttons for each day of the week
- **Working Days Per Month**: Dropdown to select number of working days (1-31)
- **Pay Day Configuration**: Radio buttons for last working day vs specific day
- **First Pay Period**: Month/year selector for payroll start
- **First Pay Date**: Calendar picker for initial pay date

### View Component (`pay-schedule-view.tsx`)

Read-only display showing:

- Working days configuration
- Pay frequency setting
- Working days per month
- Pay day method and specific day
- First pay period and date
- Edit version information

## Important Notes

1. **Edit Restrictions**: Once the first pay run is processed, the pay schedule cannot be edited
2. **Date Formats**: All dates are stored in ISO format (YYYY-MM-DD)
3. **Working Days**: Stored as comma-separated string (e.g., "MON,TUE,WED,THU,FRI")
4. **Validation**: Form includes comprehensive validation for all fields
5. **Company Context**: All operations are scoped to the current company

## UI Components Used

- **Dialog**: For form and view modals
- **Button**: For actions and day selection
- **Select**: For dropdown selections
- **RadioGroup**: For pay day method selection
- **Calendar**: For date picking
- **Form**: For form validation and submission
- **Alert**: For warning messages

## Dependencies

- `react-hook-form`: Form state management
- `@hookform/resolvers/zod`: Zod schema validation
- `date-fns`: Date manipulation and formatting
- `lucide-react`: Icons
- `@/components/ui/*`: Shadcn UI components

## Future Enhancements

1. **Pay Frequency Options**: Support for weekly, bi-weekly, and custom frequencies
2. **Holiday Integration**: Automatic holiday detection and pay day adjustment
3. **Multiple Pay Schedules**: Support for different schedules per department
4. **Audit Trail**: Detailed history of pay schedule changes
5. **Notification System**: Alerts for upcoming payroll dates
6. **Export/Import**: Configuration backup and restore functionality
