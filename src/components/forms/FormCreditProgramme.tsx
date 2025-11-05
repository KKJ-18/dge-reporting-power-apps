import React from 'react';
import SimpleActivityForm from './SimpleActivityForm';

interface FormCreditProgrammeProps {
  activityName: string;
  type: 'entreprise' | 'particulier';
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Formulaire pour Crédits Programme (Entreprises ou Particuliers)
 * Champs : Nombre, montant, date de réception
 */
const FormCreditProgramme: React.FC<FormCreditProgrammeProps> = ({ type, ...props }) => {
  return (
    <SimpleActivityForm
      {...props}
      icon={type === 'entreprise' ? '🏢' : '👤'}
      subtitle={`Crédits programme ${type} reçus et traités`}
      nombreLabel="Nombre de crédits programme"
    />
  );
};

export default FormCreditProgramme;
