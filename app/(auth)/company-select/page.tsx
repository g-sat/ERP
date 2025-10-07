"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ICompany } from "@/interfaces/auth"
import { useAuthStore } from "@/stores/auth-store"
import Cookies from "js-cookie"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SafeImage } from "@/components/ui/safe-image"
import AccessDenied from "@/app/access-denied"

export default function CompanySelectPage() {
  const {
    isAuthenticated,
    companies,
    currentCompany,
    switchCompany,
    logOut,
    getCompanies,
    getCurrentTabCompanyId,
  } = useAuthStore()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null) // Memoize handleLogout to avoid dependency issues in useEffect
  const handleLogout = useCallback(async () => {
    try {
      await logOut()
      Cookies.remove("auth-token")
      Cookies.remove("selectedCompanyId")
      router.push("/login")
    } catch {
      // silent
    }
  }, [logOut, router])
  useEffect(() => {
    const initializePage = async () => {
      // Check if we're actually on the company-select page
      const currentPath = window.location.pathname
      if (currentPath !== "/company-select") {
        return
      }
      if (!isAuthenticated) {
        router.push("/login")
        return
      }
      if (companies.length === 0) {
        try {
          await getCompanies()
          // Check if companies is still null/empty after fetching
          if (!companies || companies.length === 0) {
            setShowAccessDenied(true)
            return
          }
        } catch (error) {
          console.error("Failed to fetch companies:", error)
          setShowAccessDenied(true)
          return
        }
      }
      // Check if we have a company ID from the current tab (for new tabs)
      const tabCompanyId = getCurrentTabCompanyId()
      if (tabCompanyId) {
        // Verify the company exists in the companies list
        const companyExists = companies.some(
          (c) => c.companyId === tabCompanyId
        )
        if (companyExists) {
          // Switch to the company if not already selected (with automatic decimal fetching)
          if (currentCompany?.companyId !== tabCompanyId) {
            await switchCompany(tabCompanyId, true) // fetchDecimals = true (automatic)
          }
          // Redirect to dashboard
          router.push(`/${tabCompanyId}/dashboard`)
          return
        } else {
        }
      }
      // If only one company, automatically select and redirect
      if (companies.length === 1) {
        const singleCompany = companies[0]
        // Switch to the single company if not already selected (with automatic decimal fetching)
        if (currentCompany?.companyId !== singleCompany.companyId) {
          await switchCompany(singleCompany.companyId, true) // fetchDecimals = true (automatic)
        }
        // Redirect to dashboard
        router.push(`/${singleCompany.companyId}/dashboard`)
        return
      }
      // Multiple companies - show selection page
      // Use the current company or first available
      if (currentCompany?.companyId) {
        setSelectedCompanyId(currentCompany.companyId)
      } else if (companies.length > 0) {
        setSelectedCompanyId(companies[0].companyId)
      }
    }
    initializePage()
  }, [
    isAuthenticated,
    currentCompany,
    companies,
    getCompanies,
    getCurrentTabCompanyId,
    switchCompany,
    router,
    handleLogout,
  ])
  const handleContinue = async () => {
    if (!selectedCompanyId) return
    setError(null)
    setIsLoading(true)
    try {
      const selectedCompany = companies.find(
        (c) => c.companyId === selectedCompanyId
      )
      if (!selectedCompany) {
        throw new Error("Invalid company. Please select again.")
      }
      // OPTIMIZATION 1: Switch company with automatic decimal fetching
      if (currentCompany?.companyId !== selectedCompanyId) {
        // Don't await - let it run in background with automatic decimal fetching
        switchCompany(selectedCompanyId, true) // fetchDecimals = true (automatic)
      }
      // OPTIMIZATION 2: Navigate immediately, let dashboard handle data loading
      router.push(`/${selectedCompanyId}/dashboard`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Switch failed.")
    } finally {
      setIsLoading(false)
    }
  }
  // Get the first letter of company code or name as fallback
  const getCompanyInitial = (company: ICompany) => {
    return (company.companyCode || company.companyName || "?")
      .charAt(0)
      .toUpperCase()
  }
  if (showAccessDenied) {
    return <AccessDenied />
  }
  if (!isAuthenticated || companies.length === 0 || companies.length === 1) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }
  return (
    <div className="bg-muted dark:bg-background flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Select Your Company</CardTitle>
          <CardDescription>
            You have access to multiple companies. Choose one below to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <Label className="block">Companies</Label>
            <RadioGroup
              value={selectedCompanyId}
              onValueChange={setSelectedCompanyId}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {companies.map((company: ICompany) => (
                <Card
                  key={company.companyId}
                  onClick={() => setSelectedCompanyId(company.companyId)}
                  className={`cursor-pointer space-y-1 border p-4 transition-shadow hover:shadow-lg ${
                    selectedCompanyId === company.companyId
                      ? "border-indigo-500 shadow"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
                      <SafeImage
                        src={`/uploads/companies/${company.companyId}.svg`}
                        alt={company.companyName || "Company Logo"}
                        width={40}
                        height={40}
                        className="object-contain"
                        fallbackSrc="/placeholder.svg"
                        onError={() => {}}
                      />
                      <span className="hidden text-lg font-medium">
                        {getCompanyInitial(company)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium">
                          {company.companyName}
                        </span>
                        <RadioGroupItem
                          value={company.companyId}
                          className="!bg-transparent"
                        />
                      </div>
                      <span className="text-muted-foreground truncate text-sm">
                        {company.companyCode || "No Code"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </RadioGroup>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={handleContinue}
            disabled={isLoading || !selectedCompanyId}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
