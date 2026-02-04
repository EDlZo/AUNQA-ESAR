// src/utils/esarGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * ESAR Report Generator
 * Generates a comprehensive ESAR report for AUN-QA
 */
export class ESARGenerator {
    constructor(options = {}) {
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        this.program = options.program || {};
        this.year = options.year || '';
        this.evaluations = options.evaluations || [];
        this.indicators = options.indicators || [];
        this.components = options.components || [];

        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
        this.contentWidth = this.pageWidth - (this.margin * 2);

        // Font setting - assume Sarabun is loaded via index.html
        this.fontFamily = 'THSarabun-normal';
        this.doc.setFont(this.fontFamily, 'normal');
    }

    // --- Helpers ---

    addTitle(text, size = 16, style = 'bold') {
        this.doc.setFontSize(size);
        this.doc.setFont(this.fontFamily, style);
        const splitText = this.doc.splitTextToSize(text, this.contentWidth);
        this.doc.text(splitText, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += (splitText.length * (size * 0.4)) + 5;
    }

    addText(text, size = 12, style = 'normal', align = 'left') {
        this.doc.setFontSize(size);
        this.doc.setFont(this.fontFamily, style);
        const splitText = this.doc.splitTextToSize(text, this.contentWidth);

        if (this.currentY + (splitText.length * 5) > this.pageHeight - this.margin) {
            this.addPage();
        }

        if (align === 'center') {
            this.doc.text(splitText, this.pageWidth / 2, this.currentY, { align: 'center' });
        } else {
            this.doc.text(splitText, this.margin, this.currentY);
        }
        this.currentY += (splitText.length * 5) + 2;
    }

    addPage() {
        this.doc.addPage();
        this.currentY = this.margin;
        this.addFooter();
    }

    addFooter() {
        const pageNumber = this.doc.internal.getNumberOfPages();
        this.doc.setFontSize(10);
        this.doc.setFont(this.fontFamily, 'normal');
        this.doc.text(
            `หน้า ${pageNumber}`,
            this.pageWidth - this.margin,
            this.pageHeight - 10,
            { align: 'right' }
        );
        this.doc.text(
            `รายงาน ESAR - ${this.program.majorName || ''} (${this.year})`,
            this.margin,
            this.pageHeight - 10
        );
    }

    // --- Main Generator ---

    async generate() {
        this.currentY = 60;

        // 1. Cover Page
        this.renderCoverPage();

        // 2. Summary Table of All Criteria
        this.addPage();
        this.renderOverallSummary();

        // 3. Detailed Sections for each Criterion (1-15)
        for (let i = 1; i <= 15; i++) {
            const component = this.components.find(c =>
                c.quality_code === `AUN.${i}` ||
                c.quality_name?.includes(`AUN.${i}`) ||
                (c.quality_code === `AUN-${i}`)
            );

            if (component) {
                this.addPage();
                this.renderComponentSection(component);
            }
        }

        return this.doc;
    }

    renderCoverPage() {
        // Logo (placeholder for now or use global if available)
        this.currentY = 40;
        this.addTitle('รายงานการประเมินตนเอง (Self-Assessment Report: SAR)', 22);
        this.addTitle('ตามเกณฑ์ AUN-QA (ASEAN University Network-Quality Assurance)', 16);
        this.currentY += 20;

        this.addTitle('ระดับหลักสูตร', 18);
        this.addTitle(this.program.degreeName || this.program.majorName || '', 20);
        this.currentY += 20;

        this.addTitle(`ปีการศึกษา ${this.year}`, 16);
        this.currentY += 40;

        this.addTitle('คณะ/หน่วยงาน', 14, 'normal');
        this.addTitle(this.program.facultyName || '-', 16, 'bold');
        this.currentY += 10;
        this.addTitle('มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย', 16, 'bold');
    }

    renderOverallSummary() {
        this.addTitle('สรุปคะแนนประเมินตนเองตามเกณฑ์ AUN-QA', 16);
        this.currentY += 5;

        const tableData = [];
        let avgTotal = 0;
        let countTotal = 0;

        for (let i = 1; i <= 15; i++) {
            const code = `AUN.${i}`;
            const component = this.components.find(c => c.quality_code === code);
            if (!component) continue;

            const compIndicators = this.indicators.filter(ind => String(ind.quality_id) === String(component.id));
            let compAvg = 0;
            let compCount = 0;

            compIndicators.forEach(ind => {
                const evalData = this.evaluations.find(e => String(e.indicator_id) === String(ind.id));
                if (evalData && evalData.operation_score) {
                    compAvg += parseFloat(evalData.operation_score);
                    compCount++;
                }
            });

            const score = compCount > 0 ? (compAvg / compCount).toFixed(2) : '-';
            tableData.push([i, component.quality_name, score]);

            if (compCount > 0) {
                avgTotal += parseFloat(score);
                countTotal++;
            }
        }

        this.doc.autoTable({
            head: [['ลำดับ', 'หัวข้อเกณฑ์ AUN-QA', 'คะแนนประเมิน']],
            body: tableData,
            startY: this.currentY,
            theme: 'grid',
            styles: { font: this.fontFamily, fontSize: 11, cellPadding: 2 },
            headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                2: { halign: 'center', cellWidth: 30 }
            }
        });

        this.currentY = this.doc.lastAutoTable.finalY + 10;

        if (countTotal > 0) {
            this.addText(`คะแนนเฉลี่ยรวมทุกเกณฑ์: ${(avgTotal / countTotal).toFixed(2)}`, 14, 'bold', 'right');
        }
    }

