import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormAccordsDSEProps {
  activityName: string;
  accordType: 'autorisation-mobilisation' | 'accords-classement' | 'accords-liste';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;
}

const FormAccordsDSE: React.FC<FormAccordsDSEProps> = (props) => {
  const getIcon = () => {
    switch (props.accordType) {
      case 'autorisation-mobilisation': return '📝';
      case 'accords-classement': return '📊';
      case 'accords-liste': return '📋';
      default: return '📄';
    }
  };

  return (
    <DetailsActivityForm
      {...props}
      activityType="accords_dse"
      icon={getIcon()}
      subtitle="Accords de classement - Détails des dossiers"
    />
  );
};

export default FormAccordsDSE;
