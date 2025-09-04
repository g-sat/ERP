import jsPDF from "jspdf"

interface PayslipData {
  employeeName: string
  employeeId: string
  payPeriod: string
  companyName: string
  companyId: string
  address: string
  phoneNo: string
  email: string
  employeeCode: string
  designationName: string
  departmentName: string
  emailAdd: string
  workPermitNo: string
  personalNo: string
  iban: string
  presentDays: number
  pastDays: number
  bankName: string
  joinDate: string
  whatsUpPhoneNo: string
  earnings: Array<{
    componentName: string
    basicAmount: number
    currentAmount: number
  }>
  deductions: Array<{
    componentName: string
    basicAmount: number
    currentAmount: number
  }>
  netPay: number
  basicNetPay: number
}

export class PayslipPDFGenerator {
  private doc: jsPDF

  constructor() {
    this.doc = new jsPDF()
  }

  generatePayslip(data: PayslipData): Blob {
    // Initialize new PDF document
    this.doc = new jsPDF()

    const headerYPosition = 25

    // Set base font and size
    this.doc.setFont("helvetica")
    this.doc.setFontSize(8)

    // Company name header with logo
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")

    // Try to load and display company logo
    try {
      // Logo position (left side) - made larger for better visibility
      const logoX = 20
      const logoY = headerYPosition - 5
      const logoSize = 20 // Increased from 20 to 25 for better visibility

      // Create table structure for logo and company details
      // Logo column: 20%, Company details: 80%
      const totalTableWidth = 170 // Total usable width (210 - 20 - 20 margins)
      const logoColumnWidth = totalTableWidth * 0.2 // 20% = 34mm
      const companyDetailsWidth = totalTableWidth * 0.8 // 80% = 136mm
      const tableStartX = 20
      const tableHeight = 25

      // Draw table border
      this.doc.setDrawColor(200, 200, 200) // Light gray border
      this.doc.rect(
        tableStartX,
        logoY - 5,
        logoColumnWidth + companyDetailsWidth,
        tableHeight,
        "S"
      )

      // Draw vertical separator line
      this.doc.line(
        tableStartX + logoColumnWidth,
        logoY - 5,
        tableStartX + logoColumnWidth,
        logoY + tableHeight - 5
      ) // After logo column

      // Logo in first column (20%)
      this.loadCompanyLogo(data.companyId, logoX + 2, logoY, logoSize)

      // Company name in company details column (80%)
      const companyNameX = tableStartX + logoColumnWidth + 5
      const companyDetailsCenterX = companyNameX + companyDetailsWidth / 2

      // Debug: Log the positioning values
      console.log("Table layout:", {
        tableStartX,
        logoColumnWidth,
        companyDetailsWidth,
        companyNameX,
        companyDetailsCenterX,
        totalWidth: logoColumnWidth + companyDetailsWidth,
      })

      this.doc.text(
        data.companyName || "",
        companyDetailsCenterX,
        headerYPosition + 5,
        {
          align: "center",
        }
      )

      // Company contact information in company details column (80%)
      this.doc.setFontSize(10)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(
        data.address + " | " + data.phoneNo + " | " + data.email,
        companyDetailsCenterX,
        headerYPosition + 15,
        {
          align: "center",
        }
      )
    } catch {
      // If logo loading fails, just display company name centered
      this.doc.text(data.companyName || "", 105, headerYPosition + 5, {
        align: "center",
      })
    }

    const separatorY = headerYPosition + 20
    // Separator line
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(20, separatorY, 190, separatorY)

    const payslipTitleY = separatorY + 5
    // Payslip title
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(
      `Payslip for the month of ${data.payPeriod}`,
      105,
      payslipTitleY,
      {
        align: "center",
      }
    )

    // Separator line
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(20, payslipTitleY + 2, 190, payslipTitleY + 2)

    // Pay summary section
    let yPosition = payslipTitleY + 7
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Pay Summary", 20, yPosition)

    // Employee details list
    const leftColumnDetails = [
      ["Employee Name ", `: ${data.employeeName}`],
      ["Employee Code ", `: ${data.employeeCode || ""}`],
      ["Designation ", `: ${data.designationName || ""}`],
      ["Department ", `: ${data.departmentName || ""}`],
      ["Work Permit No ", `: ${data.workPermitNo || ""}`],
      ["MOL ID ", `: ${data.personalNo || ""}`],
      ["Bank Name ", `: ${data.bankName || ""}`],
      ["IBAN ", `: ${data.iban || ""}`],
      ["Date of Joining ", `: ${this.formatDate(data.joinDate) || ""}`],
      ["Pay Period ", `: ${data.payPeriod || ""}`],
      ["WhatsApp No ", `: ${data.whatsUpPhoneNo || ""}`],
    ]

    // Draw employee details
    let leftColumnY = yPosition + 5
    leftColumnDetails.forEach(([label, value]) => {
      this.doc.setFontSize(8)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(label, 20, leftColumnY)
      this.doc.text(value, 50, leftColumnY)
      leftColumnY += 4
    })

    // Total net pay section
    const totalNetPayY = yPosition + 5

    // Add highlighted background box for Total Net Pay section - centered
    this.doc.setFillColor(255, 255, 255) // White background (no color)
    this.doc.setDrawColor(0, 0, 0) // Black border for emphasis
    this.doc.rect(130, totalNetPayY, 50, 25, "FD") // Fill and Draw with background and border

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text("Total Net Pay", 155, totalNetPayY + 8, { align: "center" })

    this.doc.setFontSize(18)
    this.doc.text(
      `AED ${this.formatCurrency(data.netPay || 0)}`,
      155,
      totalNetPayY + 15,
      {
        align: "center",
      }
    )

    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(
      `Paid Days: ${data.presentDays || 0} | LOP Days: ${data.pastDays || 30 - data.presentDays}`,
      155,
      totalNetPayY + 20,
      { align: "center" }
    )

    // Calculate table positions
    yPosition = totalNetPayY + 40

    // Earnings table - 70% width
    this.doc.setDrawColor(200, 200, 200) // Steel blue border for earnings table
    this.doc.rect(20, yPosition + 5, 95, 70, "S") //table header border

    // Earnings table header
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(20, yPosition + 5, 95, 8, "F") //table header fill
    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Earning", 22, yPosition + 10)
    this.doc.text("Fixed", 75, yPosition + 10)
    this.doc.text("Current", 105, yPosition + 10, { align: "right" })

    // Earnings table header line
    this.doc.setDrawColor(200, 200, 200) // Steel blue lines for better visibility
    this.doc.line(20, yPosition + 13, 115, yPosition + 13) //table header line

    // Earnings table column lines
    this.doc.line(65, yPosition + 5, 65, yPosition + 75) //1st column line
    this.doc.line(90, yPosition + 5, 90, yPosition + 75) //2nd column line

    // Prepare earnings data
    let earningsData = []
    if (data.earnings && data.earnings.length > 0) {
      earningsData = data.earnings
    } else {
      earningsData = [
        {
          componentName: "Basic",
          basicAmount: data.basicNetPay || 0,
          currentAmount: data.basicNetPay || 0,
        },
        {
          componentName: "Housing Allowance",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "Food Allowance",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "Bonus",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "Leave Allowance",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "Ticket Allowance",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "Other Allowance",
          basicAmount: 0,
          currentAmount: 0,
        },
      ]
    }

    // Draw earnings table rows
    let earningsTableY = yPosition + 13
    earningsData.forEach((earning, index) => {
      // Only draw horizontal row line if it's not the first row (header line is already drawn)
      if (index > 0) {
        this.doc.line(20, earningsTableY, 115, earningsTableY)
      }

      this.doc.setFontSize(7)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(earning.componentName || "", 22, earningsTableY + 4)

      this.doc.text(
        this.formatCurrency(earning.basicAmount || 0),
        85,
        earningsTableY + 4,
        { align: "right" }
      )

      this.doc.text(
        this.formatCurrency(earning.currentAmount || 0),
        110,
        earningsTableY + 4,
        { align: "right" }
      )

      earningsTableY += 6
    })

    this.doc.line(20, earningsTableY, 115, earningsTableY)

    // Deductions table - 30% width with gap
    this.doc.setDrawColor(200, 200, 200) // Crimson border for deductions table
    this.doc.rect(125, yPosition + 5, 70, 70, "S")

    // Deductions table header
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(125, yPosition + 5, 70, 8, "F")
    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Deductions", 135, yPosition + 10)
    this.doc.text("Amount", 190, yPosition + 10, { align: "right" })

    // Deductions table column line
    this.doc.setDrawColor(200, 200, 200) // Crimson column line
    this.doc.line(165, yPosition + 5, 165, yPosition + 75)

    // Prepare deductions data
    let deductionsData = []
    if (data.deductions && data.deductions.length > 0) {
      deductionsData = data.deductions
    } else {
      deductionsData = [
        {
          componentName: "Salary Advance",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "Fines and Damages",
          basicAmount: 0,
          currentAmount: 0,
        },
        {
          componentName: "EPF",
          basicAmount: 0,
          currentAmount: 0,
        },
      ]
    }

    // Draw deductions table rows
    let deductionsTableY = yPosition + 13
    deductionsData.forEach((deduction, index) => {
      // Only draw horizontal row line if it's not the first row (header line is already drawn)
      if (index > 0) {
        this.doc.line(125, deductionsTableY, 195, deductionsTableY)
      }

      this.doc.setFontSize(7)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(deduction.componentName || "", 130, deductionsTableY + 4)

      this.doc.text(
        this.formatCurrency(deduction.currentAmount || 0),
        190,
        deductionsTableY + 4,
        { align: "right" }
      )

      deductionsTableY += 6
    })
    this.doc.line(125, deductionsTableY, 195, deductionsTableY)

    // Calculate fixed/basic amounts sum
    const fixedAmountsSum =
      data.earnings && data.earnings.length > 0
        ? data.earnings.reduce(
            (sum, earning) => sum + (earning.basicAmount || 0),
            0
          )
        : data.basicNetPay || 0

    // Calculate current amounts sum
    const currentAmountsSum =
      data.earnings && data.earnings.length > 0
        ? data.earnings.reduce(
            (sum, earning) => sum + (earning.currentAmount || 0),
            0
          )
        : data.basicNetPay || 0

    // Calculate total deductions
    const totalDeductions =
      data.deductions && data.deductions.length > 0
        ? data.deductions.reduce(
            (sum, deduction) => sum + (deduction.currentAmount || 0),
            0
          )
        : 0

    // Combined summary row - Gross Earnings & Total Deductions in one row
    const summaryY = Math.max(earningsTableY, deductionsTableY) + 5
    this.doc.setFontSize(9)
    this.doc.setFont("helvetica", "normal")

    // Left side - Gross Earnings
    this.doc.text("Gross Earnings:", 22, summaryY)
    this.doc.text(this.formatCurrency(fixedAmountsSum), 85, summaryY, {
      align: "right",
    })
    this.doc.text(this.formatCurrency(currentAmountsSum), 110, summaryY, {
      align: "right",
    })

    // Right side - Total Deductions
    this.doc.text("Total Deductions:", 130, summaryY)
    this.doc.text(this.formatCurrency(totalDeductions), 190, summaryY, {
      align: "right",
    })

    // NET PAY Section with proper table structure
    const netPayStartY = summaryY + 4

    // NET PAY table border
    this.doc.setDrawColor(200, 200, 200) // Forest green border for NET PAY table
    this.doc.rect(20, netPayStartY, 175, 25, "S") //table border

    // NET PAY header
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(20, netPayStartY, 175, 6, "F")
    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Net Pay", 30, netPayStartY + 4, { align: "center" })
    this.doc.text("Amount", 190, netPayStartY + 4, { align: "right" })

    // NET PAY header line
    this.doc.setDrawColor(200, 200, 200) // Forest green lines for better visibility
    this.doc.line(20, netPayStartY + 6, 195, netPayStartY + 6)

    // NET PAY column line
    this.doc.line(125, netPayStartY, 125, netPayStartY + 25)

    // NET PAY content rows
    this.doc.setFontSize(8)
    this.doc.setFont("helvetica", "normal")

    // Gross Earnings row
    this.doc.text("Gross Earnings", 25, netPayStartY + 11)
    this.doc.text(
      `AED ${this.formatCurrency(currentAmountsSum)}`,
      190,
      netPayStartY + 11,
      { align: "right" }
    )
    // Horizontal lines for NET PAY table
    this.doc.line(20, netPayStartY + 13, 195, netPayStartY + 13)

    // Total Deductions row
    this.doc.text("Total Deductions", 25, netPayStartY + 17)
    this.doc.text(
      `(-) AED ${this.formatCurrency(totalDeductions)}`,
      190,
      netPayStartY + 17,
      { align: "right" }
    )

    // Horizontal lines for NET PAY table
    this.doc.line(20, netPayStartY + 19, 195, netPayStartY + 19)

    // Total Net Payable row
    this.doc.text("Total Net Pay", 25, netPayStartY + 23)
    this.doc.text(
      `AED ${this.formatCurrency(currentAmountsSum - totalDeductions)}`,
      190,
      netPayStartY + 23,
      { align: "right" }
    )

    // Footer
    const footerY = 270
    this.doc.setFontSize(8)
    this.doc.text(
      "--- This is a system-generated document not for manual signature. ---",
      105,
      footerY,
      { align: "center" }
    )

    // Return PDF as blob
    return this.doc.output("blob")
  }

  private formatDate(dateString: string): string {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString("default", { month: "short" })
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  private formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return "0.00"
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  private loadCompanyLogo(
    companyId: string,
    x: number,
    y: number,
    size: number
  ): void {
    try {
      // Always use the 1.png image as specified
      const logoPath = `/public/uploads/companies/1.png`

      // Load and display the actual PNG logo
      try {
        // Try to load the actual image
        this.doc.addImage(logoPath, "PNG", x, y, size, size)
        console.log("Logo loaded successfully:", logoPath)
      } catch (imageError) {
        console.warn("Image loading failed, no logo displayed:", imageError)
        // No fallback - just show company name without logo
      }

      // Log the logo path for debugging
      console.log("Logo path configured:", logoPath)
    } catch (error) {
      console.warn("Logo loading failed:", error)
      // No fallback - just show company name without logo
    }
  }
}

export const payslipPDFGenerator = new PayslipPDFGenerator()
