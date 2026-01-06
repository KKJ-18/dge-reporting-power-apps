import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormContratsDSEProps {
  activityName: string;
  contratType: 'avance-facture' | 'prefinancement' | 'cautions' | 'pv-comite';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;
}

const FormContratsDSE: React.FC<FormContratsDSEProps> = (props) => {
  const getIcon = () => {
    switch (props.contratType) {
      case 'avance-facture': return '📄';
      case 'prefinancement': return '💰';
      case 'cautions': return '🛡️';
      case 'pv-comite': return '🚀';
      default: return '📋';
    }
  };

  return (
    <DetailsActivityForm
      {...props}
      activityType="contrats_dse"
      icon={getIcon()}
      subtitle="Contrats - Détails des dossiers"
    />
  );
};

export default FormContratsDSE;
