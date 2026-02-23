import React from 'react';
import { ActivityItem } from '../config/departmentsData';
import ModalTailwind from './ModalTailwind';

type DepartmentTheme = 'da' | 'dse' | 'dpnp' | 'primary';

interface ActivitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  activities: ActivityItem[];
  onSelect: (activity: ActivityItem) => void;
  theme?: DepartmentTheme;
}

const ActivitySelectionModal: React.FC<ActivitySelectionModalProps> = ({
  isOpen,
  onClose,
  title,
  activities,
  onSelect,
}) => {
  return (
    <ModalTailwind
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <div className="py-4">
        <p className="text-center text-neutral-600 mb-6">
          Sélectionnez une activité pour saisir les données
        </p>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-3 scrollbar-thin">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-50 to-white border-2 border-neutral-200 rounded-xl cursor-pointer group hover:translate-x-2 hover:shadow-lg transition-all duration-300 ease-out"
              style={{ 
                ['--hover-border' as string]: '#CC0000',
              }}
              onClick={() => onSelect(activity)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#CC0000';
                e.currentTarget.style.background = 'rgba(204, 0, 0, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '';
              }}
            >
              <div 
                className="w-11 h-11 rounded-full flex-shrink-0 text-white font-bold flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)' }}
              >
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-neutral-800 transition-colors group-hover:text-red-700">
                  {activity.label}
                </h4>
                {activity.frequency && (
                  <span className="text-sm text-neutral-500 flex items-center gap-1">
                    🕒 {activity.frequency}
                  </span>
                )}
              </div>

              <span className="text-2xl text-red-600 group-hover:text-red-700 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </ModalTailwind>
  );
};

export default ActivitySelectionModal;
