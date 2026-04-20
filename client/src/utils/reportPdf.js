import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const green = [48, 214, 88]
const lightGreen = [239, 253, 243]
const lightGray = [248, 248, 248]
const darkText = [18, 18, 18]
const mutedText = [86, 86, 86]

const scoreText = (value) => `${Number(value || 0).toFixed(1).replace(/\.0$/, '')}/10`

const getAdvice = (finalScore) => {
  const score = Number(finalScore || 0)

  if (score >= 8) {
    return 'Excellent performance. Keep practicing advanced scenarios and maintain the same clarity, confidence, and structured delivery.'
  }

  if (score >= 5) {
    return 'Good progress. Improve answer structure, add stronger examples, and practice explaining your reasoning with confidence.'
  }

  return 'Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.'
}

export const downloadInterviewReportPDF = (report) => {
  if (!report) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 19
  const contentWidth = pageWidth - margin * 2
  const finalScore = Number(report.finalScore || 0)
  const questions = report.questionWiseScore || []

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...green)
  doc.text('AI Interview Performance Report', pageWidth / 2, 24, { align: 'center' })

  doc.setDrawColor(190, 225, 198)
  doc.setLineWidth(0.4)
  doc.line(margin, 31, pageWidth - margin, 31)

  doc.setFillColor(...lightGreen)
  doc.roundedRect(margin, 45, contentWidth, 21, 2, 2, 'F')
  doc.setFontSize(12)
  doc.setTextColor(...darkText)
  doc.text(`Final Score: ${scoreText(finalScore)}`, pageWidth / 2, 58, { align: 'center' })

  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, 78, contentWidth, 29, 2, 2, 'F')
  doc.setFontSize(11)
  doc.text(`Confidence: ${scoreText(report.confidence)}`, margin + 10, 88)
  doc.text(`Communication: ${scoreText(report.communication)}`, margin + 10, 96)
  doc.text(`Correctness: ${scoreText(report.correctness)}`, margin + 10, 104)

  doc.setDrawColor(225, 225, 225)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(margin, 122, contentWidth, 35, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...darkText)
  doc.text('Professional Advice', margin + 9, 133)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...mutedText)
  const adviceLines = doc.splitTextToSize(getAdvice(finalScore), contentWidth - 18)
  doc.text(adviceLines, margin + 9, 144)

  autoTable(doc, {
    startY: 174,
    margin: { left: margin, right: margin },
    head: [['#', 'Question', 'Score', 'Feedback']],
    body: questions.map((item, index) => [
      index + 1,
      item.question || 'N/A',
      scoreText(item.score),
      item.feedback || 'No feedback available.',
    ]),
    theme: 'plain',
    tableWidth: contentWidth,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
      textColor: darkText,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: green,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fillColor: [252, 252, 252],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: 13, halign: 'center' },
      1: { cellWidth: 61 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: contentWidth - 99 },
    },
  })

  doc.save('Interview_Performance_Report.pdf')
}
