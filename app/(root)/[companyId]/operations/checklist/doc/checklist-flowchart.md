# Checklist System Flowchart

## System Workflow Overview

```mermaid
graph TD
    A[Start] --> B[User Login]
    B --> C[Access Checklist Module]
    C --> D{User Action}

    D -->|Create New| E[Job Order Creation]
    D -->|View/Edit| F[Job Order Management]
    D -->|Search| G[Search & Filter]
    D -->|Export| H[Data Export]

    E --> I[Fill Job Order Details]
    I --> J[Validate Data]
    J -->|Valid| K[Save Job Order]
    J -->|Invalid| I

    K --> L[Select Services]
    L --> M[Service Management]

    F --> N[Load Job Orders]
    N --> O[Display in Table]
    O --> P[Select Job Order]
    P --> Q[Edit/View Details]

    G --> R[Apply Filters]
    R --> S[Search Results]
    S --> T[Display Filtered Data]

    M --> U[Service Tabs]
    U --> V[Port Expenses]
    U --> W[Launch Services]
    U --> X[Equipment Used]
    U --> Y[Crew Management]
    U --> Z[Other Services]

    V --> AA[Add/Edit Service]
    W --> AA
    X --> AA
    Y --> AA
    Z --> AA

    AA --> BB[Calculate Charges]
    BB --> CC[Apply GST]
    CC --> DD[Generate Debit Note]
    DD --> EE[Financial Processing]

    EE --> FF[Invoice Generation]
    FF --> GG[Payment Processing]
    GG --> HH[Job Order Closure]

    H --> II[Export PDF/Excel]
    II --> JJ[Download File]

    HH --> KK[Archive Records]
    KK --> LL[End]

    JJ --> LL
```

## Detailed Service Management Flow

```mermaid
graph TD
    A[Service Management] --> B[Select Service Type]

    B --> C[Port Expenses]
    B --> D[Launch Services]
    B --> E[Equipment Used]
    B --> F[Crew Sign On]
    B --> G[Crew Sign Off]
    B --> H[Crew Miscellaneous]
    B --> I[Medical Assistance]
    B --> J[Consignment Import]
    B --> K[Consignment Export]
    B --> L[Third Party Services]
    B --> M[Fresh Water]
    B --> N[Technician/Surveyor]
    B --> O[Landing Items]
    B --> P[Other Services]
    B --> Q[Agency Remuneration]

    C --> R[Service Form]
    D --> R
    E --> R
    F --> R
    G --> R
    H --> R
    I --> R
    J --> R
    K --> R
    L --> R
    M --> R
    N --> R
    O --> R
    P --> R
    Q --> R

    R --> S[Fill Service Details]
    S --> T[Validate Service Data]
    T -->|Valid| U[Save Service]
    T -->|Invalid| S

    U --> V[Update Job Order Totals]
    V --> W[Generate Service Documentation]
    W --> X[Service Complete]
```

## Financial Processing Flow

```mermaid
graph TD
    A[Financial Processing] --> B[Service Charges Calculation]
    B --> C[Apply Exchange Rates]
    C --> D[Calculate GST]
    D --> E[Generate Debit Note]

    E --> F[Debit Note Header]
    E --> G[Debit Note Details]

    F --> H[Set Financial Parameters]
    G --> I[Add Service Line Items]

    H --> J[Calculate Totals]
    I --> J

    J --> K[Apply Tax Calculations]
    K --> L[Generate Invoice]
    L --> M[Send to Customer]

    M --> N[Payment Tracking]
    N --> O[Payment Received]
    O --> P[Update Financial Records]
    P --> Q[Close Financial Transaction]
```

## Job Order Lifecycle

```mermaid
graph LR
    A[Draft] --> B[Active]
    B --> C[In Progress]
    C --> D[Services Complete]
    D --> E[Financial Complete]
    E --> F[Closed]
    F --> G[Archived]

    style A fill:#e1f5fe
    style B fill:#c8e6c9
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#fce4ec
    style G fill:#f5f5f5
```

