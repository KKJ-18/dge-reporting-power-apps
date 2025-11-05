import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersComitesProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersComites: React.FC<FormDossiersComitesProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="comite"
      icon="👥"
      subtitle="Dossiers présentés aux comités de crédit"
      hasTypeComite={true}
    />
  );
};

export default FormDossiersComites;
