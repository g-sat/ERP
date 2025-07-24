"use client"

import { useAuthStore } from "@/stores/auth-store"

import { NavUser } from "@/components/layout/nav-user"

export function HeaderUserInfo() {
  const { user } = useAuthStore()

  // Helper function to get the proper avatar source
  const getAvatarSource = () => {
    if (user?.profilePicture) {
      // If profile picture is Base64 data, add the data URL prefix
      return `data:image/jpeg;base64,${user.profilePicture}`
    }
    return "/avatars/man1.png"
  }

  return (
    <NavUser
      user={{
        name: user?.userName || "Guest",
        email: user?.userEmail || "admin@gmail.com",
        role: "admin",
        avatar: getAvatarSource(),
      }}
    />
  )
}
