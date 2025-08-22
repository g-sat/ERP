// Interface for UniversalDocumentsHd (Header)
export interface IUniversalDocumentHd {
  documentId: number // bigint, auto-incremented
  entityTypeId: number // tinyint
  entityTypeName: string
  entity: string // bigint
  documentName: string | null // varchar(100)
  isActive: boolean // bit, default 1
  data_details: IUniversalDocumentDt[]

  //extra fields
  detailsName: string | null
  detailsCount: number | null
}

// Interface for UniversalDocumentsDt (Detail)
export interface IUniversalDocumentDt {
  documentId: number // bigint
  docTypeId: number // tinyint
  docTypeName: string
  versionNo: number // int, >=1
  documentNo: string | null // varchar(100)
  issueDate: string | null // date, ISO string (e.g., '2025-01-10')
  expiryDate: string | null // date, ISO string
  filePath: string | null // nvarchar(1000)
  fileType: "PDF" | "JPEG" | "PNG" | "DOCX" | null // varchar(50), constrained
  remarks: string | null // nvarchar(500)
  renewalRequired: boolean // bit, default 0,
}
