export interface IPettyCashRequest {
  pettyCashId: number
  employeeId: number
  employeeName?: string
  employeeCode?: string
  employeePhoto?: string
  requestDate: string | Date
  amount: number
  purpose: string
  statusId: number
  statusName: string
  remarks?: string
  attachments?: string
  createdById: number
  createdDate: string | Date
  editedById?: number
  editedDate?: string | Date
  createdBy: string
  editedBy?: string
}

export interface IPettyCashRequestFormData {
  employeeId: string
  amount: number
  purpose: string
  remarks?: string
  attachments?: string
}
