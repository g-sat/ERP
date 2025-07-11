"use client"

import { useAuthStore } from "@/stores/auth-store"

import { NavUser01 } from "@/components/layout/nav-user01"

export function HeaderUserInfo() {
  const { user } = useAuthStore()

  return (
    <NavUser01
      user={{
        name: user?.userName || "Guest",
        email: user?.userEmail || "admin@gmail.com",
        role: "admin",
        avatar: "/avatars/man1.png",
      }}
    />
  )
}
