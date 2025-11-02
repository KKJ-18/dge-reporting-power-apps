import React from 'react';
import './CustomDatePicker.css';

interface CustomDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'date' | 'week' | 'month';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  min?: string;
  max?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  type = 'date',
  required = false,
  disabled = false,
  error,
  min,
  max
}) => {
  return (
    <div className="custom-datepicker-wrapper">
      {label && (
        <label className="custom-datepicker-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      <div className={`custom-datepicker ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}>
        <svg className="custom-datepicker-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6 2V5M14 2V5M3 8H17M4 4H16C16.5523 4 17 4.44772 17 5V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        
        <input
          type={type}
          className="custom-datepicker-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
        />
      </div>

      {error && <div className="custom-datepicker-error">{error}</div>}
    </div>
  );
};

export default CustomDatePicker;
