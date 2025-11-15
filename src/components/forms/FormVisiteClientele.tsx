import React from 'react';
import CloseButton from '../CloseButton';

interface Props { activityName: string; departmentColor?: string; onClose: () => void; onSave: () => void; }
const FormVisiteClientele: React.FC<Props> = ({ activityName, departmentColor = '#990000', onClose }) => (
  <div style={{ position: 'relative', padding: '2rem' }}>
    <CloseButton onClick={onClose} />
    <h2>{activityName}</h2>
    <p>Formulaire en cours de développement - Visite Clientèle</p>
    <button onClick={onClose} style={{ padding: '1rem 2rem', backgroundColor: departmentColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Fermer</button>
  </div>
);
export default FormVisiteClientele;
