import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showBase = useCallback((message, type = 'info', options = {}) => {
    const id = nextId++;
    const duration = options.duration ?? 4000;
    setToasts((prev) => [
      ...prev,
      { id, message, type }
    ]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, [remove]);

  const contextValue = useMemo(() => ({
    show: (message, options) => showBase(message, 'info', options),
    success: (message, options) => showBase(message, 'success', options),
    error: (message, options) => showBase(message, 'error', options),
    warning: (message, options) => showBase(message, 'warning', options),
    info: (message, options) => showBase(message, 'info', options),
    dismiss: remove,
  }), [remove, showBase]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'min-w-[280px] max-w-sm rounded-xl shadow-xl border',
              'bg-white text-black',
              'px-4 py-3',
              'flex items-start gap-3',
              'transition-all duration-200 ease-out',
              // left accent by type
              t.type === 'success' ? 'border-l-4 border-l-green-500' :
              t.type === 'error' ? 'border-l-4 border-l-red-500' :
              t.type === 'warning' ? 'border-l-4 border-l-yellow-500' :
              'border-l-4 border-l-blue-500',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            <div className={[
              'mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full',
              t.type === 'success' ? 'bg-green-100' :
              t.type === 'error' ? 'bg-red-100' :
              t.type === 'warning' ? 'bg-yellow-100' :
              'bg-blue-100',
            ].join(' ')}>
              <span className={[
                'text-base',
                t.type === 'success' ? 'text-green-600' :
                t.type === 'error' ? 'text-red-600' :
                t.type === 'warning' ? 'text-yellow-600' :
                'text-blue-600',
              ].join(' ')}>
                {t.type === 'success' ? '✓' : t.type === 'error' ? '!' : t.type === 'warning' ? '⚠' : 'ℹ'}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-semibold leading-5">
                {t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : t.type === 'warning' ? 'Warning' : 'Info'}
              </div>
              <div className="text-sm leading-5 text-black/80">{t.message}</div>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="shrink-0 text-black/60 hover:text-black rounded-md px-2"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}


