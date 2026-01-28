// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ตั้งค่าฟอนต์ภาษาไทย
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.contentWidth = this.pageWidth - (this.margin * 2);
    this.currentY = this.margin;
  }

  // เพิ่มฟอนต์ภาษาไทย (ต้องมีไฟล์ฟอนต์)
  addThaiFont() {
    // ในกรณีที่มีไฟล์ฟอนต์ภาษาไทย
    // this.doc.addFont('fonts/sarabun-regular.ttf', 'Sarabun', 'normal');
    // this.doc.addFont('fonts/sarabun-bold.ttf', 'Sarabun', 'bold');
    // this.doc.setFont('Sarabun');
  }

  // เพิ่มหัวเรื่อง
  addHeader(title, subtitle = '') {
    // Logo และชื่อมหาวิทยาลัย
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย', this.pageWidth / 2, 30, { align: 'center' });

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Rajamangala University of Technology Srivijaya', this.pageWidth / 2, 38, { align: 'center' });

    // เส้นคั่น
    this.doc.setDrawColor(59, 130, 246);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 45, this.pageWidth - this.margin, 45);

    // หัวเรื่องรายงาน
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.pageWidth / 2, 60, { align: 'center' });

    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.pageWidth / 2, 68, { align: 'center' });
    }

    this.currentY = 80;
  }

  // เพิ่มข้อมูลทั่วไป
  addInfoSection(data) {
    const infoData = [
      ['ผู้จัดทำ:', String(data.author || '-')],
      ['หน่วยงาน:', String(data.department || '-')],
      ['วันที่จัดทำ:', data.date ? new Date(data.date).toLocaleDateString('th-TH') : '-'],
      ['สถานะ:', this.getStatusText(String(data.status || 'unknown'))],
      ['จำนวนตัวบ่งชี้:', String(data.indicators || '0')],
      ['จำนวนการประเมิน:', String(data.evaluations || '0')]
    ];

    if (data.score > 0) {
      infoData.push(['คะแนนเฉลี่ย:', `${data.score}/5.0`]);
    }

    this.doc.setFontSize(12);
    let y = this.currentY;
    infoData.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(String(label), this.margin, y);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(String(value), this.margin + 40, y);
      y += 8;
    });

    this.currentY = y + 10;
  }

  // เพิ่มตารางข้อมูล
  addTable(headers, data, title = '') {
    if (title) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.margin, this.currentY);
      this.currentY += 10;
    }

    this.doc.autoTable({
      head: [headers],
      body: data,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  // เพิ่มกราฟ
  addChart(title, data, type = 'bar') {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 10;

    // สร้างกราฟง่ายๆ ด้วย rectangle
    const chartWidth = this.contentWidth;
    const chartHeight = 60;
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length * 0.7;
    const spacing = chartWidth / data.length * 0.3;

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = this.margin + (index * (barWidth + spacing));
      const y = this.currentY + chartHeight - barHeight;

      // วาดแท่ง
      this.doc.setFillColor(59, 130, 246);
      this.doc.rect(x, y, barWidth, barHeight, 'F');

      // เพิ่ม label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.label, x + barWidth / 2, this.currentY + chartHeight + 5, { align: 'center' });
      this.doc.text(item.value.toString(), x + barWidth / 2, y - 2, { align: 'center' });
    });

    this.currentY += chartHeight + 20;
  }

  // เพิ่มสรุปผลการประเมิน
  addSummarySection(indicators) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('สรุปผลการประเมิน', this.margin, this.currentY);
    this.currentY += 10;

    const tableData = indicators.map((indicator, index) => [
      index + 1,
      String(indicator.name || '-'),
      String(indicator.type || '-'),
      String(indicator.score || '-'),
      String(indicator.status || '-'),
      String(indicator.comment || '-')
    ]);

    this.addTable(
      ['ลำดับ', 'ตัวบ่งชี้', 'ประเภท', 'คะแนน', 'สถานะ', 'หมายเหตุ'],
      tableData
    );
  }

  // เพิ่มท้ายกระดาษ
  addFooter() {
    const footerY = this.pageHeight - 30;

    // เส้นคั่น
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY);

    // ข้อความท้ายกระดาษ
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `พิมพ์เมื่อ ${new Date().toLocaleString('th-TH')}`,
      this.margin,
      footerY + 10
    );
    this.doc.text(
      'ระบบประกันคุณภาพ AUN-QA - มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย',
      this.pageWidth / 2,
      footerY + 10,
      { align: 'center' }
    );
    this.doc.text(
      `หน้า ${this.doc.internal.getNumberOfPages()}`,
      this.pageWidth - this.margin,
      footerY + 10,
      { align: 'right' }
    );
  }

  // แปลงสถานะเป็นข้อความ
  getStatusText(status) {
    const statusMap = {
      completed: 'สมบูรณ์',
      in_progress: 'ดำเนินการ',
      draft: 'ฉบับร่าง'
    };
    return statusMap[status] || status;
  }

  // เพิ่มหน้าใหม่
  addNewPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  // บันทึกไฟล์ PDF
  save(filename) {
    this.addFooter();
    this.doc.save(filename);
  }

  // สร้าง Blob สำหรับดาวน์โหลด
  getBlob() {
    this.addFooter();
    return this.doc.output('blob');
  }

  // สร้างรายงานการประเมินแบบสมบูรณ์
  generateAssessmentReport(reportData, indicators = []) {
    this.addHeader(reportData.title, 'รายงานการประเมินคุณภาพ AUN-QA');
    this.addInfoSection(reportData);

    if (indicators.length > 0) {
      this.addSummarySection(indicators);
    }

    // เพิ่มกราฟสรุปถ้ามีข้อมูล
    if (indicators.length > 0) {
      const scoreData = indicators
        .filter(i => i.score)
        .map(i => ({
          label: i.name.substring(0, 10) + '...',
          value: parseFloat(i.score)
        }));

      if (scoreData.length > 0) {
        this.addChart('กราฟคะแนนการประเมิน', scoreData);
      }
    }

    return this;
  }

  // สร้างรายงานสรุปแบบกราฟ
  generateSummaryReport(summaryData) {
    this.addHeader('รายงานสรุปการประเมิน', 'ภาพรวมผลการประเมินคุณภาพ');

    // เพิ่มข้อมูลสรุป
    const summaryInfo = [
      ['จำนวนรายงานทั้งหมด:', summaryData.totalReports || '0'],
      ['รายงานที่สมบูรณ์:', summaryData.completedReports || '0'],
      ['รายงานที่ดำเนินการ:', summaryData.inProgressReports || '0'],
      ['คะแนนเฉลี่ยทั้งหมด:', summaryData.averageScore || '0.00'],
      ['ตัวบ่งชี้ทั้งหมด:', summaryData.totalIndicators || '0'],
      ['การประเมินทั้งหมด:', summaryData.totalEvaluations || '0']
    ];

    this.doc.setFontSize(12);
    let y = this.currentY;
    summaryInfo.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, y);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, this.margin + 60, y);
      y += 8;
    });

    this.currentY = y + 10;

    // เพิ่มกราฟวงกลม
    if (summaryData.statusData) {
      this.addPieChart('สัดส่วนสถานะรายงาน', summaryData.statusData);
    }

    return this;
  }

  // เพิ่มกราฟวงกลม (Pie Chart)
  addPieChart(title, data) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;

    const centerX = this.pageWidth / 2;
    const centerY = this.currentY + 30;
    const radius = 25;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 360;
      const endAngle = currentAngle + sliceAngle;

      // วาดแต่ละชิ้นของวงกลม
      this.doc.setFillColor(...this.getColorByIndex(index));
      this.doc.circle(centerX, centerY, radius, 'F');

      // เพิ่ม legend
      const legendY = this.currentY + 70 + (index * 8);
      this.doc.setFillColor(...this.getColorByIndex(index));
      this.doc.rect(this.margin, legendY, 5, 5, 'F');
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${item.label}: ${item.value}`, this.margin + 10, legendY + 4);

      currentAngle = endAngle;
    });

    this.currentY += 100;
  }

  // สีสำหรับกราฟ
  getColorByIndex(index) {
    const colors = [
      [59, 130, 246],   // blue
      [16, 185, 129],   // green
      [96, 165, 250],   // light blue (replaced orange)
      [239, 68, 68],    // red
      [139, 92, 246],   // purple
      [236, 72, 153]    // pink
    ];
    return colors[index % colors.length];
  }
}

// ฟังก์ชันสำหรับใช้งานง่ายๆ
export const generateAssessmentPDF = (reportData, indicators = [], filename = 'assessment-report.pdf') => {
  const pdf = new PDFGenerator();
  pdf.generateAssessmentReport(reportData, indicators);
  pdf.save(filename);
};

export const generateSummaryPDF = (summaryData, filename = 'summary-report.pdf') => {
  const pdf = new PDFGenerator();
  pdf.generateSummaryReport(summaryData);
  pdf.save(filename);
};

export const downloadPDF = async (reportData, indicators = []) => {
  const pdf = new PDFGenerator();
  pdf.generateAssessmentReport(reportData, indicators);
  return pdf.getBlob();
};
