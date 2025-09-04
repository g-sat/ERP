export interface IEmployer {
  employerId: number
  companyId: number
  companyName: string
  branch: string

  address: string
  phone: string
  email: string
  establishmentId: string
  bankName?: string
  bankAccountNumber?: string
  iban?: string
  isActive: boolean
  remarks?: string
  createById: number
  createDate: string | Date
  editById?: number
  editDate?: string | Date
  createBy?: string
  editBy?: string
}
