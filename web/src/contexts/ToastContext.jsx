import { createContext, useContext, useState, useCallback } from 'react';
import Icon from '../components/Icon';
import {
  mdiCheckCircleOutline,
  mdiAlertCircleOutline,
  mdiInformationOutline,
  mdiClose,
} from '@mdi/js';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = `${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => {
          const iconPath =
            toast.type === 'error'
              ? mdiAlertCircleOutline
              : toast.type === 'info'
                ? mdiInformationOutline
                : mdiCheckCircleOutline;
          return (
            <div key={toast.id} className={`toast-item toast-${toast.type}`}>
              <Icon path={iconPath} size={0.9} color="#FFFFFF" />
              <span className="toast-msg">{toast.message}</span>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(toast.id)}
              >
                <Icon path={mdiClose} size={0.7} color="#FFFFFF" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
