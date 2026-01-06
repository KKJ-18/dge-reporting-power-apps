import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormSuiviRegularisationProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormSuiviRegularisation: React.FC<FormSuiviRegularisationProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="regularisation"
      icon="🔄"
      subtitle="Saisie des dossiers à régulariser aux CC4 et CCCA"
      hasTypeComite={true}
    />
  );
};

export default FormSuiviRegularisation;
