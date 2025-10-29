import React from 'react';
import { exportToCSV, exportToExcel, exportToWord, formatFormDataForExport } from '../utils/exportUtils';

interface ExportButtonsProps {
  formData: Record<string, any>;
  formName: string;
  disabled?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ formData, formName, disabled = false }) => {
  const handleExportCSV = () => {
    const formatted = formatFormDataForExport(formData, formName);
    exportToCSV(formatted.csv.data, formatted.csv.filename);
  };

  const handleExportExcel = () => {
    const formatted = formatFormDataForExport(formData, formName);
    exportToExcel(formatted.excel.data, formatted.excel.filename);
  };

  const handleExportWord = () => {
    const formatted = formatFormDataForExport(formData, formName);
    exportToWord(formatted.word.title, formatted.word.sections, formatted.word.filename);
  };

  return (
    <div className="export-buttons" style={{ 
      display: 'flex', 
      gap: '0.75rem',
      alignItems: 'center'
    }}>
      <span style={{ 
        fontSize: '0.875rem', 
        color: 'var(--dge-gray-700)',
        fontWeight: 500
      }}>
        Exporter:
      </span>
      
      <button
        type="button"
        onClick={handleExportWord}
        disabled={disabled}
        className="btn-export btn-export-word"
        title="Exporter en Word"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Word
      </button>

      <button
        type="button"
        onClick={handleExportExcel}
        disabled={disabled}
        className="btn-export btn-export-excel"
        title="Exporter en Excel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <rect x="8" y="12" width="8" height="6" />
          <line x1="12" y1="12" x2="12" y2="18" />
        </svg>
        Excel
      </button>

      <button
        type="button"
        onClick={handleExportCSV}
        disabled={disabled}
        className="btn-export btn-export-csv"
        title="Exporter en CSV"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="18" x2="15" y2="18" />
        </svg>
        CSV
      </button>
    </div>
  );
};
