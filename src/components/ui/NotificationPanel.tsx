/**
 * NotificationPanel - Panneau de notifications dans le header
 * Affiche les alertes dynamiques calculées par useNotifications
 */
import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, X, RefreshCw } from 'lucide-react';
import type { AppNotification } from '../../hooks/useNotifications';

interface NotificationPanelProps {
  notifications: AppNotification[];
  unreadCount: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

const typeConfig = {
  high: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  medium: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  low: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export function NotificationPanel({ notifications, unreadCount, onRefresh, isLoading }: NotificationPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/20 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-neutral-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-bounce-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-strong border border-gray-100 overflow-hidden animate-scale-in" style={{ zIndex: 9999 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={onRefresh}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Rafraîchir"
              >
                <RefreshCw size={14} className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Fermer"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucune notification
              </div>
            ) : (
              notifications.map(notif => {
                const config = typeConfig[notif.type];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg ${config.bg} ${config.border} border`}>
                      <Icon size={14} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
