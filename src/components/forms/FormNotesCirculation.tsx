import React from 'react';
import DetailsActivityForm from './DetailsActivityForm';

interface FormNotesCirculationProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormNotesCirculation: React.FC<FormNotesCirculationProps> = (props) => {
  return (
    <DetailsActivityForm
      {...props}
      activityType="note"
      icon="📝"
      subtitle="Notes de circulation"
    />
  );
};

export default FormNotesCirculation;
