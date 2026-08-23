import { X } from "lucide-react";

export default function Modal({
  onClose,
  disableClose = false,
  icon: Icon,
  title,
  subtitle,
  maxWidth = "max-w-lg",
  maxHeight = "max-h-[90vh]",
  backdropOpacity = "bg-black/50",
  cardClassName = "",
  children,
}) {
  const close = () => !disableClose && onClose?.();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 ${backdropOpacity} backdrop-blur-sm animate-fadeIn`}
        onClick={close}
      />

      <div
        className={`relative w-full ${maxWidth} ${maxHeight} overflow-y-auto glass-card rounded-3xl shadow-2xl p-6 sm:p-7 animate-scaleIn ${cardClassName}`}
      >
        {(Icon || title) && (
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                {title && (
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white font-display">{title}</h2>
                )}
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={close}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
