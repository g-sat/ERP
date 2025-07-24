"use client"

import { useAuthStore } from "@/stores/auth-store"

import { NavUser } from "@/components/layout/nav-user"

export function HeaderUserInfo() {
  const { user } = useAuthStore()

  return (
    <NavUser
      user={{
        name: user?.userName || "Guest",
        email: user?.userEmail || "admin@gmail.com",
        role: "admin",
        avatar: user?.profilePicture || "/avatars/man1.png",
      }}
    />
  )
}