    renderComponentSection(component) {
        this.addTitle(`หมวดที่ ${component.quality_code || ''} ${component.quality_name}`, 16);
        this.currentY += 5;

        const compIndicators = this.indicators.filter(ind => String(ind.quality_id) === String(component.id));

        if (compIndicators.length === 0) {
            this.addText('ไม่พบข้อมูลตัวบ่งชี้ในหมวดนี้', 12, 'italic');
            return;
        }

        compIndicators.sort((a, b) => {
            const seqA = String(a.sequence || '').split('.').map(Number);
            const seqB = String(b.sequence || '').split('.').map(Number);
            for (let i = 0; i < Math.max(seqA.length, seqB.length); i++) {
                if ((seqA[i] || 0) < (seqB[i] || 0)) return -1;
                if ((seqA[i] || 0) > (seqB[i] || 0)) return 1;
            }
            return 0;
        });

        const body = compIndicators.map(ind => {
            const evalData = this.evaluations.find(e => String(e.indicator_id) === String(ind.id));

            // Clean up HTML from rich text if any
            const stripHtml = (html) => {
                const tmp = document.createElement("DIV");
                tmp.innerHTML = html;
                return tmp.textContent || tmp.innerText || "";
            };

            return [
                ind.sequence || '-',
                ind.indicator_name || '-',
                evalData ? stripHtml(evalData.operation_result || '-') : '-',
                evalData ? (evalData.operation_score || '-') : '-'
            ];
        });

        this.doc.autoTable({
            head: [['ลำดับ', 'ตัวบ่งชี้', 'ผลการดำเนินงาน', 'คะแนน']],
            body: body,
            startY: this.currentY,
            theme: 'grid',
            styles: { font: this.fontFamily, fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
            headStyles: { fillColor: [71, 85, 105], textColor: 255, halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 40 },
                3: { halign: 'center', cellWidth: 15 }
            }
        });

        this.currentY = this.doc.lastAutoTable.finalY + 15;

        // Additional Detail: Evidence
        const evidenceList = [];
        compIndicators.forEach(ind => {
            const evalData = this.evaluations.find(e => String(e.indicator_id) === String(ind.id));
            if (evalData && evalData.evidence_meta_json) {
                try {
                    const meta = JSON.parse(evalData.evidence_meta_json);
                    Object.values(meta).forEach(m => {
                        evidenceList.push([ind.sequence, m.name || m.url || '-']);
                    });
                } catch (e) { }
            }
        });

        if (evidenceList.length > 0) {
            if (this.currentY + 20 > this.pageHeight - this.margin) this.addPage();
            this.addText('รายการหลักฐานอ้างอิง:', 12, 'bold');
            this.doc.autoTable({
                head: [['ตัวบ่งชี้', 'ชื่อเอกสารหลักฐาน']],
                body: evidenceList,
                startY: this.currentY,
                theme: 'striped',
                styles: { font: this.fontFamily, fontSize: 9 },
                headStyles: { fillColor: [148, 163, 184], textColor: 255 }
            });
            this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
    }

    save(filename = 'ESAR-Report.pdf') {
        this.addFooter();
        this.doc.save(filename);
    }

    getBlob() {
        this.addFooter();
        return this.doc.output('blob');
    }
}
