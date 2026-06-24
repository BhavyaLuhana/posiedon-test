import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export const generateClientPDF = (client) => {
  const doc = new jsPDF('p', 'mm', 'a4')

  // Add logo/header
  doc.setFillColor(4, 39, 19) // Primary dark color
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 217, 0) // Primary light color
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Poseidon Wealth Planners', 105, 18, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Client Profile Report', 105, 40, { align: 'center' })

  // No photo field exists in the current schema — this block is inert
  // unless/until a photo field is added to the Client model.
  if (client.photo) {
    try {
      const imgData = client.photo
      doc.addImage(imgData, 'JPEG', 160, 45, 30, 30)
    } catch (e) {
      console.log('Could not add photo to PDF')
    }
  }

  // Client Details Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(4, 39, 19)
  doc.text('Client Information', 20, 60)

  doc.setDrawColor(255, 217, 0)
  doc.setLineWidth(0.5)
  doc.line(20, 63, 190, 63)

  // Personal Details Table
  const personalData = [
    ['Full Name', client.name || 'N/A'],
    ['Age', client.age || 'N/A'],
    ['PAN Card Number', client.panCardNumber || 'N/A'],
    ['Aadhar Number', client.aadharNumber || 'N/A'],
    ['Education Level', client.educationLevel || 'N/A'],
    ['Professional Qualification', client.professionalQualification || 'N/A'],
    ['Client Type', client.clientType || 'Retail']
  ]

  const table1 = autoTable(doc, {
    startY: 70,
    head: [['Field', 'Value']],
    body: personalData,
    theme: 'striped',
    headStyles: {
      fillColor: [4, 39, 19],
      textColor: [255, 217, 0],
      fontSize: 10,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 100 }
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  })

  // Financial Details Section
  // v5: autoTable() returns the table object directly — use its .finalY
  // instead of the removed doc.lastAutoTable.
  let yPosition = table1.finalY + 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(4, 39, 19)
  doc.text('Financial Details', 20, yPosition)

  yPosition += 3
  doc.setDrawColor(255, 217, 0)
  doc.line(20, yPosition, 190, yPosition)

  // incomeTypes is an array (e.g. ['Salary', 'Business']) — join it for display
  const incomeTypesDisplay = Array.isArray(client.incomeTypes)
    ? client.incomeTypes.join(', ')
    : (client.incomeTypes || 'N/A')

  const financialData = [
    ['Debt/Loan Amount', client.debtLoanAmount ?? 'N/A'],
    ['Amount for Investments', client.investmentAmount ?? 'N/A'],
    ['Income Type/s', incomeTypesDisplay || 'N/A'],
    ['Annual Income', client.annualIncome ?? 'N/A'],
    ['Total Net Worth', client.totalNetWorth ?? 'N/A']
  ]

  const table2 = autoTable(doc, {
    startY: yPosition + 5,
    head: [['Field', 'Value']],
    body: financialData,
    theme: 'striped',
    headStyles: {
      fillColor: [4, 39, 19],
      textColor: [255, 217, 0],
      fontSize: 10,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 100 }
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  })

  // Asset Details Section
  yPosition = table2.finalY + 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(4, 39, 19)
  doc.text('Asset Details', 20, yPosition)

  yPosition += 3
  doc.setDrawColor(255, 217, 0)
  doc.line(20, yPosition, 190, yPosition)

  // Assets live under a nested "assets" object in the real data shape
  const assets = client.assets || {}

  const assetData = [
    ['1. Real Estate', assets.realEstate ?? 'N/A'],
    ['2. Equity', assets.equity ?? 'N/A'],
    ['3. Alternatives', assets.alternatives ?? 'N/A'],
    ['4. Fixed Income and Cash', assets.fixedIncomeAndCash ?? 'N/A']
  ]

  autoTable(doc, {
    startY: yPosition + 5,
    head: [['Asset Type', 'Amount']],
    body: assetData,
    theme: 'striped',
    headStyles: {
      fillColor: [4, 39, 19],
      textColor: [255, 217, 0],
      fontSize: 10,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 100 }
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )

    doc.setDrawColor(255, 217, 0)
    doc.setLineWidth(0.5)
    doc.line(20, doc.internal.pageSize.height - 15, 190, doc.internal.pageSize.height - 15)
  }

  doc.save(`client_${(client.name || 'unknown').replace(/\s+/g, '_')}_report.pdf`)
}

// Generate PDF for all clients (summary report)
export const generateAllClientsPDF = (clients) => {
  const doc = new jsPDF('p', 'mm', 'a4')

  // Header
  doc.setFillColor(4, 39, 19)
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 217, 0)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Poseidon Wealth Planners', 105, 18, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('All Clients Summary Report', 105, 40, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(128, 128, 128)
  doc.text(`Total Clients: ${clients.length}`, 20, 50)
  doc.text(
    `Retail: ${clients.filter(c => (c.clientType || '').toLowerCase() === 'retail').length}`,
    20, 56
  )
  doc.text(
    `Corporate: ${clients.filter(c => (c.clientType || '').toLowerCase() === 'corporate').length}`,
    20, 62
  )

  // Create table data
  const tableData = clients.map(client => [
    client.name || 'N/A',
    client.panCardNumber || 'N/A',
    client.clientType || 'Retail',
    client.investmentAmount ?? 'N/A',
    client.annualIncome ?? 'N/A'
  ])

  autoTable(doc, {
    startY: 70,
    head: [['Name', 'PAN', 'Type', 'Investment', 'Annual Income']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [4, 39, 19],
      textColor: [255, 217, 0],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 }
    }
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  doc.save('all_clients_summary_report.pdf')
}