import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersAttenteComiteProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersAttenteComite: React.FC<FormDossiersAttenteComiteProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="attente_comite"
      icon="⏳"
      subtitle="Dossiers en attente de présentation au comité de crédit"
      hasTypeComite={true}
    />
  );
};

export default FormDossiersAttenteComite;
