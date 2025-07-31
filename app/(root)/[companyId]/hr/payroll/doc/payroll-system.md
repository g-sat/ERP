# GCC Payroll Management System

## Overview

This is a comprehensive payroll management system designed specifically for Gulf Cooperation Council (GCC) countries, including UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman. The system handles all aspects of payroll processing, from basic salary calculations to complex tax and social insurance deductions.

## Features

### 1. Payroll Period Management

- Create and manage payroll periods (monthly, bi-weekly, etc.)
- Set start and end dates for each period
- Track period status (active, closed, reopened)
- Support for multiple concurrent periods

### 2. Payroll Components

- **Earnings Components:**

  - Basic Salary
  - Housing Allowance
  - Transport Allowance
  - Overtime Pay
  - Bonus
  - Commission
  - Other Allowances

- **Deduction Components:**
  - Social Insurance (GOSI, GPSSA, etc.)
  - Income Tax (where applicable)
  - Leave Deductions
  - Late Arrival Deductions
  - Other Deductions

### 3. Employee Payroll Management

- Link employees to payroll periods
- Calculate earnings and deductions automatically
- Support for different employment types
- Handle part-time and full-time employees
- Process overtime calculations
- Manage leave and attendance deductions

### 4. Tax Configuration

- Configure tax rates for different GCC countries
- Support for progressive tax brackets
- Handle tax exemptions and allowances
- Calculate social insurance contributions
- Support for different tax regimes

### 5. Bank Transfer Management

- Generate bank transfer files
- Support for multiple banks
- Track transfer status
- Generate payment reports
- Handle failed transfers

### 6. Reporting and Analytics

- Payroll summary reports
- Employee detail reports
- Tax reports
- Bank transfer reports
- Custom report generation

## Technical Architecture

### Frontend Components

#### 1. PayrollDashboard

- Displays key metrics and summaries
- Shows total earnings, deductions, and net salary
- Tracks processing status
- Provides quick access to common actions

#### 2. PayrollPeriodForm

- Create and edit payroll periods
- Date range selection
- Status management
- Remarks and notes

#### 3. PayrollComponentForm

- Configure earnings and deduction components
- Calculation type selection (Fixed, Percentage, Formula)
- Tax and social insurance settings
- Component-specific flags (overtime, bonus, etc.)

#### 4. PayrollPeriodTable

- Display all payroll periods
- Search and filter functionality
- Status indicators
- Action buttons (edit, delete, view)

#### 5. PayrollComponentTable

- List all payroll components
- Type categorization (Earning/Deduction)
- Status management
- Sort order configuration

### Data Models

#### IPayrollPeriod

```typescript
interface IPayrollPeriod {
  payrollPeriodId: number
  companyId: number
  periodName: string
  startDate: Date | string
  endDate: Date | string
  isClosed: boolean
  closedDate?: Date | string
  closedBy?: string
  remarks?: string
  isActive: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}
```

#### IPayrollComponent

```typescript
interface IPayrollComponent {
  payrollComponentId: number
  companyId: number
  componentCode: string
  componentName: string
  componentType: "EARNING" | "DEDUCTION"
  isTaxable: boolean
  isOvertime: boolean
  isBonus: boolean
  isCommission: boolean
  isLeave: boolean
  isLate: boolean
  isSocialInsurance: boolean
  calculationType: "FIXED" | "PERCENTAGE" | "FORMULA"
  calculationValue?: number
  calculationFormula?: string
  sortOrder: number
  remarks?: string
  isActive: boolean
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}
```

#### IPayrollEmployee

```typescript
interface IPayrollEmployee {
  payrollEmployeeId: number
  companyId: number
  employeeId: number
  employeeCode?: string
  employeeName?: string
  departmentName?: string
  payrollPeriodId: number
  periodName?: string
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  otherAllowances: number
  totalEarnings: number
  socialInsurance: number
  otherDeductions: number
  totalDeductions: number
  netSalary: number
  overtimeHours?: number
  overtimeRate?: number
  overtimeAmount?: number
  bonusAmount?: number
  commissionAmount?: number
  leaveDeduction?: number
  lateDeduction?: number
  otherEarnings?: number
  otherDeductions?: number
  remarks?: string
  isProcessed: boolean
  processedDate?: Date | string
  processedBy?: string
  isPaid: boolean
  paidDate?: Date | string
  paidBy?: string
  paymentMethod?: string
  bankTransferRef?: string
  createDate?: Date | string
  editDate?: Date | string
  createBy?: string
  editBy?: string
}
```

## GCC-Specific Features

### 1. UAE Payroll

- **Social Insurance:** GPSSA (General Pension and Social Security Authority)
- **Tax:** No personal income tax
- **Gratuity:** End of service benefits calculation
- **Housing Allowance:** Standard component
- **Transport Allowance:** Standard component

