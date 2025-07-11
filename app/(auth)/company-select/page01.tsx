"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ICompany } from "@/interfaces/auth"
import { useAuthStore } from "@/stores/auth-store"
import Cookies from "js-cookie"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login")
        router.push("/login")
        return
      }

      // If companies array is empty, try to fetch companies
      if (companies.length === 0) {
        console.log("No companies available, fetching companies...")
        try {
          await getCompanies()
          console.log("Fetched companies:", companies)
        } catch (error) {
          console.error("Failed to fetch companies:", error)
          handleLogout()
          return
        }
      }

      // Check for tab-specific company ID first
      const tabCompanyId = getCurrentTabCompanyId()
      if (tabCompanyId) {
        console.log("Found tab-specific company ID:", tabCompanyId)
        const tabCompany = companies.find((c) => c.companyId === tabCompanyId)
        if (tabCompany) {
          console.log("Setting company from tab:", tabCompany)
          setSelectedCompanyId(tabCompanyId)
          return
        }
      }

      // If no tab company ID, use current company or first available
      if (currentCompany?.companyId) {
        console.log(
          "Setting initial company from currentCompany:",
          currentCompany
        )
        setSelectedCompanyId(currentCompany.companyId)
      } else if (companies.length > 0) {
        console.log(
          "Setting initial company from first available:",
          companies[0]
        )
        setSelectedCompanyId(companies[0].companyId)
      }
    }

    initializePage()
  }, [
    isAuthenticated,
    currentCompany,
    companies,
    router,
    getCompanies,
    getCurrentTabCompanyId,
  ])

  const handleLogout = async () => {
    try {
      // Clear all data by calling logout
      await logOut()
      // Clear cookies
      Cookies.remove("auth-token")
      Cookies.remove("selectedCompanyId")
      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const handleCompanyChange = (value: string) => {
    console.log("Company selected:", value)
    console.log("Available companies:", companies)
    setSelectedCompanyId(value)
  }

  const handleContinue = async () => {
    if (!selectedCompanyId) return

    setIsLoading(true)
    try {
      // Log all available companies for debugging
      console.log("Available companies:", companies)
      console.log("Selected company ID:", selectedCompanyId)

      // Validate if the company exists
      const selectedCompany = companies.find(
        (c) => c.companyId === selectedCompanyId
      )

      if (!selectedCompany) {
        console.error(
          `Company with ID ${selectedCompanyId} not found in available companies:`,
          companies
        )
        throw new Error(
          `Company with ID ${selectedCompanyId} not found. Please select a valid company.`
        )
      }

      console.log(`Switching to company ID: ${selectedCompanyId}`)
      await switchCompany(selectedCompanyId)

      console.log("Selected company details:", selectedCompany)
      console.log("Redirecting to dashboard...")
      router.push(`/${selectedCompanyId}/dashboard`)
    } catch (error) {
      console.error("Error switching company:", error)
      // Show error message to user
      alert(error instanceof Error ? error.message : "Failed to switch company")
    } finally {
      setIsLoading(false)
    }
  }

  // If not authenticated or no companies, show loading state
  if (!isAuthenticated || companies.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load your company information
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-muted dark:bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Select Company</CardTitle>
          <CardDescription className="text-center">
            Please select a company to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select
                value={selectedCompanyId}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company: ICompany) => (
                    <SelectItem
                      key={company.companyId}
                      value={company.companyId}
                    >
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleContinue}
              disabled={isLoading || !selectedCompanyId}
            >
              {isLoading ? "Loading..." : "Continue to Dashboard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