## User Interaction Flow

```mermaid
graph TD
    A[User Login] --> B[Check Permissions]
    B --> C{Permission Level}

    C -->|View Only| D[Read Access]
    C -->|Edit Access| E[Full Access]
    C -->|Financial Access| F[Financial Operations]
    C -->|Admin Access| G[System Management]

    D --> H[View Job Orders]
    D --> I[View Services]
    D --> J[View Reports]

    E --> K[Create Job Orders]
    E --> L[Edit Job Orders]
    E --> M[Manage Services]
    E --> N[Update Status]

    F --> O[Financial Processing]
    F --> P[Invoice Management]
    F --> Q[Payment Tracking]

    G --> R[User Management]
    G --> S[System Configuration]
    G --> T[Data Maintenance]
```

## Error Handling Flow

```mermaid
graph TD
    A[Operation Request] --> B[Validate Input]
    B --> C{Validation Result}

    C -->|Success| D[Process Operation]
    C -->|Error| E[Display Error Message]

    D --> F[Database Operation]
    F --> G{Operation Result}

    G -->|Success| H[Update UI]
    G -->|Error| I[Handle Database Error]

    E --> J[User Correction]
    J --> A

    I --> K[Log Error]
    K --> L[Display User-Friendly Message]
    L --> M[Suggest Recovery Options]

    H --> N[Operation Complete]
    M --> O[User Action]
    O --> A
```

## Data Flow Architecture

```mermaid
graph TD
    A[Frontend Components] --> B[API Client]
    B --> C[Backend API]
    C --> D[Database]

    E[External Systems] --> C
    C --> F[Authentication Service]
    C --> G[File Storage]
    C --> H[Email Service]

    I[User Interface] --> A
    A --> J[State Management]
    J --> K[Local Storage]
    J --> L[Session Storage]

    M[Form Validation] --> A
    N[Error Handling] --> A
    O[Loading States] --> A
```

## Service-Specific Flows

### Port Expenses Flow

```mermaid
graph TD
    A[Port Expenses] --> B[Select Supplier]
    B --> C[Choose Charge Type]
    C --> D[Enter Quantity & Rate]
    D --> E[Calculate Amount]
    E --> F[Apply GST]
    F --> G[Save Port Expense]
    G --> H[Update Job Order]
```

### Crew Management Flow

```mermaid
graph TD
    A[Crew Management] --> B{Service Type}
    B -->|Sign On| C[Crew Sign On]
    B -->|Sign Off| D[Crew Sign Off]
    B -->|Miscellaneous| E[Crew Miscellaneous]

    C --> F[Enter Crew Details]
    D --> G[Process Sign Off]
    E --> H[Record Miscellaneous]

    F --> I[Visa Processing]
    G --> J[Flight Arrangements]
    H --> K[Documentation]

    I --> L[Complete Service]
    J --> L
    K --> L
```

### Equipment Usage Flow

```mermaid
graph TD
    A[Equipment Used] --> B[Select Equipment Type]
    B --> C[Crane Services]
    B --> D[Forklift Services]
    B --> E[Stevedore Services]

    C --> F[Enter Usage Details]
    D --> F
    E --> F

    F --> G[Calculate Charges]
    G --> H[Generate Equipment Report]
    H --> I[Update Job Order]
```

## Integration Points

```mermaid
graph TD
    A[Checklist System] --> B[Customer Management]
    A --> C[Supplier Management]
    A --> D[Vessel Management]
    A --> E[Port Management]
    A --> F[Financial System]
    A --> G[Document Management]
    A --> H[Notification System]

    B --> I[Customer Data]
    C --> J[Supplier Data]
    D --> K[Vessel Information]
    E --> L[Port Details]
    F --> M[Financial Transactions]
    G --> N[Document Storage]
    H --> O[Email/SMS Notifications]
```
