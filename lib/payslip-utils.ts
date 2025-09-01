import { IPayrollEmployeeHd } from "@/interfaces/payrun"
import { format } from "date-fns"

// Function to generate PDF from React component using jsPDF
export const generatePayslipPDF = async (
  employee: IPayrollEmployeeHd,
  payrunId: string,
  payPeriod: string,
  payDate: string,
  companyName: string
): Promise<Blob> => {
  try {
    // Import jsPDF dynamically
    const { jsPDF } = await import("jspdf")

    // Create a new PDF document
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20

    // Set font
    pdf.setFont("helvetica")

    // Header
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text(companyName, margin, 30)

    pdf.setFontSize(14)
    pdf.setFont("helvetica", "normal")
    pdf.text("Employee Payslip", margin, 40)

    pdf.setFontSize(10)
    pdf.text(
      `Generated on: ${format(new Date(), "dd/MM/yyyy")}`,
      pageWidth - margin - 60,
      30
    )
    pdf.text(`Payrun ID: ${payrunId}`, pageWidth - margin - 60, 35)

    // Employee Information
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("Employee Details", margin, 60)

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    const employeeDetails = [
      ["Employee Name:", employee.employeeName],
      ["Employee Code:", employee.employeeCode],
      ["Department:", employee.departmentName],
      ["Company:", employee.companyName],
    ]

    let yPos = 70
    employeeDetails.forEach(([label, value]) => {
      pdf.text(label, margin, yPos)
      pdf.text(value || "N/A", margin + 50, yPos)
      yPos += 8
    })

    // Pay Period Information
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.text("Pay Period", pageWidth - margin - 60, 60)

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    const payDetails = [
      ["Pay Period:", payPeriod],
      ["Pay Date:", payDate],
      ["Present Days:", employee.presentDays?.toString() || "0"],
      ["Past Days:", employee.pastDays?.toString() || "0"],
    ]

    yPos = 70
    payDetails.forEach(([label, value]) => {
      pdf.text(label, pageWidth - margin - 60, yPos)
      pdf.text(value || "N/A", pageWidth - margin - 30, yPos)
      yPos += 8
    })

    // Earnings Section
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(21, 128, 61) // Green color
    pdf.text("Earnings", margin, 120)

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0) // Black color

    yPos = 130
    pdf.text("Basic Salary:", margin, yPos)
    pdf.text(
      formatCurrency(employee.basicSalary),
      pageWidth - margin - 40,
      yPos
    )
    yPos += 8

    // Add earnings from data_details
    if (employee.data_details) {
      employee.data_details.forEach((detail) => {
        if (detail.componentType === "EARNING" && detail.amount > 0) {
          pdf.text(detail.componentName + ":", margin, yPos)
          pdf.text(formatCurrency(detail.amount), pageWidth - margin - 40, yPos)
          yPos += 8
        }
      })
    }

    // Total Earnings
    pdf.setFont("helvetica", "bold")
    pdf.text("Total Earnings:", margin, yPos + 5)
    pdf.setTextColor(21, 128, 61) // Green color
    pdf.text(
      formatCurrency(employee.totalEarnings),
      pageWidth - margin - 40,
      yPos + 5
    )
    pdf.setTextColor(0, 0, 0) // Black color

    // Deductions Section
    pdf.setFontSize(16)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(185, 28, 28) // Red color
    pdf.text("Deductions", margin, yPos + 25)

    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0) // Black color

    yPos += 35

    // Add deductions from data_details
    let hasDeductions = false
    if (employee.data_details) {
      employee.data_details.forEach((detail) => {
        if (detail.componentType === "DEDUCTION" && detail.amount > 0) {
          pdf.text(detail.componentName + ":", margin, yPos)
          pdf.text(formatCurrency(detail.amount), pageWidth - margin - 40, yPos)
          yPos += 8
          hasDeductions = true
        }
      })
    }

    if (!hasDeductions) {
      pdf.setTextColor(107, 114, 128) // Gray color
      pdf.text("No deductions", margin, yPos)
      yPos += 8
      pdf.setTextColor(0, 0, 0) // Black color
    }

    // Total Deductions
    pdf.setFont("helvetica", "bold")
    pdf.text("Total Deductions:", margin, yPos + 5)
    pdf.setTextColor(185, 28, 28) // Red color
    pdf.text(
      formatCurrency(employee.totalDeductions),
      pageWidth - margin - 40,
      yPos + 5
    )
    pdf.setTextColor(0, 0, 0) // Black color

    // Net Pay Section
    pdf.setFontSize(20)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(30, 64, 175) // Blue color
    pdf.text("Net Pay", margin, yPos + 30)
    pdf.text(
      formatCurrency(employee.netSalary),
      pageWidth - margin - 40,
      yPos + 30
    )

    // Footer
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(107, 114, 128) // Gray color
    pdf.text(
      "This is a computer generated payslip and does not require a signature.",
      margin,
      pageHeight - 20
    )
    pdf.text(
      "For any queries, please contact your HR department.",
      margin,
      pageHeight - 15
    )

    // Convert to blob
    const pdfBlob = pdf.output("blob")
    return pdfBlob
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Function to send PDF to WhatsApp
export const sendPayslipToWhatsApp = async (
  pdfBlob: Blob,
  employeeName: string,
  phoneNumber: string = "+91 9421185860"
): Promise<boolean> => {
  try {
    // Create WhatsApp share URL
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, "")}?text=Hi! Here's the payslip for ${employeeName}.`

    // Open WhatsApp in a new window/tab
    window.open(whatsappUrl, "_blank")

    // Note: Due to browser security restrictions, we cannot automatically attach files to WhatsApp Web
    // The user will need to manually attach the PDF file
    // We can provide instructions or download the file for manual sharing

    return true
  } catch (error) {
    console.error("Error sending to WhatsApp:", error)
    return false
  }
}

// Function to download PDF
export const downloadPayslipPDF = (
  pdfBlob: Blob,
  employeeName: string
): void => {
  const fileName = `Payslip_${employeeName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`
  const url = URL.createObjectURL(pdfBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Main function to handle payslip generation and sending
export const handleSendPayslip = async (
  employee: IPayrollEmployeeHd,
  payrunId: string,
  payPeriod: string,
  payDate: string,
  companyName: string,
  phoneNumber?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Generate PDF
    const pdfBlob = await generatePayslipPDF(
      employee,
      payrunId,
      payPeriod,
      payDate,
      companyName
    )

    // Send to WhatsApp
    const whatsappSuccess = await sendPayslipToWhatsApp(
      pdfBlob,
      employee.employeeName,
      phoneNumber
    )

    // Also download the file as backup
    downloadPayslipPDF(pdfBlob, employee.employeeName)

    if (whatsappSuccess) {
      return {
        success: true,
        message: `Payslip for ${employee.employeeName} has been prepared for WhatsApp sharing. Please attach the PDF file manually.`,
      }
    } else {
      return {
        success: true,
        message: `Payslip for ${employee.employeeName} has been downloaded. You can manually send it via WhatsApp.`,
      }
    }
  } catch (error) {
    console.error("Error in handleSendPayslip:", error)
    return {
      success: false,
      message: "Failed to generate or send payslip",
    }
  }
}
