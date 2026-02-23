/**
 * Utility functions for exporting data to various file formats
 */

// === Typed Export API (inspiré ReportingCommercialeV2) ===

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface TypedExportOptions {
  title?: string;
  filename?: string;
  fileName?: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  subtitle?: string;
  showDate?: boolean;
}

/**
 * Export structuré vers CSV (UTF-8 BOM + séparateur ;) — compatible Excel FR
 */
export function exportTypedExcel(options: TypedExportOptions): void {
  const { title, filename, fileName, sheetName, columns, data, subtitle, showDate = true } = options;
  const exportTitle = title || sheetName || 'Export';
  const exportFilename = filename || fileName || 'export';
  let csv = '\uFEFF'; // BOM
  csv += `"${exportTitle}"\n`;
  if (subtitle) csv += `"${subtitle}"\n`;
  if (showDate) {
    csv += `"Exporté le: ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}"\n`;
  }
  csv += '\n';
  csv += columns.map(c => `"${c.header}"`).join(';') + '\n';
  data.forEach(row => {
    csv += columns.map(c => {
      const v = row[c.key];
      const s = v !== null && v !== undefined ? String(v) : '';
      return `"${s.replace(/"/g, '""')}"`;
    }).join(';') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${exportFilename}.csv`);
}

/**
 * Export structuré vers PDF via fenêtre print (branding DGE)
 */
export function exportTypedPDF(options: TypedExportOptions): void {
  const { title, columns, data, subtitle, showDate = true } = options;
  const printWindow = window.open('', '_blank');
  if (!printWindow) { alert('Veuillez autoriser les popups pour exporter en PDF'); return; }
  const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const rows = data.map(r => `<tr>${columns.map(c => { const v = r[c.key]; return `<td>${v != null ? String(v) : ''}</td>`; }).join('')}</tr>`).join('');
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;padding:20px;color:#333}
.header{text-align:center;margin-bottom:30px;border-bottom:3px solid #CC0000;padding-bottom:20px}
.logo{font-size:24px;font-weight:bold;color:#CC0000;margin-bottom:10px}.title{font-size:20px;font-weight:bold;color:#1f2937;margin-bottom:5px}
.subtitle{font-size:14px;color:#6b7280;margin-bottom:5px}.date{font-size:12px;color:#9ca3af}
table{width:100%;border-collapse:collapse;margin-top:20px;font-size:11px}
th{background-color:#CC0000;color:white;padding:10px 8px;text-align:left;font-weight:600;border:1px solid #CC0000}
td{padding:8px;border:1px solid #e5e7eb}tr:nth-child(even){background-color:#f9fafb}tr:hover{background-color:#fef2f2}
.footer{margin-top:30px;text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:15px}
.stats{margin-top:20px;display:flex;justify-content:flex-end;gap:20px;font-size:12px;color:#6b7280}
@media print{body{padding:0}table{page-break-inside:auto}tr{page-break-inside:avoid}}</style></head>
<body><div class="header"><div class="logo">DGE REPORTING</div><div class="title">${title}</div>
${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}${showDate ? `<div class="date">Exporté le: ${date}</div>` : ''}</div>
<table><thead><tr>${columns.map(c => `<th>${c.header}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
<div class="stats"><span>Total: ${data.length} enregistrement${data.length > 1 ? 's' : ''}</span></div>
<div class="footer">DGE Reporting — Document généré automatiquement</div></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

// === Legacy Export API (conservée pour compatibilité) ===

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        const escaped = String(value ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Export data to Excel format (using HTML table method)
 */
export function exportToExcel(data: any[], filename: string = 'export.xlsx') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // Create HTML table
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="utf-8"/></head><body>';
  html += `<table border="1">`;
  
  // Headers
  html += '<tr>';
  headers.forEach(header => {
    html += `<th style="background-color: #CC0000; color: white; font-weight: bold; padding: 8px;">${header}</th>`;
  });
  html += '</tr>';
  
  // Data rows
  data.forEach(row => {
    html += '<tr>';
    headers.forEach(header => {
      html += `<td style="padding: 5px;">${row[header] ?? ''}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</table></body></html>';

  // Create blob with Excel MIME type
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, filename.endsWith('.xls') ? filename : filename.replace('.xlsx', '.xls'));
}

/**
 * Export form data to Word document (simple HTML to DOC conversion)
 */
export function exportToWord(
  title: string, 
  sections: Array<{ heading: string; content: string | Array<{label: string, value: any}> }>,
  filename: string = 'export.doc'
) {
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">';
  html += '<head><meta charset="utf-8"/>';
  html += '<style>';
  html += 'body { font-family: Arial, sans-serif; font-size: 11pt; }';
  html += 'h1 { color: #CC0000; font-size: 18pt; margin-bottom: 10pt; }';
  html += 'h2 { color: #1A1A1A; font-size: 14pt; margin-top: 15pt; margin-bottom: 8pt; border-bottom: 2px solid #CC0000; }';
  html += 'table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; }';
  html += 'td { padding: 5pt; border: 1px solid #cccccc; }';
  html += 'td.label { font-weight: bold; width: 40%; background-color: #f5f5f5; }';
  html += 'td.value { width: 60%; }';
  html += 'p { margin: 5pt 0; }';
  html += '</style>';
  html += '</head><body>';
  
  // Title
  html += `<h1>${title}</h1>`;
  html += `<p><strong>Date d'export:</strong> ${new Date().toLocaleString('fr-FR')}</p>`;
  html += '<hr style="border: none; border-top: 2px solid #CC0000; margin: 15pt 0;" />';
  
  // Sections
  sections.forEach(section => {
    html += `<h2>${section.heading}</h2>`;
    
    if (Array.isArray(section.content)) {
      // Render as table
      html += '<table>';
      section.content.forEach(item => {
        html += '<tr>';
        html += `<td class="label">${item.label}</td>`;
        html += `<td class="value">${item.value ?? 'N/A'}</td>`;
        html += '</tr>';
      });
      html += '</table>';
    } else {
      // Render as paragraph
      html += `<p>${section.content}</p>`;
    }
  });
  
  html += '</body></html>';

  // Create blob with Word MIME type
  const blob = new Blob([html], { type: 'application/msword' });
  downloadBlob(blob, filename);
}

/**
 * Helper function to trigger file download
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Format form data for export
 */
export function formatFormDataForExport(formData: Record<string, any>, formName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    csv: {
      filename: `${formName}_${timestamp}.csv`,
      data: [formData] // CSV expects array of objects
    },
    excel: {
      filename: `${formName}_${timestamp}.xls`,
      data: [formData]
    },
    word: {
      filename: `${formName}_${timestamp}.doc`,
      title: formName.replace(/([A-Z])/g, ' $1').trim(),
      sections: Object.entries(formData).map(([key, value]) => ({
        heading: key.replace(/([A-Z])/g, ' $1').trim(),
        content: String(value ?? 'N/A')
      }))
    }
  };
}