### 2. Saudi Arabia Payroll

- **Social Insurance:** GOSI (General Organization for Social Insurance)
- **Tax:** No personal income tax for Saudi nationals
- **Housing Allowance:** Required by law
- **Transport Allowance:** Standard component
- **13th Month Salary:** Annual bonus

### 3. Qatar Payroll

- **Social Insurance:** QSS (Qatar Social Security)
- **Tax:** No personal income tax
- **Housing Allowance:** Standard component
- **Transport Allowance:** Standard component

### 4. Kuwait Payroll

- **Social Insurance:** PASI (Public Authority for Social Insurance)
- **Tax:** No personal income tax
- **Housing Allowance:** Standard component
- **Transport Allowance:** Standard component

### 5. Bahrain Payroll

- **Social Insurance:** SIO (Social Insurance Organization)
- **Tax:** No personal income tax
- **Housing Allowance:** Standard component
- **Transport Allowance:** Standard component

### 6. Oman Payroll

- **Social Insurance:** PASI (Public Authority for Social Insurance)
- **Tax:** No personal income tax
- **Housing Allowance:** Standard component
- **Transport Allowance:** Standard component

## Calculation Examples

### Basic Salary Calculation

```
Basic Salary = Contracted Basic Salary
```

### Housing Allowance

```
Housing Allowance = Basic Salary × 25% (UAE standard)
```

### Transport Allowance

```
Transport Allowance = Fixed amount (e.g., 500 AED)
```

### Overtime Calculation

```
Overtime Rate = Basic Salary ÷ 30 ÷ 8 × 1.25 (UAE standard)
Overtime Amount = Overtime Hours × Overtime Rate
```

### Social Insurance (UAE Example)

```
Employee Contribution = (Basic Salary + Housing Allowance) × 5%
Employer Contribution = (Basic Salary + Housing Allowance) × 12.5%
```

### Gratuity Calculation (UAE)

```
For service < 5 years: 21 days per year
For service ≥ 5 years: 30 days per year
Daily Rate = (Basic Salary + Housing Allowance) ÷ 30
Gratuity = Daily Rate × Number of Days
```

## API Endpoints

### Payroll Periods

- `GET /hr/payroll/getpayrollperiod` - Get all periods
- `POST /hr/payroll/savepayrollperiod` - Create/update period
- `DELETE /hr/payroll/deletepayrollperiod` - Delete period
- `POST /hr/payroll/closepayrollperiod` - Close period

### Payroll Components

- `GET /hr/payroll/getpayrollcomponent` - Get all components
- `POST /hr/payroll/savepayrollcomponent` - Create/update component
- `DELETE /hr/payroll/deletepayrollcomponent` - Delete component

### Payroll Employees

- `GET /hr/payroll/getpayrollemployee` - Get all employees
- `POST /hr/payroll/savepayrollemployee` - Create/update employee
- `DELETE /hr/payroll/deletepayrollemployee` - Delete employee
- `POST /hr/payroll/processpayrollemployee` - Process payroll

### Reports

- `GET /hr/payroll/generatepayrollreport` - Generate reports
- `GET /hr/payroll/downloadpayrollreport` - Download reports

## Security and Permissions

The system uses role-based access control with the following permissions:

- **Payroll Period Management:** Create, Edit, Delete, View
- **Payroll Component Management:** Create, Edit, Delete, View
- **Employee Payroll Management:** Create, Edit, Delete, View
- **Payroll Processing:** Process, Approve, Reject
- **Payment Management:** Create, Edit, Delete, View
- **Report Generation:** Generate, Download, View

## Future Enhancements

1. **Mobile App Support:** Native mobile applications for payroll access
2. **Integration with HR Systems:** Seamless integration with existing HR systems
3. **Advanced Analytics:** AI-powered insights and predictions
4. **Multi-Currency Support:** Support for multiple currencies
5. **Automated Compliance:** Automatic compliance checking and reporting
6. **Employee Self-Service:** Employee portal for payslip access
7. **Bank Integration:** Direct integration with banking systems
8. **Document Management:** Digital payslip and document storage

## Installation and Setup

1. **Prerequisites:**

   - Node.js 18+
   - PostgreSQL 14+
   - Redis (for caching)

2. **Installation:**

   ```bash
   npm install
   npm run build
   npm run dev
   ```

3. **Database Setup:**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Configuration:**
   - Set environment variables
   - Configure database connections
   - Set up API keys for external services

## Support and Maintenance

For technical support and maintenance:

- Email: support@company.com
- Phone: +971-4-XXX-XXXX
- Documentation: https://docs.company.com/payroll

## License

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
