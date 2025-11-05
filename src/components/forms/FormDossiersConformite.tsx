import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersConformiteProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersConformite: React.FC<FormDossiersConformiteProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="conformite"
      icon="✅"
      subtitle="Dossiers en attente d'avis de la conformité"
      hasTypeComite={true}
    />
  );
};

export default FormDossiersConformite;
