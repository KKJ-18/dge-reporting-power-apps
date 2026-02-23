import { Eye, Edit, Trash2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends { id?: string | number; ID?: number }>({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  emptyMessage = 'Aucune donnée disponible',
}: DataTableProps<T>) {
  const hasActions = onView || onEdit || onDelete;

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                >
                  {col.header}
                </th>
              ))}
              {hasActions && <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.map((item, idx) => (
              <tr key={item.ID ?? item.id ?? idx} className="hover:bg-neutral-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 text-neutral-700 ${col.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  >
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key as string] ?? '')}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {onView && (
                        <button onClick={() => onView(item)} title="Voir" className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Eye size={15} />
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} title="Modifier" className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors">
                          <Edit size={15} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} title="Supprimer" className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
