"use client"

import { useSessionExpiry } from "@/hooks/use-session-expiry"

import { SessionExpiryModal } from "./session-expiry-modal"

interface SessionExpiryProviderProps {
  children: React.ReactNode
}

export function SessionExpiryProvider({
  children,
}: SessionExpiryProviderProps) {
  const { showModal, timeRemaining, onSignOut, onStaySignedIn, onClose } =
    useSessionExpiry()

  return (
    <>
      {children}
      <SessionExpiryModal
        isOpen={showModal}
        onClose={onClose}
        onStaySignedIn={onStaySignedIn}
        onSignOut={onSignOut}
        timeRemaining={timeRemaining}
      />
    </>
  )
}
