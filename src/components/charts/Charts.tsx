/**
 * Charts - Wrappers Chart.js réutilisables pour DGE Reporting
 * Adapté de ReportingCommercialeV2
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { ReactNode } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const, align: 'end' as const, labels: { boxWidth: 12, padding: 8, font: { size: 11 } } },
  },
};

// === ChartCard ===
interface ChartCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, actions, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-soft p-4 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
        <h3 className="font-semibold text-neutral-800 text-sm sm:text-base">{title}</h3>
        {actions}
      </div>
      <div className="h-[220px] sm:h-[280px] md:h-[300px]">{children}</div>
    </div>
  );
}

// === LineChart ===
interface LineChartProps {
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string; fill?: boolean; tension?: number }[];
  };
  showLegend?: boolean;
}

export function LineChart({ data, showLegend = true }: LineChartProps) {
  return (
    <Line
      data={data}
      options={{
        ...defaultOptions,
        plugins: { ...defaultOptions.plugins, legend: { ...defaultOptions.plugins.legend, display: showLegend } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, maxTicksLimit: 6 } },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 } },
        },
      }}
    />
  );
}

// === BarChart ===
interface BarChartProps {
  data: {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor: string | string[]; borderRadius?: number }[];
  };
  horizontal?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export function BarChart({ data, horizontal = false, showLegend = true, stacked = false }: BarChartProps) {
  return (
    <Bar
      data={data}
      options={{
        ...defaultOptions,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: { ...defaultOptions.plugins, legend: { ...defaultOptions.plugins.legend, display: showLegend } },
        scales: {
          y: { beginAtZero: true, stacked, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, maxTicksLimit: horizontal ? 8 : 6 } },
          x: { stacked, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 } },
        },
      }}
    />
  );
}

// === DoughnutChart ===
interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: { data: number[]; backgroundColor: string[]; borderWidth?: number }[];
  };
  cutout?: string;
}

export function DoughnutChart({ data, cutout = '65%' }: DoughnutChartProps) {
  return (
    <Doughnut
      data={data}
      options={{
        ...defaultOptions,
        cutout,
        plugins: {
          ...defaultOptions.plugins,
          legend: { position: 'right' as const, labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
        },
      }}
    />
  );
}
