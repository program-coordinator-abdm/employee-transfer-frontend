import React, { useEffect, forwardRef } from "react";
import { CheckCircle, XCircle, AlertCircle, X, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000,
}, ref) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-success text-success-foreground border-success",
    error: "bg-danger text-danger-foreground border-danger",
    warning: "bg-accent text-accent-foreground border-accent",
    info: "bg-primary text-primary-foreground border-primary",
  };

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[100] animate-slide-in-right">
      <div
        className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-floating border ${styles[type]}`}
        role="alert"
        aria-live="polite"
      >
        {icons[type]}
        <p className="font-medium pr-4">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors ml-auto"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

Toast.displayName = "Toast";

export default Toast;

// Toast hook for easier usage
export interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export const useToastState = () => {
  const [toast, setToast] = React.useState<ToastState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return { toast, showToast, hideToast };
};
