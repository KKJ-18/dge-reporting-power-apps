import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormSituationMEPProps {
  activityName: string;
  mepType: 'amortissables' | 'restructuration' | 'caution' | 'credoc' | 'leasing' | 'ligne-decouvert' | 'lignes-autres' | 'finance-islamique';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;
}

const FormSituationMEP: React.FC<FormSituationMEPProps> = (props) => {
  const getIcon = () => {
    switch (props.mepType) {
      case 'amortissables': return '💰';
      case 'restructuration': return '🔄';
      case 'caution': return '🛡️';
      case 'credoc': return '📋';
      case 'leasing': return '🚗';
      case 'ligne-decouvert': return '📊';
      case 'lignes-autres': return '📈';
      case 'finance-islamique': return '🕌';
      default: return '✅';
    }
  };

  return (
    <DetailsActivityForm
      {...props}
      activityType="situation_mep_dse"
      icon={getIcon()}
      subtitle="Situation de mise en place - Détails des dossiers"
    />
  );
};

export default FormSituationMEP;
