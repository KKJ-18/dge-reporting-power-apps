import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'yellow' | 'cyan' | 'pink';
  value: string | number;
  label: string;
  trend?: { value: number; isPositive: boolean };
  progress?: number;
  onClick?: () => void;
}

const colorClasses: Record<string, { bg: string; text: string; shadow: string }> = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   shadow: 'hover:shadow-blue-200' },
  green:  { bg: 'bg-green-100',  text: 'text-green-600',  shadow: 'hover:shadow-green-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', shadow: 'hover:shadow-orange-200' },
  red:    { bg: 'bg-red-100',    text: 'text-red-600',    shadow: 'hover:shadow-red-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', shadow: 'hover:shadow-purple-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', shadow: 'hover:shadow-yellow-200' },
  cyan:   { bg: 'bg-cyan-100',   text: 'text-cyan-600',   shadow: 'hover:shadow-cyan-200' },
  pink:   { bg: 'bg-pink-100',   text: 'text-pink-600',   shadow: 'hover:shadow-pink-200' },
};

export default function StatCard({ icon: Icon, iconColor, value, label, trend, progress, onClick }: StatCardProps) {
  const colors = colorClasses[iconColor] || colorClasses.blue;
  return (
    <div
      className={`bg-white rounded-xl shadow-soft p-3 sm:p-4 md:p-6 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 md:gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${colors.shadow} cursor-pointer group`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 block truncate">{value}</span>
        <span className="text-xs sm:text-sm text-neutral-500 truncate block">{label}</span>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium px-2 py-1 rounded-full transition-all duration-300 ${trend.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {trend.isPositive ? '+' : ''}{trend.value}%
        </div>
      )}
      {progress !== undefined && (
        <div className="w-full sm:w-20">
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-primary-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-xs text-neutral-400 mt-1 block text-right">{progress}%</span>
        </div>
      )}
    </div>
  );
}
