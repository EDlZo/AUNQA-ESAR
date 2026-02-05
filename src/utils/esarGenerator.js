import jsPDFSource from 'jspdf';
import autoTable from 'jspdf-autotable';

// Prioritize global jsPDF if available (it has the fonts registered from index.html)
const jsPDF = (typeof window !== 'undefined' && (window.jsPDF || (window.jspdf && (window.jspdf.jsPDF || window.jspdf)))) || jsPDFSource;
if (typeof window !== 'undefined') console.log('Using jsPDF instance:', jsPDF === jsPDFSource ? 'npm package' : 'global/script tag');

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
        this.metadata = options.metadata || {};

        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.margin = 20;
        this.contentWidth = this.pageWidth - (this.margin * 2);

        // Font setting - prioritize THSarabun then Sarabun-Regular
        let availableFonts = {};
        try {
            availableFonts = this.doc.getFontList();
            console.log('Available fonts in PDF instance:', availableFonts);
        } catch (e) {
            console.error('Could not get font list', e);
        }

        this.fontFamily = 'THSarabun';
        if (!availableFonts[this.fontFamily]) {
            if (availableFonts['Sarabun-Regular']) {
                this.fontFamily = 'Sarabun-Regular';
            } else if (availableFonts['Sarabun']) {
                this.fontFamily = 'Sarabun';
            } else {
                console.warn('Thai fonts not found in this instance! Fallback to helvetica.');
                this.fontFamily = 'helvetica';
            }
        }

        console.log('Final selected font family:', this.fontFamily);
        this.doc.setFont(this.fontFamily, 'normal');
    }

    // --- Helpers ---

    setFontSafe(style = 'normal') {
        // Force 'normal' because we only have the normal Thai font file registered.
        // Using 'bold' on THSarabun without a bold file will cause squares/gibberish.
        try {
            this.doc.setFont(this.fontFamily, 'normal');
        } catch (e) {
            console.error('Font error:', e);
        }
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
            .replace(/&copy;/g, '©')
            .replace(/&reg;/g, '®')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p[^>]*>/gi, '\n')
            .replace(/<\/p>/gi, '')
            .replace(/<li[^>]*>/gi, '\n• ')
            .replace(/<\/li>/gi, '');
    }

    // Optimized Helper to parse HTML into sequential blocks recursively
    parseHtmlToBlocks(html) {
        if (!html || typeof window === 'undefined') return [{ type: 'text', content: this.stripHtml(html) }];

        const parser = new DOMParser();
        const doc = parser.parseFromString(html || '', 'text/html');
        const blocks = [];

        const walk = (node) => {
            if (node.nodeType === 3) { // Text node
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
                        // Recursively parse cell content
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

        // Merge consecutive text blocks smartly
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

        // Clean up text blocks
        merged.forEach(b => {
            if (b.type === 'text') b.content = b.content.replace(/^\s+|\s+$/g, (m) => m.includes('\n') ? '\n' : '');
        });

        const finalBlocks = merged.filter(b => b.type !== 'text' || b.content.trim() || b.content === '\n');
        return finalBlocks.length > 0 ? finalBlocks : [{ type: 'text', content: '-' }];
    }

    // Removed old parseHtmlContent

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

    addTitle(text, size = 16, style = 'bold') {
        const cleanText = this.stripHtml(text);
        this.doc.setFontSize(size);
        this.setFontSafe(style);
        const splitText = this.doc.splitTextToSize(cleanText, this.contentWidth);
        this.doc.text(splitText, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += (splitText.length * (size * 0.4)) + 5;
    }

    addText(text, size = 12, style = 'normal', align = 'left') {
        const cleanText = this.stripHtml(text);
        this.doc.setFontSize(size);
        this.setFontSafe(style);
        const splitText = this.doc.splitTextToSize(cleanText, this.contentWidth);

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
    }

    addFootersToAllPages() {
        const totalPages = this.doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);
            this.drawSingleFooter(i, totalPages);
        }
    }

    drawSingleFooter(pageNumber, totalPages) {
        const footerY = this.pageHeight - 10;
        this.doc.setFontSize(9);
        this.doc.setFont(this.fontFamily, 'normal');
        this.doc.setTextColor(100, 100, 100);

        this.doc.text(
            `หน้า ${pageNumber} / ${totalPages}`,
            this.pageWidth - this.margin,
            footerY,
            { align: 'right' }
        );
        this.doc.text(
            `รายงาน ESAR - ${this.program.majorName || ''} (${this.year})`,
            this.margin,
            footerY
        );
    }

    // Shared methods for rendering complex blocks
    estimateBlocksHeight(blocks, colWidth) {
        let h = 2; // Minimal top padding
        const padding = 6;
        const width = Math.max(10, colWidth - padding);

        blocks.forEach(block => {
            if (block.type === 'text') {
                const lines = this.doc.splitTextToSize(block.content, width);
                h += (lines.length * 5);
            } else if (block.type === 'table') {
                let tableH = 2; // Table vertical margin
                block.content.forEach(row => {
                    let maxRowH = 0;
                    const approxColW = width / (row.length || 1);
                    row.forEach(cell => {
                        const cellH = this.estimateBlocksHeight(cell.blocks || [], approxColW);
                        if (cellH > maxRowH) maxRowH = cellH;
                    });
                    tableH += Math.max(7, maxRowH); // Minimum row height
                });
                h += tableH + 4;
            } else if (block.type === 'image') {
                h += Math.min(60, width * 0.6) + 6;
            }
        });
        return h + 2; // Bottom padding
    }

    drawBlocks(blocks, cellX, cellY, cellWidth) {
        let currentY = cellY + 2;
        const padding = 6;
        const drawWidth = Math.max(10, cellWidth - padding);

        blocks.forEach(block => {
            if (block.type === 'text') {
                this.doc.setFontSize(10);
                this.doc.setFont(this.fontFamily, 'normal');
                const split = this.doc.splitTextToSize(block.content, drawWidth);
                this.doc.text(split, cellX + 3, currentY + 3);
                currentY += (split.length * 5);
            } else if (block.type === 'table') {
                autoTable(this.doc, {
                    body: block.content,
                    startY: currentY + 1,
                    margin: { left: cellX + 2.5 },
                    tableWidth: drawWidth - 1,
                    theme: 'grid',
                    styles: {
                        font: this.fontFamily,
                        fontSize: 8,
                        cellPadding: 1,
                        minCellHeight: 7,
                        lineWidth: 0.1,  // Thinner lines for nested tables
                        overflow: 'linebreak'
                    },
                    didParseCell: (hookData) => this.tableComplexCellHook(hookData, drawWidth),
                    didDrawCell: (hookData) => this.tableComplexDrawHook(hookData, drawWidth)
                });
                currentY = this.doc.lastAutoTable.finalY + 2;
            } else if (block.type === 'image') {
                try {
                    if (block.content && block.content.length > 0) {
                        let format = 'PNG';
                        if (block.content.startsWith('data:image')) {
                            const typeMatch = block.content.match(/data:image\/([a-zA-Z]+);base64/);
                            format = typeMatch ? typeMatch[1].toUpperCase() : 'PNG';
                        }
                        const imgHeight = Math.min(60, drawWidth * 0.6);
                        this.doc.addImage(block.content, format, cellX + 3, currentY + 1, drawWidth, imgHeight);
                        currentY += imgHeight + 3;
                    }
                } catch (e) { console.error('Image Render Error:', e); }
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

    // --- Main Generator ---

    async generate() {
        this.currentY = 60;

        // 1. Cover Page
        this.renderCoverPage();

        // 2. Organization Profile (Introduction)
        this.addPage();
        this.renderIntroduction();

        // 3. Summary Table of All Criteria
        this.addPage();
        this.renderOverallSummary();

        // 4. SWOT Analysis
        this.addPage();
        this.renderSWOT();

        // 5. Detailed Sections for each Criterion (AUN 1-15 or actual components)
        this.components.forEach(component => {
            if (component) {
                this.addPage();
                this.renderComponentSection(component);
            }
        });

        return this.doc;
    }

    renderIntroduction() {
        this.addTitle('บทที่ 1: โครงร่างองค์กร (Organization Profile)', 16);
        this.currentY += 10;

        if (this.metadata.history) {
            this.addTitle('ประวัติความเป็นมา (History)', 14, 'bold');
            this.addText(this.metadata.history);
            this.currentY += 10;
        }

        if (this.metadata.vision) {
            this.addTitle('วิสัยทัศน์ (Vision)', 14, 'bold');
            this.addText(this.metadata.vision);
            this.currentY += 10;
        }

        if (this.metadata.mission) {
            this.addTitle('พันธกิจ (Mission)', 14, 'bold');
            this.addText(this.metadata.mission);
            this.currentY += 10;
        }

        if (this.metadata.structure) {
            this.addTitle('โครงสร้างการบริหาร (Organization Structure)', 14, 'bold');
            this.addText(this.metadata.structure);
            this.currentY += 10;
        }
    }

    renderSWOT() {
        this.addTitle('บทที่ 3: สรุปจุดแข็งและข้อควรพัฒนา', 16);
        this.currentY += 10;

        const sections = [
            { title: 'จุดแข็ง (Strengths)', content: this.metadata.swot?.s },
            { title: 'จุดควรพัฒนา (Areas for Improvement)', content: this.metadata.swot?.w }
        ];

        sections.forEach(section => {
            if (section.content) {
                if (this.currentY + 60 > this.pageHeight - this.margin) this.addPage();
                this.addTitle(section.title, 14, 'bold');
                this.addText(section.content);
                this.currentY += 10;
            }
        });
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

        this.components.forEach((component, idx) => {
            const compIndicators = this.indicators.filter(ind =>
                String(ind.quality_id) === String(component.id) ||
                String(ind.component_id) === String(component.id) ||
                String(ind.component_id) === String(component.component_id)
            );

            let compAvg = 0;
            let compCount = 0;

            compIndicators.forEach(ind => {
                const evalData = this.evaluations.find(e =>
                    String(e.indicator_id) === String(ind.id) ||
                    String(e.indicator_id) === String(ind.indicator_id) ||
                    String(e.indicator_id) === String(ind.sequence)
                );

                if (evalData && (evalData.operation_score || evalData.score)) {
                    compAvg += parseFloat(evalData.operation_score || evalData.score);
                    compCount++;
                }
            });

            const score = compCount > 0 ? (compAvg / compCount).toFixed(2) : '-';
            tableData.push([idx + 1, component.quality_name, score]);

            if (compCount > 0) {
                avgTotal += parseFloat(score);
                countTotal++;
            }
        });

        autoTable(this.doc, {
            head: [['ลำดับ', 'หัวข้อเกณฑ์ AUN-QA', 'คะแนนประเมิน']],
            body: tableData,
            startY: this.currentY,
            theme: 'grid',
            styles: { font: this.fontFamily, fontSize: 11, cellPadding: 2, fontStyle: 'normal' },
            headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: 'center', fontStyle: 'normal' },
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
        this.addTitle(`องค์ประกอบที่ ${component.quality_code || ''} ${component.quality_name}`, 16);
        this.currentY += 5;

        const compIndicators = this.indicators.filter(ind =>
            String(ind.quality_id) === String(component.id) ||
            String(ind.component_id) === String(component.id) ||
            String(ind.component_id) === String(component.component_id)
        );

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
            const evalData = this.evaluations.find(e =>
                String(e.indicator_id) === String(ind.id) ||
                String(e.indicator_id) === String(ind.indicator_id) ||
                String(e.indicator_id) === String(ind.sequence)
            );

            const resultText = evalData ? (evalData.operation_result || evalData.result || '-') : '-';
            const score = evalData ? (evalData.operation_score || evalData.score || '-') : '-';

            return [
                ind.sequence || '-',
                ind.indicator_name || '-',
                { content: '', blocks: this.parseHtmlToBlocks(resultText) },
                score
            ];
        });

        autoTable(this.doc, {
            head: [['ลำดับ', 'ตัวบ่งชี้', 'ผลการดำเนินงาน', 'คะแนน']],
            body: body,
            startY: this.currentY,
            theme: 'grid',
            styles: { font: this.fontFamily, fontSize: 10, cellPadding: 3, overflow: 'linebreak', fontStyle: 'normal' },
            headStyles: { fillColor: [71, 85, 105], textColor: 255, halign: 'center', fontStyle: 'normal' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 40 },
                2: { cellWidth: 100 },
                3: { halign: 'center', cellWidth: 15 }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    this.tableComplexCellHook(data, 100);
                }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 2) {
                    this.tableComplexDrawHook(data, data.cell.width);
                }
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
            this.doc.setFontSize(12);
            this.doc.setFont(this.fontFamily, 'normal');
            this.doc.text('รายการหลักฐานอ้างอิง:', this.margin, this.currentY);
            this.currentY += 5;

            autoTable(this.doc, {
                head: [['ตัวบ่งชี้', 'ชื่อเอกสารหลักฐาน']],
                body: evidenceList,
                startY: this.currentY,
                theme: 'striped',
                styles: { font: this.fontFamily, fontSize: 9, fontStyle: 'normal' },
                headStyles: { fillColor: [148, 163, 184], textColor: 255, fontStyle: 'normal' }
            });
            this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
    }

    save(filename = 'ESAR-Report.pdf') {
        this.addFootersToAllPages();
        this.doc.save(filename);
    }

    getBlob() {
        this.addFootersToAllPages();
        return this.doc.output('blob');
    }
}
