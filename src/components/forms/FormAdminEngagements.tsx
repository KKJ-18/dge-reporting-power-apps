import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormAdminEngagementsProps {
  activityName: string;
  typeEngagement: 'amortissable' | 'decouvert' | 'autres_lignes' | 'restructure' | 'leasing' | 'islamique';
  onSave: () => void;
  onCancel: () => void;
}

const FormAdminEngagements: React.FC<FormAdminEngagementsProps> = (props) => {
  const getIcon = () => {
    switch (props.typeEngagement) {
      case 'amortissable': return '💰';
      case 'decouvert': return '📊';
      case 'autres_lignes': return '📈';
      case 'restructure': return '🔄';
      case 'leasing': return '🚗';
      case 'islamique': return '🕌';
      default: return '💼';
    }
  };

  return (
    <DetailsActivityForm
      {...props}
      activityType="admin_engagement"
      icon={getIcon()}
      subtitle="Administration des engagements - Détails des dossiers"
    />
  );
};

export default FormAdminEngagements;
