import { Patient, DialysisRecord } from './types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function computeAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatBirthDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function exportToCSV(patient: Patient, records: DialysisRecord[]): void {
  const headers = [
    'Date',
    'Pre-Weight (kg)',
    'Pre-BP (mmHg)',
    'UV (L)',
    'Post-BP (mmHg)',
    'Post-Weight (kg)',
    'Dry Weight (kg)',
    'Notes',
  ];

  const rows = records.map((r) => [
    r.date,
    r.pre_weight,
    r.pre_bp,
    r.uv,
    r.post_bp,
    r.post_weight,
    patient.dry_weight,
    r.notes ?? '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `${patient.full_name.replace(/\s+/g, '_')}_dialysis_records.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(patient: Patient, records: DialysisRecord[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text('Clinical Records: Dialysis Unit', 14, 16);

  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 23);

  // Patient info box
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 28, 269, 28, 2, 2, 'FD');

  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(patient.full_name, 20, 37);

  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Age: ${computeAge(patient.birth_date)} years`, 20, 44);
  doc.text(`Date of Birth: ${formatBirthDate(patient.birth_date)}`, 20, 50);
  doc.text(`Dry Weight: ${patient.dry_weight} kg`, 100, 44);
  doc.text(`Schedule: ${patient.schedule.join(', ')}`, 100, 50);

  // Table
  const tableHeaders = [
    'Date',
    'Pre-Weight (kg)',
    'Pre-BP',
    'UV (L)',
    'Post-BP',
    'Post-Weight (kg)',
    'Dry Weight (kg)',
    'Notes',
  ];

  const tableRows = records.map((r) => [
    formatDate(r.date),
    r.pre_weight.toString(),
    r.pre_bp,
    r.uv.toString(),
    r.post_bp,
    r.post_weight.toString(),
    patient.dry_weight.toString(),
    r.notes ?? '',
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 62,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [17, 24, 39],
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}  |  Dialysis Unit — Confidential Patient Record`,
      14,
      doc.internal.pageSize.height - 8
    );
  }

  doc.save(`${patient.full_name.replace(/\s+/g, '_')}_dialysis_report.pdf`);
}
