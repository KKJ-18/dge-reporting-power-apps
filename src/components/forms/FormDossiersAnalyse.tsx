import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormDossiersAnalyseProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormDossiersAnalyse: React.FC<FormDossiersAnalyseProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="analyse"
      icon="🔍"
      subtitle="Dossiers en cours d'analyse"
    />
  );
};

export default FormDossiersAnalyse;
