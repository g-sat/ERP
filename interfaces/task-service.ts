export interface ITaskService {
  id?: number
  companyId: number
  serviceId: number
  serviceName: string
  chargeId?: number | null
  glId?: number | null
  uomId?: number | null
  carrierTypeId?: number | null
  modeTypeId?: number | null
  documentTypeId?: number | null
  vesselTypeId?: number | null
  portTypeId?: number | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string | null
  createdBy?: number | null
  updatedBy?: number | null
}

export interface ITaskServiceFormValues {
  services: {
    [key: string]: {
      chargeId: number
      glId: number
      uomId: number
      carrierTypeId?: number
      modeTypeId?: number
      documentTypeId?: number
      vesselTypeId?: number
      portTypeId?: number
    }
  }
}

interface TaskServiceConfig {
  id: number
  name: string
  hasCarrierType?: boolean
  hasModeType?: boolean
  hasDocumentType?: boolean
  hasVesselType?: boolean
  hasPortType?: boolean
}

export const TASK_SERVICES: Record<string, TaskServiceConfig> = {
  Ser_PortExpenses: {
    id: 1,
    name: "Port Expenses",
  },
  Ser_LaunchService: {
    id: 2,
    name: "Launch Service",
  },
  Ser_EquipmentUsed: {
    id: 3,
    name: "Equipment Used",
  },
  Ser_CrewSignOn: {
    id: 4,
    name: "Crew Sign On",
  },
  Ser_CrewSignOff: {
    id: 5,
    name: "Crew Sign Off",
  },
  Ser_CrewMiscellaneous: {
    id: 6,
    name: "Crew Miscellaneous",
  },
  Ser_MedicalAssistance: {
    id: 7,
    name: "Medical Assistance",
  },
  Ser_ConsignmentImport: {
    id: 8,
    name: "Consignment Import",
    hasDocumentType: true,
    hasPortType: true,
  },
  Ser_ConsignmentExport: {
    id: 9,
    name: "Consignment Export",
    hasDocumentType: true,
    hasPortType: true,
  },
  Ser_ThirdParty: { id: 10, name: "Third Party" },
  Ser_FreshWater: { id: 11, name: "Fresh Water" },
  Ser_TechnicianSurveyor: {
    id: 12,
    name: "Technician Surveyor",
  },
  Ser_LandingItems: { id: 13, name: "Landing Items" },
  Ser_OtherService: { id: 14, name: "Other Service" },
  Ser_AgencyRemuneration: {
    id: 15,
    name: "Agency Remuneration",
  },
}

export type TaskServiceKey = keyof typeof TASK_SERVICES
