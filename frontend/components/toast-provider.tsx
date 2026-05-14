"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastInput = {
  duration?: number;
  message: string;
  type: ToastType;
};

type ToastMessage = ToastInput & {
  duration: number;
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION = 4500;
const MAX_VISIBLE_TOASTS = 3;

const toastTheme: Record<
  ToastType,
  { background: string; border: string; color: string; icon: typeof Info }
> = {
  success: {
    background: "#f0fdf4",
    border: "#86efac",
    color: "#16a34a",
    icon: CheckCircle2,
  },
  error: {
    background: "#fef2f2",
    border: "#fecaca",
    color: "#dc2626",
    icon: XCircle,
  },
  warning: {
    background: "#fffbeb",
    border: "#fed7aa",
    color: "#d97706",
    icon: AlertTriangle,
  },
  info: {
    background: "#eff6ff",
    border: "#bfdbfe",
    color: "#2563eb",
    icon: Info,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const closeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    setToasts((current) => [
      {
        ...toast,
        duration: toast.duration ?? DEFAULT_DURATION,
        id: Date.now() + Math.random(),
      },
      ...current,
    ].slice(0, MAX_VISIBLE_TOASTS));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={viewportStyle}>
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            onClose={() => closeToast(toast.id)}
            toast={toast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }

  return context;
}

function ToastCard({
  onClose,
  toast,
}: {
  onClose: () => void;
  toast: ToastMessage;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(toast.duration);
  const startedAtRef = useRef(0);
  const [remaining, setRemaining] = useState(toast.duration);
  const theme = toastTheme[toast.type];
  const Icon = theme.icon;

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimers = useCallback(
    (timeLeft: number) => {
      startedAtRef.current = Date.now();
      timeoutRef.current = setTimeout(onClose, timeLeft);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setRemaining(Math.max(remainingRef.current - elapsed, 0));
      }, 80);
    },
    [onClose],
  );

  useEffect(() => {
    clearTimers();
    remainingRef.current = toast.duration;
    startTimers(toast.duration);

    return clearTimers;
  }, [clearTimers, startTimers, toast.duration, toast.id]);

  function handleMouseEnter() {
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    setRemaining(remainingRef.current);
    clearTimers();
  }

  function handleMouseLeave() {
    if (remainingRef.current > 0) {
      startTimers(remainingRef.current);
    }
  }

  const progress = Math.max(remaining / toast.duration, 0);

  return (
    <button
      type="button"
      style={{
        ...toastStyle,
        background: theme.background,
        borderColor: theme.border,
      }}
      onClick={onClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="Clique para fechar"
    >
      <div style={toastContentStyle}>
        <span style={{ ...toastIconStyle, color: theme.color }}>
          <Icon size={19} strokeWidth={2.3} />
        </span>
        <span style={toastMessageStyle}>{toast.message}</span>
      </div>
      <span style={toastTrackStyle}>
        <span
          style={{
            ...toastProgressStyle,
            background: theme.color,
            transform: `scaleX(${progress})`,
          }}
        />
      </span>
    </button>
  );
}

const viewportStyle: CSSProperties = {
  bottom: "24px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  position: "fixed",
  right: "24px",
  width: "min(380px, calc(100vw - 48px))",
  zIndex: 120,
};

const toastStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: "8px",
  boxShadow: "0 18px 48px rgba(15,23,42,0.22)",
  color: "#111827",
  cursor: "pointer",
  overflow: "hidden",
  padding: 0,
  textAlign: "left",
  width: "100%",
};

const toastContentStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: "10px",
  padding: "12px 14px 11px",
};

const toastIconStyle: CSSProperties = {
  alignItems: "center",
  display: "inline-flex",
  flexShrink: 0,
  height: "24px",
  justifyContent: "center",
  width: "24px",
};

const toastMessageStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 800,
  lineHeight: 1.35,
};

const toastTrackStyle: CSSProperties = {
  background: "rgba(15,23,42,0.12)",
  display: "block",
  height: "3px",
  width: "100%",
};

const toastProgressStyle: CSSProperties = {
  display: "block",
  height: "100%",
  transformOrigin: "left center",
  transition: "transform 80ms linear",
  width: "100%",
};
