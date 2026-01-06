import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormSuiviTransmissionProps {
  activityName: string;
  requiresComite: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const FormSuiviTransmission: React.FC<FormSuiviTransmissionProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="transmission"
      icon="📤"
      subtitle="Saisie du nombre et détails des dossiers transmis"
      hasTypeComite={props.requiresComite}
    />
  );
};

export default FormSuiviTransmission;
