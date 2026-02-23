import React from 'react';
import { DepartmentData, CategoryData } from '../config/departmentsData';

type DepartmentTheme = 'da' | 'dse' | 'dpnp' | 'primary';

interface DepartmentCategoriesSectionProps {
  department: DepartmentData;
  theme?: DepartmentTheme;
  onCategoryClick: (category: CategoryData) => void;
  ctaLabel?: string;
}

const DepartmentCategoriesSection: React.FC<DepartmentCategoriesSectionProps> = ({
  department,
  onCategoryClick,
  ctaLabel = 'Voir les activités'
}) => {
  return (
    <>
      <div className="bg-white rounded-2xl p-5 lg:p-6 shadow-md flex flex-wrap items-center gap-4 lg:gap-6"
        style={{ borderLeft: '4px solid #CC0000' }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(204, 0, 0, 0.06)' }}
          >
            <span className="text-3xl lg:text-4xl">{department.icon}</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-neutral-800 mb-1 truncate">
              {department.fullName}
            </h1>
            <p className="text-neutral-500 text-sm lg:text-base">
              {department.categories.length} catégories •{' '}
              {department.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {department.categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-5 cursor-pointer shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
            style={{ borderTop: '4px solid #CC0000' }}
            onClick={() => onCategoryClick(category)}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{category.icon}</span>
              <h3 className="text-lg font-semibold text-neutral-800 flex-1 leading-tight">
                {category.name}
              </h3>
            </div>

            <div className="py-4 border-y border-neutral-100">
              <div className="text-center">
                <span className="text-3xl font-bold" style={{ color: '#CC0000' }}>
                  {category.activities.length}
                </span>
                <span className="block text-sm text-neutral-500 font-medium mt-1">Activités</span>
              </div>
            </div>

            <button 
              className="w-full py-3 px-4 rounded-lg text-white font-semibold hover:opacity-90 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)' }}
            >
              <span>📝</span>
              <span>{ctaLabel}</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default DepartmentCategoriesSection;
