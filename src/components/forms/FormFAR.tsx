import React from 'react';
import SimpleActivityForm from './SimpleActivityForm';

interface FormFARProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormFAR: React.FC<FormFARProps> = (props) => {
  return (
    <SimpleActivityForm
      {...props}
      icon="⚠️"
      subtitle="Fiche d'Analyse de Risque"
      nombreLabel="Nombre de FAR"
    />
  );
};

export default FormFAR;
