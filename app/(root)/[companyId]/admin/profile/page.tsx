"use client"

import { useEffect, useRef, useState } from "react"
import {
  ResetPasswordFormValues,
  UserProfileFormValues,
  resetPasswordSchema,
  userProfileSchema,
} from "@/schemas/admin"
import { useAuthStore } from "@/stores/auth-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import {
  Camera,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Save,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { clientDateFormat, parseDate } from "@/lib/format"
import { useGetById, useUpdate } from "@/hooks/use-common"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
  })

  // API hooks
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetById<UserProfileFormValues>(
    "/admin/GetUserProfile",
    "userProfile",
    user?.userId || "0"
  )

  console.log("Profile Data:", profileData)

  const updateProfileMutation = useUpdate<UserProfileFormValues>(
    "/admin/SaveUserProfile"
  )

  const resetPasswordMutation = useUpdate<ResetPasswordFormValues>(
    "/admin/ResetPassword"
  )

  // Debug mutations
  console.log("Profile mutation pending:", updateProfileMutation.isPending)
  console.log("Password mutation pending:", resetPasswordMutation.isPending)

  // Profile form
  const profileForm = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      userId: parseInt(user?.userId || "0"),
      firstName: user?.userName?.split(" ")[0] || "",
      lastName: user?.userName?.split(" ").slice(1).join(" ") || "",
      birthDate: "",
      gender: "M",
      profilePicture: "",
      bio: "",
      primaryContactType: "Phone",
      primaryContactValue: "",
      secondaryContactType: "Phone",
      secondaryContactValue: "",
      addressType: "Home",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      languagePreference: "en-US",
      themePreference: "system",
      timezonePreference: "UTC",
    },
    mode: "onChange", // Enable real-time validation
  })

  // Debug form state
  console.log("📝 Form state:", {
    isValid: profileForm.formState.isValid,
    isDirty: profileForm.formState.isDirty,
    errors: profileForm.formState.errors,
    values: profileForm.getValues(),
  })

  // Update form when profile data is loaded
  useEffect(() => {
    if (profileData?.data) {
      console.log("Profile API Response:", profileData)

      // Handle both array and single object responses
      const profile = Array.isArray(profileData.data)
        ? profileData.data[0]
        : profileData.data

      if (profile) {
        console.log("Profile Data:", profile)

        // Set current profile picture for avatar display
        setCurrentProfilePicture(profile.profilePicture || "")

        profileForm.reset({
          userId: profile.userId,
          firstName: profile.firstName || user?.userName?.split(" ")[0] || "",
          lastName:
            profile.lastName ||
            user?.userName?.split(" ").slice(1).join(" ") ||
            "",
          birthDate: format(
            parseDate(profile.birthDate as string) || new Date(),
            clientDateFormat
          ),
          gender: profile.gender || "M",
          profilePicture: profile.profilePicture || "",
          bio: profile.bio || "",
          primaryContactType: profile.primaryContactType || "Phone",
          primaryContactValue: profile.primaryContactValue || "",
          secondaryContactType: profile.secondaryContactType || "Phone",
          secondaryContactValue: profile.secondaryContactValue || "",
          addressType: profile.addressType || "Home",
          street: profile.street || "",
          city: profile.city || "",
          state: profile.state || "",
          postalCode: profile.postalCode || "",
          country: profile.country || "",
          languagePreference: profile.languagePreference || "en-US",
          themePreference: profile.themePreference || "system",
          timezonePreference: profile.timezonePreference || "UTC",
        })
      }
    }
  }, [profileData, user?.userName, profileForm])

  // Password form
  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      userId: parseInt(user?.userId || "0"),
      userCode: user?.userCode || "",
      userPassword: "",
      confirmPassword: "",
    },
  })

  // Update password form when user data changes
  useEffect(() => {
    if (user) {
      passwordForm.setValue("userId", parseInt(user.userId || "0"))
      passwordForm.setValue("userCode", user.userCode || "")
    }
  }, [user, passwordForm])

  // Profile form submission
  const onProfileSubmit = async (data: UserProfileFormValues) => {
    console.log("🎯 onProfileSubmit called!")
    console.log("Profile form data:", data)
    console.log("Profile form errors:", profileForm.formState.errors)

    if (Object.keys(profileForm.formState.errors).length > 0) {
      console.error("Form validation errors:", profileForm.formState.errors)
      toast.error("Please fix the form errors before submitting")
      return
    }

    console.log("✅ Form validation passed, calling API...")
    updateProfileMutation.mutate(data)
  }

  // Password form submission
  const onPasswordSubmit = async (data: ResetPasswordFormValues) => {
    console.log("Password form data:", data)
    console.log("Form errors:", passwordForm.formState.errors)

    if (Object.keys(passwordForm.formState.errors).length > 0) {
      console.error(
        "Password form validation errors:",
        passwordForm.formState.errors
      )
      toast.error("Please fix the password form errors before submitting")
      return
    }

    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        passwordForm.reset()
      },
    })
  }

  // Avatar handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Please select an image smaller than 5MB.")
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  // Convert file to Base64 with optional resizing
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string

        // Create an image element to check dimensions
        const img = new Image()
        img.onload = () => {
          // Optional: Resize image if it's too large
          const maxWidth = 400
          const maxHeight = 400

          if (img.width > maxWidth || img.height > maxHeight) {
            // Create canvas to resize image
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img
            if (width > height) {
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }
            } else {
              if (height > maxHeight) {
                width = (width * maxHeight) / height
                height = maxHeight
              }
            }

            canvas.width = width
            canvas.height = height

            // Draw resized image
            ctx?.drawImage(img, 0, 0, width, height)

            // Convert to Base64 with compression
            const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8)
            const base64 = resizedBase64.split(",")[1]
            resolve(base64)
          } else {
            // Use original image with compression
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)

            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8)
            const base64 = compressedBase64.split(",")[1]
            resolve(base64)
          }
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = result
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleAvatarUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error("Please select an image to upload.")
      return
    }

    try {
      const file = fileInputRef.current.files[0]

      // Convert image to Base64
      const base64Image = await convertFileToBase64(file)

      // Get current form values
      const currentFormData = profileForm.getValues()

      // Update form with Base64 image data
      const updatedFormData = {
        ...currentFormData,
        profilePicture: base64Image,
      }

      console.log("Uploading avatar as Base64...")
      console.log("Image size:", file.size, "bytes")
      console.log("Base64 length:", base64Image.length)

      // Call the profile update API with the new avatar
      updateProfileMutation.mutate(updatedFormData, {
        onSuccess: () => {
          toast.success("Avatar Updated", {
            description: "Your profile picture has been updated successfully.",
          })

          // Update current profile picture state
          setCurrentProfilePicture(base64Image)

          // Clear the file input and preview
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          setPreviewUrl(null)
        },
        onError: (error) => {
          console.error("Failed to upload avatar:", error)
          toast.error("Failed to upload avatar. Please try again.")
        },
      })
    } catch (error) {
      console.error("Error converting image to Base64:", error)
      toast.error("Failed to process image. Please try again.")
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      // Get current form values
      const currentFormData = profileForm.getValues()

      // Update form with empty profile picture
      const updatedFormData = {
        ...currentFormData,
        profilePicture: "",
      }

      console.log("Removing avatar...")

      // Call the profile update API to remove avatar
      updateProfileMutation.mutate(updatedFormData, {
        onSuccess: () => {
          toast.success("Avatar Removed", {
            description: "Your profile picture has been removed successfully.",
          })

          // Update current profile picture state
          setCurrentProfilePicture("")

          // Clear the file input and preview
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          setPreviewUrl(null)
        },
        onError: (error) => {
          console.error("Failed to remove avatar:", error)
          toast.error("Failed to remove avatar. Please try again.")
        },
      })
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast.error("Failed to remove avatar. Please try again.")
    }
  }

  const handleSecuritySettingChange = (
    setting: keyof typeof securitySettings
  ) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))

    toast.success("Setting Updated", {
      description: `${setting.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} has been ${securitySettings[setting] ? "disabled" : "enabled"}.`,
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="@container flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings, personal information, and security
          preferences.
        </p>
      </div>

      {isLoadingProfile && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      )}

      {profileError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Error loading profile
              </p>
              <p className="text-sm text-red-700">
                {profileError.message || "Failed to load profile data"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Avatar and Basic Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
              <CardDescription>
                Upload and manage your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={
                        previewUrl ||
                        (currentProfilePicture
                          ? `data:image/jpeg;base64,${currentProfilePicture}`
                          : "/avatars/man1.png")
                      }
                      alt={user?.userName || "User"}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user?.userName || "User")}
                    </AvatarFallback>
                  </Avatar>

                  {previewUrl && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium">
                    {user?.userName || "User"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {user?.userEmail || "user@example.com"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-upload">Upload New Picture</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {previewUrl && (
                    <Button
                      onClick={handleAvatarUpload}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  <p>• Supported: JPG, PNG, GIF (max 5MB)</p>
                  <p>• Recommended: 400x400 pixels</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Two-Factor Authentication</Label>
                  <p className="text-muted-foreground text-xs">
                    Add extra security layer
                  </p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={() =>
                    handleSecuritySettingChange("twoFactorAuth")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Email Notifications</Label>
                  <p className="text-muted-foreground text-xs">
                    Security alerts via email
                  </p>
                </div>
                <Switch
                  checked={securitySettings.emailNotifications}
                  onCheckedChange={() =>
                    handleSecuritySettingChange("emailNotifications")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Login Alerts</Label>
                  <p className="text-muted-foreground text-xs">
                    New login notifications
                  </p>
                </div>
                <Switch
                  checked={securitySettings.loginAlerts}
                  onCheckedChange={() =>
                    handleSecuritySettingChange("loginAlerts")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  console.log("🚀 Form submit event triggered!")
                  profileForm.handleSubmit(onProfileSubmit)(e)
                }}
                className="space-y-6"
              >
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Information</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        {...profileForm.register("firstName")}
                        placeholder="Enter your first name"
                      />
                      {profileForm.formState.errors.firstName && (
                        <p className="text-destructive text-sm">
                          {profileForm.formState.errors.firstName.message?.toString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        {...profileForm.register("lastName")}
                        placeholder="Enter your last name"
                      />
                      {profileForm.formState.errors.lastName && (
                        <p className="text-destructive text-sm">
                          {profileForm.formState.errors.lastName.message?.toString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        {...profileForm.register("birthDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "gender",
                            value as "M" | "F" | "O"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                          <SelectItem value="O">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...profileForm.register("bio")}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-destructive text-sm">
                        {profileForm.formState.errors.bio.message?.toString()}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactType">
                        Primary Contact Type
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "primaryContactType",
                            value as
                              | "Phone"
                              | "Email"
                              | "WhatsApp"
                              | "Skype"
                              | "Other"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Skype">Skype</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryContactValue">
                        Primary Contact
                      </Label>
                      <Input
                        id="primaryContactValue"
                        {...profileForm.register("primaryContactValue")}
                        placeholder="Enter contact value"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactType">
                        Secondary Contact Type
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "secondaryContactType",
                            value as
                              | "Phone"
                              | "Email"
                              | "WhatsApp"
                              | "Skype"
                              | "Other"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Skype">Skype</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactValue">
                        Secondary Contact
                      </Label>
                      <Input
                        id="secondaryContactValue"
                        {...profileForm.register("secondaryContactValue")}
                        placeholder="Enter contact value"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="addressType">Address Type</Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "addressType",
                            value as
                              | "Home"
                              | "Office"
                              | "Billing"
                              | "Shipping"
                              | "Other"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="Shipping">Shipping</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        {...profileForm.register("street")}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...profileForm.register("city")}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        {...profileForm.register("state")}
                        placeholder="Enter state"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        {...profileForm.register("postalCode")}
                        placeholder="Enter postal code"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...profileForm.register("country")}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preferences */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium">
                    <Globe className="h-4 w-4" />
                    Preferences
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="languagePreference">Language</Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue("languagePreference", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="themePreference">Theme</Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue(
                            "themePreference",
                            value as "light" | "dark" | "system"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezonePreference">Timezone</Label>
                      <Select
                        onValueChange={(value) =>
                          profileForm.setValue("timezonePreference", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">
                            Eastern Time
                          </SelectItem>
                          <SelectItem value="America/Chicago">
                            Central Time
                          </SelectItem>
                          <SelectItem value="America/Denver">
                            Mountain Time
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Pacific Time
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log("🧪 Testing API call...")
                      const testData = {
                        userId: parseInt(user?.userId || "0"),
                        firstName: "Test",
                        lastName: "User",
                        birthDate: "",
                        gender: undefined,
                        profilePicture: "",
                        bio: "",
                        primaryContactType: undefined,
                        primaryContactValue: "",
                        secondaryContactType: undefined,
                        secondaryContactValue: "",
                        addressType: undefined,
                        street: "",
                        city: "",
                        state: "",
                        postalCode: "",
                        country: "",
                        languagePreference: "en-US",
                        themePreference: "system" as const,
                        timezonePreference: "UTC",
                      }
                      console.log("Test data:", testData)
                      updateProfileMutation.mutate(testData)
                    }}
                  >
                    Test API
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log("🔍 Testing form submission...")
                      const formData = profileForm.getValues()
                      console.log("Form data:", formData)
                      onProfileSubmit(formData)
                    }}
                  >
                    Test Form Submit
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    onClick={() => {
                      console.log("🔘 Save Changes button clicked!")
                      console.log(
                        "Current form values:",
                        profileForm.getValues()
                      )
                      console.log(
                        "Form is valid:",
                        profileForm.formState.isValid
                      )
                      console.log("Form errors:", profileForm.formState.errors)
                    }}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register("userPassword")}
                      placeholder="Enter your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.userPassword && (
                    <p className="text-destructive text-sm">
                      {passwordForm.formState.errors.userPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordForm.register("confirmPassword")}
                      placeholder="Confirm your new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-destructive text-sm">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Password Requirements</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• At least 8 characters long</li>
                    <li>• Include uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                    <li>• Include at least one special character</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
