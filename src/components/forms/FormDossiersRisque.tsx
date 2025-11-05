import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersRisqueProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersRisque: React.FC<FormDossiersRisqueProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="risque"
      icon="⚡"
      subtitle="Dossiers en attente d'avis de la direction des risques"
    />
  );
};

export default FormDossiersRisque;
