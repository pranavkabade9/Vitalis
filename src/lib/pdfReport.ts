import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VitalLog, LifestyleLog, Medication } from './store';

export const generateHealthReport = (
  userName: string,
  vitals: VitalLog,
  lifestyle: LifestyleLog,
  medications: Medication[],
  healthScore: number
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // brand-500
  doc.text('Vitalis Health Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Patient: ${userName}`, 20, 30);
  doc.text(`Date Generated: ${dateStr}`, 20, 35);
  doc.text(`Overall Health Index: ${healthScore}%`, 140, 35);

  // Vitals Table
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Vital Signs', 20, 50);
  
  autoTable(doc, {
    startY: 55,
    head: [['Metric', 'Value', 'Unit', 'Status']],
    body: [
      ['Heart Rate', vitals.heart_rate.toString(), 'bpm', vitals.heart_rate > 100 ? 'High' : 'Normal'],
      ['Blood Pressure', `${vitals.blood_pressure_sys}/${vitals.blood_pressure_dia}`, 'mmHg', vitals.blood_pressure_sys > 130 ? 'Elevated' : 'Normal'],
      ['Weight', vitals.weight.toString(), 'kg', 'Stable'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Lifestyle Table
  const finalY = (doc as any).lastAutoTable.finalY || 70;
  doc.text('2. Lifestyle & Habits', 20, finalY + 15);
  
  autoTable(doc, {
    startY: finalY + 20,
    head: [['Metric', 'Value', 'Status']],
    body: [
      ['Sleep', `${lifestyle.sleep_hours} hrs`, lifestyle.sleep_hours < 7 ? 'Insufficient' : 'Optimal'],
      ['Water', `${lifestyle.water_ml} ml`, lifestyle.water_ml < 2000 ? 'Increased intake recommended' : 'Good'],
      ['Daily Steps', lifestyle.steps.toLocaleString(), lifestyle.steps >= 10000 ? 'Goal Reached' : 'Active'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // emerald-500
  });

  // Medications Table
  const finalY2 = (doc as any).lastAutoTable.finalY || finalY + 50;
  doc.text('3. Medication Compliance', 20, finalY2 + 15);
  
  autoTable(doc, {
    startY: finalY2 + 20,
    head: [['Medication', 'Dosage', 'Frequency', 'Status (Today)']],
    body: medications.map(m => [
      m.name,
      m.dosage,
      m.frequency,
      m.takenToday ? 'Taken' : 'Pending'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [244, 63, 94] }, // rose-500
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Vitalis - Your Personal Health Companion', 20, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
  }

  doc.save(`Vitalis_Report_${userName.replace(/\s+/g, '_')}_${dateStr}.pdf`);
};
