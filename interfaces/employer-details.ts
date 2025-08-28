export interface IEmployerDetails {
  employerDetailsId: number
  companyId: number
  companyName: string
  branch: string
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
