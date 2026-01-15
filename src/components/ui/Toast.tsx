'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Toast types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

// Toast context
interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast container
function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Single toast item
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const config = {
        success: {
            icon: CheckCircle,
            bgClass: 'bg-green-50 border-green-200',
            iconClass: 'text-green-500',
            textClass: 'text-green-800',
        },
        error: {
            icon: AlertCircle,
            bgClass: 'bg-red-50 border-red-200',
            iconClass: 'text-red-500',
            textClass: 'text-red-800',
        },
        warning: {
            icon: AlertTriangle,
            bgClass: 'bg-yellow-50 border-yellow-200',
            iconClass: 'text-yellow-500',
            textClass: 'text-yellow-800',
        },
        info: {
            icon: Info,
            bgClass: 'bg-blue-50 border-blue-200',
            iconClass: 'text-blue-500',
            textClass: 'text-blue-800',
        },
    };

    const { icon: Icon, bgClass, iconClass, textClass } = config[toast.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgClass}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} />
            <p className={`flex-1 text-sm font-medium ${textClass}`}>{toast.message}</p>
            <button
                onClick={onClose}
                className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${textClass}`}
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

// Standalone toast function (for use outside React components)
let toastHandler: ((type: ToastType, message: string, duration?: number) => void) | null = null;

export function setToastHandler(handler: typeof toastHandler) {
    toastHandler = handler;
}

export function toast(type: ToastType, message: string, duration?: number) {
    if (toastHandler) {
        toastHandler(type, message, duration);
    } else {
        console.warn('Toast handler not set. Wrap your app with ToastProvider.');
    }
}

// Convenience methods
toast.success = (message: string, duration?: number) => toast('success', message, duration);
toast.error = (message: string, duration?: number) => toast('error', message, duration);
toast.warning = (message: string, duration?: number) => toast('warning', message, duration);
toast.info = (message: string, duration?: number) => toast('info', message, duration);
