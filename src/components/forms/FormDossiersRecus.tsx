import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersRecusProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersRecus: React.FC<FormDossiersRecusProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="recus"
      icon="📥"
      subtitle="Saisie du nombre et détails des dossiers reçus"
    />
  );
};

export default FormDossiersRecus;
