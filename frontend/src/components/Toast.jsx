import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
        }
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const colors = {
        success: { bg: 'rgba(74, 222, 128, 0.15)', border: 'var(--color-success)', text: 'var(--color-success)' },
        error: { bg: 'rgba(251, 113, 133, 0.15)', border: 'var(--color-error)', text: 'var(--color-error)' },
        warning: { bg: 'rgba(251, 191, 36, 0.15)', border: 'var(--color-warning)', text: 'var(--color-warning)' },
        info: { bg: 'rgba(255, 102, 0, 0.15)', border: 'var(--color-primary)', text: 'var(--color-primary)' }
    };

    return (
        <ToastContext.Provider value={{ success, error, warning, info, addToast }}>
            {children}
            <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        style={{
                            background: colors[toast.type].bg,
                            border: `1px solid ${colors[toast.type].border}`,
                            color: colors[toast.type].text,
                            padding: '1rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            maxWidth: '400px',
                            animation: 'slideIn 0.3s ease',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
