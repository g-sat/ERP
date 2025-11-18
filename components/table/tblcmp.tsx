"use client";
import { useState } from "react";
import { TableContainer, Column } from "./Table";
import { Eye, Edit3, Trash2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  TableDemo – Example Component                                             */
/* -------------------------------------------------------------------------- */
export function TableDemo() {
  type Person = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    phone?: string;
    country?: string;
    status?: string;
    address?: string;
    city?: string;
    zip?: string;
    department?: string;
    salary?: number;
    hireDate?: string;
    manager?: string;
    project?: string;
    skills?: string;
    notes?: string;
    active?: boolean;
    level?: string;
    experience?: number;
    bonus?: number;
    vacationDays?: number;
    role?: string;
  };

  const initialData: Person[] = [
    { id: 1, firstName: "Alice", lastName: "Wong", email: "alice@example.com", age: 28, phone: "555-0101", country: "SG", status: "Active", address: "123 Main St sidugfposd rhgpursghgu hsduhguerh uerh her[u hgieurhg gieurg ipeurg ", city: "Singapore", zip: "12345", department: "Engineering", salary: 75000, hireDate: "2020-01-15", manager: "Bob Smith", project: "ERP Dev", skills: "React, TS", notes: "Top performer", active: true, level: "Senior", experience: 5, bonus: 5000, vacationDays: 20, role: "Admin" },
    { id: 2, firstName: "Bob", lastName: "Smith", email: "bob@example.com", age: 34, phone: "555-0102", country: "US", status: "Active", address: "456 Elm St", city: "New York", zip: "10001", department: "HR", salary: 65000, hireDate: "2019-03-10", manager: "Carol Ng", project: "Recruiting", skills: "Management", notes: "Experienced", active: true, level: "Manager", experience: 8, bonus: 4000, vacationDays: 25, role: "Manager" },
    { id: 3, firstName: "Carol", lastName: "Ng", email: "carol@example.com", age: 22, phone: "555-0103", country: "MY", status: "Inactive", address: "789 Oak St", city: "Kuala Lumpur", zip: "50000", department: "Finance", salary: 55000, hireDate: "2021-05-20", manager: "Dave Patel", project: "Budgeting", skills: "Excel", notes: "New hire", active: false, level: "Junior", experience: 1, bonus: 2000, vacationDays: 15, role: "User" },
    { id: 4, firstName: "Dave", lastName: "Patel", email: "dave@example.com", age: 45, phone: "555-0104", country: "IN", status: "Active", address: "101 Pine St", city: "Mumbai", zip: "400001", department: "IT", salary: 85000, hireDate: "2018-07-12", manager: "Eve Lopez", project: "Security", skills: "Cybersecurity", notes: "Expert", active: true, level: "Lead", experience: 12, bonus: 6000, vacationDays: 30, role: "Admin" },
    { id: 5, firstName: "Eve", lastName: "Lopez", email: "eve@example.com", age: 31, phone: "555-0105", country: "PH", status: "Active", address: "202 Cedar St", city: "Manila", zip: "1000", department: "Marketing", salary: 60000, hireDate: "2020-09-05", manager: "Frank Miller", project: "Campaigns", skills: "SEO", notes: "Creative", active: true, level: "Senior", experience: 6, bonus: 3500, vacationDays: 22, role: "Manager" },
    { id: 6, firstName: "Frank", lastName: "Miller", email: "frank@example.com", age: 39, phone: "555-0106", country: "UK", status: "Active", address: "303 Birch St", city: "London", zip: "SW1A 1AA", department: "Sales", salary: 70000, hireDate: "2017-11-18", manager: "Grace Chen", project: "Leads", skills: "Negotiation", notes: "Sales pro", active: true, level: "Manager", experience: 10, bonus: 4500, vacationDays: 28, role: "User" },
    { id: 7, firstName: "Grace", lastName: "Chen", email: "grace@example.com", age: 27, phone: "555-0107", country: "CN", status: "Inactive", address: "404 Maple St", city: "Beijing", zip: "100000", department: "Design", salary: 58000, hireDate: "2021-02-14", manager: "Hector Garcia", project: "UI/UX", skills: "Figma", notes: "Talented", active: false, level: "Mid", experience: 3, bonus: 2500, vacationDays: 18, role: "Admin" },
    { id: 8, firstName: "Hector", lastName: "Garcia", email: "hector@example.com", age: 52, phone: "555-0108", country: "MX", status: "Active", address: "505 Walnut St", city: "Mexico City", zip: "06000", department: "Operations", salary: 90000, hireDate: "2015-04-22", manager: "Ivy Khan", project: "Logistics", skills: "Supply Chain", notes: "Veteran", active: true, level: "Director", experience: 15, bonus: 7000, vacationDays: 35, role: "Manager" },
    { id: 9, firstName: "Ivy", lastName: "Khan", email: "ivy@example.com", age: 24, phone: "555-0109", country: "PK", status: "Active", address: "606 Ash St", city: "Karachi", zip: "74000", department: "Support", salary: 52000, hireDate: "2022-06-30", manager: "Jack Brown", project: "Helpdesk", skills: "Troubleshooting", notes: "Eager", active: true, level: "Junior", experience: 2, bonus: 1500, vacationDays: 16, role: "User" },
    { id: 10, firstName: "Jack", lastName: "Brown", email: "jack@example.com", age: 46, phone: "555-0110", country: "AU", status: "Active", address: "707 Spruce St", city: "Sydney", zip: "2000", department: "Legal", salary: 80000, hireDate: "2016-08-09", manager: "Alice Wong", project: "Compliance", skills: "Law", notes: "Reliable", active: true, level: "Senior", experience: 11, bonus: 5500, vacationDays: 32, role: "Admin" },
    { id: 11, firstName: "Liam", lastName: "Nguyen", email: "liam@example.com", age: 29, phone: "555-0111", country: "VN", status: "Active", address: "808 Willow St", city: "Hanoi", zip: "100000", department: "QA", salary: 62000, hireDate: "2019-12-01", manager: "Mia Lee", project: "Testing", skills: "Jest", notes: "Detail-oriented", active: true, level: "Mid", experience: 4, bonus: 2200, vacationDays: 19, role: "Manager" },
    { id: 12, firstName: "Mia", lastName: "Lee", email: "mia@example.com", age: 32, phone: "555-0112", country: "KR", status: "Active", address: "909 Poplar St", city: "Seoul", zip: "04524", department: "QA", salary: 64000, hireDate: "2018-03-15", manager: "Nina Kim", project: "Automation", skills: "Cypress", notes: "Fast learner", active: true, level: "Senior", experience: 7, bonus: 3000, vacationDays: 21, role: "User" },
    { id: 13, firstName: "Nina", lastName: "Kim", email: "nina@example.com", age: 41, phone: "555-0113", country: "JP", status: "Active", address: "1010 Chestnut St", city: "Tokyo", zip: "100-0001", department: "QA", salary: 70000, hireDate: "2015-06-20", manager: "Oscar Tan", project: "Release", skills: "Manual Testing", notes: "Reliable", active: true, level: "Lead", experience: 12, bonus: 3500, vacationDays: 25, role: "Admin" },
    { id: 14, firstName: "Oscar", lastName: "Tan", email: "oscar@example.com", age: 36, phone: "555-0114", country: "SG", status: "Active", address: "1111 Cedar St", city: "Singapore", zip: "23456", department: "QA", salary: 68000, hireDate: "2017-09-10", manager: "Paul Lim", project: "Regression", skills: "Automation", notes: "Efficient", active: true, level: "Manager", experience: 9, bonus: 3200, vacationDays: 23, role: "User" },
    { id: 15, firstName: "Paul", lastName: "Lim", email: "paul@example.com", age: 38, phone: "555-0115", country: "MY", status: "Active", address: "1212 Fir St", city: "Kuala Lumpur", zip: "60000", department: "QA", salary: 66000, hireDate: "2016-11-25", manager: "Quinn Chua", project: "Performance", skills: "LoadRunner", notes: "Thorough", active: true, level: "Senior", experience: 10, bonus: 3100, vacationDays: 22, role: "Admin" },
    { id: 16, firstName: "Quinn", lastName: "Chua", email: "quinn@example.com", age: 27, phone: "555-0116", country: "PH", status: "Active", address: "1313 Palm St", city: "Manila", zip: "1100", department: "QA", salary: 61000, hireDate: "2020-04-18", manager: "Rita Chan", project: "Security", skills: "PenTest", notes: "Resourceful", active: true, level: "Mid", experience: 5, bonus: 2100, vacationDays: 18, role: "Manager" },
    { id: 17, firstName: "Rita", lastName: "Chan", email: "rita@example.com", age: 33, phone: "555-0117", country: "HK", status: "Active", address: "1414 Oak St", city: "Hong Kong", zip: "999077", department: "QA", salary: 65000, hireDate: "2018-08-22", manager: "Sam Wu", project: "Audit", skills: "Compliance", notes: "Organized", active: true, level: "Senior", experience: 8, bonus: 2800, vacationDays: 20, role: "User" },
    { id: 18, firstName: "Sam", lastName: "Wu", email: "sam@example.com", age: 44, phone: "555-0118", country: "CN", status: "Active", address: "1515 Pine St", city: "Shanghai", zip: "200000", department: "QA", salary: 72000, hireDate: "2014-02-28", manager: "Tina Ho", project: "Release", skills: "Documentation", notes: "Meticulous", active: true, level: "Lead", experience: 15, bonus: 4000, vacationDays: 28, role: "Admin" },
    { id: 19, firstName: "Tina", lastName: "Ho", email: "tina@example.com", age: 26, phone: "555-0119", country: "TH", status: "Active", address: "1616 Maple St", city: "Bangkok", zip: "10110", department: "QA", salary: 60000, hireDate: "2021-07-05", manager: "Uma Singh", project: "Testing", skills: "Selenium", notes: "Quick", active: true, level: "Junior", experience: 2, bonus: 1200, vacationDays: 15, role: "User" },
    { id: 20, firstName: "Uma", lastName: "Singh", email: "uma@example.com", age: 30, phone: "555-0120", country: "IN", status: "Active", address: "1717 Spruce St", city: "Delhi", zip: "110001", department: "QA", salary: 63000, hireDate: "2019-05-12", manager: "Victor Lee", project: "Automation", skills: "Python", notes: "Innovative", active: true, level: "Mid", experience: 6, bonus: 2000, vacationDays: 17, role: "Manager" },
    { id: 21, firstName: "Victor", lastName: "Lee", email: "victor@example.com", age: 37, phone: "555-0121", country: "ID", status: "Active", address: "1818 Birch St", city: "Jakarta", zip: "10110", department: "QA", salary: 67000, hireDate: "2017-03-30", manager: "Wendy Lim", project: "Performance", skills: "JMeter", notes: "Analytical", active: true, level: "Senior", experience: 11, bonus: 3300, vacationDays: 24, role: "Admin" },
    { id: 22, firstName: "Wendy", lastName: "Lim", email: "wendy@example.com", age: 42, phone: "555-0122", country: "SG", status: "Active", address: "1919 Willow St", city: "Singapore", zip: "34567", department: "QA", salary: 71000, hireDate: "2013-10-17", manager: "Xander Tan", project: "Regression", skills: "Automation", notes: "Experienced", active: true, level: "Lead", experience: 16, bonus: 4200, vacationDays: 29, role: "Manager" },
    { id: 23, firstName: "Xander", lastName: "Tan", email: "xander@example.com", age: 28, phone: "555-0123", country: "MY", status: "Active", address: "2020 Poplar St", city: "Kuala Lumpur", zip: "70000", department: "QA", salary: 62000, hireDate: "2020-09-09", manager: "Yara Chua", project: "Security", skills: "OWASP", notes: "Proactive", active: true, level: "Mid", experience: 4, bonus: 1800, vacationDays: 16, role: "User" },
    { id: 24, firstName: "Yara", lastName: "Chua", email: "yara@example.com", age: 35, phone: "555-0124", country: "PH", status: "Active", address: "2121 Chestnut St", city: "Manila", zip: "1200", department: "QA", salary: 66000, hireDate: "2016-06-14", manager: "Zane Chan", project: "Audit", skills: "ISO", notes: "Precise", active: true, level: "Senior", experience: 9, bonus: 2900, vacationDays: 21, role: "Admin" },
    { id: 25, firstName: "Zane", lastName: "Chan", email: "zane@example.com", age: 39, phone: "555-0125", country: "HK", status: "Active", address: "2222 Fir St", city: "Hong Kong", zip: "999077", department: "QA", salary: 68000, hireDate: "2015-01-19", manager: "Amy Wu", project: "Release", skills: "Testing", notes: "Consistent", active: true, level: "Manager", experience: 12, bonus: 3400, vacationDays: 26, role: "User" },
    { id: 26, firstName: "Amy", lastName: "Wu", email: "amy@example.com", age: 31, phone: "555-0126", country: "CN", status: "Active", address: "2323 Palm St", city: "Beijing", zip: "100000", department: "QA", salary: 65000, hireDate: "2018-05-23", manager: "Ben Ho", project: "Testing", skills: "Automation", notes: "Efficient", active: true, level: "Senior", experience: 7, bonus: 2700, vacationDays: 20, role: "Admin" },
    { id: 27, firstName: "Ben", lastName: "Ho", email: "ben@example.com", age: 34, phone: "555-0127", country: "TH", status: "Active", address: "2424 Oak St", city: "Bangkok", zip: "10200", department: "QA", salary: 63000, hireDate: "2017-08-11", manager: "Cara Lim", project: "Performance", skills: "LoadRunner", notes: "Thorough", active: true, level: "Mid", experience: 8, bonus: 2600, vacationDays: 19, role: "Manager" },
    { id: 28, firstName: "Cara", lastName: "Lim", email: "cara@example.com", age: 29, phone: "555-0128", country: "IN", status: "Active", address: "2525 Pine St", city: "Mumbai", zip: "400002", department: "QA", salary: 62000, hireDate: "2019-02-27", manager: "Dan Singh", project: "Security", skills: "PenTest", notes: "Resourceful", active: true, level: "Mid", experience: 5, bonus: 2100, vacationDays: 18, role: "User" },
    { id: 29, firstName: "Dan", lastName: "Singh", email: "dan@example.com", age: 36, phone: "555-0129", country: "ID", status: "Active", address: "2626 Maple St", city: "Jakarta", zip: "10120", department: "QA", salary: 64000, hireDate: "2016-04-05", manager: "Ella Lee", project: "Audit", skills: "Compliance", notes: "Organized", active: true, level: "Senior", experience: 10, bonus: 2800, vacationDays: 22, role: "Admin" },
    { id: 30, firstName: "Ella", lastName: "Lee", email: "ella@example.com", age: 40, phone: "555-0130", country: "SG", status: "Active", address: "2727 Spruce St", city: "Singapore", zip: "45678", department: "QA", salary: 70000, hireDate: "2014-09-16", manager: "Finn Tan", project: "Release", skills: "Manual Testing", notes: "Reliable", active: true, level: "Lead", experience: 14, bonus: 3900, vacationDays: 27, role: "Manager" },
    { id: 31, firstName: "Finn", lastName: "Tan", email: "finn@example.com", age: 25, phone: "555-0131", country: "MY", status: "Active", address: "2828 Willow St", city: "Kuala Lumpur", zip: "80000", department: "QA", salary: 60000, hireDate: "2021-01-03", manager: "Gina Chua", project: "Testing", skills: "Jest", notes: "Detail-oriented", active: true, level: "Junior", experience: 3, bonus: 1100, vacationDays: 14, role: "User" },
    { id: 32, firstName: "Gina", lastName: "Chua", email: "gina@example.com", age: 33, phone: "555-0132", country: "PH", status: "Active", address: "2929 Poplar St", city: "Manila", zip: "1300", department: "QA", salary: 65000, hireDate: "2018-10-21", manager: "Henry Chan", project: "Automation", skills: "Cypress", notes: "Fast learner", active: true, level: "Senior", experience: 8, bonus: 3000, vacationDays: 21, role: "Manager" },
    { id: 33, firstName: "Henry", lastName: "Chan", email: "henry@example.com", age: 47, phone: "555-0133", country: "HK", status: "Active", address: "3030 Chestnut St", city: "Hong Kong", zip: "999077", department: "QA", salary: 72000, hireDate: "2012-07-29", manager: "Ivy Wu", project: "Release", skills: "Manual Testing", notes: "Reliable", active: true, level: "Lead", experience: 18, bonus: 4500, vacationDays: 32, role: "Admin" },
    { id: 34, firstName: "Ivy", lastName: "Wu", email: "ivywu@example.com", age: 28, phone: "555-0134", country: "CN", status: "Active", address: "3131 Fir St", city: "Beijing", zip: "100000", department: "QA", salary: 63000, hireDate: "2019-06-18", manager: "Jake Ho", project: "Testing", skills: "Automation", notes: "Efficient", active: true, level: "Mid", experience: 6, bonus: 2100, vacationDays: 18, role: "Manager" },
    { id: 35, firstName: "Jake", lastName: "Ho", email: "jake@example.com", age: 35, phone: "555-0135", country: "TH", status: "Active", address: "3232 Palm St", city: "Bangkok", zip: "10300", department: "QA", salary: 65000, hireDate: "2016-03-12", manager: "Kara Lim", project: "Performance", skills: "LoadRunner", notes: "Thorough", active: true, level: "Senior", experience: 9, bonus: 2600, vacationDays: 19, role: "User" },
    { id: 36, firstName: "Kara", lastName: "Lim", email: "kara@example.com", age: 30, phone: "555-0136", country: "IN", status: "Active", address: "3333 Oak St", city: "Delhi", zip: "110002", department: "QA", salary: 64000, hireDate: "2019-08-25", manager: "Leo Singh", project: "Security", skills: "PenTest", notes: "Resourceful", active: true, level: "Mid", experience: 7, bonus: 2400, vacationDays: 20, role: "Manager" },
    { id: 37, firstName: "Leo", lastName: "Singh", email: "leo@example.com", age: 43, phone: "555-0137", country: "ID", status: "Active", address: "3434 Pine St", city: "Jakarta", zip: "10130", department: "QA", salary: 69000, hireDate: "2015-11-10", manager: "Maya Lee", project: "Audit", skills: "Compliance", notes: "Organized", active: true, level: "Lead", experience: 13, bonus: 3600, vacationDays: 26, role: "Admin" },
    { id: 38, firstName: "Maya", lastName: "Lee", email: "maya@example.com", age: 26, phone: "555-0138", country: "SG", status: "Active", address: "3535 Maple St", city: "Singapore", zip: "56789", department: "QA", salary: 61000, hireDate: "2020-12-15", manager: "Noah Tan", project: "Testing", skills: "Jest", notes: "Detail-oriented", active: true, level: "Junior", experience: 4, bonus: 1300, vacationDays: 16, role: "User" },
    { id: 39, firstName: "Noah", lastName: "Tan", email: "noah@example.com", age: 38, phone: "555-0139", country: "MY", status: "Active", address: "3636 Spruce St", city: "Kuala Lumpur", zip: "90000", department: "QA", salary: 67000, hireDate: "2017-05-08", manager: "Olivia Chua", project: "Automation", skills: "Cypress", notes: "Fast learner", active: true, level: "Senior", experience: 11, bonus: 3200, vacationDays: 23, role: "Manager" },
    { id: 40, firstName: "Olivia", lastName: "Chua", email: "olivia@example.com", age: 32, phone: "555-0140", country: "PH", status: "Active", address: "3737 Willow St", city: "Manila", zip: "1400", department: "QA", salary: 66000, hireDate: "2018-07-22", manager: "Peter Chan", project: "Release", skills: "Manual Testing", notes: "Reliable", active: true, level: "Mid", experience: 8, bonus: 2900, vacationDays: 21, role: "User" },
  ];

  const [rows, setRows] = useState<Person[]>(initialData);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const columns: Column<Person>[] = [
    { accessorKey: "firstName", header: "First Name", sortable: true, editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "lastName", header: "Last Name", sortable: true, editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "email", header: "Email", editable: true, size: 150, minSize: 100, maxSize: 250 },
    { accessorKey: "age", header: "Age", sortable: true, align: "right", editable: true, size: 80, minSize: 60, maxSize: 120 },
    { accessorKey: "phone", header: "Phone", editable: true, size: 120, minSize: 100, maxSize: 200 },
    { accessorKey: "country", header: "Country", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "status", header: "Status", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "address", header: "Address", size: 150, minSize: 100, maxSize: 250 },
    { accessorKey: "city", header: "City", size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "zip", header: "Zip", size: 80, minSize: 60, maxSize: 120 },
    { accessorKey: "department", header: "Department", editable: true, size: 120, minSize: 100, maxSize: 200 },
    { accessorKey: "salary", header: "Salary", sortable: true, align: "right", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "hireDate", header: "Hire Date", editable: true, size: 120, minSize: 100, maxSize: 180 },
    { accessorKey: "manager", header: "Manager", editable: true, size: 120, minSize: 100, maxSize: 200 },
    { accessorKey: "project", header: "Project", editable: true, size: 120, minSize: 100, maxSize: 200 },
    { accessorKey: "skills", header: "Skills", editable: true, size: 120, minSize: 100, maxSize: 200 },
    { accessorKey: "notes", header: "Notes", editable: true, size: 150, minSize: 100, maxSize: 250 },
    { accessorKey: "active", header: "Active", editable: true, size: 80, minSize: 60, maxSize: 120 },
    { accessorKey: "level", header: "Level", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "experience", header: "Experience", sortable: true, align: "right", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "bonus", header: "Bonus", sortable: true, align: "right", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "vacationDays", header: "Vacation Days", sortable: true, align: "right", editable: true, size: 100, minSize: 80, maxSize: 150 },
    { accessorKey: "role", header: "Role", cell: ({ getValue, row, column, table }) => {
      const meta = table.options.meta as { updateData: (rowIndex: number, columnId: string, value: string) => void };
      const value = getValue() as string;
      return (
        <select
          value={value || "User"}
          onChange={(e) => meta.updateData(row.index, column.id, e.target.value)}
          className="w-full border border-border rounded px-2 py-1 text-sm bg-background"
          data-no-dnd="true"
        >
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="User">User</option>
        </select>
      );
    }, size: 100, minSize: 80, maxSize: 150 },
  ];

  const actions = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      variant: "ghost" as const,
      onClick: (row: Person) => {
        // Example action: open details
        // Replace with modal/navigation in real app
        // eslint-disable-next-line no-console
        console.log("View", row);
        alert(`${row.firstName} ${row.lastName} — ${row.email}`);
      },
    },
    {
      label: "Edit",
      icon: <Edit3 className="h-4 w-4" />,
      variant: "outline" as const,
      onClick: (row: Person) => {
        // Example action: edit row
        // eslint-disable-next-line no-console
        console.log("Edit", row);
        alert(`Edit ${row.firstName}`);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      variant: "destructive" as const,
      onClick: (row: Person) => {
        // Remove row
        setRows((prev) => prev.filter((r) => r.id !== row.id));
      },
    },
  ];

  const settings = {
    pageSize: 15,
    showPagination: true,
    enableRowSelection: true,
    enableSorting: true,
    enableColumnFilters: true,
    enableColumnResizing: true,
    enableColumnVisibility: true,
    enableRowReorder: true,
    enableColumnReorder: true,
    globalFilterPlaceholder: "Search people...",
  };

  return (
    <div className="p-4">
      <TableContainer<Person>
        columns={columns}
        data={rows}
        actions={actions}
        settings={settings}
        onRowReorder={(newData) => {
          setRows(newData as Person[]);
          // eslint-disable-next-line no-console
          console.log("rows reordered", newData);
        }}
        onRowSelectionChange={(sel) => {
          setSelected(sel);
          // eslint-disable-next-line no-console
          console.log("selection", sel);
        }}
        onDataUpdate={(updated) => {
          // update local state when editable cells change
          setRows(updated as Person[]);
          // eslint-disable-next-line no-console
          console.log("data updated", updated);
        }}
        onResetLayout={() => {
          // eslint-disable-next-line no-console
          console.log("layout reset");
        }}
      />
      <div className="mt-3 text-sm text-muted-foreground">
        Selected rows: {Object.keys(selected).filter((k) => selected[k]).length}
      </div>
    </div>
  );
}