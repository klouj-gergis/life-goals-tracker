import { jsPDF } from 'jspdf'
import { CONTENT_STATUS } from './helpers.js'

export async function exportContentPlanPDF(plan) {
  const doc = new jsPDF({ unit:'mm', format:'a4' })
  const W = 210, M = 20, maxW = W - M * 2
  let y = M

  const checkY = (n = 10) => { if (y + n > 278) { doc.addPage(); y = M } }

  const writeLine = (str, size = 11, bold = false, color = [240, 238, 255]) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(String(str || '—'), maxW)
    lines.forEach(l => { checkY(size * 0.42); doc.text(l, M, y); y += size * 0.42 })
  }

  const rule = () => { checkY(6); doc.setDrawColor(60,58,80); doc.setLineWidth(0.25); doc.line(M, y, W-M, y); y += 5 }
  const gap = (n = 5) => { y += n }

  const section = (label) => {
    checkY(14); gap(4)
    doc.setFillColor(240, 180, 41)
    doc.rect(M, y - 4, 3, 9, 'F')
    writeLine(label, 13, true, [240,180,41])
    rule(); gap(1)
  }

  const sub = (label) => writeLine(label, 10, true, [120,115,140])
  const body = (str) => { writeLine(str || '—', 10, false, [200,198,220]); gap(4) }

  // Cover
  doc.setFillColor(10, 10, 15)
  doc.rect(0, 0, W, 297, 'F')
  doc.setFillColor(240, 180, 41)
  doc.rect(0, 0, W, 2.5, 'F')
  doc.rect(0, 294, W, 3, 'F')

  doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(90,85,117); doc.setLetterSpacing(2)
  doc.text('CONTENT PLAN', W/2, 92, {align:'center'})
  doc.setLetterSpacing(0)

  doc.setFontSize(24); doc.setFont('helvetica','bold'); doc.setTextColor(240,180,41)
  const titleLines = doc.splitTextToSize(plan.title || 'Untitled', W - 60)
  let ty = 108; titleLines.forEach(l => { doc.text(l, W/2, ty, {align:'center'}); ty += 10 })

  doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.setTextColor(90,85,117)
  doc.text(`${plan.platform || ''}  ·  ${CONTENT_STATUS[plan.status] || plan.status}`, W/2, ty + 8, {align:'center'})
  doc.text(new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}), W/2, 270, {align:'center'})

  // Page 2
  doc.addPage(); y = M

  section('CONCEPT')
  sub('Core Idea'); body(plan.idea)
  sub('Hook'); body(plan.hook)
  sub('Target Audience'); body(plan.audience)

  section('SCRIPT')
  ;[
    ['coldOpen','COLD OPEN / HOOK'],
    ['act1','ACT 1 — SETUP'],
    ['act2','ACT 2 — MAIN CONTENT'],
    ['act3','ACT 3 — CONCLUSION & CTA'],
  ].forEach(([k,l]) => { sub(l); body(plan.script?.[k]) })

  section('PRODUCTION')
  sub('Shot List & Sketching'); body(plan.sketching)
  sub('Thumbnail Concept'); body(plan.thumbnail)
  sub('Production Notes'); body(plan.production)

  section('SEO & DISTRIBUTION')
  sub('Title Variations'); body(plan.titleVariations)
  sub('Description'); body(plan.description)
  sub('Keywords & Tags'); body(plan.seo)

  if (plan.notes?.trim()) { section('NOTES'); body(plan.notes) }

  doc.setFillColor(240,180,41); doc.rect(0,294,W,3,'F')

  doc.save(`${(plan.title||'content-plan').replace(/[^a-zA-Z0-9]/g,'-').toLowerCase()}.pdf`)
}
