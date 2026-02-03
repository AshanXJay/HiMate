import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState(null);

    const confirm = useCallback((message, onConfirm, onCancel) => {
        setModal({ type: 'confirm', message, onConfirm, onCancel });
    }, []);

    const promptInput = useCallback((message, defaultValue, onSubmit, onCancel) => {
        setModal({ type: 'prompt', message, defaultValue: defaultValue || '', onSubmit, onCancel, inputValue: defaultValue || '' });
    }, []);

    const showInfo = useCallback((title, message, onClose) => {
        setModal({ type: 'info', title, message, onClose });
    }, []);

    const close = () => setModal(null);

    const handleConfirm = () => {
        modal?.onConfirm?.();
        close();
    };

    const handleCancel = () => {
        modal?.onCancel?.();
        close();
    };

    const handlePromptSubmit = () => {
        modal?.onSubmit?.(modal.inputValue);
        close();
    };

    const handleInfoClose = () => {
        modal?.onClose?.();
        close();
    };

    return (
        <ModalContext.Provider value={{ confirm, promptInput, showInfo, close }}>
            {children}
            {modal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998
                }} onClick={handleCancel}>
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)', padding: '2rem', maxWidth: '450px', width: '90%'
                        }}
                    >
                        {modal.type === 'info' && modal.title && (
                            <h3 style={{ margin: '0 0 1rem', color: 'var(--color-primary)' }}>{modal.title}</h3>
                        )}
                        <p style={{ color: 'white', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{modal.message}</p>

                        {modal.type === 'prompt' && (
                            <input
                                type="text"
                                className="input-field"
                                value={modal.inputValue}
                                onChange={e => setModal(m => ({ ...m, inputValue: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && handlePromptSubmit()}
                                autoFocus
                                style={{ marginBottom: '1.5rem' }}
                            />
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {modal.type === 'confirm' && (
                                <>
                                    <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
                                </>
                            )}
                            {modal.type === 'prompt' && (
                                <>
                                    <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handlePromptSubmit}>Submit</button>
                                </>
                            )}
                            {modal.type === 'info' && (
                                <button className="btn btn-primary" onClick={handleInfoClose}>OK</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};
