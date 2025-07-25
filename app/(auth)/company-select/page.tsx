"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
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

export default function CompanySelectPage() {
  const {
    isAuthenticated,
    companies,
    currentCompany,
    switchCompany,
    logOut,
    getCompanies,
    getCurrentTabCompanyId,
    getDecimals, // Add getDecimals to fetch decimal settings explicitly
  } = useAuthStore()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
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
      console.log("Initializing company select page...")

      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login")
        router.push("/login")
        return
      }

      if (companies.length === 0) {
        console.log("No companies loaded, fetching companies")
        try {
          await getCompanies()
        } catch (error) {
          console.error("Failed to fetch companies:", error)
          handleLogout()
          return
        }
      }

      // First try to get the company ID from the current tab
      const tabCompanyId = getCurrentTabCompanyId()
      if (tabCompanyId) {
        console.log("Using tab-specific company ID:", tabCompanyId)
        setSelectedCompanyId(tabCompanyId)
        return
      }

      // Otherwise use the current company or first available
      if (currentCompany?.companyId) {
        console.log("Using current company ID:", currentCompany.companyId)
        setSelectedCompanyId(currentCompany.companyId)
      } else if (companies.length > 0) {
        console.log("Using first available company ID:", companies[0].companyId)
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

      console.log("Selected company:", selectedCompany) // Only switch if it's different from current
      if (currentCompany?.companyId !== selectedCompanyId) {
        console.log("Switching to company:", selectedCompanyId)
        await switchCompany(selectedCompanyId)
      } else {
        console.log("Already on selected company, skipping switch")
      }

      // Always fetch decimal settings when selecting a company
      console.log("Fetching decimal settings for company:", selectedCompanyId)
      await getDecimals()

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

  if (!isAuthenticated || companies.length === 0) {
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
            Choose one of your companies below to continue.
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
                      <Image
                        src={`/uploads/companies/${company.companyId}.svg`}
                        alt={company.companyName || "Company Logo"}
                        width={40}
                        height={40}
                        className="object-contain"
                        onError={(e) => {
                          // Hide the image on error and show the initial
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          )
                        }}
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
