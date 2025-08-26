export interface IEmployerDetails {
  employerDetailsId: number
  companyId: number
  companyName: string
  establishmentId: string
  establishmentCardExpiry?: string | Date
  employerRefno?: string
  wpsBankCode?: string
  wpsFileReference?: string
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
