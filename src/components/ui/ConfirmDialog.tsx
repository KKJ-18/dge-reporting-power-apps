import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const dialogConfig = {
  success: { icon: CheckCircle, iconClass: 'bg-green-100 text-green-600', buttonClass: 'bg-green-600 hover:bg-green-700', ringClass: 'ring-green-500/30' },
  error:   { icon: XCircle,     iconClass: 'bg-red-100 text-red-600',     buttonClass: 'bg-red-600 hover:bg-red-700',     ringClass: 'ring-red-500/30' },
  warning: { icon: AlertTriangle, iconClass: 'bg-orange-100 text-orange-600', buttonClass: 'bg-orange-600 hover:bg-orange-700', ringClass: 'ring-orange-500/30' },
  info:    { icon: Info,         iconClass: 'bg-blue-100 text-blue-600',   buttonClass: 'bg-blue-600 hover:bg-blue-700',   ringClass: 'ring-blue-500/30' },
  confirm: { icon: AlertTriangle, iconClass: 'bg-primary-100 text-primary-600', buttonClass: 'bg-primary-600 hover:bg-primary-700', ringClass: 'ring-primary-500/30' },
};

export default function ConfirmDialog({ isOpen, onClose, onConfirm, type, title, message, confirmText = 'Confirmer', cancelText = 'Annuler' }: ConfirmDialogProps) {
  if (!isOpen) return null;
  const config = dialogConfig[type];
  const Icon = config.icon;
  const showCancel = type === 'confirm' || type === 'warning';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-modal animate-scale-in mx-4">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all duration-200 hover:scale-110">
          <X size={16} />
        </button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${config.iconClass} flex items-center justify-center ring-8 ${config.ringClass} animate-scale-in`}>
            <Icon size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-3">{title}</h3>
          <p className="text-neutral-600 text-sm leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3 justify-center">
            {showCancel && (
              <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
                {cancelText}
              </button>
            )}
            <button onClick={() => { onConfirm?.(); onClose(); }} className={`px-6 py-2.5 rounded-xl text-white font-medium transition-colors ${config.buttonClass}`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
