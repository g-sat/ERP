# Loan Management System

A comprehensive loan management system for employees and approvers with full CRUD operations, approval workflows, and dashboard analytics.

## Features

### For Employees

- **Loan Application Management**: Create, edit, and submit loan applications
- **Application Tracking**: View status and progress of submitted applications
- **Loan Calculator**: Built-in calculator to estimate monthly payments and total interest
- **Personal Dashboard**: Overview of personal loan statistics and recent activities
- **Document Management**: Upload supporting documents for loan applications

### For Approvers

- **Application Review**: Review and approve/reject loan applications
- **Approval Workflow**: Multi-level approval process with comments and reasons
- **Loan Management**: Manage active loans and track repayments
- **Analytics Dashboard**: Comprehensive overview of loan portfolio
- **Risk Assessment**: Debt-to-income ratio calculations and warnings

### General Features

- **Multi-role Support**: Separate interfaces for employees and approvers
- **Real-time Updates**: Live status updates and notifications
- **Advanced Filtering**: Search and filter applications by various criteria
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Validation**: Comprehensive form validation with error handling

## System Architecture

### Components Structure

```
loan/
├── components/
│   ├── loan-dashboard.tsx          # Main dashboard component
│   ├── loan-application-form.tsx   # Application form
│   ├── loan-approval-form.tsx      # Approval/rejection form
│   └── loan-applications-table.tsx # Applications table with filters
├── dummy-loan-data.ts              # Sample data for testing
├── page.tsx                        # Main loan page
└── README.md                       # This documentation
```

### Data Models

#### Loan Application

```typescript
interface ILoanApplication {
  applicationId: number
  employeeId: number
  loanType: string // 'Personal' | 'Housing' | 'Vehicle' | 'Education' | 'Emergency'
  requestedAmount: number
  purpose: string
  repaymentPeriod: number
  monthlyIncome: number
  existingLoans: number
  applicationDate: Date
  status: string // 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected'
  // ... additional fields
}
```

#### Loan

```typescript
interface ILoan {
  loanId: number
  employeeId: number
  loanType: string
  loanAmount: number
  interestRate: number
  monthlyPayment: number
  totalPayable: number
  status: string // 'Active' | 'Paid' | 'Defaulted'
  // ... additional fields
}
```

#### Loan Repayment

```typescript
interface ILoanRepayment {
  repaymentId: number
  loanId: number
  paymentDate: Date
  paymentAmount: number
  principalAmount: number
  interestAmount: number
  remainingBalance: number
  paymentMethod: string // 'Salary Deduction' | 'Bank Transfer' | 'Cash'
  // ... additional fields
}
```

## Usage Instructions

### For Employees

1. **Creating a Loan Application**

   - Navigate to the Loan Management page
   - Click "New Application" button
   - Fill in all required fields:
     - Employee selection
     - Loan type (Personal, Housing, Vehicle, Education, Emergency)
     - Requested amount
     - Purpose of loan
     - Repayment period
     - Monthly income
     - Existing loan balance
   - Use the built-in calculator to estimate payments
   - Submit the application

2. **Tracking Applications**

   - View all applications in the Applications tab
   - Filter by status, loan type, or search by keywords
   - Click on any application to view detailed information
   - Edit applications that are still in "Draft" status

3. **Dashboard Overview**
   - View personal loan statistics
   - Track active loans and monthly payments
   - Monitor application status

### For Approvers

1. **Reviewing Applications**

   - Navigate to the Applications tab
   - Filter for "Submitted" or "Under Review" applications
   - Click on an application to review details
   - Use the approval form to approve or reject

2. **Approval Process**

   - Review employee information and loan details
   - Check debt-to-income ratio and risk factors
   - Set approved amount, interest rate, and repayment period
   - Add approval comments or rejection reasons
   - Submit decision

3. **Dashboard Analytics**
   - View overall loan portfolio statistics
   - Monitor pending applications
   - Track monthly repayments and outstanding amounts
   - Identify overdue loans

## Loan Types and Interest Rates

| Loan Type | Interest Rate | Max Amount  | Max Period |
| --------- | ------------- | ----------- | ---------- |
| Personal  | 10.0%         | 50,000 AED  | 36 months  |
| Housing   | 8.5%          | 500,000 AED | 120 months |
| Vehicle   | 9.0%          | 200,000 AED | 60 months  |
| Education | 7.5%          | 100,000 AED | 84 months  |
| Emergency | 12.0%         | 25,000 AED  | 24 months  |

## Risk Assessment

The system automatically calculates and displays:

- **Debt-to-Income Ratio**: Total debt obligations vs monthly income
- **Maximum Loan Amount**: Based on income and existing loans
- **Payment Affordability**: Monthly payment vs available income
- **Risk Warnings**: Alerts for high-risk applications

## API Integration

The system includes a comprehensive hook (`use-loan.ts`) for API integration:

```typescript
const {
  applications,
  loans,
  isLoading,
  createApplication,
  createApproval,
  fetchApplications,
  // ... other methods
} = useLoan()
```

### API Endpoints

- `GET /api/loan/applications` - Fetch applications
- `POST /api/loan/applications` - Create application
- `PUT /api/loan/applications/:id` - Update application
- `POST /api/loan/approvals` - Create approval
- `GET /api/loan/loans` - Fetch loans
- `GET /api/loan/dashboard` - Fetch dashboard data

## Demo Mode

The system includes a demo mode that allows switching between employee and approver views:

1. **Employee View**: Access loan application forms and personal dashboard
2. **Approver View**: Access approval forms and management dashboard
3. **Role Switcher**: Toggle between views for testing purposes

## Dummy Data

The system includes comprehensive dummy data for testing:

- 5 sample loan applications with different statuses
- 5 active loans with repayment history
- 7 loan repayment records
- Dashboard statistics and analytics

## Form Validation

All forms include comprehensive validation:

- Required field validation
- Amount range validation
- Date validation
- Business rule validation (e.g., debt-to-income ratio)
- Real-time validation feedback

## Responsive Design

The system is fully responsive and works on:

- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile devices (320px - 767px)

## Security Features

- Role-based access control
- Form validation and sanitization
- Secure API communication
- Audit trail for all actions

## Future Enhancements

Potential improvements for the loan management system:

- Multi-level approval workflow
- Document upload and management
- Email notifications
- Payment scheduling
- Loan refinancing options
- Advanced reporting and analytics
- Integration with payroll system
- Mobile app support

## Technical Stack

- **Frontend**: React with TypeScript
- **UI Components**: Shadcn/ui
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: Native JavaScript Date API

## Getting Started

1. Navigate to the loan management page
2. Use the role switcher to test different views
3. Create sample applications and test the approval workflow
4. Explore the dashboard and analytics features
5. Test the responsive design on different screen sizes

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
