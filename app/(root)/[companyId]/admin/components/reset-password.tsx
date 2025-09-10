"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { useResetPasswordV1 } from "@/hooks/use-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResetPasswordData {
  password: string
  confirmPassword: string
}

interface ResetPasswordProps {
  userId: number
  userCode: string
  onCancel: () => void
  onSuccess?: () => void
}

export function ResetPassword({
  userId,
  userCode,
  onCancel,
  onSuccess,
}: ResetPasswordProps) {
  const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordData>(
    {
      password: "",
      confirmPassword: "",
    }
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Reset form when component mounts (dialog opens)
  const resetForm = () => {
    setResetPasswordData({ password: "", confirmPassword: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Reset form on mount and when userId changes (dialog opens for different user)
  useEffect(() => {
    resetForm()
  }, [userId])

  const resetPasswordMutation = useResetPasswordV1()

  const handleCancelReset = () => {
    resetForm()
    resetPasswordMutation.reset()
    onCancel()
  }

  const handleResetPassword = async () => {
    if (!userId) {
      toast.error("User ID is required for password reset")
      return
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (resetPasswordData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        userId: userId,
        userCode: userCode,
        userPassword: resetPasswordData.password,
        confirmPassword: resetPasswordData.confirmPassword,
      })

      if (response.result === 1) {
        toast.success("Password reset successfully")
        resetForm()
        onSuccess?.()
      } else {
        toast.error("Failed to reset password")
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while resetting password"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={resetPasswordData.password}
            onChange={(e) =>
              setResetPasswordData({
                ...resetPasswordData,
                password: e.target.value,
              })
            }
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={resetPasswordData.confirmPassword}
            onChange={(e) =>
              setResetPasswordData({
                ...resetPasswordData,
                confirmPassword: e.target.value,
              })
            }
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={handleCancelReset}
          disabled={resetPasswordMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleResetPassword}
          disabled={
            resetPasswordMutation.isPending ||
            !resetPasswordData.password ||
            !resetPasswordData.confirmPassword
          }
        >
          {resetPasswordMutation.isPending ? "Resetting..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
