import React, { ReactNode } from 'react';
import ModalTailwind from './ModalTailwind';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  theme?: string;
  children: ReactNode;
}

const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  title = 'Saisie activité',
  children
}) => {
  return (
    <ModalTailwind
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
    >
      {children}
    </ModalTailwind>
  );
};

export default ActivityFormModal;
