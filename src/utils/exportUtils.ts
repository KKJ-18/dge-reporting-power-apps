/**
 * Utility functions for exporting data to various file formats
 */

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
