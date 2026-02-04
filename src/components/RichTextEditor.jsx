// Lightweight rich text editor using contenteditable and document.execCommand
// Provides Word-like basic formatting without external dependencies
import React, { useEffect, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List as BulletList,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  Eraser,
  Quote,
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder, ariaLabel, minHeight = 120, readOnly = false }) {
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);
  const fileInputRef = useRef(null);
  const [fontName, setFontName] = useState('Sarabun');
  const [fontSize, setFontSize] = useState('3'); // 1-7 scale for execCommand
  const [foreColor, setForeColor] = useState('#111827');
  const [hiliteColor, setHiliteColor] = useState('#ffffff');

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Keep DOM in sync only when external value truly differs from current HTML
    if (typeof value === 'string' && value !== el.innerHTML) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange && onChange(html);
  };

  const apply = (cmd, valueArg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, valueArg);
    handleInput();
  };

  const applyBlockFormat = (tag) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    handleInput();
  };

  const promptLink = () => {
    const url = window.prompt('ใส่ลิงก์ (URL):', 'https://');
    if (url) apply('createLink', url);
  };

  const clearFormat = () => {
    apply('removeFormat');
    apply('unlink');
  };

  const insertImageFromDevice = () => {
    fileInputRef.current?.click();
  };

  const onPickImage = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      editorRef.current?.focus();
      document.execCommand('insertImage', false, dataUrl);
      handleInput();
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const insertTable = () => {
    const rows = Math.min(10, Math.max(1, Number(window.prompt('จำนวนแถว:', '2')) || 2));
    const cols = Math.min(10, Math.max(1, Number(window.prompt('จำนวนคอลัมน์:', '2')) || 2));
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.margin = '8px 0';
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        td.style.border = '1px solid #D1D5DB';
        td.style.padding = '6px';
        td.innerHTML = '&nbsp;';
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, table.outerHTML);
    handleInput();
  };

  return (
    <div className="border border-blue-300 rounded-md overflow-hidden">
      {!readOnly && (
        <div ref={toolbarRef} className="flex flex-wrap gap-1 items-center sticky top-0 z-10 border-b px-2 py-1" style={{ backgroundColor: '#e7f1ff' }}>
          <select className="border rounded px-2 py-1 text-sm" value={fontName} onChange={(e) => { setFontName(e.target.value); apply('fontName', e.target.value); }}>
            <option value="Sarabun">Sarabun</option>
            <option value="TH Sarabun New">TH Sarabun New</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Arial">Arial</option>
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={fontSize} onChange={(e) => { setFontSize(e.target.value); apply('fontSize', e.target.value); }}>
            <option value="2">เล็ก</option>
            <option value="3">ปกติ</option>
            <option value="4">ใหญ่</option>
            <option value="5">ใหญ่ขึ้น</option>
            <option value="6">ใหญ่มาก</option>
          </select>
          <select className="border rounded px-2 py-1 text-sm" defaultValue="P" onChange={(e) => applyBlockFormat(e.target.value)}>
            <option value="P">Paragraph</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
          </select>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <IconBtn title="ตัวหนา" onClick={() => apply('bold')}><Bold size={16} /></IconBtn>
          <IconBtn title="ตัวเอียง" onClick={() => apply('italic')}><Italic size={16} /></IconBtn>
          <IconBtn title="ขีดเส้นใต้" onClick={() => apply('underline')}><Underline size={16} /></IconBtn>
          <IconBtn title="ขีดฆ่า" onClick={() => apply('strikeThrough')}><Strikethrough size={16} /></IconBtn>
          <input title="สีตัวอักษร" type="color" className="w-7 h-7 p-0 border rounded" value={foreColor} onChange={(e) => { setForeColor(e.target.value); apply('foreColor', e.target.value); }} />
          <input title="ไฮไลต์" type="color" className="w-7 h-7 p-0 border rounded" value={hiliteColor} onChange={(e) => { setHiliteColor(e.target.value); apply('hiliteColor', e.target.value); }} />
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <IconBtn title="รายการจุด" onClick={() => apply('insertUnorderedList')}><BulletList size={16} /></IconBtn>
          <IconBtn title="รายการเลข" onClick={() => apply('insertOrderedList')}><ListOrdered size={16} /></IconBtn>
          <IconBtn title="ย่อ" onClick={() => apply('outdent')}><IndentDecrease size={16} /></IconBtn>
          <IconBtn title="เยื้อง" onClick={() => apply('indent')}><IndentIncrease size={16} /></IconBtn>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <IconBtn title="ชิดซ้าย" onClick={() => apply('justifyLeft')}><AlignLeft size={16} /></IconBtn>
          <IconBtn title="กึ่งกลาง" onClick={() => apply('justifyCenter')}><AlignCenter size={16} /></IconBtn>
          <IconBtn title="ชิดขวา" onClick={() => apply('justifyRight')}><AlignRight size={16} /></IconBtn>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <IconBtn title="ใส่ลิงก์" onClick={promptLink}><LinkIcon size={16} /></IconBtn>
          <IconBtn title="เอาลิงก์ออก" onClick={() => apply('unlink')}><Unlink size={16} /></IconBtn>
          <IconBtn title="รูปภาพจากเครื่อง" onClick={insertImageFromDevice}><ImageIcon size={16} /></IconBtn>
          <IconBtn title="ตาราง" onClick={insertTable}><TableIcon size={16} /></IconBtn>
          <IconBtn title="อ้างอิง" onClick={() => applyBlockFormat('BLOCKQUOTE')}><Quote size={16} /></IconBtn>
          <span className="mx-1 w-px h-5 bg-gray-300" />
          <IconBtn title="ย้อนกลับ" onClick={() => apply('undo')}><Undo2 size={16} /></IconBtn>
          <IconBtn title="ทำซ้ำ" onClick={() => apply('redo')}><Redo2 size={16} /></IconBtn>
          <IconBtn title="ล้างฟอร์แมต" onClick={clearFormat}><Eraser size={16} /></IconBtn>
        </div>
      )}
      <div
        ref={editorRef}
        role="textbox"
        aria-label={ariaLabel}
        contentEditable={!readOnly}
        onInput={handleInput}
        className={`px-3 py-2 outline-none ${readOnly ? 'bg-gray-50 text-gray-700 cursor-default' : ''}`}
        style={{ minHeight }}
        data-placeholder={placeholder}
        onBlur={handleInput}
        suppressContentEditableWarning
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF; /* gray-400 */
        }
        table { font-size: inherit; }
        table td, table th { vertical-align: top; }
      `}</style>
    </div>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="p-1.5 hover:bg-blue-100 rounded text-gray-700"
    >
      {children}
    </button>
  );
}


