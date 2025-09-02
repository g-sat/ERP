import jsPDF from "jspdf"

interface PayslipData {
  employeeName: string
  employeeId: string
  payPeriod: string
  presentDays: number
  pastDays: number
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
    // Set up the document
    this.doc.setFont("helvetica")
    this.doc.setFontSize(12)

    // Company Header
    this.doc.setFontSize(20)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("COMPANY NAME", 105, 20, { align: "center" })

    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "normal")
    this.doc.text("PAYSLIP", 105, 35, { align: "center" })

    // Employee Information
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Employee Information:", 20, 55)

    this.doc.setFont("helvetica", "normal")
    this.doc.text(`Name: ${data.employeeName}`, 20, 65)
    this.doc.text(`ID: ${data.employeeId}`, 20, 75)
    this.doc.text(`Pay Period: ${data.payPeriod}`, 20, 85)
    this.doc.text(`Present Days: ${data.presentDays}`, 20, 95)
    this.doc.text(`Arrears Days: ${data.pastDays}`, 20, 105)

    // Earnings Section
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Earnings:", 20, 125)

    let yPosition = 135
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(10)

    // Headers
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Component", 20, yPosition)
    this.doc.text("Basic", 100, yPosition)
    this.doc.text("Current", 150, yPosition)

    yPosition += 10

    // Earnings data
    data.earnings.forEach((earning) => {
      this.doc.setFont("helvetica", "normal")
      this.doc.text(earning.componentName, 20, yPosition)
      this.doc.text(this.formatCurrency(earning.basicAmount), 100, yPosition)
      this.doc.text(this.formatCurrency(earning.currentAmount), 150, yPosition)
      yPosition += 8
    })

    // Deductions Section
    yPosition += 5
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Deductions:", 20, yPosition)

    yPosition += 10

    // Deductions data
    data.deductions.forEach((deduction) => {
      this.doc.setFont("helvetica", "normal")
      this.doc.text(deduction.componentName, 20, yPosition)
      this.doc.text(this.formatCurrency(deduction.basicAmount), 100, yPosition)
      this.doc.text(
        this.formatCurrency(deduction.currentAmount),
        150,
        yPosition
      )
      yPosition += 8
    })

    // Net Pay Summary
    yPosition += 10
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Summary:", 20, yPosition)

    yPosition += 10
    this.doc.setFont("helvetica", "normal")
    this.doc.text(
      `Basic Net Pay: ${this.formatCurrency(data.basicNetPay)}`,
      20,
      yPosition
    )
    yPosition += 8
    this.doc.text(
      `Current Net Pay: ${this.formatCurrency(data.netPay)}`,
      20,
      yPosition
    )

    // Footer
    yPosition += 15
    this.doc.setFontSize(8)
    this.doc.text(
      "Generated on: " + new Date().toLocaleDateString(),
      20,
      yPosition
    )
    this.doc.text("This is a computer generated document", 105, yPosition, {
      align: "center",
    })

    // Return as blob
    return this.doc.output("blob")
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }
}

export const payslipPDFGenerator = new PayslipPDFGenerator()
