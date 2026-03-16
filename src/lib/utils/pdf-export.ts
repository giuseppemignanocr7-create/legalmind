import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const GOLD = '#D4AF37'
const DARK = '#0A0A0F'
const TEXT = '#333333'
const MUTED = '#666666'

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(DARK)
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F')
  doc.setTextColor(GOLD)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LegalMind', 15, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Ecosystem UltraDivine', 15, 26)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text(title, doc.internal.pageSize.width - 15, 20, { align: 'right' })
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(MUTED)
    doc.text(`Pagina ${i} di ${pages}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' })
    doc.text(`Generato da LegalMind — ${new Date().toLocaleDateString('it-IT')}`, 15, doc.internal.pageSize.height - 10)
  }
}

export function exportFatturaPDF(fattura: {
  numero: string
  data: string
  cliente: string
  indirizzo?: string
  cf?: string
  piva?: string
  voci: { descrizione: string; quantita: number; prezzo: number; totale: number }[]
  imponibile: number
  iva: number
  cassaPrevidenza?: number
  ritenuta?: number
  totale: number
  iban?: string
  note?: string
}) {
  const doc = new jsPDF()
  addHeader(doc, `Fattura ${fattura.numero}`)

  let y = 45

  // Studio info
  doc.setFontSize(10)
  doc.setTextColor(TEXT)
  doc.setFont('helvetica', 'bold')
  doc.text('Studio Legale LegalMind', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Via Roma 1, 00100 Roma (RM)', 15, y + 5)
  doc.text('P.IVA: 01234567890 — CF: 01234567890', 15, y + 10)
  doc.text('PEC: studio@pec.legalmind.it', 15, y + 15)

  // Fattura info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Fattura n. ${fattura.numero}`, doc.internal.pageSize.width - 15, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Data: ${new Date(fattura.data).toLocaleDateString('it-IT')}`, doc.internal.pageSize.width - 15, y + 5, { align: 'right' })

  y += 25

  // Cliente
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(15, y, doc.internal.pageSize.width - 30, 25, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setTextColor(MUTED)
  doc.text('DESTINATARIO', 20, y + 6)
  doc.setTextColor(TEXT)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(fattura.cliente, 20, y + 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (fattura.indirizzo) doc.text(fattura.indirizzo, 20, y + 20)
  const rightInfo = [fattura.cf ? `CF: ${fattura.cf}` : '', fattura.piva ? `P.IVA: ${fattura.piva}` : ''].filter(Boolean)
  rightInfo.forEach((info, i) => doc.text(info, doc.internal.pageSize.width - 20, y + 14 + i * 5, { align: 'right' }))

  y += 35

  // Voci
  autoTable(doc, {
    startY: y,
    head: [['Descrizione', 'Qta', 'Prezzo Unit.', 'Totale']],
    body: fattura.voci.map(v => [v.descrizione, v.quantita.toString(), `€ ${v.prezzo.toFixed(2)}`, `€ ${v.totale.toFixed(2)}`]),
    theme: 'grid',
    headStyles: { fillColor: [10, 10, 15], textColor: [212, 175, 55], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [51, 51, 51] },
    columnStyles: { 0: { cellWidth: 'auto' }, 1: { halign: 'center', cellWidth: 20 }, 2: { halign: 'right', cellWidth: 30 }, 3: { halign: 'right', cellWidth: 30 } },
    margin: { left: 15, right: 15 },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // Totali
  const totali = [
    ['Imponibile', `€ ${fattura.imponibile.toFixed(2)}`],
    ...(fattura.cassaPrevidenza ? [['Cassa Previdenza 4%', `€ ${fattura.cassaPrevidenza.toFixed(2)}`]] : []),
    ['IVA 22%', `€ ${fattura.iva.toFixed(2)}`],
    ...(fattura.ritenuta ? [['Ritenuta d\'acconto 20%', `- € ${fattura.ritenuta.toFixed(2)}`]] : []),
  ]

  const totaliX = doc.internal.pageSize.width - 75
  totali.forEach((row, i) => {
    doc.setFontSize(8)
    doc.setTextColor(MUTED)
    doc.text(row[0], totaliX, y + i * 7)
    doc.setTextColor(TEXT)
    doc.text(row[1], doc.internal.pageSize.width - 15, y + i * 7, { align: 'right' })
  })

  y += totali.length * 7 + 3
  doc.setDrawColor(GOLD)
  doc.setLineWidth(0.5)
  doc.line(totaliX, y, doc.internal.pageSize.width - 15, y)
  y += 5
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(DARK)
  doc.text('TOTALE', totaliX, y)
  doc.setTextColor(GOLD)
  doc.text(`€ ${fattura.totale.toFixed(2)}`, doc.internal.pageSize.width - 15, y, { align: 'right' })

  y += 15

  // Pagamento
  if (fattura.iban) {
    doc.setFontSize(8)
    doc.setTextColor(MUTED)
    doc.text('MODALITÀ DI PAGAMENTO', 15, y)
    doc.setTextColor(TEXT)
    doc.text(`Bonifico bancario — IBAN: ${fattura.iban}`, 15, y + 6)
    y += 15
  }

  if (fattura.note) {
    doc.setFontSize(8)
    doc.setTextColor(MUTED)
    doc.text('NOTE', 15, y)
    doc.setTextColor(TEXT)
    doc.text(fattura.note, 15, y + 6)
  }

  addFooter(doc)
  doc.save(`Fattura_${fattura.numero.replace(/\//g, '-')}.pdf`)
}

export function exportReportPDF(title: string, data: { headers: string[]; rows: string[][] }, stats?: { label: string; value: string }[]) {
  const doc = new jsPDF()
  addHeader(doc, title)

  let y = 45

  if (stats) {
    const statWidth = (doc.internal.pageSize.width - 30) / stats.length
    stats.forEach((stat, i) => {
      const x = 15 + i * statWidth
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(x, y, statWidth - 5, 20, 2, 2, 'F')
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(DARK)
      doc.text(stat.value, x + (statWidth - 5) / 2, y + 10, { align: 'center' })
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(MUTED)
      doc.text(stat.label, x + (statWidth - 5) / 2, y + 16, { align: 'center' })
    })
    y += 30
  }

  autoTable(doc, {
    startY: y,
    head: [data.headers],
    body: data.rows,
    theme: 'striped',
    headStyles: { fillColor: [10, 10, 15], textColor: [212, 175, 55], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [51, 51, 51] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 15, right: 15 },
  })

  addFooter(doc)
  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}
