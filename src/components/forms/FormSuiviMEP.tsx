import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormSuiviMEPProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormSuiviMEP: React.FC<FormSuiviMEPProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="suivi_mep"
      icon="📋"
      subtitle="Suivi de mise en place - Détails des dossiers"
    />
  );
};

export default FormSuiviMEP;
