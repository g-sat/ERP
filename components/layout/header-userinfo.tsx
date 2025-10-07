"use client"

import { useAuthStore } from "@/stores/auth-store"

import { NavUser } from "@/components/layout/nav-user"

export function HeaderUserInfo() {
  const { user } = useAuthStore()

  // Helper function to get the proper avatar source
  const getAvatarSource = () => {
    if (user?.profilePicture) {
      // Check if it's a base64 string or a file path
      if (
        user.profilePicture.startsWith("data:") ||
        user.profilePicture.length > 100
      ) {
        // It's a base64 string
        return `data:image/jpeg;base64,${user.profilePicture}`
      } else {
        // It's a file path
        return user.profilePicture
      }
    }
    return "/uploads/avatars/default.png"
  }

  return (
    <NavUser
      user={{
        name: user?.userName || "Guest",
        email: user?.userEmail || "admin@gmail.com",
        role: user?.userRoleName || "admin",
        avatar: getAvatarSource(),
      }}
    />
  )
}
