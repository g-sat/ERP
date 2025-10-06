"use client"

import { useSessionExpiry } from "@/hooks/use-session-expiry"

import { SessionExpiryModal } from "./session-expiry-modal"

interface SessionExpiryProviderProps {
  children: React.ReactNode
}

export function SessionExpiryProvider({
  children,
}: SessionExpiryProviderProps) {
  const {
    showModal,
    timeRemaining,
    isRefreshing,
    onSignOut,
    onStaySignedIn,
    onClose,
  } = useSessionExpiry()

  return (
    <>
      {children}
      <SessionExpiryModal
        isOpen={showModal}
        onCloseAction={onClose}
        onStaySignedInAction={onStaySignedIn}
        onSignOutAction={onSignOut}
        timeRemaining={timeRemaining}
        isRefreshing={isRefreshing}
      />
    </>
  )
}
