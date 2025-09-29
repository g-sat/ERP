import { ApiResponse } from "@/interfaces/auth"
import { IUniversalDocumentHd } from "@/interfaces/universal-documents"
import {
  UniversalDocumentDtSchemaType,
  UniversalDocumentHdSchemaType,
} from "@/schemas/universal-documents"

import { UniversalDocuments } from "@/lib/api-routes"
import {
  useDelete,
  useGet,
  useGetById,
  useGetByParams,
  usePersist,
} from "@/hooks/use-common"

// Hook for fetching all universal documents
export function useGetUniversalDocuments(filters?: string) {
  return useGet<ApiResponse<IUniversalDocumentHd>>(
    UniversalDocuments.get,
    "universal-documents",
    filters
  )
}

// Hook for fetching universal document by ID
export function useGetUniversalDocumentById(documentId: string | undefined) {
  return useGetById<ApiResponse<IUniversalDocumentHd>>(
    UniversalDocuments.getById,
    "universal-document",
    documentId || ""
  )
}

// Hook for fetching documents by entity
export function useGetDocumentsByEntity(entityTypeId: number, entity: number) {
  const params = `${entityTypeId}/${entity}`
  return useGetByParams<ApiResponse<IUniversalDocumentHd>>(
    UniversalDocuments.getByEntity,
    "documents-by-entity",
    params
  )
}

// Hook for fetching expiring documents
export function useGetExpiringDocuments(daysThreshold: number = 30) {
  return useGetByParams<ApiResponse<IUniversalDocumentHd>>(
    UniversalDocuments.getExpiring,
    "expiring-documents",
    daysThreshold.toString()
  )
}

// Hook for fetching expired documents
export function useGetExpiredDocuments() {
  return useGet<ApiResponse<IUniversalDocumentHd>>(
    UniversalDocuments.getExpired,
    "expired-documents"
  )
}

// Hook for creating/updating universal document
export function usePersistUniversalDocument() {
  return usePersist<UniversalDocumentHdSchemaType>(UniversalDocuments.add)
}

// Hook for deleting universal document
export function useDeleteUniversalDocument() {
  return useDelete(UniversalDocuments.delete)
}

// Hook for saving document details
export function usePersistDocumentDetails() {
  return usePersist<UniversalDocumentDtSchemaType>(
    UniversalDocuments.addDetails
  )
}
