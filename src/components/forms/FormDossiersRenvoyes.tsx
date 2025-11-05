import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersRenvoyesProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersRenvoyes: React.FC<FormDossiersRenvoyesProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="renvoye"
      icon="↩️"
      subtitle="Dossiers renvoyés par les comités"
      hasTypeComite={true}
    />
  );
};

export default FormDossiersRenvoyes;
