import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormSCRGProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Formulaire pour SCRG CONSEIL avec détails des dossiers
 * Utilise DetailsActivityForm avec le champ "comite" pour saisir le comité (SCRG)
 */
const FormSCRG: React.FC<FormSCRGProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="scrg"
      icon="📊"
      subtitle="Dossiers CONSEIL en attente avis du SCRG"
      hasTypeComite={false}
    />
  );
};

export default FormSCRG;
