export interface OutstandingTransaction {
  id: string
  date: string
  documentNo: string
  job: string
  vessel: string
  debit: number
  credit: number
  balance: number
}

export const mockOutstandingData: OutstandingTransaction[] = [
  {
    id: "1",
    date: "01/07/25",
    documentNo: "INV-001",
    job: "2504/JAP/21388/AM",
    vessel: "ADDISON",
    debit: 10000.0,
    credit: 0.0,
    balance: 10000.0,
  },
  {
    id: "2",
    date: "09/07/25",
    documentNo: "INV-002",
    job: "2510/AUH/22490/AM",
    vessel: "GROTON",
    debit: 5000.0,
    credit: 0.0,
    balance: 15000.0,
  },
  {
    id: "3",
    date: "17/10/25",
    documentNo: "INV-003",
    job: "2508/DXB/22001/AM",
    vessel: "MARIA",
    debit: 0.0,
    credit: 3000.0,
    balance: 12000.0,
  },
  {
    id: "4",
    date: "21/08/25",
    documentNo: "INV-004",
    job: "2509/SIN/22500/AM",
    vessel: "OCEAN",
    debit: 7500.0,
    credit: 0.0,
    balance: 19500.0,
  },
  {
    id: "5",
    date: "27/08/25",
    documentNo: "INV-005",
    job: "2510/DXB/22002/AM",
    vessel: "MARIA",
    debit: 0.0,
    credit: 2000.0,
    balance: 17500.0,
  },
]
