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
    this.imageDimensions = new Map(); // Store { width, height, ratio }
  }

  // เพิ่มฟอนต์ภาษาไทย (ต้องมีไฟล์ฟอนต์)
  addThaiFont() {
    // ในกรณีที่มีไฟล์ฟอนต์ภาษาไทย
    // this.doc.addFont('fonts/sarabun-regular.ttf', 'Sarabun', 'normal');
    // this.doc.addFont('fonts/sarabun-bold.ttf', 'Sarabun', 'bold');
    // this.doc.setFont('Sarabun');
  }

  decodeHtmlEntities(text) {
    if (!text) return "";
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/li>/gi, '');
  }

  // Recursive block parser for tables/nested content
  parseHtmlToBlocks(html) {
    if (!html || typeof window === 'undefined') return [{ type: 'text', content: this.stripHtml(html) }];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html || '', 'text/html');
    const blocks = [];

    const walk = (node) => {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (text && text.trim()) {
          blocks.push({ type: 'text', content: this.decodeHtmlEntities(text) });
        }
      } else if (node.nodeName.toUpperCase() === 'IMG') {
        const src = node.getAttribute('src');
        if (src) blocks.push({ type: 'image', content: src });
      } else if (node.nodeName.toUpperCase() === 'TABLE') {
        const rows = [];
        Array.from(node.rows).forEach(tr => {
          const cols = [];
          Array.from(tr.cells).forEach(cell => {
            const cellBlocks = this.parseHtmlToBlocks(cell.innerHTML);
            cols.push({ content: '', blocks: cellBlocks });
          });
          if (cols.length > 0) rows.push(cols);
        });
        if (rows.length > 0) blocks.push({ type: 'table', content: rows });
      } else if (node.nodeName.toUpperCase() === 'BR') {
        blocks.push({ type: 'text', content: '\n' });
      } else {
        node.childNodes.forEach(walk);
        if (['P', 'DIV', 'H1', 'H2', 'H3', 'LI'].includes(node.nodeName.toUpperCase())) {
          blocks.push({ type: 'text', content: '\n' });
        }
      }
    };
    doc.body.childNodes.forEach(walk);

    const merged = [];
    blocks.forEach(b => {
      if (b.type === 'text') {
        if (merged.length > 0 && merged[merged.length - 1].type === 'text') {
          merged[merged.length - 1].content += b.content;
        } else {
          merged.push({ ...b });
        }
      } else {
        merged.push(b);
      }
    });

    merged.forEach(b => {
      if (b.type === 'text') b.content = b.content.replace(/^\s+|\s+$/g, (m) => m.includes('\n') ? '\n' : '');
    });

    const finalBlocks = merged.filter(b => b.type !== 'text' || b.content.trim() || b.content === '\n');
    return finalBlocks.length > 0 ? finalBlocks : [{ type: 'text', content: '-' }];
  }

  async preloadImages(indicators = []) {
    if (typeof window === 'undefined') return;
    const imageUrls = new Set();

    indicators.forEach(ind => {
      const result = ind.result || ind.operation_result || '';
      const comment = ind.comment || '';
      this.extractImageData(result).forEach(url => imageUrls.add(url));
      this.extractImageData(comment).forEach(url => imageUrls.add(url));
    });

    const promises = Array.from(imageUrls).map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.imageDimensions.set(url, {
            width: img.naturalWidth,
            height: img.naturalHeight,
            ratio: img.naturalHeight / img.naturalWidth
          });
          resolve();
        };
        img.onerror = () => resolve();
        img.src = url;
      });
    });

    await Promise.all(promises);
  }

  extractImageData(html) {
    const images = [];
    if (!html || typeof html !== 'string') return images;
    const imgRegex = /<img[^>]+src\s*=\s*(["'])(.*?)\1/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[2]);
    }
    return images;
  }

  stripHtml(html) {
    if (!html) return "";
    let text = this.decodeHtmlEntities(html);
    return text.replace(/<[^>]*>?/gm, '').trim();
  }

  estimateBlocksHeight(blocks, colWidth) {
    let h = 2; // Start padding
    const padding = 16; // Increased horizontal padding (8mm each side)
    const width = Math.max(10, colWidth - padding);

    blocks.forEach(block => {
      if (block.type === 'text') {
        const lines = this.doc.splitTextToSize(block.content, width);
        h += (lines.length * 5);
      } else if (block.type === 'table') {
        let tableH = 2;
        block.content.forEach(row => {
          let maxRowH = 0;
          const approxColWidth = width / (row.length || 1);
          row.forEach(cell => {
            const cellH = this.estimateBlocksHeight(cell.blocks || [], approxColWidth);
            if (cellH > maxRowH) maxRowH = cellH;
          });
          tableH += Math.max(7, maxRowH);
        });
        h += tableH + 15; // Increased vertical buffer for nested tables
      } else if (block.type === 'image') {
        const dim = this.imageDimensions.get(block.content);
        const ratio = dim ? dim.ratio : 0.6;
        h += Math.min(60, width * ratio) + 8; // Conservative buffer
      }
    });
    return h + 2;
  }

  drawBlocks(blocks, cellX, cellY, cellWidth) {
    let currentY = cellY + 3; // Start lower
    const padding = 16; // Match estimateBlocksHeight padding
    const drawWidth = Math.max(10, cellWidth - padding);

    blocks.forEach(block => {
      if (block.type === 'text') {
        this.doc.setFontSize(10);
        const split = this.doc.splitTextToSize(block.content, drawWidth);
        this.doc.text(split, cellX + 8, currentY + 3); // 8mm indent
        currentY += (split.length * 5);
      } else if (block.type === 'table') {
        this.doc.autoTable({
          body: block.content,
          startY: currentY + 5,
          margin: { left: cellX + 8 }, // 8mm fixed left margin
          tableWidth: cellWidth - 16, // Fixed 8mm margin on both sides (centered)
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 1,
            minCellHeight: 7,
            lineWidth: 0.1, // Thinner lines for nested tables
            overflow: 'linebreak'
          },
          didParseCell: (hookData) => this.tableComplexCellHook(hookData, cellWidth - 16),
          didDrawCell: (hookData) => this.tableComplexDrawHook(hookData, cellWidth - 16)
        });
        currentY = this.doc.lastAutoTable.finalY + 8;
      } else if (block.type === 'image') {
        try {
          if (block.content && block.content.length > 0) {
            let format = 'PNG';
            if (block.content.startsWith('data:image')) {
              const typeMatch = block.content.match(/data:image\/([a-zA-Z]+);base64/);
              format = typeMatch ? typeMatch[1].toUpperCase() : 'PNG';
            }

            const dim = this.imageDimensions.get(block.content);
            const ratio = dim ? dim.ratio : 0.6;

            let imgWidth = drawWidth;
            let imgHeight = drawWidth * ratio;

            if (imgHeight > 60) {
              imgHeight = 60;
              imgWidth = imgHeight / ratio;
            }

            const offsetX = (drawWidth - imgWidth) / 2;

            if (currentY + imgHeight > this.pageHeight - this.margin) {
              console.warn('Image exceeds page boundary in drawBlocks');
            }

            // Centered within the padded area
            this.doc.addImage(block.content, format, cellX + 8 + offsetX, currentY + 1, imgWidth, imgHeight);
            currentY += imgHeight + 4;
          }
        } catch (e) { console.error('Image Error:', e); }
      }
    });
  }

  tableComplexCellHook(data, availableWidth) {
    if (data.cell.raw && typeof data.cell.raw === 'object' && data.cell.raw.blocks) {
      const numCols = data.row.cells.length || 1;
      const currentWidth = data.cell.width || (availableWidth / numCols);
      const h = this.estimateBlocksHeight(data.cell.raw.blocks, currentWidth);
      if (data.cell.styles.minCellHeight < h) data.cell.styles.minCellHeight = h;
    }
  }

  tableComplexDrawHook(data, availableWidth) {
    if (data.cell.raw && typeof data.cell.raw === 'object' && data.cell.raw.blocks) {
      this.drawBlocks(data.cell.raw.blocks, data.cell.x, data.cell.y, data.cell.width || availableWidth);
    }
  }

  // --- UI Elements ---

  addTitle(text, size = 16, style = 'bold') {
    const cleanText = this.stripHtml(text);
    this.doc.setFontSize(size);
    this.doc.setFont('helvetica', style === 'normal' ? 'normal' : 'bold');
    const splitText = this.doc.splitTextToSize(cleanText, this.contentWidth);
    this.doc.text(splitText, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += (splitText.length * (size * 0.4)) + 5;
  }

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
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.cell.raw && data.cell.raw.blocks) {
          // Identify the column width dynamically
          const colWidth = data.column.width || (this.contentWidth / headers.length);
          this.tableComplexCellHook(data, colWidth);
        }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.cell.raw && data.cell.raw.blocks) {
          this.tableComplexDrawHook(data, data.cell.width);
        }
      },
      rowPageBreak: 'avoid'
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  addSummarySection(indicators) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('สรุปผลการประเมิน', this.margin, this.currentY);
    this.currentY += 10;

    const tableData = indicators.map((indicator, index) => {
      const result = indicator.result || indicator.operation_result || '';
      return [
        index + 1,
        String(indicator.name || indicator.indicator_name || '-'),
        String(indicator.type || '-'),
        String(indicator.score || indicator.operation_score || '-'),
        String(indicator.status || '-'),
        { content: '', blocks: this.parseHtmlToBlocks(result || indicator.comment || '-') }
      ];
    });

    this.addTable(
      ['ลำดับ', 'ตัวบ่งชี้', 'ประเภท', 'คะแนน', 'สถานะ', 'หมายเหตุ/ผลดำเนินงาน'],
      tableData
    );
  }

  // บันทึกไฟล์ PDF และเพิ่มท้ายกระดาษทุกหน้า
  save(filename) {
    this.addFootersToAllPages();
    this.doc.save(filename);
  }

  // สร้าง Blob และเพิ่มท้ายกระดาษทุกหน้า
  getBlob() {
    this.addFootersToAllPages();
    return this.doc.output('blob');
  }

  addFootersToAllPages() {
    const totalPages = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.drawSingleFooter(i, totalPages);
    }
  }

  drawSingleFooter(pageNumber, totalPages) {
    const footerY = this.pageHeight - 15;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);

    this.doc.text(
      `พิมพ์เมื่อ ${new Date().toLocaleString('th-TH')}`,
      this.margin,
      footerY
    );
    this.doc.text(
      'ระบบประกันคุณภาพ AUN-QA',
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    this.doc.text(
      `หน้า ${pageNumber} / ${totalPages}`,
      this.pageWidth - this.margin,
      footerY,
      { align: 'right' }
    );
  }

  // สร้างรายงานการประเมินแบบสมบูรณ์
  async generateAssessmentReport(reportData, indicators = []) {
    await this.preloadImages(indicators);
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
  async generateSummaryReport(summaryData) {
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
export const generateAssessmentPDF = async (reportData, indicators = [], filename = 'assessment-report.pdf') => {
  const pdf = new PDFGenerator();
  await pdf.generateAssessmentReport(reportData, indicators);
  pdf.save(filename);
};

export const generateSummaryPDF = async (summaryData, filename = 'summary-report.pdf') => {
  const pdf = new PDFGenerator();
  await pdf.generateSummaryReport(summaryData);
  pdf.save(filename);
};

export const downloadPDF = async (reportData, indicators = []) => {
  const pdf = new PDFGenerator();
  await pdf.generateAssessmentReport(reportData, indicators);
  return pdf.getBlob();
};
